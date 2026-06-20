# OA Proposal — Issue #809

## Title
[HERMES] review and change images

## Source
GitHub issue #809

## Objective
## Objective
i need to review what of the images are displayed as nfts on the page. many of them, as the players images that will represent the nfts, are not shown correctly, because the files are still not produced. but unstead of showing some image as "soon" or "not available" my agent put any random image from my repository. I need to check those, and fix what there's no need to be there.

## Owner
hermes

## Priority
P0

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
  - hermes: `exp/hermes-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #809
