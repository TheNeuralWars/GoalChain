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

## 2026-10-11 run 20261011T024735Z

- **What:** i18n completion on the account-creation path (play.goalworld.fun):
  1) CreateUser.tsx shipped hardcoded labels — 8 Spanish avatar names (Águila, León,
  Lobo, Dragón, Fénix, Tiburón, Toro, Halcón) and 3 Spanish role descriptions
  ("Gestiona equipos y hace apuestas estratégicas" …) rendered to EN users, with the
  role names hardcoded English for ES users. All are now `t()` lookups backed by 15 new
  keys in en.json + es.json + TranslationKeys (`create_user_avatar_*`, `create_user_role_*`,
  `create_user_role_*_desc`, `nav_create_account`). The stored user-data `role` field keeps
  the canonical English name (unchanged persisted data); `labelKey`/`descKey` drive the UI,
  and the bio `{role}` param is now localized. 2) PlayNav's logged-out account label
  ("✨ Create account") was English-only — now `nav_create_account` (EN "Create account" /
  ES "Crear cuenta"). 3) check-i18n-keys.mjs now also validates `labelKey`/`descKey`
  data-record literals so dynamically-looked-up labels can't drift (negative-tested:
  a typo'd labelKey fails the check).
- **Why:** Wrong-language text on the two most important onboarding surfaces (the
  create-account flow and the persistent nav) — the exact follow-up deferred in the
  2026-10-07 and 2026-10-10 runs. EN users saw Spanish avatar/role text and ES users saw
  an English CTA.
- **Commit SHA (merge):** `3eb5806a` (PR #892; feature `02df122c`, docs `b49c9108`).
  Pre-merge `origin/main` = `8a8721f5` (rollback:
  `git revert -m 1 3eb5806a` + push — Vercel redeploys the previous build automatically).
  Landing site untouched — no landing deploy needed.
- **Live link:** https://play.goalworld.fun — nav account label EN "✨ Create account" /
  ES "✨ Crear cuenta"; /crear-usuario avatar + role labels localized EN/ES.
- **QA evidence:** `/data/work/autoimprove/evidence/20261011T024735Z/`
  (build.txt exit 0 — tsc + vite, main chunk 165,592 B vs 165,112 B live, +15 dict
  strings; tests.txt exit 0 — check:i18n 297 used keys, 609 dictionary keys, en/es/type
  in sync; tests-negative-selftest.txt — typo'd labelKey → exit 1 as expected, then OK;
  dom/ + dom-assertions.txt — headless-Chrome DOM checks of the real CreateUser component
  via a throwaway wallet-stubbed Vite harness: 4/4 PASS (EN/ES × avatar step/role step),
  correct language strings, zero cross-language leakage, zero raw-key leaks, with
  screenshots; nav-check-preview.json / nav-en-preview.png / nav-es-preview.png (preview
  build at 1440px) and nav-check-live.json / nav-check-live.txt / nav-en-live.png /
  nav-es-live.png (live after deploy): EN "✨ Create account" / ES "✨ Crear cuenta",
  html[lang] flips, no key leaks;
  linkcheck.txt — no links added/changed in the diff, touched routes 200;
  smoke-before.txt — live 200s, bundle index-CkKiuuiW.js; smoke-after.txt — live 200s,
  bundle index-CkKiuuiW.js → index-LYAJc3uO.js (new build live, verified post-deploy);
  lighthouse-live-before.json / lighthouse-preview-after.json / lighthouse-live-after.json).
  Lighthouse (mobile throttled):
  | run | perf | a11y | BP | SEO | CLS | LCP |
  |---|---|---|---|---|---|---|
  | live before | 91 | 100 | 100 | 100 | 0 | 2.8 s |
  | local preview (new build) | 93 | 100 | 96* | 100 | 0 | 2.6 s |
  | live after | 92 | 100 | 100 | 100 | 0 | 2.8 s |
  *BP 96 on localhost is the known environment artifact (`/_vercel/insights/script.js`
  404s outside Vercel; live serves it). Text-only change — no perf/a11y/SEO surface
  affected; no regression vs baseline.
- **Reverted:** n
- **Follow-ups noted (not done):** wallet-adapter's own strings ("Select Wallet",
  "Change wallet") remain English-only (third-party library); UserProfile renders
  `user.role` raw (canonical English "Manager"/"Scout"/"Trader") and its mock profiles
  are hardcoded English — translating the profile surface is a candidate next run;
  LandingPage.tsx still ships its marketing copy hardcoded English (bigger copy+translation
  task); en+es locale JSON (~70 KB) still bundled in the main chunk (lazy locale loading
  noted 2026-10-10).

