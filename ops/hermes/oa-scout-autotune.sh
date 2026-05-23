#!/usr/bin/env bash
# Auto-tune OA scout threshold based on recent report quality/throughput.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG="${HERMES_HOME}/config.env"
METRICS_JSON="${HERMES_HOME}/oa/state/scout-metrics.json"
METRICS_MD="${HERMES_HOME}/oa/state/scout-metrics.md"
APPLY=0
if [[ "${1:-}" == "--apply" ]]; then
  APPLY=1
fi

mkdir -p "${HERMES_HOME}/oa/state"

python3 "${HERMES_HOME}/scripts/oa-scout-metrics.py" \
  --hours "${OA_SCOUT_METRICS_WINDOW_HOURS:-48}" \
  --json \
  --output "${METRICS_JSON}" >/tmp/oa-scout-metrics.jsonline
python3 "${HERMES_HOME}/scripts/oa-scout-metrics.py" \
  --hours "${OA_SCOUT_METRICS_WINDOW_HOURS:-48}" \
  --output "${METRICS_MD}" >/tmp/oa-scout-metrics.txt

if [[ ! -f "${CONFIG}" ]]; then
  echo "missing config: ${CONFIG}"
  exit 1
fi

# shellcheck disable=SC1090
source "${CONFIG}"
CURRENT_MIN="${OA_SCOUT_SCORE_MIN:-28}"
MIN_BOUND="${OA_SCOUT_SCORE_MIN_FLOOR:-24}"
MAX_BOUND="${OA_SCOUT_SCORE_MIN_CEIL:-34}"

read -r REPORTS AVG_CAND HQ_RATE < <(
  python3 - <<PY
import json
from pathlib import Path
p=Path("${METRICS_JSON}")
data=json.loads(p.read_text()) if p.exists() else {"metrics":{}}
m=data.get("metrics",{})
print(int(m.get("reports",0)), float(m.get("avg_candidates_per_report",0.0)), float(m.get("high_quality_rate",0.0)))
PY
)

NEW_MIN="${CURRENT_MIN}"
REASON="no_change"

if (( REPORTS < 2 )); then
  REASON="insufficient_data"
else
  # Too few ideas => lower threshold to increase discovery.
  if python3 - <<PY
avg=${AVG_CAND}
import sys
sys.exit(0 if avg < 2.0 else 1)
PY
  then
    NEW_MIN=$(( CURRENT_MIN - 2 ))
    REASON="low_throughput"
  # Too many low-quality ideas => tighten threshold.
  elif python3 - <<PY
avg=${AVG_CAND}
hq=${HQ_RATE}
import sys
sys.exit(0 if (avg > 4.0 and hq < 0.45) else 1)
PY
  then
    NEW_MIN=$(( CURRENT_MIN + 1 ))
    REASON="noisy_low_quality"
  fi
fi

if (( NEW_MIN < MIN_BOUND )); then NEW_MIN="${MIN_BOUND}"; fi
if (( NEW_MIN > MAX_BOUND )); then NEW_MIN="${MAX_BOUND}"; fi

echo "scout_autotune reports=${REPORTS} avg_candidates=${AVG_CAND} hq_rate=${HQ_RATE} current=${CURRENT_MIN} new=${NEW_MIN} reason=${REASON}"

if (( APPLY == 0 )); then
  exit 0
fi

if [[ "${NEW_MIN}" != "${CURRENT_MIN}" ]]; then
  python3 - <<PY
from pathlib import Path
p=Path("${CONFIG}")
lines=p.read_text(errors="ignore").splitlines()
out=[]
done=False
for ln in lines:
    if ln.startswith("OA_SCOUT_SCORE_MIN="):
        out.append(f"OA_SCOUT_SCORE_MIN=${NEW_MIN}")
        done=True
    else:
        out.append(ln)
if not done:
    out.append(f"OA_SCOUT_SCORE_MIN=${NEW_MIN}")
p.write_text("\\n".join(out).rstrip()+"\\n")
print("updated OA_SCOUT_SCORE_MIN")
PY
fi

set -a
source "${CONFIG}"
set +a
bash "${HERMES_HOME}/scripts/optimize-openclaw-scout.sh" >/tmp/oa-scout-optimize.log 2>&1 || true

# Optional notification to the research channel.
export OA_TUNE_REPORTS="${REPORTS}"
export OA_TUNE_AVG_CAND="${AVG_CAND}"
export OA_TUNE_HQ_RATE="${HQ_RATE}"
export OA_TUNE_CURRENT_MIN="${CURRENT_MIN}"
export OA_TUNE_NEW_MIN="${NEW_MIN}"
export OA_TUNE_REASON="${REASON}"
python3 - <<PY
import json, os, requests
msg=(
    "📈 OA Scout autotune: "
    f"reports={os.getenv('OA_TUNE_REPORTS')}, "
    f"avg_candidates={os.getenv('OA_TUNE_AVG_CAND')}, "
    f"hq_rate={os.getenv('OA_TUNE_HQ_RATE')}, "
    f"threshold {os.getenv('OA_TUNE_CURRENT_MIN')}->{os.getenv('OA_TUNE_NEW_MIN')} "
    f"({os.getenv('OA_TUNE_REASON')})."
)
webhook=os.getenv("DISCORD_RESEARCH_WEBHOOK_URL","").strip()
token=os.getenv("DISCORD_TOKEN","").strip()
channel=os.getenv("DISCORD_RESEARCH_CHANNEL_ID","").strip()
headers={"Content-Type":"application/json","User-Agent":"GoalChainOA/1.0"}
if webhook:
    requests.post(webhook, headers=headers, json={"content":msg}, timeout=20)
elif token and channel:
    requests.post(f"https://discord.com/api/v10/channels/{channel}/messages",
                  headers={**headers, "Authorization": f"Bot {token}"},
                  json={"content":msg}, timeout=20)
PY
