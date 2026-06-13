# OA Proposal — Issue #737

## Title
[P0] Webapp: Build Layout Shell (AppShell, Sidebar, Header, DashboardGrid, PlayNav)

## Source
GitHub issue #737

## Objective
## P0 — Webapp: Build Layout Shell (AppShell, Sidebar, Header, DashboardGrid, PlayNav)

**Objective:** Create root layout components that compose the app structure.

**Target structure:**
```
goalchain_webapp/src/components/layout/
├── AppShell.tsx        # Root layout wrapper
│   # Providers: Wallet, QueryClient, ToastContainer, Theme
│   # Responsive: sidebar (desktop), bottom nav (mobile)
│   # Outlet for page content
│   # Glassmorphic background
├── Sidebar.tsx         # Desktop navigation
│   # Nav items: Dashboard, Play, Stadium, Club, DeFi, NFTs, Squad, Ops, Profile
│   # Active state, collapsible on hover/focus
│   # Glassmorphic .glass-strong
├── Header.tsx          # Top bar
│   # Logo, global search, wallet connect, notification bell, theme toggle
│   # Glassmorphic .glass-brand, sticky on scroll
├── DashboardGrid.tsx   # Responsive grid layout
│   # CSS Grid: 1col mobile, 2col tablet, 3col desktop, 4col xl
│   # Gap using spacing tokens, staggered entrance animation
├── PlayNav.tsx         # Bottom navigation (mobile)
│   # 5 tabs: Inicio, Estadio, DeFi, Club, Manager
│   # Active indicator with spring animation
│   # Glassmorphic .glass-strong, safe area inset for iOS
├── PlayLayout.tsx      # Page wrapper for play pages
│   # Portal header slot, content area with responsive padding
│   # Consistent max-width
└── index.ts            # Barrel export
```

**Styling requirements:**
- Use design tokens exclusively (colors, spacing, motion, borders, typography)
- Glassmorphism throughout (.glass-strong, .glass-brand, .glass-subtle)
- Motion tokens for transitions
- Responsive spacing tokens

**Acceptance criteria:**
- AppShell renders full app structure

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-737` and close draft PR.
