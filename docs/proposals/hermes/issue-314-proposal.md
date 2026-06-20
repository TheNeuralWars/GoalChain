# OA Proposal — Issue #314

## Title
[OPENCODE] Oracle: Update imports in goalchain_api & goalchain_webapp + full test suite

## Source
GitHub issue #314

## Objective
## Objective
Update downstream consumers and verify full test suite:

## Scope
1. Update `goalchain_api/src/index.ts` imports to use `@goalchain/oracle` barrel
2. Update `goalchain_webapp/src/lib/opsClient.ts` imports
3. Update any scripts importing from old oracle paths
4. Run full test suite:
   - `cd packages/oracle && npm run build`
   - `cd packages/oracle && npm run lint`
   - `cd packages/oracle && npm test`
   - `cd goalchain_api && npm run build`
   - `cd goalchain_webapp && npm run build`

## Acceptance Criteria
- Zero TypeScript errors across monorepo
- All existing tests pass
- No breaking changes to public API surface
- Build artifacts in `packages/oracle/dist/`

## Skill Hint
Follow gstack review pass before opening draft PR.

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #314
