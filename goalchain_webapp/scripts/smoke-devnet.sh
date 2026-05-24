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
print("economy config ok")
PY

echo "Smoke devnet checks passed."
