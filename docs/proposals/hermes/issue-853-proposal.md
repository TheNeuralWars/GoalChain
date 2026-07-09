# Issue #853 — Tokenized Agents Dashboard

## Objective
Add a dashboard page showing GoalWorld's 10 tokenized AI agents with visual cards, status indicators, and simulated metrics.

## Scope
- New component: `goalchain_webapp/src/ui/TokenizedAgentsDashboard.tsx`
- Route: `/agents` via App.tsx
- Nav entry in DeFi zone of playNav.ts
- i18n keys in translations.ts + en.json + es.json
- Launcher card on DashboardGrid.tsx

## Files touched
1. `goalchain_webapp/src/ui/TokenizedAgentsDashboard.tsx` — NEW
2. `goalchain_webapp/src/ui/App.tsx` — add route + import
3. `goalchain_webapp/src/config/playNav.ts` — add nav item
4. `goalchain_webapp/src/i18n/translations.ts` — add keys
5. `goalchain_webapp/src/i18n/locales/en.json` — add translations
6. `goalchain_webapp/src/i18n/locales/es.json` — add translations
7. `goalchain_webapp/src/ui/DashboardGrid.tsx` — add launcher card

## Design
- Glass-card style matching existing GoalChain UI
- 10 agents: CEO, Dev, QA, Money, Trader, Product, Creative, Research, Social, Default
- Each card: icon, name, role, status (idle/active/thinking), simulated token price, 24h change
- SimulationBadge to mark demo data
- Responsive grid layout

## Risks
- Pure frontend, no backend changes
- All data is mock/simulated — SimulationBadge applied
- No economy/token/contract changes

## Rollback
- `git revert HEAD` removes all changes cleanly

## Test commands
```bash
cd goalchain_webapp && npx tsc --noEmit
cd goalchain_webapp && npm run build
```

## Checklist
- [ ] Create TokenizedAgentsDashboard.tsx
- [ ] Add route in App.tsx
- [ ] Add nav item in playNav.ts
- [ ] Add i18n keys in translations.ts
- [ ] Add EN translations
- [ ] Add ES translations
- [ ] Add launcher card in DashboardGrid.tsx
- [ ] tsc --noEmit passes
- [ ] npm run build passes
