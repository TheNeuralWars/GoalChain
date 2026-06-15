# Issue #783: AI-EXPONENTIAL: Premium Glassmorphic Staking & Infinity Burn Dashboard

## Objective
Revamp the React staking UI with hardware-accelerated SVG flame animations, glassmorphic cards, and interactive yield calculators. Implement real-time stats mapping from the Express API economy endpoints.

---

## Current State Analysis

### Existing Implementation (`goalchain_webapp/src/ui/StakingBurnDashboard.tsx`)
- Basic glassmorphism via `.glass-card` CSS class (backdrop-filter: blur(16px))
- Static SVG flame animation with SMIL `<animate>` elements
- Three vault strategies with fixed APYs (Sentinel 7.5%, Arbitrageur 9.5%, Orchestrator 14.5%)
- Yield calculator with stake input, token selector (GCH/SOL), presets
- Protocol health checks display
- Fetches from `/api/economy/metrics` and `/api/economy/health` every 30s

### API Endpoints (`goalchain_api/src/index.ts`)
- `GET /api/economy/metrics` → EconomyMetricsResponse (KPIs, 24h/7d flows, breakdowns)
- `GET /api/economy/health` → EconomyHealthResponse (status, checks, thresholds)
- `GET /api/economy/config` → EconomyConfigResponse

### Design System (index.css)
- `--primary-neon: #14f195`, `--secondary-neon: #9945ff`, `--accent-red: #ff4b4b`
- `.glass-card` with backdrop-filter blur(16px) saturate(180%)
- Premium slider, buttons, scrollbars, rarity card styles

---

## Design Plan (per frontend-design skill)

### Color Palette (enhanced)
| Token | Hex | Usage |
|-------|-----|-------|
| `--flame-core` | `#ff3300` | Flame center, highest intensity |
| `--flame-heart` | `#ff6600` | Flame mid-tones |
| `--flame-gold` | `#ffcc00` | Flame tips, ember particles |
| `--ember-glow` | `#ff440040` | Radial ember glow |
| `--glass-bg` | `rgba(10,10,20,0.55)` | Glass card background |
| `--glass-border` | `rgba(255,255,255,0.06)` | Glass card border |
| `--glass-border-active` | `rgba(20,241,149,0.3)` | Hover/focus border |
| `--primary-neon` | `#14f195` | Success, yields, positive KPIs |
| `--secondary-neon` | `#9945ff` | Vault selectors, accents |
| `--accent-red` | `#ff4b4b` | Burns, warnings, negative KPIs |

### Typography
- **Display**: `Outfit` (already loaded) — bold, geometric, used for hero numbers
- **Body**: `Plus Jakarta Sans` (already loaded) — UI text, descriptions
- **Data/Mono**: `JetBrains Mono` / `monospace` — numbers, addresses, ratios
- **Scale**: clamp-based fluid sizing, 0.75rem base for micro-copy

### Layout Concept
```
┌─────────────────────────────────────────────────────────────────┐
│  HERO: Infinity Burn Visualizer (full-width, 320px min-height) │
│  [Animated SVG Flame]  +  [Real-time KPI Overlay Grid 4-col]   │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│ 24h Burn     │ 24h Emit     │ Net Emission │ Burn/Emit Ratio  │
│  (flame red) │ (neon green) │ (dynamic)    │ (gradient bar)   │
└──────────────┴──────────────┴──────────────┴──────────────────┘
├──────────────────────────┬─────────────────────────────────────┤
│ BREAKDOWN CARDS (4)      │ VAULT STRATEGY SELECTOR (3 cards)   │
│ Potion / Fee / Vault     │ Sentinel / Arbitrageur / Orchestr.  │
│ Treasury  (glass,       │ Glass cards, hover glow,             │
│  border-left color)      │ animated APY badge                   │
├──────────────────────────┴─────────────────────────────────────┤
│ YIELD CALCULATOR (glass card, premium inputs)                 │
│ [Token: GCH/SOL] [Amount Input] [Preset Chips]                 │
│ ┌─────────┬─────────┬─────────┬─────────┬────────────────────┐│
│ │ Daily   │ Weekly  │ Monthly │ Yearly  │ Burn Contribution  ││
│ │ (green) │ (green) │ (amber) │ (red)   │ (flame, animated)  ││
│ └─────────┴─────────┴─────────┴─────────┴────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│ PROTOCOL HEALTH CHECKS (expandable glass cards)                │
│ Emit/Burn Ratio  |  On-Chain Sink  |  Config Drift  |  Vault   │
└─────────────────────────────────────────────────────────────────┘
```

