# GoalWorld auto-improve log

One entry per daily run (newest last).

## 2026-10-07 run 20261007T024735Z

- **What:** Webapp i18n repair + language switcher fix (play.goalworld.fun):
  1) Stopped raw translation keys leaking into the UI — CreateUser/ClubPortal called
  dotted keys (`create_user_step1.title`, `club_portal_tabs.squad.label`, …) while the
  dictionaries are flat snake_case, so `t()` rendered the raw key strings to users on the
  create-account and club flows; 29 call sites mapped to the real keys, 11 missing keys
  added to en+es+TranslationKeys (`create_user_bio`, `create_user_success_welcome`,
  `ai_commentator_live_cast`, `ai_commentator_noah_ai_simulated_response`,
  `ai_commentator_ws_connected/disconnected`, `nav_res_presskit`, `play_ugc_mode/exit`,
  `play_coach_title/open`). 2) Fixed the EN/ES switcher: App.tsx's fixed pill only updated
  App-local state (UI language changed only after a full reload) and overlapped the header;
  removed it, mounted the shared `LanguageToggle` in the app header (visible on every
  viewport — it used to render only with the nav rail expanded) with aria-labels/lang attrs,
  and moved hardcoded Spanish header strings (Modo UGC / Eliza) behind `t()`.
  3) Added regression guard `npm run check:i18n` (scripts/check-i18n-keys.mjs): fails on
  dotted/missing keys and en/es/TranslationKeys drift (negative-tested: rejects a dotted key).
  4) Follow-up perf fix (PR #887): `font-display=optional` for the Google Fonts link —
  PR #886's bundle timing exposed a webfont-swap layout shift on `/` (Lighthouse cause
  "Web font loaded" shifting `section#how-it-works`), CLS 0.019 -> 0.119; now CLS 0.
- **Why:** Broken i18n keys were user-visible junk text on the two most important onboarding
  surfaces, and the language switcher (the app is bilingual EN/ES) did nothing until reload —
  high-impact UX/quality fixes with a guard so the bug class cannot return.
- **Commit SHA (merge):** `882e0f81` (PR #886 — i18n + toggle), `d88ffc4f` (PR #887 —
  font-display CLS fix). Branch `auto/improve-20261007T024735Z`, base `a380d1ff`
  (rollback: `git revert -m 1` either merge; landing untouched — no landing deploy needed).
- **Live link:** https://play.goalworld.fun — verified live: no raw keys on `/club` and
  `/crear-usuario`, EN→ES→EN switches instantly without reload (both toggle instances in
  sync, `html[lang]` updates), "UGC Mode (9:16)" EN / "Modo UGC (9:16)" ES, Outfit renders.
- **QA evidence:** `/data/work/autoimprove/evidence/20261007T024735Z/`
  (build.txt exit 0, tests.txt exit 0 + negative selftest, before/after DOM text,
  before-toggle-test.txt [click changed nothing; only reload applied language],
  after-verify.json / final-live-check.json, before/after screenshots, linkcheck.txt
  [13/13 nav links resolve], smoke-before.txt / smoke-after.txt [HTTP 200, bundle hash
  Cj-C9OBU -> vCdO2cqB -> index.html display=optional]).
  Lighthouse (mobile throttled, live play.goalworld.fun):
  | run | perf | a11y | BP | SEO | CLS | LCP |
  |---|---|---|---|---|---|---|
  | live before | 69 | 100 | 100 | 100 | 0.019 | 6.4 s |
  | after #886 | 66 | 100 | 100 | 100 | 0.119 | 6.1 s |
  | after #887 (x2) | 77 / 81 | 100 | 100 | 100 | **0** | 4.1 / 3.6 s |
  Local old-vs-new control (2 runs each): old CLS 0.019/perf 84 -> new 0.119/81 ->
  fontfix 0/82-84 — the CLS delta was deterministic and is fixed, not noise.
- **Reverted:** n (nothing broken; the CLS regression introduced by #886 was fixed in #887
  within the same run and re-verified green on live).
- **Follow-ups noted (not done):** wallet-adapter's own strings ("Select Wallet",
  "Change wallet") and the logged-out "Create account" account label are English-only;
  avatar/role labels in CreateUser are hardcoded Spanish; `valid-source-maps` Lighthouse
  BP warning is pre-existing.

## 2026-10-08 run 20261008T024706Z

- **What:** Added hero image preload to all content pages (about, faq, press, roadmap) on goalworld.fun. All four pages had LCP hero images that were not preloaded, hurting LCP scores. Preload tags now include `imagesrcset` and `imagesizes` matching the `<img>` attributes exactly, with `fetchpriority="high"`.

