#!/usr/bin/env bash
# OA worker loop: consumes webhook queue + GitHub opencode issues, drafts proposals,
# and asks OpenCode to implement on dedicated branches.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
OA_HOME="${OA_HOME:-${HERMES_HOME}/oa}"
RUN_FLAG="${RUN_FLAG:-${OA_HOME}/RUNNING}"
QUEUE_FILE="${QUEUE_FILE:-${OA_HOME}/inbox/messages.jsonl}"
STATE_DIR="${STATE_DIR:-${OA_HOME}/state}"
LOG_DIR="${LOG_DIR:-${OA_HOME}/logs}"

mkdir -p "${OA_HOME}/inbox" "${STATE_DIR}" "${LOG_DIR}"
touch "${QUEUE_FILE}"

set -a
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env"
set +a
REPO="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
PROPOSALS_DIR="${REPO}/docs/proposals/hermes"
OA_MODEL="${OA_MODEL:-xai/grok-4.3}"
OA_CODE_ENGINE="${OA_CODE_ENGINE:-fcc}"
OA_CODE_MODEL="opencode/nemotron-3-ultra-free" # locked exclusively to the free promo model
OA_CODE_CMD="${OA_CODE_CMD:-}"
RUN_CODE="${HERMES_HOME}/scripts/oa-run-code.sh"
RESEARCH_PUBLISHER="${HERMES_HOME}/scripts/oa-discord-research-publisher.py"
DISCORD_RESEARCH_WEBHOOK_URL="${DISCORD_RESEARCH_WEBHOOK_URL:-}"
DISCORD_TOKEN="${DISCORD_TOKEN:-}"
DISCORD_RESEARCH_CHANNEL_ID="${DISCORD_RESEARCH_CHANNEL_ID:-}"
XAI_API_KEY="${XAI_API_KEY:-}"
OA_RESEARCH_PUBLISHER_ENABLED="${OA_RESEARCH_PUBLISHER_ENABLED:-false}"
OA_AGENT_CURSOR_CMD="${OA_AGENT_CURSOR_CMD:-}"
OA_AGENT_ANTIGRAVITY_CMD="${OA_AGENT_ANTIGRAVITY_CMD:-}"
OA_AGENT_GROK_CMD="${OA_AGENT_GROK_CMD:-}"
OA_AGENT_HERMES_CMD="${OA_AGENT_HERMES_CMD:-}"
# Child processes (python/opencode) require exported env vars.
export DISCORD_RESEARCH_WEBHOOK_URL DISCORD_TOKEN DISCORD_RESEARCH_CHANNEL_ID XAI_API_KEY OA_RESEARCH_PUBLISHER_ENABLED
mkdir -p "${PROPOSALS_DIR}"

log() { printf '[%s] %s\n' "$(date -u '+%F %T UTC')" "$*"; }

is_urgent_text() {
  local text="${1:-}"
  text="$(printf '%s' "${text}" | tr '[:upper:]' '[:lower:]')"
  [[ "${text}" == *"cambio urgente"* ]] || [[ "${text}" == *"policy:direct-main"* ]]
}

publish_research_updates() {
  # X-Scout owns ai-radar-* posts (hermes-x-scout.timer). Worker must not republish them.
  if [[ "${OA_WORKER_PUBLISH_RESEARCH:-false}" != "true" ]]; then
    return 0
  fi
  if [[ "${OA_RESEARCH_PUBLISHER_ENABLED}" != "true" ]]; then
    return 0
  fi
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
    --exclude-glob "ai-radar-*.md" \
    >> "${LOG_DIR}/worker.log" 2>&1 || {
      echo "$(( now + 7200 ))" > "${cooldown_file}"
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
  local out issue_url
  out="$(bash "${HERMES_HOME}/scripts/create-task.sh" "${owner}" "${priority}" "${title}" "${objective}" 2>&1 || true)"
  issue_url="$(python3 -c 'import re,sys
t=sys.stdin.read()
m=re.findall(r"https://github\\.com/[^\\s]+/issues/\\d+", t)
print(m[-1] if m else "")' <<< "${out}")"
  if [[ -z "${issue_url}" ]]; then
    log "WARN create-task failed for owner=${owner}: ${out}"
    return 1
  fi
  echo "${issue_url}"
}

agent_command_for_owner() {
  case "${1:-}" in
    cursor) printf '%s' "${OA_AGENT_CURSOR_CMD}" ;;
    antigravity) printf '%s' "${OA_AGENT_ANTIGRAVITY_CMD}" ;;
    grok) printf '%s' "${OA_AGENT_GROK_CMD}" ;;
    hermes) printf '%s' "${OA_AGENT_HERMES_CMD}" ;;
    *) printf '' ;;
  esac
}

