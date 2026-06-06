# OA Proposal — Issue #340

## Title
[OPENCODE] Webapp: Decompose NFTMarketplace → features/nft (4 components + 3 hooks)

## Source
GitHub issue #340

## Objective
## Objective
Decompose NFTMarketplace into features/nft/:

## Scope
Create `src/features/nft/` with:

**Components:**
1. `NFTGrid.tsx` - Masonry grid, lazy load images, collection badges
2. `NFTCard.tsx` - Image, name, collection, price, rarity, mint button
3. `MintModal.tsx` - Quantity, price breakdown, confirm, transaction status
4. `CollectionFilter.tsx` - Tabs: All, Genesis, World Cup, Special Editions

**Hooks:**
5. `useNFTs.ts` - Fetch NFT metadata, filter by collection
6. `useMint.ts` - Mint transaction, wallet signing, status polling
7. `useCollections.ts` - Collection list, stats, floor prices

**Composition:**
8. `types.ts` - NFT, Collection, MintConfig, MintResult
9. `constants.ts` - Collection IDs, mint prices (ENGLISH ONLY)
10. `index.ts` - Barrel export
11. `NFTMarketplace.tsx` - Composed page component

## Acceptance Criteria
- Each file < 200 lines
- Image optimization (WebP, blur placeholder)
- Mint flow: estimate → sign → confirm → success
- Mobile: stacked cards, bottom sheet modal

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #340
