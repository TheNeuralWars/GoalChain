# [P1] On-chain sinks: fee burn/jackpot, match stamina, XI cap, rent split

**Labels:** `economy`, `P1`, `anchor`  
**Design:** [`docs/P1_ONCHAIN_SINKS_DESIGN.md`](../P1_ONCHAIN_SINKS_DESIGN.md)  
**Reconciliation:** [`docs/IMPLEMENTATION_STATUS.md`](../IMPLEMENTATION_STATUS.md)

## Implementation status (2026-05-24)

**On-chain core:** implemented in `goalchain_program/.../lib.rs` (GlobalConfig extensions, fee split, `oracle_record_match`, XI cap, rent split, BuilderFund).

**Follow-up (still open):**

- Oracle: wire `oracle_record_match` from `goalchain_oracle` after fixture resolution
- Tests: integration coverage for fee split lamports and 12th claim rejection
- Simulation: `scripts/tokenomics_simulation.py` fee_burn in S0
- Frontend: i18n burn vs treasury; ops status panels in webapp

## Scope (historical — on-chain items done)

1. Extend `GlobalConfig` with `fee_burn_bps`, `fee_jackpot_bps`, `max_starters_per_manager`.
2. Split claim fees: **40% burn / 40% jackpot / 20% treasury** (defaults).
3. Add `oracle_record_match` (−30 stamina, idempotent per fixture).
4. Add `ManagerDailyClaim` PDA — max **11** salary claims per manager per UTC day.
5. Update `rent_nft` — 70% renter / 25% owner / 5% protocol (burn/jackpot).

## Acceptance criteria

- [x] On-chain: GlobalConfig fields + fee split + `oracle_record_match` + XI cap + rent split (see `IMPLEMENTATION_STATUS.md`)
- [ ] Integration tests for fee split lamports
- [ ] 12th `claim_daily_salary` same day fails (automated test)
- [ ] i18n: distinguish burn vs treasury for bets
- [ ] Simulation script updated with fee_burn in S0
- [ ] OracleService invokes `oracle_record_match` on fixture close

## Estimate

~3–5 days Anchor + oracle + SDK + UI.