ensure_issue_labels() {
  gh label create "status:in_progress" --repo "${GITHUB_REPO}" --color "fbca04" --description "Task is running" >/dev/null 2>&1 || true
}

dispatch_issue_to_waiting_agent() {
  local owner="$1"
  local priority="$2"
  local title="$3"
  local objective="$4"
  local issue_url="$5"
  local command issue_number issue_log

  command="$(agent_command_for_owner "${owner}")"
  [[ -n "${command}" ]] || return 0
  issue_number="${issue_url##*/}"
  issue_log="${LOG_DIR}/dispatch-${owner}-${issue_number}.log"
  ensure_issue_labels
  gh issue edit --repo "${GITHUB_REPO}" "${issue_number}" --remove-label "status:ready" --add-label "status:in_progress" >/dev/null 2>&1 || true
  gh issue comment --repo "${GITHUB_REPO}" "${issue_number}" --body "Auto-dispatch: sent to waiting agent \`${owner}\` command runner." >/dev/null 2>&1 || true

  (
    export OA_TASK_OWNER="${owner}"
    export OA_TASK_PRIORITY="${priority}"
    export OA_TASK_TITLE="${title}"
    export OA_TASK_OBJECTIVE="${objective}"
    export OA_TASK_ISSUE_URL="${issue_url}"
    export OA_TASK_ISSUE_NUMBER="${issue_number}"
    export OA_TASK_REPO="${REPO}"
    bash -lc "${command}"
  ) >> "${issue_log}" 2>&1 &
  log "Auto-dispatched issue #${issue_number} to ${owner} wait-mode command"
}

parse_task_from_text() {
  local text="${1:-}"
  python3 -c 'import json,re,sys,unicodedata
text=(sys.argv[1] or "").strip()
if not text:
    print("")
    raise SystemExit(0)

def norm(s):
    s = s.lower()
    s = unicodedata.normalize("NFKD", s)
    return "".join(c for c in s if not unicodedata.combining(c))

n = norm(text)
owners = ["cursor","antigravity","hermes","grok"]

task = re.match(r"^task\s+(cursor|antigravity|hermes|grok)\s+(P0|P1|P2)\s+\"([^\"]+)\"\s+\"([^\"]+)\"$", text, flags=re.I)
assign = re.match(r"^assign\s+(cursor|antigravity|hermes|grok)\s+(P0|P1|P2)\s*\|\s*([^|]+)\s*\|\s*(.+)$", text, flags=re.I)
urgent = ("cambio urgente" in n) or ("policy:direct-main" in n) or ("urgente" in n)

if task:
    owner, priority, title, objective = task.groups()
    item = {"owner": owner.lower(), "priority": priority.upper(), "title": title.strip(), "objective": objective.strip()}
elif assign:
    owner, priority, title, objective = assign.groups()
    item = {"owner": owner.lower(), "priority": priority.upper(), "title": title.strip(), "objective": objective.strip()}
else:
    owner = next((o for o in owners if re.search(rf"\b{o}\b", n)), "hermes")
    has_exec_verb = any(v in n for v in ["spike", "integr", "implement", "elabora", "hace", "haz", "crear", "mejora"])
    priority = "P1" if has_exec_verb else "P2"
    title_words = re.sub(r"\s+", " ", text).strip().split(" ")
    title = " ".join(title_words[:10]).strip() or "OA task"
    if has_exec_verb:
        title = f"Spike: {title}"
    item = {"owner": owner, "priority": priority, "title": title, "objective": text}

if urgent:
    item["priority"] = "P0"
    if "CAMBIO URGENTE" not in item["title"]:
        item["title"] = f"[CAMBIO URGENTE] {item['title']}"
    item["objective"] = item["objective"] + "\n\nPolicy: direct main push requested by Nico via keyword cambio urgente."

print(json.dumps(item, ensure_ascii=True))
' "${text}"
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
    local parsed owner priority title objective issue_url
    parsed="$(parse_task_from_text "${text}" 2>/dev/null || true)"
    [[ -n "${parsed}" ]] || continue
    owner="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("owner") or "hermes").strip())' "${parsed}" 2>/dev/null || echo "hermes")"
    priority="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("priority") or "P2").strip())' "${parsed}" 2>/dev/null || echo "P2")"
    title="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("title") or "OA task").strip())' "${parsed}" 2>/dev/null || echo "OA task")"
    objective="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("objective") or "").strip())' "${parsed}" 2>/dev/null || echo "${text}")"

    issue_url="$(create_issue_from_webhook "${owner}" "${priority}" "${title}" "${objective}" || true)"
    [[ -n "${issue_url}" ]] || continue
    # hermes/FCC: OA worker picks agent:hermes + status:ready (avoid local-bridge queue on VPS).
    if [[ "${owner}" == "hermes" ]]; then
      log "Webhook queued hermes issue for OA worker: ${issue_url}"
      continue
    fi
    dispatch_issue_to_waiting_agent "${owner}" "${priority}" "${title}" "${objective}" "${issue_url}"
  done < "${tmp}"

  rm -f "${tmp}"
}

