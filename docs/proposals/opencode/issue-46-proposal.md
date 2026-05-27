# OA Proposal — Issue #46

## Title
[OPENCODE] Modify OA worker: research large-context open source coding agents

## Source
GitHub issue #46

## Objective
## Objective
Change the research focus of the OA worker. Instead of GoalChain tasks, make it search GitHub for open source coding agents with large token capacity that can ingest entire repositories + user context. Goal: find candidates we can import and test as general intelligence / AGI-like systems. Stop returning ISA results.

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
- No direct merge to `main` without Cursor integration review

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-46` and close draft PR.
