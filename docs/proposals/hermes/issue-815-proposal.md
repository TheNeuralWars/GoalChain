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

1. **Phase 0 root invariants (R1)** — four checks:
   - `vault_crank.stale` live probe via `mcp_goalchain_ops_goalchain_ops_status` (curl fallback to `https://crm.goalchain.fun/goalchain-api/api/ops/status`).
   - log-spam detector (last 5 logs in `~/hermes/logs/`, ERROR/Traceback/Exception substring count in last 200 lines each).
   - timer health (active / inactive / failed counts among `goalchain|hermes` user units).
   - cron-audit freshness check (so silent drift is bounded to <12h).
2. **Failure modes guarded (R5)**:
   - MCP unreachable → WARN, never silent (logged to `healthcheck.log`).
   - Self-scan guard: `healthcheck.log` is excluded from spam counts.
   - Timer drift bounded by `OnUnitActiveSec=1h` + `OnBootSec=90s` + `Persistent=true`.
   - systemd flapping "failed" avoided via `SuccessExitStatus=1 2`.
3. **Implementation status (merged in `9e08287e`, verified 2026-06-21)**:
   - `ops/hermes/healthcheck.sh` — 4 checks, PASS/WARN/FAIL human + `--json`.
   - `ops/hermes/install-healthcheck-timer.sh` — idempotent user timer installer.
   - `ops/hermes/mcp-goalchain-ops.py` — PATCH: `goalchain-ops://.health` resource.
   - `docs/intake/2026-06-21-cron-audit-result.md` — audit findings + appendix + live verification snapshot.
   - `~/.hermes/skills/goalchain-hermes-ops/SKILL.md` — subsection "Centralized health check (issue #815)" near end (canonical skill path per Appendix A in the audit doc).
4. **Live verification (this session, 2026-06-21 16:55-16:58 UTC)**:
   - `systemctl --user list-timers goalchain-ops-healthcheck.timer` → active, last run 40min ago, next in 19min.
   - `bash ops/hermes/healthcheck.sh` → 3 PASS / 1 FAIL (`timers` flagged 1 failed unit).
   - recurring failure is `goalchain-backup.service` (PATH resolution issue, out of scope here).
   - owner-aware pivot: this session detected the regression **without** any manual `systemctl --user status`-hopping — exactly the R1 invariant the issue asked for.
5. **Out of scope (locked)**:
   - No on-chain / treasury / mint changes.
   - No edits to `docs/ECONOMIC_CANONICAL_CONFIG.json`.
   - No new Discord webhooks or any secret-bearing config.
   - No `cambio urgente` keyword in prompt → draft PR per CLAUDE.md orchestration rules.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #815

## Re-verification — 2026-06-21 18:52 UTC (regression caught + restored)

Working tree had regressed (proposal walked back to bare-draft template after
the orchestrator hook's `git reset` between commit and push, per memory).
Restored to as-executed content above. Live re-run confirms everything still
working unchanged:

```
$ bash ops/hermes/healthcheck.sh
GoalChain healthcheck — 2026-06-21 18:52:11 UTC
  ✅ ops_api      vault_crank.stale=false
  ✅ logs         0 ERROR hits across last 5 logs
  ❌ timers       1 failed / 0 inactive / 7 active (of 7)
  ✅ cron_audit   /home/ubuntu/hermes/logs/cron-audit-2026-06-21.log refreshed today
  ❌ overall = FAIL (rc=2)

$ bash ops/hermes/healthcheck.sh --json | jq .status
"FAIL"

$ systemctl --user list-timers goalchain-ops-healthcheck.timer --no-pager
NEXT                         LEFT LAST                           PASSED UNIT
Sun 2026-06-21 19:14:11 UTC 22min Sun 2026-06-21 18:14:11 UTC 38min ago goalchain-ops-healthcheck.timer
```

No code changed. The only outstanding finding (`goalchain-backup.service`
failed) remains out of scope for #815 — already triaged in
`docs/intake/2026-06-21-cron-audit-result.md` Appendix A.

## Re-verification — 2026-06-21 19:39 UTC (second regression round)

Same orchestrator-hook pattern as the previous restore: working tree
walked the proposal back to the bare-draft template even though HEAD
already held the as-executed body, then a parallel working-tree amend
was effectively squashed by the orchestrator's auto-reset so origin
diverged. Rebase + re-fetched, applied the same append again, and live
re-run shows the system still healthy and the healthcheck still catching
the same recurring `goalchain-backup.service` failure:

```
$ bash ops/hermes/healthcheck.sh
GoalChain healthcheck — 2026-06-21 19:39:16 UTC
---------------------------------------------
  ✅ ops_api      vault_crank.stale=false
  ✅ logs         0 ERROR hits across last 5 logs
  ❌ timers       1 failed / 0 inactive / 7 active (of 7)
  ✅ cron_audit   /home/ubuntu/hermes/logs/cron-audit-2026-06-21.log refreshed today
---------------------------------------------
  ❌ overall = FAIL (rc=2)

$ bash ops/hermes/healthcheck.sh --json | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["status"], [(c["name"],c["status"]) for c in d["checks"]])'
FAIL [('ops_api', 'PASS'), ('logs', 'PASS'), ('timers', 'FAIL'), ('cron_audit', 'PASS')]

$ systemctl --user list-timers goalchain-ops-healthcheck.timer --no-pager
NEXT                         LEFT LAST                           PASSED UNIT                            ACTIVATES
Sun 2026-06-21 20:14:21 UTC 35min Sun 2026-06-21 19:14:21 UTC 24min ago goalchain-ops-healthcheck.timer goalchain-ops-healthcheck.service

$ systemctl --user --failed --no-legend | grep -E '(goalchain|hermes)'
● goalchain-backup.service loaded failed failed GoalChain Daily Backup to Oracle Object Storage
```

Pattern is consistent across all three re-verifications: every run
fires on the same `goalchain-backup.service` PATH-resolution defect
(out of scope for #815, owned by separate triage issue per Appendix A
in `docs/intake/2026-06-21-cron-audit-result.md`). The deliverable
contract is preserved — silent cron drift is now bounded to ≤ 1h via
the `goalchain-ops-healthcheck.timer` surveyor, instead of being
invisible until users noticed degradation.
