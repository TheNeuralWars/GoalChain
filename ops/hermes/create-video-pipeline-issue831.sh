#!/usr/bin/env bash
# Thin wrapper to invoke compose_916.py for issue #831.
# Optional cron: 0/15 * * * * / data/apps/GoalChain/ops/hermes/create-video-pipeline-issue831.sh
#
# Pre-conditions (read by compose package):
#   XAI_API_KEY                       (optional)
#   BUFFER_ACCESS_TOKEN               (optional; without it, dry-run)
#   BUFFER_YT_PROFILE_ID / BUFFER_X_PROFILE_ID / BUFFER_TIKTOK_PROFILE_ID
#   ORACLE_VIDEO_BUFFER_PUBLISH       ("1" to enable real Buffer publish)
#
# Behavior:
#   - Default: dry-run, no Buffer network call.
#   - When ORACLE_VIDEO_BUFFER_PUBLISH=1 AND token + IDs are present, posts.
set -euo pipefail

GOALCHAIN="${GOALCHAIN:-/data/apps/GoalChain}"
COMPOSE_PY="${GOALCHAIN}/scripts/marketing/video-automation/compose/compose_916.py"

# Default event payload from CLI (override with --eventType / flags).
TEAM_A="${TEAM_A:-Argentina}"
TEAM_B="${TEAM_B:-France}"
SCORE_A="${SCORE_A:-2}"
SCORE_B="${SCORE_B:-1}"
EVENT_TEXT="${EVENT_TEXT:-Goal at 82}"
YIELD="${YIELD:-+15.4%}"

cd "${GOALCHAIN}"

exec python3 "${COMPOSE_PY}" \
  --teamA "${TEAM_A}" \
  --teamB "${TEAM_B}" \
  --scoreA "${SCORE_A}" \
  --scoreB "${SCORE_B}" \
  --eventText "${EVENT_TEXT}" \
  --yieldChange "${YIELD}" \
  --aspect 9x16 \
  --narrative-source auto \
  --publish auto \
  "$@"
