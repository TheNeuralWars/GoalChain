# OA Proposal — Issue #514

## Title
[OPENCODE] [P0] #361 Design System — Tokens + Styles Structure (HSL, glassmorphism, motion)

## Source
Local queue (autonomous mode)

## Objective
# [OPENCODE] [P0] #361 Design System — Tokens + Styles Structure (HSL, glassmorphism, motion)

## Priority: P0 (webapp foundation)
## Labels: agent:opencode, priority:P0, area:webapp, status:ready

## Objective
Create canonical design system tokens and base styles for GoalChain webapp.

## Deliverables
```
goalchain_webapp/src/styles/
├── tokens/
│   ├── colors.ts          # HSL tokens (primary, semantic, glass)
│   ├── spacing.ts         # Space scale (4px base)
│   ├── typography.ts      # Font families, sizes, line heights
│   ├── radius.ts          # Border radius scale
│   ├── shadows.ts         # Elevation + glass shadows
│   ├── motion.ts          # Transition durations, easings
│   └── index.ts
├── globals.css            # CSS custom properties + base styles
├── glassmorphism.css      # Glass utilities (backdrop-filter, borders)
└── theme-provider.tsx     # React context for theme switching
```

## Token Specs (from branding)
| Category | Values |
|----------|--------|
| **Primary HSL** | 220 85% 55% (GoalChain blue) |
| **Glass BG** | `hsla(0, 0%, 100%, 0.08)` / `hsla(0, 0%, 0%, 0.6)` |
| **Glass Border** | `hsla(0, 0%, 100%, 0.12)` |
| **Motion** | `fast: 150ms`, `base: 250ms`, `slow: 400ms` |
| **Easing** | `ease-out-cubic`, `ease-in-out-quart` |

## Files to Create
- All token files + globals.css + glassmorphism.css
- `ThemeProvider` component
- Tailwind config extension (`tailwind.config.ts`)

## Verification
```bash

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,area:webapp,

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-514`.
