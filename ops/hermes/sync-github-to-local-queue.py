#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path

HERMES_HOME = Path("/home/ubuntu/hermes")
REPO_ROOT = Path("/home/ubuntu/hermes/workspace/GoalChain")
QUEUE_FILE = Path("/home/ubuntu/hermes/.local-issues/queue.json")
GITHUB_REPO = "TheNeuralWars/GoalChain"

def log(msg):
    print(f"[SYNC-QUEUE] {msg}")

def main():
    if not QUEUE_FILE.exists():
        # Initialize queue if not present
        QUEUE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(QUEUE_FILE, "w") as f:
            json.dump({"issues": [], "next_id": 1}, f, indent=2)

    try:
        with open(QUEUE_FILE, "r") as f:
            queue_data = json.load(f)
    except Exception as e:
        log(f"Error reading queue.json: {e}")
        sys.exit(1)

    # Fetch GitHub issues with status:ready
    log("Fetching status:ready issues from GitHub...")
    res = subprocess.run([
        "gh", "issue", "list",
        "--repo", GITHUB_REPO,
        "--state", "open",
        "--label", "status:ready",
        "--limit", "100",
        "--json", "number,title,body,labels"
    ], capture_output=True, text=True)

    if res.returncode != 0:
        log(f"Failed to fetch issues from GitHub: {res.stderr}")
        sys.exit(1)

    try:
        gh_issues = json.loads(res.stdout)
    except Exception as e:
        log(f"Failed to parse GitHub issues JSON: {e}")
        sys.exit(1)

    # Filter to only the code agents we care about
    CODE_AGENTS = {"agent:opencode", "agent:antigravity", "agent:grok"}
    
    existing_github_nums = {
        issue["github_number"] 
        for issue in queue_data.get("issues", []) 
        if issue.get("github_number") is not None
    }

    added_count = 0
    now_str = __import__('datetime').datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    for gh_issue in gh_issues:
        num = gh_issue["number"]
        title = gh_issue["title"]
        body = gh_issue["body"] or ""
        labels = [l["name"] for l in gh_issue.get("labels", []) if isinstance(l, dict) and "name" in l]

        # Ensure it is a task for code agents
        if not (set(labels) & CODE_AGENTS):
            continue

        if num in existing_github_nums:
            continue

        # Determine priority
        priority = "P1"
        if "priority:P0" in labels or "P0" in labels:
            priority = "P0"
        elif "priority:P2" in labels or "P2" in labels:
            priority = "P2"

        new_issue = {
            "id": queue_data["next_id"],
            "title": title,
            "body": body,
            "priority": priority,
            "labels": labels,
            "status": "ready",
            "created_at": now_str,
            "updated_at": now_str,
            "attempts": 0,
            "assigned_worker": None,
            "github_number": num
        }
        
        queue_data["issues"].append(new_issue)
        queue_data["next_id"] += 1
        added_count += 1
        log(f"Synced issue #{num} -> Local ID {new_issue['id']}: {title}")

    if added_count > 0:
        with open(QUEUE_FILE, "w") as f:
            json.dump(queue_data, f, indent=2)
        log(f"Successfully synced {added_count} new issues from GitHub.")
    else:
        log("No new issues found to sync.")

if __name__ == "__main__":
    main()
