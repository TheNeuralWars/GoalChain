# GoalChain Ads Setup Guide

## Overview

This document guides the team through activating the first paid ad campaign from `scripts/marketing/campaign_budgets.json`.

**Total budget allocated:** $6,500 across 5 campaigns
**First priority:** Twitter Ads — Football Fans (Spain) @ $1,000

---

## Step 1 — Create Twitter Ads Account

1. Log in to [ads.twitter.com](https://ads.twitter.com) using `@GoalChainSOL`.
2. If no ad account exists, click **"Create new ad account"** and fill in:
   - **Account name:** `GoalChain SOL — Spain Football`
   - **Timezone:** UTC
   - **Currency:** USD
3. Note the **Account ID** (shown in the URL or account settings) — store it in `~/.hermes/credentials/ads.env` as `TWITTER_ADS_ACCOUNT_ID`.
4. Add funding source (credit card or PayPal). Twitter Ads requires a minimum of $10 to start.

---

## Step 2 — UTM Tracking Setup

The webapp already has Vercel Speed Insights in `main.tsx`. No code changes needed for UTM passthrough.

**UTM parameters for the Spain Football campaign:**

```
https://goalchain.fun/?utm_source=twitter_ad&utm_medium=promoted_tweet&utm_campaign=spain_football
```

Use this URL consistently across all ad creative. Vercel analytics (`/hub`, `/dashboard`, `/staking`) will automatically pick up the `utm_source` and `utm_campaign` params via the existing query-string handler.

**To add a conversion event (whitelist signup):**

In `goalchain_webapp/src/ui/hub/` (or the whitelist registration route), add:

```javascript
// Fire conversion when user submits wallet
if (new URLSearchParams(window.location.search).get('utm_source') === 'twitter_ad') {
  fetch('/api/analytics/conversion', {
    method: 'POST',
    body: JSON.stringify({
      source: 'twitter_ad',
      campaign: 'spain_football',
      event: 'whitelist_signup',
      wallet: publicKey?.toBase58(),
      timestamp: new Date().toISOString(),
    })
  }).catch(() => {}); // non-blocking
}
```

API endpoint `POST /api/analytics/conversion` needs to be added to `goalchain_api/src/index.ts` if not yet present — logs to `data/conversions.json`.

---

## Step 3 — Create the Promoted Tweet

1. Go to **Twitter Ads → Creatives → Tweets** and click **"Create new tweet"**.
2. Use copy from `ops/x/x_daily_post.sh` Degen Preseason angle, e.g.:

```
Degen Preseason is LIVE. ⚽

Stake $GCH, collect Genesis NFT players, and earn yield via Jito on Solana.

🚀 Join the whitelist before the 5,000 SOL hard cap fills:
goalchain.fun/?utm_source=twitter_ad&utm_campaign=spain_football
```

3. Attach a player card image from `docs/assets/img/nfts/composed/` (use `001_Lionel_Satoshi.webp` or similar Mythic card).
4. Click **"Promote this tweet"** and target:
   - **Location:** Spain
   - **Interests:** Football, Soccer, Sports Betting, Cryptocurrency
   - **Devices:** Mobile preferred (most Zealy traffic is mobile)
   - **Budget:** $10–20/day, $1,000 total
   - **Bid strategy:** Automatic (let Twitter optimize)

---

## Step 4 — ROI Audit Logging

If `scripts/marketing/roi_audit.py` doesn't exist yet, create it:

```python
#!/usr/bin/env python3
"""
roi_audit.py — GoalChain Ad ROI Audit
Reads conversions from data/conversions.json and reports spend vs. attributed signups.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone

SPEND = {
    "spain_football": 1000.0,
    "latam_crypto":   1800.0,
    "uk_fantasy":     300.0,
    "brazil_sports":  1500.0,
    "argentina_wc":   1900.0,
}

def audit():
    conv_file = Path(__file__).parent.parent / "goalchain_api" / "data" / "conversions.json"
    conversions = []
    if conv_file.exists():
        try:
            conversions = json.loads(conv_file.read_text())
        except Exception:
            pass

    twitter = [c for c in conversions if c.get("source") == "twitter_ad"]
    unique_wallets = set(c.get("wallet") for c in twitter if c.get("wallet"))

    total_spend = sum(SPEND.values())
    twitter_spend = SPEND.get("spain_football", 0)

    print(f"\n📊 GoalChain Ad ROI Audit — {datetime.now(timezone.utc).strftime('%Y-%m-%d')}")
    print(f"   Total allocated budget: ${total_spend:,.0f}")
    print(f"   Spain Football spend:   ${twitter_spend:,.0f}")
    print(f"   Twitter-attributed conversions: {len(twitter)}")
    print(f"   Unique wallets:         {len(unique_wallets)}")
    if unique_wallets:
        cpa = twitter_spend / len(unique_wallets)
        print(f"   Cost per acquisition:   ${cpa:.2f}")
    else:
        print(f"   ⚠️  No conversions yet — campaign may still be running or UTM not firing.")
    print(f"\n   Remaining campaigns to activate:")
    for name, budget in SPEND.items():
        if name != "spain_football":
            print(f"   - {name}: ${budget:,.0f}")

if __name__ == "__main__":
    audit()
```

Run with: `python3 scripts/marketing/roi_audit.py`

---

## Step 5 — Activate Remaining Campaigns

After the Spain test delivers data (wait 3–5 days or 500+ impressions):

| Campaign | Budget | Target |
|---|---|---|
| Twitter Ads — Crypto Degens (LatAm) | $1,800 | Mexico, Brazil, Argentina — crypto, DeFi, sports betting |
| Twitter Ads — World Cup Trends (Argentina) | $1,900 | Argentina — football, Messi, World Cup trending topics |
| Meta Ads — Sports Bettors (Brazil) | $1,500 | Brazil — Facebook/Instagram, sports betting, fantasy football |
| Meta Ads — Fantasy Sports (UK) | $300 | UK — Instagram, fantasy football, Premier League |

For Meta Ads: create account at [business.facebook.com](https://business.facebook.com) → Ads Manager, link Instagram to cross-promote.

---

## Environment Variables

Add to `~/.hermes/credentials/ads.env`:

```bash
export TWITTER_ADS_ACCOUNT_ID="your_account_id_here"
export ADS_SPEND_LOG="/data/apps/goalchain/goalchain_api/data/conversions.json"
```

---

## Verification Commands

```bash
# Check ROI audit (after conversions accumulate)
python3 scripts/marketing/roi_audit.py

# Verify UTM passthrough (open in browser)
open "https://goalchain.fun/?utm_source=twitter_ad&utm_campaign=spain_football"
# Check browser console for [Zealy] or [Analytics] log messages

# Verify webapp build
cd goalchain_webapp && npm run build

# Verify API typecheck
cd goalchain_api && npx tsc --noEmit
```

---

## Rollback

If a campaign underperforms (< 0.1% CTR after 1,000 impressions):

1. Pause campaign in Twitter Ads dashboard
2. Do NOT delete the campaign — keep for A/B comparison
3. Adjust creative (new image, different copy angle) and re-launch

No code rollback needed — UTM params and the conversion tracking endpoint are additive changes.