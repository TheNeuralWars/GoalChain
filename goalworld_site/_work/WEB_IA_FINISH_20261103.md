# GoalWorld Web IA Finish — Work Summary (2026-11-03)

Branch: `feat/web-ia-finish-20261103`  
Base commit: `78eac3ed`  
Deploy status: **PREVIEW ONLY** — no production deployment, no push to main.

---

## 1. Overview & Objectives Achieved

The GoalWorld web information architecture (IA) was previously in an incomplete state with missing dedicated pages (`/book.html`, `/collect.html` returning 404s on prod) and outdated references. This work finishes the studio IA under the October 2026 Argon redesign language (`One universe. Three mediums.`, warm amber/obsidian palette, serif literary typography, JetBrains mono metadata):

1. **Four dedicated pages ported & adapted**:
   - `goalworld_site/src/pages/book.html`: Dedicated spotlight for *Fractured Code* (Book 1), cover art, blurb, saga ladder (Books 1–3), and Chapter 1 free sample preview (`#sample`).
   - `goalworld_site/src/pages/cinema.html`: AI Cinema showcase featuring the official trailer and 3 film-draft clips (Mileo Chen quantum console, Kora Vega harmonic rings, Earth Dawn orbital awakening), the 6-step human-directed / AI-crew pipeline, and festival holdback notice.
   - `goalworld_site/src/pages/studio.html`: Case study of *Fractured Code* manuscript development (~17k to ~74k words, author-signed gates), Living Canon dynamic cuts engine & CanonGuard, production slate, and author waitlist.
   - `goalworld_site/src/pages/collect.html`: Provenance-first roadmap (Now: Disclose everything · Next: Sign the media with content credentials · Later: Collector editions post-legal review), with explicit "nothing for sale today, no tokens, no yield, no promises" disclaimer.

2. **Unified Navigation & Layout (`src/layout.html`)**:
   - **Top Nav**: `Book` · `Cinema` · `Studio` · `Live` · `Roadmap` + Primary CTA button `Read free →` (`/book.html#sample`).
   - **Mobile Sticky CTA**: Kept in layout, updated to `Read Book 1 free` (`/book.html#sample`) and `Play` (`https://play.goalworld.fun/`).
   - **Footer**:
     - *Brand copy*: "An independent story studio. Books first, then the screen. Home of The Neural Wars — built in the open by Nico Pez and an AI crew."
     - *Explore*: Fractured Code (`/book.html`), AI Cinema (`/cinema.html`), Studio & authors (`/studio.html`), Collectors & creators (`/collect.html`), About & Lore (`/about.html`), Matchday Lab (`https://play.goalworld.fun/`).
     - *Community & Legal*: X (`@nicopez`), GitHub (`TheNeuralWars/GoalChain`), FAQ (`/faq.html`), Press kit (`/press.html`), Contact (`nico@goalworld.fun`), Privacy (`/privacy.html`), Terms (`/terms.html`).
     - *Hygiene*: Dropped dead Discord invite, GoalChainDotFun link, and unverified social links. Tagline set to `Canon. Code. Cinema.`

3. **Generator Engine (`build.mjs`)**:
   - Updated `NAV_KEYS` to include `["BOOK", "CINEMA", "STUDIO", "LIVE", "ROADMAP", "ABOUT", "FAQ", "PRESS", "COLLECT"]`.
   - Generates all 13 pages + extensionless mirror folders + `sitemap.xml` (12 indexable URLs) + `press-kit.zip`. Zero unresolved placeholders.

4. **Runtime Live Feed Refreshed (`src/data/live-feed.json`)**:
   - **Vultr Blast Radius**: Live at `https://goalworld.fun/blast-radius/`, containerized sandbox with path jail, mock inference mode clearly labelled (`provisional: false`).
   - **Fractured Code G2 Signed Manuscript**: 74k-word definitive manuscript signed off; release preparation underway; Book 2 in production (`provisional: false`).
   - **PixLight 2026**: 51-page feature screenplay and pitch video submitted to PixLight Script Track (Worlds Beyond) (`provisional: false`).
   - **GPU World (Paradigm)**: Original short story "One Each" (1,777 words) submitted (`provisional: false`).
   - **Nebius × NVIDIA Hermes Personal AI**: Submitted; demo live at `https://goalworld.fun/hermes-demo/` (`provisional: false`).
   - **GoalChain Matchday**: Solana Devnet sandbox demo (`provisional: false`).
   - **The Neural Wars**: Trailer & film drafts (`provisional: false`).
   - **Honest flags**: Judging/WIP entries (Canon Compass, MatchMind, Android Bridge) accurately marked `provisional: true`.

