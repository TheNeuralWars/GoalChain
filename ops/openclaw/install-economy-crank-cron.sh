#!/usr/bin/env bash
# Register an openclaw cron job that periodically refreshes docs/data/burn_tracker.json
# by running `goalchain_oracle` in DRY-RUN mode. Schedules vault_crank so that the
# `vault_crank.stale` flag in the ops API flips false within the staleness window.
#
# Issue #811: vault_crank stale since 2026-06-15. Root cause = no scheduled runner
# existed anywhere on the VPS (no systemd timer, no cron entry). Adding openclaw cron
# matches the existing pattern in ops/openclaw/install-cron.sh (morning digest + repo sync).
#
# SCOPE: dry-run only. `VAULT_CRANK_EXECUTE` is intentionally NOT set. Switching to
# live mode requires explicit Nico sign-off per the issue body.

set -euo pipefail

if ! command -v openclaw >/dev/null 2>&1; then
  echo "ERROR: openclaw CLI not found in PATH. Install OpenClaw first or run manually."
  exit 1
fi

# Resolve repo root relative to this script (ops/opencloak -> repo root is two levels up).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ORACLE_DIR="${REPO_ROOT}/goalchain_oracle"

# Prefer compiled artifact (already on disk), fall back to ts-node.
DRY_RUN_CMD="(test -f '${ORACLE_DIR}/dist/vault_crank.js' && node '${ORACLE_DIR}/dist/vault_crank.js') || (cd '${ORACLE_DIR}' && npx ts-node src/vault_crank.ts)"

openclaw cron add \
  --name "goalchain-economy-crank-dry" \
  --cron "0 */6 * * *" \
  --session isolated \
  --message "GoalChain vault_crank dry-run (issue #811). Run: cd '${ORACLE_ROOT:-${ORACLE_DIR}}' && unset VAULT_CRANK_EXECUTE && (node dist/vault_crank.js || npx ts-node src/vault_crank.ts). Writes docs/data/burn_tracker.json. DO NOT export VAULT_CRANK_EXECUTE=1 (live mode requires Nico approval). Append one-liner to ~/.openclaw/workspace/memory/vault_crank-\$(date -u +%Y%m%d-%H).log." \
  --description "Periodic devnet dry-run of goalchain_oracle/vault_crank so ops-status.vault_crank.stale flips false. Issues: #811." \
  2>/dev/null || echo "WARN: goalchain-economy-crank-dry job may already exist"

openclaw cron list | grep -E 'goalchain-(economy-crank-dry|morning-digest|repo-sync)' || true
echo "Done. Next dry-run tick will refresh docs/data/burn_tracker.json."
