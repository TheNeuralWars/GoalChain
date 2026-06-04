#!/usr/bin/env bash
# Copy Hermes CEO prompts into the hermes-ceo profile workspace (VPS/Mac).
# Run after editing hermes/agents/hermes-ceo/*.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PROFILE="${HERMES_CEO_PROFILE:-hermes-ceo}"
AGENT_HOME="${HERMES_AGENT_HOME:-$HOME/.hermes}"
SRC="${REPO_ROOT}/hermes/agents/hermes-ceo"
DEST="${AGENT_HOME}/profiles/${PROFILE}/workspace"

if [[ ! -d "${SRC}" ]]; then
  echo "ERROR: missing ${SRC}" >&2
  exit 1
fi

mkdir -p "${DEST}"
for f in prompt.md intake-prompt.md; do
  if [[ -f "${SRC}/${f}" ]]; then
    cp "${SRC}/${f}" "${DEST}/${f}"
    echo "installed: ${DEST}/${f}"
  fi
done

echo "CEO profile workspace updated (${PROFILE}). Restart Hermes gateway if running."
