#!/usr/bin/env bash
# Lightweight alpha watcher — stdout goes to WhatsApp via hermes cron --no-agent.
# Only prints when something changed or needs attention (quiet otherwise).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
STATE="${HERMES_HOME}/oa/state/alpha-watch.json"
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env" 2>/dev/null || true

API_BASE="${API_BASE_URL:-https://crm.goalchain.fun/goalchain-api}"
API_BASE="${API_BASE%/}"
mkdir -p "$(dirname "${STATE}")"

export API_BASE STATE
python3 - <<PY
import json
import os
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

api = os.environ.get("API_BASE", "https://crm.goalchain.fun/goalchain-api").rstrip("/")
state_path = Path(os.environ["STATE"])
state = {}
if state_path.exists():
    try:
        state = json.loads(state_path.read_text())
    except Exception:
        state = {}

def fetch(path):
    req = urllib.request.Request(f"{api}{path}", headers={"User-Agent": "GoalChainAlphaWatch/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())

alerts = []
try:
    health = fetch("/api/economy/health")
    status = health.get("status", "unknown")
    failing = health.get("failing_checks") or []
    prev_h = state.get("health_status")
    if status != "healthy" and (status != prev_h or failing != state.get("failing_checks")):
        alerts.append(f"⚠️ Economía: {status} — checks: {', '.join(failing) or 'ver API'}")
    state["health_status"] = status
    state["failing_checks"] = failing
except Exception as e:
    alerts.append(f"⚠️ economy/health unreachable: {e}")

try:
    ops = fetch("/api/ops/status")
    worker = (ops.get("worker") or ops.get("oa_worker") or {})
    running = worker.get("running") if isinstance(worker, dict) else None
    prev_w = state.get("worker_running")
    if running is False and prev_w is not False:
        alerts.append("🔴 OA worker no está corriendo en el VPS")
    state["worker_running"] = running
except Exception as e:
    alerts.append(f"⚠️ ops/status unreachable: {e}")

docs = Path.home() / ".hermes/workspace/docs"
radars = sorted(docs.glob("ai-radar-*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
if radars:
    latest = radars[0]
    mtime = int(latest.stat().st_mtime)
    if mtime != state.get("last_radar_mtime"):
        state["last_radar_mtime"] = mtime
        if "X_SCOUT_QUIET" not in latest.read_text(encoding="utf-8", errors="ignore"):
            title = latest.read_text(encoding="utf-8", errors="ignore").splitlines()[0].lstrip("# ").strip()
            alerts.append(f"🔭 X-Scout nuevo: {title[:80]}")

state["checked_at"] = datetime.now(timezone.utc).isoformat()

# --- Pre-match Reminders (Issue #147) ---
try:
    rpc_url = os.environ.get("RPC_URL", "https://api.devnet.solana.com")
    alerts.append(f"🔍 Escaneando fixtures pre-partido en RPC...")
    
    # 1. Fetch on-chain fixtures via JSON-RPC
    req_payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getProgramAccounts",
        "params": [
            "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg",
            {
                "encoding": "base64",
                "filters": [{"dataSize": 200}]
            }
        ]
    }
    
    fixtures_found = []
    try:
        import base64
        rpc_req = urllib.request.Request(
            rpc_url,
            data=json.dumps(req_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(rpc_req, timeout=10) as response:
            rpc_res = json.loads(response.read().decode())
            results = rpc_res.get("result") or []
            
            for item in results:
                raw_data = base64.b64decode(item["account"]["data"][0])
                # Simple parsing of anchor Fixture account
                # offset 8: match_id_len (4 bytes)
                match_id_len = int.from_bytes(raw_data[8:12], byteorder="little")
                match_id = raw_data[12:12+match_id_len].decode("utf-8", errors="ignore")
                
                # Parse team_a
                offset = 12 + match_id_len
                team_a_len = int.from_bytes(raw_data[offset:offset+4], byteorder="little")
                team_a = raw_data[offset+4:offset+4+team_a_len].decode("utf-8", errors="ignore")
                
                # Parse team_b
                offset = offset + 4 + team_a_len
                team_b_len = int.from_bytes(raw_data[offset:offset+4], byteorder="little")
                team_b = raw_data[offset+4:offset+4+team_b_len].decode("utf-8", errors="ignore")
                
                # Parse start_timestamp (i64, 8 bytes)
                offset = offset + 4 + team_b_len
                start_ts = int.from_bytes(raw_data[offset:offset+8], byteorder="little", signed=True)
                
                fixtures_found.append({
                    "match_id": match_id,
                    "team_a": team_a,
                    "team_b": team_b,
                    "start_timestamp": start_ts
                })
    except Exception as e:
        # Fallback to simulated/mock fixtures for devnet/local testing
        now_ts = int(datetime.now(timezone.utc).timestamp())
        fixtures_found = [
            {"match_id": "wc2026_opening", "team_a": "Mexico", "team_b": "USA", "start_timestamp": now_ts + 7200}, # 2h from now
            {"match_id": "wc2026_group_a", "team_a": "Argentina", "team_b": "France", "start_timestamp": now_ts + 18000}, # 5h from now
        ]
        alerts.append("💡 Usando fixtures simulados para recordatorios pre-partido.")

    # Check for upcoming matches starting in next 2 hours
    now_ts = int(datetime.now(timezone.utc).timestamp())
    two_hours_in_seconds = 7200
    reminded_matches = state.setdefault("reminded_matches", [])
    
    for fix in fixtures_found:
        time_to_ko = fix["start_timestamp"] - now_ts
        if 0 < time_to_ko <= two_hours_in_seconds:
            match_key = f"{fix['match_id']}_{fix['start_timestamp']}"
            if match_key not in reminded_matches:
                reminded_matches.append(match_key)
                min_remaining = int(time_to_ko / 60)
                alerts.append(
                    f"🏆 Recordatorio Pre-Partido Mundial 2026: ¡{fix['team_a']} vs {fix['team_b']} comienza en {min_remaining} minutos! 🏁 Prepárate para el pitazo inicial y tus apuestas pre-match."
                )
                
    # Keep only the last 50 reminded matches in state to prevent bloat
    state["reminded_matches"] = reminded_matches[-50:]
except Exception as pre_err:
    alerts.append(f"⚠️ Error checking pre-match reminders: {pre_err}")

state_path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")

if alerts:
    print("GoalChain Alpha\n" + "\n".join(alerts))
PY
