"""Tests for slack_api module."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

from goalchain_multiagent.config import Settings
from goalchain_multiagent.slack_api import (
    notify_agent_step_slack,
    send_alert_slack,
    send_slack_message,
)


def _mock_urlopen_ok():
    """Context-manager mock that returns a 200 response with body 'ok'."""
    mock_resp = MagicMock()
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = MagicMock(return_value=False)
    mock_resp.status = 200
    mock_resp.read.return_value = b"ok"
    return mock_resp


# ---------------------------------------------------------------------------
# send_slack_message
# ---------------------------------------------------------------------------

def test_send_slack_message_no_webhook_no_token():
    """With no webhook and no bot token, should return False immediately."""
    settings = Settings(goalchain_ma_slack_webhook="", goalchain_ma_slack_bot_token="")
    res = send_slack_message("test", settings=settings)
    assert res is False


@patch("urllib.request.urlopen")
def test_send_slack_message_via_webhook(mock_urlopen):
    """No channel specified → uses webhook directly."""
    mock_urlopen.return_value = _mock_urlopen_ok()
    settings = Settings(
        goalchain_ma_slack_webhook="https://hooks.slack.com/services/test",
        goalchain_ma_slack_bot_token="",
    )
    res = send_slack_message("Hello", settings=settings)
    assert res is True


@patch("urllib.request.urlopen")
def test_send_slack_message_bot_token_fallback_to_webhook(mock_urlopen):
    """With channel + no working bot token → falls back to webhook."""
    # Bot token API returns an error, webhook returns ok
    bot_resp = MagicMock()
    bot_resp.__enter__ = lambda s: s
    bot_resp.__exit__ = MagicMock(return_value=False)
    bot_resp.status = 200
    bot_resp.read.return_value = b'{"ok":false,"error":"missing_scope"}'

    wh_resp = _mock_urlopen_ok()

    mock_urlopen.side_effect = [bot_resp, wh_resp]

    settings = Settings(
        goalchain_ma_slack_webhook="https://hooks.slack.com/services/test",
        goalchain_ma_slack_bot_token="xoxb-fake",
    )
    res = send_slack_message("msg", channel="goalchain-dev", settings=settings)
    assert res is True


# ---------------------------------------------------------------------------
# notify_agent_step_slack
# ---------------------------------------------------------------------------

@patch("urllib.request.urlopen")
def test_notify_agent_step_slack_success(mock_urlopen):
    """Notification via webhook when no bot token channel configured."""
    mock_urlopen.return_value = _mock_urlopen_ok()
    settings = Settings(
        goalchain_ma_slack_webhook="https://hooks.slack.com/services/test",
        goalchain_ma_slack_bot_token="",
    )
    res = notify_agent_step_slack(
        agent_name="dev",
        objective="Create issue test",
        content="Issue created successfully",
        meta={"Number": "42", "URL": "https://github.com/..."},
        settings=settings,
    )
    assert res is True


def test_notify_agent_step_slack_no_config():
    """No config → returns False without crashing."""
    settings = Settings(goalchain_ma_slack_webhook="", goalchain_ma_slack_bot_token="")
    res = notify_agent_step_slack("ops", "test", "content", settings=settings)
    assert res is False


# ---------------------------------------------------------------------------
# send_alert_slack
# ---------------------------------------------------------------------------

@patch("urllib.request.urlopen")
def test_send_alert_slack_warning(mock_urlopen):
    mock_urlopen.return_value = _mock_urlopen_ok()
    settings = Settings(
        goalchain_ma_slack_webhook="https://hooks.slack.com/services/test",
        goalchain_ma_slack_bot_token="",
    )
    res = send_alert_slack("Deploy failed", "FCC worker unreachable", severity="error", settings=settings)
    assert res is True
