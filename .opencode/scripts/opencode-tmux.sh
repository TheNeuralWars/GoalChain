#!/usr/bin/env bash
# opencode-tmux.sh
# Launch opencode in a named tmux session, hands-free friendly.
# Usage:
#   ./opencode-tmux.sh start "refactor the SDK"   # starts a session named "opencode"
#   ./opencode-tmux.sh attach
#   ./opencode-tmux.sh stop
#   ./opencode-tmux.sh status

SESSION="opencode"

start() {
  local prompt="${1:-continue working on the project}"
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "session '$SESSION' already running. use: $0 attach"
    exit 1
  fi
  tmux new-session -d -s "$SESSION" -c "$PWD" "opencode --prompt \"$prompt\" 2>&1 | tee -a .opencode/logs/session.log"
  echo "started. attach: $0 attach"
  echo "logs: .opencode/logs/session.log"
}

attach() {
  tmux attach -t "$SESSION"
}

stop() {
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    tmux send-keys -t "$SESSION" C-c
    sleep 2
    tmux kill-session -t "$SESSION"
    echo "stopped."
  else
    echo "no session."
  fi
}

status() {
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "running. pids:"
    pgrep -af opencode || true
  else
    echo "not running."
  fi
}

case "${1:-}" in
  start)   shift; start "${*:-}" ;;
  attach)  attach ;;
  stop)    stop ;;
  status)  status ;;
  *) echo "usage: $0 {start [prompt]|attach|stop|status}"; exit 1 ;;
esac
