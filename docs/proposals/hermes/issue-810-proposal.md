# OA Proposal — Issue #810

## Title
[HERMES] review and fix NFT image fallbacks

## Source
GitHub issue #810 (duplicate issue body of #809, which was the implementation commit `e203ec2c`).

## Objective
Audit every place that renders an NFT player image on the public site/marketplace/gallery/dashboard and confirm that when the player image file does exist on disk but fails to load (or does not exist yet), the user sees the premium "Coming Soon" placeholder (`card_placeholder_soon.png`) — never a "random image from the repository" as another player NFT.

## Background / Root cause (R1)
User reported that some rendered NFTs showed arbitrary files (e.g. `001_lionel_satoshi.png` or other real player assets) when the correct player image was missing. The root cause: three renderers (`marketplace.js`, `pack_opener.js`, `3d_gallery.js`) had `onerror="this.src='assets/img/nfts/001_lionel_satoshi.png'"` — which is exactly the anti-pattern the issue describes. Commit `e203ec2c` (prior issue #809) already replaced every such fallback with `card_placeholder_soon.png`. Current task #810 is the review pass to confirm no such fallback survives anywhere, and to cover the remaining gap in `classic-dashboard.html`.

## Audit findings (R5 — executed)

`grep -rn 'onerror\|001_lionel_satoshi' docs/ goalchain_webapp/public 2>/dev/null | grep -v node_modules`:

| File | Line | Pattern | Status |
|------|------|---------|--------|
| `docs/assets/js/3d_gallery.js` | 220 | fallback → `card_placeholder_soon.png` | OK (already fixed in `e203ec2c`) |
| `docs/assets/js/marketplace.js` | 64 | fallback → `card_placeholder_soon.png` | OK |
| `docs/assets/js/pack_opener.js` | 191 | fallback → `card_placeholder_soon.png` | OK |
| `docs/assets/js/pack_opener.js` | 240 | fallback → `card_placeholder_soon.png` | OK |
| `docs/assets/js/nft_registry.js` | 212 | handles via `no-image` CSS class (clears the `<img>`); sibling `.placeholder-icon` shows ⚽ | OK |
| `goalchain_webapp/public/classic-dashboard.html` | 1890 | `<img id="simCardImg" src="https://goalchain.fun/assets/img/nfts/001_lionel_satoshi.webp">` — hard-coded initial source, **NO `onerror` handler** | **GAP — needs fix** |
| `goalchain_webapp/dist/classic-dashboard.html` | 1890 | identical to `public/` | GAP (same fix, kept in sync) |
| `docs/assets/js/3d_gallery.js` | 197 | video `onerror` → hide element + dark gradient | OK (not an NFT image) |
| `docs/index.html` | 3200 | `onerror="this.src = 'assets/img/logo.png'"` — for site logo, not an NFT | OK |
| `goalchain_webapp/src/hooks/useMatchSim.ts` | 363 | WebWorker `onerror` | OK (not an image) |
| `goalchain_webapp/src/ui/AICommentator.tsx` | 78, 168 | WebSocket/TTS `onerror` | OK (not an image) |
| `docs/assets/data/nft_metadata_index.json` | 4, 9, 81 | on-chain metadata URI for player 1 = `001_lionel_satoshi.webp` | Out of scope — that's the correct URI for the player that exists on disk |
| `assets/players/generation_status.json` | 7 | raw path metadata only | Out of scope |

Coverage numbers (Python audit against `docs/assets/data/players.json`):
- 528 total players in `players.json`.
- 37 distinct IDs have a real `.webp` file on disk under `docs/assets/img/nfts/`.
- 491 don't yet — these MUST show the placeholder until image batch generation finishes.

## Proposed changes

### File list (R3 — minimal, scoped)
1. `goalchain_webapp/public/classic-dashboard.html` — add `onerror="this.onerror=null;this.src='assets/img/nfts/card_placeholder_soon.png';this.style.opacity='0.95';"` to the `simCardImg` element (line 1890). Guard with `onerror=null` to prevent infinite re-trigger.
2. `goalchain_webapp/dist/classic-dashboard.html` — same edit, mirrored so the deployed bundle stays consistent. `dist/` is the build output for `goalchain_webapp/` — it's part of the workspace tree because the public/↔dist/ pattern is the static-export source for Vercel/GitHub Pages; keeping both in lockstep is required.
3. `docs/proposals/hermes/issue-810-proposal.md` — this file (proposal audit, no behavioral code).

### Out of scope (deliberately not touched)
- `nft_metadata_index.json` lines containing `001_lionel_satoshi.webp` — those are the correct on-chain URIs for the player whose image exists. Changing them would break metadata / tokens. (META R10 — on-chain IRREVERSIBLE.)
- `nft_registry.js` `getPlayerImagePath()` — the path it constructs for missing players is intentional; the renderer layer handles 404s via `onerror`.
- New image generation — that's `exp/grok-*` worker territory (image generation pipeline), separate ownership.

## Risks / regressions (R10)
- **Low**: classic-dashboard.html is a React dev/demo bundle. Adding an `onerror` handler on a hard-coded player image can only trigger if the image 404s (it doesn't currently), at which point the placeholder is the desired behavior. No functional regression on the happy path.
- **Dist sync risk**: forgetting to mirror `dist/` would fork the public/dist files. We update both.
- **No on-chain / no treasury / no mint-gate / no feature flags touched.** Outside the forbidden-risk set in CLAUDE.md.

## Rollback
Single commit on `main`. Revert with `git revert <hash>` if anything misbehaves. The audit leaves 4 working fallbacks untouched.

## Test commands (R5)
```bash
# 1. Grep guard — no file should still point to a real NFT as onerror fallback
cd /data/apps/GoalChain
grep -rn "onerror" goalchain_webapp/public/classic-dashboard.html goalchain_webapp/dist/classic-dashboard.html docs/assets/js/ docs/index.html | grep -Eo "this\.src=['\"][^'\"]+" | sort -u
# Expected output MUST include only:
#   this.src='assets/img/nfts/card_placeholder_soon.png'
#   this.src='assets/img/logo.png'   (site logo, not an NFT)
# Anything pointing at a numbered player asset (e.g. 001_lionel_satoshi.png/.webp) is a regression.

# 2. Webapp build (only relevant if React build is wired; here it's a static site)
cd goalchain_webapp && npm run build

# 3. Sanity check on the placeholder file
python3 -c "from PIL import Image; im = Image.open('docs/assets/img/nfts/card_placeholder_soon.png'); print('size', im.size, 'mode', im.mode)"
# Expected: size (1024, 1024) mode RGB

# 4. Render quick page test (optional, manual)
# open goalchain_webapp/public/classic-dashboard.html in a browser; the sim card
# area must keep showing the same image (lionel) on a fresh load because the
# file exists and is reachable. Simulating a network failure (DevTools ->
# Network -> Block request URL pattern /*001_lionel_satoshi.webp*) should
# substitute the placeholder within ~1s.
```

## Owner / Workflow
- Branch: `main` (direct, per `cambio urgente` directive in this turn's wrapper).
- No draft PR. Commit + push + audit summary at end.
- One implementer (Hermes CEO / FCC).
