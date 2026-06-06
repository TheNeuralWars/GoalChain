# OA Proposal — Issue #334

## Title
[OPENCODE] Webapp: Build ui/ primitive component library (15 components)

## Source
GitHub issue #334

## Objective
## Objective
Build the primitive component library in goalchain_webapp/src/ui/:

## Scope
Create `src/ui/` with 15 primitive components (each in own folder with index.ts, Component.tsx, Component.stories.tsx, Component.test.tsx):

1. `Button` - variants: primary, secondary, outline, ghost, danger, success | sizes: sm, md, lg | loading, disabled, leftIcon, rightIcon, fullWidth
2. `Card` - variants: default, elevated, glass, interactive | padding: none, sm, md, lg | hover lift
3. `Input` - label, helperText, error, success, leftIcon, rightIcon, type
4. `Select` - searchable, multi, grouped, clearable, placeholder
5. `Textarea` - resize, minRows, maxRows
6. `Checkbox` - indeterminate, label
7. `Switch` - size, color, withLabel
8. `Radio` / `RadioGroup` - orientation, options
9. `Slider` - single, range, marks, step, label
10. `Badge` - variants: primary, success, warning, error, info | sizes: sm, md | dot, icon, removable
11. `Avatar` - sizes: xs, sm, md, lg, xl | shape: circle, square | fallback initials/icon
12. `Tooltip` - positions: top, bottom, left, right | delay, arrow
13. `Modal` - variants: default, confirm, form, fullscreen | footer, closeOnOverlayClick
14. `Tabs` - variants: line, enclosed, soft | orientation: horizontal, vertical | lazyMount
15. `Progress` - variants: line, circle, stacked | indeterminate, showLabel, color

Plus: `Icon` (Lucide wrapper), `Spinner`, `Toast`, `Separator`, `Dropdown`, `Table`, `DataGrid` (TanStack), `Chart` (Recharts wrapper)

## Acceptance Criteria
- Each component < 200 lines
- Fully typed with discriminated unions for variants
- CSS Modules or style prop with design tokens
- Storybook stories for all variants/states
- Vitest + RTL unit tests
- Accessibility: ARIA, keyboard nav, focus management, reduced motion
- Barrel export in `src/ui/index.ts`

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## Owner
opencode

## Priority

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #334
