# Issue #479: [OPENCODE] [IMPL] #323 Fixture instructions (6)

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
## Task: Extract fixture instructions (Issue #323 → PR #408)

**Priority:** P0
**Branch:** exp/opencode-issue-323
**PR Target:** #408 (already approved)
**Depends on:** #331 (IDL sync) — wait for types

### Context
Approved with global vision: "On-chain Core: fixture/player instructions + IDL sync = lógica de juego inmutable, auditables, composables"

### Implementation Required
Create 7 files in `packages/program/src/instructions/fixture/`:

1. **`initialize_fixture.rs`** - Initialize new fixture
   - Accounts: `Fixture`, `Season`, `OracleAuthority`, `SystemProgram`
   - PDA: `fixture` = `["fixture", season_id, home_team, away_team, match_time]`
   - Event: `FixtureInitialized { fixture_id, season_id, home, away, match_time }`

2. **`oracle_upsert_live_state.rs`** - Update live match state
   - Accounts: `Fixture`, `OracleAuthority`
   - Only oracle authority can call
   - Fields: `minute`, `home_score`, `away_score`, `status` (PreMatch/Live/HT/FT/Completed)
   - Event: `LiveStateUpdated { fixture_id, minute, home_score, away_score, status }`

3. **`oracle_create_market.rs`** - Create live betting market
   - Accounts: `Fixture`, `Market`, `OracleAuthority`
   - PDA: `market` = `["market", fixture_id, market_type]`
   - Market types: `MatchWinner`, `TotalGoals`, `BothTeamsScore`, `CorrectScore`
   - Event: `MarketCreated { market_id, fixture_id, market_type, odds }`

4. **`oracle_update_market_status.rs`** - Update market status
   - Accounts: `Market`, `OracleAuthority`
   - Status: `Open`, `Closed`, `Resolved`
   - Event: `MarketStatusUpdated { market_id, status }`

5. **`update_fixture_status.rs`** - Update fixture status
   - Accounts: `Fixture`, `OracleAuthority`
   - Flow: `PreMatch` → `Live` → `Completed` (via `complete_fixture`)

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
- Rollback: revert branch `exp/opencode-issue-479`.
