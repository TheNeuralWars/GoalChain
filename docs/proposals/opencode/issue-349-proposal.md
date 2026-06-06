# OA Proposal — Issue #349

## Title
[OPENCODE] Webapp: Integration - Storybook, Vitest, E2E, performance budgets, accessibility audit

## Source
GitHub issue #349

## Objective
## Objective
Webapp integration, testing, and quality gates:

## Scope
### 1. Storybook Setup
- `.storybook/main.ts` - Addons: controls, actions, viewport, backgrounds, measure, a11y
- `.storybook/preview.tsx` - Global decorators: ThemeProvider, WalletProvider, Router
- Stories for all ui/ primitives + feature components

### 2. Vitest + RTL Unit Tests
- `vitest.config.ts` - Coverage thresholds: 80% statements, 70% branches, 80% functions, 80% lines
- Test all hooks, utilities, pure components
- Mock wallet adapter, RPC, WebSocket

### 3. Playwright E2E Tests
- `e2e/` - Critical flows: Onboarding → Wallet Connect → First Trade → Vault Stake → Profile
- Mobile viewport tests
- Visual regression (Chromium, Firefox, WebKit)

### 4. Performance Budgets
- `bundle-analysis` - webpack-bundle-analyzer, budget: < 200KB gzipped initial JS
- Lighthouse CI: Performance > 90, Accessibility > 95, Best Practices > 90
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### 5. Accessibility Audit
- axe-core integration in Vitest
- Manual audit: keyboard nav, screen reader (NVDA/VoiceOver), focus management
- Color contrast: all tokens AA+ (4.5:1), AAA for text (7:1)

### 6. CI Pipeline
- `.github/workflows/ci.yml` - Lint → TypeCheck → Test → Build → E2E → Bundle → Lighthouse
- Deploy preview on PR

## Acceptance Criteria
- All tests pass in CI
- Coverage meets thresholds
- Lighthouse scores meet budgets
- Zero a11y violations
- Bundle size within budget

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #349
