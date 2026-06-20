# OA Proposal — Issue #781
## Title
AI-EXPONENTIAL: Jito MEV Bundle Staking Integration

## Source
GitHub issue #781

## Objective
### Goal
Guarantee staking transaction execution during network congestion and optimize validator tip routing by integrating with Jito bundles.

### Checklist
- [ ] Integrate Jito's JSON-RPC API (`sendBundle` endpoint) in `vault_crank.ts`
- [ ] Implement automatic MEV tip calculation and append tip transfer instructions to staking transaction packages

## Implementation Plan

### 1. New Jito Bundle Module (`goalchain_oracle/src/jitoBundle.ts`)
Create a dedicated module for Jito bundle operations:
- Fetch tip accounts dynamically from Jito Block Engine `/api/v1/tip_accounts`
- Calculate MEV tip based on priority fee tier (Economy/Standard/Priority/Urgent)
- Build bundle transactions: [Staking/Buyback TX, Tip TX]
- Submit bundle via `sendBundle` JSON-RPC to Block Engine
- Wait for bundle confirmation with polling

### 2. Updated `vault_crank.ts` 
- Import Jito bundle utilities
- Replace direct transaction submission with Jito bundle submission when `JITO_BUNDLE_ENABLED=1`
- Add environment variables for Jito configuration:
  - `JITO_BLOCK_ENGINE_URL` (default: testnet block engine)
  - `JITO_TIP_TIER` (economy|standard|priority|urgent)
  - `JITO_BUNDLE_ENABLED` (feature flag, default: 0 for safe rollout)

### 3. Priority Fee Integration
- Use existing `priorityFees.ts` for base priority fee estimation
- Add Jito tip on top for Urgent tier (99th percentile + tip)
- Tip calculation: base priority fee × tier multiplier

### 4. Bundle Structure (per Jito constraints)
- Max 5 transactions per bundle
- Tip transfer MUST be the last transaction
- Bundle format: `[staking_tx, buyback_tx, burn_tx, tip_tx]`

## META Alignment
- **R1**: Root invariant — atomic execution via bundles prevents MEV leakage
- **R3**: Proportional complexity — dedicated module, feature-flagged
- **R5**: Verify by execution — simulate before submit, confirm on-chain
- **R10**: Irreversibility — feature flag OFF by default, devnet only initially

## Files to Create/Modify
| File | Action |
|------|--------|
| `goalchain_oracle/src/jitoBundle.ts` | **Create** — Jito bundle client |
| `goalchain_oracle/src/vault_crank.ts` | **Modify** — Integrate Jito bundle path |
| `goalchain_oracle/package.json` | **Modify** — No new deps needed (uses @solana/web3.js) |

## Verification
```bash
# Lint & build
cd goalchain_oracle && npm run lint && npm run build

# Dry-run with Jito bundles (devnet)
JITO_BUNDLE_ENABLED=1 JITO_BLOCK_ENGINE_URL=https://testnet.block-engine.jito.wtf npm run vault-crank
```

## Risk / Rollback
- **Risk**: Jito Block Engine devnet instability
- **Mitigation**: Feature flag OFF by default, fallback to standard RPC path
- **Rollback**: Revert `vault_crank.ts` changes, delete `jitoBundle.ts`

## Residual Risks
1. **Tip account rotation**: Jito may rotate tip accounts; dynamic fetch mitigates
2. **Bundle size limit**: Max 5 txs — current vault crank uses ≤4, fits safely
3. **Devnet Block Engine**: Uses testnet Block Engine per strategic decision (2026-06-07)
4. **Feature flag**: Default OFF prevents accidental mainnet bundle submission

## Next Steps
1. Implement `jitoBundle.ts` module
2. Update `vault_crank.ts` with bundle integration
3. Build, lint, verify dry-run
4. Open draft PR on `exp/opencode-issue-781`