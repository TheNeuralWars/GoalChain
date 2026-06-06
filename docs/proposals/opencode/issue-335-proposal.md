# OA Proposal — Issue #335

## Title
[OPENCODE] Webapp: Build layout/ shell (AppShell, Sidebar, Header, DashboardGrid, PlayNav)

## Source
GitHub issue #335

## Objective
## Objective
Build the app layout components in goalchain_webapp/src/layout/:

## Scope
Create `src/layout/` with:

1. `AppShell.tsx` - Main container: Sidebar + Header + Main + Footer, responsive
2. `Sidebar/`
   - `Sidebar.tsx` - Collapsible, navigation items, active state, mobile drawer
   - `NavItem.tsx` - Icon, label, badge, active/hover states
   - `UserMenu.tsx` - Avatar, username, wallet address, dropdown actions
3. `Header/`
   - `Header.tsx` - Logo, network badge, wallet connect, notifications, user menu
   - `WalletConnect.tsx` - Wallet adapter wrapper with custom styling
   - `NetworkBadge.tsx` - Devnet/Mainnet indicator with color coding
4. `DashboardGrid.tsx` - CSS Grid wrapper for responsive dashboards (1.6fr / 1fr → 1fr mobile)
5. `PlayNav.tsx` - Play-mode tabs: Manual, Vibe Bots, Coach, Commentator
6. `PageHeader.tsx` - Consistent page titles + actions (breadcrumb, back, actions)
7. `Section.tsx` - Section wrapper with optional header, divider, padding
8. `index.ts` - Barrel export

## Acceptance Criteria
- Mobile-first: Sidebar → drawer @ < 1024px, Header condensible
- Wallet adapter integration with custom theme
- Keyboard navigation (Tab, Arrow keys, Escape)
- Glassmorphism cards throughout
- `npm run build` passes

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
- Rollback: revert main commit linked to issue #335
