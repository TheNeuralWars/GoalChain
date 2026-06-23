#!/usr/bin/env python3
"""Video 9:16 composition orchestrator for issue #831.

Bridge between Oracle event payload, Grok narrative, Kokoro TTS, Hyperframes
visual render, and Buffer multi-channel dispatcher. Flags default OFF per
AGENT_ORCHESTRATION.md PR #33 directive.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from typing import Optional


def _project_dir() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.abspath(os.path.join(here, ".."))


def _aspect_dir(aspect: str) -> str:
    return os.path.join(_project_dir(), f"index_{aspect}")


def _hyperframes_pkg(aspect: str) -> str:
    """Same package.json layout; called from the project dir which depends on
    which index.*.html files are present. Single-physics approach.
    """
    return os.path.join(_project_dir(), "package.json")


def _ffprobe_dims(path: str) -> tuple[int, int]:
    """Return (width, height) or -1 on missing ffprobe."""
    try:
        out = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height",
                "-of",
                "json",
                path,
            ],
            stderr=subprocess.STDOUT,
            timeout=15,
        )
        data = json.loads(out)
        s = data["streams"][0]
        return int(s["width"]), int(s["height"])
    except Exception:
        return -1, -1


def _resolve_video(aspect: str) -> str:
    """Pick the right source HTML for the aspect."""
    base = _project_dir()
    if aspect == "9x16":
        return os.path.join(base, "index_916.html")
    return os.path.join(base, "index.html")


def _render(
    *,
    teamA: str,
    teamB: str,
    scoreA: str,
    scoreB: str,
    eventText: str,
    yieldChange: str,
    narrative: str,
    output: str,
    aspect: str,
    voice: str,
    dry_run: bool,
) -> str:
    """Re-use the existing post_produce_reel.py orchestration. We do not fork
    it; we call it as a subroutine so behavior stays in one place."""
    cmd = [
        sys.executable,
        os.path.join(_project_dir(), "..", "..", "post_produce_reel.py"),
        "--teamA",
        teamA,
        "--teamB",
        teamB,
        "--scoreA",
        scoreA,
        "--scoreB",
        scoreB,
        "--eventText",
        eventText,
        "--yieldChange",
        yieldChange,
        "-v",
        voice,
        "-o",
        output,
        "--aspect",
        aspect,
        "--text",
        narrative,
    ]
    if dry_run:
        cmd.append("--dry-run")
    subprocess.run(cmd, check=True)
    return output


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Compose 9:16 GoalChain oracle video.")
    p.add_argument("--teamA", required=True)
    p.add_argument("--teamB", required=True)
    p.add_argument("--scoreA", required=True)
    p.add_argument("--scoreB", required=True)
    p.add_argument("--eventText", required=True)
    p.add_argument("--yieldChange", default="")
    p.add_argument("--aspect", choices=["9x16", "1x1"], default="9x16")
    p.add_argument("-v", "--voice", default="ef_dora")
    p.add_argument("-o", "--output", default="")
    p.add_argument("--narrative-source", choices=["auto", "grok", "hardcoded"], default="auto")
    p.add_argument("--publish", choices=["auto", "off", "on"], default="auto")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args(argv)

    # Run-as-script: prepend the compose dir to sys.path.
    sys.path.insert(0, _project_dir())
    try:
        from english_check import assert_english, EnglishMaxViolation  # type: ignore
    except ImportError:
        # Package-mode fallback (preferred when invoked as a module).
        from .english_check import assert_english, EnglishMaxViolation  # type: ignore
    try:
        from grok_narrative import safe  # type: ignore
    except ImportError:
        from .grok_narrative import safe  # type: ignore
    try:
        from buffer_config import load  # type: ignore
    except ImportError:
        from .buffer_config import load  # type: ignore

    event = {
        "teamA": args.teamA,
        "teamB": args.teamB,
        "scoreA": args.scoreA,
        "scoreB": args.scoreB,
        "eventText": args.eventText,
        "yieldChange": args.yieldChange,
    }
    narrative = safe(event)
    try:
        assert_english(narrative, what="narrative")
    except Exception:
        narrative = safe(event)

    output = args.output or os.path.join(
        _project_dir(),
        "assets",
        f"reel_{args.aspect.replace('x', '_')}.mp4",
    )

    cfg = load()
    publish_on = cfg.publish_enabled if args.publish == "auto" else (args.publish == "on")

    if not publish_on or not cfg.access_token:
        # Default-OFF safety: still render locally.
        _render(
            teamA=args.teamA,
            teamB=args.teamB,
            scoreA=args.scoreA,
            scoreB=args.scoreB,
            eventText=args.eventText,
            yieldChange=args.yieldChange,
            narrative=narrative,
            output=output,
            aspect=args.aspect,
            voice=args.voice,
            dry_run=args.dry_run,
        )
        print(f"[compose_916] dry-run only (publish disabled: token={'yes' if cfg.access_token else 'no'} flag={'on' if cfg.publish_enabled else 'off'})")
        return 0

    # Live publish path.
    _render(
        teamA=args.teamA,
        teamB=args.teamB,
        scoreA=args.scoreA,
        scoreB=args.scoreB,
        eventText=args.eventText,
        yieldChange=args.yieldChange,
        narrative=narrative,
        output=output,
        aspect=args.aspect,
        voice=args.voice,
        dry_run=False,
    )

    try:
        from buffer_publisher import submit_all  # type: ignore
    except ImportError:
        from .buffer_publisher import submit_all  # type: ignore

    channels = []
    if cfg.youtube_id:
        channels.append(("youtube", cfg.youtube_id))
    if cfg.x_id:
        channels.append(("x", cfg.x_id))
    if cfg.tiktok_id:
        channels.append(("tiktok", cfg.tiktok_id))

    caption = (
        f"GoalChain oracle: {args.teamA} vs {args.teamB} "
        f"({args.scoreA}-{args.scoreB}). {args.eventText}. "
        "#GoalChain #Solana"
    )
    assert_english(caption, what="caption")
    # Buffer /updates/create requires `media[link]` to be a publicly reachable
    # URL. The rendered MP4 sits on the VPS filesystem; we expose it via the
    # `video_url` arg only when the operator provides one (e.g. a CDN URL
    # returned by an upload step). Otherwise we treat this run as dry-run.
    video_url = os.environ.get("ORACLE_VIDEO_PUBLIC_URL", "")
    if video_url and video_url.startswith(("http://", "https://")):
        results = submit_all(
            cfg.access_token or "", channels, video_url, caption, dry_run=False,
        )
    else:
        print(
            "[compose_916] ORACLE_VIDEO_PUBLIC_URL is unset or not http(s); "
            "Buffer publish is gated to dry-run."
        )
        results = submit_all(
            cfg.access_token or "", channels, "", caption, dry_run=True,
        )
    for r in results:
        print("[buffer]", r.channel, r.status_code, r.update_id, r.dry_run)
    return 0


if __name__ == "__main__":
    sys.exit(main())
