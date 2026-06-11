# OA Proposal: Issue #262 — [ANTIGRAVITY] FCC queue reconciliation + model_not_supported retry — Antigravity (hands-free)

**Worker:** gamma (partition 2)
**Owner:** antigravity
**Priority:** P1
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
## Objective
Unblock the 24/7 FCC pipeline on the VPS: sync GitHub issue labels with worker state, fix the worker so it cannot “finish” without updating GitHub, re-run failed `model_not_supported` tasks, then drain **all** eligible `status:ready` opencode issues one-by-one until the queue is empty.

---
**Canonical specification file:** [2026-05-27-fcc-queue-reconciliation-antigravity.md](file:///home/goalchain/hermes/workspace/GoalChain/docs/intake/2026-05-27-fcc-queue-reconciliation-antigravity.md)
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
