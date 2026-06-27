# GoalChain Responsive Shell + Landing Split — Design

**Date:** 2026-06-27
**Status:** Draft (pending user review)
**Owner:** Lead Visual & UI/UX Engineer (ZCode / GLM 5.2)
**Scope:** Both visual layers — React webapp (`goalchain_webapp/`) and marketing site (`docs/`).

---

## 1. Problem Statement

GoalChain suffers from two classes of visual instability:

### 1.1 Webapp shell collapse (Pillar 1 — the reported bug)
Under `1280px` viewport width the sidebar (`.gc-rail--expanded`) becomes `position: fixed`
to act as a floating drawer overlay. Because it leaves the document flow, the CSS Grid
container (`.play-shell--grid`) collapses its layout column, forcing `.play-main` into the
`72px` first grid track. Content squishes to ~72px, shifts off-screen, and the page renders
black. The existing `<1280px` media query (`src/index.css:1264`) is a `!important`-laden
patch layered over this fragility rather than a fix for the root coupling.

**Root cause:** three concerns are coupled — (a) grid-track definitions, (b) the rail's
in-flow vs. out-of-flow positioning, (c) `.play-main`'s `grid-column` placement. When the
rail goes out of flow, the grid math becomes ambiguous and content lands in the wrong track.

### 1.2 Landing-page monolith (Pillar 2)
`docs/index.html` is ~208 KB with 33 sequentially-loaded JS files and ~60 top-level
`const`/`let` declarations across `docs/assets/js/`. Render loops run continuously
regardless of visibility. Scripts are cross-coupled via shared `window.*` globals
(e.g. `marketplace.js:18`, `market_simulators.js:319`, `nft_registry.js:21` all share
`window.BG_IMAGE_MAP` / `window.FLAG_MAP`, with later files depending on earlier ones).

---

## 2. Goals & Non-Goals

### Goals
- **G1.** Eliminate the `<1280px` content collapse — content stays in place at every
  breakpoint; the drawer floats as a pure overlay and never participates in grid math.
- **G2.** Make all interactive webapp panels (DeFi `TradingTerminal`, `SwarmVaults`,
  `StakingBurnDashboard`, Matchday fixtures) fluid and non-overflowing from 390px → 1440px.
- **G3.** Ship two new standalone marketing pages (`arcade.html`, `tokenomics.html`) that
  load only the scripts they need, while leaving `index.html` functionally intact.
- **G4.** Pause off-screen render loops via `IntersectionObserver`; load non-critical
  scripts with `defer`/dynamic import.
- **G5.** Maintain a buildable webapp (`npm run build` green) and break no routing, wallet,
  worker, or translation wiring.

### Non-Goals (out of scope)
- The Solana Wallet Adapter JSX type warnings on `ConnectionProvider` (documented as
  non-blocking — left as-is per project constraints).
- Replacing viewport media queries with container queries (CSS-only shell decoupling chosen).
- React state-driven layout (Approach B) — rejected to avoid re-render-loop risk with wallet hooks.
- Rewriting `index.html` itself into separate pages (Hybrid decision — index optimized in place).
- Decoupling the cross-file `window.*` globals among marketplace/registry/simulators
  (required only where a script moves to a new page; index.html keeps its full script set).

---

## 3. Decisions (recorded)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Approach A — CSS-only shell decoupling** for Pillar 1 | Targets the actual root cause (grid/flow coupling); lowest risk to React mechanics; verifiable via build. |
| D2 | **Hybrid Pillar 2** — new `arcade.html` + `tokenomics.html` as standalone pages; `index.html` optimized in place, NOT split | Cross-file `window.*` coupling makes a full split high-risk; hybrid captures the lazy-load win without re-wiring the live landing page. |
| D3 | **Sequence: Pillar 1 → Pillar 2** | Fixes the reported live bug first on a green build base; Pillar 2 builds on the verified shell. |
| D4 | Introduce one new custom property `--gc-shell-cols` to drive the grid per breakpoint | Single source of truth for the track template; removes the collapse-prone `!important` overrides. |

---

## 4. Architecture

### 4.1 Webapp shell (Pillar 1)

**Grid model — breakpoint-driven, not state-driven.** The grid template is owned by
`--gc-shell-cols`, set per breakpoint. Collapse *state* no longer changes the template
(except on full desktop where expanded vs. collapsed legitimately reflow the rail).

| Breakpoint | `--gc-shell-cols` | Rail behavior | `.play-main` |
|------------|-------------------|---------------|--------------|
| `≥1280px` desktop | `260px 1fr` (expanded) / `72px 1fr` (collapsed) | In-flow, sticky, **pushes content** | `grid-column: 2` |
| `768–1279px` tablet | **`72px 1fr` (fixed)** | Collapsed rail in-flow as 72px gutter; expanded rail = `position: fixed` overlay + `.gc-rail-scrim` backdrop | `grid-column: 2` |
| `<768px` mobile | **`1fr` (fixed)** | Rail `display: none`; bottom-tab shown | `grid-column: 1` |

