# Issue #474: [opencode] P1: Capture JitoSOL yield on treasury SOL holdings by staking via the existing `treasury_jito_ata` + Stake Pool CPI, creating a sustainable yield stream that feeds the buyback/burn loop and reduces net SOL emissions.

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Capture JitoSOL yield on treasury SOL holdings by staking via the existing `treasury_jito_ata` + Stake Pool CPI, creating a sustainable yield stream that feeds the buyback/burn loop and reduces net SOL emissions.

## Context
- **Existing infrastructure:** `lib.rs:1184-1256` implements `deposit_sol` → Jito Stake Pool CPI → mints JitoSOL to `treasury_jito_ata`
- **Current state:** Infrastructure exists but not actively used for yield harvesting
- **JitoSOL APY:** ~7-9% (varies with SOL staking yield + MEV tips)
- **Economic loop:** Treasury SOL → JitoSOL → yield (SOL) → buyback GCH → burn → deflationary pressure

## Yield Harvest Flow
```
1. Treasury holds SOL in `treasury_sol_vault`
2. Periodic crank: deposit_sol(treasury_sol_vault → Jito Stake Pool) → JitoSOL to treasury_jito_ata
3. JitoSOL accrues value (1 JitoSOL = 1.07 SOL after ~1 year)
4. Yield harvest crank: withdraw_jitosol(treasury_jito_ata → treasury_sol_vault) → excess SOL
5. Excess SOL → vault crank → buyback GCH → burn
6. Repeat
```

## Implementation Files
| File | Purpose |
|------|---------|
| `goalchain_oracle/src/yield/jitosol_harvest.ts` | `harvestJitoSOLYield()` — withdraw, calculate yield, return excess SOL |
| `goalchain_oracle/src/yield/stake_crank.ts` | `stakeTreasurySOL(amount)` — deposit SOL to Jito pool via CPI |
| `goalchain_oracle/src/yield/scheduler.ts` | Cron: stake weekly, harvest monthly (configurable) |
| `goalchain_program/.../instructions/withdraw_jitosol.rs` | On-chain: withdraw JitoSOL → SOL (requires Stake Pool withdrawal CPI) |

## On-Chain Withdrawal (New Instruction Needed)
Currently only `deposit_sol` exists. Need `withdraw_jitosol` instruction:
```rust
// In lib.rs - new instruction
pub fn withdraw_jitosol(ctx: Context<WithdrawJitoSOL>, amount: u64) -> Result<()> {
    // 1. Burn JitoSOL from treasury_jito_ata
    // 2. CPI to Stake Pool: withdraw_sol
    // 3. Receive SOL to treasury_sol_vault
    // 4. Emit event with yield amount
}
```

## Acceptance Criteria

## Priority
P1

## Labels
status:ready,source:manager,agent:opencode,priority:P1,devnet,area:oracle,jito,mev,yield,treasury,area:program,jitosol,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-474`.
