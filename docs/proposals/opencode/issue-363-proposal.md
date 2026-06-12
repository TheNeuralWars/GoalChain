# OA Proposal — Issue #363

## Title
[OPENCODE] [OPENCODE] Webapp: Build layout/shell (AppShell, Sidebar, Header, DashboardGrid, PlayNav)

## Source
GitHub issue #363

## Objective
## Objective
## Objective
Build the root layout shell components that compose the app structure.

## Scope
Create components in goalchain_webapp/src/components/layout/:

### Components:
1. **AppShell.tsx** — Root layout wrapper
   - Providers: Wallet, QueryClient, ToastContainer, Theme
   - Responsive: sidebar (desktop), bottom nav (mobile)
   - Outlet for page content
   - Glassmorphic background

2. **Sidebar.tsx** — Desktop navigation
   - Nav items: Dashboard, Play, Stadium, Club, DeFi, NFTs, Squad, Ops, Profile
   - Active state indication
   - Collapsible on hover/focus
   - Glassmorphic .glass-strong

3. **Header.tsx** — Top bar
   - Logo, global search, wallet connect, notification bell, theme toggle
   - Glassmorphic .glass-brand
   - Sticky on scroll

4. **DashboardGrid.tsx** — Responsive grid layout
   - CSS Grid: 1col mobile, 2col tablet, 3col desktop, 4col xl
   - Gap using spacing tokens
   - Staggered entrance animation

5. **PlayNav.tsx** — Bottom navigation (mobile)
   - 5 tabs: Inicio, Estadio, DeFi, Club, Manager
   - Active indicator with spring animation
   - Glassmorphic .glass-strong
   - Safe area inset for iOS

6. **PlayLayout.tsx** — Page wrapper for play pages
   - Portal header slot
   - Content area with responsive padding
   - Consistent max-width

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #363
