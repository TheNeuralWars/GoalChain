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

---

# GoalWorld Phase 3 — Playwright Multilanguage (EN / ES / IT) Suite

Automated verification across all 39 localized `goalworld_site` pages (`13 routes × 3 locales`) and `goalchain_webapp` (`play.goalworld.fun`) in English, Spanish, and Italian.

## Usage

```bash
node tests/visual/i18n-suite.mjs
```

## Assertions

1. **`goalworld_site` (39 pages)**:
   - `<html lang="en|es|it">` matches active locale
   - `hreflang="en|es|it|x-default"` alternates present on every page
   - `og:locale` (`en_US`, `es_AR`, `it_IT`) and `og:locale:alternate` tags match
   - JSON-LD (`WebSite`, `WebPage`, `FAQPage`) `inLanguage` matches active locale
   - Legal draft-translation notice (`[data-legal-draft-notice]`) visible on `/es/privacy.html`, `/es/terms.html`, `/it/privacy.html`, and `/it/terms.html`
   - Language switcher (`[data-lang-switcher]`) round-trips `EN -> ES -> IT -> EN`, preserving the current page slug and persisting `gw_lang` + `gc_lang` in `localStorage`
   - Zero raw translation keys (`{{i18n:...}}` or dotted keys) visible in rendered text
2. **`goalchain_webapp` (`play.goalworld.fun`)**:
   - `LanguageToggle` round-trips `EN -> ES -> IT -> EN`, updating `document.documentElement.lang`, `localStorage` (`gw_lang` + `gc_lang`), UI headings, and localized marketing links (`https://goalworld.fun/{es,it}/...`)
   - Zero raw translation keys visible in rendered text
3. **Screenshots**: saves `<= 400 KB` JPEG screenshots of ES and IT `home` and `book` (`1440x900` + `390x844`) plus `play.goalworld.fun` ES and IT `home` and `dashboard` in `_work/site-overhaul-20261109/evidence/phase3/screenshots/`.
