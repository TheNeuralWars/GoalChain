# OA Proposal — Issue #515

## Title
[OPENCODE] [P0] #362 UI Primitive Component Library (Button, Card, Input, Tabs, Toast, Badge, Chart, Modal)

## Source
Local queue (autonomous mode)

## Objective
# [OPENCODE] [P0] #362 UI Primitive Component Library (Button, Card, Input, Tabs, Toast, Badge, Chart, Modal)

## Priority: P0 (webapp foundation)
## Labels: agent:opencode, priority:P0, area:webapp, status:ready

## Objective
Build reusable, accessible, styled primitive components using design system tokens (#361).

## Components to Build
| Component | Variants | States | A11y |
|-----------|----------|--------|------|
| `Button` | primary, secondary, ghost, danger, glass | loading, disabled, icon-only | ✅ |
| `Card` | default, glass, elevated, interactive | hover, focus | ✅ |
| `Input` | text, number, search, textarea | error, disabled, helper text | ✅ |
| `Tabs` | line, enclosed, glass | keyboard nav | ✅ |
| `Toast` | success, error, warning, info | auto-dismiss, action | ✅ |
| `Badge` | default, dot, pulse, glass | removable | ✅ |
| `Chart` | line, bar, area, sparkline | responsive, tooltip | ✅ |
| `Modal` | default, fullscreen, drawer | focus trap, ESC close | ✅ |

## Architecture
```
goalchain_webapp/src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── Card/ ...
...
├── index.ts          # Barrel export
└── types.ts          # Shared props interfaces
```

## Tech Stack
- **Styling**: Tailwind + design tokens (CSS vars)
- **Animation**: Framer Motion (variants from tokens)
- **A11y**: Radix UI primitives where applicable
- **Charts**: Recharts (styled with tokens)
- **Testing**: Vitest + Testing Library

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
- Rollback: revert branch `exp/opencode-issue-515`.
