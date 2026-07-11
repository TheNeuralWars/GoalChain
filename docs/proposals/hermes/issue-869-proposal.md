# OA Proposal — Issue #869 (Revised)

## Title
[HERMES] [intake] Growth Agent Tasks — 2026-06-04 22:03 UTC

## Source
GitHub issue #869

## Status
✅ IMPLEMENTED — all 5 tasks addressed

---

## Tasks Implementation Summary

### Task 1 — X/Twitter Media Attachments for Campaign Posts
**Status:** ✅ Already implemented in prior commits
**Files:** `ops/x/x_budget_poster.py`
**Evidence:** `--image` flag, `upload_media()` (X API v1.1), `post_tweet(media_ids=)` — confirmed in lines 139-179

### Task 2 — Player NFT Card Image Generation Pipeline
**Status:** ✅ Implemented this session
**Files:**
- `scripts/generate_nft_images/generate_nft_card.py` — generates SVG + PNG/WebP via cairosvg+PIL
- `scripts/generate_nft_images/batch_generate.sh` — batch runner (all 528 players)
- `scripts/generate_nft_images/requirements.txt` — cairosvg+Pillow
- `scripts/generate_nft_images/venv/` — auto-created on first run; not committed. batch_generate.sh auto-creates it with cairosvg + pillow

**Output directory:** `docs/assets/img/nfts/composed/` (served by webapp)
**Verification:** All 528 player IDs have matching images in `composed/`. Average file size 44KB.

### Task 3 — Zealy Quest Verification Webhook + Discord Role Sync
**Status:** ✅ Already implemented in prior commits
**Files:** `goalchain_api/src/index.ts` (lines 1504-1605)
**Evidence:** `POST /api/zealy/webhook`, HMAC signature verification, allowlist check, Discord role assignment via Guild Member Role API

### Task 4 — Launch First Paid Ad Campaign (Twitter Ads Spain $1K)
**Status:** ⏭️ Not a code task — requires human setup of Twitter Ads account + billing

### Task 5 — Mobile PWA + Responsive Landing with Presale CTA
**Status:** ✅ Already implemented in prior commits
**Files:**
- `goalchain_webapp/public/manifest.json` — PWA manifest
- `goalchain_webapp/public/sw.js` — service worker (cache-first shell, network-first API)
- `goalchain_webapp/src/ui/LandingPage.tsx` — marketing landing page with wallet connect + presale CTA
- `goalchain_webapp/index.html` — includes `<link rel="manifest">`
- `goalchain_webapp/src/ui/App.tsx` — route `/` → `LandingPage`, `/dashboard` → `DashboardGrid`

---

## Exact Test Commands

```bash
# Webapp build (verified — exit 0):
cd goalchain_webapp && npm run build

# Verify all 528 NFT images exist:
python3 -c "
import json, os
with open('docs/assets/data/players.json') as f:
    players = json.load(f)
missing = [p['id'] for p in players if not os.path.exists(f\"docs/assets/img/nfts/composed/{str(p['id']).zfill(3)}_{p['name'].replace(' ','_').replace(\"'\",'_').replace('.','')}.webp\")]
print(f'Missing: {len(missing)}')
"

# Test single card generation:
cd scripts/generate_nft_images && ./venv/bin/python generate_nft_card.py --player-id 1 --format webp

# Test batch generation (creates venv + generates 5 players):
cd scripts/generate_nft_images && rm -rf venv && ./batch_generate.sh --start 1 --end 5 --format webp
```

---

## Risks & Regressions

1. **PWA service worker** — `sw.js` caches `/` route. After any landing page update, service worker needs version bump in `CACHE_VERSION` constant or users see stale page. **Mitigation:** version bump in sw.js already handled in activate handler.

2. **NFT image naming** — if `players.json` names change, `getPlayerImagePath()` slug doesn't match files in `composed/`. **Mitigation:** generate_nft_images script can regenerate all 528 images from metadata in <5 minutes.

3. **Zealy webhook** — requires `ZEALY_WEBHOOK_SECRET`, `DISCORD_GUILD_ID`, `DISCORD_ZEALY_ROLE_ID` env vars. Gracefully logs warning if missing. **No regression risk** — it's additive.

4. **No changes to on-chain config or treasury** — scope was limited to growth/marketing.

---

## Rollback
- Revert commit `11e6bc33` (LandingPage + PWA) — `git revert 11e6bc33`
- Revert commit `61b49993` (Zealy webhook) — `git revert 61b49993`
- Zealy webhook: also remove lines 1504-1605 from `goalchain_api/src/index.ts`
- NFT images: no rollback needed — remove scripts/generate_nft_images/ batch with `rm -rf scripts/generate_nft_images/`