## 2026-10-12 run 20261012T024706Z

- **What:** i18n completion on the profile surface (play.goalworld.fun, /perfil/...):
  UserProfile.tsx shipped ~60 inline bilingual strings via a `tText(en, es)` helper and
  hardcoded labels outside it — including Spanish shown to EN users ("Reenvío Activo/
  Inactivo"), English-only labels for ES users (XP progress, stat labels, tab labels,
  "Level N", "Joined", placeholders, tooltips), raw canonical role text ("Manager"/
  "Scout"/"Trader") and mixed-language mock/seed content. All UI strings are now `t()`
  dictionary lookups backed by 85 new keys in en.json + es.json + TranslationKeys.
  Data-driven labels localize without touching persisted data: role badges reuse the
  `create_user_role_*` labels (user records keep the canonical English role), tier/rarity
  (Gold/Silver/Bronze/Platinum) and activity types (BET/NFT/UPGRADE) use label maps,
  mock bios + seed-feed posts use `bioKey`/`contentKey`, seed timestamps use `timeKey`
  (legacy localStorage feed entries still render via raw-string fallback). Number and
  date formatting now follows the app language via Intl (balance was hardcoded
  `toLocaleString('es')`, dates were mixed-language strings; mock joinedDate/activity
  dates re-expressed as ISO and rendered per locale). `check-i18n-keys.mjs` now also
  validates `bioKey`/`contentKey`/`timeKey` data-record literals (the 2026-10-11
  labelKey/descKey guard extended) so dynamically-looked-up strings cannot drift.
- **Why:** The profile page (own profile, other profiles, edit form, 4 tabs — the exact
  surface deferred as "candidate next run" on 2026-10-11) rendered wrong-language text
  to both audiences: EN users got Spanish mailbox status and Spanish seed-feed prose,
  ES users got an all-English stats/edit surface. It also bypassed the check:i18n drift
  guard entirely.
- **Commit SHA (merge):** `5b42238e` (PR #893; feature `42a5c84e`, docs `ac14934a`). Pre-merge `origin/main` = `507c36d9`
  (rollback: `git revert -m 1 <merge>` + push — Vercel redeploys the previous build
  automatically). Landing site untouched — no landing deploy needed.
- **Live link:** https://play.goalworld.fun/perfil/demo_user (profile surface; nav
  account/profile links land here).
- **QA evidence:** `/data/work/autoimprove/evidence/20261012T024706Z/`
  (build.txt exit 0 — tsc + vite; tests.txt exit 0 — check:i18n 381 used keys, 694
  dictionary keys, en/es/type in sync; tests-negative-selftest.txt — typo'd bioKey →
  exit 1 as expected, then OK (new data-key validation verified); dom-assertions.txt —
  86/86 headless-browser DOM assertions on the real profile route via local preview
  build, EN + ES × (all 4 tabs + edit form + placeholders + tooltips): correct language
  strings, zero cross-language leakage, zero raw-key leaks, Intl number/date formats
  ('4,210 XP'/'4210 XP', 'Joined May 2026'/'Desde mayo de 2026'), role badge
  'Scout'/'Ojeador', with DOM dumps + screenshots (profile-before-live-{en,es}.png =
  live old UI, profile-after-preview-{en,es}.png = new build); linkcheck.txt — no new
  href/src in the diff, touched route 200 on preview; smoke-before.txt — live 200s,
  bundle index-LYAJc3uO.js; lighthouse-live-before-{home,profile}.json /
  lighthouse-preview-after-{home,profile}.json).
  Lighthouse (mobile throttled):
  | run | perf | a11y | BP | SEO | CLS | LCP |
  |---|---|---|---|---|---|---|
  | live before, home | 78 | 100 | 100 | 100 | 0 | 5.2 s |
  | live before, profile | 91 | 94 | 100 | 100 | 0 | 2.9 s |
  | preview (new build), home | 94 | 100 | 96* | 100 | 0 | 2.5 s |
  | preview (new build), profile | 92 | 94 | 96* | 100 | 0 | 2.8 s |
  | live after, home | 92 | 100 | 100 | 100 | 0 | 2.6 s |
  | live after, profile | 92 | 94 | 100 | 100 | 0 | 2.7 s |
  *BP 96 on localhost is the known environment artifact (`/_vercel/insights/script.js`
  404s outside Vercel; live serves it). a11y 94 on the profile is pre-existing and
  unchanged (live-before shows the same 94: inactive-tab color contrast, h1→h3
  heading-order skip, language-toggle accessible-name mismatch — noted as follow-ups);
  home live perf 78 is lab-throttle noise (page untouched). Text-only change — no
  perf/a11y/SEO surface affected; no regression vs baseline.
