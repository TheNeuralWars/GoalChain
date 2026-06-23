#!/usr/bin/env bash
# Manage OpenCode Autonomous worker (OA) lifecycle on Hermes server.
set -euo pipefail

# Force robust paths if running on the GoalChain VPS as goalchain user
if [[ -d "/home/goalchain" && "$(whoami)" == "goalchain" ]]; then
  HOME="/home/goalchain"
  HERMES_HOME="/home/goalchain/.hermes"
fi

HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
OA_HOME="${HERMES_HOME}/oa"
RUN_FLAG="${OA_HOME}/RUNNING"
WORKER_SESSION="oa-worker"

WEBHOOK_SESSION="oa-webhook"
AUTH_SESSION="oa-auth"

mkdir -p "${OA_HOME}/inbox" "${OA_HOME}/logs"
touch "${OA_HOME}/inbox/messages.jsonl"

cmd="${1:-status}"

has_systemd() {
  command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1
}

units_installed() {
  [[ -f "${HOME}/.config/systemd/user/oa-worker.service" ]] && [[ -f "${HOME}/.config/systemd/user/oa-webhook.service" ]]
}

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

dispatch_commands_status() {
  local cfg="${HERMES_HOME}/config.env"
  local c1="" c2="" c3="" c4=""
  if [[ -f "${cfg}" ]]; then
    # shellcheck disable=SC1090
    source "${cfg}"
    c1="${OA_AGENT_CURSOR_CMD:-}"
    c2="${OA_AGENT_ANTIGRAVITY_CMD:-}"
    c3="${OA_AGENT_GROK_CMD:-}"
    c4="${OA_AGENT_OPENCODE_CMD:-}"
  fi
  [[ -n "${c1}" ]] && echo "dispatch_cursor: configured" || echo "dispatch_cursor: disabled"
  [[ -n "${c2}" ]] && echo "dispatch_antigravity: configured" || echo "dispatch_antigravity: disabled"
  [[ -n "${c3}" ]] && echo "dispatch_grok: configured" || echo "dispatch_grok: disabled"
  [[ -n "${c4}" ]] && echo "dispatch_opencode: configured" || echo "dispatch_opencode: disabled"
}

start_worker() {
  if has_systemd && units_installed; then
    systemctl --user start oa-worker.service
    echo "worker: started(systemd)"
    return 0
  fi
  if tmux has-session -t "${WORKER_SESSION}" 2>/dev/null; then
    echo "worker: already running(tmux)"
  else
    tmux new-session -d -s "${WORKER_SESSION}" "bash '${HERMES_HOME}/scripts/oa-worker.sh' >> '${OA_HOME}/logs/worker.log' 2>&1"
    echo "worker: started(tmux)"
  fi
}

start_webhook() {
  if has_systemd && units_installed; then
    systemctl --user start oa-webhook.service
    echo "webhook: started(systemd)"
    return 0
  fi
  if tmux has-session -t "${WEBHOOK_SESSION}" 2>/dev/null; then
    echo "webhook: already running(tmux)"
  else
    tmux new-session -d -s "${WEBHOOK_SESSION}" "python3 '${HERMES_HOME}/scripts/oa-webhook.py' >> '${OA_HOME}/logs/webhook.log' 2>&1"
    echo "webhook: started(tmux)"
  fi
}

stop_worker() {
  if has_systemd && units_installed; then
    systemctl --user stop oa-worker.service >/dev/null 2>&1 || true
    echo "worker: stopped(systemd)"
    return 0
  fi
  tmux kill-session -t "${WORKER_SESSION}" 2>/dev/null || true
  echo "worker: stopped(tmux)"
}

stop_webhook() {
  if has_systemd && units_installed; then
    systemctl --user stop oa-webhook.service >/dev/null 2>&1 || true
    echo "webhook: stopped(systemd)"
    return 0
  fi
  tmux kill-session -t "${WEBHOOK_SESSION}" 2>/dev/null || true
  echo "webhook: stopped(tmux)"
}

systemd_status() {
  if has_systemd && units_installed; then
    local ws hs ts
    ws="$(systemctl --user is-active oa-worker.service 2>/dev/null || true)"
    hs="$(systemctl --user is-active oa-webhook.service 2>/dev/null || true)"
    ts="$(systemctl --user is-active oa-health.timer 2>/dev/null || true)"
    echo "worker_service: ${ws:-unknown}"
    echo "webhook_service: ${hs:-unknown}"
    echo "health_timer: ${ts:-unknown}"
  else
    echo "worker_service: not_installed"
    echo "webhook_service: not_installed"
    echo "health_timer: not_installed"
  fi
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
    systemd_status
    discord_research_status
    dispatch_commands_status
    ;;
  xai-auth|xai)
    bash "${HERMES_HOME}/scripts/oa-xai-connect.sh" "${2:-headless}"
    ;;
  auth)
    bash "${HERMES_HOME}/scripts/oa-auth.sh"
    if tmux has-session -t "${AUTH_SESSION}" 2>/dev/null; then
      echo "auth: session already running (tmux attach -t ${AUTH_SESSION})"
    else
      # Issue #832: provider for code issues is "nvidia" (NVIDIA NIM);
      # use -p nvidia -m <method> when the script prompts.
      tmux new-session -d -s "${AUTH_SESSION}" "cd '${HERMES_HOME}/workspace/GoalChain' && opencode providers login -p nvidia"
      echo "auth: started interactive provider login in tmux session ${AUTH_SESSION}"
      echo "attach with: tmux attach -t ${AUTH_SESSION}"
    fi
    ;;
  tunnel)
    bash "${HERMES_HOME}/scripts/setup-tunnel-xai.sh" "${2:-status}"
    ;;
  systemd-install)
    tmux kill-session -t "${WORKER_SESSION}" 2>/dev/null || true
    tmux kill-session -t "${WEBHOOK_SESSION}" 2>/dev/null || true
    bash "${HERMES_HOME}/scripts/oa-systemd-install.sh"
    ;;
  systemd-start)
    systemctl --user start oa-worker.service oa-webhook.service oa-health.timer
    ;;
  systemd-stop)
    systemctl --user stop oa-worker.service oa-webhook.service oa-health.timer >/dev/null 2>&1 || true
    ;;
  systemd-restart)
    systemctl --user restart oa-worker.service oa-webhook.service
    ;;
  systemd-status)
    systemd_status
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|auth|xai-auth [headless|apikey|verify]|tunnel [start|stop|status|verify-xai]|systemd-install|systemd-start|systemd-stop|systemd-restart|systemd-status}"
    exit 1
    ;;
esac
