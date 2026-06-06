# OA Proposal — Issue #350

## Title
[OPENCODE] Webapp: Premium visual overhaul - generate assets, backgrounds, animations, loading states

## Source
GitHub issue #350

## Objective
## Objective
Premium visual overhaul with generated assets:

## Scope
### 1. Generate Premium Assets (Image Generator)
Create and place in `public/assets/`:
- `hero-bg.webp` - Dark stadium atmosphere, neon green/purple glow, subtle grid (1920x1080)
- `hero-bg-mobile.webp` - Vertical crop (1080x1920)
- `dashboard-pattern.webp` - Subtle hex grid with gradient overlay (tileable)
- `glass-texture.webp` - Frosted glass noise texture (tileable)
- `neon-gradient-1.webp` - Green → Purple radial (for cards)
- `neon-gradient-2.webp` - Purple → Red radial (for warnings)
- `loading-spinner.webp` - Custom animated SVG spinner
- `empty-state-\*.webp` - 5 illustrations: no wallet, no players, no bets, no vaults, no activity
- `player-silhouette.webp` - Fallback for player images
- `club-badge-placeholder.webp`
- `stadium-silhouette.webp`

### 2. Advanced CSS Effects
- `src/styles/effects.css` -
  - `.holo-card` - Animated border gradient (conic-gradient rotation)
  - `.shimmer-text` - Text with moving gradient fill
  - `.pulse-glow` - Box-shadow pulse animation
  - `.grid-background` - Animated perspective grid
  - `.noise-overlay` - Subtle film grain
  - `.scanlines` - Retro CRT scanlines (optional)
  - `.particle-field` - Canvas-based floating particles (WebGL fallback)

### 3. Loading & Empty States
- `src/ui/loading/` - Skeleton components matching real content
- `src/ui/empty/` - Illustrated empty states with CTAs
- `src/ui/error/` - Error boundaries with recovery actions

### 4. Micro-animations
- Framer Motion variants: `fadeIn`, `slideUp`, `scaleIn`, `staggerChildren`
- Page transitions: `AnimatePresence` with exit animations
- Hover/tap feedback on all interactive elements

### 5. Theme Polish
- Custom scrollbar (thin, neon thumb)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #350
