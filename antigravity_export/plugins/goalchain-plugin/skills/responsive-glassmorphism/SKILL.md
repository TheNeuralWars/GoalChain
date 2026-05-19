---
name: responsive-glassmorphism
description: |
  Responsive UI design using CSS Glassmorphism and hardware-accelerated layouts. Trigger when adjusting styles, building responsive layouts, tweaking animations, or ensuring compatibility for PC, Tablet, and Phone.
  
  Trigger on:
  - PC, tablet, mobile viewports, media queries, flexbox, grid, glassmorphism, background-blur, neon flashes, GPU acceleration.
---

# Responsive Glassmorphic UI Optimizer Skill

Deliver a flawless, high-fidelity experience across PC, Tablet, and Mobile, maintaining the premium dark-mode, neon glow aesthetic without sacrificing performance.

## 📏 Breakpoint Hierarchy
- **Desktop (PC/Mac)**: Width >= 1200px. Full 3D columns, multi-tab sidebars, hover animations active.
- **Tablet (iPad/Landscape Mobile)**: 768px <= Width < 1200px. Reduce card sizes, stack sidebars under main views, disable heavy filters if device FPS drops.
- **Mobile (iPhone/Android)**: Width < 768px. Collapse grids into a single-column layout. Touch targets >= 44px, click delays avoided, swipe gestures active.

## ⚡ Rendering Performance & CWV
- Avoid layout shifts: specify fixed dimensions or aspect ratios for the 3D gallery and pack cards.
- Offload animations: use CSS transforms and opacity instead of animating `box-shadow` or `width/height` directly.
- Neon glow effects must use `will-change: transform, filter` only when active to trigger GPU rasterization.

## 🎨 CSS Glassmorphism Rules
Ensure backing cards look premium using HSL colors, transparency, and background blur:
```css
.premium-glass-card {
    background: hsla(240, 10%, 5%, 0.65);
    backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid hsla(0, 0%, 100%, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

---
*Status: Active. Goal: Total visual perfection across all screens.* 📱💻🎨
