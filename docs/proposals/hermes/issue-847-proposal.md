# OA Proposal — Issue #847

## Title
[HERMES] [intake] Voice Task: xq https://x.com/SolPlay_jonas/status/2061767065

## Source
GitHub issue #847

## Tweet Analysis

@SolPlay_jonas (Jonas Hahn, DevRel Solana Foundation) announced major Solana Explorer updates:
- **Verified programs** — view verified source for on-chain programs (Token Program now verified)
- **Codama IDL interaction** — explore/interact with programs via their on-chain IDL directly in explorer
- **Feature Gates page** — countdown timers, mobile-first, activation tracking
- **Token search** + SNS domain search improvements
- **SPL Memo program IDL** — memos now have a published IDL, can send from explorer
- **Receipt multi-transfer support** — receipts handle compound txs with memos

URL: https://explorer.solana.com , https://explorer.solana.com/feature-gates

## Relevance to GoalChain

GoalChain deploys an Anchor program on devnet with IDL synced to `goalchain-sdk/`.
The explorer improvements mean:
1. GoalChain's program page is now richer (Codama IDL interaction if published).
2. Verified builds provide transparency for users inspecting the contract on explorer.
3. Explorer links in the webapp should point to program accounts too, not just TXs.

## Implementation Plan (thin, docs + links only)

### Checklist
- [x] 1. Add explorer helper for program/account links (not just tx) in webapp
- [x] 2. Document verified build workflow for GoalChain program
- [x] 3. Add note to SECURITY_AUDIT.md about verified builds as transparency measure
- [x] 4. Update intake marker as done
- [x] 5. Refine this proposal with required outputs
- [x] 6. Wire explorerLinks.ts into FixturesPanel.tsx and NFTMarketplace.tsx (replace hardcoded URLs)

## Files Changed
- `goalchain_webapp/src/lib/explorerLinks.ts` — new helper (explorer URL builder for tx/account/program)
- `goalchain_webapp/src/ui/FixturesPanel.tsx` — use `explorerTxUrl()` instead of hardcoded devnet URL
- `goalchain_webapp/src/ui/NFTMarketplace.tsx` — use `explorerTxUrl()` instead of hardcoded devnet URL
- `docs/SECURITY_AUDIT.md` — section 6: program verification via Solana Explorer
- `docs/VERIFIED_BUILD_GUIDE.md` — standalone guide for verified build workflow
- `docs/intake/2026-06-02-voice-task-1780404884.md` — close intake marker

## Risks / Rollback
- Risk: low — explorerLinks import adds cluster-aware URL logic; previously hardcoded `?cluster=devnet`.
  If GOALCHAIN_CLUSTER env is unset, SDK defaults to `devnet` (same behavior as before).
  If set to `mainnet`, explorer links will correctly omit cluster param. No behavior regression.
- Rollback: `git revert` the commits linked to issue #847

## Test Commands
```bash
cd goalchain_webapp && npx tsc --noEmit   # type check new module
cd goalchain_webapp && npm run build       # full build
```

## Owner
hermes

## Priority
P1
