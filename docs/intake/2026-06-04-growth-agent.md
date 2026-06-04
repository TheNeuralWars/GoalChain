---
source: growth-agent
date: 2026-06-04
model: opencode/mimo-v2.5-free
auto_generated: true
---
# Growth Agent Tasks — 2026-06-04 17:45 UTC

[0m
> build · mimo-v2.5-free
[0m
[0m• [0mExplore GoalChain codebase structure[90m Explore Agent[0m
[0m✓ [0mExplore GoalChain codebase structure[90m Explore Agent[0m
[0m✗ [0mRead goalchain_webapp/src/App.tsx failed
[91m[1mError: [0mFile not found: /data/apps/GoalChain/goalchain_webapp/src/App.tsx
[0m→ [0mRead goalchain_oracle/src/vault_crank.ts
[0m→ [0mRead ai_context/06_marketing_pitch/GOALCHAIN_PITCH_DECK_EN.md
[0m✱ [0mGlob "goalchain_webapp/src/**/*.tsx"[90m 24 matches[0m
[0m→ [0mRead ai_context/04_art_visuals/ART_PIPELINE.md
[0m✱ [0mGrep "presale|Presale|PRESALE"[90m in goalchain_webapp/src · 0 matches[0m
[0m→ [0mRead goalchain_webapp/src/ui/App.tsx
[0m✱ [0mGrep "presale|whitelist"[90m in goalchain_api/src · 9 matches[0m
[0m→ [0mRead docs/assets/js/i18n.js[90m [offset=390, limit=30][0m
[0m✱ [0mGlob "assets/nft*/**/*"[90m 0 matches[0m
[0m✱ [0mGlob "assets/img/nft*/**/*"[90m 0 matches[0m
[0m→ [0mRead assets
[0m✱ [0mGrep "players\.json"[90m in ai_context/03_data · 1 match[0m
[0m→ [0mRead ai_context/03_data/PLAYERS_LIST.md[90m [limit=30][0m
Here are **5 high-impact actionable tasks** based on deep codebase analysis:

---

## Task 1: Ship Presale UI to Webapp

**Title:** Build `/presale` route with SOL contribution widget  
**Priority:** P0 — Revenue Blocker  
**Assigned Agent:** `repo-deepdive`  

**Description:** The on-chain `contribute_presale` instruction is fully implemented in the Solana program (`goalchain_program/src/lib.rs:1176`), the API exposes `presaleActive` at `/api/economy/config`, and i18n strings for the presale UI already exist in `docs/assets/js/i18n.js:394-406` (calculator, rate display, CTA). However, **there is zero presale route in the webapp** — `goalchain_webapp/src/ui/App.tsx` has no `/presale` path. Users cannot contribute SOL to buy $GCH through the UI. Create a `PresalePortal.tsx` component using the existing i18n keys, wire it to the SDK's `contribute_presale` instruction via `@solana/wallet-adapter-react`, and add the route to `App.tsx`. Include a SOL→$GCH calculator (rate: 1 SOL = 50,000 $GCH), progress bar toward hard cap, and contribution history.

**Expected Impact:** Direct revenue unlock — enables presale contributions from the webapp. Currently all presale traffic is lost because there's no UI. Target: convert existing Discord/Zealy community into presale contributors.

---

## Task 2: Generate 528 NFT Player Images

**Title:** Execute art pipeline to produce Genesis Squad trading cards  
**Priority:** P0 — NFT Sales Blocker  
**Assigned Agent:** `player-images`  

**Description:** The art pipeline is fully documented in `ai_context/04_art_visuals/ART_PIPELINE.md` (5-layer composition: background → player → chassis → branding → stats). All 528 player prompts exist across `ai_context/nft_master_prompts_1_50.json` through `nft_master_prompts_501_528.json`. Rarity backgrounds exist in `assets/rarity_backgrounds/` (steel, gold, diamond PNGs). However, `assets/` contains zero generated NFT images — the pipeline was never executed. Build a Python script using Pillow (as specified in ART_PIPELINE.md) to: (1) generate player renders via an image API (Grok/DALL-E) using the existing prompts, (2) composite the 5-layer stack with rarity frames, (3) output 528 PNGs at 2000×3000px. Start with the 10 Mythic players for a hero launch batch.

**Expected Impact:** Enables NFT minting and marketplace listing. Without images, the 528-player collection cannot be sold. A Mythic batch drop creates FOMO and validates the art quality before full collection mint.

---

## Task 3: Activate Vault Crank on Mainnet

**Title:** Flip vault crank from dry-run to live execution  
**Priority:** P1 — Core Revenue Mechanism  
**Assigned Agent:** `jito-strategy`  

**Description:** `goalchain_oracle/src/vault_crank.ts` has a complete execute path (Jupiter v6 quote → swap SOL→GCH → on-chain burn) but is hardcoded to dry-run mode. The `VAULT_CRANK_EXECUTE` env var controls the switch (line 37). The yield split is configured: 60% buyback, 10% jackpot, 30% reinvest (lines 22-24). The execute path already handles mainnet detection, Jupiter API integration, priority fees, and graceful fallbacks. Action: (1) set `VAULT_CRANK_EXECUTE=1` in the oracle's systemd env, (2) fund the oracle keypair with SOL for tx fees, (3) set real `GCH_MINT` and `RPC_URL` env vars, (4) run one live crank cycle and verify `docs/data/burn_tracker.json` shows real tx hashes, (5) add a cron job for periodic execution. This is the "Infinity Burn" mechanism that creates deflationary pressure on $GCH.

**Expected Impact:** Activates the core tokenomics flywheel. Every vault yield cycle buys back $GCH and burns it forever, creating scarcity. This is the key selling point for presale investors — "your SOL is staked, yield buys back and burns $GCH."

---

## Task 4: Fix Pitch Deck Supply Discrepancy

**Title:** Correct Genesis Squad count from 1,248 to 528  
**Priority:** P1 — Credibility Risk  
**Assigned Agent:** `marketing-active`  

**Description:** `ai_context/06_marketing_pitch/GOALCHAIN_PITCH_DECK_EN.md` line 40 states "Genesis Squad (1,248 units)" but the official player registry (`ai_context/03_data/PLAYERS_LIST.md`) defines exactly 528 players with rarity distribution: 10 Mythic, 50 Legendary, 150 Epic, 318 Rare. This 2.4× discrepancy will be caught by any investor or partner doing due diligence. Edit the pitch deck to say "528 units" and update Slide 5's description to match the actual rarity tiers. Also audit all other marketing copy in `docs/` and `ai_context/` for the same 1,248 number.

**Expected Impact:** Prevents credibility damage during investor/partner meetings. A single factual error in a pitch deck undermines trust in the entire project. Quick fix, high leverage.

---

## Task 5: Launch Video Content Pipeline

**Title:** Activate HyperFrames video automation for X/Twitter  
**Priority:** P2 — Community Growth  
**Assigned Agent:** `x-scout`  

**Description:** `scripts/marketing/video-automation/` contains a complete HyperFrames (HeyGen) framework with `hyperframes.json`, `meta.json`, render commands (`npm run render` → MP4), and publish integration. However, there's no evidence of active video production. The X poster (`ops/x/x_budget_poster.py`) is limited to 1 post/day with 8 rotating text angles — adding short-form video (15-30s player highlights, match previews, presale countdowns) would dramatically increase engagement. Action: (1) create 3 video templates using HyperFrames — player spotlight, presale countdown, match preview, (2) wire into the daily post rotation so 1 in 4 posts includes a video, (3) render the first batch of 10 player spotlight videos for the Mythic/Legendary tier.

**Expected Impact:** Video content gets 5-10× more engagement than text on X/Twitter. With World Cup 2026 approaching, short-form football content is algorithmically boosted. This amplifies all other efforts (presale, NFT sales, community growth) by increasing reach.

---

### Summary Matrix

| # | Task | Priority | Agent | Revenue Impact | Effort |
|---|------|----------|-------|----------------|--------|
| 1 | Presale UI | P0 | repo-deepdive | **Direct** — enables SOL contributions | Medium |
| 2 | NFT Images | P0 | player-images | **Direct** — enables NFT sales | High |
| 3 | Vault Crank Live | P1 | jito-strategy | **Indirect** — drives $GCH deflation | Low |
| 4 | Fix Pitch Deck | P1 | marketing-active | **Indirect** — investor trust | Low |
| 5 | Video Pipeline | P2 | x-scout | **Indirect** — amplifies reach | Medium |

---
*Auto-generated by GoalChain Growth Agent (opencode/mimo-v2.5-free)*
