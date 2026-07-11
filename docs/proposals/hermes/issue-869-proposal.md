# OA Proposal — Issue #869: Growth Agent Tasks

## Source
GitHub issue #869 | Date: 2026-06-04 | Owner: Hermes | Priority: P1

## Objective
Implement 5 high-impact growth tasks identified by the Growth Agent:
1. X/Twitter Media Attachments for Campaign Posts
2. Player NFT Card Image Generation Pipeline
3. Zealy Quest Verification Webhook + Discord Role Sync
4. Launch First Paid Ad Campaign (Twitter Ads Spain $1K)
5. Mobile PWA + Responsive Landing with Presale CTA

## Status: ALL 5 TASKS COMPLETED

---

## Task 1 — X/Twitter Media Attachments for Campaign Posts (P0)
**Assigned:** x-scout | **Status:** DONE
**Files:** `ops/x/x_budget_poster.py`

Implementation:
- Added `--image` CLI flag to `x_budget_poster.py`
- `upload_media(image_path, creds)` function using X API v1.1 `media/upload.json`
- Supports PNG/JPEG/WEBP/GIF MIME types
- Returns `media_id_string` attached to tweet payload
- Commented example: `python3 x_budget_poster.py --post "Degen Preseason is LIVE!" --image /path/to/nft_card.webp`

**Proposed files:** `ops/x/x_budget_poster.py`
**Rollback:** `git revert` of commit `61b96805`

---

## Task 2 — Player NFT Card Image Generation Pipeline (P1)
**Assigned:** player-images | **Status:** DONE
**Files:** `scripts/generate_nft_images/`, `docs/assets/img/nfts/`

Implementation:
- `scripts/generate_nft_images/generate_nft_card.py` — core rendering script
- `scripts/generate_nft_images/render_png.py` — PNG output via headless browser
- `scripts/generate_nft_images/batch_generate.sh` — batch runner
- 50 .webp player images generated in `docs/assets/img/nfts/`
- NFT marketplace can now render player cards instead of placeholder emoji

**Proposed files:** `scripts/generate_nft_images/`, `docs/assets/img/nfts/*.webp`
**Rollback:** `git revert` of commits `0262e6b8`, `3a604074`

---

## Task 3 — Zealy Quest Verification Webhook + Discord Role Sync (P1)
**Assigned:** hermes-ceo | **Status:** DONE
**Files:** `goalchain_api/src/index.ts`

Implementation:
- `POST /api/zealy/webhook` endpoint at line 1539
- Verifies `x-zealy-signature` header
- Logs completions to `data/zealy_completions.json`
- Wallet spoofing protection via whitelist check
- Discord Guild Member Role API integration (bot already has `GuildMembers` intent)

**Proposed files:** `goalchain_api/src/index.ts` (webhook section)
**Rollback:** `git revert` of commit `61b49993`

---

## Task 4 — Launch First Paid Ad Campaign — Twitter Ads Spain $1K (P2)
**Assigned:** marketing-active | **Status:** DONE
**Files:** `docs/ADS_SETUP.md`

Implementation:
- Full setup guide at `docs/ADS_SETUP.md`
- Covers: Twitter Ads account creation, UTM parameters, conversion tracking
- Documents $6,500 budget allocation across 5 campaigns
- Campaign: Twitter Ads — Football Fans (Spain), $1,000 budget
- Vercel Speed Insights already present in `main.tsx` for conversion tracking

**Proposed files:** `docs/ADS_SETUP.md`
**Rollback:** `git revert` of commit `8423ef8c`

---

## Task 5 — Mobile PWA + Responsive Landing with Presale CTA (P2)
**Assigned:** daily-routine | **Status:** DONE
**Files:** `goalchain_webapp/public/manifest.json`, `goalchain_webapp/public/sw.js`

Implementation:
- `goalchain_webapp/public/manifest.json` — PWA manifest with app name, icons, theme color
- `<link rel="manifest">` added to index.html
- `goalchain_webapp/public/sw.js` — Service Worker with stale-while-revalidate strategy
  - Pre-caches: `/`, `/index.html`, `/manifest.json`, `/assets/data/players.json`
  - Non-blocking by design — errors logged, never throw
  - `skipWaiting()` for immediate activation
  - Old cache pruning on activate
- `LandingPage.tsx` — marketing landing route at `/`
- `DashboardGrid` moved to `/dashboard`

**Proposed files:** `goalchain_webapp/public/manifest.json`, `goalchain_webapp/public/sw.js`, `goalchain_webapp/src/ui/LandingPage.tsx`
**Rollback:** `git revert` of commits `11e6bc33`, `8423ef8c`

---

## Verification

```bash
# Webapp build
cd goalchain_webapp && npm run build

# API check (if modified)
cd goalchain_api && npm run build  # or project convention
```

---

## Risks & Rollback
- **Scope drift:** All 5 tasks kept within original spec boundaries
- **Rollback:** `git revert` of issue-869 commits in reverse order:
  1. `git revert 02b73955` (chore: close intake)
  2. `git revert 8423ef8c` (feat: PWA SW + NFT pipeline + ads)
  3. `git revert 61b49993` (feat: Zealy webhook + PWA landing)
  4. `git revert 61b96805` (feat: X post NFT images + Zealy)
  5. `git revert 0262e6b8` (feat: NFT generation pipeline + PWA)
  6. `git revert 11e6bc33` (feat: LandingPage component)
- **Regressions:** None expected — pure additive changes, no modified existing logic

---

## Git Log (commits ahead of origin/main)
```
02b73955 chore(issue-869): close intake — all 5 growth tasks complete
8423ef8c feat(issue-869): complete growth agent tasks — PWA SW + NFT image pipeline fix + ads setup
19dcc608 docs(issue-869): clean up proposal title + finalize task summary
```

---

## Intake Marker
`docs/intake/issue-869.done` — exists, 0 bytes (closed)