5. **Home Page Deep Links (`src/pages/index.html`)**:
   - Retained redesign structure (Hero -> Bento Pillars -> Featured Canon -> Cinema -> Code -> Live -> Roadmap -> Community).
   - Deep-linked 4 bento pillars:
     - 01 Canon → `/book.html`
     - 02 Code → `https://play.goalworld.fun/`
     - 03 Cinema → `/cinema.html`
     - 04 Studio → `/studio.html`
   - Hero and Canon buttons link directly to `/book.html#sample`.
   - Book 2 notification box (`#book2`) kept strictly waitlist-safe with zero pre-order or retailer claims.

6. **Sample Policy & Documentation (`README.md`)**:
   - Documented the 13 built pages.
   - Added clear guidance: after Gate 2 (G2), `/go/reader/` and `/book.html#sample` should reflect Chapter 1 of the official signed manuscript (`MANUSCRIPT_v7`).
   - No placeholder chapter text was fabricated.

7. **Copy Hygiene & Ban-List Grep**:
   - Zero occurrences of banned claims across all pages in `src/` and `dist/`:
     - `seven days` → updated to `twenty days` (in `about.html`)
     - `432 Hz` → updated to `528 Hz` (in `roadmap.html`) or "resonance trance" (in `press.html`, `index.html`)
     - No `pre-order` or `prerreserva`
     - No `published on KDP` claims
     - No `USDC royalties`, `Zero Value Loss`, `Infinity Burn`
     - No `audited facial likeness`
     - No `$1M` or `C2PA-verified` claims
     - No `GoalChainDotFun` or dead `discord` links

---

## 2. Summary of Files Changed

| File | Status | Description |
|---|---|---|
| `goalworld_site/src/pages/book.html` | Created | Dedicated Book 1 page with Chapter 1 sample preview and saga ladder |
| `goalworld_site/src/pages/cinema.html` | Created | Dedicated AI Cinema page with trailer, 3 clips, pipeline steps, festival note |
| `goalworld_site/src/pages/studio.html` | Created | Dedicated Studio page with manuscript case study, Living Canon, slate, author waitlist |
| `goalworld_site/src/pages/collect.html` | Created | Dedicated Provenance & Collector page with 3-phase roadmap and no-sale disclaimer |
| `goalworld_site/src/layout.html` | Modified | Updated top NAV (Book, Cinema, Studio, Live, Roadmap, Read CTA) and comprehensive footer |
| `goalworld_site/build.mjs` | Modified | Added new NAV_KEYS to support all 13 pages |
| `goalworld_site/src/data/live-feed.json` | Modified | Refreshed with Vultr Blast Radius, G2 signed manuscript, PixLight, GPU World, Nebius demo |
| `goalworld_site/src/pages/index.html` | Modified | Deep-linked 4 pillars to dedicated pages, cleaned up legacy 432 Hz references |
| `goalworld_site/src/pages/about.html` | Modified | Corrected timeline to twenty days, removed legacy 432 Hz / neon classes, linked to /book.html#sample |
| `goalworld_site/src/pages/roadmap.html` | Modified | Corrected 432 Hz to 528 Hz awakening, removed neon classes |
| `goalworld_site/src/pages/press.html` | Modified | Added press email `nico@goalworld.fun`, corrected 432 Hz trance caption to resonance trance |
| `goalworld_site/README.md` | Modified | Updated pages table and documented G2 reader sample policy and TODO |
| `goalworld_site/_work/WEB_IA_FINISH_20261103.md` | Created | This summary document |

---

## 3. Remaining Nico Decisions

1. **Legal & Compliance (Privacy & Terms)**:
   - `privacy.html` and `terms.html` currently remain plain-language studio drafts. Once email collection / waitlists or collector editions are launched, legal review (under EU GDPR / Italian consumer regulation) will be required.
2. **Discord Strategy**:
   - Dead Discord links were dropped from navigation and footer. When Nico creates/configures an official community Discord server with proper moderation and permanent invite link, it can be re-added to footer and community sections.
3. **Press & Studio Email Mailbox**:
   - `nico@goalworld.fun` is linked in footer and `press.html`. Confirm DNS MX/forwarding records for `goalworld.fun` are active for inbound press inquiries.
4. **Reader Sample Sync (`/go/reader/`)**:
   - Confirm whether `/go/reader/` should 301-redirect to `/book.html#sample`, or if a standalone reading app will host Chapter 1 of `MANUSCRIPT_v7`.
5. **KDP Select & Sample Sizing**:
   - If enrolling *Fractured Code* in KDP Select upon publishing, ensure the free sample hosted publicly remains within Amazon's ~10% excerpt allowance (Chapter 1 alone is ~6% of the 74k-word book, which complies).
