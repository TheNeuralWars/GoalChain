# OA Proposal — Issue #351

## Title
[OPENCODE] Repo: Monorepo root cleanup - delete legacy dirs, fix configs, enforce structure

## Source
GitHub issue #351

## Objective
## Objective
Monorepo root cleanup and structural enforcement:

## Scope
### 1. Delete Legacy Directories/Files
Remove permanently (git rm):
- `scratch/` - All experimental spikes
- `_archive/` - All archived code
- `*.backup`, `*.bak`, `*.old` - Any backup files
- `node_modules/` - If committed (should be gitignored)
- `dist/`, `build/`, `.next/` - Build outputs if committed
- `.turbo/` - If committed

### 2. Root Config Consolidation
Ensure these exist and are correct:
- `package.json` - pnpm workspaces, turbo config
- `pnpm-workspace.yaml` - Workspace packages
- `turbo.json` - Pipeline: build, test, lint, typecheck, dev
- `tsconfig.base.json` - Base TS config (strict, noEmit)
- `.eslintrc.js` - Shared ESLint config
- `.prettierrc` - Prettier config
- `.gitignore` - Comprehensive (node_modules, dist, .turbo, *.log, .env*, coverage)
- `.npmrc` - pnpm settings (shamefully-hoist=false, strict-peer-dependencies=true)

### 3. Package Structure Enforcement
Verify each package has:
- `package.json` - name, version, exports, scripts, dependencies
- `tsconfig.json` - extends base
- `src/` - Source code only
- `tests/` - Test files
- `docs/` - Package-specific docs

### 4. Canonical Economy Config
Verify `docs/ECONOMIC_CANONICAL_CONFIG.json` is referenced by:
- goalchain_oracle (rarityYield.ts)
- goalchain_program (constants.rs)
- goalchain_sdk (economy.ts)
- goalchain_webapp (constants.ts in features)

## Acceptance Criteria

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #351
