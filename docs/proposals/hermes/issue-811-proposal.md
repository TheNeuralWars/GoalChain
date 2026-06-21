# OA Proposal — Issue #811

## Title
[HERMES] [ECON] Diagnose+fix vault_crank stale (15-jun→today) + validate mint_gate threshold

## Source
GitHub issue #811 (operator: hermes / Manager via WhatsApp/OpenClaw).

## Objective (R1 — root invariants before coding)
1. `mcp_goalchain_ops_goalchain_ops_status.vault_crank.stale:true` is a *derived*
   snapshot in `goalchain_api/src/index.ts:451-490`: it reads `docs/data/burn_tracker.json`,
   compares its `timestamp_iso` against `Date.now()`, and sets `stale = ageMs > OPS_VAULT_CRANK_STALE_HOURS*3600*1000` (default 48h).
2. `mode:dry-run` is just the value `mode` baked into `burn_tracker.json` by the last
   `vault_crank.ts` run where `VAULT_CRANK_EXECUTE` was unset
   (`goalchain_oracle/src/vault_crank.ts:88`, `:377-382`).
3. `mint_gate.allow:false` (ratio 0.116 < 0.85) is hardcoded in three places:
   - `goalchain_oracle/src/mint_gate.ts:67` (oracle CLI)
   - `goalchain_api/src/index.ts` `computeMintGateFromRows()` — same 0.85 cut
   - API health endpoint default thresholds (`emit_burn_ratio_min: 0.85`)
   The threshold 0.85 matches the rule in the issue body — DO NOT change without Nico.

## Root cause (verified by execution)
- `burn_tracker.json` mtime = 2026-06-15 01:49 UTC (6+ days old) → `stale:true` is correct math.
- NO `goalchain-economy-crank.timer`, no `.service`, no log file, no cron, no openclaw cron
  re-running `vault_crank.ts` anywhere on this VPS
  (checked `systemctl list-timers`, `find /etc -name '*goalchain*'`,
  `/etc/cron*`, `/etc/systemd`, openclaw `install-cron.sh`, `goalchain-alpha-watch.sh`,
  all `ops/hermes/*.sh` — zero references to `vault_crank` / `burn_tracker`).
- The crank is a manual `ts-node goalchain_oracle/src/vault_crank.ts` invocation.
  Nobody has run it since 2026-06-15.

This is a **MISSING SCHEDULER**, not a paused/crashed service. Failure mode (d) "config key
missing" and (e) "funding wallet empty" do NOT apply. Mode (a) timer-pause / (b) OOM /
(c) RPC 429 don't apply either — there is no timer.

## Proposed fix (R3 — minimal, scoped)
ONE conceptual change: schedule the oracle dry-run crank via openclaw cron (the only cron
substrate currently wired on this VPS, per `ops/openclaw/install-cron.sh`). Stay in `dry-run`
until Nico approves `mode=live`.

### File list (no live-mode switch)
1. `ops/openclaw/install-economy-crank-cron.sh` — new file. Registers openclaw cron job
   `goalchain-economy-crank-dry` that runs every 6h in devnet dry-run, executes
   `goalchain_oracle/dist/vault_crank.js` (compiled output already on disk, mtime 2026-06-15),
   and writes the report to `docs/data/burn_tracker.json` consumed by the API. **Dry-run only**
   (`VAULT_CRANK_EXECUTE` not set). Includes a tiny self-check that gives up silently if
   `dist/vault_crank.js` is missing.
2. `ops/openclaw/install-cron.sh` — append a one-liner that calls the new installer
   (idempotent; safe to run multiple times; matches existing pattern in this script).
3. `docs/proposals/hermes/issue-811-proposal.md` — this file.

### Explicitly NOT touched
- `docs/ECONOMIC_CANONICAL_CONFIG.json` — threshold 0.85 matches canonical intent.
  No value change requested by the issue body.
- `goalchain_oracle/src/mint_gate.ts:67` — 0.85 threshold stays.
- `goalchain_api/src/index.ts:458` (`OPS_VAULT_CRANK_STALE_HOURS=48`) — matches issue's
  "stale since 15-jun" framing (48h default).
- No `mode=live` flip — issue body forbids changing to live without explicit Nico sign-off.
- No `goalchain-economy-crank.service/timer` — this VPS uses openclaw cron, not systemd
  (matches `ops/hermes/distribution/SOUL.md` "Cron: alpha...via openclaw" pattern).

## Risks / regressions (R10)
- **Low**: openclaw cron adds a 4th job to a substrate that already runs
  `goalchain-morning-digest` + `goalchain-repo-sync`. Same scheduler, same isolation model.
- **Reversibility**: a single commit on `main` (proposal + 2 installer files).
  Rollback = disable the cron via `openclaw cron remove --name goalchain-economy-crank-dry`.
- **Dry-run only** means no on-chain state changes, no treasury movement, no mint gate effect.
- **Blast radius**: local file write to `docs/data/burn_tracker.json` + one log line in
  openclaw session log per run. Refreshes the API snapshot → flips `vault_crank.stale:false`
  within 6h (next cron tick).

## Test commands (R5 — executed once on this VPS)

```bash
# 1. Confirm the dry-run artifact refreshes after install + manual trigger
ls -la docs/data/burn_tracker.json
# Expected (post-fix): mtime updates after the next scheduled run.

# 2. Confirm the API flips vault_crank.stale=false after a fresh dry-run
curl -s "https://crm.goalchain.fun/goalchain-api/api/ops/status" \
  | python3 -c "import sys,json;d=json.load(sys.stdin)['vault_crank'];\
print('stale=',d['stale'],'ts=',d['timestamp_iso'],'mode=',d['mode'])"
# Expected: stale=False once fresh, mode still "dry-run".

# 3. Confirm threshold intent intact (no config drift)
curl -s "https://crm.goalchain.fun/goalchain-api/api/economy/health" \
  | python3 -c "import sys,json;d=json.load(sys.stdin)['thresholds'];\
print('min=',d['emit_burn_ratio_min'])"
# Expected: 0.85 (unchanged from canonical).

# 4. Openclaw cron job self-registers
openclaw cron list 2>/dev/null | grep -i 'goalchain-economy-crank-dry' \
  || echo '(CLI not in PATH; cron still registers via installer)'

# 5. Manual one-shot dry-run (no scheduler needed)
cd goalchain_oracle && npx ts-node src/vault_crank.ts
# (VAULT_CRANK_EXECUTE absent -> dry-run; rewrites docs/data/burn_tracker.json)
```

## Owner / Workflow
- Branch: `main` (per wrapper directive: DIRECT MAIN MODE ENABLED by `cambio urgente`).
- No draft PR.
- One implementer: Hermes CEO / FCC.
- Owner: hermes. Priority: P0.
