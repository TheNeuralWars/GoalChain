#!/usr/bin/env bash
# Wrapper for OA Autonomous workers (Alpha-Kappa).
# Each worker gets a disjoint partition of issues via issue_number % 10.
# Usage: oa-worker-autonomous-wrapper.sh <worker_id: alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa>
set -euo pipefail

WORKER_ID="${1:-}"
if [[ -z "${WORKER_ID}" ]]; then
  echo "Usage: $0 <worker_id>  (alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa)"
  exit 1
fi

log() { printf '[%s] [%s] %s\n' "$(date -u '+%F %T UTC')" "${WORKER_ID}" "$*"; }

# Map worker_id -> partition index (0-9)
declare -A WORKER_INDEX=(
  [alpha]=0 [beta]=1 [gamma]=2 [delta]=3 [epsilon]=4 [zeta]=5 [eta]=6 [theta]=7 [iota]=8 [kappa]=9
  [chi]=0 [omega]=1 [phi]=2 [pi]=3 [psi]=4 [rho]=5 [sigma]=6 [tau]=7 [upsilon]=8 [stigma]=9
  [lambda]=0 [mu]=1 [nu]=2 [xi]=3 [omicron]=4
)
PARTITION="${WORKER_INDEX[${WORKER_ID}]:?unknown worker_id ${WORKER_ID}}"

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
OA_HOME="${HERMES_HOME}/oa/${WORKER_ID}"
RUN_FLAG="${OA_HOME}/RUNNING"
QUEUE_FILE="${HERMES_HOME}/oa/inbox/messages.jsonl"  # shared webhook queue
STATE_DIR="${OA_HOME}/state"
LOG_DIR="${OA_HOME}/logs"

mkdir -p "${OA_HOME}/inbox" "${STATE_DIR}" "${LOG_DIR}"
touch "${QUEUE_FILE}"

# Source config
set -a
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env"
set +a

# Git worktree isolation per worker to prevent concurrency collisions
WORKTREE_BASE="/data/apps/GoalChain-worktrees"
WORKTREE_DIR="${WORKTREE_BASE}/${WORKER_ID}"
BASE_REPO="${GOALCHAIN_REPO_PATH:-${HERMES_HOME}/workspace/GoalChain}"

# Ensure worktree base directory exists
mkdir -p "${WORKTREE_BASE}"

# If the worktree for this worker doesn't exist, create it from the base repository
if [[ ! -d "${WORKTREE_DIR}" ]]; then
  log "Initializing isolated git worktree for worker ${WORKER_ID} at ${WORKTREE_DIR}..."
  # Clean up any stale worktree metadata for this directory first
  git -C "${BASE_REPO}" worktree prune >/dev/null 2>&1 || true
  git -C "${BASE_REPO}" worktree add -f -B "worker-${WORKER_ID}" "${WORKTREE_DIR}" main
fi

REPO="${WORKTREE_DIR}"
PROPOSALS_DIR="${REPO}/docs/proposals/hermes"
OA_MODEL="${OA_MODEL:-xai/grok-4.3}"
OA_CODE_ENGINE="${OA_CODE_ENGINE:-hermes}"
OA_CODE_MODEL="${OA_CODE_MODEL:-nvidia/nemotron-3-super-120b-a12b}" # Issue #832: NVIDIA NIM (was: nvidia/nemotron-3-ultra, provider=Nous)
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

export DISCORD_RESEARCH_WEBHOOK_URL DISCORD_TOKEN DISCORD_RESEARCH_CHANNEL_ID XAI_API_KEY OA_RESEARCH_PUBLISHER_ENABLED
mkdir -p "${PROPOSALS_DIR}"



# Only ONE worker (alpha) publishes research to avoid duplicates
publish_research_updates() {
  if [[ "${WORKER_ID}" != "alpha" ]]; then
    return 0
  fi
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
  gh issue comment --repo "${GITHUB_REPO}" "${issue_number}" --body "Auto-dispatch: sent to waiting agent \`${owner}\` command runner (worker: ${WORKER_ID})." >/dev/null 2>&1 || true

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
    owner = next((o for o in owners if re.search(rf"\\b{o}\\b", n)), "hermes")
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
    local parsed owner priority title objective issue_url
    parsed="$(python3 -c 'import json,sys; d=json.loads(sys.argv[1]); print(d.get("source","")); print(d.get("from","")); print(d.get("text",""))' "${line}" 2>/dev/null || true)"
    if [[ -z "${parsed}" ]]; then
      continue
    fi
    local src from txt
    src="$(echo "${parsed}" | sed -n 1p)"
    from="$(echo "${parsed}" | sed -n 2p)"
    txt="$(echo "${parsed}" | sed -n 3p)"
    local task_json
    task_json="$(parse_task_from_text "${txt}")"
    if [[ -z "${task_json}" ]]; then
      continue
    fi
    owner="$(echo "${task_json}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["owner"])')"
    priority="$(echo "${task_json}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["priority"])')"
    title="$(echo "${task_json}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["title"])')"
    objective="$(echo "${task_json}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["objective"])')"
    issue_url="$(create_issue_from_webhook "${owner}" "${priority}" "${title}" "${objective}")"
    if [[ -n "${issue_url}" ]]; then
      dispatch_issue_to_waiting_agent "${owner}" "${priority}" "${title}" "${objective}" "${issue_url}"
    fi
  done < "${tmp}"
  rm -f "${tmp}"
}

# Local-queue-aware issue picker: claims next ready issue from local queue
pick_next_hermes_issue() {
  local issue_json
  issue_json="$(bash "${HERMES_HOME}/scripts/local-issue-queue.sh" claim "${WORKER_ID}" 2>/dev/null || echo "NONE")"
  if [[ "${issue_json}" == "NONE" ]] || [[ -z "${issue_json}" ]]; then
    echo ""
  else
    echo "${issue_json}"
  fi
}

