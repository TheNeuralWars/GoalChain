# OA Proposal — Issue #329

## Title
[OPENCODE] Program: Extract contributor instructions (4 instructions)

## Source
GitHub issue #329

## Objective
## Objective
Extract contributor instructions into programs/goalchain_program/src/instructions/contributor/:

## Scope
1. `register_contributor.rs` - Register as contributor
2. `update_contributor_score.rs` - Update contributor score (admin/oracle)
3. `claim_contributor_rewards.rs` - Claim epoch rewards
4. `contributor_epoch_transition.rs` - Process epoch transition, distribute rewards
5. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 150 lines
- Emit ContributorRegistered, ScoreUpdated, RewardsClaimed, EpochTransitioned events
- Score decay and epoch boundary logic
- Reward distribution via math.rs

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-329` and close draft PR.
