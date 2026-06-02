# OA Proposal — Issue #242

## Title
[OPENCODE] Conectar goalchain_webapp a flujos reales en Devnet (MVP)

## Source
GitHub issue #242

## Objective
## Objective
Reemplazar datos y acciones simuladas en `goalchain_webapp` por lectura on-chain y al menos una transacción firmada real en Devnet (`place_bet`), alineada con `docs/FRONTEND_OWNERSHIP_POLICY.md`.

---
**Canonical specification file:** [2026-05-22-webapp-devnet-transactions.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-05-22-webapp-devnet-transactions.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
opencode

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
- Rollback: revert main commit linked to issue #242
