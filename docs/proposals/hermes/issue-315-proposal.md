# OA Proposal — Issue #315

## Title
[OPENCODE] Program: Create packages/program structure + Cargo/Anchor configs

## Source
GitHub issue #315

## Objective
## Objective
Create the new modular Anchor program structure:

## Scope
Create `packages/program/` with:

- `Cargo.toml` workspace root with members = ["programs/goalchain_program"]
- `Anchor.toml` with cluster config, provider, test validator settings
- `rust-toolchain.toml` pinning Rust 1.89
- Directory tree:
  ```
  packages/program/
  ├── programs/
  │   └── goalchain_program/
  │       ├── Cargo.toml
  │       └── src/
  │           ├── lib.rs
  │           ├── constants.rs
  │           ├── errors.rs
  │           ├── math.rs
  │           ├── state/
  │           ├── instructions/
  │           ├── events/
  │           ├── validators/
  │           └── utils/
  └── tests/
  ```

## Acceptance Criteria
- `anchor build` passes
- Workspace builds with `cargo build --workspace`
- No warnings in strict clippy

## Skill Hint
Follow gstack plan-eng-review before coding.

## Owner
opencode

## Priority

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #315