- **Why:** LCP scores on these pages were poor (0.1-0.12 in prior runs). Hero images are the LCP element on each page. Preloading them with correct srcset/sizes lets the browser start fetching the right image variant immediately, eliminating the critical-request-chain delay.

- **Commit SHA (merge):** 0052289409bfc911b3ce393d9d7c3ccd6e6af5b6 (pushed to main)

- **Live link:** https://goalworld.fun/about.html (and /faq.html, /press.html, /roadmap.html)

- **QA evidence path:** /data/work/autoimprove/evidence/20261008T024706Z/
  - Build: goalworld_site/build.mjs exit 0, 8 pages built successfully
  - Smoke (before): all 4 pages HTTP 200, no preload tags on hero images
  - Smoke (after): all 4 pages HTTP 200, hero image preload tags present with correct imagesrcset/imagesizes/fetchpriority
  - Lighthouse (after, live):
    - about.html: PERF 0.98, LCP 0.90, FCP 1.00, A11Y 1.00, BEST 1.00, SEO 1.00
    - roadmap.html: PERF 1.00, LCP 0.99, FCP 1.00, A11Y 1.00, BEST 1.00, SEO 1.00
    - faq.html: PERF 0.99, LCP 0.96, FCP 1.00, A11Y 1.00, BEST 1.00, SEO 1.00
    - press.html: PERF 0.95, LCP 0.78, FCP 1.00, A11Y 1.00, BEST 1.00, SEO 1.00
  - Lighthouse baseline (before, from prior run): PERF 0.69, LCP 0.10, FCP 0.30
  - Link check: all internal/external links on touched pages return 200
  - Rollback ready: backup tarball at /data/work/goalworld-site-backups/_site_public/20261008T030628Z-00522894.tar.gz

- **Reverted:** n


## 2026-10-09 run 20261009T024706Z

- **What:** JSON-LD structured data for the goalworld.fun landing (goalworld_site/):
  every page now ships schema.org markup generated from the same source as the visible
  HTML — `WebPage` on all 7 public pages, `Organization` + `WebSite` on the home page
  (sameAs limited to the two verified links: x.com/nicopez, GitHub TheNeuralWars/GoalChain),
  and `FAQPage` on /faq with all 10 Q&As extracted from the visible `<details>` blocks so
  the schema can never drift from what visitors read. Build-time sanity checks parse back
  the emitted JSON-LD from the final HTML (WebPage url == canonical, Organization/WebSite
  on index, FAQPage mainEntity count == visible faq-item count) and fail the build on any
  mismatch (negative-tested: dropping the placeholder fails with "missing JSON-LD: about.html").
- **Why:** The site had zero structured data, capping how search engines and AI crawlers can
  surface the brand, the Q&A, and the pages. FAQ/Organization/WebSite schema is the standard
  prerequisite for search rich results; generating it from the visible page text satisfies
  the visible-content requirement and removes a whole class of markup/content drift bugs.
