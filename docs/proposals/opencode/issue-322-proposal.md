# Issue #322 Proposal: Extract Builder Fund Instructions

## Objective
Extract 4 builder fund instructions from `lib.rs` into separate files under `programs/goalchain_program/src/instructions/builder_fund/`:
1. `initialize_builder_fund.rs` - Initialize builder fund (lib.rs lines 127-176)
2. `update_builder_fund_weights.rs` - Update weight distribution (lib.rs lines 208-236)
3. `update_builder_fund_guardrails.rs` - Update guardrails (lib.rs lines 178-206)
4. `fund_builder_fund.rs` - Fund the builder fund (lib.rs lines 238-335)
5. `mod.rs` - Re-export all

## Proposed File List

### New Files
1. `goalchain_program/programs/goalchain_program/src/math.rs` - BPS calculation helpers
2. `goalchain_program/programs/goalchain_program/src/instructions/builder_fund/mod.rs` - Module exports
3. `goalchain_program/programs/goalchain_program/src/instructions/builder_fund/initialize_builder_fund.rs`
4. `goalchain_program/programs/goalchain_program/src/instructions/builder_fund/update_builder_fund_weights.rs`
5. `goalchain_program/programs/goalchain_program/src/instructions/builder_fund/update_builder_fund_guardrails.rs`
6. `goalchain_program/programs/goalchain_program/src/instructions/builder_fund/fund_builder_fund.rs`

### Modified Files
1. `goalchain_program/programs/goalchain_program/src/lib.rs` - Remove inline instruction handlers, import from modules
2. `goalchain_program/programs/goalchain_program/src/instructions/mod.rs` - Already exports `builder_fund` module (line 4)

## Implementation Plan

### Step 1: Create `math.rs` with BPS helpers
- `split_bps_amount(total: u64, bps: u16) -> Result<u64>` - Calculate amount for given BPS
- `split_bps_amounts(total: u64, bps_list: &[u16]) -> Result<Vec<u64>>` - Split total across multiple BPS
- `validate_bps_sum(bps_list: &[u16], expected: u16) -> Result<()>` - Validate sum equals expected (10000)

### Step 2: Create instruction files
Each file will:
- Import necessary types from `crate::state`, `crate::errors`, `crate::constants`
- Define the handler function matching the existing signature
- Use `math.rs` helpers for BPS calculations
- Emit the corresponding event (already defined in lib.rs)
- Keep under 150 lines

### Step 3: Create `builder_fund/mod.rs`
- Re-export all 4 instruction modules
- Follow existing pattern from `betting.rs`

### Step 4: Update `lib.rs`
- Remove inline instruction implementations (lines 127-335)
- Add `pub mod math;` and `pub use crate::instructions::builder_fund::*;` 
- In the `#[program]` module, call the extracted functions

## Acceptance Criteria
- [ ] Each instruction file < 150 lines
- [ ] Uses `math.rs` for BPS calculations
- [ ] Emits `BuilderFundInitialized`, `WeightsUpdated`, `GuardrailsUpdated`, `FundDeposited` events
- [ ] Validates total BPS = 10000
- [ ] `anchor build` succeeds
- [ ] `anchor test --validator legacy` passes

## Risks & Regressions

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Event emission broken | Low | High | Events defined in lib.rs, modules import via `crate::` |
| Account validation mismatch | Medium | High | Copy account structs exactly from lib.rs |
| BPS math errors | Low | High | Unit tests in math.rs; reuse existing logic |
| Anchor IDL drift | Low | Medium | Run `anchor build` to verify IDL unchanged |

## Rollback Plan
If issues arise:
1. Revert `lib.rs` to inline implementations
2. Delete new instruction files and `math.rs`
3. Run `anchor build` to confirm working state

## Test Commands
```bash
# Build program
cd goalchain_program && anchor build

# Run tests (includes builder fund tests)
cd goalchain_program && anchor test --validator legacy

# Lint check
cd goalchain_program && npm run lint
```

## Dependencies
- No external dependencies
- Uses existing `anchor_lang`, `anchor_spl`, `crate::state`, `crate::errors`, `crate::constants`