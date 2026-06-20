# OA Proposal — Issue #280

## Title
[OPENCODE] Voice Task: /status

## Source
GitHub issue #280

## Objective
## Objective
This task was received as a voice note from Nico via the Telegram Bot and transcribed autonomously using the Gemini Multimodal Audio engine.

---
**Canonical specification file:** [2026-06-02-voice-task-1780394544.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-06-02-voice-task-1780394544.md)
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
- Rollback: revert main commit linked to issue #280
