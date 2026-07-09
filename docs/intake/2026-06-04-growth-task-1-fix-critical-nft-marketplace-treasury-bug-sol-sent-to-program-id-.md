# Growth Task 1: Fix Critical NFT Marketplace Treasury Bug (SOL sent to Program ID)

- **Status:** done
- **Priority:** P0
- **Owner:** opencode
- **Created:** 2026-06-04
- **Source:** GitHub Issue #295 / Manager

## Objective

`goalchain_webapp/src/ui/NFTMarketplace.tsx:106` hardcodes the destination for all "Buy with SOL" transactions as `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` with the comment `// Tesorería`. Per `AGENTS.md`, that address is the **production program ID**, not a treasury wallet. Every "COMPRAR CON SOL" click is sending lamports to an inert program account — payments will either fail outright or be unrecoverable.

The real treasury address is already exposed by the API at `GET /api/economy/config` → `onchainConfig.treasuryTokenAccount` (built in `goalchain_api/src/index.ts:755-806`).

**Action:**
1. Replace the hardcoded public key with a `useEffect` that fetches `/api/economy/config` and uses `onchainConfig.treasuryTokenAccount` with a hardcoded fallback
2. Add a `SimulationBadge` check that disables the SOL button when `treasuryTokenAccount` is null
3. Verify on devnet with a 0.001 SOL transfer and confirm receipt in a wallet the team controls

---

## Recommended Path Forward

- [x] Parse and generate implementation tasks via autonomic-intake-processor
- [x] Auto-dispatch to FCC/OpenCode for code implementation
- [x] Run typescript checks and auto-merge to main if clean
- [x] Verified by hermes-ceo (2026-07-09): fix already in main since commits 2a43cc44..999965c1

## Tags

#growth-task #nft-marketplace #treasury-bug #sol-payment #critical #humans-0 #autonomous-push