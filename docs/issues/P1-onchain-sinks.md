# [P1] On-chain sinks: fee burn/jackpot, match stamina, XI cap, rent split

**Labels:** `economy`, `P1`, `anchor`  
**Design:** [`docs/P1_ONCHAIN_SINKS_DESIGN.md`](../P1_ONCHAIN_SINKS_DESIGN.md)

## Scope

1. Extend `GlobalConfig` with `fee_burn_bps`, `fee_jackpot_bps`, `max_starters_per_manager`.
2. Split claim fees: **40% burn / 40% jackpot / 20% treasury** (defaults).
3. Add `oracle_record_match` (−30 stamina, idempotent per fixture).
4. Add `ManagerDailyClaim` PDA — max **11** salary claims per manager per UTC day.
5. Update `rent_nft` — 70% renter / 25% owner / 5% protocol (burn/jackpot).

## Acceptance criteria

- [ ] Integration tests for fee split lamports.
- [ ] 12th `claim_daily_salary` same day fails.
- [ ] i18n: distinguish burn vs treasury for bets.
- [ ] Simulation script updated with fee_burn in S0.

## Estimate

~3–5 days Anchor + oracle + SDK + UI.
