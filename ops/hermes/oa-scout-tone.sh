#!/usr/bin/env bash
# Set OA scout tone and re-apply scout cron config.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG="${HERMES_HOME}/config.env"
TONE="${1:-balanced}"

case "${TONE}" in
  influencer|technical|balanced) ;;
  *)
    echo "Usage: $0 {influencer|technical|balanced}"
    exit 1
    ;;
esac

python3 - <<PY
from pathlib import Path
p=Path("${CONFIG}")
lines=p.read_text(errors="ignore").splitlines() if p.exists() else []
out=[]
done=False
for ln in lines:
    if ln.startswith("OA_SCOUT_TONE="):
        out.append("OA_SCOUT_TONE=${TONE}")
        done=True
    else:
        out.append(ln)
if not done:
    out.append("OA_SCOUT_TONE=${TONE}")
p.write_text("\\n".join(out).rstrip()+"\\n")
print("updated OA_SCOUT_TONE=${TONE}")
PY

set -a
source "${CONFIG}"
set +a
bash "${HERMES_HOME}/scripts/optimize-openclaw-scout.sh" >/tmp/oa-scout-tone-optimize.log 2>&1 || true
echo "Tone set to ${TONE} and scout jobs reapplied."
