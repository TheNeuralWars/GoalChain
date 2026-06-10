# Issue #511: [OPENCODE] [P0] #312 Oracle CLI commands (10 commands + commander builder)

## Source
Local queue (autonomous FIFO mode)

## Objective
# [OPENCODE] [P0] #312 Oracle CLI commands (10 commands + commander builder)

## Priority: P0 (oracle — operations tooling)
## Labels: agent:opencode, priority:P0, area:oracle, status:blocked

## Objective
Build complete CLI for oracle operations using Commander.js with 10 commands.

## Commands to Implement
| Command | Description |
|---------|-------------|
| `oracle crank:vault` | Run vault crank (dry-run default, `--execute` for real) |
| `oracle settle:markets` | Settle resolved markets via Jito bundle |
| `oracle fixtures:resolve` | Resolve finished fixtures + trigger settlement |
| `oracle players:record` | Record player match performance |
| `oracle players:update-stats` | Update player stats from provider |
| `oracle economy:epoch` | Run contributor epoch validation |
| `oracle config:show` | Display current on-chain config |
| `oracle health:check` | RPC + Jito + priority fees health |
| `oracle simulate:all` | Full dry-run of crank + settle + resolve |
| `oracle version` | Show version + commit hash |

## Technical Requirements
- **Commander.js** v11+ with subcommands
- **Shared options**: `--rpc-url`, `--keypair`, `--network`, `--dry-run`, `--verbose`
- **Output**: JSON (`--json`) or human-readable
- **Exit codes**: 0 success, 1 user error, 2 system error
- **Config**: Load from `goalchain_oracle/config/` + env overrides

## Files to Create/Modify
- `goalchain_oracle/src/cli/commands/` — 10 command files
- `goalchain_oracle/src/cli/index.ts` — commander setup
- `goalchain_oracle/src/cli/utils.ts` — shared helpers (connection, wallet, logging)
- `goalchain_oracle/package.json` — bin entry point

## Verification
```bash
cd goalchain_oracle
npm run build
./bin/oracle.js --help

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
- Rollback: revert branch `exp/opencode-issue-511`.
