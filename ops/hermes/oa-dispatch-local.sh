#!/usr/bin/env bash
# Queue a task for local Mac bridge execution.
set -euo pipefail

OWNER="${1:-}"
if [[ -z "${OWNER}" ]]; then
  echo "Usage: $0 <cursor|antigravity|opencode>"
  exit 1
fi

case "${OWNER}" in
  cursor|antigravity|opencode) ;;
  *)
    echo "ERROR: invalid owner '${OWNER}'"
    exit 1
    ;;
esac

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_FILE="${HERMES_HOME}/config.env"

if [[ -f "${CONFIG_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${CONFIG_FILE}"
fi

GITHUB_REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"
ISSUE_NUMBER="${OA_TASK_ISSUE_NUMBER:-}"
ISSUE_URL="${OA_TASK_ISSUE_URL:-}"
TITLE="${OA_TASK_TITLE:-}"

if [[ -z "${ISSUE_NUMBER}" ]]; then
  echo "ERROR: OA_TASK_ISSUE_NUMBER is required"
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not found"
  exit 1
fi

gh label create "dispatch:local-queued" --repo "${GITHUB_REPO}" --color "1d76db" --description "Queued for local bridge runner" >/dev/null 2>&1 || true
gh label create "dispatch:local-running" --repo "${GITHUB_REPO}" --color "fbca04" --description "Running on local bridge" >/dev/null 2>&1 || true

gh issue edit --repo "${GITHUB_REPO}" "${ISSUE_NUMBER}" --add-label "dispatch:local-queued" >/dev/null 2>&1 || true
gh issue comment --repo "${GITHUB_REPO}" "${ISSUE_NUMBER}" --body \
  "Task queued for **local bridge** owner \`${OWNER}\`.\n\nIssue: ${ISSUE_URL}\nTitle: ${TITLE}" >/dev/null 2>&1 || true

echo "queued_local_issue=${ISSUE_NUMBER} owner=${OWNER}"
