# OA Proposal — Issue #305

## Title
[OPENCODE] Oracle: Create packages/oracle structure + configs

## Source
GitHub issue #305

## Objective
## Objective
Create the new modular Oracle package structure:

## Scope
- Initialize `packages/oracle/` with package.json, tsconfig.json, .env.example
- Create directory tree matching the architecture:
  ```
  packages/oracle/
  ├── src/
  │   ├── core/
  │   ├── fixtures/
  │   ├── markets/
  │   ├── players/
  │   ├── economy/
  │   ├── scraper/
  │   ├── cli/
  │   │   └── commands/
  │   └── services/
  ├── tests/
  └── scripts/
  ```

## Required Files
- `package.json` with dependencies: @coral-xyz/anchor, @solana/web3.js, @solana/spl-token, commander, dotenv, zod
- `tsconfig.json` extending base config with paths for @goalchain/oracle/*
- `.env.example` with RPC_URL, ORACLE_KEYPAIR, PROGRAM_ID, HELIUS_API_KEY
- `src/index.ts` barrel export

## Acceptance Criteria
- `npm run build` passes in packages/oracle
- TypeScript strict mode enabled
- No circular dependencies
- ESLint + Prettier configured

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #305
