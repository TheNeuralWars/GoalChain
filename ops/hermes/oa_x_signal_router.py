#!/usr/bin/env python3
"""
Hermes X Signal Router — routes signals from oa_x_signals.py to downstream agents.

Reads ~/.hermes/oa/state/x-signals-<today>.json and routes each signal by action_tag:
  discord-research  → write to ops/hermes/oa-discord-research-publisher.py input queue
  ai-radar          → append entry to ~/.hermes/workspace/docs/ai-radar-<UTC>.md
  social-alert      → write to ~/.hermes/oa/state/social-alerts.json for social agent

Safe by design: if routing fails, logs warning and exits 0 — never blocks monitoring.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
# State dir: use HOME/.hermes/oa/state (matches oa-x-repost-monitor.py default)
# HERMES_HOME env may point to a profile dir — fall back to ~/.hermes for state
_HERMES_ENV = os.getenv("HERMES_HOME", "")
if _HERMES_ENV:
    _resolved = Path(_HERMES_ENV)
    if _resolved.name != ".hermes" and ".hermes" in str(_resolved):
        HERMES_HOME = HOME / ".hermes"
    else:
        HERMES_HOME = _resolved
else:
    HERMES_HOME = HOME / ".hermes"
SIGNALS_DIR = HERMES_HOME / "oa" / "state"
# Discord publisher lives in the repo's ops/hermes/ dir
_REPO_ROOT = Path(os.getenv(
    "GOALCHAIN_REPO",
    "/data/apps/GoalChain" if Path("/data/apps/GoalChain").exists() else str(HOME / "data" / "apps" / "GoalChain"),
))
DISCORD_PUBLISHER = _REPO_ROOT / "ops" / "hermes" / "oa-discord-research-publisher.py"
SOCIAL_ALERTS = SIGNALS_DIR / "social-alerts.json"
AI_RADAR_DIR = HOME / ".hermes" / "workspace" / "docs"


def _latest_signals_file() -> Path | None:
    """Find the most recent x-signals-YYYY-MM-DD.json file."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_file = SIGNALS_DIR / f"x-signals-{today}.json"
    if today_file.exists():
        return today_file
    # Fall back to most recent any day
    candidates = sorted(SIGNALS_DIR.glob("x-signals-*.json"), reverse=True)
    return candidates[0] if candidates else None


def load_signals(path: Path) -> list[dict]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []


def route_discord(signals: list[dict]) -> int:
    """Route discord-research signals via oa-discord-research-publisher.py."""
    targets = [s for s in signals if "discord-research" in s.get("action_tags", [])]
    if not targets:
        return 0

    if not DISCORD_PUBLISHER.exists():
        print(f"WARN: Discord publisher not found at {DISCORD_PUBLISHER}")
        return 0

    # Write input queue for the publisher
    queue_file = SIGNALS_DIR / "discord-research-queue.json"
    queue_file.parent.mkdir(parents=True, exist_ok=True)
    queue_file.write_text(
        json.dumps(targets, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Discord queue: {len(targets)} items written to {queue_file}")

    # Attempt to invoke publisher (best-effort)
    try:
        result = subprocess.run(
            [sys.executable, str(DISCORD_PUBLISHER), "--queue", str(queue_file)],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode == 0:
            print("Discord routing: SUCCESS")
            queue_file.unlink(missing_ok=True)
        else:
            print(f"WARN: Discord routing returned {result.returncode}: {result.stderr[:200]}")
    except subprocess.TimeoutExpired:
        print("WARN: Discord routing timed out — will retry next run")
    except Exception as e:
        print(f"WARN: Discord routing error: {e}")

    return len(targets)


def route_ai_radar(signals: list[dict]) -> int:
    """Append ai-radar signals to the AI radar daily doc."""
    targets = [s for s in signals if "ai-radar" in s.get("action_tags", [])]
    if not targets:
        return 0

    AI_RADAR_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    doc_path = AI_RADAR_DIR / f"ai-radar-{ts}.md"

    lines = [
        f"# AI Radar — X Signal Feed",
        f"Generated: {ts} UTC",
        f"Source: @goalworldsol + @goalworlddotfun reposts",
        "",
    ]

    for s in targets:
        sig_type = s.get("type", "unknown")
        username = s.get("username", "unknown")
        text = s.get("text", "")[:300]
        url = s.get("url", "")
        conf = s.get("confidence", 0)
        rts = s.get("rt_count", 0)
        likes = s.get("like_count", 0)
        sig_ts = s.get("ts", "")

        lines.extend([
            f"## [{sig_type.upper()}] @{username} — conf={conf:.0%}",
            f"- Posted: {sig_ts}",
            f"- RTs: {rts} | Likes: {likes}",
            f"- [Link]({url})",
            f"",
            f"```",
            f"{text}",
            f"```",
            "",
        ])

    doc_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"AI Radar: {len(targets)} signals written to {doc_path}")
    return len(targets)


def route_social_alerts(signals: list[dict]) -> int:
    """Append social-alert signals to the social agent alert queue."""
    targets = [s for s in signals if "social-alert" in s.get("action_tags", [])]
    if not targets:
        return 0

    SOCIAL_ALERTS.parent.mkdir(parents=True, exist_ok=True)

    existing: list[dict] = []
    if SOCIAL_ALERTS.exists():
        try:
            existing = json.loads(SOCIAL_ALERTS.read_text(encoding="utf-8"))
        except Exception:
            existing = []

    existing_ids = {a["id"] for a in existing}
    for s in targets:
        if s["id"] not in existing_ids:
            existing.append(s)
            existing_ids.add(s["id"])

    SOCIAL_ALERTS.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Social Alerts: {len(targets)} added → {SOCIAL_ALERTS}")
    return len(targets)


def main() -> int:
    signals_file = _latest_signals_file()
    if not signals_file:
        print("No x-signals-*.json found — nothing to route")
        return 0

    signals = load_signals(signals_file)
    if not signals:
        print("Signal file is empty — nothing to route")
        return 0

    print(f"Routing {len(signals)} signals from {signals_file.name}")

    total = 0
    total += route_discord(signals)
    total += route_ai_radar(signals)
    total += route_social_alerts(signals)

    print(f"Router complete — {total} routing actions taken")
    return 0


if __name__ == "__main__":
    sys.exit(main())