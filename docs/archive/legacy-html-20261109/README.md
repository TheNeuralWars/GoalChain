# Archived Legacy HTML Pages (2026-11-09)

These legacy standalone HTML pages from `docs/` and `goalchain_webapp/public/` were archived during the Phase 1 GoalWorld Site Overhaul (`A-001`, `A-002`, `A-008`).

## Why archived
- They predated the canonical `goalworld_site/` generator and `play.goalworld.fun` React SPA.
- They contained retired pre-order/KDP/presale/yield/APY claims and unverified manuscript text.
- Every original path has been replaced with a clean, zero-claim HTML redirect stub (`<meta http-equiv="refresh">` + `<link rel="canonical">` + `location.replace`) pointing to its canonical GoalWorld destination.
- `docs/archive/` is listed in `docs/.assetsignore`, so `scripts/pages/stage_public_tree.py` never publishes this archive directory.

## Archived files & redirect targets

| Original Path | Archived Copy | Redirect Target |
|---|---|---|
| `docs/index.html` | `docs/archive/legacy-html-20261109/index.html` | `/` |
| `docs/goalworld.html` | `docs/archive/legacy-html-20261109/goalworld.html` | `/book.html` |
| `docs/goalchain.html` | `docs/archive/legacy-html-20261109/goalchain.html` | `https://play.goalworld.fun/` |
| `docs/arcade.html` | `docs/archive/legacy-html-20261109/arcade.html` | `https://play.goalworld.fun/hub` |
| `docs/app.html` | `docs/archive/legacy-html-20261109/app.html` | `https://play.goalworld.fun/dashboard` |
| `docs/pitch.html` | `docs/archive/legacy-html-20261109/pitch.html` | `/about.html` |
| `docs/mega-guide.html` | `docs/archive/legacy-html-20261109/mega-guide.html` | `/faq.html` |
| `docs/mega-guide-v1.html` | `docs/archive/legacy-html-20261109/mega-guide-v1.html` | `/faq.html` |
| `docs/colabs.html` | `docs/archive/legacy-html-20261109/colabs.html` | `/studio.html` |
| `docs/studio.html` | `docs/archive/legacy-html-20261109/studio.html` | `/studio.html` |
| `docs/cinema.html` | `docs/archive/legacy-html-20261109/cinema.html` | `/cinema.html` |
| `docs/legal.html` | `docs/archive/legacy-html-20261109/legal.html` | `/terms.html` |
| `docs/map.html` | `docs/archive/legacy-html-20261109/map.html` | `/roadmap.html` |
| `docs/pre-nft.html` | `docs/archive/legacy-html-20261109/pre-nft.html` | `/collect.html` |
| `docs/protocol.html` | `docs/archive/legacy-html-20261109/protocol.html` | `/collect.html` |
| `docs/tokenomics.html` | `docs/archive/legacy-html-20261109/tokenomics.html` | `/collect.html` |
| `docs/agents.html` | `docs/archive/legacy-html-20261109/agents.html` | `/live.html` |
| `docs/ceo.html` | `docs/archive/legacy-html-20261109/ceo.html` | `/live.html` |
| `docs/reader.html` | `docs/archive/legacy-html-20261109/reader.html` | `/book.html#sample` |
| `docs/go/reader/index.html` | `docs/archive/legacy-html-20261109/go/reader/index.html` | `/book.html#sample` |
| `goalchain_webapp/public/classic-dashboard.html` | `docs/archive/legacy-html-20261109/webapp-public/classic-dashboard.html` | `/dashboard` |
