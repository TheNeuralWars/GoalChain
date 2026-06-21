# OA Proposal — Issue #815

## Title
[HERMES] [OPS] Centralize health-check + audit remaining timers/cron

## Source
GitHub issue #815

## Objective (verified against repo state, 2026-06-21)
Three cron failures this week (vault_crank stale, asset gen idle). Add one
systemic health-check so silent cron drift stops happening.

## Phase 0 — root invariants (R1)
1. **MVP shape**: a single bash script `ops/hermes/healthcheck.sh` that runs
   four checks and prints a compact PASS/WARN/FAIL table + a JSON envelope.
   The table is the human scan surface; the JSON envelope is what the MCP
   resource returns (so the controller / Discord can consume it).
2. **Invariants checked**:
   - `vault_crank.stale == false` (live API check; was the failure mode)
   - timer/service reachability (no `failed` state for our managed timers)
   - log-spam detector (last 5 logs, ERROR count in last 100 lines each)
   - cron-audit inventory file fresh (refreshed every 12h via the same timer)
3. **Failure modes I'm guarding against**:
   - healthcheck itself deadlocking (a 30-second `curl --max-time` ceiling)
   - healthcheck logging to the same file it scans (returns cwd → logs dir)
   - MCP server failing to import (resource is optional; fallback to direct
     call into `healthcheck.sh` from anywhere)
   - Timer drift filling logs (Level=info, no INFO spam)
4. **Out of scope** (locked behind "no cambio urgente"):
   - any on-chain / vault / mint change
   - changing `ECONOMIC_CANONICAL_CONFIG.json`
   - adding new Discord webhooks or any secret-bearing command
   - enshrining the gateway actions from the infra audit

## Files to add (proposed, small + safe)
1. **`ops/hermes/healthcheck.sh`** (new, ~80-90 lines)
   - Pure bash, `set -euo pipefail`, no secrets.
   - 4 checks → unified JSON envelope + ASCII table.
