#!/usr/bin/env bash
# Copy GoalChain OpenClaw workspace templates into ~/.openclaw/workspace
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="${SCRIPT_DIR}/workspace-templates"
TARGET="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"

mkdir -p "${TARGET}"

for f in "${TEMPLATE_DIR}"/*.md; do
  [[ -f "${f}" ]] || continue
  dest="${TARGET}/$(basename "${f}")"
  if [[ -f "${dest}" ]]; then
    echo "skip (exists): ${dest}"
  else
    cp "${f}" "${dest}"
    echo "installed: ${dest}"
  fi
done

echo "OpenClaw workspace ready at ${TARGET}"
