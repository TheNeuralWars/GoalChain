# Proposal: Issue #869 — Growth Agent Tasks (2026-06-04)

## Source
docs/intake/2026-06-04-growth-agent.md (auto-dispatched by intake_goal_loop.sh)

## Owner
Hermes / FCC (Free Claude Code)

## Priority
P1

## Workflow
- Branch: `exp/opencode-issue-869` (draft PR, no direct main merge)
- DIRECT MAIN MODE: disabled (no `cambio urgente` in this session)
- One implementer only (FCC)

---

## Task Inventory (5 total, 2 already done)

| # | Task | Status | Owner |
|---|------|--------|-------|
| 1 | X/Twitter Media Attachments for Campaign Posts | ✅ DONE | x_budget_poster.py already has `--image` flag + `upload_media()` + media_ids in tweet payload. x_daily_post.sh already tries card images for player_spotlight angle. |
| 2 | Player NFT Card Image Generation Pipeline | ✅ DONE | scripts/generate_nft_images/ exists (generate_nft_card.py + batch_generate.sh). SDK has `generate-nft-images` npm script since commit dfdfc60b. |
| 3 | Zealy Quest Verification Webhook + Discord Role Sync | 🔨 TODO | goalchain_api/src/index.ts |
| 4 | Launch First Paid Ad Campaign (Twitter Ads Spain $1K) | ⏸ SKIP | External/execution — no code to write; doc in ADS_SETUP.md instead |
| 5 | Mobile PWA + Responsive Landing with Presale CTA | 🔨 TODO | goalworld_webapp/public/ |

---

## Implementation: Task 3 — Zealy Webhook + Discord Role Sync

### Files to touch
1. `goalchain_api/src/index.ts` — add `POST /api/zealy/webhook`
2. `docs/ZEALY_INTEGRATION.md` — integration guide (new)

### Changes

#### goalchain_api/src/index.ts
Add near existing webhook handlers (~line 870, after auth middleware):

```
POST /api/zealy/webhook
  Headers: x-zealy-signature (HMAC-SHA256 of raw body with ZEALY_WEBHOOK_SECRET)
  Body: { wallet, user_id, quest_id }
  Steps:
    1. Verify HMAC signature (reject if missing/mismatch)
    2. Log payload to data/zealy_completions.json (append only, rotate at 1000 entries)
    3. Call Discord Guild Member Role API to assign role:
       - Role name: "Degen" (default for any quest completion)
       - Bot token from DISCORD_BOT_TOKEN env var
       - Endpoint: PUT /guilds/{GUILD_ID}/members/{user_id}/roles/{ROLE_ID}
    4. Return 200 { ok: true }
  Errors: 401 bad signature, 500 Discord API fail
```

### Risks / Regressions
- **Risk**: Discord role API requires GuildMembers intent + bot has the right permissions. Bot already has intent per hermes/discord-community-bot/src/index.ts:12. Low risk.
- **Rollback**: Remove the webhook handler block from index.ts. No schema/data migration needed (append-only log).
- **Regressions**: None — purely additive endpoint.

### Test command
```bash
# Local simulation (no real Discord call):
curl -X POST http://localhost:3000/api/zealy/webhook \
  -H "Content-Type: application/json" \
  -d '{"wallet":"abc","user_id":"123","quest_id":"quest1"}'
# Expected: 401 without x-zealy-signature header
# Expected: 200 with correct HMAC
```

---

## Implementation: Task 5 — Mobile PWA + Responsive Landing

### Files to touch
1. `goalworld_webapp/public/manifest.json` — new PWA manifest
2. `goalworld_webapp/public/sw.js` — new service worker (offline cache)
3. `goalworld_webapp/index.html` — add `<link rel="manifest">` + service worker registration
4. `goalworld_webapp/src/ui/LandingPage.tsx` — new marketing landing component (new file)
5. `goalworld_webapp/src/ui/App.tsx` — route `/` → LandingPage, `/dashboard` → DashboardGrid

### Changes

#### 1. manifest.json
```json
{
  "name": "GoalChain — Football Meets DeFi",
  "short_name": "GoalChain",
  "description": "528 Genesis NFTs. Real yield. World Cup infrastructure.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00ff88",
  "icons": [
    { "src": "/assets/img/logo.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/assets/img/logo.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### 2. sw.js (service worker)
- Cache-first strategy for static assets (JS, CSS, images)
- Network-first for API calls
- Cache version: `goalchain-v1`

#### 3. index.html
Add inside `<head>`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#00ff88">
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

#### 4. LandingPage.tsx
Mobile-first marketing landing:
- Hero: "GoalChain — Football Meets DeFi"
- Sub: "528 Genesis NFTs. Real yield. World Cup infrastructure."
- Stats badge: "528 NFTs · 19 Batches · Presale LIVE"
- Presale CTA: "Register Wallet → goalchain.fun/#/presale"
- Wallet connect button (placeholder, links to presale)
- Footer: X/Twitter + Discord links

#### 5. App.tsx
```
/          → LandingPage (marketing landing)
/dashboard  → DashboardGrid (existing)
/marketplace → NFTMarketplace
```

### Risks / Regressions
- **Risk**: Changing `/` from DashboardGrid to LandingPage could break internal ops tooling if teams bookmark `/`. Mitigation: explicit `/dashboard` path kept for ops.
- **Rollback**: Revert App.tsx route changes. Delete manifest.json, sw.js. Remove link/script from index.html.
- **Regressions**: None for end users. Ops team may need to update bookmarks.

### Test command
```bash
cd goalworld_webapp && npm run build
# Expected: no TypeScript errors
# Expected: build/ contains manifest.json + sw.js
# Verify: open build/index.html and check manifest link present
```

---

## Task 4 — ADS_SETUP.md (documentation only)
Create `docs/ADS_SETUP.md` with step-by-step Twitter Ads account setup, UTM parameter guide, and ROI tracking instructions. No code risk.

---

## Exact test commands (final)

```bash
# API — Zealy webhook
curl -X POST http://localhost:3000/api/zealy/webhook \
  -H "Content-Type: application/json" \
  -H "x-zealy-signature: dummy" \
  -d '{"wallet":"test","user_id":"999","quest_id":"test"}'
# Expect 401 (no real secret)

# Webapp build
cd /data/apps/GoalChain/goalworld_webapp && npm run build

# SDK build (verify generate-nft-images script still referenced)
cd /data/apps/GoalChain/goalchain-sdk && npm run check
```

---

## Residual risks
1. **Zealy webhook**: HMAC verification must be implemented correctly to prevent spoofing. Discord role assignment depends on bot having correct permissions and GUILD_ID/ROLE_ID env vars configured.
2. **PWA**: LandingPage.tsx is a new component; no visual regression testing possible in headless mode. Recommend Nico visual QA on mobile viewport.
3. **Ops bookmarks**: `/` route change affects internal ops team — notify via Discord ops channel.

## Closing marker
Will touch `docs/intake/2026-06-04-growth-agent.md` to add `[IMPLEMENTED]` footer after all tasks done.