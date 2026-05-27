from __future__ import annotations

import subprocess
from unittest.mock import MagicMock, patch

from goalchain_multiagent.github_api import create_github_issue


def test_create_github_issue_success():
    mock_proc = MagicMock()
    mock_proc.returncode = 0
    mock_proc.stdout = "https://github.com/TheNeuralWars/GoalChain/issues/142\n"
    mock_proc.stderr = ""

    with patch("subprocess.run", return_value=mock_proc) as mock_run:
        res = create_github_issue(
            title="Fix coach API",
            body="API details",
            repo="TheNeuralWars/GoalChain",
            labels=["agent:opencode"],
        )
        assert res is not None
        assert res["number"] == 142
        assert res["url"] == "https://github.com/TheNeuralWars/GoalChain/issues/142"

        mock_run.assert_called_once()
        args, kwargs = mock_run.call_args
        cmd = args[0]
        assert "gh" in cmd
        assert "issue" in cmd
        assert "create" in cmd
        assert "--repo" in cmd
        assert "TheNeuralWars/GoalChain" in cmd
        assert "--label" in cmd
        assert "agent:opencode" in cmd


def test_create_github_issue_failure():
    mock_proc = MagicMock()
    mock_proc.returncode = 1
    mock_proc.stdout = ""
    mock_proc.stderr = "Authentication failed"

    with patch("subprocess.run", return_value=mock_proc):
        res = create_github_issue(
            title="Fix coach API",
            body="API details",
            repo="TheNeuralWars/GoalChain",
        )
        assert res is None


def test_create_github_issue_filenotfound():
    with patch("subprocess.run", side_effect=FileNotFoundError):
        res = create_github_issue(
            title="Fix coach API",
            body="API details",
            repo="TheNeuralWars/GoalChain",
        )
        assert res is None
