# GoalWorld — Canon. Code. Cinema.

**GoalWorld** is a single transmedia universe told across three mediums by author, engineer, and director **Nico Pez** (`@nicopez`):

1. **Canon — *The Neural Wars* Novel Saga:** Beginning with Book 1, ***Fractured Code*** (set in Neo-Citania, 2148, where a 20-day countdown to *Project Renaissance* collides with the human neural interface called the Link), continuing in Book 2 (*Earth's New Song*) and Book 3 (*Evolution Matrix*).
2. **Code — GoalChain · Matchday Lab (`play.goalworld.fun`):** An open interactive matchday & agent telemetry sandbox running on **Solana Devnet**. Free to explore with zero real money, zero financial return, and transparent on-chain simulation mechanics.
3. **Cinema — AI Film Studio (`goalworld.fun/cinema.html`):** Human-directed, AI-assisted film drafts and teasers adapting *Fractured Code*, explicitly labeled *"Made with AI"* and produced with documented multi-stage pipelines.

---

## Quick Verification & Local Preview (30-Second Juror Guide)

Run the entire multi-stage verification pipeline (design tokens, static site build across EN/ES/IT, link/canon/secret audits, webapp TypeScript + Vite build, i18n parity check, and headless Chrome Playwright + Lighthouse audits):

```bash
npm run qa
```

### Preview Both Surfaces Locally

```bash
# 1. Build & serve goalworld.fun (static site — EN / ES / IT)
node goalworld_site/build.mjs
python3 -m http.server 4173 --directory goalworld_site/dist
# Open http://127.0.0.1:4173/ (and /es/, /it/)

# 2. Build & preview play.goalworld.fun (Matchday Lab — Solana Devnet)
cd goalchain_webapp && npm run build && npx vite preview --port 4174
# Open http://127.0.0.1:4174/ (supports ?lang=en|es|it)
```

---

## Architecture & Repository Map

| Directory | Surface / Role | Stack & Verification |
|---|---|---|
| [`design/`](design/) | Single source of truth for palette (`#0a0b0e` obsidian, `#e5a93c` warm amber, `#38bdf8` cyan, `#34d399` emerald), typography (`Newsreader` + `Outfit` + `JetBrains Mono`), spacing, and motion tokens (`design/tokens.json`). | `node scripts/build-tokens.mjs` |
| [`goalworld_site/`](goalworld_site/) | **`goalworld.fun`** — Zero-dependency static site generator (`build.mjs`), reusable component macro engine (`COMPONENTS.md`), 13 core pages × 3 locales (`en`, `es`, `it` → 84 HTML routes), RSS 2.0 + JSON Feed 1.1, JSON-LD, `.well-known/*`, and `llms.txt`. | `node goalworld_site/build.mjs` + `python3 goalworld_site/tools/check_links.py` |
| [`goalchain_webapp/`](goalchain_webapp/) | **`play.goalworld.fun`** — Matchday Lab & interactive Canon/Code/Cinema portal (Vite + React 18 + TypeScript, Solana Devnet wallet adapter, shared `PlayLayout` shell, 914+ i18n keys across EN/ES/IT, zero-JS-error routes). | `cd goalchain_webapp && npm run build && npm run check:i18n && npm run check:claims` |
| [`goalchain_program/`](goalchain_program/) | Solana Anchor smart contracts (Rust) for Devnet matchday pools, digital collectibles, and simulation telemetry. | Anchor / Cargo |
| [`goalchain_oracle/`](goalchain_oracle/) & [`goalchain_api/`](goalchain_api/) | Fixture oracle & backend telemetry services. | Node / TypeScript |
| [`docs/`](docs/) | Legacy static pages & machine-readable data surfaces (`docs/archive/` preserves deprecated legacy variants with 301/canonical redirects to `goalworld_site`). | Validated by `scan_repo_audit.py` |
| [`tests/`](tests/) | Automated Playwright visual/a11y/overflow/i18n/link checks (`phase4-suite.mjs`, `phase5-qa.mjs`) and Lighthouse desktop/mobile runner (`lighthouse-run.mjs`). | `npm run qa` |

---

## Core Guardrails & Transparency

- **Devnet Sandbox Only:** All tokens (`GCH`, Devnet `SOL`), matchday pools, and agent telemetry modules on `play.goalworld.fun` operate strictly on **Solana Devnet** for testing and gameplay exploration. They carry no monetary value, no yield/APY, and no investment or profit expectation.
- **Living Canon Integrity:** All literary excerpts on `/book.html#sample` and `/reader` derive from the canonical *Fractured Code* manuscript (`MANUSCRIPT_v7`, set in Neo-Citania, 2148, featuring Kora Vega, Mileo Chen, Marcus Vance, the Elder, and Aria).
- **AI Transparency:** Every AI-assisted video teaser or visual study carries an explicit **"Made with AI"** / **"AI-generated"** disclosure badge.
- **Full Trilingual Parity (`EN` / `ES` / `IT`):** Both `goalworld.fun` (`/`, `/es/`, `/it/`) and `play.goalworld.fun` (`?lang=en|es|it`) share a synchronized language switcher (`gw_lang`), proper `hreflang` alternates, and natural translations that preserve canonical proper nouns (*Kora Vega*, *Neo-Citania*, *the Link*, *The Neural Wars*, *Fractured Code*).

---

## Documentation Index

- [`goalworld_site/README.md`](goalworld_site/README.md) — Static site generator, i18n architecture, media budget, and deployment notes.
- [`goalworld_site/COMPONENTS.md`](goalworld_site/COMPONENTS.md) — Reusable HTML component macro reference (`<gw-button>`, `<gw-card>`, `<gw-badge>`, `<gw-media-frame>`, etc.).
- [`goalchain_webapp/README.md`](goalchain_webapp/README.md) — Matchday Lab React application architecture, route table, and verification scripts.
- [`_work/site-overhaul-20261109/STATUS.md`](_work/site-overhaul-20261109/STATUS.md) — Executive overhaul summary, verification status, and rollout checklist.
- [`_work/site-overhaul-20261109/SELF_REVIEW.md`](_work/site-overhaul-20261109/SELF_REVIEW.md) — Comprehensive self-review against `QUALITY_BAR.md`.
