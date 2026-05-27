"""Slack integration helper for GoalChain multiagent.

Supports two delivery modes (auto-selected by availability):
  1. **Incoming Webhook** — `GOALCHAIN_MA_SLACK_WEBHOOK` (always works, fixed channel)
  2. **Bot Token API**   — `GOALCHAIN_MA_SLACK_BOT_TOKEN` (any channel, requires scopes)

Channel routing (per-agent):
  - CEO / summary  → #goalchain-ops
  - DEV / github   → #goalchain-dev
  - GROWTH / crm   → #goalchain-growth
  - OPS / monitor  → #goalchain-ops
  - Alerts/errors  → #goalchain-alerts
  - Fallback       → #general-goalchain  (webhook)
"""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

from goalchain_multiagent.config import Settings, get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Channel routing map
# ---------------------------------------------------------------------------
AGENT_CHANNEL: dict[str, str] = {
    "ceo": "goalchain-ops",
    "dev": "goalchain-dev",
    "growth": "goalchain-growth",
    "ops": "goalchain-ops",
    "alerts": "goalchain-alerts",
}


# ---------------------------------------------------------------------------
# Low-level HTTP POST
# ---------------------------------------------------------------------------

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
        logger.exception("HTTP POST failed: %s", exc)
        return -1, str(exc)


# ---------------------------------------------------------------------------
# Webhook delivery (fixed channel, always available)
# ---------------------------------------------------------------------------

def _send_via_webhook(
    text: str,
    blocks: list[dict] | None,
    webhook_url: str,
) -> bool:
    payload: dict[str, Any] = {"text": text}
    if blocks:
        payload["blocks"] = blocks
    status, body = _http_post(webhook_url, payload)
    if status == 200 and body.strip() == "ok":
        logger.info("Slack webhook delivered OK.")
        return True
    logger.warning("Slack webhook returned %d: %s", status, body[:200])
    return False


# ---------------------------------------------------------------------------
# Bot Token API delivery (any channel, requires scopes)
# ---------------------------------------------------------------------------

def _send_via_bot_token(
    text: str,
    blocks: list[dict] | None,
    channel: str,
    bot_token: str,
) -> bool:
    """Post to any channel using bot token (requires chat:write scope)."""
    channel_ref = f"#{channel}" if not channel.startswith("#") else channel
    payload: dict[str, Any] = {
        "channel": channel_ref,
        "text": text,
        "unfurl_links": False,
        "unfurl_media": False,
    }
    if blocks:
        payload["blocks"] = blocks

    status, body = _http_post(
        "https://slack.com/api/chat.postMessage",
        payload,
        headers={"Authorization": f"Bearer {bot_token}"},
    )
    try:
        resp = json.loads(body)
        if resp.get("ok"):
            logger.info("Bot token delivered to %s OK.", channel_ref)
            return True
        err = resp.get("error", "unknown")
        logger.warning("Bot token delivery to %s failed: %s", channel_ref, err)
        return False
    except json.JSONDecodeError:
        logger.warning("Bot token: unparseable response %d: %s", status, body[:100])
        return False


# ---------------------------------------------------------------------------
# Channel management (requires channels:manage scope on bot)
# ---------------------------------------------------------------------------

def create_slack_channel(name: str, is_private: bool = False, settings: Settings | None = None) -> dict | None:
    """Create a Slack channel. Returns channel dict or None on failure.

    Requires ``channels:manage`` scope on the bot token.
    """
    s = settings or get_settings()
    bot_token = s.goalchain_ma_slack_bot_token.strip()
    if not bot_token:
        logger.warning("No GOALCHAIN_MA_SLACK_BOT_TOKEN configured.")
        return None

    # Normalize: lowercase, replace spaces with hyphens
    safe_name = name.lower().replace(" ", "-").replace("_", "-")

    payload = {"name": safe_name, "is_private": is_private}
    status, body = _http_post(
        "https://slack.com/api/conversations.create",
        payload,
        headers={"Authorization": f"Bearer {bot_token}"},
    )
    try:
        resp = json.loads(body)
        if resp.get("ok"):
            ch = resp["channel"]
            logger.info("Created Slack channel #%s (id=%s)", ch["name"], ch["id"])
            return ch
        err = resp.get("error", "unknown")
        if err == "name_taken":
            logger.info("Channel #%s already exists.", safe_name)
            return {"name": safe_name, "already_exists": True}
        logger.error("Failed to create #%s: %s", safe_name, err)
        return None
    except json.JSONDecodeError:
        logger.error("create_channel: unparseable response: %s", body[:200])
        return None


