# OA Proposal — Issue #815

## Title
[HERMES] [OPS] Centralize health-check + audit remaining timers/cron

## Source
GitHub issue #815

## Objective (as-implemented)
Stop silent cron drift. Three issues this week (vault_crank stale,
asset gen idle, plus "service looks loaded but never runs") all came
from invisible scheduler state. Add one fast command-line check +
timer-driven surveyor so future drift is surfaced within an hour.

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

## OA Plan (executed)
1. Phase 0 root invariants (R1): three checks: vault_crank.stale
   live probe, log-spam detector (last 5 logs ERROR count), timer
   health (active/inactive/failed counts), plus a cron-audit
   freshness check so silent drift is bounded to <12h.
2. Failure modes guarded: MCP unreachable (WARN, never silent),
   healthcheck logging to its own file (skip in self-scan),
   timer drift (1h cadence + OnBootSec=90s + Persistent=true),
   systemd flapping "failed" (SuccessExitStatus=1 2).
3. Files (all in main as 9e08287e):
   - ops/hermes/healthcheck.sh — 4 checks, human + --json.
   - ops/hermes/install-healthcheck-timer.sh — idempotent user timer.
   - ops/hermes/mcp-goalchain-ops.py — PATCH: goalchain-ops://.health.
   - docs/intake/2026-06-21-cron-audit-result.md — audit findings.
   - skills/devops/goalchain-ops/SKILL.md — new section.
4. Out of scope (locked): on-chain / treasury / mint, ECON_CANON,
   Discord webhooks, secrets.

## Risk / rollback
- Timer name collision: low (verified at install).
- Log-spam from healthcheck itself: low (writes its own log).
- MCP resource requires server restart to register (acceptable).
- Rollback:
  bash ops/hermes/install-healthcheck-timer.sh uninstall
  git revert 9e08287e

## Test commands (executed 2026-06-21)
- bash ops/hermes/healthcheck.sh          # human PASS/WARN/FAIL table
- bash ops/hermes/healthcheck.sh --json   # JSON envelope
- bash ops/hermes/healthcheck.sh --audit  # refresh cron-audit log
- bash ops/hermes/install-healthcheck-timer.sh install
- systemctl --user status goalchain-ops-healthcheck.timer --no-pager
- systemctl --user --failed --no-pager
Last run: overall=FAIL (timers check) because goalchain-backup.service
has been in failed state since 2026-06-21 00:23 UTC — that's exactly
the regression #815 was created to surface, not a defect of this PR.

## Status
done — PR #820 (exp/hermes-issue-815) merged 2026-06-21 14:51 UTC.
