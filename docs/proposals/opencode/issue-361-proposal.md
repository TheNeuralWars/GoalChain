# OA Proposal — Issue #361

## Title
[OPENCODE] [OPENCODE] Webapp: Create design system tokens + styles structure (HSL, glassmorphism, motion)

## Source
GitHub issue #361

## Objective
## Objective
## Objective
Establish the premium design system foundation: HSL color tokens, glassmorphism utilities, extended motion curves, and component CSS structure.

## Scope
Create/modify files in goalchain_webapp/src/styles/:

### New Files:
1. **src/styles/tokens/colors-hsl.css** — HSL primitive palette + semantic HSL variables for glassmorphism
   - Brand, accent, error, Solana purple, neutral in HSL
   - Glass base variables: --hsl-bg-glass, --hsl-border-glass, --hsl-text-primary, --hsl-text-dim
   - Dark mode overrides via [data-theme="dark"]

2. **src/styles/components/glass.css** — Glassmorphism utility classes
   - .glass, .glass-strong, .glass-brand, .glass-accent, .glass-elevated
   - backdrop-filter: blur(20px) saturate(180%) + fallbacks
   - prefers-reduced-motion guard (blur(8px))

3. **src/styles/tokens/motion-premium.css** — Extended motion tokens
   - Expressive easings: --easing-spring-gentle, --easing-spring-sharp, --easing-ease-out-expo
   - Semantic durations: --motion-duration-100 through 500
   - Stagger helpers: .stagger-1 through .stagger-8
   - Page transitions: .page-enter, .page-exit

4. **src/styles/components/button.css** — Button primitive styles (using tokens)
   - Variants: .btn-neon-green, .btn-neon-purple, .btn-outline-green, .btn-outline-red, .btn-ghost
   - States: hover, active, disabled, focus-visible
   - Motion: transform scale on press, color transitions

5. **src/styles/components/card.css** — Card primitives
   - .glass-card, .glass-card-hover, .glass-card-elevated
   - Padding variants using spacing tokens

6. **src/styles/components/input.css** — Form input styles
   - .form-input, .form-select, .form-label
   - Focus ring using --color-border-focus

7. **src/styles/components/tabs.css** — Glassmorphic tab system
   - .portal-tabs, .portal-tab-btn, .portal-tab-btn--active
   - Indicator animation

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-361` and close draft PR.
