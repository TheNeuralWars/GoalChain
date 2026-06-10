# Issue #480: [OPENCODE] [IMPL] #326 Player instructions (7)

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
## Task: Extract player instructions (Issue #326 → PR #407)

**Priority:** P0
**Branch:** exp/opencode-issue-326
**PR Target:** #407 (already approved)
**Depends on:** #331 (IDL sync), #408 (fixture instructions share PDA/validators)

### Context
Approved with global vision: "On-chain Core: fixture/player instructions + IDL sync = lógica de juego inmutable, auditables, composables"

### Implementation Required
Create 8 files in `packages/program/src/instructions/player/`:

1. **`initialize_player.rs`** - Initialize new player NFT
   - Accounts: `Player`, `PlayerMint`, `Collection`, `OracleAuthority`, `TokenProgram`, `MetadataProgram`
   - PDA: `player` = `["player", mint]`
   - SPL Token + Metaplex metadata
   - Event: `PlayerInitialized { player_id, mint, name, position, team }`

2. **`update_player_stats.rs`** - Update player season stats
   - Accounts: `Player`, `Fixture`, `OracleAuthority`
   - Fields: `goals`, `assists`, `minutes_played`, `yellow_cards`, `red_cards`, `xG`, `xA`
   - Event: `PlayerStatsUpdated { player_id, fixture_id, stats }`

3. **`update_player_market_value.rs`** - Update market valuation
   - Accounts: `Player`, `OracleAuthority`
   - Formula: base + performance multiplier + form factor
   - Event: `MarketValueUpdated { player_id, old_value, new_value }`

4. **`create_player_market.rs`** - Create player-specific betting market
   - Accounts: `Player`, `Market`, `OracleAuthority`
   - PDA: `market` = `["market", player_id, market_type]`
   - Types: `AnytimeScorer`, `FirstScorer`, `PlayerAssists`, `PlayerShots`, `PlayerCards`
   - Event: `MarketCreated { market_id, player_id, market_type, odds }`

5. **`update_player_form.rs`** - Update form rating (last 5 fixtures)
   - Accounts: `Player`, `OracleAuthority`
   - Rolling window: last 5 fixtures weighted
   - Event: `FormUpdated { player_id, form_rating, fixtures_analyzed }`

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
- Rollback: revert branch `exp/opencode-issue-480`.
