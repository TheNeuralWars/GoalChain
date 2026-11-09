# GoalWorld Surface & Route Inventory (`AUDIT_MAP.md`)

**Date:** 2026-11-09  
**Branch:** `feat/site-overhaul-20261109`  
**Phase:** 0 (`A-systematic` audit)  
**Evidence:** [`live_crawl.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/live_crawl.json), [`repo_static_audit.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/audit/repo_static_audit.json)

---

## 1. Primary Hub — `goalworld.fun` (`goalworld_site/`)

Built via [`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs) from [`goalworld_site/src/layout.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/layout.html) + [`goalworld_site/src/pages/*.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/). Each non-index page generates both `dist/<slug>.html` and an extensionless directory mirror `dist/<slug>/index.html`.

| Route (Canonical & Mirror) | Source File | Live HTTP | Purpose | Status (`keep` / `merge` / `archive` / `redirect`) | Phase 1–5 Action Notes |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `/` (`/index.html`) | `goalworld_site/src/pages/index.html` | `200` | Editorial franchise hub: Canon + Code + Cinema overview, 4-card bento grid, Book 1 preview, Cinema teaser, Matchday Lab entry, live board & roadmap bands. | **keep** | Fix heading skip (`h1 -> h3` in bento grid at `index.html:28`), fix `#book2` link label (`index.html:18`), rename `hero-neo-veridia.webp` filename (`index.html:1,4`), add `hreflang` (`en`/`es`/`it`). |
| `/book.html` (`/book/`) | `goalworld_site/src/pages/book.html` | `200` | *Fractured Code* Book 1 page: blurb, working cover art, inline Chapter 1 reader stub (`#sample`), saga ladder (Book 1 *Fractured Code*, Book 2 *Earth's New Song*, Book 3 *Evolution Matrix*). | **keep** | Replace 9-paragraph Chapter 1 teaser stub with full canonical Chapter 1 sample (`TODO(nico)` until G2-signed text is supplied) + add rich arc/dossier/glossary sections; add `hreflang` + `/es/`, `/it/` localized versions. |
| `/cinema.html` (`/cinema/`) | `goalworld_site/src/pages/cinema.html` | `200` | AI Cinema showcase: official trailer + 3 film-draft clips (`Clip_03`, `Clip_08`, `Clip_11`), 6-step "Canon in. Cinema out." pipeline, festival holdback notice. | **keep** | Alias/rename `Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4` (`cinema.html:27`, `index.html:134`); expand with filterable keyframe gallery; ensure visible "AI-generated / Film draft" badge across all locales. |
| `/studio.html` (`/studio/`) | `goalworld_site/src/pages/studio.html` | `200` | GoalWorld Studio page: Case Study #1 (*Fractured Code* draft → book), Living Canon (`Director → CanonGuard → Repair`), studio slate (*The Neural Wars*, *Aethelgard*, *AeroOlympus*), author cohort notice. | **keep** | Expand Living Canon interactive walkthrough & slate cards; localize to `/es/` and `/it/`. |
| `/collect.html` (`/collect/`) | `goalworld_site/src/pages/collect.html` | `200` | Collectors & creators provenance manifesto ("Nothing to buy today. No token sale. No yield. No promises."), 3-step roadmap (Disclose → Sign → Collector editions), Matchday Lab Devnet CTA. | **keep** | Align terminology with `play.goalworld.fun` once DeFi/yield copy is purged from the Play app; localize to `/es/` and `/it/`. |
| `/live.html` (`/live/`) | `goalworld_site/src/pages/live.html` | `200` | Runtime project board populated from `src/data/live-feed.json` with kind/status filter chips and expandable detail cards. | **keep** | Keep `live-feed.json` honest and updated; localize static chrome & JS runtime filter strings (`site.js:39-109`) for `/es/` and `/it/`. |
| `/roadmap.html` (`/roadmap/`) | `goalworld_site/src/pages/roadmap.html` | `200` | Honest milestone board (`Live today` / `Next up` / `Later`) with stage filter chips and explicit "no dates, just direction" policy. | **keep** | Localize to `/es/` and `/it/`. |
| `/about.html` (`/about/`) | `goalworld_site/src/pages/about.html` | `200` | World lore & characters (Neo-Citania, the Link, 4 main characters, Cascade/Serpent's Coil/Gardeners, 7-book saga arc, studio FAQ accordion). | **keep** | Fix `Mileo Chen: 411 clean bills` (`about.html:57`) vs `1,724` in `FRACTURED_CODE_CANON_NOTE.md:24`; localize to `/es/` and `/it/`. |
| `/faq.html` (`/faq/`) | `goalworld_site/src/pages/faq.html` | `200` | 10-question searchable FAQ (`FAQPage` JSON-LD validated at build time) covering GoalWorld, *The Neural Wars*, Matchday Lab Devnet `$GCH` test token, wallet, film, and studio. | **keep** | Expand FAQ with Studio for authors & AI disclosure Q&As (`sitemap.md:20`); localize to `/es/` and `/it/` with matching `FAQPage` JSON-LD. |
| `/press.html` (`/press/`) | `goalworld_site/src/pages/press.html` | `200` | Media kit: one-paragraph boilerplate, fact sheet, downloadable `.zip` + SVG/PNG/JPEG brand assets, 6-still gallery, usage guidelines. | **keep** | Rename `press-hero-neo-veridia.jpg` and `hero-neo-veridia.webp` (`neo-veridia` is a banned pre-v7 city name at `press.html:57,80`); localize to `/es/` and `/it/`. |
| `/privacy.html` (`/privacy/`) | `goalworld_site/src/pages/privacy.html` | `200` | Privacy policy (GDPR/CCPA rights, analytics disclosure, local storage, contact). | **keep** | Localize to `/es/` and `/it/`. |
| `/terms.html` (`/terms/`) | `goalworld_site/src/pages/terms.html` | `200` | Terms of use (IP ownership, Devnet sandbox disclaimer, AI disclosure, liability limits). | **keep** | Localize to `/es/` and `/it/`. |
| `/404.html` | `goalworld_site/src/pages/404.html` | `200` / `404` | Custom 404 error page ("Signal lost outside Neo-Citania") with recovery cards to Home, Book, Cinema, Matchday Lab. | **keep** | Fix heading level skip (`h1 -> h3` without `h2`). |
| `/es/*`, `/it/*` | *(Missing in `goalworld_site/src/`)* | `404` | Localized Spanish (`/es/`) and Italian (`/it/`) editions of the primary hub required by `sitemap.md`. | **keep (create)** | Phase 4: extend `build.mjs` to emit `/es/*.html` and `/it/*.html` with `hreflang` tags (`en`, `es`, `it`, `x-default`) and header language switcher. |

### Agent Discovery, Feeds & Metadata Endpoints (`goalworld_site/src/`)

| Route | Source File | Live HTTP | Purpose | Status |
| :--- | :--- | :---: | :--- | :---: |
| `/robots.txt` | `goalworld_site/src/robots.txt` | `200` | Search & AI crawler directives + Sitemap pointer. | **keep** |
| `/sitemap.xml` | Generated by `goalworld_site/build.mjs` | `200` | XML sitemap for indexable canonical routes (`12 urls`). | **keep (expand with `en`/`es`/`it` in Phase 4)** |
| `/llms.txt` | `goalworld_site/src/llms.txt` | `200` | LLM-readable franchise overview & canonical route index. | **keep** |
| `/site.webmanifest` | `goalworld_site/src/site.webmanifest` | `200` | Web App Manifest (`#0a0b0e` theme/background). | **keep** |
| `/data/live-feed.json` | `goalworld_site/src/data/live-feed.json` | `200` | Raw JSON data source fetched at runtime by `/live.html` and `/` live board. | **keep** |
| `/.well-known/ard.json` | `goalworld_site/src/.well-known/ard.json` | `200` | AI Resource Discovery catalog (`application/ai-catalog+json`). | **keep** |
| `/.well-known/ai-catalog.json` | `goalworld_site/src/.well-known/ai-catalog.json` | `200` | AI catalog JSON endpoint. | **keep** |
| `/.well-known/agent-skills/goalworld-site/SKILL.md` | `goalworld_site/src/.well-known/agent-skills/goalworld-site/SKILL.md` | `200` | Agent skill markdown describing `goalworld.fun` surfaces. | **keep** |

---

## 2. Legacy `docs/` Pages Still Served HTTP 200 on `goalworld.fun`

Because [`scripts/pages/stage_public_tree.py`](file:///workspace/goalworld-site-overhaul/scripts/pages/stage_public_tree.py) copies `docs/` into `_site_public/` before [`scripts/deploy_goalworld_site.sh`](file:///workspace/goalworld-site-overhaul/scripts/deploy_goalworld_site.sh) overlays `goalworld_site/dist/`, **every non-colliding HTML file in `docs/` remains publicly accessible at HTTP 200 on `https://goalworld.fun/`**. Twelve of these pages contain severe violations of `copy_deck.md` (fake metrics, KDP published claims, USDC royalties, `$GCH` presale, `Zero Value Loss`, `Infinity Burn`, `Neo-Veridia`, `432 Hz`).

| Live Route on `goalworld.fun` | Repo Source File (`docs/`) | Live HTTP | Banned Claims Count | Purpose (Legacy) | Status (`archive` + `redirect`) | Target 301 Redirect |
| :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| `/goalworld.html` | `docs/goalworld.html` | `200` | **48** | Legacy "IP Tokenization & KDP Publishing" portal with fake USDC royalty numbers, Neo-Veridia, 432 Hz. | **archive + redirect** | `/book.html` |
| `/goalchain.html` | `docs/goalchain.html` | `200` | **29** | Legacy DeFi/Token presale landing page (`$GCH Presale`, `Zero Value Loss`, `Infinity Burn`, daily yield). | **archive + redirect** | `/collect.html` |
| `/mega-guide.html` | `docs/mega-guide.html` | `200` | **16** | Legacy Spanish/English whitepaper with KDP SaaS, staking yield, `Zero Value Loss`. | **archive + redirect** | `/faq.html` |
| `/mega-guide-v1.html` | `docs/mega-guide-v1.html` | `200` | **25** | Older whitepaper draft with KDP royalties, staking APY, `Zero Value Loss`. | **archive + redirect** | `/faq.html` |
| `/pitch.html` | `docs/pitch.html` | `200` | **4** | Legacy investor pitch deck (`Zero Value Loss`, tokenomics, missing `<h1>`, no canonical/OG). | **archive + redirect** | `/press.html` |
| `/colabs.html` | `docs/colabs.html` | `200` | **5** | Legacy partnerships/collaborations deck with `Zero Value Loss` and staking claims. | **archive + redirect** | `/studio.html` |
| `/protocol.html` | `docs/protocol.html` | `200` | **4** | Legacy protocol spec (`KDP`, `Zero Value Loss`, yield). | **archive + redirect** | `/collect.html` |
| `/tokenomics.html` | `docs/tokenomics.html` | `200` | **2** | Legacy tokenomics breakdown (`staking smart contracts`). | **archive + redirect** | `/collect.html` |
| `/agents.html` | `docs/agents.html` | `200` | **1** | Legacy agent swarm page (`Zero Value Loss`). | **archive + redirect** | `/studio.html` |
| `/reader.html` | `docs/reader.html` | `200` | **4** | Legacy standalone reader (`Preorder $2.99`, `432 Hz`, pre-v7 draft chapters). | **archive + redirect** | `/book.html#sample` |
| `/arcade.html` | `docs/arcade.html` | `200` | 0 | Legacy arcade mini-games hub. | **archive + redirect** | `https://play.goalworld.fun/estadio` |
| `/app.html` | `docs/app.html` | `200` | 0 | Legacy static dashboard prototype. | **archive + redirect** | `https://play.goalworld.fun/` |
| `/ceo.html` | `docs/ceo.html` | `200` | 0 | Legacy internal/founder console mockup (`noindex`, no `<h1>`). | **archive + redirect** | `/about.html` |
| `/legal.html` | `docs/legal.html` | `200` | 0 | Legacy combined legal disclaimer page. | **archive + redirect** | `/terms.html` |
| `/map.html` | `docs/map.html` | `200` | 0 | Legacy interactive site map (`0 <h1>`, no meta description). | **archive + redirect** | `/` |
| `/pre-nft.html` | `docs/pre-nft.html` | `200` | 0 | Legacy pre-NFT mint teaser page. | **archive + redirect** | `/collect.html` |
| `/architecture/archify/goalchain.architecture.html` | `docs/architecture/archify/goalchain.architecture.html` | `200` | **1** | 789 KB auto-generated architecture diagram HTML (`yield`). | **archive + redirect** | `/about.html` |
| `/go/` (`/go/index.html`) | `docs/go/index.html` | `200` | 0 | Meta-refresh bridge to `play.goalworld.fun`. | **redirect** | `https://play.goalworld.fun/` |
| `/go/club/` | `docs/go/club/index.html` | `200` | 0 | Meta-refresh bridge to `play.goalworld.fun/club`. | **redirect** | `https://play.goalworld.fun/club` |
| `/go/defi/` | `docs/go/defi/index.html` | `200` | 0 | Meta-refresh bridge to `play.goalworld.fun/defi` (legacy DeFi route). | **archive + redirect** | `/collect.html` |
| `/go/estadio/` | `docs/go/estadio/index.html` | `200` | 0 | Meta-refresh bridge to `play.goalworld.fun/estadio`. | **redirect** | `https://play.goalworld.fun/estadio` |
| `/go/goalworld/` | `docs/go/goalworld/index.html` | `200` | 0 | Meta-refresh bridge to `play.goalworld.fun/goalworld`. | **redirect** | `/book.html` |
| `/go/studio/` | `docs/go/studio/index.html` | `200` | 0 | Meta-refresh bridge to `play.goalworld.fun/studio`. | **redirect** | `/studio.html` |
| `/go/reader/` | `docs/go/reader/index.html` | `200` | **4** | Legacy reader copy (`Preorder $2.99`, `432 Hz`, pre-v7 draft). | **archive + redirect** | `/book.html#sample` |
| `/play/` (`/play/index.html`) | `docs/play/index.html` | `200` | 0 | Legacy static play hub (`0 <h1>`). | **archive + redirect** | `https://play.goalworld.fun/` |
| `/play/pack.html` | `docs/play/pack.html` | `200` | 0 | Legacy static pack opener demo (`0 <h1>`). | **archive + redirect** | `https://play.goalworld.fun/estadio` |
| `/play/penalty.html` | `docs/play/penalty.html` | `200` | 0 | Legacy static penalty shootout demo (`0 <h1>`). | **archive + redirect** | `https://play.goalworld.fun/estadio` |

*(Note: `docs/index.html`, `docs/book.html`, `docs/cinema.html`, `docs/studio.html`, and `docs/live.html` are overwritten by `goalworld_site/dist/` during build staging, but their stale copies in `docs/` still contain banned claims in git and should be archived or replaced by clean stubs.)*

---

## 3. Sub-Sites on `goalworld.fun` (Read-Only Audit)

| Route | Source / Origin | Live HTTP | Purpose | Status | Audit Findings |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `/blast-radius/` | VPS static sub-site (hackathon/security tool demo) | `200` | **BlastRadius** — Solana dependency & authority blast-radius analyzer (`blast-radius`). | **keep (sub-site)** | Missing `<link rel="canonical">`, `og:title`, `og:description`, `og:image`, `og:url`, and `<footer>` landmark (`live_crawl.json`). |
| `/hermes-demo/` | VPS reverse-proxied app (`hermes/` demo surface) | `200` | **Hermes Guarded Execution Demo** — Autonomous agent policy/guardrail console (`REVIEW: approved`). | **keep (sub-site)** | Missing `<link rel="canonical">` and OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`). Contains an email address rewritten by Cloudflare Email Obfuscation to `/cdn-cgi/l/email-protection` (returns HTTP 404 when crawled directly). |
| `/hermes-demo/proof` | VPS reverse-proxied route | `200` | Hermes execution proof verification view. | **keep (sub-site)** | Missing canonical & OG tags (`live_crawl.json`). |
| `/go/reader/` | `docs/go/reader/index.html` | `200` | Legacy standalone book reader with pre-v7 draft chapters, `432 Hz` audio toggle, and `Preorder $2.99` CTA. | **archive + redirect** | Redirect to `/book.html#sample` once canonical Chapter 1 sample is in place; replace pre-v7 text. |

---

## 4. Interactive Webapp — `play.goalworld.fun` (`goalchain_webapp/`)

Built with Vite + React 18 + TypeScript. Routes are defined in [`goalchain_webapp/src/ui/App.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/App.tsx#L106-L210) and navigation in [`goalchain_webapp/src/config/playNav.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/config/playNav.ts#L77-L304).

| Route (`play.goalworld.fun`) | Source Component (`goalchain_webapp/src/ui/`) | Live HTTP | Purpose | Status (`keep` / `merge` / `archive` / `redirect`) | Audit Findings & Phase 1–5 Action Notes |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `/` | `LandingPage.tsx` (`App.tsx:108`) | `200` | Matchday Lab landing page (hero, 3-step guide, quick nav). | **keep (overhaul)** | **P0 Honesty:** Remove `"Football Meets DeFi — Stake, Play, Earn"` (`LandingPage.tsx:37,47,67`). **P1 Design/i18n:** Replace `#00ffcc` / `#9945ff` neon gradient with GoalWorld `#0a0b0e` + `#e5a93c` amber + `#3b82f6` cobalt; localize hardcoded English strings (`en`/`es`/`it`). |
| `/dashboard` | `DashboardGrid.tsx` (`App.tsx:112`) | `200` | Main Matchday Lab console (Solana Devnet wallet balance, matchday cards, quick access). | **keep** | Scrub `/staking` quick-access card (`DashboardGrid.tsx:90`); fix duplicate `<h1>` (`PlayPage` + inner view); unify tokens (`tokens.css`); add `it` locale. |
| `/estadio` | `EstadioPortal.tsx` (`App.tsx:120`) | `200` | Matchday hub: `FixturesPanel.tsx`, `MatchSimulator.tsx`, `WorldCupPredictor.tsx`, `AICommentator.tsx`. | **keep** | Scrub `"staking"` in `WorldCupPredictor.tsx:490`; localize `MatchSimulator.tsx` (782 LOC, 0 `t()` calls) and `WorldCupPredictor.tsx` (558 LOC, 0 `t()` calls); fix duplicate `<h1>`. |
| `/club` | `ClubPortal.tsx` (`App.tsx:136`) | `200` | Squad Builder (`SquadGallery.tsx`), Card Market (`NFTMarketplace.tsx`), `UserProfile.tsx`. | **keep** | **P0 IP/Likeness & Banned Claims:** Scrub real-player/yield/staking puns in `public/assets/data/players.json` & `nft_gallery_manifest.json` (`Alexis Yield-Allister`, `Eduardo Cama-Yield`, `Dayot Upa-Staking`, etc.) and `LayeredNftCard.tsx:209-210`. Localize `SquadGallery.tsx` (504 LOC, 0 `t()` calls). |
| `/goalworld` | `GoalWorldPortal.tsx` (`App.tsx:144`) | `200` | In-app Lore & Book portal (919 LOC). | **merge / overhaul** | **P0 Honesty & Canon:** Contains 15 banned hits (`Neo-Veridia`, `432 Hz`, `Convergence Protocol`, `Amazon KDP`, Publisher SaaS) at `GoalWorldPortal.tsx:67-426`. Overhaul to match canonical `goalworld.fun/book.html` lore and honest Devnet sandbox perks. |
| `/reader`, `/reader/:bookId`, `/read` | `KindleReader.tsx` + `booksData.ts` (`App.tsx:205-207`) | `200` | In-app interactive chapter reader (1,325 LOC). | **keep (overhaul data)** | **P0 Canon:** `booksData.ts` has 82 hits for `432 Hz` and outdated pre-v7 draft chapters (`setenta y cuatro`, `432 Hz Solfeggio`). `KindleReader.tsx:125,736,1024-1044` has a `432 Hz` Solfeggio generator. Replace with canonical v7 Chapter 1 sample and remove `432 Hz`. |
| `/studio`, `/editorial` | `AuthorStudio.tsx` (`App.tsx:208-209`) | `200` | In-app creator/studio sandbox (314 LOC). | **keep (overhaul copy)** | Align with GoalWorld AI Film & Editorial Studio (`goalworld.fun/studio.html`); wire to `useTranslation()` (currently 0 `t()` calls). |
| `/defi` | `DeFiPortal.tsx` + `TradingTerminal.tsx` + `SwarmVaults.tsx` (`App.tsx:128`) | `200` | Legacy DeFi / Swarm Yield Vaults / Trading portal. | **overhaul / rename** | **P0 Honesty:** Scrub `"Swarm Yield Vaults"` (`DeFiPortal.tsx:52`), `"Treasury Yield"` (`SwarmVaults.tsx:30,50`), and `"High-yield leveraged speculation"` (`VaultStrategyCard.tsx:38`). Reframe as an explicitly labelled **Devnet Matchday Telemetry & Strategy Sandbox (Simulated, Zero Monetary Value)**. |
| `/staking` | `StakingBurnDashboard.tsx` + `YieldCalculator.tsx` + `InfinityFlame.tsx` (`App.tsx:153`) | `200` | Legacy `"Infinity Burn & Staking Dashboard"` with interactive yield calculator. | **archive / redirect** | **P0 Honesty:** 36 combined banned hits (`Infinity Burn`, `YieldCalculator`, `staking yield projections`) across `StakingBurnDashboard.tsx:89-167`, `YieldCalculator.tsx:138-281`, `InfinityFlame.tsx:320`. Remove from `playNav.ts` and redirect `/staking` → `/club` or Devnet telemetry view with zero yield/burn claims. |
| `/marketing-control` | `MarketingControlCenter.tsx` (`App.tsx:163`) | `200` | Internal Hermes marketing console mockup (802 LOC, 0 `t()` calls). | **archive / gate** | Gate behind dev/ops notice or redirect to `/dashboard`; localize or mark as internal simulation. |
| `/autopilot` | `CorporateAutopilot.tsx` (`App.tsx:171`) | `200` | Autonomous agent simulation console (1,201 LOC). | **keep (overhaul copy)** | Scrub `"Dynamic Staking Yield Dashboard"` log at `CorporateAutopilot.tsx:476`; label clearly as agent simulation demo. |
| `/agents` | `TokenizedAgentsDashboard.tsx` (`App.tsx:179`) | `200` | Autonomous agent roster & telemetry view (131 LOC). | **keep (overhaul copy)** | Rename from `"Tokenized Agents"` to `"Studio & Matchday Agents"` (no agent tokenization claims); complete i18n (currently only 2 `t()` calls). |
| `/presskit` | `PressKit.tsx` (`App.tsx:187`) | `200` | In-app creator & press kit (392 LOC, 0 `t()` calls). | **merge / overhaul** | Align with canonical `https://goalworld.fun/press.html` assets and boilerplate; wire to `useTranslation()`. |
| `/coleccion` | `GenesisCollectionGallery.tsx` (`App.tsx:195`) | `200` | Genesis Squad card gallery (132 LOC, 0 `t()` calls). | **keep** | Scrub banned player names from underlying manifest and localize UI strings (`en`/`es`/`it`). |
| `/hub` | `ClassicHub.tsx` (`App.tsx:202`) | `200` | Quick-router hub to app modules. | **keep** | Remove `/staking` tile (`ClassicHub.tsx:16`). |
| `/crear-usuario` | `CreateUser.tsx` (`App.tsx:203`) | `200` | Wallet-gated manager profile registration. | **keep** | Add `it` locale translations; keep `/create-user` English alias. |
| `/perfil/:username` | `UserProfile.tsx` (`App.tsx:204`) | `200` | Wallet-gated manager profile & squad view. | **keep** | Add `it` locale translations. |
| `/classic-dashboard.html` | `goalchain_webapp/public/classic-dashboard.html` | `200` | Legacy 1,800-line static HTML dashboard inside `public/` (18 banned hits: `Daily Yield`, `JitoSOL +12% APR`, `Yield Airdrop`). | **archive + redirect** | Move full legacy file to `archive/` and replace `public/classic-dashboard.html` with a clean redirect stub to `/dashboard` (zero banned claims). |
