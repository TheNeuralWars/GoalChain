"""Mattermost integration helper for GoalChain multiagent.

Supports two delivery modes:
  1. Incoming Webhook — GOALCHAIN_MA_MATTERMOST_WEBHOOK (fixed channel)
  2. Bot Token API   — GOALCHAIN_MA_MATTERMOST_BOT_TOKEN (requires channel_id)
"""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

from goalchain_multiagent.config import Settings, get_settings

logger = logging.getLogger(__name__)

# Channel routing map (Note: Mattermost requires the channel ID, but we can resolve by name or use config)
AGENT_CHANNEL_DEFAULT: dict[str, str] = {
    "ceo": "goalchain-ops",
    "dev": "goalchain-dev",
    "growth": "goalchain-growth",
    "ops": "goalchain-ops",
    "alerts": "goalchain-alerts",
}


def _http_post(url: str, payload: dict, headers: dict | None = None, timeout: int = 10) -> tuple[int, str]:
    """POST JSON payload; return (status_code, body)."""
    h = {"Content-Type": "application/json", **(headers or {})}
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8") if exc.fp else ""
        return exc.code, body
    except Exception as exc:
        logger.exception("HTTP POST to Mattermost failed: %s", exc)
        return -1, str(exc)


def _send_via_webhook(text: str, webhook_url: str) -> bool:
    payload = {"text": text}
    status, body = _http_post(webhook_url, payload)
    if status == 200:
        logger.info("Mattermost webhook delivered OK.")
        return True
    logger.warning("Mattermost webhook returned %d: %s", status, body[:200])
    return False


def _send_via_bot_token(
    text: str,
    channel_id: str,
    server_url: str,
    bot_token: str,
) -> bool:
    """Post to a channel using bot token (API v4)."""
    url = f"{server_url.rstrip('/')}/api/v4/posts"
    payload = {
        "channel_id": channel_id,
        "message": text,
    }
    status, body = _http_post(
        url,
        payload,
        headers={"Authorization": f"Bearer {bot_token}"},
    )
    try:
        resp = json.loads(body)
        if "id" in resp:
            logger.info("Mattermost Bot token post delivered OK.")
            return True
        logger.warning("Mattermost Bot token delivery failed: %s", body[:200])
        return False
    except json.JSONDecodeError:
        logger.warning("Mattermost Bot token: unparseable response %d: %s", status, body[:100])
        return False


def send_mattermost_message(
    text: str,
    channel_id: str | None = None,
    settings: Settings | None = None,
) -> bool:
    """Send a message to Mattermost.

    Routing priority:
      1. If ``channel_id`` is set + bot_token + server_url available → Bot API
      2. Fallback → Incoming webhook
    """
    s = settings or get_settings()
    bot_token = s.goalchain_ma_mattermost_bot_token.strip()
    server_url = s.goalchain_ma_mattermost_url.strip()
    webhook_url = s.goalchain_ma_mattermost_webhook.strip()

    if bot_token and server_url and channel_id:
        ok = _send_via_bot_token(text, channel_id, server_url, bot_token)
        if ok:
            return True
        logger.info("Bot token failed for channel %s; falling back to webhook.", channel_id)

    if webhook_url:
        return _send_via_webhook(text, webhook_url)

    logger.warning("No Mattermost delivery method available.")
    return False


def notify_agent_step_mattermost(
    agent_name: str,
    objective: str,
    content: str,
    meta: dict[str, Any] | None = None,
    channel_id: str | None = None,
    settings: Settings | None = None,
) -> bool:
    """Send an elegant notification to Mattermost for an agent action."""
    emoji_map = {
        "ceo": "👑 **CEO**",
        "dev": "💻 **DEV**",
        "growth": "📈 **GROWTH**",
        "ops": "⚙️ **OPS**",
    }
    agent_header = emoji_map.get(agent_name.lower(), f"🤖 **{agent_name.upper()}**")
    
    msg = f"### {agent_header} ejecutó acción sobre:\n> _{objective}_\n\n**Acción/Mensaje:**\n{content}"
    
    if meta:
        msg += "\n\n**Metadata:**\n"
        for k, v in meta.items():
            if v:
                msg += f"- **{k}:** {v}\n"

    return send_mattermost_message(
        text=msg,
        channel_id=channel_id,
        settings=settings,
    )


def send_alert_mattermost(
    title: str,
    message: str,
    severity: str = "warning",
    channel_id: str | None = None,
    settings: Settings | None = None,
) -> bool:
    """Send a structured alert to Mattermost."""
    emoji = {"info": "ℹ️", "warning": "⚠️", "error": "🔴"}.get(severity, "⚠️")
    msg = f"## {emoji} {title}\n{message}"
    return send_mattermost_message(
        text=msg,
        channel_id=channel_id,
        settings=settings,
    )
