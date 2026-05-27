"""Tests for fcc_dispatch module."""
from __future__ import annotations

import json
from unittest.mock import MagicMock, call, patch

import pytest

from goalchain_multiagent.fcc_dispatch import (
    dispatch_issue,
    fetch_ready_issues,
    run_dispatch_cycle,
)

REPO = "TheNeuralWars/GoalChain"

SAMPLE_ISSUE = {
    "number": 42,
    "title": "[P1][webapp] Test dispatch issue",
    "url": "https://github.com/TheNeuralWars/GoalChain/issues/42",
    "labels": [
        {"name": "agent:opencode"},
        {"name": "status:ready"},
        {"name": "P1"},
    ],
}


# ---------------------------------------------------------------------------
# fetch_ready_issues
# ---------------------------------------------------------------------------

class TestFetchReadyIssues:
    def test_returns_parsed_issues(self):
        payload = json.dumps([SAMPLE_ISSUE])
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(0, payload, "")):
            issues = fetch_ready_issues(REPO)
        assert len(issues) == 1
        assert issues[0]["number"] == 42

    def test_empty_on_gh_error(self):
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(1, "", "network error")):
            assert fetch_ready_issues(REPO) == []

    def test_empty_on_json_error(self):
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(0, "not-json", "")):
            assert fetch_ready_issues(REPO) == []

    def test_empty_list_response(self):
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(0, "[]", "")):
            assert fetch_ready_issues(REPO) == []


# ---------------------------------------------------------------------------
# dispatch_issue
# ---------------------------------------------------------------------------

class TestDispatchIssue:
    def _mock_gh(self, rc=0, out="", err=""):
        return patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(rc, out, err))

    def test_happy_path_dispatches_and_labels(self):
        with self._mock_gh() as mock_gh, \
             patch("goalchain_multiagent.fcc_dispatch._oa_queue", return_value=True):
            result = dispatch_issue(REPO, SAMPLE_ISSUE)

        assert result is True
        # Should have added status:in-progress, removed status:ready,
        # removed status:in-progress, added status:dispatched, added comment
        calls = [str(c) for c in mock_gh.call_args_list]
        assert any("in-progress" in c for c in calls)
        assert any("dispatched" in c for c in calls)

    def test_queue_failure_reverts_to_ready(self):
        with self._mock_gh() as mock_gh, \
             patch("goalchain_multiagent.fcc_dispatch._oa_queue", return_value=False):
            result = dispatch_issue(REPO, SAMPLE_ISSUE)

        assert result is False
        calls = [str(c) for c in mock_gh.call_args_list]
        # Should revert to status:ready
        assert any("status:ready" in c for c in calls)


# ---------------------------------------------------------------------------
# run_dispatch_cycle
# ---------------------------------------------------------------------------

class TestRunDispatchCycle:
    def test_dry_run_does_not_call_dispatch(self):
        payload = json.dumps([SAMPLE_ISSUE])
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(0, payload, "")), \
             patch("goalchain_multiagent.fcc_dispatch.dispatch_issue") as mock_dispatch:
            summary = run_dispatch_cycle(REPO, limit=5, dry_run=True)

        mock_dispatch.assert_not_called()
        assert summary["total_ready"] == 1
        assert summary["dispatched"] == 0
        assert summary["results"][0]["dry_run"] is True

    def test_zero_ready_issues(self):
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(0, "[]", "")):
            summary = run_dispatch_cycle(REPO)
        assert summary["total_ready"] == 0
        assert summary["dispatched"] == 0

    def test_dispatches_all_ready(self):
        issues = json.dumps([SAMPLE_ISSUE, {**SAMPLE_ISSUE, "number": 43}])
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(0, issues, "")), \
             patch("goalchain_multiagent.fcc_dispatch.dispatch_issue", return_value=True), \
             patch("goalchain_multiagent.fcc_dispatch.time.sleep"):
            summary = run_dispatch_cycle(REPO, limit=5)

        assert summary["total_ready"] == 2
        assert summary["dispatched"] == 2
        assert summary["failed"] == 0

    def test_partial_failure_counted(self):
        issues = json.dumps([SAMPLE_ISSUE, {**SAMPLE_ISSUE, "number": 43}])
        # First call succeeds, second fails
        with patch("goalchain_multiagent.fcc_dispatch._gh", return_value=(0, issues, "")), \
             patch("goalchain_multiagent.fcc_dispatch.dispatch_issue", side_effect=[True, False]), \
             patch("goalchain_multiagent.fcc_dispatch.time.sleep"):
            summary = run_dispatch_cycle(REPO, limit=5)

        assert summary["dispatched"] == 1
        assert summary["failed"] == 1
