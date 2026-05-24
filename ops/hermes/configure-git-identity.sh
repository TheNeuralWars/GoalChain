#!/usr/bin/env bash
# Apply git author identity for Hermes/FCC commits (repo + optional --global).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_FILE="${HERMES_HOME}/config.env"
GLOBAL="${CONFIGURE_GIT_GLOBAL:-false}"

if [[ -f "${CONFIG_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${CONFIG_FILE}"
fi

NAME="${GIT_AUTHOR_NAME:-Hermes}"
EMAIL="${GIT_AUTHOR_EMAIL:-hermes@goalchain.local}"
REPO="${GOALCHAIN_REPO_PATH:-${HERMES_HOME}/workspace/GoalChain}"

if [[ ! -d "${REPO}/.git" ]]; then
  echo "ERROR: not a git repo: ${REPO}"
  exit 1
fi

git -C "${REPO}" config user.name "${NAME}"
git -C "${REPO}" config user.email "${EMAIL}"

if [[ "${GLOBAL}" == "true" ]]; then
  git config --global user.name "${NAME}"
  git config --global user.email "${EMAIL}"
fi

echo "git identity for ${REPO}: ${NAME} <${EMAIL}>"
