#!/usr/bin/env bash
# Reinstall OpenClaw scouting crons with higher throughput.
set -euo pipefail

RADAR_NAME="goalchain-ai-radar-2h"
SYNTH_NAME="goalchain-ai-synthesis-daily"
WEEKLY_NAME="goalchain-ai-weekly-deepdive"
DIGEST_NAME="goalchain-morning-digest"
AUTOTUNE_NAME="goalchain-ai-autotune-daily"

RADAR_CRON="${OA_SCOUT_RADAR_CRON:-15 */2 * * *}"
SYNTH_CRON="${OA_SCOUT_SYNTH_CRON:-30 9 * * *}"
WEEKLY_CRON="${OA_SCOUT_WEEKLY_CRON:-0 12 * * 1}"
DIGEST_CRON="${OA_SCOUT_DIGEST_CRON:-0 9 * * *}"
AUTOTUNE_CRON="${OA_SCOUT_AUTOTUNE_CRON:-10 11 * * *}"
SCORE_MIN="${OA_SCOUT_SCORE_MIN:-32}"
MAX_CANDIDATES="${OA_SCOUT_MAX_CANDIDATES:-5}"
NEAR_MISS_MAX="${OA_SCOUT_NEAR_MISS_MAX:-2}"
NEAR_MISS_LOW=$(( SCORE_MIN - 4 ))
NEAR_MISS_HIGH=$(( SCORE_MIN - 1 ))
SCOUT_TONE="${OA_SCOUT_TONE:-balanced}"

case "${SCOUT_TONE}" in
  influencer)
    TONE_PROMPT="Style priority: bold influencer narrative, high energy, partnership storytelling first; then concise technical facts."
    ;;
  technical)
    TONE_PROMPT="Style priority: technical precision first, concrete integration notes, concise and factual; minimal hype."
    ;;
  *)
    TONE_PROMPT="Style priority: balanced narrative (influencer + technical) with clear actionability."
    ;;
esac

python3 - <<PY
import json, subprocess
raw=subprocess.check_output(["openclaw","cron","list","--json"], text=True)
data=json.loads(raw)
jobs=data.get("jobs", [])
remove={"goalchain-ai-radar-4h","goalchain-ai-radar-2h","goalchain-ai-synthesis-daily","goalchain-ai-weekly-deepdive","goalchain-morning-digest","goalchain-ai-autotune-daily"}
for j in jobs:
    if j.get("name") in remove:
        subprocess.run(["openclaw","cron","rm",j["id"]], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("removed_old_scout_jobs")
PY

openclaw cron add \
  --name "${RADAR_NAME}" \
  --cron "${RADAR_CRON}" \
  --session main \
  --system-event "GoalChain Gold Radar run. Mission: ANALYZE, STUDY and FIND high-leverage opportunities that can create a BOOM for GoalChain (integrations, partnerships, embeddable platforms, useful GitHub repos, X users with similar philosophy, protocols we can build on or connect with). HARD FILTERS: reject pure hype, unclear license, no concrete integration path. Periodically search and analyze posts containing #goalchainmanager — these are manual signals from the founder to guide direction. Score 0-10 on: Strategic Fit, Build Feasibility (<=3 weeks), Competitive Edge, Reliability/Maturity. Only output candidates with clear value. If nothing meets criteria, output a short 'No high-value opportunities found this cycle' note instead of generic spam. Save to ~/.openclaw/workspace/docs/ai-radar-<UTC-YYYY-MM-DD-HHMM>-<run>.md. Always include X/Twitter links and @aliases. ${TONE_PROMPT}" \
  --description "2h optimized AI radar for GoalChain"

openclaw cron add \
  --name "${SYNTH_NAME}" \
  --cron "${SYNTH_CRON}" \
  --session main \
  --system-event "Daily GoalChain AI synthesis (optimized). Read last 24h ~/.openclaw/workspace/docs/ai-radar-*.md and choose ONE highest ROI opportunity. Create ~/hermes/workspace/GoalChain/docs/intake/<YYYY-MM-DD>-ai-ecosystem-opportunities.md using UTC date. Include Objective, Context, Allowed files, Out of scope, Acceptance criteria, Test commands, Owner suggestion, Risk, Rollback, 48h PoC plan, and Rejected Candidates." \
  --description "Daily best AI opportunity brief"

openclaw cron add \
  --name "${WEEKLY_NAME}" \
  --cron "${WEEKLY_CRON}" \
  --session main \
  --system-event "Weekly deep dive for GoalChain frontier tooling. Save to ~/.openclaw/workspace/memory/weekly-ai-deepdive-<YYYY-MM-DD>.md using UTC date. Include trends that matter, top 3 pursue, top 3 ignore, dependency/security concerns, and ROI by effort tier." \
  --description "Weekly strategic AI deep dive"

openclaw cron add \
  --name "${DIGEST_NAME}" \
  --cron "${DIGEST_CRON}" \
  --session main \
  --system-event "GoalChain morning digest. Run bash ~/hermes/scripts/openclaw-context.sh and bash ~/hermes/scripts/sync.sh. Summarize open PRs, intake briefs, blockers. Append summary to ~/.openclaw/workspace/memory/YYYY-MM-DD.md (today UTC)." \
  --description "Daily GoalChain ops digest"

openclaw cron add \
  --name "${AUTOTUNE_NAME}" \
  --cron "${AUTOTUNE_CRON}" \
  --session main \
  --system-event "Run bash ~/hermes/scripts/oa-scout-autotune.sh --apply. Then append key metrics and threshold decision to ~/.openclaw/workspace/memory/YYYY-MM-DD.md (UTC)." \
  --description "Daily scout threshold autotune"

openclaw cron list
echo "Done: optimized scout jobs installed."
