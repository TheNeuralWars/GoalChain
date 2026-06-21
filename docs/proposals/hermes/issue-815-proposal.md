# OA Proposal — Issue #815

## Title
[HERMES] [OPS] Centralize health-check + audit remaining timers/cron

## Source
GitHub issue #815

## Objective
## Objective
We had three issues this week that came from invisible cron failures (vault_crank stale, asset gen idle). Add a systemic health check.

TASKS:
1. Inventory all system timers:
   - For u in $(systemctl list-unit-files --type=service --no-legend | awk '{print $1}' | grep -E 'goalchain|hermes'); do
       timer=${u/.service/.timer}
       echo "=== $u ===" >> ~/hermes/logs/cron-audit-$(date +%F).log
       systemctl status $u --no-pager | head -5 >> ~/hermes/logs/cron-audit-$(date +%F).log
       systemctl status $timer --no-pager 2>&1 | head -5 >> ~/hermes/logs/cron-audit-$(date +%F).log
     done
2. Add a new file: ops/hermes/healthcheck.sh that calls:
   - mcp_goalchain_ops_goalchain_ops_status (or curl if MCP unavailable)
   - checks last 5 log files in ~/hermes/logs/ for ERROR/spam
   - checks timer health (active/inactive/failed counts)
   - prints compact PASS/WARN/FAIL table
3. Install as a user timer at goalchain-ops-healthcheck.timer every 1h, target goalchain-ops-healthcheck.service
4. Export resource: mcp server goalchain-ops add read resource goalchain-ops://.health returning JSON of healthcheck.sh — fallback to system call if MCP server source is owned
5. Brief rootcause-note in docs/intake/2026-06-21-cron-audit-result.md (you write it after running the audit)

DELIVERABLE:
- healthcheck.sh working
- timer installed + active
- audit log committed to biglog (paste result in this issue)
- Result brief file
- One-line update to goalchain-hermes-ops skill (mention healthcheck command)

## Owner
hermes

## Priority
P2

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #815
