# GoalWorld Phase 2 — Playwright Responsive & Visual Suite

Automated responsive and visual verification across all 13 `goalworld_site` routes and 17 `goalchain_webapp` routes across 6 canonical viewports (`360x740`, `390x844`, `820x1180`, `1024x1366`, `1440x900`, `1920x1080`) using system Chrome (`/usr/bin/google-chrome`).

## Usage

```bash
# Run full 180-check suite + save screenshots to _work/site-overhaul-20261109/evidence/phase2/
node tests/visual/responsive-suite.mjs

# Fast diagnostic mode (skip saving screenshots)
node tests/visual/responsive-suite.mjs --no-shots

# Filter by surface, route slug, or viewport
node tests/visual/responsive-suite.mjs --no-shots --surface=goalworld_site
node tests/visual/responsive-suite.mjs --no-shots --surface=goalchain_webapp
node tests/visual/responsive-suite.mjs --no-shots --slug=play-estadio --viewport=360x740
```

## Assertions (per route × viewport)

1. **Zero horizontal overflow**: `document.documentElement.scrollWidth <= window.innerWidth + 1`
2. **No visible element offscreen horizontally**: primary layout sections/cards/controls stay within `[0, innerWidth]`
3. **Touch targets >= 44px**: on touch viewports (`360x740`, `390x844`, `820x1180`, `1024x1366`), visible interactive controls have at least one dimension `>= 44px` and the other `>= 36px`
4. **Navigation usability**: mobile nav toggle (`#nav-toggle` / `[data-mobile-nav-toggle]`) and tablet rail toggle (`.gc-rail-toggle`) open and close via click and `Escape`
5. **Explicit image dimensions (Zero CLS)**: all visible `<img>` elements have positive `width` and `height` HTML attributes and `naturalWidth > 0`
6. **Mobile body typography >= 14px**: on phone viewports (`360x740`, `390x844`), body copy and form controls render at `>= 14px`
7. **Sticky CTA / bottom bar clearance**: when scrolled to the bottom of the page, fixed bottom bars do not obscure footer links