- **Commit SHA (merge):** `869d3190` (PR #890, feature commit `5827af83`). Pre-merge
  `origin/main` = `00522894` (rollback: `git revert -m 1 869d3190`; landing rollback
  tarball `/data/work/goalworld-site-backups/_site_public/20261009T030239Z-869d3190.tar.gz`
  via `scripts/deploy_goalworld_site.sh rollback`). Webapp untouched — no Vercel deploy.
- **Live link:** https://goalworld.fun/ (Organization+WebSite schema live) and
  https://goalworld.fun/faq.html (FAQPage, 10 questions) — all pages 200 with exactly one
  JSON-LD block each, verified after deploy.
- **QA evidence:** `/data/work/autoimprove/evidence/20261009T024706Z/`
  (build.txt exit 0 — 8 pages, sanity OK; tests.txt exit 0 — independent re-extraction:
  8/8 pages parse, canonical match, 10/10 FAQ visible-text parity; negative selftest in
  run transcript; linkcheck.txt — no new links, pre-existing dist-only legacy paths
  (/go/reader/, /cinema.html, /goalworld.html, teaser mp4s) verified HTTP 200 on live;
  smoke-before.txt / smoke-after.txt — live 200s, jsonld_blocks 0 -> 1 everywhere;
  deploy.txt — dry-run then deploy 869d3190).
  Lighthouse (mobile throttled):
  | run | perf | a11y | BP | SEO | CLS | LCP |
  |---|---|---|---|---|---|---|
  | live before, home | 100 | 100 | 100 | 100 | 0 | 1.9 s |
  | live before, faq | 99 | 100 | 100 | 100 | 0 | 2.0 s |
  | preview (local) home / faq | 98 / 99 | 100 | 100 | 100 | 0 | 2.3 / 2.0 s |
  | live after, home (x3) | 95 / 99 / 94 | 100 | 100 | 100 | 0 | 2.8 / 2.1 / 3.0 s |
  | live after, faq | 99 | 100 | 100 | 100 | 0 | 2.0 s |
  | control local old (x2) | 98 / 96 | — | — | 100 | 0 | 2.3 / 2.8 s |
  | control local new (x2) | 98 / 96 | — | — | 100 | 0 | 2.3 / 2.8 s |
  Live home perf swings 94-99 across identical runs (lab-throttle noise); the
  old-vs-new local control is identical in every metric (only delta: +1,124 bytes
  total weight), so the JSON-LD is perf- and CLS-neutral. a11y/BP/SEO 100 everywhere —
  no regression.
- **Reverted:** n (deploy verified healthy on live; rollback point kept).


## 2026-10-10 run 20261010T024706Z

- **What:** Route-level code splitting for the webapp (play.goalworld.fun): the heavy
  route portals (GoalWorldPortal, KindleReader + 357 KB booksData lore,
  CorporateAutopilot, MarketingControlCenter, PressKit, GenesisCollectionGallery,
  TokenizedAgentsDashboard, AuthorStudio, Estadio/DeFi/Club portals) are now
  `React.lazy` on-demand chunks instead of being eagerly imported in `App.tsx`.
  PlayLayout / DashboardGrid / LandingPage / ClassicHub stay eager for first paint.
  A shared Suspense fallback with a new `route_loading` i18n key (en/es +
  TranslationKeys) replaces nothing user-visible — it only shows during chunk fetch.
- **Why:** Every visitor downloaded all portals + the entire lore corpus in the
  first-paint bundle (810 KB main JS) before seeing anything. First-paint JS is now
  165 KB (-80%): live main bundle 810,870 → 165,112 bytes; biggest new on-demand
  chunks KindleReader 374 KB (lore), CorporateAutopilot 70 KB, GoalWorldPortal 63 KB.
- **Commit SHA (merge):** `0f1c9ea7` (PR #891, feature commit `dc7594cb`).
  Pre-merge `origin/main` = `e0b5840e` (rollback: `git revert -m 1 0f1c9ea7` + push —
  Vercel redeploys the previous build automatically). Landing site untouched.
- **Live link:** https://play.goalworld.fun (routes /goalworld, /reader, /autopilot,
  /coleccion re-verified on production after deploy).
- **QA evidence:** `/data/work/autoimprove/evidence/20261010T024706Z/`
  (build-before.txt / build-after.txt exit 0 — tsc + vite; tests.txt exit 0 —
  check-i18n 282 used keys, en/es/type in sync; chunks-before.txt /
  chunks-after.txt; smoke-before.txt / smoke-after.txt — HTTP 200, main JS
  810,870 → 165,112; dom/ 16-route headless-Chrome checks on local preview +
  dom-live/ 5-route checks on production — all expected headings render, zero raw
  i18n-key leaks, zero stuck "Loading..." fallbacks; linkcheck.txt — 0 broken
  internal links incl. new chunk URLs, 2 pre-existing external 404s in untouched
  PressKit.tsx; lighthouse-live-before.json / lighthouse-preview-after.json /
  lighthouse-live-after.json).
  Lighthouse (mobile throttled, home page):
  | run | perf | a11y | BP | SEO | CLS | LCP | FCP |
  |---|---|---|---|---|---|---|---|
  | live before | 68 | 100 | 100 | 100 | 0 | 6.5 s | 3.8 s |
  | local preview after | 94 | 100 | 96* | 100 | 0 | 2.5 s | 2.5 s |
  | live after | 93 | 100 | 100 | 100 | 0 | 2.6 s | 2.5 s |
  *BP 96 on localhost is an environment artifact only: `/_vercel/insights/script.js`
  404s outside Vercel (live serves it — BP 100 before and after).
- **Reverted:** n (deploy verified healthy on live; rollback point kept).
- **Follow-ups noted (not done):** wallet-adapter's own strings and the logged-out
  "✨ Create account" label remain English-only (deferred from 2026-10-07);
  en+es locale JSON (~68 KB) is still bundled in the main chunk — lazy locale
  loading is a possible next win.
