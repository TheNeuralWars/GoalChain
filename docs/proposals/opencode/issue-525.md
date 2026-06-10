# Issue #525: [MONEY-PRINTER] Optimization Loop: A/B Testing + Prompt Evolution

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Build continuous optimization: A/B test hooks/thumbnails/CTAs, evolve Grok prompts via RL from analytics.

## Context
- Plan: docs/implementation-plans/money-printer-goalchain-plan.md
- Analytics engine (issue #523) provides metric feed
- Grok script_gen prompts are the primary optimization target

## Deliverables
1. A/B framework: ops/content-flywheel/scripts/ab_test.py
2. Prompt evolution: ops/content-flywheel/scripts/prompt_evolver.py
3. UGC integration: ops/content-flywheel/scripts/ugc_remix.py

## A/B Testing
- Variables: Hook (first 3s), thumbnail, CTA text, music, video pacing
- Assignment: Hash(video_id + variant) → consistent bucketing
- Statistical: Sequential testing, 95% confidence, min 1000 views/variant
- Winner: Auto-promote to default template

## Prompt Evolution (RL)
- State: Template + hook style + visual density + lore depth
- Action: Grok prompt parameters (temperature, few-shot examples, constraints)
- Reward: CTR * conversion_rate * revenue_per_conversion
- Algorithm: Bandit (Thompson Sampling) → prompt library versioning

## UGC Remix
- Monitor Discord #genesis-lounge for player clips (uploaded or linked)
- Best clips (by engagement) → auto-remix into new videos
- Credit original creator in description + referral code

## Verification
Run A/B test with 2 hook variants, measure CTR difference.

## Priority: P1 — Phase 3 (Week 2-3)

## Priority
P1

## Labels
P1,status:ready,agent:opencode,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-525`.
