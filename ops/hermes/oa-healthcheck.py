#!/usr/bin/env python3
"""OA healthcheck: detect stale publishing and alert Discord."""

from __future__ import annotations

import json
import os
import pathlib
import time

import requests

try:
    from discord_i18n import t as discord_t
except ImportError:  # pragma: no cover
    def discord_t(key: str, **kwargs: str) -> str:
        return key


def getenv(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def now_ts() -> int:
    return int(time.time())


def newest_report_ts() -> int:
    home = pathlib.Path.home()
    repo = pathlib.Path(getenv("GOALCHAIN_REPO_PATH", str(home / "hermes/workspace/GoalChain")))
    patterns = [
        home / ".openclaw/workspace/docs",
        repo / "docs/intake",
    ]
    latest = 0
    for base in patterns:
        if not base.exists():
            continue
        for p in base.glob("**/*"):
            if not p.is_file():
                continue
            name = p.name
            if name.startswith("ai-radar-") and name.endswith(".md"):
                latest = max(latest, int(p.stat().st_mtime))
            if "ai-ecosystem-opportunities" in name and name.endswith(".md"):
                latest = max(latest, int(p.stat().st_mtime))
    return latest


def newest_published_ts(state_file: pathlib.Path) -> int:
    if not state_file.exists():
        return 0
    try:
        data = json.loads(state_file.read_text(encoding="utf-8"))
    except Exception:
        return 0
    if not isinstance(data, dict) or not data:
        return 0
    return int(max(float(v) for v in data.values()))


def post_alert(msg: str) -> tuple[bool, str]:
    webhook = getenv("DISCORD_RESEARCH_WEBHOOK_URL")
    token = getenv("DISCORD_TOKEN")
    channel = getenv("DISCORD_RESEARCH_CHANNEL_ID")
    if webhook:
        url = webhook
        headers = {"Content-Type": "application/json", "User-Agent": "GoalChainOA/1.0"}
        payload = {"content": msg}
    elif token and channel:
        url = f"https://discord.com/api/v10/channels/{channel}/messages"
        headers = {
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json",
            "User-Agent": "GoalChainOA/1.0",
        }
        payload = {"content": msg}
    else:
        return False, "missing_credentials"

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=20)
        if resp.status_code in (200, 201, 204):
            return True, "ok"
        return False, f"http_{resp.status_code}"
    except Exception as exc:  # noqa: BLE001
        return False, f"error:{exc}"


def main() -> int:
    state_file = pathlib.Path(getenv("OA_RESEARCH_STATE_FILE", "~/hermes/oa/state/research-discord-posted.json")).expanduser()
    alert_file = pathlib.Path(getenv("OA_HEALTH_ALERT_STATE", "~/hermes/oa/state/health-alert-state.json")).expanduser()
    threshold = int(getenv("OA_HEALTH_STALE_SECONDS", "5400"))

    latest_report = newest_report_ts()
    latest_posted = newest_published_ts(state_file)

    if latest_report == 0 or latest_report <= latest_posted:
        return 0

    lag = now_ts() - latest_posted
    if lag < threshold:
        return 0

    last_alert = 0
    if alert_file.exists():
        try:
            payload = json.loads(alert_file.read_text(encoding="utf-8"))
            last_alert = int(payload.get("last_alert", 0))
        except Exception:
            last_alert = 0
    if now_ts() - last_alert < 1800:
        return 0

    msg = (
        f"🚨 **{discord_t('health_stale_title')}**\n"
        f"{discord_t('health_pending_line')}\n"
        f"{discord_t('health_lag_line', minutes=str(lag // 60))}\n"
        f"{discord_t('health_stale_body')}"
    )
    ok, reason = post_alert(msg)
    if not ok:
        print(f"healthcheck_alert_failed:{reason}")
        return 1

    alert_file.parent.mkdir(parents=True, exist_ok=True)
    alert_file.write_text(json.dumps({"last_alert": now_ts()}) + "\n", encoding="utf-8")
    print("healthcheck_alert_sent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
