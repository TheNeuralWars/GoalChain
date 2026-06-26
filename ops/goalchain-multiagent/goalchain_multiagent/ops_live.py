"""Read-only VPS snapshot for Ops agent (no writes)."""

from __future__ import annotations

import subprocess
from goalchain_multiagent.config import Settings, get_settings


from goalchain_multiagent.nemoclaw import run_nemoclaw_guardrail


def _run(cmd: list[str], timeout: int = 25) -> str:
    cmd_str = " ".join(cmd)
    is_safe, reason = run_nemoclaw_guardrail(cmd_str)
    if not is_safe:
        return f"NemoClaw Blocked: {reason}"

    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        out = (proc.stdout or "").strip()
        err = (proc.stderr or "").strip()
        if proc.returncode != 0:
            return f"$ {' '.join(cmd)}\nexit={proc.returncode}\n{out}\n{err}".strip()
        return out or "(empty)"
    except subprocess.TimeoutExpired:
        return f"$ {' '.join(cmd)}\n(timeout after {timeout}s)"
    except FileNotFoundError:
        return f"$ {' '.join(cmd)}\n(command not found)"



def collect_ops_snapshot(objective: str, settings: Settings | None = None) -> str:
    s = settings or get_settings()
    repo = s.github_repo.strip() or "TheNeuralWars/GoalChain"

    sections: list[str] = [f"Objective: {objective}", "", "## Services"]
    for unit in ("oa-worker.service", "fcc-server.service", "goalchain-multiagent.service"):
        sections.append(f"- {unit}: {_run(['systemctl', '--user', 'is-active', unit])}")

    sections.extend(["", "## GitHub — status:ready (max 12)"])
    sections.append(
        _run(
            [
                "gh",
                "issue",
                "list",
                "--repo",
                repo,
                "--label",
                "status:ready",
                "--limit",
                "12",
                "--json",
                "number,title,labels",
            ]
        )
    )

    sections.extend(["", "## GitHub — agent:opencode open (max 8)"])
    sections.append(
        _run(
            [
                "gh",
                "issue",
                "list",
                "--repo",
                repo,
                "--label",
                "agent:opencode",
                "--state",
                "open",
                "--limit",
                "8",
            ]
        )
    )

    sections.extend(["", "## Draft PRs (search)"])
    sections.append(_run(["gh", "pr", "list", "--repo", repo, "--draft", "--limit", "8"]))

    return "\n".join(sections)