**Explicit placement guarantees:** `.gc-rail { grid-column: 1 }`,
`.play-main { grid-column: 2; min-width: 0 }` (mobile: `grid-column: 1`). With the template
fixed at `72px 1fr` on tablet regardless of rail in/out-of-flow, `.play-main` always resolves
to the `1fr` second track and can never collapse into 72px.

**The expanded-rail overlay drawer (tablet):** When the user opens the rail on a tablet,
the rail becomes `position: fixed; left:0; top:0; height:100vh; width: var(--gc-rail-expanded);`
over a `.gc-rail-scrim` (full-screen dim, click-to-close, `backdrop-filter: blur`). Content
does **not** shift — only the overlay appears on top.

**React change (minimal, D1-compliant):** Add to `PlayLayout.tsx`:
- A debounced `resize` listener keeping `collapsed` coherent across resizes (today it only
  initializes from `innerWidth` and never updates — a latent bug).
- A `drawerOpen` state for the tablet overlay + scrim, toggled by the rail toggle button
  on tablet widths. **This state only toggles a CSS overlay (the scrim + the fixed drawer);
  it does not drive the grid layout mode** — that stays entirely in CSS via
  `--gc-shell-cols`. So it does not violate the "no React state-driven *layout*" decision (D1).
  No changes to `PlayNav.tsx`'s `NavItem`/`NavGroup` rendering, routing, wallet adapters, or hooks.

**What gets removed:** the `<1280px` `!important` patch block (`src/index.css:1264-1300`)
is replaced by the clean `--gc-shell-cols` system. No new `!important` rules are introduced.

### 4.2 Panel responsiveness (Pillar 1)

- **TradingTerminal (`TradingTerminal.tsx`):** SVG charts already scale via
  `preserveAspectRatio`. Extract the inline `style={{ display:'grid', gridTemplateColumns: ... }}`
  blocks into named classes (`.tt-grid`, `.tt-controls`, `.tt-chart`) that wrap at `≤900px`
  and stack at `≤600px`; center the sentiment gauge on mobile.
- **StakingBurnDashboard:** replace fragile `div[style*="grid"]` attribute-selector
  overrides (`src/index.css:2210`, `2966`) with semantic classes (`.burn-kpi-grid`).
- **NFT 3D cards:** swap the hardcoded `width:280px; height:400px`
  (`src/index.css:3586`) for `width: clamp(220px, 90vw, 280px); aspect-ratio: 280/400`.
- **Fixtures bracket:** preserve horizontal scroll; ensure `.gc-fixtures-toolbar` wraps.
- **Mobile simplification:** collapse verbose logs (`vibe-ledger`, `terminal-console`,
  `bot-switch-container`) behind `<details>`/accordion at `<768px`; enforce ≥44×44px touch
  targets on bottom-tab, nav links, arcade buttons.

### 4.3 Marketing-site standalone pages (Pillar 2 — Hybrid)

Two new self-contained pages, each with its own lean `<head>`, the shared
`tokens.css`/`style.css`, and **only the scripts it needs** (loaded `defer`):

- **`arcade.html`** — minigames hub: penalty shootout + pack opener.
  Scripts: `penalty_game.js`, `pack_opener.js`. Before moving either, grep it for every
  `window.*` and top-level global it reads; each consumed global is then initialized locally
  on the page (via `var X = window.X || {…default…}`) so the page has zero cross-file
  dependencies.
- **`tokenomics.html`** — economy & stats: burn tracker + oracle observability + charts.
  Scripts: `burn_tracker.js`, `economy_observability.js`, treated the same way (audit + local
  init of any consumed global).

**Each page:**
- Reuses the canonical glassmorphic nav (sticky, active-state highlighting for the current page).
- Defines its own page-local init; no reliance on `index.html`'s global boot sequence.
- Hosts the relevant components moved as **clean copies** (not the cross-coupled originals).

### 4.4 `index.html` in-place optimization (Pillar 2 — Hybrid)

`index.html` keeps its full functionality and script set (D2), but is hardened:
- Remove `maximum-scale=1.0, user-scalable=no` from the viewport meta (`index.html:7`) —
  accessibility fix (WCAG 1.4.4).
- Fix the **duplicate `id="roadmap"`** (`index.html:3140` and `4545`) — rename the second.
- **Render-loop pausing:** wrap `setInterval`/`requestAnimationFrame` loops in
  `start()`/`stop()` routines; attach an `IntersectionObserver` per heavy section
  (`#gameplay` penalty canvas, economy panels) that calls `stop()` when off-screen and
  `start()` when visible.
- Add `defer` to non-critical `<script>` tags where execution order permits (audited per-tag;
  load-bearing order preserved).
- **Penalty canvas DPR-awareness:** read backing-store size from layout instead of the fixed
  `800×500` (`index.html:2367`) so hit detection survives resize and DPR.
- Fluid pitch-feature cards: `260px` fixed inline → responsive flex.
- Cross-link the new pages from `index.html` nav (Arcade, Tokenomics) so the funnel is intact.

### 4.5 Global-namespace safety (both layers)

- In any new or touched `docs/assets/js/` file: never top-level `const`/`let`.
  Use `var X = window.X || {...}` (defensive) or IIFE/module scoping.
