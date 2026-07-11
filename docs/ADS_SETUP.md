# GoalChain Ads Setup Guide

> How to activate the first paid campaign from `scripts/marketing/campaign_budgets.json`.

---

## Budget Allocation

```json
{
  "total_budget": 6500,
  "campaigns": {
    "Twitter Ads - Football Fans (Spain)": 1000,
    "Twitter Ads - Crypto Degens (LatAm)": 1800,
    "Meta Ads - Fantasy Sports (UK)": 300,
    "Meta Ads - Sports Bettors (Brazil)": 1500,
    "Twitter Ads - World Cup Trends (Argentina)": 1900
  }
}
```

**Priority order:**
1. Twitter Ads — Football Fans (Spain) — $1,000 ← Start here
2. Twitter Ads — Crypto Degens (LatAm) — $1,800
3. Twitter Ads — World Cup Trends (Argentina) — $1,900
4. Meta Ads — Sports Bettors (Brazil) — $1,500
5. Meta Ads — Fantasy Sports (UK) — $300

---

## Step 1 — Twitter Ads Account Setup

### Prerequisites
- Twitter/X account: **@GoalChainSOL**
- A verified X Ads account (requires credit card + phone verification)

### Steps

1. Go to **ads.twitter.com** and sign in with @GoalChainSOL
2. Click **"Create new campaign"** → select **"Promoted Tweets"**
3. Campaign settings:
   - Campaign name: `Degen Preseason — Spain Football`
   - Daily budget: $33 (~$1,000/month)
   - Start date: today
   - Funding instrument: add payment method first

4. Select the tweets to promote (use copy from `ops/x/x_daily_post.sh` angles, or create new promoted tweet with the Degen Preseason copy)

5. Targeting:
   - Location: **Spain**
   - Interests: Football/Soccer, Sports Betting, Cryptocurrency
   - Age: 18–45
   - Keyword: `World Cup 2026`, `football NFT`, `Solana`

6. Review and launch

---

## Step 2 — UTM + Conversion Tracking

### UTM Parameters

All campaign links must use these UTM parameters:

| Campaign | Full URL |
|---|---|
| Spain Football | `https://goalchain.fun/?utm_source=twitter_ad&utm_medium=paid&utm_campaign=spain_football` |
| LatAm Crypto | `https://goalchain.fun/?utm_source=twitter_ad&utm_medium=paid&utm_campaign=latam_crypto` |
| Argentina WC | `https://goalchain.fun/?utm_source=twitter_ad&utm_medium=paid&utm_campaign=argentina_wc` |
| Brazil Bettors | `https://goalchain.fun/?utm_source=meta_ad&utm_medium=paid&utm_campaign=brazil_bettors` |
| UK Fantasy | `https://goalchain.fun/?utm_source=meta_ad&utm_medium=paid&utm_campaign=uk_fantasy` |

### Adding UTM to Promoted Tweets

In the Twitter Ads composer, paste the full UTM URL as a link in your promoted tweet copy.

### Conversion Tracking (Vercel)

The webapp already has Vercel Speed Insights in `main.tsx`. To add conversion event tracking:

```typescript
// In goalchain_webapp/src/main.tsx or the landing page component
import { trackGoalchainSignup } from '../utils/analytics';

// After successful wallet registration / presale signup:
trackGoalchainSignup({ source: new URLSearchParams(window.location.search).get('utm_campaign') });
```

For now, use Vercel Analytics dashboard to monitor traffic spikes from UTM parameters.

---

## Step 3 — Launch First Campaign

Copy for the first promoted tweet (from `ops/x/x_daily_post.sh` presale_urgency angle):

```
⚡ GoalChain Presale is LIVE ⚡

1 SOL = 50,000 $GCH
~30% of hard cap already raised.
528 Genesis NFTs. Real yield. Real biometrics.

→ goalchain.fun/?utm_source=twitter_ad&utm_medium=paid&utm_campaign=spain_football

#GoalChain #Solana #Presale
```

Expected CPC: $0.10–$0.50 (Spain football audience)
Expected CPM: $3–$8
Budget duration: ~20–30 days at $33/day

---

## Step 4 — ROI Logging

After launch, run the ROI audit periodically:

```bash
# Check spend vs conversions
python3 scripts/marketing/roi_audit.py --campaign spain_football

# Expected metrics to track:
# - Impressions, clicks, CPC
# - goalchain.fun signups (via UTM source=twitter_ad)
# - Whitelist additions (data/whitelist.json filtered by utm_source)
# - SOL raised (treasury dashboard)
```

---

## Step 5 — Remaining $5,500 Deployment

Once the Spain campaign has 7 days of data:

1. Calculate CPA (cost per acquisition)
2. Compare against organic X post performance
3. Scale winning campaign, optimize or kill underperformers
4. Deploy LatAm + Argentina Twitter campaigns next (same process)

---

## Environment Variables for ROI Audit

The `roi_audit.py` script needs:
- `TWITTER_ADS_API_KEY` — from ads.twitter.com developer portal
- `GOOGLE_ANALYTICS_PROPERTY_ID` — GA4 property for goalchain.fun
- Or use Vercel Analytics export for UTM-based conversion data

---

## Notes

- No Twitter Ads API key is needed for the actual campaign setup (UI only)
- The `campaign_budgets.json` file tracks planned spend — actual spend comes from Twitter Ads billing
- Coordinate with the `social` agent before launching to avoid duplicate content