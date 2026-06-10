# Issue #512: [OPENCODE] [P0] #309 Oracle players module (record match, update stats)

## Source
Local queue (autonomous FIFO mode)

## Objective
# [OPENCODE] [P0] #309 Oracle players module (record match, update stats)

## Priority: P0 (oracle — player data pipeline)
## Labels: agent:opencode, priority:P0, area:oracle, status:blocked

## Objective
Extract player data operations into dedicated `players` module in oracle.

## Module Structure
```
goalchain_oracle/src/players/
├── index.ts                 # Public exports
├── providers.ts             # Data providers (StatsBomb, FotMob, etc.)
├── recorder.ts              # recordPlayerMatch logic
├── stats-updater.ts         # updatePlayerStats logic
├── rarity-engine.ts         # rarity tier calculation
├── nft-metadata.ts          # NFT metadata generation
└── types.ts                 # Player, MatchPerformance, RarityTier
```

## Functions to Implement
| Function | Input | Output |
|----------|-------|--------|
| `fetchPlayerData(playerId)` | Player ID | Raw provider data |
| `recordMatchPerformance(fixtureId, playerPerformances)` | Fixture + performances | List of tx signatures |
| `updateSeasonStats(playerId, season)` | Player + season | Updated on-chain stats |
| `calculateRarityTier(stats, minutes)` | Stats + minutes | RarityTier enum |
| `generateNFTMetadata(player, rarity)` | Player + tier | Metaplex JSON |

## Integration Points
- **Program**: `record_player_match`, `update_player_stats` instructions (#326)
- **SDK**: Player client methods
- **CLI**: `oracle players:record`, `oracle players:update-stats` (#312)

## Verification
```bash
cd goalchain_oracle
npm run typecheck
npm run test -- --grep "players"
```

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,area:oracle,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-512`.