### Signature Element: Hardware-Accelerated Flame System
- **WebGL/Canvas fallback**: For devices without SMIL support
- **CSS `will-change` + `transform3d`**: Force GPU compositing on flame layers
- **Particle system**: Ember particles with `requestAnimationFrame`, physics-based rise/fade
- **Intensity binding**: Flame height/scale driven by `emit_burn_ratio_7d` (0-1 mapped to 0.5-2.0x scale)
- **Reduced motion**: Respect `prefers-reduced-motion` — static flame, no particles

---

## Implementation Steps

### 1. Enhanced CSS Tokens & Glass System (`index.css`)
- Add flame-specific CSS variables
- Enhanced `.glass-card` with layered borders, subtle inner glow
- New `.glass-card-premium` variant with stronger blur, border gradient
- Hardware acceleration helpers: `.gpu-accelerated`, `.flame-layer`
- Reduced motion media query overrides

### 2. Flame Animation Component (`src/components/InfinityFlame.tsx`)
- Self-contained SVG + Canvas hybrid
- `flameIntensity` prop (0-1) drives scale, particle count, color temperature
- `useFlameAnimation` hook for RAF loop with cleanup
- Memoized particle pool (max 60 particles)
- Canvas fallback when SMIL not supported
- Exports `InfinityFlame` and `useFlameIntensity` hook

### 3. Vault Strategy Card Component (`src/components/VaultStrategyCard.tsx`)
- Glass card with animated border gradient on hover
- APY badge with pulse glow
- Risk indicator (Low/Med/High) with color coding
- Click/keyboard accessible selection
- `isSelected` prop drives transform + glow

### 4. Yield Calculator Component (`src/components/YieldCalculator.tsx`)
- Premium number input with stepper buttons
- Token switcher (GCH/SOL) with live price fetch (optional)
- Preset chips (100/500/1K/5K/10K)
- Results grid: 4 timeframes + burn contribution
- Animated number transitions (count-up effect)
- Memoized calculations, debounced input

### 5. Health Check Card Component (`src/components/HealthCheckCard.tsx`)
- Expandable glass card per check
- Pass/fail with animated status dot
- Threshold visualization (min/max bars)
- Config drift reasons as inline list

### 6. Revamp `StakingBurnDashboard.tsx`
- Compose new components
- TanStack Query (or keep fetch + useEffect) for data fetching with caching
- Real-time correlation: flame intensity ↔ emit_burn_ratio_7d
- Error boundary + loading skeletons (glass-card placeholders)
- Responsive: stack on mobile, grid on desktop
- Accessibility: ARIA live regions for KPI updates, keyboard navigation

### 7. Verification
- `cd goalchain_webapp && npm run build` — TypeScript + Vite build
- `cd goalchain_webapp && npx tsc --noEmit` — Type check
- Visual inspection: flame animates, glass cards render, calculator works
- Reduced motion test: flame static, no particles
- Mobile viewport: stacked layout, touch targets ≥44px

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| SMIL deprecation in Chrome | Canvas fallback implemented |
| GPU memory on low-end devices | Particle cap (60), `will-change` cleanup on unmount |
| API latency blocking UI | keep existing 30s interval + abort controller; add `stale-while-revalidate` pattern |
| Type drift between API/client | Shared types in `economyClient.ts` already aligned |

---

## Files to Modify/Create

### New Files
1. `goalchain_webapp/src/components/InfinityFlame.tsx` — Flame animation system
2. `goalchain_webapp/src/components/VaultStrategyCard.tsx` — Strategy selector card
3. `goalchain_webapp/src/components/YieldCalculator.tsx` — Calculator component
4. `goalchain_webapp/src/components/HealthCheckCard.tsx` — Health check card
5. `goalchain_webapp/src/hooks/useFlameAnimation.ts` — RAF animation hook
6. `goalchain_webapp/src/hooks/useEconomyData.ts` — Data fetching hook (optional)

### Modified Files
1. `goalchain_webapp/src/index.css` — Enhanced tokens, glass variants, flame styles
2. `goalchain_webapp/src/ui/StakingBurnDashboard.tsx` — Complete rewrite using new components

---

## Acceptance Criteria
- [ ] Flame animation runs at 60fps on desktop, 30fps on mobile
- [ ] Glass cards show depth: blur, border gradient, inner shadow
- [ ] Yield calculator updates in <100ms on input change
- [ ] Real API data flows through all KPIs, breakdowns, health checks
- [ ] `prefers-reduced-motion` disables particles, freezes flame at intensity
- [ ] Build passes: `npm run build` and `npx tsc --noEmit`
- [ ] No console errors/warnings in devtools

---

## Residual Risks (Post-Implementation)
- Canvas fallback untested on Safari <16 (SMIL support varies)
- Particle physics may feel "floaty" at low intensity — tune spring constants
- SOL price hardcoded — consider Jupiter price feed integration later
- 30s polling may show stale data during high volatility — WebSocket upgrade path documented