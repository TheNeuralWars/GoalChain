# GoalChain Phase 1 — Responsive Shell + Landing Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the `<1280px` webapp content collapse, make all interactive panels fluid 390→1440px, and ship two lean standalone marketing pages (`arcade.html`, `tokenomics.html`) while keeping `index.html` functionally intact.

**Architecture:** Two pillars. **Pillar 1** is a CSS-only shell decoupling: a new `--gc-shell-cols` custom property owns the grid template per breakpoint, while a React `drawerOpen` state drives *only* a fixed overlay drawer + scrim (never the grid mode). **Pillar 2** is a Hybrid landing split: `index.html` is hardened in place, and two new self-contained pages each load only their own scripts with locally-initialized globals.

**Tech Stack:** React 18 + Vite + TypeScript (webapp); vanilla HTML5/CSS/JS (docs). Solana neon tokens (`--gc-green/purple/red`). Verification: `npx tsc --noEmit`, `npm run build`, manual breakpoint sweep.

**Spec:** `docs/superpowers/specs/2026-06-27-responsive-shell-and-landing-split-design.md` (decisions D1–D4 recorded there).

**Baseline state verified before planning:** `npx tsc --noEmit` exits 0 (green). Branch: `main`. Three untracked shell scripts in `scripts/` are unrelated and left alone.

---

## File Structure

### Pillar 1 (webapp)
| File | Responsibility | Action |
|------|----------------|--------|
| `goalchain_webapp/src/styles/tokens.css` | Add `--gc-shell-cols` token + breakpoint overrides (the single source of truth for the grid track template). | Modify §9 (chasis tokens, `:135-136`) |
| `goalchain_webapp/src/index.css` | Rewrite shell grid block (`:819-839`) + replace `<1280px` `!important` patch (`:1264-1300`) + add `.gc-rail-scrim`; add panel classes (`.tt-grid`, `.burn-kpi-grid`); NFT clamp; accordions. | Modify |
| `goalchain_webapp/src/ui/PlayLayout.tsx` | Add debounced resize listener + `drawerOpen` state + scrim overlay (routing/wallet untouched). | Modify |
| `goalchain_webapp/src/ui/TradingTerminal.tsx` | Replace 2 inline grid styles with `.tt-grid` class. | Modify (`:489`, `:557`) |

### Pillar 2 (marketing)
| File | Responsibility | Action |
|------|----------------|--------|
| `docs/arcade.html` | New minigames hub page (penalty + pack opener), lean `<head>`, shared nav. | Create |
| `docs/tokenomics.html` | New economy/stats page (burn tracker + observability + charts). | Create |
| `docs/assets/js/arcade.js` | Page-local clean init for arcade (IIFE, local globals). | Create |
| `docs/assets/js/tokenomics.js` | Page-local clean init for tokenomics (IIFE, local globals). | Create |
| `docs/index.html` | In-place: viewport meta (`:5-7`), duplicate `#roadmap` (`:4545`), IO pause loops, nav cross-links. | Modify |
| `docs/assets/js/penalty_game.js` | Make canvas backing-store size layout-driven (DPR-aware). | Modify (constructor) |

No changes to: `PlayNav.tsx` nav rendering/routing, `App.tsx` routing, wallet adapter code, simulation workers, `useTranslation`/`useUser`, any `t('key')` wrapper, or cross-file `window.*` globals on `index.html`.

---

## Phase 1 Sequencing (from spec §9)

- **P1.1–P1.5** = Pillar 1, ending at a shippable checkpoint (green build).
- **P2.1–P2.4** = Pillar 2.

Tasks below are numbered to match. Each task is self-contained and committed independently.

---

## Task P1.1: Add `--gc-shell-cols` token

**Files:**
- Modify: `goalchain_webapp/src/styles/tokens.css` (§9 chasis, around line 136)

**Context:** The current grid template lives inline in `index.css` as `grid-template-columns: var(--gc-rail-expanded) 1fr;`. Decision D4 moves the template into one custom property so breakpoints can override it cleanly without `!important`. The token has no value at `:root` (desktop wins via the `.play-shell--*` classes) — it is only *defined* in media queries for tablet/mobile.

- [ ] **Step 1: Add the token with desktop value + breakpoint overrides**

Insert after the `--gc-bottom-tab-h: 64px;` line (`tokens.css:136`), so the chasis block reads:

```css
  --gc-bottom-tab-h: 64px; /* barra móvil */

  /* Template de rejilla del shell (D4 — fuente única de verdad).
     Desktop lo define; tablet/móvil lo sobreescriben en sus media queries
     dentro de index.css. Valor por defecto = escritorio expandido. */
  --gc-shell-cols: var(--gc-rail-expanded) 1fr;
```

No other edits to `tokens.css`. The `--gc-shell-cols` token now exists and resolves to `260px 1fr` at desktop by default.

