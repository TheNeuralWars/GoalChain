# OA Proposal — Issue #851

## Title
[HERMES] [intake] Growth Task 1: Fix Critical NFT Marketplace Treasury Bug (SO

## Source
GitHub issue #851

## Objective
## Objective
# Growth Task 1: Fix Critical NFT Marketplace Treasury Bug (SOL sent to Program ID)

- **Status:** done
- **Priority:** P0
- **Owner:** opencode
- **Created:** 2026-06-04
- **Source:** GitHub Issue #295 / Manager

## Objective

`goalworld_webapp/src/ui/NFTMarketplace.tsx:106` hardcodes the destination for all "Buy with SOL" transactions as `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` with the comment `// Tesorería`. Per `AGENTS.md`, that address is the **production program ID**, not a treasury wallet. Every "COMPRAR CON SOL" click is sending lamports to an inert program account — payments will either fail outright or be unrecoverable.

The real treasury address is already exposed by the API at `GET /api/economy/config` → `onchainConfig.treasuryTokenAccount` (built in `goalworld_api/src/index.ts:755-806`).

**Action:**
1. Replace the hardcoded public key with a `useEffect` that fetches `/api/economy/config` and uses `onchainConfig.treasuryTokenAccount` with a hardcoded fallback
2. Add a `SimulationBadge` check that disables the SOL button when `treasuryTokenAccount` is null
3. Verify on devnet with a 0.001 SOL transfer and confirm receipt in a wallet the team controls

---

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor
- [ ] Auto-dispatch to FCC/OpenCode for code implementation
- [ ] Run typescript checks and auto-merge to main if clean

## Tags

#growth-task #nft-marketplace #treasury-bug #sol-payment #critical #humans-0 #autonomous-push
---
Source file: docs/intake/2026-06-04-growth-task-1-fix-critical-nft-marketplace-treasury-bug-sol-sent-to-program-id-.md (auto-dispatched by intake_goal_loop.sh). Prioritize according to GoalWorld queue freeze rules. Close the linked intake file marker once implemented.

## Owner
hermes

## Priority
P1

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #851
