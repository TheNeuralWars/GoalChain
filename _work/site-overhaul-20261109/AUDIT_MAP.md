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
| `/` (`/index.html`) | `goalworld_site/src/pages/index.html` | `200` | Editorial franchise hub: Canon + Code + Cinema overview, live status strip, bento grid, Book 1 preview, Cinema teaser, Matchday Lab entry, newsletter. | **keep** | Fix heading skip (`h1 -> h3` in bento grid), fix `#book2` link label (`index.html:18`), add `hreflang` (`en`/`es`/`it`). |
| `/book.html` (`/book/`) | `goalworld_site/src/pages/book.html` | `200` | *Fractured Code* Book 1 dossier, synopsis, 16-chapter arc breakdown, inline Chapter 1 reader stub, characters, world glossary, Book 2 (*Echoes of the Link*) & Book 3 (*The Sovereign Pitch*). | **keep** | Replace 6-paragraph Chapter 1 teaser stub with full canonical Chapter 1 sample (`TODO(nico)` if text not yet supplied); add `hreflang` + `/es/`, `/it/` localized versions. |
| `/cinema.html` (`/cinema/`) | `goalworld_site/src/pages/cinema.html` | `200` | AI Cinema showcase: 6 R2-hosted production reels (`Clip_01`, `Clip_03`, `Clip_08`, `Clip_12`, `Clip_14`, `Clip_22`), filterable keyframe gallery, human-directed pipeline transparency. | **keep** | Rename R2 video reference once `Clip_08` is re-uploaded without `432Hz` in filename; ensure visible "Made with AI" badge across all locales. |
| `/studio.html` (`/studio/`) | `goalworld_site/src/pages/studio.html` | `200` | GoalWorld AI Film & Editorial Studio services: 4-stage pipeline, capability packages, portfolio clips, production inquiry form (`mailto:nico@goalworld.fun`). | **keep** | Localize to `/es/` and `/it/`; verify form accessibility and `mailto:` fallback clarity. |
| `/collect.html` (`/collect/`) | `goalworld_site/src/pages/collect.html` | `200` | Matchday Lab (Solana Devnet) overview: how the free sandbox works, devnet guardrails ("No presale, no token sale, no yield"), entry CTA to `play.goalworld.fun`. | **keep** | Align terminology with `play.goalworld.fun` once DeFi/yield copy is purged from the Play app. |
| `/live.html` (`/live/`) | `goalworld_site/src/pages/live.html` | `200` | Public Build Log & Activity Feed populated from `src/data/live-feed.json`, RSS/JSON feed links, system surface status table. | **keep** | Keep `live-feed.json` honest and updated; localize static chrome for `/es/` and `/it/`. |
| `/roadmap.html` (`/roadmap/`) | `goalworld_site/src/pages/roadmap.html` | `200` | Honest milestone board (`Live today` vs `In production` vs `Planned` vs `Explicitly NOT doing`), explicit "No timeline promises" policy. | **keep** | Localize to `/es/` and `/it/`. |
| `/about.html` (`/about/`) | `goalworld_site/src/pages/about.html` | `200` | Franchise thesis, founder bio (Nicolás / `@nicopez`), open repo links, AI disclosure, contact details. | **keep** | Localize to `/es/` and `/it/`. |
| `/faq.html` (`/faq/`) | `goalworld_site/src/pages/faq.html` | `200` | 15-question FAQ across General, Book & Lore, Cinema & Studio, Matchday Lab & Devnet, Legal & Privacy (`FAQPage` JSON-LD). | **keep** | Localize to `/es/` and `/it/` with matching `FAQPage` JSON-LD. |
| `/press.html` (`/press/`) | `goalworld_site/src/pages/press.html` | `200` | Media kit: 60-word & 150-word bios, fact sheet, approved visual assets, brand palette tokens, citation rules. | **keep** | Rename `press-hero-neo-veridia.jpg` asset filename (`neo-veridia` is a banned pre-v7 city name); localize to `/es/` and `/it/`. |
| `/privacy.html` (`/privacy/`) | `goalworld_site/src/pages/privacy.html` | `200` | Privacy policy (GDPR/CCPA rights, analytics disclosure, local storage, contact). | **keep** | Localize to `/es/` and `/it/`. |
| `/terms.html` (`/terms/`) | `goalworld_site/src/pages/terms.html` | `200` | Terms of use (IP ownership, Devnet sandbox disclaimer, AI disclosure, liability limits). | **keep** | Localize to `/es/` and `/it/`. |
| `/404.html` | `goalworld_site/src/pages/404.html` | `200` / `404` | Custom 404 error page ("Signal lost outside Neo-Citania") with recovery cards to Home, Book, Cinema, Matchday Lab. | **keep** | Fix heading level skip (`h1 -> h3` without `h2`). |
| `/es/*`, `/it/*` | *(Missing in `goalworld_site/src/`)* | `404` | Localized Spanish (`/es/`) and Italian (`/it/`) editions of the primary hub required by `sitemap.md`. | **keep (create)** | Phase 4: extend `build.mjs` to emit `/es/*.html` and `/it/*.html` with `hreflang` tags (`en`, `es`, `it`, `x-default`) and header language switcher. |