- [ ] **Step 2: Verify the token parses (no build break)**

Run: `cd goalchain_webapp && npx tsc --noEmit`
Expected: exit 0 (green — CSS tokens don't affect tsc, but confirms no accidental file corruption).

- [ ] **Step 3: Commit**

```bash
git add goalchain_webapp/src/styles/tokens.css
git commit -m "feat(webapp): add --gc-shell-cols grid token (D4)"
```

---

## Task P1.2: Rewrite shell grid + add scrim; remove `!important` patch

**Files:**
- Modify: `goalchain_webapp/src/index.css` — shell grid block (`:819-839`) and the `<1280px` responsive block (`:1264-1300`)

**Context:** This is the core fix. Today the grid template is set directly on `.play-shell--grid` and `.play-shell--collapsed/expanded`. When the rail goes `position: fixed` on tablet, the grid still computes a `260px` first track (because the template says so), but the rail no longer occupies it — and the `!important` patch at `:1264` tries to force `72px 1fr` regardless of expanded/collapsed. The fix: the template comes from `--gc-shell-cols`, and the tablet breakpoint pins that to `72px 1fr` *always* (collapsed rail in-flow as a 72px gutter). The expanded rail becomes a pure `position: fixed` overlay that does **not** participate in grid math. Content (`.play-main`) always resolves to the `1fr` second track.

- [ ] **Step 1: Rewrite the shell grid block to consume `--gc-shell-cols`**

Replace lines `:819-830` (the `.play-shell--grid`, `.play-shell--grid.play-shell--collapsed`, `.play-shell--grid.play-shell--expanded` rules) with:

```css
.play-shell--grid {
  display: grid;
  grid-template-columns: var(--gc-shell-cols);
  align-items: start;
  transition: grid-template-columns var(--gc-dur-base) var(--gc-ease);
}
.play-shell--grid.play-shell--collapsed {
  --gc-shell-cols: var(--gc-rail-collapsed) 1fr;
}
.play-shell--grid.play-shell--expanded {
  --gc-shell-cols: var(--gc-rail-expanded) 1fr;
}
```

Note: `.play-main` (`:833-839`) already has `grid-column: 2; min-width: 0;` — leave it untouched. This is the explicit placement that guarantees content lands in the `1fr` track.

- [ ] **Step 2: Replace the `<1280px` patch block with clean breakpoint overrides + scrim**

Replace the entire `@media (max-width: 1280px) { ... }` block at `:1264-1300` with:

```css
@media (max-width: 1279px) {
  /* Tablet: la rejilla SIEMPRE es 72px 1fr, sin importar el estado del rail.
     El rail colapsado ocupa los 72px in-flow; el expandido flota como overlay. */
  .play-shell--grid,
  .play-shell--grid.play-shell--collapsed,
  .play-shell--grid.play-shell--expanded {
    --gc-shell-cols: var(--gc-rail-collapsed) 1fr;
  }

  /* Rail colapsado: gutter in-flow de 72px (sin cambios de comportamiento). */
  .gc-rail--collapsed {
    position: sticky;
    width: var(--gc-rail-collapsed);
  }

  /* Rail expandido en tablet: cajón flotante (overlay). NO participa en la rejilla. */
  .gc-rail--expanded {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 500;
    width: var(--gc-rail-expanded);
    background: var(--gc-glass-strong-bg);
    backdrop-filter: var(--gc-glass-strong-blur);
    -webkit-backdrop-filter: var(--gc-glass-strong-blur);
    box-shadow: 10px 0 35px rgba(0, 0, 0, 0.7);
  }

  /* Mostrar textos y elementos del sidebar expandido en tablet */
  .gc-rail--expanded .gc-rail-brand-text,
  .gc-rail--expanded .gc-nav-group-label,
  .gc-rail--expanded .gc-nav-link-label,
  .gc-rail--expanded .gc-nav-group-chevron,
  .gc-rail--expanded .gc-nav-group-items,
  .gc-rail--expanded .gc-rail-resources,
  .gc-rail--expanded .gc-rail-footer-lang {
    display: block;
  }
  .gc-rail--expanded .gc-nav-group-items {
    display: flex;
  }
  .gc-rail--expanded .gc-nav-group-head,
  .gc-rail--expanded .gc-nav-link {
    justify-content: flex-start;
  }
}

/* Scrim overlay (cortina que oscurece el contenido bajo el cajón flotante).
   Toggled vía la clase .play-shell--drawer-open añadida por PlayLayout.tsx. */
.gc-rail-scrim {
  position: fixed;
  inset: 0;
  z-index: 490;
  background: rgba(3, 3, 7, 0.6);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  opacity: 0;
  visibility: hidden;
  transition: opacity var(--gc-dur-base) var(--gc-ease),
              visibility var(--gc-dur-base) var(--gc-ease);
}
.play-shell--drawer-open .gc-rail-scrim {
  opacity: 1;
  visibility: visible;
}
```

Key change: the old block used `position: fixed !important` and `width: ... !important` and forced `grid-template-columns` with `!important`. The new block sets the template via the `--gc-shell-cols` custom property (no `!important` needed — media-query specificity wins) and removes every `!important`.

- [ ] **Step 3: Verify build is still green**

Run: `cd goalchain_webapp && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add goalchain_webapp/src/index.css
git commit -m "fix(webapp): decouple shell grid from rail flow (--gc-shell-cols, remove !important)"
```

---

## Task P1.3: `PlayLayout.tsx` — resize listener + drawer/scrim state

**Files:**
- Modify: `goalchain_webapp/src/ui/PlayLayout.tsx` (full rewrite of state + root div className; routing/wallet untouched)

**Context:** Today `collapsed` is initialized from `innerWidth` but never updates on resize — a latent bug (if you resize from desktop to tablet, the rail stays "expanded" and floats, but `.play-main` collapses). We add a debounced resize listener that collapses the rail below 1280px. We also add `drawerOpen`: on tablet, when the user opens the rail it should appear as the fixed overlay + scrim (Task P1.2 CSS). **`drawerOpen` only toggles the CSS overlay class — it never drives the grid mode** (decision D1: no React state-driven layout). The scrim is a click-to-close target.

- [ ] **Step 1: Add the resize listener and drawerOpen state**

Replace the state block at `PlayLayout.tsx:13-21` (the `ugcMode`, `collapsed`, and its localStorage effect) with:

```tsx
  const [ugcMode, setUgcMode] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('gc_nav_collapsed');
    return saved === null ? window.innerWidth < 1280 : saved === '1';
  });
  // drawerOpen sólo activa el overlay flotante (scrim + drawer fijo) en tablet.
  // NO controla el modo de rejilla — eso queda en CSS vía --gc-shell-cols (D1).
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('gc_nav_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  // Listener de resize con debounce: mantiene `collapsed` coherente al cambiar
  // de breakpoint (hoy sólo se inicializa desde innerWidth y nunca se actualiza).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth < 1280) {
          setCollapsed(true);
          setDrawerOpen(false);
        } else {
          setDrawerOpen(false);
        }
      }, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, []);
```

- [ ] **Step 2: Bridge the toggle button to drawerOpen on tablet**

The rail toggle (`PlayNav.tsx:195`, `onClick={() => setCollapsed((c) => !c)}`) calls `setCollapsed`. We do **not** modify `PlayNav.tsx` (out of scope). Instead, `PlayLayout.tsx` wraps `setCollapsed` so that opening the rail on tablet also opens the drawer overlay. Add a wrapper right after the resize effect:

```tsx
  // Wrapper: al expandir el rail por debajo de 1280px, abrir también el overlay.
  const handleToggleCollapse = (next: boolean | ((prev: boolean) => boolean)) => {
    setCollapsed((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      if (!resolved && window.innerWidth < 1280) {
        setDrawerOpen(true); // rail abierto en tablet → mostrar scrim + drawer
      } else if (resolved) {
        setDrawerOpen(false); // rail colapsado → cerrar overlay
      }
      return resolved;
    });
  };
```

Then pass `setCollapsed={handleToggleCollapse}` to `<PlayNav />` (replace the prop at `PlayLayout.tsx:26`):

```tsx
      <PlayNav collapsed={collapsed} setCollapsed={handleToggleCollapse} />
```

- [ ] **Step 3: Add the scrim element + drawer class to the root div**

Two edits to the JSX that already exists in `PlayLayout.tsx` (the `<PlayNav>` prop was already changed to `handleToggleCollapse` in Step 2 — do not touch it again):

**Edit 3a — add `play-shell--drawer-open` to the root className** (`PlayLayout.tsx:24`). Change:

```tsx
    <div className={`play-shell play-shell--grid ${collapsed ? 'play-shell--collapsed' : 'play-shell--expanded'} ${ugcMode ? 'ugc-active' : ''}`}>
```

to:

```tsx
    <div className={`play-shell play-shell--grid ${collapsed ? 'play-shell--collapsed' : 'play-shell--expanded'} ${drawerOpen ? 'play-shell--drawer-open' : ''} ${ugcMode ? 'ugc-active' : ''}`}>
```

**Edit 3b — add the scrim element immediately after the `<PlayNav />` line** (which now reads `setCollapsed={handleToggleCollapse}`). Insert this block right after it, before the `{/* Columna principal... */}` comment:

```tsx
      {/* Scrim: cortina bajo el cajón flotante (click para cerrar) */}
      {drawerOpen && (
        <div
          className="gc-rail-scrim"
          onClick={() => {
            setDrawerOpen(false);
            setCollapsed(true);
          }}
          aria-hidden
        />
      )}
```

Leave everything else in `PlayLayout.tsx` (header, body, bottom tab, UGC button, modals, toaster, analytics) exactly as-is.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd goalchain_webapp && npx tsc --noEmit`
Expected: exit 0. If it fails, the `handleToggleCollapse` signature must match `React.Dispatch<React.SetStateAction<boolean>>` (it does — same `(next: boolean | ((prev: boolean) => boolean)) => void` shape).

- [ ] **Step 5: Run the production build**

Run: `cd goalchain_webapp && npm run build`
Expected: `tsc && vite build` succeeds, `dist/` produced, no errors.

- [ ] **Step 6: Commit**

```bash
git add goalchain_webapp/src/ui/PlayLayout.tsx
git commit -m "feat(webapp): debounced resize listener + tablet drawer overlay/scrim"
```

---

## Task P1.4: Panel responsiveness (TradingTerminal grid class)

**Files:**
- Modify: `goalchain_webapp/src/ui/TradingTerminal.tsx` (`:489`, `:557`) — replace 2 inline grid styles with a class.
- Modify: `goalchain_webapp/src/index.css` — add `.tt-grid` with breakpoints.

**Context:** Two inline `style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}` blocks in `TradingTerminal.tsx` (`:489` manual trading, `:557` the second layout). `minmax(240px, 1fr)` overflows below ~500px. We extract them to a `.tt-grid` class that wraps at `≤900px` and stacks at `≤600px`.

- [ ] **Step 1: Add the `.tt-grid` class to index.css**

Append to the shell/body section (after `.play-body { ... }` block, around `index.css:899`), a new rule:

```css
/* --- Panel grids (TradingTerminal y similares) --- */
.tt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--gc-space-5);
}
@media (max-width: 900px) {
  .tt-grid { grid-template-columns: 1fr; gap: var(--gc-space-4); }
}
@media (max-width: 600px) {
  .tt-grid { gap: var(--gc-space-3); }
}
```

- [ ] **Step 2: Replace the two inline styles in TradingTerminal.tsx**

At `TradingTerminal.tsx:489`, replace:

```tsx
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
```

with:

```tsx
                <div className="tt-grid">
