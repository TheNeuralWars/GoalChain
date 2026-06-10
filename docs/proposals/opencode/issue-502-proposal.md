# OA Proposal — Issue #502

## Title
[OPENCODE] [P0] #413 Fix anchor test runner — surfpool missing breaks program tests

## Source
GitHub issue #502

## Objective
# [OPENCODE] [P0] #413 Fix anchor test runner — surfpool missing breaks program tests

## Priority: P0 (blocks CI)
## Labels: agent:opencode, priority:P0, area:program, status:ready

## Problem
`anchor test` fails because `surfpool` dependency is missing/not available in the test environment. This breaks the program test suite on CI.

## Current State
- Program: `goalchain_program/`
- Anchor version: 1.0.2 (specified in Anchor.toml)
- Self-hosted runner has Rust/Solana toolchain installed
- `surfpool` is likely a test-only dependency for pool simulation

## Required Fix
1. **Investigate** what `surfpool` is and where it's imported in tests
2. **Add** `surfpool` to `Cargo.toml` dev-dependencies OR mock/stub it if it's external
3. **Verify** `anchor test` passes locally on the self-hosted runner
4. **Ensure** CI workflow `goalchain-program-idl` job passes

## Files to Check/Modify
- `goalchain_program/Cargo.toml` — add dev-dependency if missing
- `goalchain_program/tests/*.rs` — check imports
- `.github/workflows/ci.yml` — verify test step runs correctly

## Verification Commands
```bash
cd goalchain_program
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$PATH"
anchor test --skip-lint 2>&1
```

## Acceptance Criteria
- `anchor test` passes (or at least compiles and runs without "surfpool missing" error)
- CI job `goalchain-program-idl` shows green
- No regression in IDL generation

## Notes
- Use `avm use 1.0.2` if needed (binary may need building from source on ARM64)
- Self-hosted runner has persistent cargo cache

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-502` and close draft PR.
