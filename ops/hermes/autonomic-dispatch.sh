#!/usr/bin/env bash
#
# Autonomic Dispatch Loop v4 - Full persistent research system
# Includes X research queue for user's reposts/likes (24/7 capable)

set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
REPO_ROOT="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

LOG_DIR="${HERMES_HOME}/logs"
mkdir -p "$LOG_DIR" ~/GoalChain/Talks
LOG_FILE="$LOG_DIR/autonomic-dispatch.log"

DRY_RUN=false
FORCE_MODE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --force) FORCE_MODE=true; shift ;;
    --tmux)
      while true; do
        bash "$0" || true
        sleep 900
      done
      ;;
    *) shift ;;
  esac
done

log() { printf "[%s] %s\n" "$(date -u '+%Y-%m-%d %H:%M:%S UTC')" "$*" | tee -a "$LOG_FILE"; }
info()  { log "[INFO]  $*"; }
ok()    { log "[OK]    $*"; }
warn()  { log "[WARN]  $*"; }

# Process X research queue (new persistent capability)
process_x_research_queue() {
    local queue_dir="$REPO_ROOT/research/x-queue"
    [[ -d "$queue_dir" ]] || return 0

    local processed=0
    for qfile in "$queue_dir"/*; do
        [[ -f "$qfile" ]] || continue
        local name; name=$(basename "$qfile")
        [[ "$name" == ".gitkeep" || "$name" == "README.md" ]] && continue

        local link
        link=$(cat "$qfile" | tr -d ' \n' | head -c 300)

        if [[ "$link" =~ x.com|twitter.com|status/ ]]; then
            info "Processing X research item from queue: $link"

            if [[ -x "$SCRIPT_DIR/research/x-deep-research.sh" ]]; then
                bash "$SCRIPT_DIR/research/x-deep-research.sh" "$link" || true
            fi

            mkdir -p "$queue_dir/processed"
            mv "$qfile" "$queue_dir/processed/" 2>/dev/null || true
            ((processed++))
        fi
    done

    if [[ $processed -gt 0 ]]; then
        ok "Processed $processed items from X research queue"
    fi
}

main() {
    info "=== AUTONOMIC DISPATCH CYCLE ==="

    # Process newly created markdown briefs into GitHub Issues
    if [[ -x "$SCRIPT_DIR/autonomic-intake-processor.sh" ]]; then
        info "Running Autonomic Intake Processor..."
        bash "$SCRIPT_DIR/autonomic-intake-processor.sh" || true
    fi

    # X Research Queue (persistent signal from user's 5-min repost sessions)
    process_x_research_queue

    ok "Cycle finished"
}

main "$@"
