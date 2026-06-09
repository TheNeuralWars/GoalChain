# OA Proposal — Issue #297

## Title
[OPENCODE] Task 3 - Surface Presale Status & Whitelist Form on Landing

## Source
Local queue (autonomous mode)

## Objective
## Objective
`goalchain_api/src/index.ts:874` already exposes `POST /api/whitelist` (writes wallet + email to `data/whitelist.json`) and `GET /api/economy/config` exposes `presaleActive`, `maxSolPerUser`, and `treasuryTokenAccount`. The Degen Preseason campaign is driving traffic to `goalchain.fun` but the webapp has no presale page, no whitelist form, no countdown, and no progress bar. Users arriving from X/Discord have nowhere to register intent or see live status. Action: (1) build a `PresalePanel.tsx` component in `goalchain_webapp/src/ui/` that fetches `/api/economy/config` and shows: presale live/off badge, per-wallet SOL cap, total raised (call a new `GET /api/presale/status` endpoint to be added in the API returning `whitelist.length` and aggregated SOL from prior contributions), and a countdown to next phase; (2) add the panel as the default route in `App.tsx` ahead of the marketplace; (3) add a wallet-connect-gated whitelist form that posts to the existing endpoint.

---
**Canonical specification file:** [2026-06-04-growth-task-3-surface-presale-status-whitelist-form-on-landing.md](file:///home/ubuntu/hermes/workspace/GoalChain/docs/intake/2026-06-04-growth-task-3-surface-presale-status-whitelist-form-on-landing.md)
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

## Priority
P1

## Labels
status:ready,source:manager,agent:opencode,priority:P1,

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-297`.