### Agent Discovery, Feeds & Metadata Endpoints (`goalworld_site/src/`)

| Route | Source File | Live HTTP | Purpose | Status |
| :--- | :--- | :---: | :--- | :---: |
| `/robots.txt` | `goalworld_site/src/robots.txt` | `200` | Search & AI crawler directives + Sitemap pointer. | **keep** |
| `/sitemap.xml` | `goalworld_site/src/sitemap.xml` (auto-updated by `build.mjs`) | `200` | XML sitemap for indexable canonical routes. | **keep** |
| `/llms.txt` | `goalworld_site/src/llms.txt` | `200` | LLM-readable franchise overview & canonical route index. | **keep** |
| `/feed.xml` | `goalworld_site/src/feed.xml` (generated by `build.mjs`) | `200` | Atom feed generated from `src/data/live-feed.json`. | **keep** |
| `/feed.json` | `goalworld_site/src/feed.json` (generated by `build.mjs`) | `200` | JSON Feed 1.1 generated from `src/data/live-feed.json`. | **keep** |
| `/assets/data/live-feed.json` | `goalworld_site/src/data/live-feed.json` | `200` | Raw JSON data source for `/live.html` and home ticker. | **keep** |
| `/.well-known/api-catalog` | `goalworld_site/src/.well-known/api-catalog` | `200` | RFC 9727 linkset+json API catalog. | **keep** |
| `/.well-known/mcp/server-card.json` | `goalworld_site/src/.well-known/mcp/server-card.json` | `200` | MCP server discovery card. | **keep** |
| `/.well-known/agent-skills/index.json` | `goalworld_site/src/.well-known/agent-skills/index.json` | `200` | Agent skills index for `goalworld.fun`. | **keep** |
| `/.well-known/agent-skills/goalworld-overview/SKILL.md` | `goalworld_site/src/.well-known/agent-skills/goalworld-overview/SKILL.md` | `200` | Agent skill markdown describing GoalWorld surfaces. | **keep** |

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

Built with Vite + React 18 + TypeScript. Routes are defined in [`goalchain_webapp/src/ui/App.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/App.tsx) and navigation in [`goalchain_webapp/src/config/playNav.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/config/playNav.ts).

