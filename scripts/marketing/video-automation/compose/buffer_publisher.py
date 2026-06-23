"""Buffer REST client for video posting.

Single endpoint: POST https://api.bufferapp.com/1/updates/create.json
Docs: https://buffer.com/developers/api/updates

We build a single update per channel because Buffer profiles are isolated.
Auth: HTTP Basic "1|<access_token>:<secret>"; for personal/social token
accounts the secret is empty, so we pass "1|<token>:" per Buffer spec.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Optional


BUFFER_API = "https://api.bufferapp.com/1/updates/create.json"


@dataclass
class BufferResult:
    channel: str
    profile_id: str
    update_id: Optional[str]
    status_code: int
    payload: Any
    dry_run: bool


def _basic_auth_header(token: str) -> str:
    """RFC7617 Basic auth: '1|<token>:<secret>': base64."""
    import base64

    cred = f"1|{token}:".encode("utf-8")
    return "Basic " + base64.b64encode(cred).decode("ascii")


def submit_video(
    token: str,
    profile_id: str,
    channel: str,
    video_url: str,
    text: str,
    *,
    dry_run: bool = False,
    shorten: bool = False,
    now: bool = True,
    timeout: float = 15.0,
) -> BufferResult:
    """POST a video update to Buffer for a single profile.

    `channel` is local-only ("youtube" | "x" | "tiktok") for tagging
    audit trail; Buffer only sees the profile_id.
    """
    payload = {
        "text": text,
        "profile_ids[]": profile_id,
        "media[link]": video_url,
        "media[description]": text,
        "now": "true" if now else "false",
        "shorten": "true" if shorten else "false",
    }
    if dry_run or not token:
        return BufferResult(
            channel=channel,
            profile_id=profile_id,
            update_id=None,
            status_code=0 if dry_run else 401,
            payload={"dry_run": True, "would_post": payload},
            dry_run=True,
        )

    body = urllib.parse.urlencode({k: v for k, v in payload.items()}).encode("utf-8")
    req = urllib.request.Request(
        BUFFER_API,
        data=body,
        headers={
            "Authorization": _basic_auth_header(token),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read()
            status = r.status
        data = json.loads(raw.decode("utf-8"))
        update_id = str(data.get("updates", [{}])[0].get("id")) if isinstance(data, dict) else None
        return BufferResult(
            channel=channel,
            profile_id=profile_id,
            update_id=update_id,
            status_code=status,
            payload=data,
            dry_run=False,
        )
    except urllib.error.HTTPError as e:
        return BufferResult(
            channel=channel,
            profile_id=profile_id,
            update_id=None,
            status_code=e.code,
            payload={"error": e.read().decode("utf-8", errors="ignore")},
            dry_run=False,
        )
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        return BufferResult(
            channel=channel,
            profile_id=profile_id,
            update_id=None,
            status_code=0,
            payload={"error": repr(e)},
            dry_run=False,
        )


def submit_all(
    token: str | None,
    channels: list[tuple[str, str]],
    video_url: str,
    text: str,
    *,
    dry_run: bool,
) -> list[BufferResult]:
    """Fan out one BufferResult per configured channel. Empty list if no token."""
    if not channels:
        return []
    results: list[BufferResult] = []
    for channel, pid in channels:
        results.append(
            submit_video(
                token=token or "",
                profile_id=pid,
                channel=channel,
                video_url=video_url,
                text=text,
                dry_run=dry_run or not token,
            )
        )
    return results
