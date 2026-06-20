# OA Proposal — Issue #367

## Title
[OPENCODE] [OPENCODE] Webapp: Decompose NFTMarketplace → features/nft (4 components + 3 hooks)

## Source
GitHub issue #367

## Objective
## Objective
## Objective
Decompose monolithic NFTMarketplace.tsx (314 lines) into modular feature architecture.

## Scope
Create goalchain_webapp/src/features/nft-marketplace/:

### Components:
1. **MarketplaceHeader.tsx** — Title "Transfer Market", SimulationBadge, SOL offline badge
2. **FilterTabs.tsx** — Rarity tabs (All, Mythic, Legendary, Epic, Rare, Common)
3. **ListingGrid.tsx** — Responsive grid of NFTCard components
4. **NFTCard.tsx** — Player card: avatar banner, price tag, details (name, club, value), stats (ATK/DEF/HYPE), buy buttons (Cash/SOL)

### Hooks:
1. **useListings.ts** — Fetch players.json, simulate 8 random listings with rarity prices, seller mock
2. **useTreasury.ts** — Fetch /api/economy/config, extract treasuryTokenAccount, null fallback
3. **usePurchase.ts** — handleBuy(cash|solana), inventory localStorage, wallet check, tx confirmation, alerts

### Shared:
- **src/features/nft-marketplace/types.ts** — PlayerNFT, RarityPrices, RarityColors
- **src/features/nft-marketplace/constants.ts** — RARITY_PRICES, RARITY_COLORS
- **src/features/nft-marketplace/index.ts** — Barrel export

### Migration:
- Original NFTMarketplace.tsx → thin wrapper
- Spanish alerts → i18n keys (en.json)
- Inline styles → design tokens (glass-card, btn-neon-green, btn-outline-green)
- Treasury null handling → graceful fallback

## Acceptance Criteria
- Feature module builds independently
- Wrapper maintains identical UX
- All 12 Spanish strings replaced with i18n
- Cash purchase → localStorage inventory
- SOL purchase → wallet adapter + devnet tx
- Build passes

## Skill Hint
Apply frontend-design skill. Follow gstack plan-eng-review.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-367` and close draft PR.
