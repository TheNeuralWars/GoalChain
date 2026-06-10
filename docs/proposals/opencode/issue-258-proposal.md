# OA Proposal — Issue #258

## Title
[ANTIGRAVITY] Hermes bridge reconnect — Mac (Cursor) ↔ VPS (Manager)

## Source
GitHub issue #258

## Objective
## Objective
Please review and implement the research/intake recommendations.

---
**Canonical specification file:** [2026-05-26-hermes-bridge-reconnect.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-05-26-hermes-bridge-reconnect.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
antigravity

## Priority
P0

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
- Rollback: revert branch `exp/opencode-issue-258` and close draft PR.
