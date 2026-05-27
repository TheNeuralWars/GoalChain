"""Slack webhook interaction helper for active agent logs and alerts."""

from __future__ import annotations

import json
import logging
import urllib.request
from typing import Any

from goalchain_multiagent.config import Settings, get_settings

logger = logging.getLogger(__name__)


def send_slack_message(
    text: str,
    blocks: list[dict[str, Any]] | None = None,
    settings: Settings | None = None,
) -> bool:
    """Send a structured message to Slack via Webhook.

    Returns True if successfully sent, False otherwise.
    """
    s = settings or get_settings()
    webhook_url = s.goalchain_ma_slack_webhook.strip()

    if not webhook_url:
        logger.debug("Slack Webhook URL is missing. Skipping Slack logging.")
        return False

    payload: dict[str, Any] = {"text": text}
    if blocks:
        payload["blocks"] = blocks

    headers = {
        "Content-Type": "application/json",
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(webhook_url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            if res_body.strip() == "ok":
                logger.info("Successfully pushed notification to Slack.")
                return True
            logger.warning("Slack returned unexpected body: %s", res_body)
            return False

    except Exception as exc:
        logger.exception("Failed to send Slack webhook alert: %s", exc)
        return False


def notify_agent_step_slack(
    agent_name: str,
    objective: str,
    content: str,
    meta: dict[str, Any] | None = None,
    settings: Settings | None = None,
) -> bool:
    """Send an elegant block representation of an agent action to Slack."""
    emoji_map = {
        "ceo": "👑 *CEO*",
        "dev": "💻 *DEV*",
        "growth": "📈 *GROWTH*",
        "ops": "⚙️ *OPS*",
    }
    
    agent_header = emoji_map.get(agent_name.lower(), f"🤖 *{agent_name.upper()}*")
    
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"{agent_header} ejecutó acción sobre:\n>_{objective}_"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Acción/Mensaje:*\n{content}"
            }
        }
    ]
    
    if meta:
        fields = []
        for k, v in meta.items():
            if v:
                fields.append({"type": "mrkdwn", "text": f"*{k}:*\n{v}"})
        if fields:
            blocks.append({
                "type": "section",
                "fields": fields[:10]  # Slack limit is 10 fields per block
            })

    blocks.append({"type": "divider"})
    
    return send_slack_message(
        text=f"Agent {agent_name} action log on '{objective[:50]}'",
        blocks=blocks,
        settings=settings,
    )
