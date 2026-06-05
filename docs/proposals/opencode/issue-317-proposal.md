# Issue #317 Proposal: Extract State Module (13 Account Structs)

## Objective
Extract all account structs from `lib.rs` into `programs/goalchain_program/src/state/` with one file per account struct as specified in the issue.

## Current State Analysis
- All account structs (`#[account]`) and related enums are defined inline in `lib.rs` (141k lines)
- Instructions are partially modularized in `src/instructions/` but still import from `crate::state` and `crate::constants` which don't exist yet
- `state.rs` exists but is empty (0 bytes)
- Constants are defined at top of `lib.rs` (lines 11-25)

## Proposed File Structure

```
programs/goalchain_program/src/state/
├── mod.rs              # Re-exports all state modules
├── config.rs           # GlobalConfig
├── builder_fund.rs     # BuilderFund, ContributorScore, BuilderContributorEpoch, EpochContributorSnapshot, EpochContributorClaim, BuilderFundBucket
├── fixture.rs          # Fixture, MatchStatus, MatchResult, UserBet
├── live_state.rs       # LiveMatchState
├── market.rs           # Market, MarketType, MarketStatus
├── position.rs         # MarketPosition
├── player.rs           # ParodyPlayer, RentalListing
├── player_match.rs     # PlayerMatchRecord
├── vault.rs            # Vault-related (token account PDAs, no dedicated account struct - may be minimal)
├── stake_pool.rs       # UserStake
├── reward_pool.rs      # ManagerState, ManagerDailyClaim, StadiumState
└── contributor.rs      # ContributorScore (if separate from builder_fund)
```

**Note:** The issue lists 13 account struct files + mod.rs. Some files will contain multiple related structs (e.g., `builder_fund.rs` contains 5 account structs + 1 enum).

## Account Struct Mapping

| File | Structs/Enums | Lines in lib.rs |
|------|---------------|-----------------|
| config.rs | GlobalConfig | 2436-2451 |
| builder_fund.rs | BuilderFund, ContributorScore, BuilderContributorEpoch, EpochContributorSnapshot, EpochContributorClaim, BuilderFundBucket | 2481-2558 |
| fixture.rs | Fixture, MatchStatus, MatchResult, UserBet | 3511-3555 |
| live_state.rs | LiveMatchState | 3559-3570 |
| market.rs | Market, MarketType, MarketStatus | 3572-3618 |
| position.rs | MarketPosition | 3620-3631 |
| player.rs | ParodyPlayer, RentalListing | 3110-3138, 3177-3184 |
| player_match.rs | PlayerMatchRecord | 3859-3866 |
| vault.rs | (No dedicated #[account] struct - token vaults are PDAs) | N/A |
| stake_pool.rs | UserStake | 3075-3082 |
| reward_pool.rs | ManagerState, ManagerDailyClaim, StadiumState | 3843-3873 |
| contributor.rs | (ContributorScore already in builder_fund.rs - may be minimal or removed) | N/A |

## Implementation Plan

### Step 1: Create Constants Module
- Extract constants from `lib.rs` (lines 11-25) into `src/constants.rs`
- Update all instruction modules to import from `crate::constants`

### Step 2: Create State Module Files
- Create `src/state/` directory
- Create each file with proper `#[account]` macros, `InitSpace` derives, and PDA seed constants
- Ensure each file < 100 lines
- Preserve Anchor discriminators (do not change struct field order)

### Step 3: Create state/mod.rs
- Re-export all state modules
- Add `pub use` for all account structs and enums

### Step 4: Update lib.rs
- Remove all account struct definitions from lib.rs
- Add `pub mod state;` and `pub mod constants;`
- Import needed types from `crate::state`
- Keep program logic, instructions, and errors in lib.rs

### Step 5: Fix Instruction Imports
- Update instruction modules to import from `crate::state::*` instead of `crate::state::config::*` etc.
- Ensure all imports resolve correctly

### Step 6: Build and Test
- Run `anchor build` to verify compilation
- Run `anchor test --validator legacy` to verify functionality

## Risks & Regressions

### High Risk
- **Anchor Discriminator Changes**: If struct field order changes, on-chain accounts become unreadable. **Mitigation**: Preserve exact field order from lib.rs; verify with `anchor keys list`.
- **PDA Seed Mismatches**: Instructions use hardcoded seeds (e.g., `b"config"`, `b"fixture"`). **Mitigation**: Extract seed strings as constants in each state file; verify against deployed program.

### Medium Risk
- **Import Breakage**: Instruction modules currently import from non-existent `crate::constants` and `crate::state::config`. **Mitigation**: Fix all imports in one pass after state module creation.
- **InitSpace Calculation**: `#[derive(InitSpace)]` must calculate correct space. **Mitigation**: Compare generated INIT_SPACE with current lib.rs usage.

### Low Risk
- **File Size**: Each file must be < 100 lines. **Mitigation**: Group related small structs (enums, simple accounts) together.

## Rollback Plan
1. `git checkout -- programs/goalchain_program/src/lib.rs` - restore original lib.rs
2. `rm -rf programs/goalchain_program/src/state programs/goalchain_program/src/constants.rs` - remove new files
3. `anchor build` - verify original compiles

## Test Commands

```bash
# Build verification
cd /data/apps/GoalChain/goalchain_program && anchor build

# Test suite (requires local validator)
cd /data/apps/GoalChain/goalchain_program && anchor test --validator legacy

# Lint check
cd /data/apps/GoalChain/goalchain_program && npm run lint

# Verify discriminators match deployed program
cd /data/apps/GoalChain/goalchain_program && anchor keys list
```

## Acceptance Criteria Verification
- [ ] Each state file < 100 lines
- [ ] Anchor discriminators match deployed program (verify with `anchor keys list`)
- [ ] PDA seeds use constants (extracted to each state file)
- [ ] Proper space calculations for init (`InitSpace` derive preserved)
- [ ] `#[account]` macros preserved on all account structs
- [ ] `anchor build` succeeds
- [ ] `anchor test --validator legacy` passes

## Branch & PR
- Branch: `exp/opencode-issue-317` (per opencode naming convention)
- PR: Draft, titled "Extract state module (issue #317)"
- No direct merge to main (no `cambio urgente` in issue)