- **Reverted:** n (deploy verified healthy on live; rollback point kept: `git revert
  -m 1 5b42238e` + push.)
- **Deploy verify (live, post-merge):** smoke-after.txt — live 200s, bundle
  index-LYAJc3uO.js → index-CKdJMF6j.js (new build live; main chunk carries the new
  keys/strings, old `tText(` helper and the "Joined Mayo" bug string absent);
  dom-live-assertions.txt — 22/22 live DOM spot-checks EN+ES (correct language, no raw
  keys, Intl formats; 'OJEADOR' role badge verified on the feed tab);
  profile-after-live-{en,es}.png + profile-after-live-es-feed.png;
  lighthouse-live-after-{home,profile}.json — no regression vs live-before
  (a11y 94→94 pre-existing items unchanged, SEO/BP 100, perf 91→92 on profile).
- **Follow-ups noted (not done):** profile a11y items above (tab contrast, heading
  order, LanguageToggle names) — cheap fixes, pre-existing, out of this run's scope;
  wallet-adapter's own strings remain English-only (third-party library);
  LandingPage.tsx marketing copy still hardcoded English (bigger copy+translation
  task); en+es locale JSON (~72 KB) still bundled in the main chunk (lazy locale
  loading noted 2026-10-10).

## 2026-10-13 run 20261013T024735Z

- **What:** Profile-surface a11y fixes (the follow-up deferred on 2026-10-11 and
  2026-10-12) on play.goalworld.fun /perfil/...: (1) the profile tab bar and
  overview cards were completely unstyled (no CSS existed for `.profile-tabs`,
  `.profile-tab`, `.overview-grid`, `.overview-card`) so the tabs rendered as raw
  UA buttons whose default button face made both the active (accent `#14f195`)
  and inactive (`#64748b`) labels fail color-contrast (3.56:1 and 1.11:1 vs 4.5
  required); they now have deliberate theme styling with WCAG-safe state colors —
  accent background + `#000` label on active (verified ≥4.5:1 for all 5 preset
  accents + defaults; worst case `#9945ff` = 4.71:1), `#b6c2d2` on dark glass for
  inactive, plus hover and `:focus-visible` states; the inline `color`/
  `borderColor` overrides on the buttons were removed (states now driven by the
  CSS `--accent-theme` custom property). Overview cards got matching glass-card
  styling + a responsive `auto-fit` grid. (2) overview card headings `h3` → `h2`
  (heading-order: h1 jumped straight to h3). (3) LanguageToggle `aria-label`s now
  include the visible text (`EN — English` / `ES — Español`) fixing
  label-content-name-mismatch on both header and sidebar instances.
- **Why:** These were the only three failing Lighthouse accessibility audits on
  the profile route (a11y 94), explicitly logged as cheap pending fixes on
  2026-10-12 ("tab contrast, heading order, LanguageToggle names"). Tab contrast
  1.11:1 made inactive tabs genuinely unreadable; the fix also resolves the
  unstyled-tab-bar/stacked-card look the surface had shipped with.
- **Commit SHA (merge):** `a6c70f1b` (PR #894; feature `8fd6a2a8`). Pre-merge
  `origin/main` = `d5cfbd19` (rollback: `git revert -m 1 a6c70f1b` + push — Vercel
  redeploys the previous build automatically). Landing site untouched — no
  landing deploy needed.
- **Live link:** https://play.goalworld.fun/perfil/demo_user (tab bar + overview
  cards; language toggle in header/sidebar).
