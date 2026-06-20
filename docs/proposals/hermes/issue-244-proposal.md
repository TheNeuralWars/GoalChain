# OA Proposal — Issue #244

## Title
[OPENCODE] Handoff Antigravity — Hermes + OpenClaw + Voice (GoalChain)

## Source
GitHub issue #244

## Objective
## Objective
Completar en el servidor Hermes (`178.105.148.109`) la integración OpenClaw + Grok + Voice Call (Twilio/ngrok), sin romper el flujo Hermes (`~/hermes`).

---
**Canonical specification file:** [2026-05-23-antigravity-hermes-openclaw-handoff.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-05-23-antigravity-hermes-openclaw-handoff.md)
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
- Rollback: revert main commit linked to issue #244
