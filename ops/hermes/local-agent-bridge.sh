#!/usr/bin/env bash
# Poll GitHub issues queued for local execution and run owner-specific commands.
set -euo pipefail

MODE="${1:-once}"
HERMES_LOCAL_HOME="${HERMES_LOCAL_HOME:-$HOME/.goalchain}"
CONFIG_FILE="${LOCAL_BRIDGE_CONFIG:-${HERMES_LOCAL_HOME}/local-bridge.env}"
STATE_DIR="${HERMES_LOCAL_HOME}/state"
LOG_DIR="${HERMES_LOCAL_HOME}/logs"

mkdir -p "${STATE_DIR}" "${LOG_DIR}" "${HERMES_LOCAL_HOME}"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "ERROR: missing config ${CONFIG_FILE}"
  echo "Create it from ops/hermes/local-bridge.env.example"
  exit 1
fi

# shellcheck disable=SC1090
source "${CONFIG_FILE}"

GITHUB_REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"
POLL_SECONDS="${LOCAL_BRIDGE_POLL_SECONDS:-20}"
TIMEOUT_SECONDS="${LOCAL_BRIDGE_TIMEOUT_SECONDS:-5400}"
LOCAL_REPO_PATH="${LOCAL_REPO_PATH:-$HOME/GoalChain}"
MAX_RETRIES="${LOCAL_BRIDGE_MAX_RETRIES:-1}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not found in PATH"
  exit 1
fi

ensure_dispatch_labels() {
  gh label create "dispatch:local-queued" --repo "${GITHUB_REPO}" --color "1d76db" --description "Queued for local bridge runner" >/dev/null 2>&1 || true
  gh label create "dispatch:local-running" --repo "${GITHUB_REPO}" --color "fbca04" --description "Running on local bridge" >/dev/null 2>&1 || true
  gh label create "dispatch:local-done" --repo "${GITHUB_REPO}" --color "0e8a16" --description "Local bridge completed" >/dev/null 2>&1 || true
  gh label create "dispatch:local-blocked" --repo "${GITHUB_REPO}" --color "b60205" --description "Local bridge failed" >/dev/null 2>&1 || true
  gh label create "status:done" --repo "${GITHUB_REPO}" --color "0e8a16" --description "Task completed" >/dev/null 2>&1 || true
  gh label create "status:blocked" --repo "${GITHUB_REPO}" --color "b60205" --description "Task failed or blocked" >/dev/null 2>&1 || true
}

owner_for_issue() {
  local issue_json="$1"
  python3 -c 'import json,sys
issue=json.loads(sys.argv[1])
labels=[(x.get("name","") if isinstance(x,dict) else "") for x in issue.get("labels",[])]
for o in ("cursor","antigravity","hermes"):
    if f"agent:{o}" in labels:
        print(o)
        raise SystemExit(0)
print("")' "${issue_json}"
}

objective_for_issue() {
  local issue_json="$1"
  python3 -c 'import json,re,sys
issue=json.loads(sys.argv[1])
body=(issue.get("body") or "")
m=re.search(r"## Objective\s*(.*?)\n## ", body, flags=re.S)
if m:
    print(m.group(1).strip())
else:
    print(body.strip())' "${issue_json}"
}

command_for_owner() {
  case "${1:-}" in
    cursor) printf '%s' "${LOCAL_CURSOR_CMD:-}" ;;
    antigravity) printf '%s' "${LOCAL_ANTIGRAVITY_CMD:-}" ;;
    hermes) printf '%s' "${LOCAL_HERMES_CMD:-${LOCAL_OPENCODE_CMD:-}}" ;;
    *) printf '' ;;
  esac
}

run_with_timeout() {
  local seconds="$1"
  shift
  if command -v timeout >/dev/null 2>&1; then
    timeout "${seconds}" "$@"
    return $?
  fi
  if command -v gtimeout >/dev/null 2>&1; then
    gtimeout "${seconds}" "$@"
    return $?
  fi
  python3 - "$seconds" "$@" <<'PY'
import subprocess
import sys

secs = int(sys.argv[1])
cmd = sys.argv[2:]
p = subprocess.Popen(cmd)
try:
    p.wait(timeout=secs)
except subprocess.TimeoutExpired:
    p.kill()
    p.wait()
    sys.exit(124)
sys.exit(p.returncode)
PY
}

retry_count_for_issue() {
  local issue_number="$1"
  local f="${STATE_DIR}/dispatch-retries-${issue_number}.txt"
  if [[ -f "${f}" ]]; then
    cat "${f}"
  else
    echo "0"
  fi
}

set_retry_count() {
  local issue_number="$1"
  local count="$2"
  echo "${count}" > "${STATE_DIR}/dispatch-retries-${issue_number}.txt"
}

