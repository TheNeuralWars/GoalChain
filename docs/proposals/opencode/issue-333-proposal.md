# OA Proposal — Issue #333

## Title
[OPENCODE] Webapp: Create design system tokens + styles structure

## Source
GitHub issue #333

## Objective
## Objective
Create the design system foundation in goalchain_webapp/src/styles/:

## Scope
Create `src/styles/` with:

1. `tokens.css` - ALL CSS custom properties (HSL palette, spacing, radius, shadows, glass, typography, transitions, z-index, breakpoints) — from the MASTER_REARCHITECT_PLAN
2. `globals.css` - Reset, base, scrollbar, selection, body background
3. `components.css` - Component utilities: .glass-card, .btn-*, .badge-*, .feed-row, .progress-container, .feed-badge-*
4. `animations.css` - Keyframes: pulse-glow, holo-shimmer, slide-in, fade-in, spin, shake, reduced-motion
5. `layout.css` - Grid/flex helpers: .dashboard-grid, .app-container, .sidebar, .header, .page-header, .section
6. `index.css` - Barrel: @import 'tokens'; @import 'globals'; @import 'components'; @import 'animations'; @import 'layout'; font imports

## Acceptance Criteria
- Zero hardcoded colors/spacing in components
- All values reference design tokens
- Dark-mode only (color-scheme: dark)
- Glassmorphism: backdrop-filter: blur(16px) saturate(180%)
- Neon accents: green #14f195, purple #9945ff, red #ff4b4b
- `npm run build` passes

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #333
