# OA Proposal — Issue #327

## Title
[OPENCODE] Program: Extract vault instructions (6 instructions)

## Source
GitHub issue #327

## Objective
## Objective
Extract vault instructions into programs/goalchain_program/src/instructions/vault/:

## Scope
1. `initialize_vault.rs` - Initialize vault with strategy
2. `deposit.rs` - Deposit tokens into vault
3. `withdraw.rs` - Withdraw from vault
4. `compound.rs` - Compound yields
5. `crank_vault.rs` - Crank vault (rebalance, harvest)
6. `update_vault_strategy.rs` - Update vault strategy parameters
7. `mod.rs` - Re-export all

## Acceptance Criteria
- Each file < 150 lines
- Emit VaultInitialized, Deposited, Withdrawn, Compounded, Cranked, StrategyUpdated events
- Strategy pattern for different yield sources
- Proper share accounting

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #327
