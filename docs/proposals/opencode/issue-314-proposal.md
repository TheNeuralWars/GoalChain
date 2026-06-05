# OA Proposal — Issue #314

## Title
[OPENCODE] Oracle: Update imports in goalchain_api & goalchain_webapp + full test suite

## Source
GitHub issue #314

## Objective
Update downstream consumers and verify full test suite by renaming `goalchain_oracle` to `@goalchain/oracle` and making it a proper dependency.

## Scope
1. Rename `goalchain_oracle` package to `@goalchain/oracle` in package.json
2. Create proper barrel export in `@goalchain/oracle/src/index.ts`
3. Update `goalchain_api/package.json` to depend on `@goalchain/oracle` via `file:../goalchain_oracle`
4. Update `goalchain_webapp/package.json` to depend on `@goalchain/oracle` via `file:../goalchain_oracle`
5. Update `goalchain_api/src/index.ts` imports to use `@goalchain/oracle` barrel
6. Update `goalchain_webapp/src/lib/opsClient.ts` imports to use `@goalchain/oracle` barrel
7. Update any scripts importing from old oracle paths
8. Run full test suite:
   - `cd goalchain_oracle && npm run build`
   - `cd goalchain_oracle && npm run lint`
   - `cd goalchain_oracle && npm test`
   - `cd goalchain_api && npm run build`
   - `cd goalchain_webapp && npm run build`

## Acceptance Criteria
- Zero TypeScript errors across monorepo
- All existing tests pass
- No breaking changes to public API surface
- Build artifacts in `goalchain_oracle/dist/`

## Proposed File List
1. `goalchain_oracle/package.json` — rename to `@goalchain/oracle`, add exports field
2. `goalchain_oracle/src/index.ts` — create proper barrel export (re-export types, services)
3. `goalchain_api/package.json` — add `@goalchain/oracle` dependency
4. `goalchain_api/src/index.ts` — update imports to use `@goalchain/oracle`
5. `goalchain_webapp/package.json` — add `@goalchain/oracle` dependency
6. `goalchain_webapp/src/lib/opsClient.ts` — update imports to use `@goalchain/oracle`

## Risks/Regressions + Rollback
- **Risk**: Circular dependencies if oracle imports from API/webapp (unlikely, oracle is standalone)
- **Risk**: TypeScript config differences (oracle uses `nodenext` module, API uses `CommonJS`)
- **Risk**: Missing exports in oracle barrel — need to ensure all needed types are re-exported
- **Rollback**: `git revert` on the commit(s) for this issue

## Exact Test Commands
```bash
# Build oracle first
cd /data/apps/GoalChain/goalchain_oracle && npm run build
cd /data/apps/GoalChain/goalchain_oracle && npm run lint
cd /data/apps/GoalChain/goalchain_oracle && npm test

# Then build consumers
cd /data/apps/GoalChain/goalchain_api && npm run build
cd /data/apps/GoalChain/goalchain_webapp && npm run build
```

## OA Plan (draft)
1. Analyze oracle exports needed by API/webapp
2. Rename oracle package to `@goalchain/oracle`
3. Create proper barrel export in oracle/src/index.ts
4. Update API package.json and imports
5. Update webapp package.json and imports
6. Run build/lint/test sequence
7. Fix any TypeScript errors
8. Prepare draft PR for review

## Skill Hint
Follow gstack review pass before opening draft PR.