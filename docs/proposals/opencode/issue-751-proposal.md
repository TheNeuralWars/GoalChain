# OA Proposal — Issue #751

## Title
[OPENCODE] [DELEGATED] [P1][economy][ops] Add scripts/verify-canonical-economy.sh drift detection

## Source
GitHub issue #751

## Objective
## Objective
## Objective

Implement a drift detection script at `scripts/verify-canonical-economy.sh` that compares on-chain protocol config against the canonical config in `docs/ECONOMIC_CANONICAL_CONFIG.json`.

## Acceptance Criteria

- Script reads canonical config from `docs/ECONOMIC_CANONICAL_CONFIG.json`
- Script queries on-chain program state via Solana RPC
- Detects and reports drift (differences) with clear exit codes:
  - 0 = no drift
  - 1 = drift detected (detailed diff output)
  - 2 = error (RPC failure, missing file, etc.)
- Outputs machine-readable JSON for CI integration
- Includes human-readable summary for logs

## Context

- Canonical config: `docs/ECONOMIC_CANONICAL_CONFIG.json` (source of truth)
- On-chain program: Solana devnet, program ID from `goalchain_onchain_program_info` MCP
- Economy config snapshot available via `goalchain_economy_config` MCP
- This is a P1 ops task — no risky changes, drift detection only

## Implementation Notes

- Use `solana` CLI or TypeScript with `@solana/web3.js` for on-chain queries
- Compare key economic parameters: mint/burn rates, vault fees, treasury splits, epoch lengths
- Script should be idempotent and fast (<10s)
- Add to CI pipeline once validated

## Verification

```bash
bash scripts/verify-canonical-economy.sh
```

Should exit 0 on devnet currently (no drift expected).

## Owner
opencode

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #751
