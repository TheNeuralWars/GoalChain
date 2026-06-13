# OA Proposal — Issue #753

## Title
[OPENCODE] [DELEGATED] [P1][smart-contracts][docs] Document FutureHook instructions as disabled

## Source
GitHub issue #753

## Objective
## Objective
Implement the work described in GitHub issue #430: Document the FutureHook instructions (forge_nft and delegate_nft_for_rent) as disabled/no-op in the smart contract codebase.

## Context
The smart contract has two placeholder instructions in `goalchain_program/programs/goalchain_program/src/lib.rs`:
- `forge_nft` (line 2247) - returns `Ok(())]` no-op
- `delegate_nft_for_rent` (line 2252) - returns `Ok(())]` no-op

Both use the `FutureHook` accounts context (line 3749) which only requires a user signer.

## Required Work
1. **Add clear documentation in the code** - Add Rust doc comments to both instructions explaining they are disabled/no-op placeholders reserved for future V2 expansion, not to be invoked by any dApp or bot
2. **Consider adding a compile-time guard** - Could add `#[cfg(feature = "future-hooks")]` or similar feature flag to completely disable them in production builds
3. **Update any relevant documentation** - Ensure AGENT_DIRECTIVES.md or a dedicated docs file reflects this

## Acceptance Criteria
- Both instructions have clear Rust doc comments stating they are disabled/no-op placeholders
- No breaking changes to the program ID or existing instructions
- Anchor build passes (`cargo build-sbf` or `anchor build`)
- Tests pass (if any exist for these)

## Skill Hints
- Follow gstack plan-eng-review before coding
- This is a P1 docs task for smart-contracts

## Links
- GitHub Issue: https://github.com/TheNeuralWars/GoalChain/issues/430
- Original agent assignment was cursor, now delegated to opencode (FCC)

## Owner
opencode

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #753
