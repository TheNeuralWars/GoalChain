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
state_path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")

if alerts:
    print("GoalChain Alpha\n" + "\n".join(alerts))
PY
