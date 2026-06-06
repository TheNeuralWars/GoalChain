# OA Proposal — Issue #358

## Title
[OPENCODE] [OPENCODE] SDK: Restructure goalchain-sdk modular architecture (constants, types, client, utils, idl)

## Source
GitHub issue #358

## Objective
## Objective
## Objective
Restructure goalchain-sdk from monolithic flat export to clean modular architecture with barrel exports, subpath imports, and typed client classes.

## Scope
Create new folder structure under goalchain-sdk/src/:

```
goalchain-sdk/
├── src/
│   ├── index.ts                    # Barrel export (public API only)
│   ├── constants/
│   │   ├── index.ts                # Re-export all constants
│   │   ├── seeds.ts                # PDA seeds (CONFIG, STAKE, PLAYER, RENTAL, WAGER, FIXTURE, LIVE_STATE, MARKET, POSITION, etc.)
│   │   ├── program-id.ts           # PROGRAM_ID constant
│   │   └── discriminators.ts       # Instruction discriminator lookup
│   ├── types/
│   │   ├── index.ts                # Re-export all user-facing types
│   │   ├── accounts.ts             # Account type shapes (Config, Player, Fixture, Market, Position, Wager, Stake, Rental, BuilderFund, BuilderContributorEpoch, etc.)
│   │   ├── instructions.ts         # Instruction arg types (CreateWagerArgs, InitializeConfigArgs, InitializeFixtureArgs, etc.)
│   │   ├── events.ts               # Event type shapes
│   │   └── errors.ts               # Custom error classes
│   ├── idl/
│   │   ├── index.ts                # IDL re-export + typed IDL (GoalchainProgram type)
│   │   └── goalchain_program.json  # Raw IDL (source of truth, keep existing)
│   ├── client/
│   │   ├── index.ts                # High-level client helpers
│   │   ├── config.ts               # ConfigAccountClient (fetch, subscribe, PDA derivation)
│   │   ├── player.ts               # PlayerAccountClient
│   │   ├── fixture.ts              # FixtureAccountClient
│   │   ├── market.ts               # MarketAccountClient
│   │   ├── position.ts             # PositionAccountClient
│   │   ├── wager.ts                # WagerAccountClient
│   │   ├── stake.ts                # StakeAccountClient
│   │   ├── rental.ts               # RentalAccountClient
│   │   ├── live-state.ts           # LiveStateAccountClient
│   │   └── builder-fund.ts         # BuilderFundClient + BuilderContributorEpochClient
│   └── utils/
│       ├── index.ts
│       ├── pda.ts                  # PDA derivation helpers (SINGLE SOURCE OF TRUTH for all findProgramAddressSync)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-358` and close draft PR.
