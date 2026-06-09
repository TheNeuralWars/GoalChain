#!/usr/bin/env bash
# Start all GoalChain specialized Hermes agent Telegram bots and Notion intake daemons.
set -euo pipefail

log() { printf '[start-all-agents] %s\n' "$*"; }

# Kill existing instances first to prevent conflicts
log "Cleaning up any old running instances in PM2..."
pm2 delete hermes-bot-ceo hermes-bot-marketing hermes-bot-dev hermes-bot-jito hermes-notion-intake 2>/dev/null || true

# 1. Start CEO Bot
log "Starting CEO Bot..."
pm2 start "/home/ubuntu/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main --profile hermes-ceo gateway run --replace" --name "hermes-bot-ceo"

# 2. Start Marketing Bot
log "Starting Marketing Bot..."
pm2 start "/home/ubuntu/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main --profile marketing-active gateway run --replace" --name "hermes-bot-marketing"

# 3. Start Developer Bot
log "Starting Developer Bot..."
pm2 start "/home/ubuntu/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main --profile repo-deepdive gateway run --replace" --name "hermes-bot-dev"

# 4. Start Jito Strategy Bot
log "Starting Jito Strategy Bot..."
pm2 start "/home/ubuntu/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main --profile jito-strategy gateway run --replace" --name "hermes-bot-jito"

# 5. Start Notion Intake Daemon
log "Starting Notion Intake Daemon..."
pm2 start /home/ubuntu/GoalChain/ops/hermes/notion_intake_daemon.py \
  --name "hermes-notion-intake" \
  --interpreter python3 \
  -- --interval 60

log "All services started successfully in PM2!"
pm2 list
