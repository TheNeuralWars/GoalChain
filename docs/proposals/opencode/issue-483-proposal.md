# OA Proposal — Issue #483

## Title
[OPENCODE] [IMPL] #363 Webapp layout/shell (AppShell, Sidebar, Header, DashboardGrid, PlayNav)

## Source
GitHub issue #483

## Objective
## Objective
## Task: Webapp layout/shell (Issue #363 → PR #409)

**Priority:** P0
**Branch:** exp/opencode-issue-363
**PR Target:** #409 (already approved)
**Depends on:** #331 (SDK types for API client)

### Context
Approved with global vision: "Webapp Shell: AppShell/Sidebar/Header/DashboardGrid/PlayNav = navegación coherente, zero-friction. Single source of truth → goalchain-sdk types alimenta webapp"

### Implementation Required
**Stack:** Next.js 14 + React 18 + TypeScript + Tailwind + shadcn/ui

**Components to create in `goalchain_webapp/src/components/layout/`:**

1. **`AppShell.tsx`** — Root layout wrapper
   - Providers: `ThemeProvider`, `AuthProvider`, `SocketProvider`, `QueryClientProvider`
   - Renders: `<Header />`, `<Sidebar />`, `<main className="flex-1 p-4">`, `<Footer />`
   - Responsive: mobile drawer, desktop fixed sidebar

2. **`Sidebar.tsx`** — Navigation rail
   - Sections: **Play** (Dashboard, Stadium, Trading), **Club** (My Team, Players, Transfers), **Treasury** (Vault, Economy, Burns), **Admin** (Oracles, Cranks, Config)
   - Collapsible to icons-only mode
   - Active route highlighting
   - User profile dropdown at bottom

3. **`Header.tsx`** — Top bar
   - Left: Hamburger menu (mobile), App logo
   - Center: Search/Command palette (⌘K)
   - Right: Wallet connect, GCH balance, Notifications bell, Theme toggle, User avatar

4. **`DashboardGrid.tsx`** — Responsive grid system
   - CSS Grid: `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`
   - Widget slots: `DashboardWidget` interface for pluggable widgets
   - Drag-to-reorder (optinal, `@dnd-kit`)
   - Persist layout in localStorage

5. **`PlayNav.tsx`** — Play mode navigator
   - Tabs: **Pre-Match** (upcoming fixtures, pools), **Live** (active matches, live markets), **Post-Match** (results, settled pools, claims)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-483` and close draft PR.
