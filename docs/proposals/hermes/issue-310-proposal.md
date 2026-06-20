# OA Proposal — Issue #310

## Title
[OPENCODE] Oracle: Extract economy module (rarity yield, vault crank, contributor epoch, initialize tokens)

## Source
GitHub issue #310

## Objective
## Objective
Extract economy cron jobs into packages/oracle/src/economy/:

## Scope
Create `packages/oracle/src/economy/` with:

1. `rarityYield.ts` - Daily yield calculation per rarity tier (from rarityYield.ts, 126 lines)
   - Must use ECONOMIC_CANONICAL_CONFIG.json as source of truth
   - base_yield_for_rarity_tier() matching Rust implementation
2. `vaultCrank.ts` - Vault rebalancing/compounding (from vault_crank.ts, 232 lines)
3. `contributorEpochHook.ts` - Epoch transition, score distribution (from contributor_epoch_hook.ts, 183 lines)
4. `initializeTokens.ts` - Token mint/ATA setup (from initialize_tokens.ts, 75 lines)
5. `economy.ts` - Composed EconomyService class
6. `types.ts` - YieldConfig, VaultCrankConfig, ContributorEpochConfig

## Canonical Config Enforcement
- All yield values MUST reference docs/ECONOMIC_CANONICAL_CONFIG.json
- No hardcoded lamport values
- Import from @goalchain/sdk constants

## Acceptance Criteria
- Each file < 200 lines
- Idempotent crank operations
- Proper epoch boundary handling
- Unit tests for yield calculation accuracy

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #310