process_hermes_issue() {
  local issue_json="$1"
  local number title body labels_csv
  number="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["number"])' "${issue_json}")"
  title="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["title"])' "${issue_json}")"
  body="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("body") or "").replace("\r",""))' "${issue_json}")"
  labels_csv="$(python3 -c 'import json,sys; issue=json.loads(sys.argv[1]); labels=issue.get("labels") or []; print(",".join([x.get("name","") for x in labels if isinstance(x,dict)]))' "${issue_json}")"

  local done_marker="${STATE_DIR}/issue-${number}.done"
  [[ -f "${done_marker}" ]] && return 0

  log "Processing hermes issue #${number}: ${title}"
  ensure_branch_clean

  local urgent_mode="0"
  if is_urgent_text "${title}
${body}
${labels_csv}"; then
    urgent_mode="1"
    log "Issue #${number} flagged as CAMBIO URGENTE (direct-main mode)"
  fi

  local branch="exp/hermes-issue-${number}"
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

  export XAI_API_KEY
  local work_mode_note prompt_file run_log
  if [[ "${urgent_mode}" == "1" ]]; then
    work_mode_note="DIRECT MAIN MODE ENABLED by Nico keyword 'cambio urgente'. Work on main and do not create feature branches."
  else
    work_mode_note="Keep branch ${branch}."
  fi
  local priority fcc_tier
  priority="P1"
  echo ",${labels_csv}," | grep -q ',priority:P0,' && priority="P0"
  echo ",${labels_csv}," | grep -q ',priority:P2,' && priority="P2"
  fcc_tier="$(bash "${HERMES_HOME}/scripts/fcc-resolve-tier.sh" \
    --priority "${priority}" --labels "${labels_csv}" --text "${title} ${body}" 2>/dev/null || echo sonnet)"
  export OA_TASK_PRIORITY="${priority}"
  export OA_FCC_TIER="${fcc_tier}"

  prompt_file="/tmp/oa-code-prompt-${number}.txt"
  run_log="/tmp/oa-hermes-${number}.log"
  cat > "${prompt_file}" <<EOF
You are the GoalChain code agent (Free Claude Code / FCC). Implement issue #${number}: ${title}.

Before editing, read (in order):
- CLAUDE.md (skills: frontend-design for webapp; gstack review/investigate/plan-eng — no /ship or browser /qa)
- ai_context/META_CHARTER.md
- .cursor/rules/meta-principal.mdc
- ai_context/AGENT_ORCHESTRATION.md

Issue body (requirements):
${body}

CRITICAL COMPATIBILITY RULES FOR NEMOTRON-3-ULTRA-FREE:
1. DO NOT use the \`todowrite\` tool. It causes schema errors with Nemotron-3. Manage all your tasks and checklists in text format in the proposal file.
2. DO NOT write or overwrite large files (greater than 50 lines) using the \`write\` tool. Output truncation will break JSON parsing and crash the run. Break changes down into smaller files or modular edits.

Use repo constraints and META principles. Installed skills live in ~/.claude/skills/ (frontend-design, gstack).
First refine proposal in ${proposal_file}, then implement code in small safe steps.
Do not touch secrets. ${work_mode_note}
Open a draft PR only (unless cambio urgente). End by summarizing tests run and residual risks.
EOF
  local run_status="0"
  if [[ -x "${RUN_CODE}" ]]; then
    log "FCC tier=${fcc_tier} (priority=${priority}) for issue #${number}"
    bash "${RUN_CODE}" --workdir "${REPO}" --prompt-file "${prompt_file}" --tier "${fcc_tier}" --log "${run_log}" >> "${run_log}" 2>&1 || run_status=$?
  else
    log "WARN oa-run-code.sh missing; skipping implementation for #${number}"
    run_status=99
  fi

  # Check run log for indicators of failure even if exit status is 0
  local has_error="0"
  if [[ ${run_status} -ne 0 ]]; then
    has_error="1"
  elif [[ -f "${run_log}" ]]; then
    if grep -q -E "model_not_supported|Error:|FCC run failed" "${run_log}"; then
      has_error="1"
    fi
  fi

  if [[ "${has_error}" == "0" ]]; then
    if [[ "${urgent_mode}" == "1" ]]; then
      if [[ -n "$(git -C "${REPO}" status --porcelain)" ]]; then
        git -C "${REPO}" add -A
        git -C "${REPO}" commit -m "oa: cambio urgente issue #${number}" >/dev/null 2>&1 || true
        git -C "${REPO}" push origin main >/dev/null 2>&1 || true
        gh issue comment --repo "${GITHUB_REPO}" "${number}" \
          --body "Executed in **direct-main mode** due to keyword \`cambio urgente\`. Changes were pushed directly to \`main\`.\n\nTier: \`${fcc_tier}\`\nLog: \`${run_log}\`" \
          >/dev/null 2>&1 || true
      else
        gh issue comment --repo "${GITHUB_REPO}" "${number}" \
          --body "Issue had \`cambio urgente\` policy but OA produced no file changes.\n\nTier: \`${fcc_tier}\`\nLog: \`${run_log}\`" \
          >/dev/null 2>&1 || true
      fi
      gh issue edit --repo "${GITHUB_REPO}" "${number}" \
        --remove-label "status:ready" \
        --remove-label "status:in_progress" \
        --add-label "status:done" >/dev/null 2>&1 || true
      touch "${done_marker}"
      log "Finished issue #${number} (direct-main mode)"
      return 0
    fi

    # Normal mode (non-urgent)
    local pr_url=""
    if [[ -n "$(git -C "${REPO}" status --porcelain)" ]]; then
      git -C "${REPO}" add -A
      git -C "${REPO}" commit -m "oa: draft implementation for issue #${number}" >/dev/null 2>&1 || true
      git -C "${REPO}" push -u origin "${branch}" >/dev/null 2>&1 || true

      # Create draft PR if none exists for branch.
      local pr_count
      pr_count="$(gh pr list --repo "${GITHUB_REPO}" --head "${branch}" --state open --json number | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))' 2>/dev/null || echo 0)"
      if [[ "${pr_count}" == "0" ]]; then
        pr_url="$(gh pr create --repo "${GITHUB_REPO}" --base main --head "${branch}" --draft \
          --title "OA draft: issue #${number} — ${title}" \
          --body "Automated FCC/Hermes draft for issue #${number}. Requires Antigravity or Nico review before merge." 2>/dev/null || true)"
      else
        pr_url="$(gh pr list --repo "${GITHUB_REPO}" --head "${branch}" --state open --json url --jq '.[0].url' 2>/dev/null || true)"
      fi
    fi

    # Success comment and labels
    local comment_body="Automated FCC/Hermes completed issue #${number}.\n\n- **Tier Used:** \`${fcc_tier}\`"
    if [[ -n "${pr_url}" ]]; then
      comment_body="${comment_body}\n- **Draft PR:** ${pr_url}"
    else
      comment_body="${comment_body}\n- No code changes were produced."
    fi
    gh issue comment --repo "${GITHUB_REPO}" "${number}" --body "$(printf "${comment_body}")" >/dev/null 2>&1 || true

    gh issue edit --repo "${GITHUB_REPO}" "${number}" \
      --remove-label "status:ready" \
      --remove-label "status:in_progress" \
      --add-label "status:done" >/dev/null 2>&1 || true

    touch "${done_marker}"
    log "Finished issue #${number} (normal mode)"
  else
    # Failure handling: DO NOT touch done marker, remove in_progress, comment + add status:blocked or status:ready for retry
    # Let's see if it is model_not_supported to mention that explicitly or generally block
    local fail_reason="FCC execution failed"
    if grep -q "model_not_supported" "${run_log}" 2>/dev/null; then
      fail_reason="Model not supported"
    fi

    local comment_body="Automated FCC/Hermes run failed for issue #${number}.\n\n- **Reason:** ${fail_reason}\n- **Tier Attempted:** \`${fcc_tier}\`\n- **Status:** marked as \`status:blocked\` for manual review to prevent infinite retries. Run logs are at \`/tmp/oa-hermes-${number}.log\`."
    gh issue comment --repo "${GITHUB_REPO}" "${number}" --body "$(printf "${comment_body}")" >/dev/null 2>&1 || true

    # Per guidelines, failure should not touch .done, and let's remove status:in_progress, add status:blocked.
    gh issue edit --repo "${GITHUB_REPO}" "${number}" \
      --remove-label "status:in_progress" \
      --add-label "status:blocked" >/dev/null 2>&1 || true

    log "Failed issue #${number}: ${fail_reason}. Done marker NOT touched. Re-labeled status:blocked."
  fi
}

pick_next_hermes_issue() {
  local raw
  # Any code-agent label + status:ready (opencode/FCC, antigravity, grok). Cursor stays IDE-local.
  raw="$(gh issue list \
    --repo "${GITHUB_REPO}" \
    --state open \
    --label "status:ready" \
    --limit 100 \
    --json number,title,body,createdAt,labels 2>/dev/null || echo '[]')"
  echo "${raw}" | STATE_DIR="${STATE_DIR}" python3 -c 'import json,sys
from pathlib import Path
raw=sys.stdin.read().strip() or "[]"
state_dir=Path(sys.argv[1] or ".")
CODE_AGENTS=frozenset({"agent:hermes", "agent:antigravity", "agent:grok"})
SKIP_AGENTS=frozenset({"agent:cursor"})
try:
    items=json.loads(raw)
except Exception:
    items=[]
if not isinstance(items, list):
    items=[]
def labels(issue):
    out=[]
    for x in issue.get("labels") or []:
        if isinstance(x, dict) and x.get("name"):
            out.append(x["name"])
    return out
def already_done(issue):
    n=issue.get("number")
    if not n:
        return True
    if (state_dir / f"issue-{n}.done").exists():
        return True
    return "status:done" in labels(issue)
def priority_rank(issue):
    labs=labels(issue)
    if "priority:P0" in labs or "P0" in labs:
        return 0
    if "priority:P1" in labs or "P1" in labs:
        return 1
    if "priority:P2" in labs or "P2" in labs:
        return 2
    return 3
def eligible(issue):
    labs=set(labels(issue))
    if labs & SKIP_AGENTS:
        return False
    if not (labs & CODE_AGENTS):
        return False
    return not already_done(issue)
items=[i for i in items if eligible(i)]
items=sorted(items, key=lambda x: (priority_rank(x), x.get("createdAt","")))
print(json.dumps(items[0]) if items else "")' "${STATE_DIR}"
}

main_loop() {
  log "OA worker started"
  while [[ -f "${RUN_FLAG}" ]]; do
    publish_research_updates
    consume_webhook_queue

    # Run the autonomous reviewer to audit and merge open PRs
    if [[ -x "${HERMES_HOME}/scripts/autonomic-reviewer.sh" ]]; then
      bash "${HERMES_HOME}/scripts/autonomic-reviewer.sh" || true
    elif [[ -x "${SCRIPT_DIR}/autonomic-reviewer.sh" ]]; then
      bash "${SCRIPT_DIR}/autonomic-reviewer.sh" || true
    fi

    local issue
    issue="$(pick_next_hermes_issue || true)"
    if [[ -n "${issue}" ]]; then
      process_hermes_issue "${issue}"
      sleep 2
      continue
    fi
    sleep 20
  done
  log "OA worker stopped (run flag removed)"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  main_loop
fi
