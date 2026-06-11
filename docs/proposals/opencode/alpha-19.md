# OA Proposal: Issue #19 — [OPENCODE] [P0] #362 UI Primitive Component Library (Button, Card, Input, Tabs, Toast, Badge, Chart, Modal)

**Worker:** alpha (partition 0)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
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
- **Docs**: Storybook (required for each component)

## Verification
```bash
cd goalchain_webapp
npm run typecheck
npm run test -- --run
npm run storybook -- --ci --quiet
npm run build
```

## Acceptance Criteria
- All 8 components + variants implemented
- Storybook stories for each variant/state
- >90% test coverage on primitives
- A11y audit passes (axe-core in CI)
- Bundle size impact <5kb gzipped per component
- Exported from `@/components/ui` barrel
