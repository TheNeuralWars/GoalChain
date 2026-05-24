# OA Proposal — Issue #42

## Title
[OPENCODE] Dedicated Discord channel for OA research notifications

## Source
GitHub issue #42

## Objective
## Objective
Create a new Discord channel exclusively for OA worker research findings. Update oa-worker.sh (or config) to post notifications to this specific channel ID using the Discord API token from secrets. Restart worker after changes.

## Owner
opencode

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- No direct merge to `main` without Cursor integration review

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-42` and close draft PR.
