# OA Proposal — Issue #249

## Title
[OPENCODE] OpenCode — sesiones post-merge (GoalChain)

## Source
GitHub issue #249

## Objective
## Objective
Usar OpenCode como copiloto de sesiones para prototipos y alternativas en ramas `exp/opencode-*` despues de que `main` tenga la stack #26–#34.

---
**Canonical specification file:** [2026-05-23-opencode-post-merge-sessions.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-05-23-opencode-post-merge-sessions.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
opencode

## Priority
P2

## Context
Requested by Nico via Manager (hermes-ceo profile). Keep scope tight and aligned with GoalChain orchestration rules.

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
- Rollback: revert main commit linked to issue #249
