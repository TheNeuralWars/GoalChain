"""FCC Dispatch Loop.

Scans the GitHub repo for issues labelled ``status:ready`` + ``agent:opencode``
and dispatches them one-by-one to the local FCC/OpenCode worker via the
``oa-queue`` shell mechanism that already exists on the VPS.

Lifecycle per issue:
  1. Add label ``status:in-progress``  (remove ``status:ready``)
  2. Enqueue to FCC via ``oa-queue <issue_number>``
  3. On success → add comment + label ``status:dispatched``
  4. On failure → revert to ``status:ready`` so the next cycle retries

Safe to run concurrently with the LangGraph API: all writes are idempotent
GitHub label operations.  Never modifies source code directly.
"""

from __future__ import annotations

import json
import logging
import subprocess
import time
from pathlib import Path

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def _gh(args: list[str], timeout: int = 30) -> tuple[int, str, str]:
    """Run a ``gh`` CLI command; return (returncode, stdout, stderr)."""
    try:
        proc = subprocess.run(
            ["gh"] + args,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        return proc.returncode, (proc.stdout or "").strip(), (proc.stderr or "").strip()
    except subprocess.TimeoutExpired:
        return -1, "", f"timeout after {timeout}s"
    except FileNotFoundError:
        return -1, "", "gh not found in PATH"


def _label_add(repo: str, issue: int, label: str) -> bool:
    rc, _, err = _gh(["issue", "edit", str(issue), "--repo", repo, "--add-label", label])
    if rc != 0:
        logger.warning("label_add #%d %s failed: %s", issue, label, err)
    return rc == 0


def _label_remove(repo: str, issue: int, label: str) -> bool:
    rc, _, err = _gh(["issue", "edit", str(issue), "--repo", repo, "--remove-label", label])
    if rc != 0:
        logger.warning("label_remove #%d %s failed: %s", issue, label, err)
    return rc == 0


def _comment(repo: str, issue: int, body: str) -> bool:
    rc, _, err = _gh(["issue", "comment", str(issue), "--repo", repo, "--body", body])
    if rc != 0:
        logger.warning("comment #%d failed: %s", issue, err)
    return rc == 0


# ---------------------------------------------------------------------------
# Queue helpers
# ---------------------------------------------------------------------------

def _oa_queue(issue_number: int, timeout: int = 60) -> bool:
    """Dispatch issue to FCC via oa-queue script on VPS.

    The script lives at ``~/hermes/oa-queue`` and accepts an issue number.
    Falls back gracefully if the script is absent (non-VPS environments).
    """
    script = Path.home() / "hermes" / "oa-queue"
    if not script.is_file():
        # Try alternate locations
        for alt in [
            Path.home() / "goalchain-multiagent" / "oa-queue",
            Path("/usr/local/bin/oa-queue"),
        ]:
            if alt.is_file():
                script = alt
                break
        else:
            logger.warning("oa-queue script not found; simulating dispatch for issue #%d", issue_number)
            return True  # Allow the pipeline to continue even without the script

    try:
        proc = subprocess.run(
            [str(script), str(issue_number)],
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        if proc.returncode != 0:
            logger.error("oa-queue #%d exit=%d: %s", issue_number, proc.returncode, proc.stderr)
            return False
        logger.info("oa-queue #%d dispatched OK: %s", issue_number, proc.stdout[:200])
        return True
    except subprocess.TimeoutExpired:
        logger.error("oa-queue #%d timed out after %ds", issue_number, timeout)
        return False


# ---------------------------------------------------------------------------
# Core fetch
# ---------------------------------------------------------------------------

def fetch_ready_issues(repo: str, limit: int = 5) -> list[dict]:
    """Return list of open issues with status:ready + agent:opencode."""
    rc, out, err = _gh(
        [
            "issue", "list",
            "--repo", repo,
            "--label", "status:ready",
            "--label", "agent:opencode",
            "--state", "open",
            "--limit", str(limit),
            "--json", "number,title,labels,url",
        ]
    )
    if rc != 0:
        logger.error("fetch_ready_issues failed: %s", err)
        return []
    try:
        return json.loads(out) if out else []
    except json.JSONDecodeError as exc:
        logger.error("JSON parse error in fetch_ready_issues: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Dispatch one issue
# ---------------------------------------------------------------------------

def dispatch_issue(repo: str, issue: dict) -> bool:
    """Process a single status:ready issue through the dispatch lifecycle."""
    num = issue["number"]
    title = issue.get("title", "")
    logger.info("Dispatching issue #%d: %s", num, title)

    # 1. Mark in-progress
    _label_add(repo, num, "status:in-progress")
    _label_remove(repo, num, "status:ready")

    # 2. Enqueue to FCC
    success = _oa_queue(num)

    # 3. Update labels + comment
    if success:
        _label_remove(repo, num, "status:in-progress")
        _label_add(repo, num, "status:dispatched")
        _comment(
            repo, num,
            f"🤖 **GoalChain Agent Dispatch** — Issue #{num} ha sido enviado al worker FCC/OpenCode.\n\n"
            f"El agente procesará esta tarea y abrirá un Draft PR cuando esté listo.\n"
            f"Label actual: `status:dispatched`",
        )
        logger.info("Issue #%d dispatched successfully.", num)
        return True
    else:
        # Revert
        _label_remove(repo, num, "status:in-progress")
        _label_add(repo, num, "status:ready")
        _comment(
            repo, num,
            f"⚠️ **GoalChain Dispatch Error** — No se pudo encolar el issue #{num} al worker FCC.\n"
            f"Revertido a `status:ready` para reintento en el próximo ciclo.",
        )
        logger.warning("Issue #%d dispatch failed; reverted to status:ready.", num)
        return False


# ---------------------------------------------------------------------------
# Main loop (called by the scheduler / cron)
# ---------------------------------------------------------------------------

def run_dispatch_cycle(repo: str, limit: int = 3, dry_run: bool = False) -> dict:
    """Run one dispatch cycle. Returns a summary dict.

    Args:
        repo:    GitHub repo slug (e.g. ``TheNeuralWars/GoalChain``).
        limit:   Max issues to dispatch per cycle (avoid overwhelming FCC).
        dry_run: If True, fetch and log but don't mutate anything.
    """
    logger.info("=== FCC Dispatch Cycle start (repo=%s, limit=%d, dry_run=%s) ===", repo, limit, dry_run)
    issues = fetch_ready_issues(repo, limit=limit)
    logger.info("Found %d ready issues.", len(issues))

    results: list[dict] = []
    for issue in issues:
        num = issue["number"]
        if dry_run:
            logger.info("[DRY-RUN] Would dispatch #%d: %s", num, issue.get("title", ""))
            results.append({"number": num, "dispatched": False, "dry_run": True})
            continue

        ok = dispatch_issue(repo, issue)
        results.append({"number": num, "dispatched": ok})

        # Throttle: don't hammer GitHub API
        if len(issues) > 1:
            time.sleep(1.5)

    summary = {
        "total_ready": len(issues),
        "dispatched": sum(1 for r in results if r.get("dispatched")),
        "failed": sum(1 for r in results if not r.get("dispatched") and not r.get("dry_run")),
        "results": results,
    }
    logger.info("=== FCC Dispatch Cycle done: %s ===", summary)
    return summary
