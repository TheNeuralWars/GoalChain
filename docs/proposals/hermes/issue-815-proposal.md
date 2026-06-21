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

1. **Phase 0 root invariants (R1)** — three checks:
   - `vault_crank.stale` live probe via `mcp_goalchain_ops_goalchain_ops_status` (curl fallback to `https://crm.goalchain.fun/goalchain-api/api/ops/status`).
   - log-spam detector (last 5 logs in `~/hermes/logs/`, ERROR/Traceback/Exception substring count in last 200 lines each).
   - timer health (active / inactive / failed counts among `goalchain|hermes` user units).
   - cron-audit freshness check (so silent drift is bounded to <12h).
2. **Failure modes guarded (R5)**:
   - MCP unreachable → WARN, never silent (logged to `healthcheck.log`).
   - Self-scan guard: `healthcheck.log` is excluded from spam counts.
   - Timer drift bounded by `OnUnitActiveSec=1h` + `OnBootSec=90s` + `Persistent=true`.
   - systemd flapping "failed" avoided via `SuccessExitStatus=1 2`.
3. **Implementation status (executed, merged in `9e08287e`)**:
   - `ops/hermes/healthcheck.sh` — 4 checks, PASS/WARN/FAIL human + `--json`.
   - `ops/hermes/install-healthcheck-timer.sh` — idempotent user timer installer.
   - `ops/hermes/mcp-goalchain-ops.py` — PATCH: `goalchain-ops://.health` resource.
   - `docs/intake/2026-06-21-cron-audit-result.md` — audit findings + appendix.
   - `~/.hermes/skills/goalchain-hermes-ops/SKILL.md` — new "Centralized health check (issue #815)" subsection at lines 255-280 (canonical skill path per Appendix A in the audit doc).
4. **Out of scope (locked)**:
   - No on-chain / treasury / mint changes.
   - No edits to `docs/ECONOMIC_CANONICAL_CONFIG.json`.
   - No new Discord webhooks or secret-bearing config.
   - No `cambio urgente` keyword in prompt → draft PR per CLAUDE.md orchestration rules.

## Risk / rollback

1. **`SuccessExitStatus=1 2` is permissive** — a totally-broken healthcheck
   (`exit 3`, `exit 99`) WILL trip systemd. Acceptable: the alert path is
   systemd journal + `cron-audit-*.log`, not the timer itself.
2. **log-spam detector false-positives** — substring `error` is
   case-insensitive; benign "error handling" lines may inflate counts.
   Tunable via `LOG_SCAN_LINES=200` (default) and `ERROR_THRESHOLD=50`
   (escalate to FAIL above that).
3. **MCP resource subprocess 60s timeout** — a hung healthcheck surfaces
   as a slow MCP call, not a hang. Resource handler returns a degraded
   `{"status":"unavailable"}` envelope on script failure.
4. **No secrets touched** — script only reads public API URL
   (`GOALCHAIN_API_BASE` defaults to public CRM). No tokens, no `.env`.

**Atomic rollback**:
```bash
bash ops/hermes/install-healthcheck-timer.sh uninstall
git revert 9e08287e   # removes files + MCP resource handler
```
Both stop the timer immediately AND remove the resource on next MCP
server restart (resource is registered at `@mcp.resource(...)` decorator).

## Test commands (executed 2026-06-21)

All pass. Recorded in `docs/intake/2026-06-21-cron-audit-result.md`.

```bash
# 1. Script + JSON modes
bash ops/hermes/healthcheck.sh                    # → rc=2 FAIL (1 failed service: goalchain-backup)
bash ops/hermes/healthcheck.sh --json             # single-line JSON envelope
bash ops/hermes/healthcheck.sh --audit            # refreshes cron-audit-<DATE>.log
bash ops/hermes/healthcheck.sh --help

# 2. Idempotent install / uninstall
bash ops/hermes/install-healthcheck-timer.sh install
bash ops/hermes/install-healthcheck-timer.sh status
bash ops/hermes/install-healthcheck-timer.sh uninstall

# 3. systemd vantage
systemctl --user status goalchain-ops-healthcheck.timer --no-pager
systemctl --user list-timers goalchain-ops-healthcheck.timer --no-pager
systemctl --user start goalchain-ops-healthcheck.service
journalctl --user -u goalchain-ops-healthcheck.service -n 20 --no-pager

# 4. MCP resource vantage
~/.hermes/hermes-agent/venv/bin/python3 -c "
import os, importlib.util
os.environ.setdefault('GOALCHAIN_REPO_PATH', '/data/apps/GoalChain')
spec = importlib.util.spec_from_file_location('goalchain_ops', 'ops/hermes/mcp-goalchain-ops.py')
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
print(mod.goalchain_ops_health())
"

# 5. Audit log + sentinel
ls -la ~/hermes/logs/cron-audit-2026-06-21.log ~/hermes/logs/healthcheck.log
```