- **QA evidence:** `/data/work/autoimprove/evidence/20261013T024735Z/`
  (build.txt exit 0 — tsc + vite, main chunk 174,460 B; tests.txt exit 0 —
  check:i18n 381 used keys, 694 dictionary keys, en/es/type in sync;
  linkcheck.txt — no href/src/url added or changed in the diff;
  smoke-before.txt — live 200s, bundle index-CKdJMF6j.js;
  lighthouse-preview-after-{profile,home}.json — new build at 4173:
  | run | perf | a11y | BP | SEO | CLS |
  |---|---|---|---|---|---|
  | preview, profile | 81 | 100 | 96* | 100 | 0 |
  | preview, home | 98 | 100 | 96* | 100 | 0 |
  color-contrast / heading-order / label-content-name-mismatch all score 1.0
  (baseline: 0 / 0 / 0); dom-assertions.txt — EN+ES headless DOM checks:
  1 active + 3 inactive tabs with zero inline color styles, h1→h2 heading
  sequence, both new aria-labels present, ES tab labels localized (Descripción/
  NFTs/Actividad/Feed Social), no raw-key leaks;
  smoke-after.txt — live 200s, bundle index-CKdJMF6j.js → index-B4KiCYEH.js with
  the new CSS rules (.profile-tabs/.profile-tab.active/.overview-card) and both
  aria-label strings verified in the deployed assets, old inline tab color style
  absent; dom-live-assertions.txt — 6/6 live checks pass;
  lighthouse-live-after-{profile,home}.json + lighthouse-live-after2-{profile,home}.json
  + lighthouse-live-after2-profile-nothrottle.json + lighthouse-exp-{old,new}-profile-r{1,2}.json;
  profile-preview-{en,es}.png, profile-live-after-en.png).
  Lighthouse (mobile throttled unless noted), live:
  | run | perf | a11y | BP | SEO | CLS | LCP |
  |---|---|---|---|---|---|---|
  | live before (10-12 evidence, same bundle CKdJMF6j), home | 92 | 100 | 100 | 100 | 0 | 2.6 s |
  | live before (10-12), profile | 92 | 94 | 100 | 100 | 0 | 2.7 s |
  | live after, home (run 1 / run 2) | 73 / 96 | 100 | 100 | 100 | 0 | 5.4 s / 2.3 s |
  | live after, profile (3 runs) | 66–67 | 100 | 100 | 100 | 0 | 6.6–6.7 s |
  | live after, profile, no throttle | 91 | 100 | 100 | 100 | 0 | 3.0 s |
  Accessibility 94 → **100** on the profile route, zero failing a11y/SEO audits,
  CLS 0.00 everywhere. The throttled live perf dip (92→66 on profile) is
  **environment, not this change** — proven by a controlled experiment (old build
  d5cfbd19 vs new build 8fd6a2a8 served side-by-side on the same host, same hour):
  identical scores (round 1: old 81 vs new 95 — the cold first run of a batch is
  the slow one; round 2: 95 vs 95; LCP 2.5–2.6 s both), new build's main-thread
  work lower (bootup 1304 ms vs 1973 ms, TBT 0 vs 69 ms) and payload slightly
  smaller (923 KB vs 933 KB). Unthrottled live scores 91 ≈ baseline 92. The
  throttled swings track external font/CDN latency under Lighthouse's simulated
  mobile throttle (same-session home run scored 96 with the identical assets);
  the LCP element also shifted between runs (header brand text vs stats value),
  the signature of timing noise, not a code path change.
  *BP 96 on localhost is the known environment artifact (/_vercel/insights
  script.js 404s outside Vercel).
- **Reverted:** n (deploy verified healthy on live; rollback point kept:
  `git revert -m 1 a6c70f1b` + push.)
- **Follow-ups noted (not done):** profile route LCP sits behind the lazy
  UserProfile chunk render (shell → chunk → content; the stats value paints after
  FCP) — candidate: route prefetch/modulepreload or an early skeleton; the live
  Vercel build renders the "Full site ↗" links as goalchain.fun while the local
  default is goalworld.fun (goalchain.fun redirects, but aligning the env to the
  canonical goalworld.fun is a candidate); pre-existing muted inline label colors
  (0.85rem `#94a3b8`) pass WCAG but read faint in visual review; wallet-adapter's
  own strings remain English-only (third-party library); LandingPage.tsx
  marketing copy still hardcoded English; en+es locale JSON still bundled in the
  main chunk (lazy locale loading noted 2026-10-10).

## 2026-10-14 run 20261014T024706Z

- **What:** Lazy locale loading (play.goalworld.fun) — the follow-up deferred in the
  2026-10-10 → 2026-10-13 runs. `src/i18n/index.tsx` statically imported both locale
  dictionaries (en.json + es.json = 81 KB raw), so every visitor downloaded and parsed
  BOTH languages inside the main chunk. Dictionaries are now code-split per language:
  each is its own chunk (`en-*.js` / `es-*.js`) and only the active one is fetched. The
  initial locale's fetch starts at module eval (overlaps app mount + lazy route chunks);
  a language switch lazy-fetches the other dictionary and keeps the current text
  rendered until it arrives (no blank flash, no raw-key flash). First paint is gated on
  the initial dictionary being present. Compile-time locale drift guard preserved via
  type-only JSON imports + assignability assert against `TranslationKeys` (the old
  static `{ en, es }` typing strength); `check:i18n` still covers both directions.
