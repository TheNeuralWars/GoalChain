# OA Proposal — Issue #368

## Title
[OPENCODE] [OPENCODE] Webapp: Decompose SwarmVaults → features/defi (4 components + 3 hooks)

## Source
GitHub issue #368

## Objective
## Objective
## Objective
Decompose monolithic SwarmVaults.tsx (393 lines) into modular feature architecture.

## Scope
Create goalchain_webapp/src/features/swarm-vaults/:

### Components:
1. **VaultHeader.tsx** — Title "Swarm Vaults", SimulationBadge, subtitle
2. **WalletBanner.tsx** — Balance display ($GCH), neon styling
3. **StrategySelector.tsx** — 3 vault cards (Sentinel/Arbitrageur/Orchestrator): name, APY, deposited amount, color border, click to select
4. **AllocationChart.tsx** — SVG stacked bar chart: segments with width%, color, glow, legend
5. **DepositPanel.tsx** — Amount input, percentage shortcuts (25/50/100%), Deposit button, Withdraw button (conditional)
6. **ConsoleLog.tsx** — Auto-scrolling terminal log, timestamped entries, agent prefixes

### Hooks:
1. **useVaultBalances.ts** — walletGch, vaultBalances (sentinel/arbitrageur/orchestrator), deposit/withdraw logic
2. **useMockLogs.ts** — Periodic log generation (6s interval), strategy-specific messages, timestamps, agent prefixes
3. **useDepositWithdraw.ts** — handleDeposit, handleWithdraw, percentage shortcuts, validation, event dispatch

### Shared:
- **src/features/swarm-vaults/data/strategies.ts** — VAULT_STRATEGIES config (moved from inline)
- **src/features/swarm-vaults/types.ts** — Allocation, VaultStrategy, VaultState
- **src/features/swarm-vaults/index.ts** — Barrel export

### Migration:
- Original SwarmVaults.tsx → thin wrapper
- Spanish alerts → i18n keys
- Inline styles → design tokens (glass-card, btn-neon-green, btn-outline-red)
- VAULT_STRATEGIES → external data file
- Console logs in English

## Acceptance Criteria
- Feature module builds independently
- Wrapper maintains identical UX
- All 6 Spanish strings replaced with i18n
- Log generation periodic and varied
- Deposit/withdraw updates balances + dispatches goalchain-event
- Build passes

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-368` and close draft PR.
