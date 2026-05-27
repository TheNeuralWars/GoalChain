# OA Proposal — Issue #41

## Title
[OPENCODE] Discord notifications from OA worker

## Source
GitHub issue #41

## Objective
## Objective
Modify oa-worker.sh to post research findings/notifications to Discord using the Discord API token from repository secrets when the bot processes issues or creates PRs

## Owner
opencode

## Priority
P2

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
- Rollback: revert branch `exp/opencode-issue-41` and close draft PR.
