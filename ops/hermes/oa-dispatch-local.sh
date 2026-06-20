#!/usr/bin/env bash
# Queue a task for local Mac bridge execution.
set -euo pipefail

OWNER="${1:-}"
if [[ -z "${OWNER}" ]]; then
  echo "Usage: $0 <cursor|antigravity|hermes>"
  exit 1
fi

case "${OWNER}" in
  cursor|antigravity|hermes) ;;
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

ensure_dispatch_labels() {
  gh label create "dispatch:local-queued" --repo "${GITHUB_REPO}" --color "1d76db" --description "Queued for local bridge runner" >/dev/null 2>&1 || true
  gh label create "dispatch:local-running" --repo "${GITHUB_REPO}" --color "fbca04" --description "Running on local bridge" >/dev/null 2>&1 || true
  gh label create "dispatch:local-done" --repo "${GITHUB_REPO}" --color "0e8a16" --description "Local bridge completed" >/dev/null 2>&1 || true
  gh label create "dispatch:local-blocked" --repo "${GITHUB_REPO}" --color "b60205" --description "Local bridge failed" >/dev/null 2>&1 || true
  gh label create "status:in_progress" --repo "${GITHUB_REPO}" --color "fbca04" --description "Task is running" >/dev/null 2>&1 || true
}

issue_has_label() {
  local issue_number="$1"
  local label="$2"
  gh issue view "${issue_number}" --repo "${GITHUB_REPO}" --json labels \
    --jq ".labels[]?.name" 2>/dev/null | grep -Fxq "${label}"
}

ensure_dispatch_labels

if issue_has_label "${ISSUE_NUMBER}" "dispatch:local-running"; then
  echo "skip_already_running issue=${ISSUE_NUMBER}"
  exit 0
fi
if issue_has_label "${ISSUE_NUMBER}" "dispatch:local-queued"; then
  echo "skip_already_queued issue=${ISSUE_NUMBER}"
  exit 0
fi
if issue_has_label "${ISSUE_NUMBER}" "dispatch:local-done"; then
  echo "skip_already_done issue=${ISSUE_NUMBER}"
  exit 0
fi

gh issue edit --repo "${GITHUB_REPO}" "${ISSUE_NUMBER}" \
  --remove-label "dispatch:local-blocked" \
  --remove-label "status:blocked" \
  --remove-label "status:ready" \
  --add-label "dispatch:local-queued" \
  --add-label "status:in_progress" >/dev/null 2>&1 || true

gh issue comment --repo "${GITHUB_REPO}" "${ISSUE_NUMBER}" --body \
  "Task queued for **local bridge** owner \`${OWNER}\`.\n\nIssue: ${ISSUE_URL}\nTitle: ${TITLE}" >/dev/null 2>&1 || true

echo "queued_local_issue=${ISSUE_NUMBER} owner=${OWNER}"
