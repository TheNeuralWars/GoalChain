from __future__ import annotations

from unittest.mock import MagicMock, patch

from goalchain_multiagent.config import Settings
from goalchain_multiagent.twenty_api import create_twenty_lead


def test_create_twenty_lead_no_key():
    settings = Settings(goalchain_ma_twenty_api_key="")
    res = create_twenty_lead("Solana Partner", settings=settings)
    assert res is None


@patch("urllib.request.urlopen")
def test_create_twenty_lead_success(mock_urlopen):
    # Mock HTTP response
    mock_resp = MagicMock()
    mock_resp.read.return_value = b'{"data": {"id": "dd3f5435-c51a-4d77-9e52-917282731add"}}'
    mock_urlopen.return_value.__enter__.return_value = mock_resp

    settings = Settings(
        goalchain_ma_twenty_api_key="test-api-key",
        goalchain_ma_twenty_url="https://crm.goalchain.fun",
    )
    res = create_twenty_lead(
        name="Vitalik Buterin",
        email="vitalik@ethereum.org",
        settings=settings,
    )
    assert res is not None
    assert res["id"] == "dd3f5435-c51a-4d77-9e52-917282731add"
    assert res["url"] == "https://crm.goalchain.fun/object/person/dd3f5435-c51a-4d77-9e52-917282731add"
    assert res["live"] is True
