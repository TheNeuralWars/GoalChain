import json
import os
import subprocess
import sys
from pathlib import Path

HERMES_HOME = Path("/home/ubuntu/hermes")
REPO_ROOT = Path("/home/ubuntu/hermes/workspace/GoalChain")
QUEUE_FILE = Path("/home/ubuntu/hermes/.local-issues/queue.json")
WORKTREE_BASE = Path("/data/apps/GoalChain-worktrees")

def log(msg):
    print(f"[LOCAL-REVIEWER] {msg}")

def run_cmd(args, cwd=None):
    res = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    return res.returncode == 0, res.stdout, res.stderr

import fcntl

def main():
    # Acquire flock to prevent concurrent reviewer execution
    lock_path = "/tmp/local-reviewer.lock"
    lock_file = open(lock_path, "w")
    try:
        fcntl.flock(lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except IOError:
        log("Another local-reviewer process is already running. Exiting.")
        sys.exit(0)

    if not QUEUE_FILE.exists():
        log("No local queue file found.")
        sys.exit(0)

    try:
        with open(QUEUE_FILE, "r") as f:
            queue_data = json.load(f)
    except Exception as e:
        log(f"Error reading queue.json: {e}")
        sys.exit(1)

    issues = queue_data.get("issues", [])
    modified = False
    merged_any = False

    # Check which issues are done but have unmerged branches
    for issue in issues:
        if issue.get("status") != "done":
            continue

        issue_id = issue.get("id")
        worker = issue.get("assigned_worker")
        labels = issue.get("labels", [])
        github_num = issue.get("github_number")

        owner = "hermes"
        if "agent:antigravity" in labels:
            owner = "antigravity"
        elif "agent:grok" in labels:
            owner = "grok"

        if not worker:
            log(f"Issue #{issue_id} is marked done but has no assigned worker. Skipping.")
            continue

        branch = f"exp/oa-{owner}-{worker}-{issue_id}"
        worktree_dir = WORKTREE_BASE / worker

        # Check if the branch exists in the worktree
        if not worktree_dir.exists():
            continue

        # Check if branch is already merged in base repo
        is_merged, _, _ = run_cmd(["git", "merge-base", "--is-ancestor", branch, "main"], cwd=REPO_ROOT)
        if is_merged:
            issue["status"] = "merged"
            modified = True
            continue

        log(f"Reviewing issue #{issue_id} (branch: {branch}) from worker {worker}...")

        # 1. Verify that the branch exists in the shared git database
        branch_exists, _, _ = run_cmd(["git", "show-ref", "--verify", f"refs/heads/{branch}"], cwd=REPO_ROOT)
        if not branch_exists:
            log(f"Branch {branch} does not exist in shared repository database.")
            continue

        # 2. Checkout the branch in main repo
        success, _, err = run_cmd(["git", "checkout", branch], cwd=REPO_ROOT)
        if not success:
            log(f"Failed to checkout branch {branch} in main repo: {err}")
            continue

        # 3. Run SDK build
        sdk_ok = True
        sdk_err = ""
        sdk_path = REPO_ROOT / "goalchain-sdk"
        if sdk_path.exists():
            log("Building SDK...")
            ok, out, err = run_cmd(["npm", "run", "build"], cwd=sdk_path)
            if not ok:
                sdk_ok = False
                sdk_err = err or out

        # 4. Run Webapp typecheck
        webapp_ok = True
        webapp_err = ""
        webapp_path = REPO_ROOT / "goalchain_webapp"
        if webapp_path.exists():
            log("Typechecking webapp...")
            ok, out, err = run_cmd(["npx", "tsc", "--noEmit"], cwd=webapp_path)
            if not ok:
                webapp_ok = False
                webapp_err = err or out

        if sdk_ok and webapp_ok:
            log("Sanity checks PASSED! Merging locally...")
            # Checkout main
            run_cmd(["git", "checkout", "main"], cwd=REPO_ROOT)
            # Pull main to avoid out-of-sync pushes
            run_cmd(["git", "pull", "origin", "main"], cwd=REPO_ROOT)
            # Merge branch
            merge_ok, _, merge_err = run_cmd(["git", "merge", "--no-ff", "--no-edit", branch], cwd=REPO_ROOT)
            if merge_ok:
                log(f"Merged {branch} locally into main.")
                merged_any = True
                issue["status"] = "merged"
                modified = True
                # Delete branch
                run_cmd(["git", "branch", "-D", branch], cwd=REPO_ROOT)
                # Comment on GitHub if github_num exists
                if github_num:
                    comment_body = f"✓ **Autonomous Local Validation PASSED** 🚀\n\nChanges for issue #{github_num} merged locally on VPS and deployed."
                    subprocess.run(["gh", "issue", "comment", str(github_num), "--repo", "TheNeuralWars/GoalChain", "--body", comment_body], capture_output=True)
                    subprocess.run(["gh", "issue", "edit", str(github_num), "--repo", "TheNeuralWars/GoalChain", "--add-label", "status:done", "--remove-label", "status:in_progress"], capture_output=True)
                    subprocess.run(["gh", "issue", "close", str(github_num), "--repo", "TheNeuralWars/GoalChain"], capture_output=True)
            else:
                log(f"Failed to merge {branch}: {merge_err}")
                run_cmd(["git", "merge", "--abort"], cwd=REPO_ROOT)
        else:
            log(f"Sanity checks FAILED for {branch}.")
            # Set status back to ready
            issue["status"] = "ready"
            issue["assigned_worker"] = None
            modified = True
            
            # Comment on GitHub if github_num exists
            if github_num:
                error_msg = f"🚨 **Autonomous Local Validation FAILED** 🚨\n\nTask re-queued. Errors:\n"
                if not sdk_ok:
                    error_msg += f"**SDK Build Error:**\n```\n{sdk_err[:500]}\n```\n"
                if not webapp_ok:
                    error_msg += f"**Webapp Typecheck Error:**\n```\n{webapp_err[:500]}\n```\n"
                subprocess.run(["gh", "issue", "comment", str(github_num), "--repo", "TheNeuralWars/GoalChain", "--body", error_msg], capture_output=True)
                subprocess.run(["gh", "issue", "edit", str(github_num), "--repo", "TheNeuralWars/GoalChain", "--remove-label", "status:in_progress", "--add-label", "status:ready"], capture_output=True)

        # Always return to main
        run_cmd(["git", "checkout", "main"], cwd=REPO_ROOT)

    if modified:
        with open(QUEUE_FILE, "w") as f:
            json.dump(queue_data, f, indent=2)
        log("Updated queue.json with re-queued issues.")

    if merged_any:
        # Push main to origin
        log("Pushing main to origin...")
        push_ok, _, push_err = run_cmd(["git", "push", "origin", "main"], cwd=REPO_ROOT)
        if push_ok:
            log("Successfully pushed main to origin.")
        else:
            log(f"Failed to push main: {push_err}")
    else:
        log("No changes merged, skipping push.")

if __name__ == "__main__":
    main()
