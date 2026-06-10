# Issue #521: [MONEY-PRINTER] Content Scheduler & Orchestrator (hermes-cron job)

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Create **hermes-cron** job `goalchain-content-scheduler` running every 4 hours (6 videos/day) to orchestrate the full pipeline: script_gen → video_render → QA gate → buffer.

## Context
- Plan: `docs/implementation-plans/money-printer-goalchain-plan.md`
- Hermes profile: `hermes-ceo` (VPS)
- Workers: 10 FCC (α-κ) pick up `agent:opencode` issues via digit routing
- State machine: `pending → scripting → rendering → qa → buffered → published → analyzed`

## Deliverables
1. **Cron config**: `~/.hermes/profiles/hermes-ceo/cron/content-scheduler.yaml`
2. **Orchestrator script**: `ops/content-flywheel/scripts/scheduler.py`
3. **State DB**: SQLite at `~/hermes/content-buffer/state.db`

## Scheduler Logic
```
Every 4 hours (0, 4, 8, 12, 16, 20 UTC):
  1. Fetch latest X-Scout radar + fixtures
  2. Pick next template (round-robin, 7-day dedup)
  3. Create script_gen task → wait for completion
  4. Dispatch video_render to FCC worker (issue_number % 10)
  5. Monitor render → auto-QA gates
  6. Pass → buffered; Fail → retry (max 2) → alert
  7. Log metrics to state.db
```

## Cron YAML Spec
```yaml
name: goalchain-content-scheduler
schedule: "0 */4 * * *"  # Every 4 hours
prompt: |
  Run the content flywheel scheduler:
  1. Load latest X-Scout radar from docs/intake/
  2. Fetch upcoming fixtures from GoalChain oracle
  3. Select template (betting_angle, player_spotlight, match_preview, lore_deep_dive, tutorial)
  4. Generate script via Grok (script_gen skill)
  5. Create video_render task for FCC worker (digit routing)
  6. Wait for completion, run auto-QA
  7. Move to buffer or retry
skills: ["goalchain-operations"]

## Priority
P0

## Labels
P0,status:ready,agent:opencode,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-521`.