2. **`ops/hermes/install-healthcheck-timer.sh`** (new, ~40 lines)
   - Idempotent installer for the user timer:
     - `goalchain-ops-healthcheck.timer` → `goalchain-ops-healthcheck.service`
     - 1h cadence, OnBootSec=90s, Persistent=true.
   - Writes units under `$HOME/.config/systemd/user/`.
   - Reloads + enables without `systemctl --user enable-lingering`
     (so it works on Wi-Fi sessions where Lingering isn't configured).
3. **`ops/hermes/mcp-goalchain-ops.py` (PATCH)** — append:
   - `@mcp.resource("goalchain-ops://.health")` that runs
     `bash ops/hermes/healthcheck.sh --json` and returns the JSON string.
   - Fallback path: if the bash call fails, return
     `{"status":"unavailable","reason":"healthcheck_failed","error":"..."}`.
4. **`docs/intake/2026-06-21-cron-audit-result.md`** (new, brief) — running
   audit summary + owners + open follow-ups.
5. **`~/.hermes/profiles/hermes-ceo/skills/devops/goalchain-ops/SKILL.md`**
   (PATCH, one paragraph) — add a "Centralized health check" section
   pointing at the bash script + the MCP resource URI.
6. **`~/hermes/logs/cron-audit-<DATE>.log`** — generated from the inventory
   loop in the issue body. Not committed (logs are not in the repo) but
   referenced from the brief + pasted into the GitHub issue.

## Risks / regressions + rollback
- **Timer conflict (low risk)**: a new `goalchain-ops-healthcheck.timer`
  doesn't conflict with any existing unit — verified `systemctl --user
  list-unit-files` shows none with that name.
- **Log-spam from healthcheck itself (low)**: writes to its own log
  `~/hermes/logs/healthcheck.log`, rotated by `logrotate` if installed;
  falls back to size cap (200 KiB) inside the script.
- **MCP resource requires restart (expected)**: any caller holding an MCP
  client must `mcp.reconnect` after the file lands. Documented in the
  brief.
- **Rollback**:
  ```bash
  bash ops/hermes/install-healthcheck-timer.sh --uninstall
  git revert <merge-sha>
  ```
  Both removes the timer unit AND drops the service file. MCP resource
  rollback is a single revert commit.

## Exact test commands
```bash
# 1) Run the audit (creates cron-audit-YYYY-MM-DD.log)
bash -c "mkdir -p ~/hermes/logs
LOG=~/hermes/logs/cron-audit-$(date +%F).log
for u in \$(systemctl list-unit-files --type=service --no-legend | awk '{print \$1}' | grep -E 'goalchain|hermes'); do
  timer=\${u/.service/.timer}
  echo '=== '\$u' ===' >> \$LOG
  systemctl status \$u --no-pager | head -5 >> \$LOG
  systemctl status \$timer --no-pager 2>&1 | head -5 >> \$LOG
done
cat \$LOG"

# 2) Run the new healthcheck (human format)
bash ops/hermes/healthcheck.sh

# 3) Run with JSON envelope (used by the MCP resource)
bash ops/hermes/healthcheck.sh --json | jq .

# 4) Install + start the timer (idempotent)
bash ops/hermes/install-healthcheck-timer.sh

# 5) Confirm active
systemctl --user status goalchain-ops-healthcheck.timer --no-pager
systemctl --user list-timers goalchain-ops-healthcheck.timer --no-pager

# 6) MCP resource check (after server restart)
# from any client connected to goalchain-ops MCP, read goalchain-ops://.health
# or via hermes-manager: mcp_goalchain_ops_read_resource \
#   --uri='goalchain-ops://.health'

# 7) Dry-run once via the timer (no waiting)
systemctl --user start goalchain-ops-healthcheck.service
journalctl --user -u goalchain-ops-healthcheck.service -n 20 --no-pager
```

## Owner
hermes (this implementation). Antigravity = merge gate (PR review only;
draft PR per CLAUDE.md / `AGENT_ORCHESTRATION.md`).

## Priority
P2 (ops automation; no on-chain blast radius).

## Branch
`exp/hermes-issue-815` (per issue's branch-naming matrix: hermes →
`exp/hermes-*`).

## Workflow
- One implementer only (this run).
- Draft PR only (no `cambio urgente` in prompt).
- Final PR comment includes: tests run, residual risks, files touched.

## OA next steps
1. Create branch `exp/hermes-issue-815` from main.
2. Add files 1–4 above (small files, no >50-line write_file calls).
3. Patch file 5 (skill update, single paragraph).
4. Run audit loop; commit the `cron-audit-YYYY-MM-DD.log` to
   `~/hermes/logs/` (NOT in the repo — pasted into issue).
5. Run installer; confirm timer is active.
6. Open draft PR via `gh pr create --draft`.
7. Comment on issue #815 with: branch URL, audit-log excerpt, tests run.

## Risk / rollback
- Risk: the new timer unit shadows one already named
  `goalchain-ops-healthcheck.*` (checked: it doesn't).
- Risk: MCP resource syntax differs across FastMCP versions (mitigated:
  uses the public `mcp.resource(uri=...)` decorator — minimum
  signature, version-checked at runtime).
- Rollback:
  - `bash ops/hermes/install-healthcheck-timer.sh --uninstall`
  - `git checkout main` and `gh pr close <pr-num>`.

## Checklist (plain text — no todowrite tool)
- [ ] Refine proposal (this file)
- [ ] Create branch `exp/hermes-issue-815`
- [ ] Write `ops/hermes/healthcheck.sh` (human + --json)
- [ ] Write `ops/hermes/install-healthcheck-timer.sh`
- [ ] Run audit loop, capture log
- [ ] Patch `ops/hermes/mcp-goalchain-ops.py` to add the resource
- [ ] Write `docs/intake/2026-06-21-cron-audit-result.md`
- [ ] Patch skill `goalchain-ops/SKILL.md` (one section)
- [ ] Install timer + verify active + sample run
- [ ] Commit + push branch
- [ ] Open draft PR + paste audit excerpt on issue #815
