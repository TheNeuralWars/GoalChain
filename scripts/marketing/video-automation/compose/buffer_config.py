"""Buffer channel config loader.

Reads:
- BUFFER_ACCESS_TOKEN          (Issue #831)
- BUFFER_YT_PROFILE_ID         (YouTube Shorts profile)
- BUFFER_X_PROFILE_ID          (X / Twitter profile)
- BUFFER_TIKTOK_PROFILE_ID     (TikTok profile)
- ORACLE_VIDEO_BUFFER_PUBLISH  ("1" / "true" enables real publish; else dry-run)
"""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class BufferConfig:
    access_token: str | None
    youtube_id: str | None
    x_id: str | None
    tiktok_id: str | None
    publish_enabled: bool


def load() -> BufferConfig:
    token = os.environ.get("BUFFER_ACCESS_TOKEN") or None
    return BufferConfig(
        access_token=token,
        youtube_id=os.environ.get("BUFFER_YT_PROFILE_ID") or None,
        x_id=os.environ.get("BUFFER_X_PROFILE_ID") or None,
        tiktok_id=os.environ.get("BUFFER_TIKTOK_PROFILE_ID") or None,
        publish_enabled=os.environ.get("ORACLE_VIDEO_BUFFER_PUBLISH", "")
        .strip()
        .lower()
        in {"1", "true", "yes", "on"},
    )


def enabled_profile_ids(cfg: BufferConfig) -> list[str]:
    """Return list of configured Buffer profile IDs for this run."""
    ids = []
    if cfg.youtube_id:
        ids.append(("youtube", cfg.youtube_id))
    if cfg.x_id:
        ids.append(("x", cfg.x_id))
    if cfg.tiktok_id:
        ids.append(("tiktok", cfg.tiktok_id))
    return ids
