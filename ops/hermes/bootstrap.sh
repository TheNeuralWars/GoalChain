#!/usr/bin/env bash
# Bootstrap Hermes workspace: ~/hermes + clone GoalChain + config.env
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
REPO_URL="${REPO_URL:-https://github.com/TheNeuralWars/GoalChain.git}"
WORKSPACE="${HERMES_HOME}/workspace/GoalChain"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Hermes home: ${HERMES_HOME}"

mkdir -p "${HERMES_HOME}/logs"
mkdir -p "${HERMES_HOME}/memory/goalchain/daily"
mkdir -p "${HERMES_HOME}/memory/goalchain/decisions"
mkdir -p "${HERMES_HOME}/workspace"

if [[ -d "${WORKSPACE}/.git" ]]; then
  echo "==> Repo already cloned at ${WORKSPACE}"
  git -C "${WORKSPACE}" fetch origin
  git -C "${WORKSPACE}" status -sb | head -3
else
  echo "==> Cloning ${REPO_URL} -> ${WORKSPACE}"
  git clone "${REPO_URL}" "${WORKSPACE}"
fi

if [[ ! -f "${HERMES_HOME}/config.env" ]]; then
  echo "==> Creating ${HERMES_HOME}/config.env from example"
  cp "${SCRIPT_DIR}/config.env.example" "${HERMES_HOME}/config.env"
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "s|\${HOME}|${HOME}|g" "${HERMES_HOME}/config.env"
  else
    sed -i "s|\${HOME}|${HOME}|g" "${HERMES_HOME}/config.env"
  fi
else
  echo "==> config.env already exists (unchanged): ${HERMES_HOME}/config.env"
fi

# shellcheck disable=SC1090
set -a
source "${HERMES_HOME}/config.env"
set +a

if [[ ! -d "${GOALCHAIN_REPO_PATH}" ]]; then
  echo "ERROR: GOALCHAIN_REPO_PATH does not exist: ${GOALCHAIN_REPO_PATH}" >&2
  exit 1
fi

echo "==> Git remote:"
git -C "${GOALCHAIN_REPO_PATH}" remote -v | head -1

if command -v gh >/dev/null 2>&1; then
  echo "==> GitHub CLI:"
  gh auth status 2>&1 | head -3 || true
else
  echo "WARN: gh not installed — install for issue/PR automation"
fi

echo ""
echo "Done. Next: bash ${SCRIPT_DIR}/install-hermes-server.sh"
