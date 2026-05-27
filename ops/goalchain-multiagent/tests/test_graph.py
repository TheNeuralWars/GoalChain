import os

import pytest

os.environ.setdefault("GOALCHAIN_MA_MOCK_LLM", "1")
os.environ.setdefault("GOALCHAIN_MA_MAX_HOPS", "6")

from goalchain_multiagent.graph import run_objective  # noqa: E402


def test_dev_route_for_code_objective():
    result = run_objective("Refactor webapp coach API to use apiBaseUrl")
    trace = result.get("route_trace") or []
    assert "ceo" in trace
    assert "dev" in trace
    assert trace[-1] == "ceo" or result.get("finished")
    artifacts = result.get("artifacts") or []
    assert any(a.get("type") == "github_issue_draft" for a in artifacts)


def test_ops_route_for_estado():
    result = run_objective("estado: cola FCC y health VPS")
    trace = result.get("route_trace") or []
    assert "ops" in trace


def test_growth_route():
    result = run_objective("Buscar partners CRM para API GoalChain")
    trace = result.get("route_trace") or []
    assert "growth" in trace
