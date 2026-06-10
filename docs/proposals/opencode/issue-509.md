# Issue #509: [OPENCODE] [P0] #331 IDL generation + sync script

## Source
Local queue (autonomous FIFO mode)

## Objective
# [OPENCODE] [P0] #331 IDL generation + sync script

## Priority: P0 (blocks SDK, webapp types, oracle client)
## Labels: agent:opencode, priority:P0, area:program, status:blocked

## Problem
IDL generation script broken — `sync-idl.sh --check` fails. Blocks type-safe SDK client generation for all consumers (webapp, oracle, API).

## Current State
- `goalchain_program/target/idl/goalchain_program.json` not generated
- `anchor build --ignore-keys` fails: anchor 1.0.2 not installed on ARM64
- Script: `scripts/sync-idl.sh --check` fails

## Required Fix
1. **Install anchor 1.0.2** on self-hosted runner (build from source if needed)
2. **Fix** `scripts/sync-idl.sh` to:
   - Build program: `anchor build --ignore-keys`
   - Copy IDL to `goalchain_sdk/src/idl/`
   - Copy IDL to `goalchain_oracle/src/idl/`
   - Copy IDL to `goalchain_api/src/idl/`
   - Run `npm run build` in SDK to generate types
3. **Verify** all three consumers get updated types

## Files to Modify
- `scripts/sync-idl.sh` — robust build + copy + verify
- `goalchain_program/Anchor.toml` — confirm anchor version
- `.github/workflows/ci.yml` — ensure IDL job runs on self-hosted

## Verification Commands
```bash
cd goalchain_program
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$PATH"
anchor build --ignore-keys
bash ../scripts/sync-idl.sh --check
# Should output: IDL synced to goalchain_sdk, goalchain_oracle, goalchain_api
```

## Acceptance Criteria
- `anchor build` succeeds on self-hosted runner
- `sync-idl.sh --check` passes (no "IDL source not found")

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,area:program,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-509`.
