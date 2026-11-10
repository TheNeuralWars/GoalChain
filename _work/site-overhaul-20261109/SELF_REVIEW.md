# GoalWorld Site Overhaul — Phase 6 Harsh Self-Review (`QUALITY_BAR` + `RULES §20`)

- **Branch:** `feat/site-overhaul-20261109` (vs `origin/main`)
- **Date:** 2026-11-10
- **Reviewer:** Lead Product Engineer + Design Director (Autonomous Self-Review Gate)
- **Initial Audit Verdict (Pre-Fix):** `FAIL` (2 × `P0`, 2 × `P1`, 2 × `P2`, 2 × `P3` discovered during full-diff + runtime inspection)
- **Final Verdict (Post-Fix & Re-Verification):** **`PASS`** (All `P0`, `P1`, and `P2` findings resolved and verified by `npm run qa`; only 2 external/author-gated `P3` items remain under `TODO(nico)`)

---

## 1. Numbered Findings (`file:line`, Severity `P0`–`P3`, Concrete Fix)

### `F-01` · **[P0 — FIXED]** Root `README.md` and `goalworld_site/README.md` retained banned DeFi claims and outdated architecture descriptions
- **Locations:**
  - [`README.md`](file:///workspace/goalworld-site-overhaul/README.md#L1-L42) (`lines 1–42` pre-fix)
  - [`goalworld_site/README.md`](file:///workspace/goalworld-site-overhaul/goalworld_site/README.md#L1-L70) (`lines 12–13, 60–64` pre-fix)
  - [`goalchain_webapp/README.md`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/README.md#L1-L58) (missing pre-fix)
  - [`_work/site-overhaul-20261109/tools/scan_repo_audit.py`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/tools/scan_repo_audit.py#L182-L194)
- **Problem:** Root `README.md:5-18` still pitched retired DeFi claims (`"Zero Value Loss"`, `"Real Yield"`, `"100% of NFT sales revenue is deposited into Liquid Staking protocols (JitoSOL, mSOL)"`, `"buy back and burn $GCH from the market"`, `"528 real football players"`), violating `QUALITY_BAR.md` §3 (*"README/docs que un jurado entiende en 30s"*) and §5 (*"Honestidad"*). Meanwhile, `goalworld_site/README.md:12-13` still described `"Solana neons"` and `"nav toggle only"`, and `goalchain_webapp/README.md` did not exist.
- **Concrete Fix Applied:**
  1. Rewrote [`README.md`](file:///workspace/goalworld-site-overhaul/README.md#L1-L68) as a 30-second juror guide covering **GoalWorld — Canon. Code. Cinema.**, local preview commands, repository architecture map, Devnet/canon/AI-disclosure guardrails, and documentation index.
  2. Updated [`goalworld_site/README.md`](file:///workspace/goalworld-site-overhaul/goalworld_site/README.md#L1-L68) to document `design/tokens.json`, `COMPONENTS.md`, trilingual `EN`/`ES`/`IT` output (`84` HTML routes), `feed.xml`/`feed.json`, and the canonical `MANUSCRIPT_v7` Chapter 1 excerpt on `/book.html#sample`.
  3. Created [`goalchain_webapp/README.md`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/README.md#L1-L58) documenting Matchday Lab (`play.goalworld.fun`), shared `PlayLayout` shell, `914` trilingual i18n keys, route table, and verification scripts.
  4. Extended [`scan_repo_audit.py`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/tools/scan_repo_audit.py#L182-L194) to scan root `README.md` and `goalworld_site/README.md` for banned claims.

### `F-02` · **[P0 — FIXED]** Residual banned IP-tokenization/Mainnet claims, 432 Hz Web Audio oscillator, fake email-capture modal, and pre-v7 timeline years in `TheNeuralWarsUniverse.tsx` & `GoalWorldPortal.tsx`
- **Locations:**
  - [`goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx#L77-L225) (`lines 77–137, 215` pre-fix)
  - [`goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx#L736-L760) (`lines 750–764` pre-fix)
  - [`goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx#L1017-L1245) (`lines 1029–1364` pre-fix)
  - [`goalchain_webapp/src/ui/GoalWorldPortal.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/GoalWorldPortal.tsx#L67-L210) (`lines 67, 127, 137, 169, 177, 185, 207` pre-fix)
- **Problem:**
  - `TheNeuralWarsUniverse.tsx:215` synthesized a `432` Hz oscillator instead of the canonical `528` Hz frequency (`FRACTURED_CODE_CANON_NOTE.md`).
  - `TheNeuralWarsUniverse.tsx:757` rendered a `<video>` element without `preload="none"`, `aria-label`, or a visible `"Made with AI"` disclosure caption.
  - `TheNeuralWarsUniverse.tsx:1029-1047` used pre-v7 timeline years (`2064`, `2079`, `2088 (Libro 1)`, `2092 (Libro 2)`) instead of the canonical timeline (`300,000 BCE` Serpent's Coil, `2088` Link launch, `2102` Dr. Elena Vásquez absorbed, `2130` Neo-Citania founded, `2148` Book 1 *Fractured Code* 20-day countdown to *Project Renaissance*).
  - `TheNeuralWarsUniverse.tsx:1135,1140` claimed `"propiedad intelectual tokenizada sobre Solana donde los lectores son co-propietarios de la saga"` and `"Ubicación: Global / Solana Mainnet"`.
  - `TheNeuralWarsUniverse.tsx:1160-1364` listed unconfirmed retail storefronts (`Kindle`, `Audible`, `Apple Books & Google Play`), linked to broken `/go/play` with `"Mintear en GoalWorld ➔"`, and opened a fake email-capture modal (`handleNotifySubmit`) that claimed `"✨ ¡Registrado con éxito!"` without persisting anything.
  - `GoalWorldPortal.tsx:67` cited year `2045` and removed character `David`, and lines `127/137/169/177/185` displayed `SOL` amounts without `(Devnet Test)` labels.
- **Concrete Fix Applied:**
  1. Set Web Audio oscillator frequency to `528` Hz in [`TheNeuralWarsUniverse.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TheNeuralWarsUniverse.tsx#L214), added `preload="none"`, `aria-label`, and visible `"MADE WITH AI · AI-generated film draft"` disclosure on the `<video>` element (`lines 736–756`), updated `CHARACTERS` (`Marcus Vance`, `The Elder`, `Aria`) and the Lore timeline (`300,000 BCE`, `2088`, `2102`, `2130`, `2148`), scrubbed the IP co-ownership and Mainnet claims in the Author tab, and replaced the unconfirmed storefront cards + fake email modal with honest edition status cards linking to `getLocalizedMarketingUrl('/book.html#sample', language)`, `getLocalizedMarketingUrl('/collect.html', language)`, and `https://x.com/nicopez`.
  2. Updated [`GoalWorldPortal.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/GoalWorldPortal.tsx#L67-L208) to cite `2148`, `Kora Vega`, `Mileo Chen`, and `528 Hz`, appended `(Devnet Test)` to all mock `SOL` values, and renamed `kdpAutoPublish` state to `epubDraftPack`.

### `F-03` · **[P1 — FIXED]** `booksData.ts` & `KindleReader.tsx` had pre-v7 excerpt text (`2045`, `"Twelve Seconds"`), missing Italian (`it`) chapter pack & Book 3, `432` Hz default, and nested `<main>` landmark
- **Locations:**
  - [`goalchain_webapp/src/ui/booksData.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/booksData.ts#L1-L266)
  - [`goalchain_webapp/src/ui/KindleReader.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/KindleReader.tsx#L19-L56)
  - [`goalchain_webapp/src/ui/KindleReader.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/KindleReader.tsx#L753-L775)
  - [`goalchain_webapp/src/ui/KindleReader.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/KindleReader.tsx#L1246-L1337)
- **Problem:**
  - `booksData.ts` contained an older draft excerpt (`"CHAPTER 1: TWELVE SECONDS"`, set in `2045`) instead of the G2-signed `MANUSCRIPT_v7` opening scene (`"1: Threshold"`, set in `2148`, Mileo Chen on the 74th floor counting 158 leaves on a regulation oak), lacked `it` (Italian) translations and Book 3 (*Evolution Matrix*), and referenced a missing external image (`https://goalworld.fun/assets/img/trailer-poster.jpg`).
  - `KindleReader.tsx:54` defaulted `ambientFreq` to `432` Hz instead of `528` Hz, only toggled between `'es' | 'en'`, and rendered a nested `<main ref={contentRef}>` inside `PlayLayout`'s `<main id="main">`.
- **Concrete Fix Applied:**
  1. Rewrote [`booksData.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/booksData.ts#L1-L266) with the exact `EN`, `ES`, and `IT` *Chapter 1: Threshold* excerpt from `MANUSCRIPT_v7` (matching `goalworld_site/src/pages/book.html#sample`), local cover assets, and Book 1 / Book 2 / Book 3 entries.
  2. Updated [`KindleReader.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/KindleReader.tsx#L19-L56) to support `'en' | 'es' | 'it'` synchronized with `useTranslation()`, default `ambientFreq` to `528` Hz, and replace the inner `<main>` (`:1246`) with `<div ref={contentRef} role="region" aria-label="Chapter reader">`.

### `F-04` · **[P1 — FIXED]** Residual `% APY`, USD valuations (`≈ $... USD`), agent token prices (`$2.47`, `Market Cap $20.3K`), and DeFi buyback copy in sandbox telemetry components & locales
- **Locations:**
  - [`goalchain_webapp/src/components/VaultStrategyCard.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/components/VaultStrategyCard.tsx#L14-L86)
  - [`goalchain_webapp/src/components/YieldCalculator.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/components/YieldCalculator.tsx#L210-L322)
  - [`goalchain_webapp/src/ui/SwarmVaults.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/SwarmVaults.tsx#L28-L78) (`lines 28–75, 245–259`)
  - [`goalchain_webapp/src/components/StakingDashboardComponents.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/components/StakingDashboardComponents.tsx#L172-L177)
  - [`goalchain_webapp/src/ui/DeFiPortal.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/DeFiPortal.tsx#L127-L139)
  - [`goalchain_webapp/src/ui/agentData.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/agentData.ts#L1-L36)
  - [`goalchain_webapp/src/ui/TokenizedAgentsDashboard.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TokenizedAgentsDashboard.tsx#L24-L120)
  - [`goalchain_webapp/src/i18n/locales/en.json`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/i18n/locales/en.json#L197-L200), [`es.json`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/i18n/locales/es.json#L197-L200), [`it.json`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/i18n/locales/it.json#L197-L200)
  - [`goalchain_webapp/scripts/check-banned-claims.mjs`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/scripts/check-banned-claims.mjs#L14-L37)
- **Problem:** Even though the Devnet banner and `SimulationBadge` were present, several child components still rendered `% APY` badges, `≈ $... USD` projections, `Automated market buybacks`, `Drift Speculation`, and agent `$tokenPrice` / `Market Cap $20.3K`, which conflict with the zero-monetary-value Devnet sandbox contract (`copy_deck.md`).
- **Concrete Fix Applied:**
  1. Replaced `% APY` with `% Sim Index`, removed USD valuations in favor of explicit `0 USD · Devnet Test`, replaced `Automated market buybacks` / `Drift Speculation` with Devnet telemetry labels, and updated `stat_staked`, `stat_mcap`, and `stat_apy` across `en.json`, `es.json`, and `it.json`.
  2. Replaced `tokenPrice` (`$2.47`) and `Market Cap` (`$20.3K`) in [`agentData.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/agentData.ts#L1-L36) and [`TokenizedAgentsDashboard.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/TokenizedAgentsDashboard.tsx#L24-L120) with `telemetryScore` (`pts`) and `Avg Telemetry Index`, and added `roleIt` Italian translations for all 10 agents.
  3. Added `% APY`, `Automated market buybacks`, `propiedad intelectual tokenizada`, and `Solana Mainnet` checks to [`check-banned-claims.mjs`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/scripts/check-banned-claims.mjs#L14-L37) and [`scan_repo_audit.py`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/tools/scan_repo_audit.py#L21-L46).

### `F-05` · **[P2 — FIXED]** Cross-origin language continuity (`goalworld.fun/{es,it}/` → `play.goalworld.fun/?lang={es,it}`) and query-param `localStorage` persistence
- **Locations:**
  - [`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs#L122-L138) (`lines 122–138, 735–741`)
  - [`goalchain_webapp/src/i18n/index.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/i18n/index.tsx#L114-L124)
- **Problem:** Because `localStorage` is origin-scoped between `goalworld.fun` and `play.goalworld.fun`, clicking `"Jugar Matchday"` on `/es/` or `"Gioca a Matchday"` on `/it/` navigated to `https://play.goalworld.fun/` without `?lang=es` or `?lang=it`. Furthermore, when arriving at `play.goalworld.fun/?lang=es`, `LanguageProvider` read `?lang=es` on initial mount but did not persist `gw_lang`/`gc_lang` into `localStorage` until the user manually clicked the language switcher.
- **Concrete Fix Applied:**
  1. Updated `localizeInternalHref` and locale HTML post-processing in [`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs#L122-L138) so all outbound links to `https://play.goalworld.fun/...` on `/es/*` and `/it/*` pages automatically carry `?lang=es` or `?lang=it`.
  2. Updated `useEffect` in [`goalchain_webapp/src/i18n/index.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/i18n/index.tsx#L114-L124) to persist `gw_lang` and `gc_lang` in `localStorage` whenever `language` initializes or changes.

### `F-06` · **[P2 — FIXED]** Accessibility `aria-labelledby` target mismatch on `index.html`, `cinema.html`, and `faq.html` + missing space before `<br />` in `index.hero.title`
- **Locations:**
  - [`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs#L263-L277)
  - [`goalworld_site/src/pages/index.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/index.html#L25-L29)
  - [`goalworld_site/src/pages/cinema.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/cinema.html#L10-L14)
  - [`goalworld_site/src/pages/faq.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/faq.html#L14-L17)
  - [`goalworld_site/src/i18n/en.json`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/i18n/en.json#L39), [`es.json`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/i18n/es.json#L39), [`it.json`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/i18n/it.json#L39)
- **Problem:** `<section aria-labelledby="pillars-heading">` on `index.html`, `aria-labelledby="screenings-heading"` on `cinema.html`, and `aria-labelledby="faq-list-heading"` on `faq.html` pointed either to a `<div class="bento">` container or a missing ID because `renderSectionHeader` in `build.mjs` did not support `props.id` on `<h2 class="sr-only">`. In addition, `index.hero.title` had `One universe.<br />` without a space before `<br />`.
- **Concrete Fix Applied:** Added `props.id` support to `renderSectionHeader` in [`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs#L263-L277), moved `"id": "pillars-heading"`, `"id": "screenings-heading"`, and `"id": "faq-list-heading"` into the `section-header` macros on `index.html`, `cinema.html`, and `faq.html`, and added a space before `<br />` in `index.hero.title` across `en.json`, `es.json`, and `it.json`.

### `F-07` · **[P3 — LOGGED / `TODO(nico)`]** Full Chapter 1 web sample on `/book.html#sample` and `/reader` awaits Gate 2 (G2) full-chapter release sign-off
- **Locations:**
  - [`goalworld_site/src/pages/book.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/book.html#L106-L150)
  - [`goalchain_webapp/src/ui/booksData.ts`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/ui/booksData.ts#L60-L202)
- **Status:** Both surfaces currently ship the verified 9-paragraph opening excerpt of *Chapter 1: Threshold* from `MANUSCRIPT_v7` across `EN`, `ES`, and `IT` with an explicit editorial note. Expanding to the full 16-page Chapter 1 text requires Nico's G2 publication sign-off (`TODO(nico)`).

### `F-08` · **[P3 — LOGGED / `TODO(nico)`]** Legal Counsel Review (`privacy.html`, `terms.html`) & Final Retail Cover/Storefront Links
- **Locations:**
  - [`goalworld_site/src/pages/privacy.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/privacy.html#L1-L45)
  - [`goalworld_site/src/pages/terms.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/terms.html#L1-L55)
  - [`goalworld_site/src/pages/book.html`](file:///workspace/goalworld-site-overhaul/goalworld_site/src/pages/book.html#L30-L60)
- **Status:** Plain-language GDPR/CCPA privacy and Devnet-sandbox terms pages are live in `EN`/`ES`/`IT`, and `/book.html` carries working cover art labeled *"Cover · working art · AI-generated"*. Final legal jurisdiction sign-off and retail storefront URLs remain gated on `TODO(nico)`.

---

## 2. `QUALITY_BAR.md` Gate Checklist (Hermes CEO & RULES §20)

| Pillar | Requirement (`QUALITY_BAR.md`) | Proof & Verification in This Branch | Status |
|---|---|---|---|
| **1. Ambición** | Solves the problem for real (edge cases, failure modes, blast-radius/security, cross-surface coherence), not a stub demoware. | Unified two surfaces (`goalworld_site/` + `goalchain_webapp/`) across **3 locales (`EN`, `ES`, `IT`)**; built a zero-dependency static generator ([`goalworld_site/build.mjs`](file:///workspace/goalworld-site-overhaul/goalworld_site/build.mjs)) emitting `84` HTML routes + localized JSON-LD + `hreflang` + RSS/JSON feeds + `llms.txt` + `.well-known/*`; wrapped all `play.goalworld.fun` routes in a shared [`PlayLayout.tsx`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/src/components/PlayLayout.tsx) shell with error boundary, 404 recovery, and cross-origin locale continuity; archived `21` legacy duplicate HTML pages into `docs/archive/` with clean redirect stubs. | **PASS** |
| **2. Complejidad útil** | Clear architecture, separated layers, automated tests that fail if the contract breaks; no monolithic 20-line files pretending to be product. | Single source of truth for design tokens ([`design/tokens.json`](file:///workspace/goalworld-site-overhaul/design/tokens.json) + [`design/sync-tokens.mjs`](file:///workspace/goalworld-site-overhaul/design/sync-tokens.mjs) verifying 11 WCAG AA contrast pairs); reusable macro engine ([`goalworld_site/COMPONENTS.md`](file:///workspace/goalworld-site-overhaul/goalworld_site/COMPONENTS.md)); 3-way i18n parity gates (`780` keys in `goalworld_site`, `914` keys in `goalchain_webapp`); build-time banned-claims gates ([`check-banned-claims.mjs`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/scripts/check-banned-claims.mjs), [`scan_repo_audit.py`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/tools/scan_repo_audit.py)); 11-stage automated QA runner ([`tools/qa/run-all.mjs`](file:///workspace/goalworld-site-overhaul/tools/qa/run-all.mjs)). | **PASS** |
| **3. Buen gusto** | Legible, cinematic UI aligned to *Fractured Code* / GoalWorld (`#0a0b0e` obsidian + `#e5a93c` warm amber, `Newsreader` + `Outfit` + `JetBrains Mono`, hierarchy, concise natural `EN`/`ES`/`IT` copy); README/docs a juror understands in 30s. | Self-hosted `Newsreader`, `Outfit`, and `JetBrains Mono` variable fonts; obsidian + warm amber palette with WCAG AA contrast verified; interactive reader on `/book.html#sample` and `/reader` with font-size (`S`/`M`/`L`), theme (`Dark`/`Sepia`), and `528 Hz` audio controls; 30-second juror guides in [`README.md`](file:///workspace/goalworld-site-overhaul/README.md), [`goalworld_site/README.md`](file:///workspace/goalworld-site-overhaul/goalworld_site/README.md), and [`goalchain_webapp/README.md`](file:///workspace/goalworld-site-overhaul/goalchain_webapp/README.md). | **PASS** |
| **4. Evidencia** | `npm test` / equivalent green + smoke curl + screenshots across viewports (`390×844`, `820×1180`, `1440×900`) + Lighthouse reports saved in `_work/site-overhaul-20261109/evidence/`. | `npm run qa` passes all **11/11 stages** ([`evidence/phase5/qa-summary.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/phase5/qa-summary.json), [`evidence/phase5/qa.log`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/phase5/qa.log)); Playwright matrix (`63` page-viewport checks, `0` console/page/network/overflow/a11y errors in [`evidence/phase5/playwright-qa.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/phase5/playwright-qa.json)); Lighthouse desktop & mobile scores (`99–100` Perf, `100` A11y, `100` Best Practices, `100` SEO in [`evidence/phase5/lighthouse/summary.json`](file:///workspace/goalworld-site-overhaul/_work/site-overhaul-20261109/evidence/phase5/lighthouse/summary.json)); `45` WebP screenshots (all `< 130 KB`) in `evidence/phase4/` and `evidence/phase5/screenshots/`. | **PASS** |
| **5. Honestidad** | Mock vs. live explicit; zero invented metrics, quotes, partners, prices, or launch claims; AI media explicitly labeled `"Made with AI"`. | Persistent **Solana Devnet · Free to Play** banner on both surfaces; `SimulationBadge` + `0 USD · Devnet Test` labels on all simulated pools/telemetry; zero banned claims across `80` `goalworld_site` output files, `98` `goalchain_webapp` source/public files, `32` `docs/` HTML files, and root `README.md`; all AI video teasers carry visible `"Made with AI"` / `"AI-generated"` badges and `preload="none"`. | **PASS** |

---

## 3. Anti-Patterns Check (`QUALITY_BAR.md`)

- [x] **No 1-line HTML/CSS stubs:** Every page and component is fully structured, responsive across `390×844` / `820×1180` / `1440×900`, localized in `EN`/`ES`/`IT`, and backed by design tokens.
- [x] **No `<50 LOC` policy-free stubs:** Both `goalworld_site` and `goalchain_webapp` enforce canon, i18n parity, contrast, and banned-claim policies automatically at build time.
- [x] **No "Done" without smoke verification & juror checklist:** Full 11-stage `npm run qa` + Playwright + Lighthouse evidence is recorded under `_work/site-overhaul-20261109/evidence/phase5/`.
- [x] **No unpolished scaffold:** Typography, spacing, skip-links, focus-visible rings, `aria-labelledby` landmarks, `hreflang` alternates, RSS/JSON feeds, and cross-surface navigation are all polished and tested.
- [x] **No cosmetic questions escalated to Nico:** All design, layout, component, and copy-polish decisions were resolved autonomously; only genuine business/legal/editorial gates are listed in `TODO(nico)`.

---

## 4. Consolidated `TODO(nico)` Decisions

1. **`TODO(nico)` — Gate 2 (G2) Full Chapter 1 Public Excerpt Sign-Off:** Confirm when to expand `/book.html#sample` and `play.goalworld.fun/reader` from the current 9-paragraph `MANUSCRIPT_v7` opening excerpt (*1: Threshold*) to the complete Chapter 1 text (keeping within ~6% of 74k words if retailer exclusivity is later selected).
2. **`TODO(nico)` — Book 1 Final Retail Cover & Storefront Links:** Provide the final store-edition cover art and confirmed retail links / ISBNs once Book 1 (*Fractured Code*) release preparation concludes.
3. **`TODO(nico)` — Legal Counsel Review (`privacy.html` & `terms.html`):** Review the plain-language Privacy Policy and Terms of Use (`EN`/`ES`/`IT`) for final corporate entity / jurisdiction details before commercial transactions are enabled.
4. **`TODO(nico)` — Production Deployment & Caddy Redirect Approval:** Approve the proposed Caddyfile redirect rules (legacy `/goalworld.html`, `/goalchain.html`, `/arcade.html`, `/pitch.html`, `/mega-guide*.html` → canonical `goalworld.fun` routes) and production rollout of `feat/site-overhaul-20261109`.
