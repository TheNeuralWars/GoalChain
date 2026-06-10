# Issue #526: [MONEY-PRINTER] Greek Team Integration: Shared Repo Structure & Collaboration Protocol

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Establish shared infra, repo structure, and collaboration protocol with Greek team for content flywheel.

## Context
- Plan: docs/implementation-plans/money-printer-goalchain-plan.md
- Greek team: Video editing, platform growth, analytics expertise
- GoalChain team: Football data, lore, betting angles, on-chain
- Channels: #dev-room (tech), #marketing-active (strategy), shared Notion

## Deliverables
1. Repo structure: ops/content-flywheel/ (scripts, skills, config, cron)
2. Collaboration protocol doc: docs/GREEK_TEAM_COLLABORATION.md
3. Shared Notion workspace setup (analytics dashboards, content calendar)

## Repo Structure


## Collaboration Protocol
| Greek Team Owns | GoalChain Owns | Sync |
|-----------------|----------------|------|
| Video editing templates | Script prompts + data | Weekly #dev-room |
| Platform growth tactics | Lore + betting angles | Daily #marketing-active |
| Analytics dashboards | On-chain attribution | Shared Notion |
| Thumbnail/hook A/B | Referral code generation | PR reviews |

## Greek Team Onboarding
1. Access to Hermes marketing-active profile (Grok Imagine, ElevenLabs)
2. Pexels API key, Canva API access
3. Discord roles for #dev-room, #marketing-active
4. Notion workspace invite
5. First sprint: Polish video_render output quality (transitions, branding)

## Verification
Greek team can run video_render.py locally and produce branded MP4.

## Priority: P0 — Day 1 alignment
EOF

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
- Rollback: revert branch `exp/opencode-issue-526`.
