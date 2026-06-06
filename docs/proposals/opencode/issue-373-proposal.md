# OA Proposal — Issue #373

## Title
[OPENCODE] [OPENCODE] Webapp: Integration - Storybook, Vitest, E2E, performance budgets, accessibility audit

## Source
GitHub issue #373

## Objective
## Objective
## Objective
Add comprehensive testing and documentation infrastructure to the webapp.

## Scope
Configure in goalchain_webapp/:

### Storybook (Component Documentation):
1. **.storybook/main.ts** — Configure Vite builder, React, MDX
2. **.storybook/preview.ts** — Global decorators: ThemeProvider, WalletProvider, TooltipProvider, i18n
3. **Stories for all primitives** (src/components/ui/*.stories.tsx):
   - Button, Card, Input, Tabs, Toast, Badge, Chart, Modal, Tooltip, Avatar, ProgressBar, Table, FormField, Toggle, Dropdown
4. **Stories for feature components** (src/features/*/*.stories.tsx):
   - NFTCard, ListingGrid, FilterTabs, TerminalHeader, PriceChart, ManualControls, VibeBotsPanel
   - VaultHeader, WalletBanner, StrategySelector, AllocationChart, DepositPanel, ConsoleLog
   - CoachChat, AdvisoriesPanel, RainmakerPredictor
   - CommentatorHeader, LoadingPhases, Avatar, CommentaryHistory, VoiceSettings
   - ClubHeader, ClubTabs, ProfileGate, RegistrationPromo
   - EstadioHeader, EstadioTabs, FixtureCard, BetForm, FeedHeader, EventList
5. **Addons**: a11y, controls, actions, viewport, backgrounds, measure

### Vitest (Unit/Integration Tests):
1. **vitest.config.ts** — Vite integration, React Testing Library, jsdom, coverage
2. **Test files** (src/**/*.test.tsx):
   - Hooks: usePriceHistory, useVibeBots, useSentiment, useVaultBalances, useMockLogs
   - Hooks: useChat, useGeminiProxy, useTacticalState, useRainmaker, useAdvisories
   - Hooks: useListings, useTreasury, usePurchase, useAccount, useFixtures, useFixtureActions
   - Components: Button, Card, Input, Tabs, Toast, Chart, Modal
   - Feature modules: NFTCard render, StrategySelector interaction, CoachChat send
3. **Coverage threshold**: 80% lines, 70% branches

### Playwright (E2E Tests):
1. **playwright.config.ts** — Projects: chromium, firefox, webkit, mobile chrome
2. **Tests** (e2e/*.spec.ts):
   - Auth flow: connect wallet -> dashboard loads
   - Play navigation: /play tabs switch, content loads
   - NFT Marketplace: filter by rarity, buy cash, buy SOL (mock)
   - Trading Terminal: manual trade, vibe bot toggle
   - AI Coach: send message, receive reply (mock)
   - Club Portal: tabs, account creation

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-373` and close draft PR.
