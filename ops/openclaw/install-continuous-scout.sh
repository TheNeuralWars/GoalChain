#!/usr/bin/env bash
# Configure high-signal OpenClaw scouting jobs for GoalChain.
set -euo pipefail

RADAR_NAME="goalchain-ai-radar-4h"
SYNTH_NAME="goalchain-ai-synthesis-daily"
WEEKLY_NAME="goalchain-ai-weekly-deepdive"

# Remove previous versions if present (idempotent reinstall).
for id in $(openclaw cron list --json 2>/dev/null | python3 -c "import json,sys; raw=json.load(sys.stdin); rows=raw.get('entries', raw) if isinstance(raw, dict) else raw; names={'$RADAR_NAME','$SYNTH_NAME','$WEEKLY_NAME'}; [print(x['id']) for x in rows if isinstance(x, dict) and x.get('name') in names]"); do
  openclaw cron rm "$id" >/dev/null 2>&1 || true
done

# Every 4h: "gold bars only" radar.
openclaw cron add \
  --name "$RADAR_NAME" \
  --cron "0 */4 * * *" \
  --session main \
  --system-event "GoalChain Gold Radar run. Search only high-value AI/agent/web3 opportunities with direct project leverage. HARD FILTERS: reject anything with no OSS repo, inactive >90 days, no clear adoption path, unclear license, or pure hype. For each candidate, require evidence links and score 0-10 on: Strategic Fit, Build Feasibility (<=2 weeks), Competitive Edge, Reliability/Maturity. Keep only score >=32/40 and output max 3 candidates. Write report to ~/.openclaw/workspace/docs/ai-radar-$(date -u +%Y-%m-%d-%H%M).md with: thesis, ranked table, why now, exact PoC branch name, first 5 implementation steps, kill criteria." \
  --description "4h Gold-only AI radar for GoalChain"

# Daily synthesis: one actionable intake brief from strongest candidate.
openclaw cron add \
  --name "$SYNTH_NAME" \
  --cron "30 10 * * *" \
  --session main \
  --system-event "Daily GoalChain AI synthesis. Read last 24h ~/.openclaw/workspace/docs/ai-radar-*.md and select ONE best opportunity only. Create ~/hermes/workspace/GoalChain/docs/intake/$(date -u +%Y-%m-%d)-ai-ecosystem-opportunities.md with strict execution format: Objective, Context, Allowed files, Out of scope, Acceptance criteria, Test commands, Owner suggestion (cursor/opencode/antigravity), Risk, Rollback, and 48h PoC plan. Also include a short Rejected Candidates section explaining why others were discarded." \
  --description "Daily single best AI opportunity brief"

# Weekly deep dive: strategic track and stop-doing list.
openclaw cron add \
  --name "$WEEKLY_NAME" \
  --cron "0 12 * * 1" \
  --session main \
  --system-event "Weekly deep dive for GoalChain frontier tooling. Produce ~/.openclaw/workspace/memory/weekly-ai-deepdive-$(date -u +%Y-%m-%d).md with: top trends that matter, top 3 opportunities to pursue, top 3 things to ignore, dependency/security concerns, and expected ROI by effort tier (S/M/L)." \
  --description "Weekly strategic AI deep dive with ROI focus"

openclaw cron list
echo "Done: high-signal scouting jobs installed."
