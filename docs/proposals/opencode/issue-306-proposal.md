# OA Proposal — Issue #306

## Title
[OPENCODE] Oracle: Extract core module (connection, wallet, priority fees, secure signer, config fetch)

## Source
GitHub issue #306

## Objective
## Objective
Extract the foundational Oracle core modules from OracleService.ts:

## Scope
Create `packages/oracle/src/core/` with:

1. `OracleService.ts` - Base class: connection, wallet, provider, program, PDAs (configPda)
2. `connection.ts` - Connection pool, RPC health checks, failover logic
3. `wallet.ts` - Wallet abstraction (file path, env var, secure signer injection)
4. `priorityFees.ts` - Helius priority fee estimation (extracted from sendWithPriorityFees)
5. `secureSigner.ts` - Hardware/encrypted signer interface
6. `fetchConfig.ts` - On-chain config caching with TTL, refresh logic
7. `types.ts` - Core types, error classes (OracleError, ConfigNotFound, etc.)

## Source Mapping
- OracleService.ts lines 1-78 → OracleService.ts + types.ts
- OracleService.ts lines 83-121 → priorityFees.ts
- OracleService.ts lines 54-78 (wallet loading) → wallet.ts
- OracleService.ts lines 54-67 (fetch_config) → fetchConfig.ts

## Acceptance Criteria
- Each file < 200 lines
- No business logic (fixtures, markets, players) in core/
- Unit tests for priority fee calculation, config caching
- Barrel export in `core/index.ts`

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #306
