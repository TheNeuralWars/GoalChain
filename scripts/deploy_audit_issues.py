#!/usr/bin/env python3
import subprocess
import sys
import json

ISSUES = [
    {
        "title": "AI-AUDIT: Extract Shared SDK Constants and PDA Seeds",
        "priority": "priority:P1",
        "body": """### Goal
Consolidate all PDA seeds and constants into the shared SDK so both the Express API and Oracle Service use the same source of truth.

### Checklist
- Export `SEEDS` maps and constants from `goalchain-sdk` package.
- Refactor `goalchain_oracle` to import seeds and config maps from the SDK instead of duplicating string literals.
- Rebuild the SDK (`npm run build`) and verify API and Oracle start cleanly.
"""
    },
    {
        "title": "AI-AUDIT: Implement Resilient Staking and Jupiter Swap in Vault Crank",
        "priority": "priority:P0",
        "body": """### Goal
Replace the risky SOL transfer fallback in `vault_crank.ts` and add transaction simulations for mainnet safety.

### Checklist
- Locate `vault_crank.ts` mainnet execution path.
- Replace the `SystemProgram.transfer` fallback with a proper checked Jupiter swap instruction or raise a validated error.
- Add transaction preflight simulation (`simulateTransaction`) before transaction submission.
- Ensure Jupiter swap logic works with Versioned Transactions and handles token-burning correctly.
"""
    },
    {
        "title": "AI-AUDIT: Implement RPC Retries, Priority Fee Caching & Network Timeouts",
        "priority": "priority:P0",
        "body": """### Goal
Make network and RPC calls highly resilient to congestion and rate limits.

### Checklist
- Implement `AbortController` and request timeouts on all `fetch` calls (Helius and Jupiter APIs).
- Add a structured retry wrapper with exponential backoff around `sendAndConfirmTransaction` and RPC calls.
- Add priority fee estimation caching (10-second TTL) inside `priorityFees.ts`.
"""
    },
    {
        "title": "AI-AUDIT: Express API Input Validation & Persistent Alert State",
        "priority": "priority:P1",
        "body": """### Goal
Guard the Express backend from crashing due to file-reading exceptions or invalid query inputs.

### Checklist
- Wrap all synchronous file-loading calls (`fs.readFileSync`) in try-catch blocks in the Express backend.
- Add input validation middleware to Express endpoints to sanitize query parameters.
- Persist `healthAlertState` in a lightweight SQLite or Redis store instead of in-memory.
"""
    },
    {
        "title": "AI-AUDIT: Implement Graceful Daemon Shutdowns & Unit Tests",
        "priority": "priority:P2",
        "body": """### Goal
Improve Oracle daemon observability, logging, and lifecycle operations.

### Checklist
- Register `SIGINT` and `SIGTERM` signal listeners in the Oracle daemon to gracefully release resources.
- Standardize logs using a structured logging library (e.g. `pino` or `winston`).
- Add unit tests for API utility functions like `parseCsv`.
"""
    }
]

def create_issue(issue):
    cmd = [
        "gh", "issue", "create",
        "--title", issue["title"],
        "--body", issue["body"],
        "--label", "status:ready",
        "--label", "agent:opencode",
        "--label", issue["priority"]
    ]
    print(f"Creating issue: {issue['title']}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        # The output contains the issue URL (e.g. https://github.com/owner/repo/issues/123)
        issue_url = res.stdout.strip()
        issue_num = issue_url.split("/")[-1]
        print(f"Successfully created Issue #{issue_num}: {issue_url}")
        return issue_num
    else:
        print(f"Failed to create issue: {res.stderr}")
        return None

def main():
    created = []
    for issue in ISSUES:
        num = create_issue(issue)
        if num:
            created.append(num)
    
    print(f"\nDone! Created {len(created)} issues: {', '.join(created)}")

if __name__ == "__main__":
    main()
