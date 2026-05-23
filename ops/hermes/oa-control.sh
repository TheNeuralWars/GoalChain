#!/usr/bin/env bash
# Manage OpenCode Autonomous worker (OA) lifecycle on Hermes server.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
OA_HOME="${HERMES_HOME}/oa"
RUN_FLAG="${OA_HOME}/RUNNING"
WORKER_SESSION="oa-worker"
WEBHOOK_SESSION="oa-webhook"
AUTH_SESSION="oa-auth"

mkdir -p "${OA_HOME}/inbox" "${OA_HOME}/logs"
touch "${OA_HOME}/inbox/messages.jsonl"

cmd="${1:-status}"

discord_research_status() {
  local cfg="${HERMES_HOME}/config.env"
  local webhook=""
  local token=""
  local channel=""
  if [[ -f "${cfg}" ]]; then
    # shellcheck disable=SC1090
    source "${cfg}"
    webhook="${DISCORD_RESEARCH_WEBHOOK_URL:-}"
    token="${DISCORD_TOKEN:-}"
    channel="${DISCORD_RESEARCH_CHANNEL_ID:-}"
  fi
  if [[ -n "${webhook}" ]]; then
    echo "discord_research: configured(webhook)"
  elif [[ -n "${token}" && -n "${channel}" ]]; then
    echo "discord_research: configured(bot+channel)"
  else
    echo "discord_research: missing_config"
  fi
}

start_worker() {
  if tmux has-session -t "${WORKER_SESSION}" 2>/dev/null; then
    echo "worker: already running"
  else
    tmux new-session -d -s "${WORKER_SESSION}" "bash '${HERMES_HOME}/scripts/oa-worker.sh' >> '${OA_HOME}/logs/worker.log' 2>&1"
    echo "worker: started"
  fi
}

start_webhook() {
  if tmux has-session -t "${WEBHOOK_SESSION}" 2>/dev/null; then
    echo "webhook: already running"
  else
    tmux new-session -d -s "${WEBHOOK_SESSION}" "python3 '${HERMES_HOME}/scripts/oa-webhook.py' >> '${OA_HOME}/logs/webhook.log' 2>&1"
    echo "webhook: started"
  fi
}

stop_worker() {
  tmux kill-session -t "${WORKER_SESSION}" 2>/dev/null || true
  echo "worker: stopped"
}

stop_webhook() {
  tmux kill-session -t "${WEBHOOK_SESSION}" 2>/dev/null || true
  echo "webhook: stopped"
}

case "${cmd}" in
  start)
    touch "${RUN_FLAG}"
    start_worker
    start_webhook
    ;;
  stop)
    rm -f "${RUN_FLAG}"
    stop_worker
    stop_webhook
    ;;
  restart)
    rm -f "${RUN_FLAG}"
    stop_worker
    stop_webhook
    touch "${RUN_FLAG}"
    start_worker
    start_webhook
    ;;
  status)
    echo "run_flag: $( [[ -f "${RUN_FLAG}" ]] && echo on || echo off )"
    echo "worker_session: $( tmux has-session -t "${WORKER_SESSION}" 2>/dev/null && echo running || echo stopped )"
    echo "webhook_session: $( tmux has-session -t "${WEBHOOK_SESSION}" 2>/dev/null && echo running || echo stopped )"
    echo "queue_size: $( wc -l < "${OA_HOME}/inbox/messages.jsonl" 2>/dev/null || echo 0 )"
    echo "auth_session: $( tmux has-session -t "${AUTH_SESSION}" 2>/dev/null && echo running || echo stopped )"
    discord_research_status
    ;;
  xai-auth|xai)
    bash "${HERMES_HOME}/scripts/oa-xai-connect.sh" "${2:-headless}"
    ;;
  auth)
    bash "${HERMES_HOME}/scripts/oa-auth.sh"
    if tmux has-session -t "${AUTH_SESSION}" 2>/dev/null; then
      echo "auth: session already running (tmux attach -t ${AUTH_SESSION})"
    else
      tmux new-session -d -s "${AUTH_SESSION}" "cd '${HERMES_HOME}/workspace/GoalChain' && opencode providers login"
      echo "auth: started interactive provider login in tmux session ${AUTH_SESSION}"
      echo "attach with: tmux attach -t ${AUTH_SESSION}"
    fi
    ;;
  tunnel)
    bash "${HERMES_HOME}/scripts/setup-tunnel-xai.sh" "${2:-status}"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|auth|xai-auth [headless|apikey|verify]|tunnel [start|stop|status|verify-xai]}"
    exit 1
    ;;
esac
