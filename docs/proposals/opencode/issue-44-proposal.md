# OA Proposal — Issue #44

## Title
[OPENCODE] Deep research: football economy mechanics comparison

## Source
GitHub issue #44

## Objective
## Objective
Research and document how other football manager/economy games handle transfer markets, salary caps, and fan economy. Compare to GoalChain and propose improvements.

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
- Rollback: revert branch `exp/opencode-issue-44` and close draft PR.
