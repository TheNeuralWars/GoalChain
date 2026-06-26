import pytest
from goalchain_multiagent.nemoclaw import run_nemoclaw_guardrail
from goalchain_multiagent.config import Settings

def test_nemoclaw_blocks_deterministic_dangerous_patterns():
    # rm -rf check
    is_safe, reason = run_nemoclaw_guardrail("rm -rf /data/files")
    assert is_safe is False
    assert "Blocked by NemoClaw" in reason
    
    # sudo check
    is_safe, reason = run_nemoclaw_guardrail("sudo systemctl restart nginx")
    assert is_safe is False
    assert "Blocked by NemoClaw" in reason

def test_nemoclaw_allows_safe_commands():
    is_safe, reason = run_nemoclaw_guardrail("systemctl --user is-active oa-worker.service")
    assert is_safe is True
    assert "Passed" in reason

def test_nemoclaw_allows_gh_issues_safe():
    is_safe, reason = run_nemoclaw_guardrail("gh issue list --repo TheNeuralWars/GoalChain")
    assert is_safe is True
    assert "Passed" in reason