- New pages' scripts are written clean from the start (IIFE namespaced, no shared globals).
- For the penalty/pack scripts that move to `arcade.html`, any cross-file global they
  previously consumed (e.g. `BG_IMAGE_MAP`) is **initialized locally** on the page.

---

## 5. Components / Files Touched

### Pillar 1 (webapp)
| File | Change |
|------|--------|
| `goalchain_webapp/src/styles/tokens.css` | Add `--gc-shell-cols` token + breakpoint overrides. |
| `goalchain_webapp/src/index.css` | Rewrite shell grid block (`:812-843`) + `<1280px` block (`:1264-1300`); add `.gc-rail-scrim`; panel classes (`.tt-grid`, `.burn-kpi-grid`); NFT clamp; accordion. |
| `goalchain_webapp/src/ui/PlayLayout.tsx` | Add debounced resize listener + tablet `drawerOpen`/scrim state (minimal, routing/wallet untouched). |
| `goalchain_webapp/src/ui/TradingTerminal.tsx` | Replace inline grid styles with `.tt-*` classes. |

### Pillar 2 (marketing)
| File | Change |
|------|--------|
| `docs/arcade.html` | **New** — minigames hub page. |
| `docs/tokenomics.html` | **New** — economy/stats page. |
| `docs/assets/js/arcade.js` | **New** — page-local clean init for arcade (IIFE). |
| `docs/assets/js/tokenomics.js` | **New** — page-local clean init for tokenomics (IIFE). |
| `docs/index.html` | In-place: viewport meta, duplicate `#roadmap`, `defer`, IO pause loops, penalty DPR, nav cross-links. |
| `docs/assets/js/penalty_game.js` | Make backing-store size layout-driven (DPR-aware). |
| `docs/assets/css/style.css` | Hardcoded `#14f195`/`#9945ff`/`#ff4b4b` → `var(--gc-*)` where touched. |

No changes to: `PlayNav.tsx` nav rendering, `App.tsx` routing, wallet adapter code,
simulation workers, `useTranslation`/`useUser`, or any `t('key')` wrapper.

---

## 6. Verification

- **After every webapp edit:** `npx tsc --noEmit` (fast), and `npm run build`
  (`tsc && vite build`) at the end of Pillar 1 and before commit. Build must stay green.
- **docs/ global audit:** grep for duplicate `const`/`let` top-level declarations across
  `docs/assets/js/` before commit; confirm no re-declaration risk on the new pages.
- **Manual breakpoint sweep (both layers):** 1440 / 1280 / 1024 / 768 / 390px.
  Specifically verify: no black screen at 1024px with drawer open; content centered; bottom-tab
  functional; new pages render without console errors.
- **Honesty:** report build/test results faithfully; if a step is skipped, state it.

---

## 7. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Moving a script to `arcade.html`/`tokenomics.html` silently breaks a `window.*` dependency | Medium | Audit dependency graph per moved script; initialize consumed globals locally; manual console check. |
| Shell rewrite introduces a new collapse path | Low | Fixed `--gc-shell-cols` per breakpoint + explicit `grid-column` placement; sweep all 5 breakpoints. |
| `defer` reordering breaks load-bearing script order in `index.html` | Medium | Apply `defer` only to scripts verified order-independent; keep critical inline inits in order. |
| Penalty-canvas DPR change breaks hit detection | Medium | Keep input coordinate-mapping (existing scale logic at `penalty_game.js:72-75`); test resize + touch. |
| Wallet adapter re-render interaction | Low (D1) | No React state-driven layout; resize listener is debounced and only sets `collapsed`/`drawerOpen`. |

---

## 8. Out of Scope / Deferred

- Full de-monolithization of `index.html` into separate sections (D2 — Hybrid chosen).
- Decoupling cross-file `window.*` globals among marketplace/registry/simulators on `index.html`.
- Container-query migration; React-owned responsive layout (Approach B).
- Wallet adapter JSX type refactors.
- Any change to translation keys or text assets.

---

## 9. Implementation Sequencing

To be expanded into a step-by-step plan by the `writing-plans` skill. High-level order
(consistent with D3 — Pillar 1 → Pillar 2):

1. **P1.1** Tokens: add `--gc-shell-cols` + breakpoint values.
2. **P1.2** Shell grid rewrite + `.gc-rail-scrim`; remove old `!important` patch.
3. **P1.3** `PlayLayout.tsx` resize listener + drawer/scrim state.
4. **P1.4** Panel classes (`.tt-*`, `.burn-kpi-grid`), NFT clamp, accordions, touch targets.
5. **P1.5** `npm run build` green; breakpoint sweep. **→ Pillar 1 shippable checkpoint.**
6. **P2.1** `index.html` in-place hardening (viewport, dup ID, defer, IO loops, penalty DPR).
7. **P2.2** Build `arcade.html` + `arcade.js` (clean, dependency-audited).
8. **P2.3** Build `tokenomics.html` + `tokenomics.js` (clean, dependency-audited).
9. **P2.4** Nav cross-links + global-namespace grep audit; final sweep.
