# OA Proposal: Issue #20 — [OPENCODE] [P0] #361 Design System — Tokens + Styles Structure (HSL, glassmorphism, motion)

**Worker:** iota (partition 8)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
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
cd goalchain_webapp
npm run typecheck
npm run build
# Storybook: verify tokens render correctly
```

## Acceptance Criteria
- Tokens exported as TS constants + CSS custom properties
- Glassmorphism utilities work (backdrop-blur, semi-transparent bg)
- Motion tokens used in Framer Motion variants
- ThemeProvider supports light/dark (future)
- Zero hardcoded colors in components after migration
