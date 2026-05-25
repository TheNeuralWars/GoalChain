#!/usr/bin/env bash
# Map task priority (or labels) → Claude Code tier alias (opus|sonnet|haiku).
# FCC proxy resolves tiers to MODEL_OPUS / MODEL_SONNET / MODEL_HAIKU in ~/.fcc/.env.
set -euo pipefail

# Usage: fcc-resolve-tier.sh [--priority P0|P1|P2] [--labels "a,b,c"] [--text "title body"]
PRIORITY=""
LABELS=""
TEXT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --priority) PRIORITY="$(printf '%s' "$2" | tr '[:lower:]' '[:upper:]')"; shift 2 ;;
    --labels) LABELS="$2"; shift 2 ;;
    --text) TEXT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

tier="sonnet"

if [[ "${PRIORITY}" == "P0" ]] || echo ",${LABELS}," | grep -q ',priority:P0,'; then
  tier="opus"
elif [[ "${PRIORITY}" == "P2" ]] || echo ",${LABELS}," | grep -q ',priority:P2,'; then
  tier="haiku"
fi

# Optional explicit override label from Manager: fcc-tier:opus
for want in opus sonnet haiku; do
  if echo ",${LABELS}," | grep -qi ",fcc-tier:${want},"; then
    tier="${want}"
  fi
done

# Heavy keywords bump to opus (Manager need not name models)
if echo "${TEXT}" | grep -qiE '\b(refactor|architecture|migrate|tokenomics|on-?chain|economy|security audit)\b'; then
  tier="opus"
fi

# Tiny fixes stay on haiku unless already opus
if [[ "${tier}" != "opus" ]] && echo "${TEXT}" | grep -qiE '\b(typo|copy|label|css|one-?liner|rename|comment only)\b'; then
  tier="haiku"
fi

printf '%s' "${tier}"
