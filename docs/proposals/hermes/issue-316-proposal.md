# OA Proposal — Issue #316

## Title
[OPENCODE] Program: Extract foundation modules (constants, errors, math)

## Source
GitHub issue #316

## Objective
## Objective
Extract foundation modules in programs/goalchain_program/src/:

## Scope
1. `constants.rs` - All const values, seeds, discriminators from lib.rs lines 1-36
   - GCH_LAMPORTS, DEFAULT_BASE_YIELD_LAMPORTS, MAX_FEE_BPS, ARCHITECT_TAX_BPS
   - PDA seeds: b"config", b"fixture", b"live_state", b"market", b"player", etc.
2. `errors.rs` - All ErrorCode variants (currently scattered)
3. `math.rs` - Safe math helpers:
   - checked_mul_div, bps_calc, yield_calc_per_rarity
   - base_yield_for_rarity_tier(tier: u8) -> u64 matching ECONOMIC_CANONICAL_CONFIG.json

## Canonical Config Enforcement
- All economic constants MUST match docs/ECONOMIC_CANONICAL_CONFIG.json
- No hardcoded lamport values outside constants.rs

## Acceptance Criteria
- Each file < 150 lines
- Unit tests for math.rs functions
- Re-exported in lib.rs

## Skill Hint
Follow gstack plan-eng-review before coding.

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #316
