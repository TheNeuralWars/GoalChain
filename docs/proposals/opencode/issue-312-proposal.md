# OA Proposal — Issue #312

## Title
[OPENCODE] Oracle: Build CLI commands (10 commands + commander builder)

## Source
GitHub issue #312

## Objective
## Objective
Build CLI entry points in packages/oracle/src/cli/:

## Scope
Create `packages/oracle/src/cli/` with:

1. `commands/sync-authority.ts` - Sync oracle authority to config
2. `commands/init-fixture.ts` - Initialize new fixture
3. `commands/live-update.ts` - Push live state update
4. `commands/create-market.ts` - Create live market
5. `commands/resolve-market.ts` - Resolve market with winner
6. `commands/complete-fixture.ts` - Complete fixture + record players
7. `commands/record-player.ts` - Record player match participation
8. `commands/update-stats.ts` - Update player goals/assists
9. `commands/crank-vaults.ts` - Run vault crank
10. `commands/contributor-epoch.ts` - Run contributor epoch transition
11. `commands/init-tokens.ts` - Initialize token mints/ATAs
12. `oracle-cli.ts` - Commander.js builder with all commands
13. `index.ts` - Barrel export

## Acceptance Criteria
- Each command < 100 lines
- Shared options: --rpc-url, --keypair, --program-id, --dry-run
- Proper error messages and exit codes
- Help text for each command
- `npm run cli -- --help` works

## Skill Hint
Follow gstack investigate workflow (root cause, max 3 fixes).

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-312` and close draft PR.
