# GoalWorld Deep Surface & Codebase Audit (`AUDIT.md`)

**Date:** 2026-11-09 · **Branch:** `feat/site-overhaul-20261109` · **Phase:** `0` (`A-systematic`)  
**Evidence Pack:** [`AUDIT_MAP.md`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/AUDIT_MAP.md) · [`live_crawl.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/live_crawl.json) · [`playwright_audit.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/playwright_audit.json) · [`lighthouse/summary.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/lighthouse/summary.json) · [`repo_static_audit.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/repo_static_audit.json) · [`proposed_caddy_redirects.Caddyfile`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/proposed_caddy_redirects.Caddyfile)

---

## Executive Summary (10 Lines)

1. **Scope audited:** 104 live URLs crawled across `https://goalworld.fun` and `https://play.goalworld.fun` (`live_crawl.json`), 45 Playwright multi-viewport renders at `390x844`, `820x1180`, and `1440x900` (`playwright_audit.json` + `screenshots/`), 10 Lighthouse mobile/desktop runs (`lighthouse/summary.json`), and full static analysis across `goalworld_site/`, `docs/`, and `goalchain_webapp/` (`repo_static_audit.json`).
2. **Primary hub (`goalworld.fun` / `goalworld_site/`) is fast and honest in English:** All 13 canonical pages build cleanly (`0` banned claims in `dist/`) and score **95–100 Performance, 98–100 Accessibility, 100 Best Practices, 100 SEO** on Lighthouse mobile & desktop.
3. **Critical prod leak — Legacy `docs/*.html` pages are still HTTP 200 on `goalworld.fun`:** Because `scripts/pages/stage_public_tree.py` stages `docs/` before overlaying `goalworld_site/dist/`, 27 legacy routes (`/goalworld.html`, `/goalchain.html`, `/mega-guide*.html`, `/pitch.html`, `/go/reader/`, etc.) remain live at HTTP 200 with **153 banned-claim hits** (`KDP`, `USDC royalties`, `Zero Value Loss`, `Infinity Burn`, `Neo-Veridia`, `432 Hz`, `Preorder $2.99`).
4. **Severe honesty & canon drift on `play.goalworld.fun` (`goalchain_webapp/`):** 21 files contain **235 banned-claim hits**, including `"Football Meets DeFi — Stake, Play, Earn"` on `LandingPage.tsx:67`, `Neo-Veridia` / `432 Hz` / `KDP` in `GoalWorldPortal.tsx`, `booksData.ts` (82 hits), `KindleReader.tsx`, and `TheNeuralWarsUniverse.tsx` (25 hits), plus `Yield`/`Staking` player puns in `players.json` and `nft_gallery_manifest.json`.
5. **Two disconnected brands instead of one universe:** `goalworld.fun` uses the 2026-10 editorial studio palette (`#0a0b0e` obsidian, `#e5a93c` warm amber, `#3b82f6` cobalt, editorial serif + Outfit), while `play.goalworld.fun` still uses `#030307` black + `#14f195` Solana neon green + `#9945ff` neon purple (`tokens.css:17-31`) and links out to legacy `docs/*.html` pages (`playNav.ts:106,209-258`).
6. **Multi-viewport layout & a11y gaps (`390x844`, `820x1180`, `1440x900`):** `/go/reader/` overflows horizontally (`970px/390px`) on mobile; `/goalworld.html` overflows (`921px/390px`) with 10 console `ERR_FAILED` errors; `goalworld.fun/` and `/404.html` skip `h1 -> h3` (dropping Lighthouse Home A11y to `98`); `play-*` routes render duplicate `<h1>`s and nested `<main>` landmarks; mobile footer/card links have `16px–24px` tap heights.
7. **Missing internationalization (`EN` / `ES` / `IT`):** `https://goalworld.fun/es/` and `/it/` return HTTP 404, `goalworld_site` emits zero `hreflang` tags or language switchers, and `goalchain_webapp` lacks Italian (`it`) entirely while 22 of 40 UI components (`src/ui/*.tsx`) have `0` calls to `t()`.
8. **Dead code & oversized assets:** `goalchain_webapp/src/styles/` carries 1,880 LOC of unimported CSS files (`tokens/*`, `base/*`), `goalworld_site/src/assets/img/` has 13 unreferenced images (~581 KB), and `goalchain_webapp/public/assets/img/neuralwars/` contains ~275 MB of unoptimized/duplicate media.
9. **Carried-over prod blockers tracked:** Full G2-signed Chapter 1 manuscript text for `/book.html#sample` (`TODO(nico)`), proposed Caddy 301 redirects staged in `evidence/audit/proposed_caddy_redirects.Caddyfile`, and `Clip_08` `432Hz` filename alias.
10. **Action plan:** 48 concrete, evidence-backed findings (`A-001`–`A-048`) are cataloged below across Phases 1–5 and loaded into `BACKLOG.json` sorted by priority (`P0` → `P3`).

---

## Lighthouse Baseline Summary (Quoted from [`evidence/audit/lighthouse/summary.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/lighthouse/summary.json))

| Surface & URL | Mode | Perf | A11y | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index | Top Lighthouse Opportunities / Diagnostics |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Home** (`https://goalworld.fun/`) | Mobile | **99** | **98** | **100** | **100** | 1.0 s | 1.8 s | 80 ms | 0 | 1.7 s | `heading-order` (score 0: `h1 -> h3`), `cache-insight` (64 KiB), `image-delivery-insight` (78 KiB), `max-potential-fid` (330 ms), `render-blocking-insight` |
| **Home** (`https://goalworld.fun/`) | Desktop | **100** | **98** | **100** | **100** | 0.3 s | 0.6 s | 0 ms | 0 | 0.7 s | `heading-order` (score 0: `h1 -> h3`), `cache-insight` (59 KiB), `image-delivery-insight` (98 KiB), `render-blocking-insight` |
| **Book** (`https://goalworld.fun/book.html`) | Mobile | **95** | **100** | **100** | **100** | 0.8 s | 0.8 s | 250 ms | 0 | 1.3 s | `max-potential-fid` (250 ms), `cache-insight` (20 KiB), `image-delivery-insight` (32 KiB), `render-blocking-insight` |
| **Book** (`https://goalworld.fun/book.html`) | Desktop | **100** | **100** | **100** | **100** | 0.3 s | 0.3 s | 0 ms | 0 | 0.6 s | `cache-insight` (15 KiB), `image-delivery-insight` (12 KiB), `render-blocking-insight` |
| **Cinema** (`https://goalworld.fun/cinema.html`) | Mobile | **100** | **100** | **100** | **100** | 1.1 s | 1.5 s | 0 ms | 0 | 1.3 s | `lcp-discovery-insight` (score 0), `cache-insight` (21 KiB), `image-delivery-insight` (41 KiB), `render-blocking-insight` |
| **Cinema** (`https://goalworld.fun/cinema.html`) | Desktop | **100** | **100** | **100** | **100** | 0.3 s | 0.3 s | 0 ms | 0 | 0.5 s | `lcp-discovery-insight` (score 0), `cache-insight` (21 KiB), `image-delivery-insight` (45 KiB), `render-blocking-insight` |
| **Studio** (`https://goalworld.fun/studio.html`) | Mobile | **100** | **100** | **100** | **100** | 1.0 s | 1.0 s | 0 ms | 0 | 1.0 s | `cache-insight` (22 KiB), `image-delivery-insight` (81 KiB), `render-blocking-insight` |
| **Studio** (`https://goalworld.fun/studio.html`) | Desktop | **100** | **100** | **100** | **100** | 0.4 s | 0.4 s | 0 ms | 0 | 0.5 s | `cache-insight` (19 KiB), `image-delivery-insight` (52 KiB), `render-blocking-insight` |
| **Play Home** (`https://play.goalworld.fun/`) | Mobile | **100** | **100** | **100** | **100** | 1.3 s | 1.3 s | 20 ms | 0 | 2.0 s | `max-potential-fid` (420 ms), `unused-css-rules` (16 KiB / 16,530 B), `render-blocking-insight` |
| **Play Home** (`https://play.goalworld.fun/`) | Desktop | **99** | **100** | **100** | **100** | 0.4 s | 0.4 s | 80 ms | 0 | 0.9 s | `unused-css-rules` (score 0: 16 KiB / 16,135 B), `render-blocking-insight`, `max-potential-fid` (160 ms) |

