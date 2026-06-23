#!/bin/bash
# Command to wake Hermes video pipeline
# Usage: ./wake_hermes.sh [NicoPezDorado|GoalChainSol|both] ["Optional Custom Topic"]

ACCOUNT=${1:-both}
TOPIC=${2:-""}

# Determine base directory
BASE_DIR="/data/apps/GoalChain"
TRIGGER_FILE="$BASE_DIR/data/marketing_pipeline/trigger.json"

# Check if directories exist
mkdir -p "$BASE_DIR/data/marketing_pipeline"

# Construct JSON payload
if [ -z "$TOPIC" ]; then
  payload="{\"account_name\": \"$ACCOUNT\", \"topic\": null, \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"
else
  # Escape double quotes in topic for JSON safety
  ESCAPED_TOPIC=$(echo "$TOPIC" | sed 's/"/\\"/g')
  payload="{\"account_name\": \"$ACCOUNT\", \"topic\": \"$ESCAPED_TOPIC\", \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"
fi

# Write trigger file
echo "$payload" > "$TRIGGER_FILE"
echo "✅ Hermes has been awakened for account '$ACCOUNT'!"
if [ -n "$TOPIC" ]; then
  echo "Topic: '$TOPIC'"
fi