| Route (`play.goalworld.fun`) | Source Component (`goalchain_webapp/src/ui/`) | Live HTTP | Purpose | Status (`keep` / `merge` / `archive` / `redirect`) | Audit Findings & Phase 1–5 Action Notes |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `/` | `LandingPage.tsx` | `200` | Matchday Lab landing page (hero, 3-step guide, live activity, world grid, resources). | **keep** | **P0 Honesty:** Remove `"Football Meets DeFi — Stake, Play, Earn"` (`LandingPage.tsx:37,47,66`). **P1 Broken links:** Fix `playNav.ts` links to `/#economics`, `/pitch.html`, `/mega-guide.html`, `/colabs.html`, `/legal.html`, `/map.html`, `/goalchain.html`. **P2 i18n:** Localize hardcoded English strings (`en`/`es`/`it`). |
| `/dashboard` | `DashboardHome.tsx` + `App.tsx` | `200` | Main Matchday Lab console (Solana Devnet wallet balance, matchday cards, onboarding steps). | **keep** | Unify design tokens (`tokens.css` neon green `#14f195` → GoalWorld amber `#e5a93c` + obsidian `#0a0b0e`); add `it` locale. |
| `/estadio` | `EstadioHub.tsx` (`MatchSimulator.tsx`, `WorldCupPredictor.tsx`, `ArcadeHub.tsx`, `PackOpener.tsx`) | `200` | Matchday hub: Match Simulator, Fixture Predictor, Pack Opener, Penalty Shootout. | **keep** | Localize `MatchSimulator.tsx` and `WorldCupPredictor.tsx` (currently 0 `t()` calls, hardcoded Spanish/English mix). |
| `/club` | `ClubHub.tsx` (`SquadGallery.tsx`, `SwapWidget.tsx`, `TradingTerminal.tsx`, `CrossPollinationHub.tsx`) | `200` | Squad Builder, Devnet Swap Sandbox, Card Market, Lore Perks. | **keep** | **P0 IP/Likeness:** Scrub real-player puns in `public/assets/data/players.json` & `nft_gallery_manifest.json` (`Lionel Satoshi`, `Alexis Yield-Allister`, etc.). Localize `SquadGallery.tsx` & `TradingTerminal.tsx`. |
| `/goalworld` | `GoalWorldPortal.tsx` | `200` | In-app Lore & Book portal. | **merge / overhaul** | **P0 Honesty & Canon:** Contains fabricated metrics (`18,450 subscribers`, `$34,890 USDC`), fake KDP Published status, `Neo-Veridia`, `432 Hz`, `Convergence Protocol`, `17 chapters`. Overhaul to match canonical `goalworld.fun/book.html` lore and honest Devnet perks. |
| `/reader` | `KindleReader.tsx` + `booksData.ts` | `200` | In-app interactive chapter reader. | **keep (overhaul data)** | **P0 Canon:** `booksData.ts` has 82 hits for `432 Hz` and outdated pre-v7 draft chapters (`treinta días`, `noventa y tres días`). `KindleReader.tsx` has a `432 Hz` Solfeggio generator. Replace with canonical v7 Chapter 1 sample and remove `432 Hz`. |
| `/neural-wars` | `TheNeuralWarsUniverse.tsx` | `200` | Interactive *The Neural Wars* lore encyclopedia. | **keep (overhaul canon)** | **P0 Canon:** 25 hits for `Neo-Veridia` and `432 Hz` (`TheNeuralWarsUniverse.tsx:42-315`). Replace with canonical `Neo-Citania`, `the Link`, `Kora Vega`, `Echoes of the Link`, `The Sovereign Pitch`. |
| `/studio` | `AuthorStudio.tsx` | `200` | In-app creator/studio sandbox. | **keep (overhaul copy)** | Remove KDP publishing/royalty framing (`AuthorStudio.tsx:243,294`); align with GoalWorld AI Film & Editorial Studio + Devnet sandbox. |
| `/defi` | `DeFiPortal.tsx` (`StakingBurnDashboard.tsx`, `YieldCalculator.tsx`, `InfinityFlame.tsx`, `SwarmVaults.tsx`) | `200` | Legacy DeFi / Staking / Yield / Infinity Burn portal (`hiddenInProd` in nav, but route still live at `/defi`). | **archive / redirect** | **P0 Honesty:** Contains `Infinity Burn`, `YieldCalculator`, `Liquid Staking (Jito/mSOL)`, APY claims. Redirect `/defi` to `/club` or convert into an explicitly labelled "Devnet Protocol Mechanics Sandbox (Simulated, Zero Monetary Value)" with all yield/APY/burn language removed. |
| `/vaults` | `App.tsx` (`<Navigate to="/defi?tab=vaults" replace />`) | `200` | Redirect alias to `/defi?tab=vaults`. | **redirect** | Redirect to `/club` or Devnet sandbox. |
| `/swap` | `App.tsx` (`<Navigate to="/club?tab=swap" replace />`) | `200` | Redirect alias to `/club?tab=swap`. | **keep (redirect)** | Clean internal redirect. |
| `/market` | `App.tsx` (`<Navigate to="/club?tab=market" replace />`) | `200` | Redirect alias to `/club?tab=market`. | **keep (redirect)** | Clean internal redirect. |
| `/cross-pollination` | `App.tsx` (`<Navigate to="/club?tab=perks" replace />`) | `200` | Redirect alias to `/club?tab=perks`. | **keep (redirect)** | Clean internal redirect. |
| `/simulator` | `App.tsx` (`<Navigate to="/estadio?tab=simulator" replace />`) | `200` | Redirect alias to `/estadio?tab=simulator`. | **keep (redirect)** | Clean internal redirect. |
| `/mundial` | `App.tsx` (`<Navigate to="/estadio?tab=mundial" replace />`) | `200` | Redirect alias to `/estadio?tab=mundial`. | **keep (redirect)** | Clean internal redirect. |
| `/arcade` | `App.tsx` (`<Navigate to="/estadio?tab=arcade" replace />`) | `200` | Redirect alias to `/estadio?tab=arcade`. | **keep (redirect)** | Clean internal redirect. |
| `/packs` | `App.tsx` (`<Navigate to="/estadio?tab=packs" replace />`) | `200` | Redirect alias to `/estadio?tab=packs`. | **keep (redirect)** | Clean internal redirect. |
| `/press` | `PressKit.tsx` (`hiddenInProd`) | `200` | Legacy in-app press kit (`Zero Value Loss` claim at line 153). | **redirect / merge** | Scrub `Zero Value Loss` and link directly to canonical `https://goalworld.fun/press.html`. |
| `/ops` | `OpsHub.tsx` (`MarketingControlCenter.tsx`, `ColabsPortal.tsx`, `AgentOpsCenter.tsx`, `PlayerQuorumPanel.tsx`) (`hiddenInProd`) | `200` | Internal ops mockups (`hiddenInProd`). | **archive / gate** | Scrub `Zero Value Loss` in `ColabsPortal.tsx:104`; clearly mark as offline simulation or redirect to `/dashboard`. |
| `/classic-dashboard.html` | `goalchain_webapp/public/classic-dashboard.html` | `200` | Legacy static HTML dashboard inside `public/`. | **archive + redirect** | Archive to `archive/` and redirect to `/dashboard`. |
