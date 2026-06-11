#!/usr/bin/env bash
# Local Issue Queue Manager for GoalChain Workers
# Reads/writes JSON queue at /home/ubuntu/hermes/workspace/GoalChain/.local-issues/queue.json

QUEUE_DIR="/home/ubuntu/hermes/.local-issues"
QUEUE_FILE="$QUEUE_DIR/queue.json"
LOCK_FILE="$QUEUE_DIR/.lock"

mkdir -p "$QUEUE_DIR"

# File locking
acquire_lock() {
    local timeout=30
    local start=$(date +%s)
    while ! (set -C; echo $$ > "$LOCK_FILE") 2>/dev/null; do
        if [ $(($(date +%s) - start)) -gt $timeout ]; then
            echo "ERROR: Lock timeout" >&2
            return 1
        fi
        sleep 0.1
    done
}

release_lock() {
    rm -f "$LOCK_FILE"
}

# Initialize queue if not exists
init_queue() {
    if [ ! -f "$QUEUE_FILE" ]; then
        echo '{"issues":[],"next_id":1}' > "$QUEUE_FILE"
    fi
}

# Add issue to queue
add_issue() {
    local title="$1"
    local body="$2"
    local priority="${3:-P1}"
    local labels="${4:-}"
    
    acquire_lock || return 1
    init_queue
    
    # Get next_id from queue file
    local next_id=$(jq -r '.next_id' "$QUEUE_FILE")
    
    local issue=$(jq -n \
        --arg title "$title" \
        --arg body "$body" \
        --arg priority "$priority" \
        --arg labels "$labels" \
        --arg created "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --argjson next_id "$next_id" \
        '{
            id: $next_id,
            title: $title,
            body: $body,
            priority: $priority,
            labels: ($labels | split(",") | map(select(. != ""))),
            status: "ready",
            created_at: $created,
            updated_at: $created,
            attempts: 0,
            assigned_worker: null,
            github_number: null
        }')
    
    jq --argjson issue "$issue" '.issues += [$issue] | .next_id += 1' "$QUEUE_FILE" > "$QUEUE_FILE.tmp" && mv "$QUEUE_FILE.tmp" "$QUEUE_FILE"
    release_lock
    echo "Added issue ID $(echo "$issue" | jq -r .id): $title"
}

# Get next ready issue for worker
claim_issue() {
    local worker_id="$1"
    
    acquire_lock || return 1
    init_queue
    
    # Find first ready issue (priority order: P0 > P1 > P2)
    local issue_json=$(jq '
        .issues
        | map(select(.status == "ready"))
        | sort_by([(.priority | if . == "P0" then 0 elif . == "P1" then 1 else 2 end), .created_at])
        | .[0]
    ' "$QUEUE_FILE")
    
    if [ "$issue_json" = "null" ] || [ -z "$issue_json" ]; then
        release_lock
        echo "NONE"
        return 0
    fi
    
    local issue_id=$(echo "$issue_json" | jq -r .id)
    
    # Mark as in_progress and assign to worker
    jq --argjson id "$issue_id" --arg worker "$worker_id" --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
        .issues |= map(
            if .id == $id then
                .status = "in_progress" |
                .assigned_worker = $worker |
                .updated_at = $now |
                .attempts += 1
            else . end
        )
    ' "$QUEUE_FILE" > "$QUEUE_FILE.tmp" && mv "$QUEUE_FILE.tmp" "$QUEUE_FILE"
    
    release_lock
    echo "$issue_json"
}

# Update issue status
update_issue() {
    local issue_id="$1"
    local status="$2"
    local result="${3:-}"
    
    acquire_lock || return 1
    init_queue
    
    jq --argjson id "$issue_id" --arg status "$status" --arg result "$result" --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
        .issues |= map(
            if .id == $id then
                .status = $status |
                .updated_at = $now |
                if $status == "ready" then .assigned_worker = null else . end |
                if $result != "" then .result = $result else . end
            else . end
        )
    ' "$QUEUE_FILE" > "$QUEUE_FILE.tmp" && mv "$QUEUE_FILE.tmp" "$QUEUE_FILE"
    
    release_lock
}

# List issues
list_issues() {
    local status_filter="${1:-all}"
    init_queue
    
    if [ "$status_filter" = "all" ]; then
        jq '.issues' "$QUEUE_FILE"
    else
        jq --arg status "$status_filter" '.issues | map(select(.status == $status))' "$QUEUE_FILE"
    fi
}

# Sync from GitHub
sync_from_github() {
    echo "Syncing from GitHub..."
    if [[ -f "/home/ubuntu/hermes/scripts/sync-github-to-local-queue.py" ]]; then
        python3 "/home/ubuntu/hermes/scripts/sync-github-to-local-queue.py"
    else
        python3 "$(dirname "$0")/sync-github-to-local-queue.py"
    fi
}

# Main CLI
case "${1:-}" in
    init)
        init_queue
        echo "Queue initialized at $QUEUE_FILE"
        ;;
    add)
        add_issue "$2" "$3" "${4:-P1}" "${5:-}"
        ;;
    claim)
        claim_issue "$2"
        ;;
    update)
        update_issue "$2" "$3" "${4:-}"
        ;;
    list)
        list_issues "${2:-all}"
        ;;
    sync)
        sync_from_github
        ;;
    *)
        echo "Usage: $0 {init|add|claim|update|list|sync}"
        echo "  init                           - Initialize queue"
        echo "  add <title> <body> [priority] [labels]  - Add issue"
        echo "  claim <worker_id>              - Claim next ready issue"
        echo "  update <issue_id> <status> [result]     - Update issue status"
        echo "  list [status]                  - List issues (all/ready/in_progress/done)"
        echo "  sync                           - Sync from GitHub (when API available)"
        exit 1
        ;;
esac
