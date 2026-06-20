# OA Proposal — Issue #321

## Title
[OPENCODE] Program: Extract config instructions (initialize_config, update_config)

## Source
GitHub issue #321

## Objective
## Objective
Extract config instructions into programs/goalchain_program/src/instructions/config/:

## Scope
1. `initialize_config.rs` - Initialize global config (lib.rs lines 62-102)
2. `update_config.rs` - Update config parameters (lib.rs lines 104-138)
3. `mod.rs` - Re-export both

## Acceptance Criteria
- Each file < 150 lines
- Use config_validator.rs for all validation
- Emit ConfigInitialized / ConfigUpdated events
- Proper PDA derivation via pda.rs
- Admin signer check

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
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #321
