#!/usr/bin/env bash
# Universal wait-mode runner for cursor/antigravity/grok/opencode tasks.
set -euo pipefail

OWNER="${1:-}"
if [[ -z "${OWNER}" ]]; then
  echo "Usage: $0 <cursor|antigravity|grok|opencode>"
  exit 1
fi

case "${OWNER}" in
  cursor|antigravity|grok|opencode) ;;
  *)
    echo "ERROR: invalid owner '${OWNER}'"
    exit 1
    ;;
esac

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
CONFIG_FILE="${HERMES_HOME}/config.env"
LOG_DIR="${HERMES_HOME}/oa/logs"
mkdir -p "${LOG_DIR}"

if [[ -f "${CONFIG_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${CONFIG_FILE}"
fi

if ! command -v opencode >/dev/null 2>&1; then
  echo "ERROR: opencode CLI not found in PATH"
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not found in PATH"
  exit 1
fi

REPO="${OA_TASK_REPO:-${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}}"
ISSUE_NUMBER="${OA_TASK_ISSUE_NUMBER:-}"
ISSUE_URL="${OA_TASK_ISSUE_URL:-}"
TASK_TITLE="${OA_TASK_TITLE:-}"
TASK_OBJECTIVE="${OA_TASK_OBJECTIVE:-}"
MODEL="${OA_MODEL:-xai/grok-4.3}"
OA_CODE_MODEL="opencode/nemotron-3-ultra-free"
RUN_CODE="${HERMES_HOME}/scripts/oa-run-code.sh"
GITHUB_REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"
RUN_LOG="${LOG_DIR}/runner-${OWNER}-issue-${ISSUE_NUMBER:-unknown}.log"

if [[ -z "${ISSUE_NUMBER}" || -z "${TASK_OBJECTIVE}" ]]; then
  echo "ERROR: missing OA_TASK_ISSUE_NUMBER or OA_TASK_OBJECTIVE env vars"
  exit 1
fi
if [[ ! -d "${REPO}/.git" ]]; then
  echo "ERROR: repo path not found: ${REPO}"
  exit 1
fi

is_urgent() {
  local text="${1:-}"
  text="$(printf '%s' "${text}" | tr '[:upper:]' '[:lower:]')"
  [[ "${text}" == *"cambio urgente"* ]] || [[ "${text}" == *"policy:direct-main"* ]]
}

OWNER_STYLE=""
case "${OWNER}" in
  cursor)
    OWNER_STYLE="Act as Cursor integration engineer: conservative, test-first, minimal diff."
    ;;
  antigravity)
    OWNER_STYLE="Act as Antigravity spike engineer: creative but bounded scope, avoid unrelated edits."
    ;;
  grok)
    OWNER_STYLE="Act as Grok reviewer-implementer: emphasize risk notes and rollback clarity."
    ;;
  opencode)
    OWNER_STYLE="Act as OpenCode autonomous implementer: execute directly with concise, safe steps."
    ;;
esac

URGENT_MODE="0"
if is_urgent "${TASK_TITLE}
${TASK_OBJECTIVE}"; then
  URGENT_MODE="1"
fi

git -C "${REPO}" fetch origin -q || true
git -C "${REPO}" checkout main >/dev/null 2>&1 || true
git -C "${REPO}" pull --ff-only origin main >/dev/null 2>&1 || true

if [[ "${URGENT_MODE}" == "1" ]]; then
  TARGET_BRANCH="main"
else
  TARGET_BRANCH="exp/${OWNER}-auto-issue-${ISSUE_NUMBER}"
  git -C "${REPO}" checkout -B "${TARGET_BRANCH}" >/dev/null 2>&1 || true
fi

