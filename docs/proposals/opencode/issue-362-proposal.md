# OA Proposal — Issue #362

## Title
[OPENCODE] [OPENCODE] Webapp: Build ui/ primitive component library (Button, Card, Input, Tabs, Toast, Badge, Chart, Modal)

## Source
GitHub issue #362

## Objective
## Objective
## Objective
Build the shared UI primitive component library using the design system tokens from #361.

## Scope
Create components in goalchain_webapp/src/components/ui/:

### Components to Create:
1. **Button.tsx** — Variants: neon, outline, ghost; sizes: sm, md, lg; loading state; forwardRef
2. **Card.tsx** — GlassCard, GlassCardHover, GlassCardElevated; children slot; optional header/footer
3. **Input.tsx** — Text, number, select; label; error state; forwardRef; uses form-input CSS
4. **Tabs.tsx** — TabList, TabTrigger, TabPanel; glassmorphic; keyboard navigation; controlled/uncontrolled
5. **Toast.tsx** — Toast (success/error/warn), ToastContainer (fixed bottom-right, stack, auto-dismiss)
6. **Badge.tsx** — Status (simulation, live, devnet), Rarity (mythic/legendary/epic/rare/common), Dot
7. **Chart.tsx** — LineChart, AreaChart, StackedBarChart; SVG; responsive; glow animations; tooltip
8. **Modal.tsx** — Portal-backed; overlay; focus trap; escape to close; sizes: sm, md, lg, full
9. **Tooltip.tsx** — Hover/focus; positioning; arrow; delay
10. **Avatar.tsx** — Image fallback, initials, sizes, status indicator
11. **ProgressBar.tsx** — Linear, stacked, animated; variants: brand, accent, error
12. **Table.tsx** — Header, Row, Cell; sortable; responsive; sticky header
13. **FormField.tsx** — Label + Input + ErrorMessage + Hint; vertical layout
14. **Toggle.tsx** — Switch, checkbox, radio group; animated
15. **Dropdown.tsx** — Trigger, Menu, Item, Divider; keyboard nav; portal

### Barrel Export:
- **src/components/ui/index.ts** — Export all primitives

### Implementation Rules:
- Use CSS variables from design tokens (no hardcoded colors)
- ClassName prop for extension (clsx/tailwind-merge pattern without tailwind)
- forwardRef for all interactive components
- TypeScript strict: proper HTMLAttribute types
- Accessibility: ARIA roles, keyboard nav, focus management
- Reduced motion: respect prefers-reduced-motion via CSS

## Acceptance Criteria
- All 15 components render without console errors
- Storybook stories for each component (deferred to #349)
- Unit tests for Button, Card, Input, Tabs, Toast (deferred to #349)
- Build passes: npm run build

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-362` and close draft PR.