claim_issue() {
  local issue_number="$1"
  gh issue edit --repo "${GITHUB_REPO}" "${issue_number}" \
    --remove-label "dispatch:local-queued" \
    --remove-label "dispatch:local-blocked" \
    --add-label "dispatch:local-running" \
    --add-label "status:in_progress" >/dev/null 2>&1
}

finish_issue_success() {
  local issue_number="$1"
  local message="$2"
  gh issue edit --repo "${GITHUB_REPO}" "${issue_number}" \
    --remove-label "dispatch:local-running" \
    --remove-label "dispatch:local-queued" \
    --remove-label "status:in_progress" \
    --add-label "dispatch:local-done" \
    --add-label "status:done" >/dev/null 2>&1 || true
  gh issue comment --repo "${GITHUB_REPO}" "${issue_number}" --body "${message}" >/dev/null 2>&1 || true
  rm -f "${STATE_DIR}/dispatch-retries-${issue_number}.txt"
}

finish_issue_failure() {
  local issue_number="$1"
  local message="$2"
  local retries next_retry
  retries="$(retry_count_for_issue "${issue_number}")"
  next_retry=$(( retries + 1 ))
  set_retry_count "${issue_number}" "${next_retry}"

  if (( next_retry <= MAX_RETRIES )); then
    gh issue edit --repo "${GITHUB_REPO}" "${issue_number}" \
      --remove-label "dispatch:local-running" \
      --add-label "dispatch:local-queued" >/dev/null 2>&1 || true
    gh issue comment --repo "${GITHUB_REPO}" "${issue_number}" --body \
      "${message}\n\nRetry ${next_retry}/${MAX_RETRIES}: re-queued for local bridge." >/dev/null 2>&1 || true
    return 0
  fi

  gh issue edit --repo "${GITHUB_REPO}" "${issue_number}" \
    --remove-label "dispatch:local-running" \
    --remove-label "dispatch:local-queued" \
    --add-label "dispatch:local-blocked" \
    --add-label "status:blocked" >/dev/null 2>&1 || true
  gh issue comment --repo "${GITHUB_REPO}" "${issue_number}" --body "${message}" >/dev/null 2>&1 || true
}

process_one() {
  ensure_dispatch_labels
  local raw first
  raw="$(gh issue list --repo "${GITHUB_REPO}" --state open --label "dispatch:local-queued" --limit 30 --json number,title,body,url,labels,createdAt 2>/dev/null || echo '[]')"
  first="$(python3 -c 'import json,sys
items=json.loads(sys.argv[1]) if sys.argv[1].strip() else []
items=[x for x in items if "dispatch:local-running" not in [l.get("name","") for l in x.get("labels",[]) if isinstance(l,dict)]]
items=sorted(items, key=lambda x:x.get("createdAt",""))
print(json.dumps(items[0]) if items else "")' "${raw}")"
  [[ -n "${first}" ]] || return 1

  local owner issue_number issue_title issue_url issue_objective command run_log
  owner="$(owner_for_issue "${first}")"
  [[ -n "${owner}" ]] || return 0
  issue_number="$(python3 -c 'import json,sys; print(json.loads(sys.argv[1])["number"])' "${first}")"
  issue_title="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("title") or "").strip())' "${first}")"
  issue_url="$(python3 -c 'import json,sys; print((json.loads(sys.argv[1]).get("url") or "").strip())' "${first}")"
  issue_objective="$(objective_for_issue "${first}")"
  command="$(command_for_owner "${owner}")"
  run_log="${LOG_DIR}/local-bridge-${owner}-issue-${issue_number}.log"

  [[ -n "${command}" ]] || {
    finish_issue_failure "${issue_number}" "Local bridge has no command configured for owner \`${owner}\`."
    return 0
  }

  claim_issue "${issue_number}" || return 0

  (
    export OA_TASK_OWNER="${owner}"
    export OA_TASK_ISSUE_NUMBER="${issue_number}"
    export OA_TASK_ISSUE_URL="${issue_url}"
    export OA_TASK_TITLE="${issue_title}"
    export OA_TASK_OBJECTIVE="${issue_objective}"
    export OA_TASK_REPO="${LOCAL_REPO_PATH}"
    run_with_timeout "${TIMEOUT_SECONDS}" bash -lc "${command}"
  ) >> "${run_log}" 2>&1
  local rc=$?

  if [[ ${rc} -eq 0 ]]; then
    finish_issue_success "${issue_number}" "Local bridge completed \`${owner}\` task successfully.\n\nLog: \`${run_log}\`"
  else
    finish_issue_failure "${issue_number}" "Local bridge failed \`${owner}\` task (exit ${rc}).\n\nLog: \`${run_log}\`"
  fi
  return 0
}

main_once() {
  process_one || true
}

main_loop() {
  while true; do
    process_one || true
    sleep "${POLL_SECONDS}"
  done
}

case "${MODE}" in
  once) main_once ;;
  loop) main_loop ;;
  *) echo "Usage: $0 [once|loop]"; exit 1 ;;
esac
