# Proposal for Issue #847: Solana Explorer Updates

## Objective

Implement the Solana Explorer updates from the tweet https://x.com/SolPlay_jonas/status/2061767065569001508?s=20.

## Implementation Plan

### 1. Analyze the Tweet

- Read the tweet content and understand the requirements for the Solana Explorer updates.
- Identify the key changes needed in the GoalChain webapp.

### 2. Update explorerLinks.ts

- Create a new module `explorerLinks.ts` to centralize the generation of Solana Explorer URLs.
- Implement a cluster-aware system to generate URLs based on the current cluster (devnet, testnet, mainnet).

### 3. Update FixturesPanel.tsx and NFTMarketplace.tsx

- Migrate the existing hardcoded Solana Explorer URLs to use the new `explorerTxUrl()` function from `explorerLinks.ts`.
- Ensure the updates are consistent and maintain the existing functionality.

### 4. Add Documentation

- Update `docs/VERIFIED_BUILD_GUIDE.md` with new guidelines for Solana Explorer integration.
- Add a new section in `docs/SECURITY_AUDIT.md` about on-chain transparency.

## Checklist

- [ ] Analyze the tweet and understand the requirements.
- [ ] Create and implement `explorerLinks.ts`.
- [ ] Update `FixturesPanel.tsx` and `NFTMarketplace.tsx`.
- [ ] Add documentation updates.
- [ ] Run TypeScript checks and build.
- [ ] Create a draft PR for review.

## Risks and Rollback

- **Risk**: Incorrect URL generation for different clusters.
- **Rollback**: Revert the changes to the previous state.

## Test Commands

```bash
# Run TypeScript checks
cd goalchain_webapp && npx tsc --noEmit

# Run build
npm run build
```

## Residual Risks

- Ensure that the cluster-aware system works correctly for all clusters.
- Verify that the existing functionality is maintained after the updates.

## Files to be Modified

- `goalchain_webapp/src/lib/explorerLinks.ts`
- `goalchain_webapp/src/ui/FixturesPanel.tsx`
- `goalchain_webapp/src/ui/NFTMarketplace.tsx`
- `docs/VERIFIED_BUILD_GUIDE.md`
- `docs/SECURITY_AUDIT.md`

## Summary

- The proposal outlines the steps to implement the Solana Explorer updates.
- The implementation involves creating a new module, updating existing files, and adding documentation.
- The checklist ensures that all steps are followed.
- The risks and rollback plan are outlined.
- The test commands are provided to verify the implementation.
- The residual risks are identified and need to be addressed.

## Next Steps

- Implement the changes based on the proposal.
- Run the test commands to verify the implementation.
- Create a draft PR for review.
