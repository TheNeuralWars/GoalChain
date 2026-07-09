# Issue #847 Proposal

## Objective

Implement Solana Explorer updates based on @SolPlay_jonas tweet

## Implementation Plan

1. **Create explorerLinks.ts helper**:
   - Cluster-aware explorer URLs for programs and transactions
   - Added to goalchain_webapp/src/lib/

2. **Update VERIFIED_BUILD_GUIDE.md**:
   - Added security audit section 6
   - Documented verified build process

3. **Update SECURITY_AUDIT.md**:
   - Added section 6 for Solana Explorer verified builds

## Files Touched

- goalchain_webapp/src/lib/explorerLinks.ts
- VERIFIED_BUILD_GUIDE.md
- SECURITY_AUDIT.md

## Risks and Rollback

- **Potential regression**: Explorer URL handling changes
- **Rollback**: git revert the three commits made to main

## Test Commands

```bash
cd goalchain_webapp
npm run build
```

## Implementation Status

- [x] explorerLinks.ts created
- [x] VERIFIED_BUILD_GUIDE.md updated
- [x] SECURITY_AUDIT.md updated
- [x] Proposal refined

## Next Steps

- Commit changes to main (cambio urgente)
- Close intake marker