PROMPT=$(cat <<EOF
You are GoalChain autonomous task runner for owner '${OWNER}'.
${OWNER_STYLE}

Task source: GitHub issue #${ISSUE_NUMBER}
Title: ${TASK_TITLE}
Objective:
${TASK_OBJECTIVE}

Rules:
- Read and follow:
  - ai_context/META_CHARTER.md
  - .cursor/rules/meta-principal.mdc
  - ai_context/AGENT_ORCHESTRATION.md
- Keep scope tight to the objective.
- Do not touch secrets.
- Run relevant local checks before finishing.
- Summarize what changed, tests run, and residual risks.
EOF
)

if [[ "${URGENT_MODE}" == "1" ]]; then
  PROMPT="${PROMPT}

Emergency policy active: cambio urgente.
Work directly on main and push directly to origin/main."
else
  PROMPT="${PROMPT}

Create changes on branch ${TARGET_BRANCH}. Do not push to main."
fi

{
  echo "[$(date -u '+%F %T UTC')] owner=${OWNER} issue=${ISSUE_NUMBER} urgent=${URGENT_MODE}"
  prompt_file="/tmp/oa-runner-prompt-${ISSUE_NUMBER}.txt"
  printf '%s\n' "${PROMPT}" > "${prompt_file}"
  if [[ "${OWNER}" == "opencode" && -x "${RUN_CODE}" ]]; then
    bash "${RUN_CODE}" --workdir "${REPO}" --prompt-file "${prompt_file}" --log "${RUN_LOG}"
  elif [[ "${OWNER}" == "opencode" ]]; then
    timeout 3600 opencode run --model "${OA_CODE_MODEL}" "$(cat "${prompt_file}")"
  else
    timeout 3600 opencode run --model "${MODEL}" "$(cat "${prompt_file}")"
  fi
} >> "${RUN_LOG}" 2>&1 || true

if [[ -z "$(git -C "${REPO}" status --porcelain)" ]]; then
  gh issue comment --repo "${GITHUB_REPO}" "${ISSUE_NUMBER}" \
    --body "Auto-runner (${OWNER}) finished with no file changes. Log: \`${RUN_LOG}\`" >/dev/null 2>&1 || true
  exit 0
fi

git -C "${REPO}" add -A
git -C "${REPO}" commit -m "auto(${OWNER}): issue #${ISSUE_NUMBER} hands-free execution" >/dev/null 2>&1 || true

if [[ "${URGENT_MODE}" == "1" ]]; then
  git -C "${REPO}" push origin main >/dev/null 2>&1 || true
  gh issue comment --repo "${GITHUB_REPO}" "${ISSUE_NUMBER}" \
    --body "Hands-free runner (${OWNER}) executed in **direct-main mode** due to \`cambio urgente\`. Changes pushed to \`main\`." >/dev/null 2>&1 || true
  exit 0
fi

git -C "${REPO}" push -u origin "${TARGET_BRANCH}" >/dev/null 2>&1 || true

PR_URL="$(gh pr list --repo "${GITHUB_REPO}" --head "${TARGET_BRANCH}" --state open --json url --jq '.[0].url' 2>/dev/null || true)"
if [[ -z "${PR_URL}" || "${PR_URL}" == "null" ]]; then
  gh pr create --repo "${GITHUB_REPO}" --base main --head "${TARGET_BRANCH}" --draft \
    --title "auto(${OWNER}): issue #${ISSUE_NUMBER} — ${TASK_TITLE}" \
    --body "Hands-free execution from webhook command.\n\nIssue: ${ISSUE_URL}" >/dev/null 2>&1 || true
  PR_URL="$(gh pr list --repo "${GITHUB_REPO}" --head "${TARGET_BRANCH}" --state open --json url --jq '.[0].url' 2>/dev/null || true)"
fi

gh issue comment --repo "${GITHUB_REPO}" "${ISSUE_NUMBER}" \
  --body "Hands-free runner (${OWNER}) completed. Draft PR: ${PR_URL:-not-created}. Log: \`${RUN_LOG}\`" >/dev/null 2>&1 || true
