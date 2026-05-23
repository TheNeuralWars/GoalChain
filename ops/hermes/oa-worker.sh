#!/usr/bin/env bash
# OA worker loop: consumes webhook queue + GitHub opencode issues, drafts proposals,
# and asks OpenCode to implement on dedicated branches.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
OA_HOME="${HERMES_HOME}/oa"
RUN_FLAG="${OA_HOME}/RUNNING"
QUEUE_FILE="${OA_HOME}/inbox/messages.jsonl"
STATE_DIR="${OA_HOME}/state"
LOG_DIR="${OA_HOME}/logs"

mkdir -p "${OA_HOME}/inbox" "${STATE_DIR}" "${LOG_DIR}"
touch "${QUEUE_FILE}"

# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env"
REPO="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
PROPOSALS_DIR="${REPO}/docs/proposals/opencode"
OA_MODEL="${OA_MODEL:-opencode/big-pickle}"
RESEARCH_PUBLISHER="${HERMES_HOME}/scripts/oa-discord-research-publisher.py"
DISCORD_RESEARCH_WEBHOOK_URL="${DISCORD_RESEARCH_WEBHOOK_URL:-}"
DISCORD_TOKEN="${DISCORD_TOKEN:-}"
DISCORD_RESEARCH_CHANNEL_ID="${DISCORD_RESEARCH_CHANNEL_ID:-}"
XAI_API_KEY="${XAI_API_KEY:-}"
# Child processes (python/opencode) require exported env vars.
export DISCORD_RESEARCH_WEBHOOK_URL DISCORD_TOKEN DISCORD_RESEARCH_CHANNEL_ID XAI_API_KEY
mkdir -p "${PROPOSALS_DIR}"

log() { printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "$*"; }

is_urgent_text() {
  local text="${1:-}"
  text="$(printf '%s' "${text}" | tr '[:upper:]' '[:lower:]')"
  [[ "${text}" == *"cambio urgente"* ]] || [[ "${text}" == *"policy:direct-main"* ]]
}

publish_research_updates() {
  if [[ -z "${DISCORD_RESEARCH_WEBHOOK_URL}" && ( -z "${DISCORD_TOKEN}" || -z "${DISCORD_RESEARCH_CHANNEL_ID}" ) ]]; then
    return 0
  fi
  [[ -f "${RESEARCH_PUBLISHER}" ]] || return 0
  local cooldown_file="${STATE_DIR}/research-discord-next-attempt.txt"
  local now
  now="$(date +%s)"
  if [[ -f "${cooldown_file}" ]]; then
    local retry_at
    retry_at="$(cat "${cooldown_file}" 2>/dev/null || echo 0)"
    if [[ "${retry_at}" =~ ^[0-9]+$ ]] && (( now < retry_at )); then
      return 0
    fi
  fi
  python3 "${RESEARCH_PUBLISHER}" \
    --state-file "${STATE_DIR}/research-discord-posted.json" \
    --max-per-run 1 \
    >> "${LOG_DIR}/worker.log" 2>&1 || {
      # Avoid noisy loops on bad credentials/permissions.
      echo "$(( now + 900 ))" > "${cooldown_file}"
      return 0
    }
  rm -f "${cooldown_file}"
}

ensure_branch_clean() {
  git -C "${REPO}" fetch origin -q || true
}

create_issue_from_webhook() {
  local owner="$1"
  local priority="$2"
  local title="$3"
  local objective="$4"
  bash "${HERMES_HOME}/scripts/create-task.sh" "${owner}" "${priority}" "${title}" "${objective}" || true
}

