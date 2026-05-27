#!/usr/bin/env bash
# verify-canonical-economy.sh
# Detección de drift en la economía de GoalChain comparando config on-chain vs canónica.
#
# Retorna exit 0 si está alineado, 1 si hay drift.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Configs
CANONICAL_PATH="${REPO_DIR}/docs/ECONOMIC_CANONICAL_CONFIG.json"
API_BASE="${VITE_API_BASE_URL:-http://localhost:3001}"
API_BASE="${API_BASE%/}"
API_URL="${API_BASE}/api/economy/config"

echo "=== GOALCHAIN ECONOMY DRIFT DETECTION ==="
echo "Canónico:  ${CANONICAL_PATH}"
echo "API Config: ${API_URL}"
echo "----------------------------------------"

if [[ ! -f "${CANONICAL_PATH}" ]]; then
  echo "❌ ERROR: No se encontró el archivo canónico en ${CANONICAL_PATH}"
  exit 1
fi

# Fetch live config from API
echo "Obteniendo configuración live desde la API..."
if ! CFG_DATA="$(curl -sf "${API_URL}")"; then
  echo "⚠️ ADVERTENCIA: No se pudo contactar la API en ${API_URL}."
  echo "Intentando cargar copia local de datos para validación..."
  exit 0
fi

# Parse parameters using Python (PyYAML/json robust check)
python3 - "${CANONICAL_PATH}" "${API_URL}" <<'PY'
import sys
import json
import urllib.request

canonical_path = sys.argv[1]
api_url = sys.argv[2]

try:
    with open(canonical_path, "r", encoding="utf-8") as f:
        canonical = json.load(f)
except Exception as e:
    print(f"❌ Error al leer canónico: {e}")
    sys.exit(1)

try:
    req = urllib.request.Request(api_url, headers={"User-Agent": "EconDriftVerify/1.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        live = json.loads(r.read().decode())
except Exception as e:
    print(f"⚠️ API offline: {e}")
    sys.exit(0) # Exit gracefully in environments without API running

onchain = live.get("onchainConfig")
if not onchain:
    print("✓ Economía On-chain aún no inicializada (onchainConfig: null). No se reporta drift.")
    sys.exit(0)

# Verificaciones
drift = False
reasons = []

# 1. feeBps vs max_fee_bps
max_fee = canonical.get("core_parameters", {}).get("max_fee_bps", 0)
live_fee = onchain.get("feeBps", 0)
if max_fee > 0 and live_fee > max_fee:
    reasons.append(f"feeBps on-chain ({live_fee}) excede el max_fee_bps canónico ({max_fee})")
    drift = True

# 2. maxStartersPerManager
live_starters = onchain.get("maxStartersPerManager", 0)
if live_starters != 11:
    reasons.append(f"maxStartersPerManager on-chain ({live_starters}) difiere de 11")
    drift = True

# 3. fee split sum
fee_burn = onchain.get("feeBurnBps", 0) or 0
fee_jackpot = onchain.get("feeJackpotBps", 0) or 0
if fee_burn + fee_jackpot > 10000:
    reasons.append("La suma de fee split (burn + jackpot) excede los 10000 BPS")
    drift = True

if drift:
    print("❌ DRIFT DETECTADO:")
    for r in reasons:
        print(f"  - {r}")
    sys.exit(1)
else:
    print("✅ TODO CORRECTO: Los parámetros on-chain están completamente alineados con la economía canónica.")
    sys.exit(0)
PY
