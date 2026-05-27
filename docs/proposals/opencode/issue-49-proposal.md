# OA Proposal — Issue #49

## Title
[OPENCODE] Spike: Weekly pending tasks & blockers check

## Source
GitHub issue #49

## Objective
## Objective
Review all pending tasks, open PRs, blocked briefs, and GoalChain issues from the last 7 days. Summarize current status, blockers, and any actions needed. Include economy health if configured and recent intake activity.

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
- Rollback: revert branch `exp/opencode-issue-49` and close draft PR.
