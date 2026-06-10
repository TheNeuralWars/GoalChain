# Issue #519: [MONEY-PRINTER] Script Generation Engine (goalchain-script-gen skill)

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Build the **goalchain-script-gen** skill: Grok + X-Scout context → structured football-native video scripts for GoalChain content flywheel.

## Context
- Plan: `docs/implementation-plans/money-printer-goalchain-plan.md`
- X-Scout runs every ~2h, outputs `ai-radar-*.md` to `docs/intake/` + Discord `#active-research`
- Grok (xai/grok-4.3) available via Hermes gateway
- 5 script templates: betting_angle, player_spotlight, match_preview, lore_deep_dive, tutorial

## Deliverables
1. **Skill**: `~/.hermes/profiles/hermes-ceo/skills/creative/goalchain-script-gen/SKILL.md`
2. **Script**: `ops/content-flywheel/scripts/script_gen.py`
3. **Templates**: `ops/content-flywheel/config/script_templates.json`

## Requirements
- Input: Latest X-Scout radar markdown + upcoming fixtures (from oracle) + lore bible
- Output: Validated script JSON (schema in plan) saved to `~/hermes/content-buffer/scripts/`
- Rotate templates daily, avoid repeat topics within 7 days
- Include affiliate tags, referral codes, CTAs per template
- Grok prompt engineered for viral short-form (hook → data → lore → CTA)

## Skill Hints
- Apply `frontend-design` skill for any UI config
- Follow `gstack plan-eng-review` before coding (P0)

## Verification
```bash
cd ~/hermes/workspace/GoalChain && python ops/content-flywheel/scripts/script_gen.py --test
# Should output valid script JSON for each template
```

## Priority: P0 — Day 1 blocker for video pipeline

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
- Rollback: revert branch `exp/opencode-issue-519`.
