# GoalWorld · Matchday Lab (`play.goalworld.fun`)

The interactive web application for **GoalWorld — Canon. Code. Cinema.** (`https://play.goalworld.fun`), built with **Vite + React 18 + TypeScript** and connected to **Solana Devnet**.

> **Devnet Sandbox Notice:** Every matchday pool, agent telemetry dashboard, digital collectible preview, and `GCH` / `SOL` balance in this application runs strictly on **Solana Devnet** with test tokens (`0 USD` monetary value). There is no token sale, no yield/APY, and no financial return.

---

## Quick Start & Verification

```bash
cd goalchain_webapp
npm ci
npm run build        # TypeScript check + Vite production bundle + check:claims
npm run check:i18n   # Validates 100% key parity across EN, ES, and IT
npm run check:claims # Audits src/ + public/ against banned claims and canon drift
```

Preview locally:

```bash
npm run preview -- --port 4174
# Open http://127.0.0.1:4174/ (or ?lang=es, ?lang=it)
```

---

## Architecture & Shared Shell

- **Design Tokens (`src/styles/tokens.css`):** Auto-generated from root `design/tokens.json` via `node scripts/build-tokens.mjs`. Shares the exact `#0a0b0e` obsidian canvas, `#e5a93c` warm amber accent, and `Newsreader` + `Outfit` + `JetBrains Mono` typography stack with `goalworld.fun`.
- **Shared Chrome (`src/components/PlayLayout.tsx`):** Provides a persistent skip-link, **Solana Devnet · Free to Play** disclosure banner, top navigation bar with cross-surface links back to `goalworld.fun` (localized per active language), `EN`/`ES`/`IT` language switcher (`gw_lang`), wallet button, and unified footer across all routes.
- **Trilingual i18n (`src/i18n/`):** `914+` translation keys per locale (`en.ts`, `es.ts`, `it.ts`) with URL query initialization (`?lang=en|es|it`), `localStorage` persistence (`gw_lang` + `gc_lang`), and helper `getLocalizedMarketingUrl(path, lang)` for seamless navigation between `play.goalworld.fun` and `goalworld.fun/{,es/,it/}`.

---

## Primary Routes

| Route | Component | Purpose |
|---|---|---|
| `/` | `WorldCupHub` | Matchday Lab hub — World Cup 2026 fixture sandbox, live/simulated matchday predictions, and Devnet onboarding. |
| `/mundial` | `WorldCupHub` / `MatchdayBettingCard` | Interactive matchday pool predictions on Solana Devnet. |
| `/reader` | `KindleReader` | Interactive *Fractured Code* Chapter 1 (*Threshold*) reader with EN/ES/IT switcher, sepia/dark themes, and 528 Hz ambient audio synthesis. |
| `/universe` | `TheNeuralWarsUniverse` | *The Neural Wars* interactive lore bible (Neo-Citania 2148, the Link, 528 Hz resonance, character dossiers, and AI cinema drafts). |
| `/market` | `NFTMarketplace` | Digital collectibles & canonical artifact preview catalog on Solana Devnet. |
| `/agents` | `TokenizedAgentsDashboard` | Autonomous agent telemetry & uptime scoreboard (Devnet simulation). |
| `/defi` | `DeFiPortal` | Protocol telemetry, burn-counter simulation, and treasury allocation sandbox on Solana Devnet. |
| `/studio` | `AuthorStudio` | Living Canon narrative studio & manuscript-to-world workflow preview. |
| `/press` | `PressKit` | Brand assets, canonical boilerplate, and press resources. |
| `*` | `NotFoundPage` | On-brand 404 recovery with direct links back to Matchday Lab and `goalworld.fun`. |
