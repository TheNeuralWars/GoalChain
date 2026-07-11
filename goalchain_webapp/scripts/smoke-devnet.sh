#!/usr/bin/env bash
# Smoke checks for devnet webapp integration (no wallet required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API_BASE="${GOALCHAIN_API_BASE:-http://localhost:3001}"
WEBAPP_DIR="$ROOT/goalchain_webapp"

echo "==> Build goalchain_webapp"
cd "$WEBAPP_DIR"
npm run build

echo "==> API ops status ($API_BASE/api/ops/status)"
ops_json="$(curl -sf "$API_BASE/api/ops/status")"
python3 - <<'PY' "$ops_json"
import json, sys
data = json.loads(sys.argv[1])
for key in ("mint_gate", "vault_crank", "contributor_epoch"):
    if key not in data:
        raise SystemExit(f"missing ops key: {key}")
print("ops status ok")
PY

echo "==> API economy config ($API_BASE/api/economy/config)"
cfg_json="$(curl -sf "$API_BASE/api/economy/config")"
python3 - <<'PY' "$cfg_json"
import json, sys
data = json.loads(sys.argv[1])
if "canonicalConfig" not in data and "canonical_config" not in data and "canonicalConfig" not in str(data):
    # tolerate either casing from API evolution
    pass
# Harden: verify config_version (issue #99)
if "config_version" not in data:
    raise SystemExit("missing config_version in /api/economy/config response")
if "drift" not in data:
    raise SystemExit("missing drift field in /api/economy/config response")
print(f"economy config ok — version={data.get('config_version','?')} drift={data.get('drift')}")
PY

echo "==> Webapp exports (claim + economy client)"
python3 - <<PY
import pathlib
root = pathlib.Path("${WEBAPP_DIR}/src")
client = (root / "lib/goalchainClient.ts").read_text()
for sym in ("claimFixturePayout", "fetchUserBets", "refundFixtureBet"):
    if sym not in client:
        raise SystemExit(f"missing {sym} in goalchainClient.ts")
economy = (root / "lib/economyClient.ts").read_text()
if "fetchEconomyConfig" not in economy:
    raise SystemExit("missing fetchEconomyConfig")
print("webapp client exports ok")
PY

echo "Smoke devnet checks passed."
echo "Manual E2E: wallet devnet -> /estadio -> place_bet -> oracle complete -> claim_bet_payout"
echo "Runbook: docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md"
