# GoalWorld Static Site — Component Library (`COMPONENTS.md`)

`goalworld_site/build.mjs` provides a zero-dependency partial & macro component system.
All visual styling is driven by `design/tokens.json` via `goalworld_site/src/assets/css/site.css`.

---

## 1. Layout Partials (`goalworld_site/src/partials/`)

Assembled into `goalworld_site/src/layout.html` during `node goalworld_site/build.mjs`:

| Partial | File | Purpose |
| :--- | :--- | :--- |
| **Header & Navigation** | `src/partials/_header.html` | Sticky glassmorphic header with brand mark, mobile menu toggle, main navigation (`Book`, `Cinema`, `Studio`, `Live`, `Roadmap`), language switcher slot (`{{LANG_SWITCHER}}`), and primary `Read free →` button. |
| **Mobile Sticky Action Bar** | `src/partials/_sticky_cta.html` | Accessible `<aside class="sticky-cta" aria-label="Quick actions" data-sticky-cta>` shown on mobile viewports (`≤720px`) with auto-hide when reading `#sample`. |
| **Studio Footer** | `src/partials/_footer.html` | 3-column studio footer (`Brand + Language Switcher`, `Explore`, `Community & Legal`) with generous mobile tap targets (`min-height: 36px`). |

---

## 2. Language Switcher Slot (`renderLangSwitcher`)

Automatically rendered by `build.mjs` into `{{LANG_SWITCHER}}` (header) and `{{LANG_SWITCHER_FOOTER}}` (footer), preserving the current page `slug` across `EN`, `ES`, and `IT` editions.

```html
<!-- Output in header/footer -->
<div class="lang-switch lang-switch--header" role="group" aria-label="Language" data-lang-switcher>
  <a class="lang-pill active" href="/book.html" lang="en" aria-current="true" title="English">EN</a>
  <span class="lang-pill lang-pill--soon" lang="es" aria-disabled="true" title="Español (coming soon)">ES</span>
  <span class="lang-pill lang-pill--soon" lang="it" aria-disabled="true" title="Italiano (coming soon)">IT</span>
</div>
```

*(When `ACTIVE_LOCALES` in `build.mjs` includes `"es"` and `"it"`, `ES` and `IT` render as live `<a class="lang-pill" href="/es/book.html" hreflang="es">` links.)*

---

## 3. Declarative Page Macros (`<!-- @component <type> <jsonProps> -->`)

Any page in `goalworld_site/src/pages/*.html` can invoke components using `<!-- @component <type> { ... } -->`. `build.mjs` validates the JSON props, expands the macro before JSON-LD extraction, and fails the build if any unexpanded `@component` tag remains.

### 3.1 `hero` — Studio & Page Hero

Renders a full-bleed or clean editorial hero with optional responsive background artwork, mono eyebrow, fluid `<h1>`, lead copy, CTA button set, and notification pill.

```html
<!-- @component hero {
  "variant": "studio",
  "bgImg": "/assets/img/hero-neo-citania.webp",
  "bgSrcset": "/assets/img/hero-neo-citania-400.webp 400w, /assets/img/hero-neo-citania-800.webp 800w, /assets/img/hero-neo-citania.webp 1600w",
  "bgSizes": "100vw",
  "eyebrow": "GoalWorld Studio &middot; Canon. Code. Cinema.",
  "title": "One universe.<br /><span class=\"serif grad-text\">Three mediums.</span>",
  "lead": "An independent studio building <strong>The Neural Wars</strong> &mdash; a hard sci-fi saga you can read, a football game you can play, and an AI film you can watch take shape.",
  "ctas": [
    { "label": "Read Fractured Code &mdash; free", "href": "/book.html#sample", "variant": "primary" },
    { "label": "Play Matchday", "href": "https://play.goalworld.fun/", "variant": "secondary", "badge": "DEVNET" },
    { "label": "&#9654; Watch the trailer", "href": "/cinema.html", "variant": "link" }
  ],
  "notify": {
    "prefix": "Coming soon:",
    "text": "Book 2, <em>Earth&rsquo;s New Song</em> (in production).",
    "href": "https://x.com/nicopez",
    "linkLabel": "Follow @nicopez on X for updates &rarr;",
    "secondaryHref": "#book2",
    "secondaryLabel": "Book 2 details"
  }
} -->
```

### 3.2 `section-header` — Semantic Section Heading (`<h2>`)

