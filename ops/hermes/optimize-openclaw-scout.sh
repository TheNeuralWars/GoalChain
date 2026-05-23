#!/usr/bin/env bash
# Reinstall OpenClaw scouting crons with higher throughput.
set -euo pipefail

RADAR_NAME="goalchain-ai-radar-2h"
SYNTH_NAME="goalchain-ai-synthesis-daily"
WEEKLY_NAME="goalchain-ai-weekly-deepdive"
DIGEST_NAME="goalchain-morning-digest"

python3 - <<PY
import json, subprocess
raw=subprocess.check_output(["openclaw","cron","list","--json"], text=True)
data=json.loads(raw)
jobs=data.get("jobs", [])
remove={"goalchain-ai-radar-4h","goalchain-ai-radar-2h","goalchain-ai-synthesis-daily","goalchain-ai-weekly-deepdive","goalchain-morning-digest"}
for j in jobs:
    if j.get("name") in remove:
        subprocess.run(["openclaw","cron","rm",j["id"]], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("removed_old_scout_jobs")
PY

openclaw cron add \
  --name "${RADAR_NAME}" \
  --cron "15 */2 * * *" \
  --session main \
  --system-event "GoalChain Gold Radar run (optimized throughput). First run bash ~/hermes/scripts/openclaw-context.sh. Search AI-agent-web3 opportunities with direct leverage. HARD FILTERS: reject pure hype and unclear legal/license risk; allow projects with limited OSS if integration path is concrete and verifiable. Score 0-10: Strategic Fit, Build Feasibility <=2 weeks, Competitive Edge, Reliability/Maturity. Keep score >=28/40. Output max 5 candidates and max 2 near-miss candidates (24-27) with clear upgrade path. Save to unique file ~/.openclaw/workspace/docs/ai-radar-<UTC-YYYY-MM-DD-HHMM>-<run>.md. Include evidence links, exact exp/* PoC branch, first 5 implementation steps, kill criteria, and expected effort days." \
  --description "2h optimized AI radar for GoalChain"

openclaw cron add \
  --name "${SYNTH_NAME}" \
  --cron "30 9 * * *" \
  --session main \
  --system-event "Daily GoalChain AI synthesis (optimized). Read last 24h ~/.openclaw/workspace/docs/ai-radar-*.md and choose ONE highest ROI opportunity. Create ~/hermes/workspace/GoalChain/docs/intake/<YYYY-MM-DD>-ai-ecosystem-opportunities.md using UTC date. Include Objective, Context, Allowed files, Out of scope, Acceptance criteria, Test commands, Owner suggestion, Risk, Rollback, 48h PoC plan, and Rejected Candidates." \
  --description "Daily best AI opportunity brief"

openclaw cron add \
  --name "${WEEKLY_NAME}" \
  --cron "0 12 * * 1" \
  --session main \
  --system-event "Weekly deep dive for GoalChain frontier tooling. Save to ~/.openclaw/workspace/memory/weekly-ai-deepdive-<YYYY-MM-DD>.md using UTC date. Include trends that matter, top 3 pursue, top 3 ignore, dependency/security concerns, and ROI by effort tier." \
  --description "Weekly strategic AI deep dive"

openclaw cron add \
  --name "${DIGEST_NAME}" \
  --cron "0 9 * * *" \
  --session main \
  --system-event "GoalChain morning digest. Run bash ~/hermes/scripts/openclaw-context.sh and bash ~/hermes/scripts/sync.sh. Summarize open PRs, intake briefs, blockers. Append summary to ~/.openclaw/workspace/memory/YYYY-MM-DD.md (today UTC)." \
  --description "Daily GoalChain ops digest"

openclaw cron list
echo "Done: optimized scout jobs installed."