```

At `TradingTerminal.tsx:557`, replace the identical inline style with:

```tsx
                <div className="tt-grid">
```

(Both occurrences are the same string; replace each individually using its surrounding line context to disambiguate.)

- [ ] **Step 3: Verify build**

Run: `cd goalchain_webapp && npx tsc --noEmit && npm run build`
Expected: exit 0, build green.

- [ ] **Step 4: Commit**

```bash
git add goalchain_webapp/src/ui/TradingTerminal.tsx goalchain_webapp/src/index.css
git commit -m "feat(webapp): extract TradingTerminal grid to .tt-grid with breakpoints"
```

---

## Task P1.5: Pillar 1 shippable checkpoint — verify & sweep

**Files:** None modified (verification only).

**Context:** This is the Pillar 1 checkpoint (spec §9, P1.5). Before touching the marketing site, confirm the webapp is green and the collapse bug is fixed across all breakpoints.

- [ ] **Step 1: Confirm clean build**

Run: `cd goalchain_webapp && npm run build`
Expected: green, `dist/` rebuilt.

- [ ] **Step 2: Manual breakpoint sweep (visual)**

Serve the webapp locally (`cd goalchain_webapp && npm run dev` or use the built `dist/`) and verify at each viewport width:
- **1440px desktop:** rail expanded pushes content (260px + 1fr); collapsed = 72px + 1fr. No black screen.
- **1280px:** boundary — desktop behavior.
- **1024px tablet:** rail collapsed in-flow as 72px gutter; content fills `1fr`. Open the rail → it floats as fixed overlay + dim scrim; **content does not shift**; click scrim closes drawer. **This is the bug that was reported — must be gone.**
- **768px:** tablet/mobile boundary.
- **390px mobile:** rail hidden, bottom-tab visible, content single-column, no horizontal scroll in `.play-body`.

Document any anomaly. If the 1024px drawer case still shifts content, re-check that `.play-main` keeps `grid-column: 2` and `min-width: 0` (`index.css:833-835`).

- [ ] **Step 3: Commit checkpoint marker (optional — only if fixes were needed during the sweep)**

If Steps 1–2 pass with no changes, there is nothing to commit. If a fix was needed, commit it with message:

```bash
git commit -am "fix(webapp): pillar 1 breakpoint sweep corrections"
```

**→ Pillar 1 shippable.** Proceed to Pillar 2.

---

## Task P2.1: Harden `index.html` in place

**Files:**
- Modify: `docs/index.html` — viewport meta (`:5-7`), duplicate `#roadmap` (`:4545`).

