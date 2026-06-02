# OA Proposal — Issue #261

## Title
[ANTIGRAVITY] FCC queue freeze — Mundial 2026 focus

## Source
GitHub issue #261

## Objective
## Objective
Pause the generic FCC batch (#95–#99) until **Mundial MVP** ships. Single implementation track: [`MUNDIAL-2026-MVP.md`](MUNDIAL-2026-MVP.md).

---
**Canonical specification file:** [2026-05-26-mundial-fcc-queue-freeze.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-05-26-mundial-fcc-queue-freeze.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
antigravity

## Priority
P1

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
- Rollback: revert main commit linked to issue #261
