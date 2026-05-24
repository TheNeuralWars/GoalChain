#!/usr/bin/env bash
# Register OpenClaw cron jobs for GoalChain (run on server as goalchain user)
set -euo pipefail

if ! command -v openclaw >/dev/null 2>&1; then
  echo "ERROR: openclaw CLI not found"
  exit 1
fi

openclaw cron add \
  --name "goalchain-morning-digest" \
  --cron "0 9 * * *" \
  --session isolated \
  --message "GoalChain morning digest. Run: bash ~/hermes/scripts/openclaw-context.sh and bash ~/hermes/scripts/sync.sh. Summarize open PRs, intake briefs, blocked items. Append summary to ~/.openclaw/workspace/memory/YYYY-MM-DD.md (today UTC). Spanish preferred." \
  --description "Daily GoalChain ops digest via Hermes agent" \
  2>/dev/null || echo "WARN: morning digest job may already exist"

openclaw cron add \
  --name "goalchain-repo-sync" \
  --cron "0 */6 * * *" \
  --session main \
  --system-event "Run bash ~/hermes/scripts/sync.sh on GoalChain repo. No reply unless sync failed." \
  --description "Periodic git fetch/pull for GoalChain clone" \
  2>/dev/null || echo "WARN: repo sync job may already exist"

openclaw cron list
echo "Done."