**Context:** Per spec §4.4. We touch only safe, high-value hardening: (a) the accessibility viewport fix (WCAG 1.4.4), (b) the duplicate `id="roadmap"` rename. The heavier changes (render-loop pausing via IntersectionObserver, penalty-canvas DPR, `defer` auditing) are deliberately *deferred out of this plan* to keep `index.html` risk low and the plan reviewable — they are listed in spec §4.4 but are NOT required for the Phase 1 ship. See plan self-review note below.

- [ ] **Step 1: Fix the viewport meta (remove zoom lock)**

At `docs/index.html:5-7`, replace:

```html
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
```

with:

```html
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    />
```

- [ ] **Step 2: Rename the duplicate `id="roadmap"`**

At `docs/index.html:4545`, the second `<section id="roadmap" class="section section-dark">` is a duplicate of the one at `:3140`. Rename it to `roadmap-archive`:

```html
    <section id="roadmap-archive" class="section section-dark">
```

(Leave the `:3140` one as `roadmap` — it's the one the nav `href="#roadmap"` targets.)

- [ ] **Step 3: Verify the page still loads without console errors**

Open `docs/index.html` in a browser (or `python -m http.server` from `docs/`). Confirm: no new console errors, nav "Roadmap" still scrolls to the `:3140` section.

- [ ] **Step 4: Commit**

```bash
git add docs/index.html
git commit -m "fix(landing): remove zoom lock + dedupe #roadmap (accessibility)"
```

---

## Task P2.2: Build `arcade.html` + `arcade.js` (clean, dependency-audited)

**Files:**
- Create: `docs/arcade.html`
- Create: `docs/assets/js/arcade.js`
- Modify: `docs/assets/js/penalty_game.js` (constructor — DPR-aware backing store)

**Context (dependency audit, completed during planning):**
- `penalty_game.js` is self-contained: it reads only `localStorage` and uses `typeof currentLang !== 'undefined'` guards for optional globals (`window.notifier`, `window.renderSocialTasks`). It instantiates on `DOMContentLoaded` as `window.game = new PenaltyGame('gameCanvas')`. Its canvas is hardcoded `800×500` in the HTML `width`/`height` attributes and the hit-detection uses `getBoundingClientRect()` + scale math (`penalty_game.js:71-75`) — so input mapping already adapts to displayed size. **No cross-file `window.*` dependency to initialize.**
- `pack_opener.js` defensively declares `var packState = window.packState || {...}` (line 5) and defines its own `PACK_FLAG_MAP` (line 317). It reads `players.json` via fetch and uses `window.notifier` (guarded). It needs `solanaWeb3` (loaded from the unpkg CDN) only when actually opening a paid pack. **No cross-file `window.*` dependency to initialize.**

Conclusion: `arcade.js` needs no defensive global initialization beyond what the scripts already guard. We create it as a thin IIFE that (a) guards `window.notifier` so toast calls don't crash, and (b) provides the page-local DOM hooks (`gameCanvas`, pack-opener container). Both scripts already self-instantiate on `DOMContentLoaded`.

- [ ] **Step 1: Make the penalty canvas backing-store DPR-aware**

In `docs/assets/js/penalty_game.js`, the constructor reads `this.width = this.canvas.width; this.height = this.canvas.height;` (lines `:10-11`) from the HTML attributes (`800×500`). To keep crispness on high-DPR screens while preserving the existing `getBoundingClientRect()` hit-mapping, add a DPR setup right after `this.ctx = this.canvas.getContext('2d');` (after line `:9`). Replace lines `:7-11`:

```js
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        // Coordenadas lógicas (espacio de dibujo 800×500). Se mantienen fijas;
        // el backing-store escala con devicePixelRatio para nitidez, sin alterar
        // el mapeo de input (que usa getBoundingClientRect — ver handleInput).
        this.width = 800;
        this.height = 500;
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
```

The drawing code uses `this.width`/`this.height` (logical 800×500) and the CSS `style="width:100%;height:auto;"` controls display size, so `getBoundingClientRect()` in `handleInput` still maps correctly.

- [ ] **Step 2: Create `docs/assets/js/arcade.js` (page-local clean init)**

```js
/**
 * arcade.js — init page-local para arcade.html (Fase 1, P2.2).
 * IIFE namespaced. No globals declarados con const/let a nivel top-level.
 * Garantiza que penalty_game.js y pack_opener.js arranquen sin dependencias
 * cruzadas de index.html: sólo provee un window.notifier seguro (stub) y deja
 * que ambos scripts se autoinstancien en DOMContentLoaded.
 */
(function () {
  var notifier = window.notifier || {
    show: function (title, msg, type) {
      // Fallback mínimo: log + alert opcional para que los toasts no crasheen
      // fuera del contexto de index.html.
      try { console.log('[' + (type || 'info') + '] ' + title + ': ' + msg); } catch (e) {}
    },
    play: function () {}
  };
  window.notifier = notifier;

  // Marca de página cargada (para depuración / observabilidad futura).
  window.__ARCADE_PAGE__ = true;
})();
```

- [ ] **Step 3: Create `docs/arcade.html`**

A lean page: shared `tokens.css` + `style.css`, the glassmorphic nav (with Arcade as the active link), the penalty canvas with the same `id="gameCanvas"` (and logical `800×500` attrs), a pack-opener container, and only `arcade.js` + `penalty_game.js` + `pack_opener.js` + the solana web3 CDN (needed by pack_opener). Load order: CDN first, then arcade.js, then the two game scripts (all without `defer` to preserve the `DOMContentLoaded` instantiation order they rely on).

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>GoalChain Arcade | Penalty Shootout & Pack Opener</title>
    <meta name="description" content="GoalChain Arcade: play the penalty shootout minigame and open NFT packs on Solana." />
    <meta name="theme-color" content="#06060a" />
    <link rel="stylesheet" href="assets/css/tokens.css?v=1.0" />
    <link rel="stylesheet" href="assets/css/style.css?v=4.4" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/png" href="assets/img/logo_3d_clean.png?v=2.0" />
  </head>
  <body>
    <!-- Nav (glassmórfico, link Arcade activo) -->
    <nav class="gc-site-nav" aria-label="Main">
      <a href="index.html" class="gc-site-nav-brand">⚽ Goal<span style="color:var(--gc-green,#14f195)">Chain</span></a>
      <div class="gc-site-nav-links">
        <a href="index.html">Home</a>
        <a href="arcade.html" aria-current="page">Arcade</a>
        <a href="tokenomics.html">Tokenomics</a>
      </div>
    </nav>

    <main class="gc-page">
      <header class="gc-page-header">
        <h1>🎮 GoalChain Arcade</h1>
        <p>Penalty shootout & NFT pack opener. Connected to Solana devnet.</p>
      </header>

      <!-- Penalty Shootout -->
      <section class="gc-arcade-card glass-card">
        <h2>⚽ Penalty Shootout</h2>
        <canvas
          id="gameCanvas"
          width="800"
          height="500"
          style="width: 100%; height: auto; display: block; cursor: crosshair; max-width: 800px; margin: 0 auto;"
        ></canvas>
      </section>

      <!-- Pack Opener (contenedor; pack_opener.js puebla sus elementos) -->
      <section class="gc-arcade-card glass-card">
        <h2>🎁 NFT Pack Opener</h2>
        <div id="packOpenerContainer">
          <button id="openPackBtn" type="button">Open Pack</button>
          <div id="packResult"></div>
        </div>
      </section>
    </main>

    <!-- Scripts: CDN primero, luego init local, luego los juegos (orden DOMContentLoaded) -->
    <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>
    <script src="assets/js/arcade.js?v=1.0"></script>
    <script src="assets/js/penalty_game.js?v=4.1"></script>
    <script src="assets/js/pack_opener.js?v=3.1"></script>
  </body>
</html>
```

> **Note on `packOpenerContainer`:** `pack_opener.js` calls `initPackOpener` on `DOMContentLoaded` which binds to its own element IDs. If the pack opener needs additional markup, replicate the minimal IDs it queries (audit `pack_opener.js` `initPackOpener` before finalizing). The container above is a starting scaffold; if `initPackOpener` early-returns due to missing elements, the penalty game still works and the pack section degrades gracefully.

- [ ] **Step 4: Verify arcade.html loads without console errors**

Serve `docs/` locally and open `arcade.html`. Confirm: penalty canvas renders and responds to clicks (goals register, balance decrements from localStorage); no `ReferenceError` in console; pack button exists. (Live pack opening requires a Phantom wallet on devnet — that's expected manual UX, not a failure.)

- [ ] **Step 5: Commit**

```bash
git add docs/arcade.html docs/assets/js/arcade.js docs/assets/js/penalty_game.js
git commit -m "feat(landing): add arcade.html hub + DPR-aware penalty canvas"
```

---

## Task P2.3: Build `tokenomics.html` + `tokenomics.js` (clean, dependency-audited)

**Files:**
- Create: `docs/tokenomics.html`
- Create: `docs/assets/js/tokenomics.js`

**Context (dependency audit):** `burn_tracker.js` and `economy_observability.js` had **no top-level `const`/`let` or unguarded `window.*` reads** (verified by grep during planning). They self-instantiate on `DOMContentLoaded` and draw into their own element IDs. So `tokenomics.js` is a thin IIFE that provides a safe `window.notifier` stub (mirroring `arcade.js`) and leaves the two scripts to self-init.

- [ ] **Step 1: Create `docs/assets/js/tokenomics.js`**

```js
/**
 * tokenomics.js — init page-local para tokenomics.html (Fase 1, P2.3).
 * IIFE namespaced. Sin const/let top-level. Provee un window.notifier seguro
 * para que burn_tracker.js / economy_observability.js no crasheen fuera del
 * contexto de index.html, y deja que ambos scripts se autoinstancien.
 */
(function () {
  window.notifier = window.notifier || {
    show: function (title, msg, type) {
      try { console.log('[' + (type || 'info') + '] ' + title + ': ' + msg); } catch (e) {}
    },
    play: function () {}
  };
  window.__TOKENOMICS_PAGE__ = true;
})();
```

- [ ] **Step 2: Create `docs/tokenomics.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>GoalChain Tokenomics | Burn Tracker & Economy Observability</title>
    <meta name="description" content="GoalChain tokenomics dashboard: live $GCH burn tracker and Infinity Engine economy observability." />
    <meta name="theme-color" content="#06060a" />
    <link rel="stylesheet" href="assets/css/tokens.css?v=1.0" />
    <link rel="stylesheet" href="assets/css/style.css?v=4.4" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/png" href="assets/img/logo_3d_clean.png?v=2.0" />
  </head>
  <body>
    <nav class="gc-site-nav" aria-label="Main">
      <a href="index.html" class="gc-site-nav-brand">⚽ Goal<span style="color:var(--gc-green,#14f195)">Chain</span></a>
      <div class="gc-site-nav-links">
        <a href="index.html">Home</a>
        <a href="arcade.html">Arcade</a>
        <a href="tokenomics.html" aria-current="page">Tokenomics</a>
      </div>
    </nav>

    <main class="gc-page">
      <header class="gc-page-header">
        <h1>🔥 Tokenomics & Burn</h1>
        <p>$GCH burn tracker and Infinity Engine economy observability.</p>
      </header>

      <!-- burn_tracker.js y economy_observability.js pueblan estos contenedores -->
      <section class="gc-arcade-card glass-card">
        <h2>Burn Tracker</h2>
        <div id="burnTrackerContainer"></div>
      </section>
      <section class="gc-arcade-card glass-card">
        <h2>Economy Observability</h2>
        <div id="economyObservabilityContainer"></div>
      </section>
    </main>

    <script src="assets/js/tokenomics.js?v=1.0"></script>
    <script src="assets/js/burn_tracker.js?v=1.1"></script>
    <script src="assets/js/economy_observability.js?v=1.1"></script>
  </body>
</html>
```

> **Note:** If `burn_tracker.js` / `economy_observability.js` query specific element IDs during their `DOMContentLoaded` init, those IDs must be present (audit each script's init before finalizing; replicate the IDs it expects). The generic containers above are a scaffold. If a script early-returns on missing elements, the other still renders and the page degrades gracefully.

- [ ] **Step 3: Add the shared nav + page styling**

Append to `docs/assets/css/style.css` (or `tokens.css`) — minimal classes the new pages reference:

```css
/* --- Shared nav + page scaffolding for arcade.html / tokenomics.html --- */
.gc-site-nav {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 0.75rem 1.5rem;
  background: rgba(10, 10, 20, 0.55);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.gc-site-nav-brand { font-weight: 800; text-decoration: none; color: #e8ecf3; }
.gc-site-nav-links { display: flex; gap: 1rem; flex-wrap: wrap; }
.gc-site-nav-links a {
  color: #8b93a7; text-decoration: none; font-size: 0.9rem;
  padding: 0.25rem 0.75rem; border-radius: 999px;
  border: 1px solid transparent; transition: color 0.2s, border-color 0.2s;
}
.gc-site-nav-links a:hover,
.gc-site-nav-links a[aria-current="page"] {
  color: #14f195; border-color: rgba(20, 241, 149, 0.25);
}
.gc-page { max-width: 1180px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
.gc-page-header { margin-bottom: 2rem; }
.gc-page-header h1 { font-size: 2rem; margin: 0 0 0.5rem; }
.gc-page-header p { color: #8b93a7; margin: 0; }
.gc-arcade-card {
  margin-bottom: 1.5rem; padding: 1.5rem; border-radius: 16px;
}
.gc-arcade-card h2 { margin-top: 0; }
@media (max-width: 767px) {
  .gc-site-nav-links a { padding: 0.4rem 0.6rem; }
}
```

- [ ] **Step 4: Verify tokenomics.html loads without console errors**

Serve `docs/` and open `tokenomics.html`. Confirm: no `ReferenceError`; the burn/economy sections render their content (or degrade gracefully if their target IDs differ — see Note).

- [ ] **Step 5: Commit**

```bash
git add docs/tokenomics.html docs/assets/js/tokenomics.js docs/assets/css/style.css
git commit -m "feat(landing): add tokenomics.html hub + shared nav/page styles"
```

---

## Task P2.4: Nav cross-links + global-namespace audit + final sweep

**Files:**
- Modify: `docs/index.html` — add cross-links to arcade/tokenomics in the nav.
- Verify: no new top-level `const`/`let` in any touched docs JS.

**Context:** The new pages must be reachable from the landing hub (spec §4.4 last bullet). And the global-namespace safety rule (spec §4.5) requires confirming our new files don't introduce top-level `const`/`let`.

- [ ] **Step 1: Cross-link the new pages from index.html nav**

In `docs/index.html`, the desktop nav block starts at `:409` (`<div class="nav-links-desktop">`). Add Arcade + Tokenomics links. After the `:417` `<a href="#social" ...>Social</a>` line, add (inside `nav-links-desktop`):

```html
        <a href="arcade.html" data-i18n="nav_arcade">Arcade</a>
        <a href="tokenomics.html" data-i18n="nav_tokenomics">Tokenomics</a>
```

Optionally mirror in the mobile nav block (`:656-676`) after the `#social` link for consistency.

- [ ] **Step 2: Global-namespace grep audit**

Run: `grep -nE '^\s*(const|let)\s+' docs/assets/js/arcade.js docs/assets/js/tokenomics.js`
Expected: **no matches** (both files use IIFE + `var` only). This confirms the defensive-global rule (spec §4.5).

Run: `grep -nE '^\s*(const|let)\s+' docs/assets/js/penalty_game.js docs/assets/js/pack_opener.js docs/assets/js/burn_tracker.js docs/assets/js/economy_observability.js`
Expected: the original files may have pre-existing top-level `const`/`let` — **out of scope to change** (spec non-goal: index.html keeps its full script set). The audit only confirms *our new files* are clean. Confirm Step 2's first grep (new files) is empty; that's the gate.

- [ ] **Step 3: Final breakpoint + console sweep across all three pages**

Serve `docs/` locally. Open each of `index.html`, `arcade.html`, `tokenomics.html`. Confirm:
- No console errors on any page.
- Nav links work in both directions (index → arcade → tokenomics → index).
- On mobile width (390px): nav wraps, no horizontal scroll, cards stack.

- [ ] **Step 4: Commit**

```bash
git add docs/index.html
git commit -m "feat(landing): cross-link arcade + tokenomics from main nav"
```

- [ ] **Step 5: Final webapp build confirmation (Phase 1 close)**

Run: `cd goalchain_webapp && npm run build`
Expected: green. Phase 1 (Pillars 1 + 2) complete.

---

## Definition of Done (Phase 1)

- [ ] `--gc-shell-cols` token exists; `<1280px` collapse bug is gone at all breakpoints (P1.1–P1.5).
- [ ] No `!important` in the shell grid block; tablet drawer floats as overlay + scrim, content never shifts.
- [ ] `TradingTerminal` grids use `.tt-grid` and wrap/stack at ≤900px / ≤600px.
- [ ] `npm run build` is green; `PlayLayout.tsx` resize listener keeps `collapsed` coherent across resizes.
- [ ] `arcade.html` + `tokenomics.html` exist, load only their own scripts, no console errors.
- [ ] New docs JS files (`arcade.js`, `tokenomics.js`) have no top-level `const`/`let`.
- [ ] `index.html` viewport zoom-lock removed; duplicate `#roadmap` renamed; nav cross-links added.
- [ ] Manual sweep at 1440 / 1280 / 1024 / 768 / 390px on both layers.

---

## Self-Review Notes (planning)

**Spec coverage:** Spec §4.1 (shell) → P1.1–P1.3. §4.2 (panel responsiveness) → P1.4 (TradingTerminal fully; StakingBurnDashboard `.burn-kpi-grid` and NFT clamp from spec §4.2 are **deferred** — see below). §4.3 (standalone pages) → P2.2–P2.3. §4.4 (index hardening) → P2.1 (partial — see below). §4.5 (global safety) → P2.4 Step 2. §6 (verification) → every task + DoD.

**Deliberate deferrals from spec §4.2/§4.4 (called out explicitly, not hidden):**
1. **StakingBurnDashboard `.burn-kpi-grid` refactor + NFT card clamp (spec §4.2)** — deferred. The existing `!important` mobile overrides at `index.css:2210` and the NFT `280×400` at `:3586` work today; refactoring them is polish, not part of the reported collapse bug. Lower risk to ship Pillar 1 without them.
2. **index.html render-loop pausing via IntersectionObserver, penalty-canvas DPR *in index.html*, `defer` auditing (spec §4.4)** — deferred. These are performance optimizations on a live page with cross-coupled scripts; doing them safely requires per-script auditing that would balloon this plan's risk. The accessibility viewport fix + dup-id rename (the safe subset) are kept in P2.1. The penalty DPR work moves to the *new* `arcade.html` (P2.2) instead, where it's isolated.

These deferrals are visible to the user for approval before execution. If the user wants them in-scope, add tasks P1.4b (panel polish) and P2.1b (IO loops) — each is well-bounded once approved.
