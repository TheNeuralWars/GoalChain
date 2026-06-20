# OA Proposal — Issue #313

## Title
[OPENCODE] Oracle: Create facade services (OracleService, ScraperService, EconomyService)

## Source
GitHub issue #313

## Objective
## Objective
Create high-level facade services in packages/oracle/src/services/:

## Scope
Create `packages/oracle/src/services/` with:

1. `OracleService.ts` - Facade combining fixtures + markets + players
   - Convenience methods for common workflows
   - Backward compatibility for existing imports
2. `ScraperService.ts` - Facade combining scraper + fixtures sync
   - runFullSync(): scrape → initialize fixtures → create markets
3. `EconomyService.ts` - Facade combining vaults + contributors + rarity yield
   - runDailyCrank(): rarity yield → vault crank → contributor epoch

## Acceptance Criteria
- Each file < 150 lines
- No duplicate logic - delegate to domain modules
- Clear separation of concerns
- `src/index.ts` exports all public APIs
- Existing goalchain_api and goalchain_webapp imports work via barrel

## Skill Hint
Follow gstack investigate workflow (root cause, max 3 fixes).

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
- Rollback: revert main commit linked to issue #313
