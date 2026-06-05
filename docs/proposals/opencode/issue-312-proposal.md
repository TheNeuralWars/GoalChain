# Issue #312: Oracle CLI Commands Implementation Proposal

## Objective
Build CLI entry points in `packages/oracle/src/cli/` (actually `goalchain_oracle/src/cli/`) with 12 commands + commander builder.

## Proposed File Structure
```
goalchain_oracle/src/cli/
├── commands/
│   ├── sync-authority.ts      # Sync oracle authority to config
│   ├── init-fixture.ts        # Initialize new fixture
│   ├── live-update.ts         # Push live state update
│   ├── create-market.ts       # Create live market
│   ├── resolve-market.ts      # Resolve market with winner
│   ├── complete-fixture.ts    # Complete fixture + record players
│   ├── record-player.ts       # Record player match participation
│   ├── update-stats.ts        # Update player goals/assists
│   ├── crank-vaults.ts        # Run vault crank
│   ├── contributor-epoch.ts   # Run contributor epoch transition
│   └── init-tokens.ts         # Initialize token mints/ATAs
├── oracle-cli.ts              # Commander.js builder with all commands
└── index.ts                   # Barrel export
```

## Implementation Plan

### 1. Add Commander.js Dependency
Add `commander` and `@types/commander` to `goalchain_oracle/package.json`.

### 2. Shared Options (All Commands)
Each command will support:
- `--rpc-url <url>` - Solana RPC URL (default: http://127.0.0.1:8899)
- `--keypair <path>` - Path to keypair file (default: ~/.config/solana/id.json)
- `--program-id <id>` - Program ID (default: FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg)
- `--dry-run` - Print transaction details without sending (boolean flag)

### 3. Command Specifications

| Command | Required Args | Optional Args | Notes |
|---------|--------------|---------------|-------|
| `sync-authority` | --treasury-ata, --jackpot-ata | --dry-run | Syncs oracle authority to config PDA |
| `init-fixture` | --match-id, --team-a, --team-b, --start-time | | Initializes new fixture |
| `live-update` | --match-id, --minute, --score-a, --score-b | --ht, --ft | Updates live match state |
| `create-market` | --match-id, --market-id, --delay-seconds, --close-minute, --token-mint | --market-type, --cooldown, --max-goal-diff, --require-tied | Creates live betting market |
| `resolve-market` | --match-id, --market-id, --winner | | Resolves market (winner: teamA/teamB/draw) |
| `complete-fixture` | --match-id, --winner | --participant-players | Completes fixture, optionally records players |
| `record-player` | --match-id, --player-id | | Records player participation |
| `update-stats` | --player-id, --goals, --assists | | Updates player stats |
| `crank-vaults` | | VAULT_* env vars | Runs vault crank (uses existing vault_crank.ts) |
| `contributor-epoch` | | CONTRIBUTOR_* env vars | Runs contributor epoch (uses existing contributor_epoch_hook.ts) |
| `init-tokens` | | | Initializes GCH mint and ATAs (uses existing initialize_tokens.ts) |

### 4. Package.json Scripts Update
Add new script:
```json
"cli": "tsc && node dist/cli/oracle-cli.js"
```

### 5. Barrel Export (index.ts)
Export all command modules and the CLI builder for programmatic use.

## Risks & Regressions

| Risk | Mitigation |
|------|------------|
| Breaking existing npm scripts | Keep all existing scripts intact, only add new `cli` script |
| Commander.js version conflicts | Use latest stable commander v11+ |
| Dry-run implementation complexity | Implement dry-run at OracleService level (skip sendRawTransaction) |
| Missing IDL/types for program methods | Use existing OracleService methods which already handle this |

## Rollback Plan
1. Revert `goalchain_oracle/package.json` to remove commander dependency and cli script
2. Delete `goalchain_oracle/src/cli/` directory
3. Run `npm run lint` to verify no broken imports

## Test Commands
```bash
# Build and test CLI help
cd goalchain_oracle && npm run build
npm run cli -- --help

# Test each command help
npm run cli -- sync-authority --help
npm run cli -- init-fixture --help
npm run cli -- live-update --help
npm run cli -- create-market --help
npm run cli -- resolve-market --help
npm run cli -- complete-fixture --help
npm run cli -- record-player --help
npm run cli -- update-stats --help
npm run cli -- crank-vaults --help
npm run cli -- contributor-epoch --help
npm run cli -- init-tokens --help

# Test dry-run mode (no RPC needed)
npm run cli -- sync-authority --treasury-ata 11111111111111111111111111111111 --jackpot-ata 11111111111111111111111111111111 --dry-run
npm run cli -- init-fixture --match-id TEST123 --team-a TeamA --team-b TeamB --start-time 1234567890 --dry-run

# Lint check
npm run lint
```

## Implementation Order
1. Create `goalchain_oracle/src/cli/commands/` directory
2. Implement each command file (12 files, ~50-80 lines each)
3. Implement `oracle-cli.ts` commander builder
4. Implement `index.ts` barrel export
5. Update `package.json` with commander dependency and cli script
6. Run build and verify all help commands work
7. Run lint to ensure type safety

## Notes
- Each command file < 100 lines as required
- Reuse existing OracleService methods where possible
- Dry-run mode will print the transaction details that would be sent without actually sending
- Follow existing code patterns in the oracle package (ESM imports, error handling, logging)
- No changes to on-chain program required