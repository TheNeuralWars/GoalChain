#!/usr/bin/env bash
# Hermes: run LangGraph and print the ONLY text allowed in Discord/WhatsApp.
# Usage: bash ops/hermes/empresa.sh "estado cola FCC y demo Mundial"
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "${DIR}/call-langgraph.sh" --reply "$@"
