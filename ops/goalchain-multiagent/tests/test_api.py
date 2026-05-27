import os

import pytest
from fastapi.testclient import TestClient

os.environ["GOALCHAIN_MULTIAGENT_ENABLED"] = "1"
os.environ["GOALCHAIN_MA_TOKEN"] = "test-token"
os.environ["GOALCHAIN_MA_MOCK_LLM"] = "1"

from goalchain_multiagent.api import app  # noqa: E402

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert "enabled" in data
    assert "mock_llm" in data


def test_run_requires_auth():
    r = client.post("/v1/run", json={"objective": "estado FCC"})
    assert r.status_code == 401


def test_run_ok():
    r = client.post(
        "/v1/run",
        headers={"Authorization": "Bearer test-token"},
        json={
            "objective": "Refactor webapp coach API",
            "source": "hermes",
            "actor": "nico",
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert data["summary"]
    assert "ceo" in data["route_trace"]
    assert any(a.get("type") == "github_issue_draft" for a in data["artifacts"])


def test_run_disabled_service():
    os.environ["GOALCHAIN_MULTIAGENT_ENABLED"] = "0"
    from goalchain_multiagent.config import Settings

    # Fresh settings instance for this test only
    disabled = Settings(goalchain_multiagent_enabled=False, goalchain_ma_token="test-token")
    from goalchain_multiagent import api as api_mod

    original = api_mod.get_settings
    api_mod.get_settings = lambda: disabled  # type: ignore[method-assign]
    try:
        r = client.post(
            "/v1/run",
            headers={"Authorization": "Bearer test-token"},
            json={"objective": "test"},
        )
        assert r.status_code == 503
    finally:
        api_mod.get_settings = original
        os.environ["GOALCHAIN_MULTIAGENT_ENABLED"] = "1"
