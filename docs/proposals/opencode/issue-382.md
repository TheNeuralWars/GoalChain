# Issue #382: [OPENCODE] [OPENCODE] Program: Full test suite (anchor test + integration) + SDK verification

## Source
Local queue (autonomous FIFO mode)

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

## Priority
P0

## Labels
status:ready,source:manager,agent:opencode,priority:P0,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-382`.
