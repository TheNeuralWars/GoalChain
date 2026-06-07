# OA Proposal — Issue #382

## Title
[OPENCODE] [OPENCODE] Program: Full test suite (anchor test + integration) + SDK verification

## Source
GitHub issue #382

## Objective
## Objective
## Objective
Run full Anchor test suite for goalchain_program and verify integration with Oracle.

## Scope
### 1. Anchor Tests (goalchain_program/)
```bash
cd goalchain_program && anchor test --provider.cluster devnet
```
- All fixture instructions: initialize, place_bet, claim, refund, update_status
- All live market instructions: create, bet, claim, resolve, update_status
- Config instructions: initialize_config, update_config
- Player instructions: record_match, update_stats
- Vault instructions: crank, contributor epoch
- Builder fund instructions
- All error cases (unauthorized, invalid state, math overflow)

### 2. Integration Tests (goalchain_oracle/tests/)
- OracleService + ScraperService + VaultCrank via devnet
- End-to-end flow: initialize fixture → live updates → complete → claim payouts
- Market flow: create market → place bets → resolve → claim market payouts

### 3. SDK Verification
- goalchain-sdk IDL matches program IDL
- TypeScript client can build transactions for all instructions

### 4. Performance
- Transaction size < 1232 bytes (IPv6 MTU)
- Compute units < 200k per instruction
- Priority fee estimation accuracy

## Acceptance Criteria
- `anchor test` passes 100% on devnet
- All integration tests pass
- SDK types match program IDL
- No compute budget exceeded errors
- Build passes

## Skill Hint
Follow gstack plan-eng-review.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-382` and close draft PR.
