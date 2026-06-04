#!/usr/bin/env bash
# Mark open issues ready for oa-worker: opencode, antigravity, grok, and legacy unlabeled.
# Legacy issues without agent:* get agent:opencode. Skips agent:cursor and status:done.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
# shellcheck disable=SC1090
source "${HERMES_HOME}/config.env" 2>/dev/null || true
REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"
STATE_DIR="${HERMES_HOME}/oa/state"
DRY_RUN="${DRY_RUN:-0}"

mkdir -p "${STATE_DIR}"
gh label create "status:ready" --repo "${REPO}" --color "0e8a16" --description "Ready for OA/FCC worker" >/dev/null 2>&1 || true

mapfile -t ROWS < <(
  gh issue list --repo "${REPO}" --state open --limit 200 --json number,labels \
    | python3 -c '
import json, sys
code = {"agent:opencode", "agent:antigravity", "agent:grok"}
skip = {"agent:cursor"}
all_agents = code | skip
for issue in json.load(sys.stdin):
    labs = {x.get("name", "") for x in issue.get("labels") or []}
    if "status:done" in labs:
        continue
    if labs & skip:
        continue
    n = issue["number"]
    if labs & code:
        print(f"{n}\t0")
    elif not (labs & all_agents):
        print(f"{n}\t1")
'
)

echo "issues_to_queue: ${#ROWS[@]}"
gh label create "agent:opencode" --repo "${REPO}" --color "0052cc" --description "FCC/OpenCode worker" >/dev/null 2>&1 || true
for row in "${ROWS[@]}"; do
  n="${row%%$'\t'*}"
  add_agent="${row#*$'\t'}"
  if [[ "${DRY_RUN}" == "1" ]]; then
    echo "DRY_RUN: would queue #${n} add_agent=${add_agent}"
    continue
  fi
  if [[ "${add_agent}" == "1" ]]; then
    gh issue edit "${n}" --repo "${REPO}" --add-label "agent:opencode" >/dev/null 2>&1 || true
  fi
  gh issue edit "${n}" --repo "${REPO}" --add-label "status:ready" >/dev/null 2>&1 || true
  rm -f "${STATE_DIR}/issue-${n}.done"
  echo "queued: #${n}"
done

echo "done. Restart worker: bash ~/hermes/scripts/oa-control.sh systemd-restart"