- **Why:** first-paint JS carried ~72 KB of dictionary JSON of which a visitor uses
  half; the deferred follow-up was logged in four consecutive runs.
- **Commit SHA (merge):** `05440dd3` (PR #895; feature `d17d20f3`, retrigger
  `bcd8f9a5` — see deploy note). Pre-merge `origin/main` = `7ca2c3f5` (rollback:
  `git revert -m 1 05440dd3` + push — Vercel redeploys the previous build
  automatically). Landing site untouched — no landing deploy needed.
- **Live link:** https://play.goalworld.fun (nav "Full site" EN / "Sitio completo" ES;
  /perfil/demo_user).
- **QA evidence:** `/data/work/autoimprove/evidence/20261014T024706Z/`
  (build-before.txt / build.txt exit 0 — tsc + vite; tests.txt exit 0 — check:i18n
  381 used keys, 694 dictionary keys, en/es/type in sync;
  chunks-before-after.txt — main first-paint chunk 174,460 B / 62.94 kB gzip → 94,790 B
  / 30.15 kB gzip local (live 95,219 B), new locale chunks en 56.5 KB / es 58.5 KB;
  linkcheck.txt — diff touches only src/i18n/index.tsx (no href/src changes), touched
  routes + new chunk URLs 200 on preview; smoke-before.txt — live 200s, bundle
  index-B4KiCYEH.js; dom-assertions.txt — preview 10/10 + live 9/9 headless-Chrome
  checks EN+ES (home + profile: correct language strings, zero raw-key leaks,
  html[lang] flips; resource-timing proves one locale chunk per visit — EN visit fetches
  only en-*.js, ES visit only es-*.js, switch lazy-fetches the other) with screenshots
  {home,profile}-preview-{en,es}.png + home-live-after-{en,es}.png +
  profile-live-after-es.png; smoke-after.txt — live 200s, bundle index-B4KiCYEH.js →
  index-C7-14XsM.js, main chunk has zero dictionary strings, both locale chunks 200 as
  real JS). Lighthouse (mobile throttled):
  | run | perf | a11y | BP | SEO | CLS | LCP |
  |---|---|---|---|---|---|---|
  | live before, home | 73 | 100 | 100 | 100 | 0 | 5.4 s |
  | live before, profile | 67 | 100 | 100 | 100 | 0 | 6.5 s |
  | preview (new build), home | 78 | 100 | 96* | 100 | 0 | 5.0 s |
  | preview (new build), profile | 74 | 100 | 96* | 100 | 0 | 5.9 s |
  | live after, home | 74 | 100 | 100 | 100 | 0 | 5.2 s |
  | live after, profile | 67 | 100 | 100 | 100 | 0 | 6.5 s |
  *BP 96 on localhost is the known environment artifact (/_vercel/insights/script.js
  404s outside Vercel). No regression vs live baseline (home 73→74, profile 67→67,
  a11y/BP/SEO 100, CLS 0); the throttled perf swings remain the documented external
  CDN/font-latency noise band (66–98 across runs).
- **Deploy note:** the Vercel production build for the merge push (03:04Z) never
  triggered — 80+ min with no "Production – goalchain_webapp" deployment record and no
  commit status (the Vercel GitHub App processed the PR preview normally and the
  ignore-script was verified to pass: "changes under goalchain_webapp — building").
  A one-line empty retrigger commit (`bcd8f9a5` "chore: retrigger Vercel production
  deploy for 05440dd3") made Vercel pick up main within ~2 min and the deployment
  completed healthy. Cause is on Vercel's event-processing side (dropped push event),
  not the repo; if it recurs, an empty commit to main re-arms the pipeline.
- **Reverted:** n (deploy verified healthy on live; rollback point kept:
  `git revert -m 1 05440dd3` + push.)
- **Follow-ups noted (not done):** profile route LCP still sits behind the lazy
  UserProfile chunk render (candidate: route prefetch/modulepreload or early skeleton);
  live Vercel build renders "Full site ↗" links as goalchain.fun (VITE_MARKETING_URL env
  on the Vercel project) while the code default is the canonical goalworld.fun — env
  alignment is a candidate; LandingPage.tsx marketing copy still hardcoded English
  (bigger copy+translation task); wallet-adapter's own strings remain English-only
  (third-party library); `src/i18n/locales/{en,es}/translation.json` are unreferenced
  leftovers of an older i18n layout (candidate: remove).
