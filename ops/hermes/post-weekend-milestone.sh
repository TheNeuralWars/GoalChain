#!/usr/bin/env bash
set -euo pipefail
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
set -a
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env"
set +a
exec python3 "${HERMES_HOME}/scripts/post-weekend-milestone.py"
