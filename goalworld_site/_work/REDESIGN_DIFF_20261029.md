# GoalWorld web redesign — preview diff (2026-10-29)

PREVIEW ONLY. goalworld.fun production untouched. Brief: `_work/REDESIGN_ARGON_20261029.md` (google/gemini-4-argon, spend_source=included).
Before snapshot: `/tmp/gw-redesign-before/` (box) and git main 3679a19.

## Files
- `src/assets/css/site.css` — tokens: bg #030307→#0a0b0e, primary accent Solana green→amber #e5a93c (legacy var name `--green` kept so other pages inherit), purple/cyan muted, `--grad` warm amber, new `--code` cobalt, `--serif`, `--mono`; neon green/purple glows replaced with soft amber. New components: eyebrow, serif accent, btn-secondary, btn-link, tag-mono, notify-pill, bento, feature split, next-book callout, cinema grid, live board, expand panels, scroll reveal, mobile sticky CTA.
- `src/pages/index.html` — rewritten: hero "One universe. Three mediums." CTA order Read free (primary) → Play Matchday DEVNET (secondary) → Watch trailer (text link); Book 2 "coming soon / get notified" pill. 4-card grid → bento (Canon/Code/Cinema/Studio). Featured canon with Book 2 callout. Cinema: 1 trailer + 1 clip, 2 more behind expand. Play: 4-step how-to collapsed. NEW live board (6 items). Roadmap now/next/later without token/vault/royalty promises.
- `src/pages/live.html` — NEW page: full live board grouped by kind.
- `src/pages/roadmap.html` — removed Amazon KDP, royalty tokenization, ZVL vault, agent tokenization claims.
- `src/layout.html` — nav adds "Live"; header CTA Play → "Read free"; mobile sticky CTA (Read / Play).
- `src/assets/js/site.js` — vanilla JS: IntersectionObserver scroll reveal, expand/collapse, runtime live-feed render. Respects prefers-reduced-motion.
- `src/data/live-feed.json` — NEW data source. `build.mjs` copies `src/data` → `dist/data`; NAV_KEYS += LIVE.

## Motion / UI libs
None added. CSS transitions + grid-template-rows expand + IntersectionObserver (zero deps).

## How to add a live-feed item (no UI redeploy needed)
Append one object to `items` in `src/data/live-feed.json` (and bump top-level `updated`):
```json
{"id":"slug","title":"Name","status":"wip|submitted|shipped|hold","kind":"hackathon|product|film|book|ops","url":"https://… or null","deadline":"2026-11-01T18:00:00+01:00 or null","updated":"YYYY-MM-DD","blurb":"One line.","provisional":true}
```
Then either commit only that file (preview rebuilds), or scp the JSON directly to the host's `/data/live-feed.json` — the page fetches it at runtime (cache: no-cache).
Claims hygiene: no KDP/Amazon, token sale, pre-orders, yield, audits.
