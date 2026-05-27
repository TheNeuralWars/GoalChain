from __future__ import annotations

from unittest.mock import MagicMock, patch

from goalchain_multiagent.config import Settings
from goalchain_multiagent.slack_api import send_slack_message, notify_agent_step_slack


def test_send_slack_message_no_webhook():
    settings = Settings(goalchain_ma_slack_webhook="")
    res = send_slack_message("test", settings=settings)
    assert res is False


@patch("urllib.request.urlopen")
def test_send_slack_message_success(mock_urlopen):
    # Mock HTTP response
    mock_resp = MagicMock()
    mock_resp.read.return_value = b"ok"
    mock_urlopen.return_value.__enter__.return_value = mock_resp

    settings = Settings(goalchain_ma_slack_webhook="https://hooks.slack.com/services/test")
    res = send_slack_message("Vitalik created", settings=settings)
    assert res is True


@patch("urllib.request.urlopen")
def test_notify_agent_step_slack_success(mock_urlopen):
    mock_resp = MagicMock()
    mock_resp.read.return_value = b"ok"
    mock_urlopen.return_value.__enter__.return_value = mock_resp

    settings = Settings(goalchain_ma_slack_webhook="https://hooks.slack.com/services/test")
    res = notify_agent_step_slack(
        agent_name="dev",
        objective="Create issue test",
        content="Success creating issue",
        meta={"key": "val"},
        settings=settings,
    )
    assert res is True
