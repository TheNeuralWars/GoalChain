#!/usr/bin/env bash
# Deploy GoalChain Hermes Manager workspace files into ~/.hermes/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="${SCRIPT_DIR}/workspace-templates"
TARGET="${HERMES_AGENT_HOME:-$HOME/.hermes}"
UPDATE="false"

for arg in "$@"; do
  case "${arg}" in
    --update) UPDATE="true" ;;
  esac
done

mkdir -p "${TARGET}/workspace/docs" "${TARGET}/workspace/memory"

for f in "${TEMPLATE_DIR}"/*.md; do
  [[ -f "${f}" ]] || continue
  dest="${TARGET}/$(basename "${f}")"
  if [[ -f "${dest}" && "${UPDATE}" != "true" ]]; then
    echo "skip (exists): ${dest}"
  else
    cp "${f}" "${dest}"
    echo "installed: ${dest}"
  fi
done

REPO_LINK="${TARGET}/workspace/GoalChain"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
REPO_SRC="${GOALCHAIN_REPO_PATH:-${HERMES_HOME}/workspace/GoalChain}"
if [[ ! -e "${REPO_LINK}" && -d "${REPO_SRC}" ]]; then
  ln -sfn "${REPO_SRC}" "${REPO_LINK}"
  echo "symlink: ${REPO_LINK} -> ${REPO_SRC}"
fi

echo "Hermes workspace ready at ${TARGET}"