consume_webhook_queue() {
  [[ -s "${QUEUE_FILE}" ]] || return 0
  local tmp="${QUEUE_FILE}.tmp"
  cp "${QUEUE_FILE}" "${tmp}"
  : > "${QUEUE_FILE}"

  while IFS= read -r line; do
    [[ -n "${line}" ]] || continue
    local text
    text="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("text","") or "").strip())' "${line}" 2>/dev/null || true)"
    [[ -n "${text}" ]] || continue

    # Supported formats:
    # task cursor P1 "Title" "Objective"
    # assign cursor P1 | Title | Objective
    if [[ "${text}" =~ ^task[[:space:]]+(cursor|antigravity|opencode|grok)[[:space:]]+(P0|P1|P2)[[:space:]]+\"([^\"]+)\"[[:space:]]+\"([^\"]+)\"$ ]]; then
      local owner priority title objective
      owner="${BASH_REMATCH[1]}"
      priority="${BASH_REMATCH[2]}"
      title="${BASH_REMATCH[3]}"
      objective="${BASH_REMATCH[4]}"
      if is_urgent_text "${text}"; then
        priority="P0"
        title="[CAMBIO URGENTE] ${title}"
        objective="${objective}\n\nPolicy: direct main push requested by Nico via keyword cambio urgente."
      fi
      create_issue_from_webhook "${owner}" "${priority}" "${title}" "${objective}"
      continue
    fi
    if [[ "${text}" =~ ^assign[[:space:]]+(cursor|antigravity|opencode|grok)[[:space:]]+(P0|P1|P2)[[:space:]]*\|[[:space:]]*([^|]+)[[:space:]]*\|[[:space:]]*(.+)$ ]]; then
      local owner priority title objective
      owner="${BASH_REMATCH[1]}"
      priority="${BASH_REMATCH[2]}"
      title="${BASH_REMATCH[3]}"
      objective="${BASH_REMATCH[4]}"
      if is_urgent_text "${text}"; then
        priority="P0"
        title="[CAMBIO URGENTE] ${title}"
        objective="${objective}\n\nPolicy: direct main push requested by Nico via keyword cambio urgente."
      fi
      create_issue_from_webhook "${owner}" "${priority}" "${title}" "${objective}"
      continue
    fi

    # Fallback: treat any inbound webhook text as an opencode task request.
    local fallback_title
    fallback_title="$(python3 -c 'import sys; t=sys.argv[1].strip(); w=t.split(); print(" ".join(w[:8]) if w else "OA task")' "${text}")"
    local fallback_priority="P2"
    local fallback_objective="${text}"
    if is_urgent_text "${text}"; then
      fallback_priority="P0"
      fallback_title="[CAMBIO URGENTE] ${fallback_title}"
      fallback_objective="${text}\n\nPolicy: direct main push requested by Nico via keyword cambio urgente."
    fi
    create_issue_from_webhook "opencode" "${fallback_priority}" "${fallback_title}" "${fallback_objective}"
  done < "${tmp}"

  rm -f "${tmp}"
}

process_opencode_issue() {
  local issue_json="$1"
  local number title body labels_csv
  number="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["number"])' "${issue_json}")"
  title="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["title"])' "${issue_json}")"
  body="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("body") or "").replace("\r",""))' "${issue_json}")"
  labels_csv="$(python3 -c 'import json,sys; issue=json.loads(sys.argv[1]); labels=issue.get("labels") or []; print(",".join([x.get("name","") for x in labels if isinstance(x,dict)]))' "${issue_json}")"

  local done_marker="${STATE_DIR}/issue-${number}.done"
  [[ -f "${done_marker}" ]] && return 0

  log "Processing opencode issue #${number}: ${title}"
  ensure_branch_clean

  local urgent_mode="0"
  if is_urgent_text "${title}
${body}
${labels_csv}"; then
    urgent_mode="1"
    log "Issue #${number} flagged as CAMBIO URGENTE (direct-main mode)"
  fi

  local branch="exp/opencode-issue-${number}"
  git -C "${REPO}" checkout main >/dev/null 2>&1 || true
  git -C "${REPO}" pull --ff-only origin main >/dev/null 2>&1 || true
  if [[ "${urgent_mode}" == "0" ]]; then
    git -C "${REPO}" checkout -B "${branch}" >/dev/null 2>&1 || true
  fi

  local proposal_file="${PROPOSALS_DIR}/issue-${number}-proposal.md"
  cat > "${proposal_file}" <<EOF
# OA Proposal — Issue #${number}

## Title
${title}

## Source
GitHub issue #${number}

## Objective
$(printf '%s\n' "${body}" | sed -n '1,40p')

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: $( [[ "${urgent_mode}" == "1" ]] && echo "revert main commit linked to issue #${number}" || echo "revert branch \`${branch}\` and close draft PR." )
EOF

  # Ask OpenCode to implement. Timeout protects endless runs.
  export XAI_API_KEY
  local work_mode_note
  if [[ "${urgent_mode}" == "1" ]]; then
    work_mode_note="DIRECT MAIN MODE ENABLED by Nico keyword 'cambio urgente'. Work on main and do not create feature branches."
  else
    work_mode_note="Keep branch ${branch}."
  fi
  timeout 3600 opencode run --model "${OA_MODEL}" \
    "You are OA worker for GoalChain. Implement issue #${number}: ${title}.
Before editing, read:
- ai_context/META_CHARTER.md
- .cursor/rules/meta-principal.mdc
- ai_context/AGENT_ORCHESTRATION.md
Use repo constraints and META principles.
First refine proposal in ${proposal_file}, then implement code in small safe steps.
Do not touch secrets. ${work_mode_note} End by summarizing tests run and residual risks." \
    >/tmp/oa-opencode-${number}.log 2>&1 || true

  if [[ "${urgent_mode}" == "1" ]]; then
    if [[ -n "$(git -C "${REPO}" status --porcelain)" ]]; then
      git -C "${REPO}" add -A
      git -C "${REPO}" commit -m "oa: cambio urgente issue #${number}" >/dev/null 2>&1 || true
      git -C "${REPO}" push origin main >/dev/null 2>&1 || true
      gh issue comment --repo "${GITHUB_REPO}" "${number}" \
        --body "Executed in **direct-main mode** due to keyword \`cambio urgente\`. Changes were pushed directly to \`main\`." \
        >/dev/null 2>&1 || true
    else
      gh issue comment --repo "${GITHUB_REPO}" "${number}" \
        --body "Issue had \`cambio urgente\` policy but OA produced no file changes." \
        >/dev/null 2>&1 || true
    fi
    touch "${done_marker}"
    log "Finished issue #${number} (direct-main mode)"
    return 0
  fi

  # Commit any produced changes.
  if [[ -n "$(git -C "${REPO}" status --porcelain)" ]]; then
    git -C "${REPO}" add -A
    git -C "${REPO}" commit -m "oa: draft implementation for issue #${number}" >/dev/null 2>&1 || true
    git -C "${REPO}" push -u origin "${branch}" >/dev/null 2>&1 || true

    # Create draft PR if none exists for branch.
    local pr_count
    pr_count="$(gh pr list --repo "${GITHUB_REPO}" --head "${branch}" --state open --json number | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))' 2>/dev/null || echo 0)"
    if [[ "${pr_count}" == "0" ]]; then
      gh pr create --repo "${GITHUB_REPO}" --base main --head "${branch}" --draft \
        --title "OA draft: issue #${number} — ${title}" \
        --body "Automated OA draft implementation for issue #${number}. Requires Cursor review/approval." >/dev/null 2>&1 || true
    fi
  fi

  touch "${done_marker}"
  log "Finished issue #${number}"
}

pick_next_opencode_issue() {
  local raw
  raw="$(gh issue list \
    --repo "${GITHUB_REPO}" \
    --state open \
    --label "agent:opencode" \
    --label "status:ready" \
    --limit 20 \
    --json number,title,body,createdAt,labels 2>/dev/null || echo '[]')"
  python3 -c 'import json,sys
raw=sys.argv[1].strip() or "[]"
try:
    items=json.loads(raw)
except Exception:
    items=[]
items=sorted(items, key=lambda x:x.get("createdAt","")) if isinstance(items,list) else []
print(json.dumps(items[0]) if items else "")' "${raw}"
}

main_loop() {
  log "OA worker started"
  while [[ -f "${RUN_FLAG}" ]]; do
    publish_research_updates
    consume_webhook_queue
    local issue
    issue="$(pick_next_opencode_issue || true)"
    if [[ -n "${issue}" ]]; then
      process_opencode_issue "${issue}"
      sleep 2
      continue
    fi
    sleep 20
  done
  log "OA worker stopped (run flag removed)"
}

main_loop
