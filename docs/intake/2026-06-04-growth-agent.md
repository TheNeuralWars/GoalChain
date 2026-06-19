---
source: growth-agent
date: 2026-06-04
model: opencode/deepseek-v4-flash-free
auto_generated: true
---
# Growth Agent Tasks — 2026-06-04 22:03 UTC

[0m
> build · deepseek-v4-flash-free
[0m
[0m• [0mExplore codebase for gaps[90m Explore Agent[0m
[0m✓ [0mExplore codebase for gaps[90m Explore Agent[0m
[0m
[0m# [0mTodos
[•] Analyze codebase and produce 3-5 high-impact growth tasks
[0m
[0m→ [0mRead docs/intake/2026-06-04-growth-agent.md[90m [limit=50][0m
[0m→ [0mRead ops/x/x_budget_poster.py[90m [limit=60][0m
[0m
[0m$ [0mls /data/apps/GoalChain/docs/assets/img/nfts/ | wc -l
44
[0m
[0m→ [0mRead scripts/marketing/campaign_budgets.json
[0m→ [0mRead goalchain_webapp/src/ui/NFTMarketplace.tsx[90m [limit=50][0m
[0m✱ [0mGrep "media|image|upload|media_id"[90m in ops/x · 0 matches[0m
[0m→ [0mRead goalchain_webapp/src/ui/NFTMarketplace.tsx[90m [offset=51, limit=100][0m
[0m✱ [0mGrep "zealy|quest|verify|webhook"[90m in goalchain_api/src · 10 matches[0m
[0m→ [0mRead goalchain_webapp/src/ui/App.tsx
[0m✱ [0mGrep "\.jpg|\.png|\.svg|img|image|src=|avatar"[90m in goalchain_webapp/src/ui/NFTMarketplace.tsx · 0 matches[0m
[0m→ [0mRead goalchain_api/src/index.ts[90m [offset=860, limit=60][0m
[0m→ [0mRead goalchain_webapp/src/ui/NFTMarketplace.tsx[90m [offset=151, limit=170][0m
[0m✱ [0mGlob "**/manifest.json"[90m in goalchain_webapp · 0 matches[0m
[0m✱ [0mGlob "**/service-worker*"[90m in goalchain_webapp · 0 matches[0m
[0m→ [0mRead hermes/discord-community-bot/src/index.ts[90m [limit=50][0m
[0m→ [0mRead docs/assets/data/nft_metadata_index.json[90m [limit=30][0m
[0m
[0m# [0mTodos
[✓] Analyze codebase and produce 3-5 high-impact growth tasks
[0m
---

## Task 1 — X/Twitter Media Attachments for Campaign Posts

**Priority:** P0 — Content & Marketing / Revenue
**Assigned Agent:** `x-scout`

**Description:** `ops/x/x_budget_poster.py` posts text-only tweets via X API v1 (1/day, 20/month cap), but the Degen Preseason campaign (commit `93558e18`) drives traffic with no visual assets. X API v2's `media/upload` endpoint supports attaching images — the repo has 44 NFT player card images in `docs/assets/img/nfts/` plus campaign creative opportunity. Modify the poster to accept an `--image` flag, upload via `POST https://upload.twitter.com/1.1/media/upload.json`, attach `media_ids` to the tweet payload. Update `x_daily_post.sh` to cycle existing player card images into the 7 daily content angles (roadmap, presale, vault, etc.).

**Expected Impact:** Tweets with images get 2-3x more engagement (likes, retweets, link clicks). Every text-only post today is leaving 50-70% of potential campaign reach on the table. With 20 posts/month budget, this directly amplifies Degen Preseason conversion without spending a dollar more on ads.

---

## Task 2 — Player NFT Card Image Generation Pipeline

**Priority:** P1 — Revenue / Product Quality
**Assigned Agent:** `player-images`

**Description:** The NFT marketplace (`NFTMarketplace.tsx:254`) renders `⚽` emoji for every listing because only 44 of 528 player images exist in `docs/assets/img/nfts/`. The metadata index (`nft_metadata_index.json`) references `.webp` filenames and contains all attributes (country, rarity, position, stats, club, market value). Build a generation script (`scripts/generate_nft_images/`) that reads `players.json` + `nft_metadata_index.json`, renders each player card as an SVG overlay (gradient background, country flag emoji, name, rarity badge, stat bars), and outputs to `docs/assets/img/nfts/{id}_{slug}.webp`. Use a headless browser (playwright/puppeteer) for consistent high-quality rendering if SVG-in-browser quality is needed. Add the script to `goalchain-sdk/package.json` as `npm run generate-nft-images`.

**Expected Impact:** Turns the marketplace from a text list into a premium visual card shop. The 44 existing images were clearly handcrafted (design-heavy, slow to scale); an automated SVG pipeline can produce all 528 in <5 minutes. Players previewing cards is the #1 conversion driver for any NFT marketplace — without it, the treasury fix (`412d62ae`) unlocks SOL transfers but nobody will actually buy what they can't see.

---

## Task 3 — Zealy Quest Verification Webhook + Discord Role Sync

**Priority:** P1 — Community Growth
**Assigned Agent:** `hermes-ceo`

**Description:** Zealy Season 1 is referenced in Discord content templates (`discord_channel_router.js:138`) and i18n strings, but there is zero integration: no webhook handler, no quest verification, no role assignment. Add `POST /api/zealy/webhook` in `goalchain_api/src/index.ts` that accepts Zealy's completion payload (wallet, user ID, quest ID). On receipt: (1) verify the wallet isn't spoofed by matching against `whitelist.json` or an on-chain check, (2) call Discord's Guild Member Role API (bot already has `GuildMembers` intent at `hermes/discord-community-bot/src/index.ts:12`) to assign the `Degen` or `Quests` role, (3) log to `data/zealy_completions.json` for analytics. Configure Zealy webhook URL via `ZEALY_WEBHOOK_SECRET` env var.

**Expected Impact:** Zealy is driving traffic to goalchain.fun but there is no closed loop — users complete quests, nothing happens, retention drops. A verification webhook that auto-assigns Discord roles and logs completions creates the progression loop Zealy is designed for, keeps users engaged in Discord, and gives the team a measurable Zealy-to-presale funnel. This is a <200-line backend change plus Discord bot config.

---

## Task 4 — Launch First Paid Ad Campaign (Twitter Ads Spain $1K)

**Priority:** P2 — Revenue / Community Growth
**Assigned Agent:** `marketing-active`

**Description:** `scripts/marketing/campaign_budgets.json` allocates $6,500 across 5 campaigns but **no ad accounts exist and no ads have ever run**. Activate the simplest campaign first: Twitter Ads — Football Fans (Spain) at $1,000 budget. Steps: (1) create Twitter Ads account under @GoalChainSOL, (2) set up conversion tracking via `goalchain.fun/?utm_source=twitter_ad&utm_campaign=spain_football` UTM parameters (the webapp already has Vercel Speed Insights in `main.tsx` — add a minimal conversion pixel or event), (3) launch a single promoted tweet using the existing Degen Preseason copy from `x_daily_post.sh`, (4) add ROI logging into `scripts/marketing/roi_audit.py`. Document the account setup process in `docs/ADS_SETUP.md` so the remaining $5,500 can be deployed.

**Expected Impact:** $6,500 in earmarked budget is sitting idle while organic reach is constrained (20 X posts/month). Even a $1,000 test at $0.10-$0.50 CPC can deliver 2,000-10,000 clicks to goalchain.fun — more than organic X posts generate in a month. The first campaign proves the ad pipeline and provides real CPC/CVR data to optimize the remaining budget. Zero ad spend = zero attributable conversions from the largest marketing line item.

---

## Task 5 — Mobile PWA + Responsive Landing with Presale CTA

**Priority:** P2 — Product Quality / Revenue
**Assigned Agent:** `daily-routine`

**Description:** The webapp has no `manifest.json`, no service worker, no mobile-responsive landing page. The root `/` route renders `DashboardGrid` (an ops dashboard) instead of a marketing landing page. Most Zealy/Discord/X traffic arrives on mobile wallets (Phantom mobile, Solflare). Steps: (1) create `goalchain_webapp/public/manifest.json` with app name, icons, theme color, start URL; add `<link rel="manifest">` to `index.html`, (2) add a basic service worker for offline asset caching, (3) create a marketing landing route at `/` (`LandingPage.tsx`) with: hero section ("GoalChain — Football Meets DeFi"), $GCH presale call-to-action ("Register Wallet" linking to whitelist form), live player count (528 NFTs), economy health badge placeholder, and wallet connect button. Move `DashboardGrid` to `/dashboard`. Add responsive CSS breakpoints.

**Expected Impact:** The Degen Preseason campaign drives mobile-first traffic to a devnet-only, Spanish-language ops dashboard with no presale entry point — a 90% bounce rate situation. A mobile-optimized landing page with a visible presale CTA at `/` converts campaign traffic into whitelist signups. PWA support enables "Add to Home Screen" for returning users. This is the product-side equivalent of actually opening the door when the campaign knocks.

---
*Auto-generated by GoalChain Growth Agent (opencode/deepseek-v4-flash-free)*
