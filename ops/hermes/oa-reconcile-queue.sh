#!/usr/bin/env bash
# Audit and reconcile GitHub issues with local oa worker .done files
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env" 2>/dev/null || true
REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"
GOALCHAIN_REPO_PATH="${GOALCHAIN_REPO_PATH:-${HERMES_HOME}/workspace/GoalChain}"
OA_HOME="${OA_HOME:-${HERMES_HOME}/oa}"
STATE_DIR="${STATE_DIR:-${OA_HOME}/state}"
DRY_RUN="${DRY_RUN:-1}"

log() { printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "$*"; }

log "Starting Hermes queue reconciliation..."
log "DRY_RUN=${DRY_RUN}"
log "STATE_DIR=${STATE_DIR}"
log "REPO=${REPO}"

# 1. Fetch all open issues with status:ready and agent:hermes/antigravity/grok
log "Fetching open issues with status:ready..."
issues_json="$(gh issue list --repo "${REPO}" --state open --label "status:ready" --limit 200 --json number,title,labels 2>/dev/null || echo '[]')"

# Parse and process
python3 - "${issues_json}" "${STATE_DIR}" "${DRY_RUN}" "${REPO}" "${GOALCHAIN_REPO_PATH}" <<'PY'
import json
import sys
import subprocess
from pathlib import Path

issues = json.loads(sys.argv[1])
state_dir = Path(sys.argv[2])
dry_run = sys.argv[3] == "1"
github_repo = sys.argv[4]
repo_path = Path(sys.argv[5])

CODE_AGENTS = {"agent:hermes", "agent:antigravity", "agent:grok"}

print(f"Total status:ready open issues fetched: {len(issues)}")
reconciled_count = 0

print(f"{'Issue':<8} | {'Title':<45} | {'Status':<12} | {'Action Taken':<40}")
print("-" * 115)

for issue in issues:
    number = issue["number"]
    title = issue["title"]
    labels = {l.get("name", "") for l in issue.get("labels", []) if isinstance(l, dict)}
    
    # Filter to only the code agents we care about
    if not (labels & CODE_AGENTS):
        continue
        
    done_file = state_dir / f"issue-{number}.done"
    has_done_file = done_file.exists()
    
    action = "None"
    status_str = "READY"
    
    if has_done_file:
        # We need to verify if there is real work done (per AGENT_ORCHESTRATION.md label contract for #841):
        # - branch containing "issue-N" (supports hermes-/antigravity-/grok- etc naming)
        # - PR head containing issue-N (any state)
        # - main git log grep "issue #N"
        # If evidence -> label status:done ; else rm stale .done (re-enable pick)
        has_branch = False
        has_pr = False
        has_main_commit = False

        # Broader remote branch check (grep for issue-N in ls-remote output)
        try:
            res = subprocess.run(
                ["git", "-C", str(repo_path), "ls-remote", "--heads", "origin"],
                capture_output=True, text=True, check=False
            )
            if f"issue-{number}" in res.stdout or f"-{number}" in res.stdout:
                has_branch = True
        except Exception:
            pass

        # Check PRs broader (list all, scan headRefName)
        try:
            res = subprocess.run(
                ["gh", "pr", "list", "--repo", github_repo, "--state", "all", "--json", "number,headRefName"],
                capture_output=True, text=True, check=False
            )
            prs = json.loads(res.stdout) if res.stdout.strip() else []
            for p in prs:
                if f"issue-{number}" in (p.get("headRefName","") or "") or f"-{number}" in (p.get("headRefName","") or ""):
                    has_pr = True
                    break
        except Exception:
            pass

        # Check main commits or comments (origin/main + local main/HEAD for ahead-of-remote cases during test/cambio urgente)
        for ref in ["origin/main", "main", "HEAD"]:
            try:
                res = subprocess.run(
                    ["git", "-C", str(repo_path), "log", ref, "--grep", f"issue #{number}", "--oneline", "-10"],
                    capture_output=True, text=True, check=False
                )
                if res.stdout.strip():
                    has_main_commit = True
                    break
            except Exception:
                pass

        work_done = has_branch or has_pr or has_main_commit

        if work_done:
            status_str = "DONE"
            if dry_run:
                action = f"[DRY_RUN] Would label status:done & remove status:ready"
            else:
                # Apply changes
                subprocess.run([
                    "gh", "issue", "edit", str(number), "--repo", github_repo,
                    "--remove-label", "status:ready", "--add-label", "status:done"
                ], capture_output=True)
                action = "Labeled status:done & removed status:ready"
                reconciled_count += 1
        else:
            status_str = "STALE DONE"
            if dry_run:
                action = f"[DRY_RUN] Would remove stale issue-{number}.done"
            else:
                try:
                    done_file.unlink()
                    action = f"Removed stale issue-{number}.done (no work found)"
                except Exception as e:
                    action = f"Failed to remove .done file: {e}"
                reconciled_count += 1
    short_title = title[:42] + "..." if len(title) > 42 else title
    print(f"#{number:<7} | {short_title:<45} | {status_str:<12} | {action:<40}")

print("-" * 115)
print(f"Reconciliation complete. Total reconciled items: {reconciled_count}")
PY
