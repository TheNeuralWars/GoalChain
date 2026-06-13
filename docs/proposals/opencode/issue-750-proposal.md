# OA Proposal — Issue #750

## Title
[OPENCODE] [DELEGATED] [P1][tech-debt] Archive goalchain_backend empty package at root

## Source
GitHub issue #750

## Objective
## Objective
Archive the empty goalchain_backend package at the repository root. This is a tech-debt cleanup task.

## Context
The repository contains an empty `goalchain_backend/` package at the root that serves no purpose. It should be archived/removed.

## Acceptance Criteria
- Remove the empty `goalchain_backend/` directory at repo root
- Verify no imports/references to it remain in the codebase
- Ensure anchor build still passes
- No regression on devnet

## Skill Hint
Follow gstack plan-eng-review before coding. This is a simple cleanup/refactor task.

## GitHub Issue
#431 - https://github.com/TheNeuralWars/GoalChain/issues/431

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
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #750