process_hermes_issue() {
  local issue_json="$1"
  local number title body priority owner labels
  # number is the local issue id
  number="$(echo "${issue_json}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("id",""))')"
  title="$(echo "${issue_json}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("title",""))')"
  body="$(echo "${issue_json}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("body",""))')"

  # Extract labels
  labels="$(echo "${issue_json}" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(",".join(d.get("labels",[])))')"

  # Determine owner from labels
  if echo "${labels}" | grep -q "agent:antigravity"; then
    owner="antigravity"
  elif echo "${labels}" | grep -q "agent:grok"; then
    owner="grok"
  elif echo "${labels}" | grep -q "agent:cursor"; then
    log "Skipping cursor issue #${number} (IDE-local)"
    touch "${STATE_DIR}/issue-${number}.done"
    bash "${HERMES_HOME}/scripts/local-issue-queue.sh" update "${number}" "done" >/dev/null 2>&1 || true
    return 0
  else
    owner="hermes"
  fi

  # Priority from labels
  if echo "${labels}" | grep -q "priority:P0"; then
    priority="P0"
  elif echo "${labels}" | grep -q "priority:P2"; then
    priority="P2"
  else
    priority="P1"
  fi

  # branch is exp/oa-${owner}-${WORKER_ID}-${number}
  local branch="exp/oa-${owner}-${WORKER_ID}-${number}"
  local proposal_file="${PROPOSALS_DIR}/${WORKER_ID}-${number}.md"
  local done_marker="${STATE_DIR}/issue-${number}.done"
  local work_mode_note="Normal mode: committed locally to branch, validated and merged locally by reviewer."

  log "Processing issue #${number} (${owner}/${priority}) partition=${PARTITION}"

  # Ensure isolated branch is checked out cleanly in worker's worktree
  git -C "${REPO}" reset --hard >/dev/null 2>&1 || true
  git -C "${REPO}" checkout "worker-${WORKER_ID}" >/dev/null 2>&1 || true
  git -C "${REPO}" fetch origin main >/dev/null 2>&1 || true
  git -C "${REPO}" reset --hard origin/main >/dev/null 2>&1 || true
  git -C "${REPO}" checkout -B "${branch}" >/dev/null 2>&1 || true

  # Create proposal file
  cat > "${proposal_file}" <<EOF
# OA Proposal: Issue #${number} — ${title}

**Worker:** ${WORKER_ID} (partition ${PARTITION})
**Owner:** ${owner}
**Priority:** ${priority}
**Mode:** ${work_mode_note}

## Issue Body
${body}
EOF

  local prompt_file="${STATE_DIR}/prompt-${WORKER_ID}-${number}.txt"
  local run_log="/tmp/oa-${owner}-${WORKER_ID}-${number}.log"

  cat > "${prompt_file}" <<EOF
You are the GoalChain code agent. Implement issue #${number}: ${title}.

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
    log "Running Hermes coding agent for issue #${number} on worker ${WORKER_ID}"
    bash "${RUN_CODE}" --workdir "${REPO}" --prompt-file "${prompt_file}" --log "${run_log}" >> "${run_log}" 2>&1 || run_status=$?
  else
    log "WARN oa-run-code.sh missing; skipping implementation for #${number}"
    run_status=99
  fi

  # Check run log for indicators of failure even if exit status is 0
  local has_error="0"
  if [[ ${run_status} -ne 0 ]]; then
    has_error="1"
  elif [[ -f "${run_log}" ]]; then
    if grep -q -E "model_not_supported|Error:|run failed" "${run_log}"; then
      has_error="1"
    fi
  fi

  if [[ "${has_error}" == "0" ]]; then
    if [[ -n "$(git -C "${REPO}" status --porcelain)" ]]; then
      git -C "${REPO}" add -A
      git -C "${REPO}" commit -m "oa(${WORKER_ID}): draft implementation for issue #${number}" >/dev/null 2>&1 || true
    fi

    # Mark done locally in queue.json and touch done marker
    bash "${HERMES_HOME}/scripts/local-issue-queue.sh" update "${number}" "done" >/dev/null 2>&1 || true
    touch "${done_marker}"
    log "Finished issue #${number} (normal mode) on worker ${WORKER_ID}"
  else
    # Failure handling - mark blocked locally in queue.json
    bash "${HERMES_HOME}/scripts/local-issue-queue.sh" update "${number}" "blocked" >/dev/null 2>&1 || true
    log "Failed issue #${number}: FCC execution failed. Re-labeled status:blocked."
  fi

  # Reset/clean worktree back to worker-specific branch for the next run
  git -C "${REPO}" reset --hard >/dev/null 2>&1 || true
  git -C "${REPO}" checkout "worker-${WORKER_ID}" >/dev/null 2>&1 || true
}

main_loop() {
  log "OA autonomous worker ${WORKER_ID} started (partition ${PARTITION})"
  touch "${RUN_FLAG}"
  while [[ -f "${RUN_FLAG}" ]]; do
    publish_research_updates
    consume_webhook_queue

    # Run the autonomous reviewer to audit and merge open PRs (only alpha to avoid conflicts)
    if [[ "${WORKER_ID}" == "alpha" ]] && [[ -x "${HERMES_HOME}/scripts/autonomic-reviewer.sh" ]]; then
      bash "${HERMES_HOME}/scripts/autonomic-reviewer.sh" || true
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
  log "OA autonomous worker ${WORKER_ID} stopped (run flag removed)"
}

main_loop