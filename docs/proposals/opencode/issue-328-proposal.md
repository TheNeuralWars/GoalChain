# OA Proposal — Issue #328

## Title
[OPENCODE] Program: Extract governance instructions (3 instructions)

## Source
GitHub issue #328

## Objective
## Objective
Extract governance instructions into programs/goalchain_program/src/instructions/governance/:

## Scope
1. `propose.rs` - Create governance proposal
2. `vote.rs` - Vote on proposal
3. `execute_proposal.rs` - Execute passed proposal
4. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 150 lines
- Emit ProposalCreated, VoteCast, ProposalExecuted events
- Quorum and threshold validation
- Timelock for execution

## Skill Hint
Follow gstack plan-eng-review before coding.

## Owner
opencode

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
- Rollback: revert main commit linked to issue #328