---

## Multi-Viewport Playwright Audit Summary (`390x844`, `820x1180`, `1440x900`)

Full metrics in [`evidence/audit/playwright_audit.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/playwright_audit.json) and 45 screenshots in [`evidence/audit/screenshots/`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/screenshots/):

| Surface (`slug`) | Viewports Audited | Console / Net Errors | Horizontal Overflow (`scrollWidth / clientWidth`) | Heading / Landmark / Tap-Target Issues | Screenshots (`evidence/audit/screenshots/`) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `gw-home` (`/`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | `h1 -> h3` skip (`index.html:28`); 10 small tap targets (`19px–24px` height) on mobile/tablet; unbalanced 2+1+1 bento grid at `820x1180` | `gw-home-390x844.jpg`, `gw-home-820x1180.jpg`, `gw-home-1440x900.jpg` |
| `gw-book` (`/book.html`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | 10 small tap targets (`19px` footer links); sticky mobile CTA bar has `aria-hidden="false"` | `gw-book-390x844.jpg`, `gw-book-820x1180.jpg`, `gw-book-1440x900.jpg` |
| `gw-cinema` (`/cinema.html`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | 10 small tap targets (`19px` footer links) | `gw-cinema-390x844.jpg`, `gw-cinema-820x1180.jpg`, `gw-cinema-1440x900.jpg` |
| `gw-studio` (`/studio.html`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | 10 small tap targets (`19px` footer links) | `gw-studio-390x844.jpg`, `gw-studio-820x1180.jpg`, `gw-studio-1440x900.jpg` |
| `gw-live` (`/live.html`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | `h1 -> h3` skip in runtime-injected `.live-item h3` (`site.js:58`); 10 small tap targets | `gw-live-390x844.jpg`, `gw-live-820x1180.jpg`, `gw-live-1440x900.jpg` |
| `sub-blast-radius` (`/blast-radius/`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | Missing `<nav>` landmark, missing canonical & OpenGraph meta | `sub-blast-radius-390x844.jpg`, `sub-blast-radius-820x1180.jpg`, `sub-blast-radius-1440x900.jpg` |
| `sub-hermes-demo` (`/hermes-demo/`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | Missing `<nav>` & `<footer>` landmarks, missing canonical & OpenGraph meta, 5 small tap targets (`33px–34px`) | `sub-hermes-demo-390x844.jpg`, `sub-hermes-demo-820x1180.jpg`, `sub-hermes-demo-1440x900.jpg` |
| `sub-go-reader` (`/go/reader/`) | `390x844`, `820x1180`, `1440x900` | `0` | **OVERFLOW at `390x844`: `970px / 390px`** (`div#sidebar.sidebar`) | Pre-v7 chapters, `Preorder $2.99`, `432 Hz` button, missing `<nav>` & `<footer>` | `sub-go-reader-390x844.jpg`, `sub-go-reader-820x1180.jpg`, `sub-go-reader-1440x900.jpg` |
| `legacy-goalworld` (`/goalworld.html`) | `390x844`, `820x1180`, `1440x900` | **10 console errors** (`net::ERR_FAILED` / `ERR_BLOCKED_BY_ORB` on Google Fonts) | **OVERFLOW at `390x844`: `921px / 390px`** (`div.gw-nav-links`) | 48 banned claims (`KDP`, `USDC`, `Neo-Veridia`, `432 Hz`) | `legacy-goalworld-390x844.jpg`, `legacy-goalworld-820x1180.jpg`, `legacy-goalworld-1440x900.jpg` |
| `play-home` (`play.goalworld.fun/`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | Missing `<footer>` landmark (`footer: 0`), wrong bodyBg `rgb(3, 3, 7)`, banned DeFi/Staking copy | `play-home-390x844.jpg`, `play-home-820x1180.jpg`, `play-home-1440x900.jpg` |
| `play-dashboard` (`/dashboard`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | Duplicate `<h1>` (`h1Count: 2`), nested `<main>` (`main: 2`), missing `<footer>` (`footer: 0`) | `play-dashboard-390x844.jpg`, `play-dashboard-820x1180.jpg`, `play-dashboard-1440x900.jpg` |
| `play-estadio` (`/estadio`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | Duplicate `<h1>` (`h1Count: 2`), nested `<main>` (`main: 2`), missing `<footer>` (`footer: 0`) | `play-estadio-390x844.jpg`, `play-estadio-820x1180.jpg`, `play-estadio-1440x900.jpg` |
| `play-goalworld` (`/goalworld`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | Duplicate `<h1>` (`h1Count: 2`), nested `<main>` (`main: 2`), 15 banned canon/KDP claims | `play-goalworld-390x844.jpg`, `play-goalworld-820x1180.jpg`, `play-goalworld-1440x900.jpg` |
| `play-reader` (`/reader`) | `390x844`, `820x1180`, `1440x900` | `0` | None (`390/390`, `820/820`, `1440/1440`) | Missing `<footer>`, 87 combined `432 Hz` / pre-v7 draft hits | `play-reader-390x844.jpg`, `play-reader-820x1180.jpg`, `play-reader-1440x900.jpg` |

---

## Detailed Findings by Phase (48 Findings: `A-001` – `A-048`)

### Phase 1 — Honesty, Canon Alignment & Legacy Cleanup / Redirects (`A-001` – `A-014`)

#### `A-001` · [P0] Legacy `docs/*.html` pages are served HTTP 200 on live `goalworld.fun` with 145+ banned claims and mobile layout breakage
- **Severity:** `P0` · **Effort:** `M` · **Phase:** `1`
- **Evidence:**
  - Live crawl (`evidence/audit/live_crawl.log:45-64`) & static scan (`evidence/audit/repo_static_audit.json:652-1380`):
    - `docs/goalworld.html:7,58,93,131,172,226,235,253` (HTTP 200 at `https://goalworld.fun/goalworld.html`, **48 banned hits**: `Amazon KDP`, `Neo-Veridia`, `432 Hz`, `USDC royalties`). Playwright at `390x844` shows horizontal overflow `921px / 390px` (`div.gw-nav-links`) and 10 console `net::ERR_FAILED` errors (`evidence/audit/screenshots/legacy-goalworld-390x844.jpg`, `legacy-goalworld-820x1180.jpg`, `legacy-goalworld-1440x900.jpg`).
    - `docs/goalchain.html:934,1338,1360,1490,1523,1581,1591` (HTTP 200, **29 banned hits**: `KDP`, `yield`, `Staking`, `Zero Value Loss`, `Infinity Burn`).
    - `docs/mega-guide-v1.html:7,381-427` (HTTP 200, **25 banned hits**) & `docs/mega-guide.html:7,396-462` (HTTP 200, **16 banned hits**).
    - `docs/colabs.html:329,408-429` (**5 hits**), `docs/pitch.html:234-245` (**4 hits**, `0 <h1>`), `docs/protocol.html:107-159` (**4 hits**), `docs/tokenomics.html:211-218` (**2 hits**), `docs/agents.html:261` (**1 hit**), `docs/studio.html:10-155` (**6 hits**), `docs/index.html:403` (**1 hit**).
- **Concrete Fix:** Move full legacy HTML files in `docs/` (`goalworld.html`, `goalchain.html`, `mega-guide.html`, `mega-guide-v1.html`, `pitch.html`, `colabs.html`, `protocol.html`, `tokenomics.html`, `agents.html`, `arcade.html`, `app.html`, `ceo.html`, `legal.html`, `map.html`, `pre-nft.html`, `play/*.html`, `architecture/archify/goalchain.architecture.html`, plus stale `docs/{index,book,cinema,studio,live}.html`) into `docs/archive/legacy-html-20261109/` with a `README.md` inventory, replace the public paths in `docs/` with clean zero-claim HTML redirect stubs matching [`evidence/audit/proposed_caddy_redirects.Caddyfile`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/proposed_caddy_redirects.Caddyfile), and exclude `docs/archive/` in `scripts/pages/stage_public_tree.py`.

#### `A-002` · [P0] Legacy `/go/reader/` and `/reader.html` routes serve pre-v7 draft chapters, `Preorder $2.99` CTAs, `432 Hz` Solfeggio audio, and 970px mobile overflow
- **Severity:** `P0` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - `docs/go/reader/index.html:13,57,61,64,66,337,358` and `docs/reader.html:13,57,61,64,66,337,358` (8 banned hits each for `preorder` and `432 Hz` in `repo_static_audit.json:818-874,1255-1311`).
  - Playwright `390x844` on `https://goalworld.fun/go/reader/` (`evidence/audit/playwright_audit.json` & `evidence/audit/screenshots/sub-go-reader-390x844.jpg`, `sub-go-reader-820x1180.jpg`, `sub-go-reader-1440x900.jpg`): `scrollWidth=970` vs `clientWidth=390` (`hasHorizontalOverflow: true` caused by off-canvas `div#sidebar.sidebar`).
- **Concrete Fix:** Archive `docs/reader.html` and `docs/go/reader/index.html` into `docs/archive/legacy-html-20261109/` and replace both files with a responsive, zero-banned-claim redirect stub to `/book.html#sample`.

#### `A-003` · [P0] `play.goalworld.fun` landing page (`LandingPage.tsx`), `index.html`, and `manifest.json` promote banned `"Football Meets DeFi — Stake, Play, Earn"`, `"NFT market"`, and `"staking"`
- **Severity:** `P0` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalchain_webapp/src/ui/LandingPage.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/LandingPage.tsx#L37-L68) (`:37` `"Squad gallery, NFT market, trading and staking"`, `:47` `{ label: 'Staking', href: '/staking' }`, `:67` `"Football Meets DeFi — Stake, Play, Earn with the Genesis Squad on Solana."`).
  - [`goalchain_webapp/index.html`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/index.html#L12-L24) (`:12,17,23` `"GoalWorld play app: football meets DeFi on Solana — matchday fixtures, predictions, squads, NFT market and staking."`).
  - [`goalchain_webapp/public/manifest.json`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/public/manifest.json#L4) (`:4` `"Solana-powered football manager with DeFi yield and Genesis NFT squad"`).
  - Screenshots: `evidence/audit/screenshots/play-home-390x844.jpg`, `play-home-820x1180.jpg`, `play-home-1440x900.jpg`.
- **Concrete Fix:** Rewrite `LandingPage.tsx`, `goalchain_webapp/index.html`, and `public/manifest.json` to remove all `DeFi`, `Stake`, `Earn`, `yield`, and `NFT market` claims, framing the app honestly as **GoalWorld Matchday Lab — Tactical Football Sandbox on Solana Devnet (Free to Play, No Real Money)**.

#### `A-004` · [P0] `play.goalworld.fun/goalworld` (`GoalWorldPortal.tsx`) contains 15 banned claims (`Neo-Veridia`, `432 Hz`, `Convergence Protocol`, `Amazon KDP`, `Publisher SaaS`) and fabricated metrics
- **Severity:** `P0` · **Effort:** `M` · **Phase:** `1`
- **Evidence:**
  - [`goalchain_webapp/src/ui/GoalWorldPortal.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/GoalWorldPortal.tsx#L67-L426) (`:67` `"En Neo-Veridia, la IA El Arquitecto... 432 Hz"`, `:84-85` `"emite en 432 Hz... Convergence Protocol"`, `:243,302,339,426` `"Amazon KDP + Tokenización de Derechos IP"`, `"Publisher SaaS (KDP + Web3)"`, fabricated subscriber and USDC royalty counters).
  - Screenshots: `evidence/audit/screenshots/play-goalworld-390x844.jpg`, `play-goalworld-820x1180.jpg`, `play-goalworld-1440x900.jpg`.
- **Concrete Fix:** Overhaul `GoalWorldPortal.tsx` to present canonical v7 lore (`Neo-Citania`, `the Link`, `Kora Vega`, `twenty days to Project Renaissance`, `528 Hz`, Book 1 *Fractured Code* G2 signed off, Book 2 *Earth's New Song* in production, Book 3 *Evolution Matrix* outlined, companion concepts *Aethelgard* and *AeroOlympus*) with honest Devnet cross-progression perks and zero KDP/royalty/fake-metric claims.

#### `A-005` · [P0] `play.goalworld.fun/reader` (`KindleReader.tsx` + `booksData.ts`) and `TheNeuralWarsUniverse.tsx` contain 112 banned hits for `432 Hz`, `Neo-Veridia`, and pre-v7 draft chapters
- **Severity:** `P0` · **Effort:** `M` · **Phase:** `1`
- **Evidence:**
  - [`goalchain_webapp/src/ui/booksData.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/booksData.ts#L65-L119) (`82` hits for `"432 Hz Solfeggio"` and outdated pre-v7 draft chapters in `repo_static_audit.json:1851-1903`).
  - [`goalchain_webapp/src/ui/KindleReader.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/KindleReader.tsx#L125-L1044) (`:125,736,1024,1041,1044` — `5` hits for `"432 Hz Solfeggio"` generator).
  - [`goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx#L42-L315) (`:42,44,140,141,174,209,274,315` — `25` hits for `Neo-Veridia` and `432 Hz`).
  - Screenshots: `evidence/audit/screenshots/play-reader-390x844.jpg`, `play-reader-820x1180.jpg`, `play-reader-1440x900.jpg`.
- **Concrete Fix:** Replace `booksData.ts` with canonical v7 Chapter 1 sample text (`1: Threshold` from `goalworld_site/src/pages/book.html:30-40` + Spanish/Italian translations + `TODO(nico)` marker for full Chapter 1), replace `432 Hz` in `KindleReader.tsx` and `TheNeuralWarsUniverse.tsx` with `528 Hz` canonical resonance / ambient drone, and update all `Neo-Veridia` references to `Neo-Citania`.

#### `A-006` · [P0] `play.goalworld.fun/staking` and `/defi` components promote banned `Infinity Burn`, `Yield Calculator`, `Staking`, and `Treasury Yield`
- **Severity:** `P0` · **Effort:** `M` · **Phase:** `1`
- **Evidence:**
  - [`goalchain_webapp/src/ui/StakingBurnDashboard.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/StakingBurnDashboard.tsx#L89-L167) (10 hits), [`goalchain_webapp/src/components/YieldCalculator.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/components/YieldCalculator.tsx#L138-L281) (25 hits), [`goalchain_webapp/src/components/InfinityFlame.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/components/InfinityFlame.tsx#L320) (1 hit), [`goalchain_webapp/src/ui/DeFiPortal.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/DeFiPortal.tsx#L52) (`"Swarm Yield Vaults"`), [`goalchain_webapp/src/ui/SwarmVaults.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/SwarmVaults.tsx#L30-L50) (`"Treasury Yield"`), [`goalchain_webapp/src/components/VaultStrategyCard.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/components/VaultStrategyCard.tsx#L38), [`goalchain_webapp/src/ui/LayeredNftCard.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/LayeredNftCard.tsx#L209-L468), [`goalchain_webapp/src/ui/WorldCupPredictor.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/WorldCupPredictor.tsx#L490), [`goalchain_webapp/src/ui/CorporateAutopilot.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/CorporateAutopilot.tsx#L476), and `src/i18n/locales/{en,es}.json` (40 hits).
- **Concrete Fix:** Reframe `/defi` and `/staking` into an explicitly labelled **Devnet Matchday Telemetry & Tactics Sandbox (Simulated, Zero Monetary Value)**: rename `Yield` → `Matchday Rating / Telemetry Boost`, `Staking` → `Squad Lock (Devnet)`, `Infinity Burn` → `Engine Core Pulse`, and scrub all banned `yield`, `staking`, `Infinity Burn`, and `NFT market` strings from UI components and `src/i18n/locales/*.json`.

#### `A-007` · [P0] `players.json` and `nft_gallery_manifest.json` contain 44 banned `Yield` / `Staking` player puns
- **Severity:** `P0` · **Effort:** `M` · **Phase:** `1`
- **Evidence:**
  - [`goalchain_webapp/public/assets/data/players.json`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/public/assets/data/players.json#L231-L2256) (13 hits: `Alexis Yield-Allister`, `Eduardo Cama-Yield`, `Dayot Upa-Staking`, `Declan Yield-Rice`, `Rodrygo Yield-Goes`, `Casemiro Staking`, `Dani Yield-Olmo`, `Marc-André ter Staking`).
  - [`goalchain_webapp/public/assets/data/nft_gallery_manifest.json`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/public/assets/data/nft_gallery_manifest.json#L179-L535) (31 hits).
- **Concrete Fix:** Replace all `Yield` and `Staking` tokens in player names, bios, and traits in `players.json` and `nft_gallery_manifest.json` with football/tactical terminology (`Pulse`, `Link`, `Tactical`, `Vanguard`) while keeping image asset paths resolving cleanly (or aliasing filenames).

#### `A-008` · [P1] `goalchain_webapp/public/classic-dashboard.html` serves 18 banned claims (`Daily Yield`, `JitoSOL +12% APR`, `Yield Airdrop`) at `https://play.goalworld.fun/classic-dashboard.html`
- **Severity:** `P1` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalchain_webapp/public/classic-dashboard.html`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/public/classic-dashboard.html#L279-L1729) (18 banned hits in `repo_static_audit.json:1947-1999`).
- **Concrete Fix:** Move the full legacy `classic-dashboard.html` to `docs/archive/legacy-html-20261109/classic-dashboard.html` and replace `goalchain_webapp/public/classic-dashboard.html` with a clean, self-contained HTML redirect stub to `/dashboard` containing zero banned claims.

#### `A-009` · [P1] `play.goalworld.fun` agent discovery files (`SKILL.md` and `llms.txt`) still advertise banned `"NFT market"` and `"staking"`
- **Severity:** `P1` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalchain_webapp/public/.well-known/agent-skills/goalworld-play/SKILL.md`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/public/.well-known/agent-skills/goalworld-play/SKILL.md#L9-L23) (6 banned hits in `repo_static_audit.json:2277-2316`) and live `https://play.goalworld.fun/llms.txt` (`live_crawl.log:83,86`).
- **Concrete Fix:** Update `goalchain_webapp/public/.well-known/agent-skills/goalworld-play/SKILL.md`, `public/.well-known/ard.json`, `public/.well-known/ai-catalog.json`, and `public/llms.txt` to describe `play.goalworld.fun` honestly as the GoalWorld Matchday Lab tactical football sandbox on Solana Devnet (free to play, no real money, no staking/yield).

#### `A-010` · [P1] `goalworld_site` hero and press image filenames contain banned pre-v7 city name `neo-veridia` (`hero-neo-veridia.webp`, `press-hero-neo-veridia.jpg`)
- **Severity:** `P1` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalworld_site/src/pages/index.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/index.html#L1-L4) (`:1,4` `/assets/img/hero-neo-veridia.webp`), [`goalworld_site/src/pages/press.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/press.html#L57-L80) (`:57` `/assets/img/press/press-hero-neo-veridia.jpg`, `:80` `/assets/img/hero-neo-veridia.webp`), `live_crawl.log:1,2,19,20,94`.
- **Concrete Fix:** Create canonical copies `hero-neo-citania.webp`, `hero-neo-citania-800.webp`, `hero-neo-citania-400.webp`, and `press/press-hero-neo-citania.jpg` in `goalworld_site/src/assets/img/` (retaining the old files so external hotlinks do not 404) and update all HTML/preload/press-zip references to `neo-citania`.

#### `A-011` · [P2] `Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4` video URL in `index.html:134` and `cinema.html:27` carries `432Hz` in the filename; clean alias returns HTTP 404 on live origin
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalworld_site/src/pages/index.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/index.html#L134), [`goalworld_site/src/pages/cinema.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/cinema.html#L27), `live_crawl.log:65-66` (`[200] .../Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4`, `[404] .../Clip_08_Kora_Vega_Harmonic_Rings.mp4`).
- **Concrete Fix:** Add a dual `<source>` fallback in `index.html:134` and `cinema.html:27` (trying `/assets/img/neuralwars/05_Clips/Clip_08_Kora_Vega_Harmonic_Rings.mp4` first, then falling back to the legacy filename until VPS Caddy alias is applied), add the alias rule to `proposed_caddy_redirects.Caddyfile`, and keep tracked in `PROGRESS.md` "Needs Nico".

#### `A-012` · [P2] Canon number discrepancy in `about.html:57` (`"411 clean bills of mental health"`) vs `FRACTURED_CODE_CANON_NOTE.md:24` (`"1.724 borrados"`)
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalworld_site/src/pages/about.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/about.html#L57) vs [`_work/site-overhaul-20261109/context/FRACTURED_CODE_CANON_NOTE.md`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/context/FRACTURED_CODE_CANON_NOTE.md#L24).
- **Concrete Fix:** Update `about.html:57` to match `FRACTURED_CODE_CANON_NOTE.md:24` (`1,724 neural compliance clearances`) with an inline `<!-- TODO(nico): confirm 1,724 vs 411 in MANUSCRIPT_v7 Prologue -->` comment.

#### `A-013` · [P2] `/book.html#sample` contains only the 9-paragraph (~330-word) opening excerpt instead of the complete G2-signed Chapter 1
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalworld_site/src/pages/book.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/book.html#L30-L40), [`AGY_QUALITY_REVIEW_20261104_1745.md`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/context/AGY_QUALITY_REVIEW_20261104_1745.md#L21).
- **Concrete Fix:** Upgrade the `#sample` reader container in `book.html` (comfortable reading-mode controls, clear excerpt status banner, explicit `<!-- TODO(nico): insert full G2-signed MANUSCRIPT_v7 Chapter 1 text -->` marker) without inventing manuscript prose, and track in `PROGRESS.md` "Needs Nico".

#### `A-014` · [P3] `BANNED_CLAIMS` in `goalworld_site/build.mjs` omits 5 `copy_deck.md` guardrails (`Neo-Veridia`, `seven days`, `432 Hz`, `$1M`, `Convergence Protocol`) and `goalchain_webapp` has no build-time banned-claim check
- **Severity:** `P3` · **Effort:** `S` · **Phase:** `1`
- **Evidence:**
  - [`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs#L243-L260), [`copy_deck.md`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/context/copy_deck.md#L3).
- **Concrete Fix:** Add `Neo-Veridia`, `seven days`, `432 Hz`, `$1M`, and `Convergence Protocol` to `BANNED_CLAIMS` in `goalworld_site/build.mjs`, and add `scripts/check-banned-claims.mjs` to `goalchain_webapp` wired into `npm run build` / `npm run check:i18n`.

---

### Phase 2 — Unified Design System, Layout & Responsive Overhaul (`A-015` – `A-025`)

#### `A-015` · [P1] Severe design-token and palette divergence between `goalworld.fun` (`site.css`) and `play.goalworld.fun` (`tokens.css` / `index.css`)
- **Severity:** `P1` · **Effort:** `M` · **Phase:** `2`
- **Evidence:**
  - [`goalworld_site/src/assets/css/site.css`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/css/site.css#L4-L26) (`--bg: #0a0b0e`, `--bg-elev: #12141c`, `--ink: #f4f4f6`, `--green: #e5a93c` warm amber, `--code: #3b82f6` cobalt) vs [`goalchain_webapp/src/styles/tokens.css`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/styles/tokens.css#L17-L43) (`--gc-bg: #030307`, `--gc-green: #14f195`, `--gc-purple: #9945ff`) and [`goalchain_webapp/src/index.css`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/index.css#L26-L31).
  - Visual comparison: `evidence/audit/screenshots/gw-home-1440x900.jpg` (`bodyBg: rgb(10, 11, 14)`) vs `evidence/audit/screenshots/play-home-1440x900.jpg` (`bodyBg: rgb(3, 3, 7)`).
- **Concrete Fix:** Align `goalchain_webapp/src/styles/tokens.css` and `goalchain_webapp/src/index.css` to the canonical GoalWorld studio design tokens (`#0a0b0e` obsidian canvas, `#12141c` elevated surface, `#f4f4f6` primary ink, `#e5a93c` warm amber primary accent, `#3b82f6` cobalt code/matchday accent, editorial serif + Outfit + mono) while preserving semantic status colors (`#22c55e` success, `#ef4444` danger).

#### `A-016` · [P2] 1,880 lines of dead, unimported CSS files in `goalchain_webapp/src/styles/{tokens,base}/` and 16 KiB unused CSS in `index.css`
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - `goalchain_webapp/src/styles/tokens/{colors,typography,spacing,borders,motion}.css` (1,174 LOC) and `goalchain_webapp/src/styles/base/{reset,typography}.css` (706 LOC) have `0` imports across `goalchain_webapp/src/`.
  - Lighthouse `unused-css-rules` on `play-home` (`evidence/audit/lighthouse/summary.json:514-520,584-590`: 16,135–16,530 bytes savings).
- **Concrete Fix:** Move the unimported `src/styles/tokens/*` and `src/styles/base/*` files to `docs/archive/webapp-unused-styles-20261109/` with a note, and prune unused legacy selectors in `goalchain_webapp/src/index.css`.

#### `A-017` · [P1] Heading order skips (`h1 -> h3` with no `h2`) on `goalworld.fun/` (`index.html:28`), `/404.html` (`404.html:16`), and `/live.html` (`site.js:58`), dropping Lighthouse Home Accessibility to `98`
- **Severity:** `P1` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - Lighthouse `heading-order` failure (`score: 0`) on `home` mobile & desktop (`evidence/audit/lighthouse/summary.json:11,24-30,82,95-101`).
  - [`goalworld_site/src/pages/index.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/index.html#L25-L52) (`<h1>One universe...</h1>` followed directly by `<h3>The Neural Wars</h3>` in `.bento`).
  - [`goalworld_site/src/pages/404.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/404.html#L5-L19) (`<h1>Lost in the Link.</h1>` followed by `<h3>Fractured Code</h3>`).
  - [`goalworld_site/src/assets/js/site.js`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/js/site.js#L58) (`live.html` has `<h1>Studio projects, live.</h1>` followed by runtime `<h3>` project cards).
- **Concrete Fix:** Add a semantic `<h2>` section header (or `.sr-only` `<h2>` where visual design requires a clean band) before `.bento` in `index.html`, before `.nf-links` in `404.html`, and before `[data-live-feed]` in `live.html` so heading levels never skip (`h1 -> h2 -> h3`).

#### `A-018` · [P2] Duplicate `<h1>` elements on `play.goalworld.fun` routes (`/dashboard`, `/estadio`, `/club`, `/goalworld`)
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - `evidence/audit/playwright_audit.json` (`h1Count: 2` on `play-dashboard`, `play-estadio`, `play-club`, `play-goalworld` across all 3 viewports).
  - [`goalchain_webapp/src/ui/App.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/App.tsx#L46) renders `<h1>{t(titleKey)}</h1>` inside `PlayPage`, while child portals (`DashboardGrid.tsx`, `EstadioPortal.tsx`, `ClubPortal.tsx`, `GoalWorldPortal.tsx`) render a second `<h1>`.
- **Concrete Fix:** Demote inner portal hero headings from `<h1>` to `<h2>` (or let `PlayPage` omit its wrapper `<h1>` when the child portal renders its own hero `<h1>`) so every route has `h1Count === 1`.

#### `A-019` · [P2] Undersized mobile tap targets (`16px–24px` height) on `goalworld.fun` footer links, `.notify-pill a`, and `.card .go` links at `390x844` and `820x1180`
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - `evidence/audit/playwright_audit.json:23-84,677-738` (`.site-footer a` height `19px`, `.notify-pill a` height `24px`, `.card a.go` height `16px`).
  - [`goalworld_site/src/assets/css/site.css`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/css/site.css#L319-L325) and `:503-506,560-562`.
- **Concrete Fix:** Add `display: inline-flex; align-items: center; min-height: 36px; padding-block: 0.35rem;` to `.site-footer a`, `.notify-pill a`, and standalone `a.go` links in `site.css` (and `min-height: 44px` on mobile `@media (max-width: 860px)`).

#### `A-020` · [P2] Mobile `.sticky-cta` bar in `goalworld_site/src/layout.html:61` has hardcoded `aria-hidden="false"` on desktop and crowds the bottom of `/book.html#sample` on `390x844`
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - [`goalworld_site/src/layout.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/layout.html#L61), [`goalworld_site/src/assets/css/site.css`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/css/site.css#L606-L612), `evidence/audit/screenshots/gw-book-390x844.jpg`.
- **Concrete Fix:** Replace `<div class="sticky-cta" aria-hidden="false">` in `layout.html:61` with `<nav class="sticky-cta" aria-label="Quick actions">`, increase mobile body bottom padding to `5.75rem`, and auto-hide `.sticky-cta` while scrolling inside `#sample` on `book.html`.

#### `A-021` · [P2] Tablet (`820x1180`) bento grid on `goalworld.fun/` renders an awkward 3-column squeeze because `.bento` only collapses below `720px`
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - [`goalworld_site/src/assets/css/site.css`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/css/site.css#L582-L583) and `:607-608`, `evidence/audit/screenshots/gw-home-820x1180.jpg`.
- **Concrete Fix:** Add a tablet media query `@media (max-width: 980px) { .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); } .bento .span-2 { grid-column: span 2; } }` in `site.css` so `820x1180` displays a clean 2-column editorial layout.

#### `A-022` · [P2] `play.goalworld.fun` (`PlayLayout.tsx` & `LandingPage.tsx`) lacks a `.skip-link`, lacks a `<footer>` landmark, and uses inline styles that ignore `tokens.css`
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - [`goalchain_webapp/src/ui/PlayLayout.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/PlayLayout.tsx#L64-L134), [`goalchain_webapp/src/ui/LandingPage.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/LandingPage.tsx#L57-L122), `evidence/audit/playwright_audit.json` (`landmarks.footer: 0` across all `play-*` routes).
- **Concrete Fix:** Add a `.skip-link` (`<a className="skip-link" href="#main">`) and a compact GoalWorld studio `<footer>` landmark (`Canon · Code · Cinema · Devnet Sandbox — No Real Money`) to `PlayLayout.tsx`, and refactor `LandingPage.tsx` inline styles into CSS classes in `index.css`.

#### `A-023` · [P2] Nested `<main>` landmarks on `play.goalworld.fun` routes (`PlayLayout.tsx:127` + `PlayPage` in `App.tsx:48`)
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - [`goalchain_webapp/src/ui/PlayLayout.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/PlayLayout.tsx#L127) (`<main className="play-body">`) wrapping [`goalchain_webapp/src/ui/App.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/App.tsx#L48) (`<main className="play-page-main">`); Playwright `landmarks.main: 2` on `play-dashboard`, `play-estadio`, `play-club`, `play-goalworld`.
- **Concrete Fix:** Change `App.tsx:48` from `<main className={...}>` to `<div className={...}>` and add `id="main"` to `<main id="main" className="play-body">` in `PlayLayout.tsx:127`.

#### `A-024` · [P3] Missing `:focus-visible` ring on `goalworld_site` search inputs (`site.css:634`) and legacy `--green` token naming for warm amber `#e5a93c` (`site.css:12`)
- **Severity:** `P3` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - [`goalworld_site/src/assets/css/site.css`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/css/site.css#L12) and `:634`.
- **Concrete Fix:** Introduce explicit `--amber-primary: #e5a93c` token in `site.css:12` (aliasing `--green: var(--amber-primary)` for compatibility) and add `box-shadow: 0 0 0 3px rgba(229, 169, 60, 0.35)` to `.faq-search:focus-visible, .nf-row input:focus-visible`.

#### `A-025` · [P3] Hero `.notify-pill` link on `goalworld_site/src/pages/index.html:18` says `"Follow @nicopez on X for updates →"` but points to `#book2`
- **Severity:** `P3` · **Effort:** `S` · **Phase:** `2`
- **Evidence:**
  - [`goalworld_site/src/pages/index.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/index.html#L18), [`AGY_QUALITY_REVIEW_20261104_1745.md`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/context/AGY_QUALITY_REVIEW_20261104_1745.md#L31-L35).
- **Concrete Fix:** Point `href` at `index.html:18` directly to `https://x.com/nicopez` (and add a secondary `#book2` anchor on `"Book 2, Earth's New Song"`).

---

### Phase 3 — Content, Narrative Coherence & Section Expansion (`A-026` – `A-035`)

#### `A-026` · [P1] `playNav.ts` links `play.goalworld.fun` users to 7 legacy/broken `goalworld.fun` routes (`/#economics`, `/pitch.html`, `/mega-guide.html`, `/colabs.html`, `/legal.html`, `/map.html`, `/goalchain.html`)
- **Severity:** `P1` · **Effort:** `M` · **Phase:** `3`
- **Evidence:**
  - [`goalchain_webapp/src/config/playNav.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/config/playNav.ts#L106-L259) (`:106` `/#economics`, `:209` `/pitch.html`, `:216` `/mega-guide.html`, `:223` `/colabs.html`, `:230` `/legal.html`, `:250` `/map.html`, `:257` `/goalchain.html`).
- **Concrete Fix:** Update `playNav.ts` so `WORLD_ITEMS` and `RESOURCE_LINKS` point to canonical `goalworld.fun` routes (`/`, `/book.html`, `/cinema.html`, `/studio.html`, `/collect.html`, `/roadmap.html`, `/faq.html`, `/press.html`, `/terms.html`) and rename the navigation zones from `TRADING` / `DEFI` to `TACTICS` / `TELEMETRY & LAB`.

#### `A-027` · [P1] Narrative disconnect between `goalworld.fun` and `play.goalworld.fun` (`LandingPage.tsx` and `DashboardGrid.tsx` lack franchise framing)
- **Severity:** `P1` · **Effort:** `M` · **Phase:** `3`
- **Evidence:**
  - [`goalchain_webapp/src/ui/LandingPage.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/LandingPage.tsx#L19-L123) and [`goalchain_webapp/src/ui/DashboardGrid.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/DashboardGrid.tsx#L1-L98); screenshots `evidence/audit/screenshots/play-home-1440x900.jpg` and `play-dashboard-1440x900.jpg`.
- **Concrete Fix:** Overhaul `LandingPage.tsx` and `DashboardGrid.tsx` to connect the Three Mediums (`Canon · Code · Cinema`): feature the Matchday Lab Devnet sandbox hero, explain how *The Neural Wars* and *AeroOlympus* connect to Matchday squads, add direct cards to `/estadio`, `/club`, `/reader`, and `goalworld.fun/book.html`, and display an unmistakable `SOLANA DEVNET SANDBOX · FREE TO PLAY · NO REAL MONEY` status pill.

#### `A-028` · [P2] `goalworld.fun/book.html` (60 LOC) lacks a structured Book 1 Dossier, 3-Act Narrative Arc breakdown, and interactive World Glossary
- **Severity:** `P2` · **Effort:** `M` · **Phase:** `3`
- **Evidence:**
  - [`goalworld_site/src/pages/book.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/book.html#L1-L60), `evidence/audit/screenshots/gw-book-1440x900.jpg`.
- **Concrete Fix:** Expand `book.html` with: (1) **Manuscript Dossier Strip** (Year 2148 · Neo-Citania · 16 Chapters + Epilogue · ~74,000 Words · Gate 2 Signed), (2) **Three-Act Architecture** (Act I: *The Optimization & The Fracture*, Act II: *The Under-Grid & The Twenty-Day Clock*, Act III: *The Yggdrasil Root & The 528 Hz Awakening*), (3) **Interactive Canon Lexicon** (`The Link`, `Pattern Suppression 17-A`, `The Architect`, `The Fractured`, `Serpent's Coil`, `Yggdrasil Network`, `The Witness`), and (4) **Principal Cast Dossier Cards** linking to `/about.html#characters`.

#### `A-029` · [P2] `goalworld.fun/cinema.html` (63 LOC) lacks a filterable Visual Canon & Keyframe Gallery despite 6 unused high-res WebP stills already in `src/assets/img/`
- **Severity:** `P2` · **Effort:** `M` · **Phase:** `3`
- **Evidence:**
  - [`goalworld_site/src/pages/cinema.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/cinema.html#L1-L63), `evidence/audit/repo_static_audit.json:2526-2549` (`keyframe-console.webp`, `keyframe-skybridge.webp`, `loc-earth-dawn.webp` and their `-640.webp` variants sit unused in `goalworld_site/src/assets/img/`).
- **Concrete Fix:** Expand `cinema.html` with a filterable **Visual Canon & Keyframe Archive** (`All`, `Keyframes`, `Characters`, `Locations`) showcasing all canonical stills (`keyframe-severing.webp`, `keyframe-console.webp`, `keyframe-skybridge.webp`, `keyframe-kora-trance.webp`, `keyframe-core-pulse.webp`, `loc-earth-dawn.webp`, `loc-sub-grid.webp`, `loc-pavilion-9.webp`, `loc-kuiper-monolith.webp`) with scene/chapter provenance captions and explicit `"AI-generated · Human-directed"` badges, plus filter logic in `site.js`.

#### `A-030` · [P2] `goalworld.fun/studio.html` (62 LOC) lacks an interactive CanonGuard walkthrough, G0–G3 Editorial Gate breakdown, and links to live sub-site demos (`/blast-radius/`, `/hermes-demo/`)
- **Severity:** `P2` · **Effort:** `M` · **Phase:** `3`
- **Evidence:**
  - [`goalworld_site/src/pages/studio.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/studio.html#L1-L62), `evidence/audit/screenshots/gw-studio-1440x900.jpg`.
- **Concrete Fix:** Expand `studio.html` with: (1) the **G0–G3 Editorial & Continuity Gate Table** (`G0 Diagnosis`, `G1 Line Rewrite`, `G2 R1/R2 Coherence Pass`, `G3 Release Mastering`), (2) a concrete **CanonGuard Continuity Diff Example** showing how drift (`Neo-Veridia`, wrong frequency, unlinked character trait) is caught and repaired deterministically, and (3) a **Live Studio Systems & Hackathon Demos** section linking to `/blast-radius/` (CanonGuard Blast Radius Zero), `/hermes-demo/` (Hermes Guarded AI), and `/live.html`.

#### `A-031` · [P2] `goalworld.fun/faq.html` is missing key questions on Studio for authors, AI disclosure policy, Book 1 release state, and multilingual availability
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `3`
- **Evidence:**
  - [`goalworld_site/src/pages/faq.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/faq.html#L15-L106), [`sitemap.md`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/context/sitemap.md#L20).
- **Concrete Fix:** Add 5 new `<details class="faq-item">` entries to `faq.html` covering: (1) How is AI used across the books, film, and code?, (2) Can other authors apply to the GoalWorld Studio cohort?, (3) When will the full *Fractured Code* novel be available to buy or read?, (4) Are there NFTs, presales, or yield tokens for sale?, and (5) What languages are supported on GoalWorld and Matchday Lab? (`EN`, `ES`, `IT`).

#### `A-032` · [P2] `goalworld_site` lacks generated Atom (`feed.xml`) and JSON Feed (`feed.json`) endpoints from `src/data/live-feed.json`
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `3`
- **Evidence:**
  - [`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs#L171-L189), [`goalworld_site/src/pages/live.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/live.html#L1-L17).
- **Concrete Fix:** Extend `goalworld_site/build.mjs` to generate `dist/feed.xml` (Atom 1.0) and `dist/feed.json` (JSON Feed 1.1) from `src/data/live-feed.json`, add `<link rel="alternate">` discovery tags in `src/layout.html`, and add visible `Atom Feed` / `JSON Feed` links on `live.html`.

#### `A-033` · [P2] `goalworld.fun/collect.html` (29 LOC) is minimal and lacks a clear Provenance Architecture & Guardrails matrix
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `3`
- **Evidence:**
  - [`goalworld_site/src/pages/collect.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/collect.html#L1-L29).
- **Concrete Fix:** Expand `collect.html` with a 3-column **Provenance & Guardrails Matrix** (*What is live today on Devnet*, *How media provenance & signing will work*, *Hard red lines: zero presales, zero yield, zero financial speculation*) and FAQ links.

#### `A-034` · [P2] In-app `AuthorStudio.tsx` (`/studio`) and `PressKit.tsx` (`/presskit`) on `play.goalworld.fun` are out of sync with `goalworld.fun/studio.html` and `press.html`
- **Severity:** `P2` · **Effort:** `M` · **Phase:** `3`
- **Evidence:**
  - [`goalchain_webapp/src/ui/AuthorStudio.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/AuthorStudio.tsx#L1-L314), [`goalchain_webapp/src/ui/PressKit.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/PressKit.tsx#L1-L392).
- **Concrete Fix:** Update `AuthorStudio.tsx` and `PressKit.tsx` to use canonical v7 lore seeds (`Neo-Citania`, `Kora Vega`, `Mileo Chen`, `528 Hz`), remove any legacy KDP/royalty/Zero-Value-Loss wording, and link directly to `https://goalworld.fun/studio.html` and `https://goalworld.fun/press.html`.

#### `A-035` · [P3] Sub-sites `/blast-radius/` and `/hermes-demo/` lack canonical/OG tags and `/hermes-demo/` triggers a Cloudflare `/cdn-cgi/l/email-protection` 404 when crawled
- **Severity:** `P3` · **Effort:** `S` · **Phase:** `3`
- **Evidence:**
  - `evidence/audit/live_crawl.log:34-35,97` (`[404] https://goalworld.fun/cdn-cgi/l/email-protection`), `evidence/audit/live_crawl.json` (`/blast-radius/` and `/hermes-demo/` missing `canonical` and `og:*` tags).
- **Concrete Fix:** Document non-destructive Caddy `header` / HTML meta injection recommendations for `/blast-radius/` and `/hermes-demo/` in `evidence/audit/proposed_caddy_redirects.Caddyfile` and showcase both sub-sites with proper context on `goalworld.fun/studio.html` and `live.html`.

---

### Phase 4 — Full `EN` / `ES` / `IT` Internationalization (`A-036` – `A-042`)

#### `A-036` · [P1] `goalworld.fun/es/` and `goalworld.fun/it/` return HTTP 404; `goalworld_site` emits only English pages with zero `hreflang` tags
- **Severity:** `P1` · **Effort:** `L` · **Phase:** `4`
- **Evidence:**
  - `evidence/audit/live_crawl.log:43-44` (`[404] https://goalworld.fun/es/`, `[404] https://goalworld.fun/it/`).
  - `evidence/audit/repo_static_audit.json:37,109,157,213,257,285,355` (`hreflangs: []` on all 13 built pages in `goalworld_site/dist/`).
- **Concrete Fix:** Extend `goalworld_site/build.mjs` and create localized page/dictionary sources to emit complete, natural Spanish (`dist/es/<slug>.html` + `dist/es/<slug>/index.html`) and Italian (`dist/it/<slug>.html` + `dist/it/<slug>/index.html`) editions for all 13 pages (`index`, `book`, `cinema`, `studio`, `collect`, `live`, `roadmap`, `about`, `faq`, `press`, `privacy`, `terms`, `404`), inject `<link rel="alternate" hreflang="en|es|it|x-default">` into every page `<head>`, set `<html lang="en|es|it">`, localize JSON-LD (`inLanguage`), and include all 36 indexable localized URLs in `dist/sitemap.xml` (keeping canon proper nouns `Kora Vega`, `Mileo Chen`, `Sierra Catalano`, `Neo-Citania`, `the Link`, `The Neural Wars`, `Fractured Code` untranslated).

#### `A-037` · [P1] `goalworld_site/src/layout.html` and `site.js` lack a language switcher (`EN · ES · IT`) and localized client-side UI strings
- **Severity:** `P1` · **Effort:** `S` · **Phase:** `4`
- **Evidence:**
  - [`goalworld_site/src/layout.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/layout.html#L42-L105), [`goalworld_site/src/assets/js/site.js`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/js/site.js#L39-L160).
- **Concrete Fix:** Add an accessible `EN | ES | IT` language switcher in the header and footer of `layout.html` (linking to the corresponding page slug in `/`, `/es/`, and `/it/`) and localize `site.js` runtime strings (`In progress`, `Submitted`, `Live`, `On hold`, `Details`, `Updated`, `Open project →`, `of ... projects`, `matching questions`, `Collapse all` / `Expand all`, 404 search hints) for `en`, `es`, and `it`.

#### `A-038` · [P1] `goalchain_webapp` (`play.goalworld.fun`) supports only `en` and `es`, lacking Italian (`it`) locale dictionary, type guards, and toggle UI
- **Severity:** `P1` · **Effort:** `L` · **Phase:** `4`
- **Evidence:**
  - [`goalchain_webapp/src/i18n/index.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/i18n/index.tsx#L17-L41) (`loaders` and `normalizeLanguage` only accept `'en' | 'es'`), [`goalchain_webapp/src/i18n/translations.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/i18n/translations.ts#L1), [`goalchain_webapp/scripts/check-i18n-keys.mjs`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/scripts/check-i18n-keys.mjs).
- **Concrete Fix:** Create `goalchain_webapp/src/i18n/locales/it.json` with natural Italian translations for all dictionary keys, add `'it'` to `Language` in `src/i18n/translations.ts` and `src/i18n/index.tsx`, update `src/components/LanguageToggle.tsx` to support `EN / ES / IT`, and update `scripts/check-i18n-keys.mjs` to enforce 100% key parity across `en.json`, `es.json`, `it.json`, and `TranslationKeys`.

#### `A-039` · [P2] 22 UI components in `goalchain_webapp/src/ui/` have `0` calls to `t()`, rendering hardcoded English/Spanish strings
- **Severity:** `P2` · **Effort:** `M` · **Phase:** `4`
- **Evidence:**
  - `evidence/audit/repo_static_audit.json:2319-2520`: `LandingPage.tsx` (124 LOC, 0 `t()`), `GoalWorldPortal.tsx` (919 LOC, 0 `t()`), `AuthorStudio.tsx` (314 LOC, 0 `t()`), `PressKit.tsx` (392 LOC, 0 `t()`), `GenesisCollectionGallery.tsx` (132 LOC, 0 `t()`), `DeFiPortal.tsx` (170 LOC, 0 `t()`), `StakingBurnDashboard.tsx` (248 LOC, 0 `t()`), `SquadGallery.tsx` (504 LOC, 0 `t()`), `MatchSimulator.tsx` (782 LOC, 0 `t()`), `WorldCupPredictor.tsx` (558 LOC, 0 `t()`), `TradingTerminal.tsx` (722 LOC, 0 `t()`), `LiveEventFeed.tsx` (107 LOC, 0 `t()`).
- **Concrete Fix:** Wire `LandingPage.tsx`, `GoalWorldPortal.tsx`, `AuthorStudio.tsx`, `PressKit.tsx`, `GenesisCollectionGallery.tsx`, `DeFiPortal.tsx`, `StakingBurnDashboard.tsx`, `SquadGallery.tsx`, `MatchSimulator.tsx`, `WorldCupPredictor.tsx`, `TradingTerminal.tsx`, and `LiveEventFeed.tsx` to `useTranslation()` with `en`/`es`/`it` keys verified by `npm run check:i18n`.

#### `A-040` · [P2] `KindleReader.tsx` and `TheNeuralWarsUniverse.tsx` render hardcoded Spanish UI chrome and lore descriptions regardless of active language
- **Severity:** `P2` · **Effort:** `M` · **Phase:** `4`
- **Evidence:**
  - [`goalchain_webapp/src/ui/KindleReader.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/KindleReader.tsx#L736-L1044), [`goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx#L42-L315).
- **Concrete Fix:** Localize `KindleReader.tsx` and `TheNeuralWarsUniverse.tsx` UI controls, chapter metadata, and lore encyclopedia entries across `en`, `es`, and `it`.

#### `A-041` · [P2] `playNav.ts` navigation items (`Autopilot Corp`, `Kindle E-Reader`, `Author & Lore Studio`, `GoalWorld hub`, `Map`, `Matchday site`, `World`) lack `i18n` keys
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `4`
- **Evidence:**
  - [`goalchain_webapp/src/config/playNav.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/config/playNav.ts#L130-L268).
- **Concrete Fix:** Add `i18n` translation keys to every item and group in `playNav.ts` and populate `en.json`, `es.json`, and `it.json`.

#### `A-042` · [P3] `goalworld_site/src/data/live-feed.json` project titles and blurbs are English-only
- **Severity:** `P3` · **Effort:** `S` · **Phase:** `4`
- **Evidence:**
  - [`goalworld_site/src/data/live-feed.json`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/data/live-feed.json), [`goalworld_site/src/assets/js/site.js`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/assets/js/site.js#L45-L82).
- **Concrete Fix:** Add `i18n` fields (`es: { title, blurb }`, `it: { title, blurb }`) to each item in `src/data/live-feed.json` and update `site.js` to render localized title/blurb when `document.documentElement.lang` is `es` or `it`.

---

### Phase 5 — Performance, Assets, SEO & Verification Polish (`A-043` – `A-048`)

#### `A-043` · [P2] 13 unreferenced image files (~581 KB) in `goalworld_site/src/assets/img/` are copied into `dist/` on every build
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `5`
- **Evidence:**
  - `evidence/audit/repo_static_audit.json:2521-2574`: `hero-neo-veridia-400.webp` (10.3 KB), `keyframe-console-640.webp` (15.8 KB), `keyframe-console.webp` (46.0 KB), `keyframe-skybridge-640.webp` (31.9 KB), `keyframe-skybridge.webp` (103.5 KB), `loc-earth-dawn-640.webp` (20.7 KB), `loc-earth-dawn.webp` (76.4 KB), `poster-dawn.jpg` (61.1 KB), `poster-kora.jpg` (43.7 KB), `poster-mileo.jpg` (47.4 KB), `poster-sierra.jpg` (46.7 KB), `poster-sierra.webp` (19.1 KB), `poster-trailer.jpg` (59.0 KB).
- **Concrete Fix:** Wire the 6 `keyframe-console*`, `keyframe-skybridge*`, and `loc-earth-dawn*` WebP files + `poster-sierra.webp` into the expanded `cinema.html` Visual Canon Gallery (`A-029`), wire `hero-neo-citania-400.webp` into the hero `srcset` on `index.html` and `press.html`, and archive the 5 unused `.jpg` poster duplicates (`poster-{dawn,kora,mileo,sierra,trailer}.jpg`) to `docs/archive/assets-img-20261109/`.

#### `A-044` · [P2] Lighthouse `image-delivery-insight` flags oversized `icon-512.png` (252.6 KB), `press-cover-fractured-code.jpg` (252.0 KB), and responsive `sizes` on `home` (78–98 KiB savings) and `studio` (52–81 KiB savings)
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `5`
- **Evidence:**
  - `evidence/audit/lighthouse/summary.json:40-46,111-117,422-428,476-482` and `evidence/audit/repo_static_audit.json:2576-2583`.
- **Concrete Fix:** Compress `goalworld_site/src/assets/img/icon-512.png` and `press/press-cover-fractured-code.jpg` to <100 KB without visible quality loss, and tune `sizes` and `srcset` attributes on `index.html`, `studio.html`, and `press.html` so mobile/desktop viewports select appropriately sized WebP variants.

#### `A-045` · [P2] Duplicate unoptimized Neural Wars images (`grok-*.jpg` and root `.jpg` duplicates) in `goalchain_webapp/public/assets/img/neuralwars/`
- **Severity:** `P2` · **Effort:** `M` · **Phase:** `5`
- **Evidence:**
  - `evidence/audit/repo_static_audit.json:2596-2779`: identical 698.2 KB `Book 1` cover stored 3 times (`01_Covers/The_Neural_Wars_Book_1_Fractured_Code_Cover.jpg`, `book1_cover_fractured_code.jpg`, `grok-9c92102b-74ad-4d11-927f-6da39a66a51f.jpg`); identical 744.4 KB `Mileo Chen` portrait stored 3 times; `Keyframe_09_The_432Hz_Core_Pulse_Awakening_Climax.jpg` is 1,263.6 KB.
- **Concrete Fix:** Move unreferenced duplicate `grok-*` files in `goalchain_webapp/public/assets/img/neuralwars/` to `docs/archive/neuralwars-dups-20261109/`, compress remaining JPEGs > 400 KB, and alias `432Hz` / `Neo_Veridia` image paths to clean canonical names.

#### `A-046` · [P2] Lighthouse `lcp-discovery-insight` scores `0` on `cinema.html` (mobile & desktop) due to missing hero poster preload
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `5`
- **Evidence:**
  - `evidence/audit/lighthouse/summary.json:298-304,344-350`, [`goalworld_site/src/pages/cinema.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/cinema.html#L1) (`"preload": ""`).
- **Concrete Fix:** Add `<link rel="preload" as="image" href="/assets/img/poster-trailer.webp" fetchpriority="high" />` to the meta `preload` header in `goalworld_site/src/pages/cinema.html:1`.

#### `A-047` · [P2] `goalchain_webapp/index.html` lacks `<link rel="canonical">`, `<meta name="theme-color">`, `og:image:alt`, `WebApplication` JSON-LD, and has outdated `<title>GoalChain Dashboard | Alpha</title>`
- **Severity:** `P2` · **Effort:** `S` · **Phase:** `5`
- **Evidence:**
  - [`goalchain_webapp/index.html`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/index.html#L1-L27), `evidence/audit/live_crawl.json`.
- **Concrete Fix:** Add `<link rel="canonical" href="https://play.goalworld.fun/" />`, `<meta name="theme-color" content="#0a0b0e" />`, `<meta property="og:image:alt" ... />`, `WebApplication` JSON-LD structured data, and update `<title>` to `"GoalWorld Matchday Lab · GoalChain Play (Solana Devnet)"` in `goalchain_webapp/index.html`.

#### `A-048` · [P3] `goalworld_site/tools/check_links.py` does not verify `hreflang` alternates, `/es/` and `/it/` localized output trees, or Atom/JSON feeds
- **Severity:** `P3` · **Effort:** `S` · **Phase:** `5`
- **Evidence:**
  - [`goalworld_site/tools/check_links.py`](file:///workspace/goalworld-site-overhaul/goalworld_site/tools/check_links.py).
- **Concrete Fix:** Extend `goalworld_site/tools/check_links.py` to crawl all generated HTML files in `dist/`, `dist/es/`, and `dist/it/`, verify that every `<link rel="alternate" hreflang="...">` and feed link resolves, and fail on any broken internal link or anchor across all 3 locales.