# ---------------------------------------------------------------------------
# Public send API
# ---------------------------------------------------------------------------

def send_slack_message(
    text: str,
    blocks: list[dict[str, Any]] | None = None,
    channel: str | None = None,
    settings: Settings | None = None,
) -> bool:
    """Send a message to Slack.

    Routing priority:
      1. If ``channel`` is set + bot_token available → bot token API
      2. Fallback → incoming webhook (fixed channel)
    """
    s = settings or get_settings()
    bot_token = s.goalchain_ma_slack_bot_token.strip()
    webhook_url = s.goalchain_ma_slack_webhook.strip()
    target = channel or "general-goalchain"

    if bot_token and channel:
        ok = _send_via_bot_token(text, blocks, target, bot_token)
        if ok:
            return True
        logger.info("Bot token failed for #%s; falling back to webhook.", target)

    if webhook_url:
        return _send_via_webhook(text, blocks, webhook_url)

    logger.warning("No Slack delivery method available (no webhook, no bot token).")
    return False


# ---------------------------------------------------------------------------
# Agent step notification (the main helper used by agents)
# ---------------------------------------------------------------------------

def notify_agent_step_slack(
    agent_name: str,
    objective: str,
    content: str,
    meta: dict[str, Any] | None = None,
    settings: Settings | None = None,
) -> bool:
    """Send an elegant block notification for an agent action.

    Automatically routes to the agent's dedicated channel when bot token
    is available, otherwise falls back to the webhook channel.
    """
    s = settings or get_settings()

    emoji_map = {
        "ceo": "👑 *CEO*",
        "dev": "💻 *DEV*",
        "growth": "📈 *GROWTH*",
        "ops": "⚙️ *OPS*",
    }
    agent_header = emoji_map.get(agent_name.lower(), f"🤖 *{agent_name.upper()}*")
    target_channel = AGENT_CHANNEL.get(agent_name.lower())

    blocks: list[dict[str, Any]] = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{agent_header} ejecutó acción sobre:\n>_{objective}_",
            },
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Acción/Mensaje:*\n{content}"},
        },
    ]

    if meta:
        fields = [
            {"type": "mrkdwn", "text": f"*{k}:*\n{v}"}
            for k, v in meta.items()
            if v
        ]
        if fields:
            blocks.append({"type": "section", "fields": fields[:10]})

    blocks.append({"type": "divider"})

    return send_slack_message(
        text=f"Agent {agent_name} action on '{objective[:50]}'",
        blocks=blocks,
        channel=target_channel,
        settings=s,
    )


# ---------------------------------------------------------------------------
# Alert helper (ops errors, dispatch failures)
# ---------------------------------------------------------------------------

def send_alert_slack(
    title: str,
    message: str,
    severity: str = "warning",  # "info" | "warning" | "error"
    settings: Settings | None = None,
) -> bool:
    """Send a structured alert to #goalchain-alerts."""
    emoji = {"info": "ℹ️", "warning": "⚠️", "error": "🔴"}.get(severity, "⚠️")
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{emoji} *{title}*\n{message}",
            },
        },
        {"type": "divider"},
    ]
    return send_slack_message(
        text=f"{emoji} {title}: {message[:100]}",
        blocks=blocks,
        channel="goalchain-alerts",
        settings=settings,
    )