Ensures sequential heading hierarchy (`h1 -> h2 -> h3`) on every page. Supports `srOnly: true` for visually minimal bands that still require an accessible `<h2>` landmark.

```html
<!-- @component section-header {
  "kicker": "Cinema",
  "title": "Watch the saga take shape",
  "lead": "The official cinematic trailer, plus film-draft clips adapted from <em>Fractured Code</em>.",
  "align": "left"
} -->
```

### 3.3 `card` — Editorial / Bento / Feature Card

Renders a linked (`<a>`) or static (`<div>` / `<figure>`) card with optional image, mono pillar label, status badge, `<h3>`, body copy, bullet list, and `.go` action label.

```html
<!-- @component card {
  "href": "/book.html",
  "pillar": true,
  "span": 2,
  "img": {
    "src": "/assets/img/keyframe-severing.webp",
    "srcset": "/assets/img/keyframe-severing-640.webp 640w, /assets/img/keyframe-severing.webp 1200w",
    "sizes": "(max-width: 720px) 92vw, 46rem",
    "alt": "A mind breaking free of the Link — keyframe from The Neural Wars",
    "width": 1200,
    "height": 750
  },
  "label": "01 &middot; Canon",
  "title": "The Neural Wars",
  "body": "Hard sci-fi about consciousness and control. Book 1, <em>Fractured Code</em>, is free to read in your browser today.",
  "cta": "Start reading &rarr;"
} -->
```

### 3.4 `media-card` — Video & Keyframe Card with Mandatory AI Tag

Renders a `<figure class="video-card">` for either HTML5 `<video>` (supporting multiple `<source>` fallbacks) or `<img>`, enforcing a visible `.video-tag` disclosure (`AI-generated · Film draft`).

```html
<!-- @component media-card {
  "kind": "video",
  "poster": "/assets/img/poster-kora.webp",
  "ariaLabel": "Clip: Kora Vega and the harmonic rings",
  "sources": [
    "https://goalworld.fun/assets/img/neuralwars/05_Clips/Clip_08_Kora_Vega_Harmonic_Rings.mp4",
    "https://goalworld.fun/assets/img/neuralwars/05_Clips/Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4"
  ],
  "aiTag": "Film draft &middot; Clip 08 &middot; AI-generated",
  "title": "Kora Vega &mdash; Harmonic Rings"
} -->
```

### 3.5 `cta-set` — Strict Hierarchy CTA Button Row

Renders a `.btn-row` with primary (`btn-primary`), secondary (`btn-secondary`), ghost (`btn-ghost`), or text link (`btn-link`) buttons.

```html
<!-- @component cta-set {
  "align": "center",
  "items": [
    { "label": "Follow @nicopez", "href": "https://x.com/nicopez", "variant": "primary" },
    { "label": "GitHub", "href": "https://github.com/TheNeuralWars/GoalChain", "variant": "secondary" }
  ]
} -->
```

### 3.6 `status-pill` — Honest State Badge (`live` / `production` / `provisional` / `mock` / `devnet`)

Renders a high-contrast status indicator with animated or static dot.

```html
<!-- @component status-pill {
  "state": "devnet",
  "label": "Solana Devnet &middot; Free Sandbox"
} -->
```

### 3.7 `timeline` — Step Pipeline or Milestone Grid

Renders either a numbered `.steps` sequence (`numbered: true`) or a multi-column milestone grid (`numbered: false`).

```html
<!-- @component timeline {
  "columns": 3,
  "numbered": true,
  "items": [
    { "title": "Lock the canon", "body": "Character lock sheets, a colour bible and a list of every place." },
    { "title": "Book to shots", "body": "Each scene is broken into shots traced back to a line of the novel." },
    { "title": "Generate", "body": "An approved still first, then image-to-video." }
  ]
} -->
```

### 3.8 `faq-accordion` — Accessible `<details>` Accordion + Build-Time `FAQPage` JSON-LD

Renders `<details class="faq-item">` blocks with optional instant search + expand/collapse controls. On `/faq.html`, `build.mjs` automatically parses the rendered `<details class="faq-item">` elements to emit schema.org `FAQPage` JSON-LD and verifies 1:1 parity.

```html
<!-- @component faq-accordion {
  "searchable": true,
  "items": [
    { "q": "What is GoalWorld?", "a": "GoalWorld is an independent story and interactive studio...", "open": true }
  ]
} -->
```
