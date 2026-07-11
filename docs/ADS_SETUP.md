# Twitter Ads Setup Guide — GoalChain Spain Football Campaign

**Campaign:** Twitter Ads — Football Fans (Spain), $1,000 budget
**Owner:** Nico / Marketing
**Last updated:** 2026-06-11

---

## Overview

`scripts/marketing/campaign_budgets.json` allocates $6,500 across 5 campaigns. This guide activates the first ($1,000 Twitter Ads — Spain Football Fans). Once the pipeline is proven, the remaining $5,500 can be deployed following the same steps.

---

## Prerequisites

- Twitter/X account: **@GoalChainSOL** (must have email verified)
- Twitter Ads account created at [ads.twitter.com](https://ads.twitter.com)
- Billing method configured (credit card or prepaid)
- UTM-parameterised links already exist in the webapp (Vercel Speed Insights is already present in `main.tsx`)

---

## Step 1 — Create Twitter Ads Account

1. Go to [ads.twitter.com](https://ads.twitter.com) and sign in as @GoalChainSOL
2. Click **"Create new ads account"**
3. Select **"Spain"** as the timezone + country
4. Set currency: **USD**
5. Add a billing method (credit card)
6. Account is ready — note the **Ads Account ID** (found in Account Settings)

---

## Step 2 — Configure Conversion Tracking

GoalChain webapp already has Vercel Speed Insights. Add a minimal Twitter conversion pixel to `goalchain_webapp/index.html` inside `<head>`:

```html
<!-- Twitter Website Tag -->
<script>
  !function(e,t,n,s,u,a){e.twq||((a=e.twq=function(){a.exe?a.exe.apply(a,arguments):a.queue.push(arguments)}).version='1.1',a.queue=[],(u=t.createElement(n)).src='https://static.ads-twitter.com/uwt.js',u.async=!0,(s=t.getElementsByTagName(n)[0]).parentNode.insertBefore(u,s))}(window,document,'script');
  twq('init','YOUR_TWITTER_PIXEL_ID');
  twq('track','PageView');
</script>
```

Replace `YOUR_TWITTER_PIXEL_ID` with the pixel ID from your Twitter Ads account (Settings → Events → Create pixel).

**UTM-tagged links** for this campaign are already in use:
- `https://goalchain.fun/?utm_source=twitter_ad&utm_campaign=spain_football`

To track whitelist signups as a conversion event, add this to the registration form success handler:
```javascript
// In hub or registration component
twq('track', 'CompleteRegistration');
```

---

## Step 3 — Create Campaign

1. In Twitter Ads, go to **Campaigns → Create campaign**
2. Choose **"Promote Tweets"** objective
3. Set **Daily budget:** $30/day (~$1,000 / 30 days = $33/day cap; start at $30 for safety)
4. Set **Campaign duration:** 30 days
5. **Bidding:** Automatic (Twitter optimizes delivery)
6. **Targeting:**
   - Country: Spain
   - Interests: Football, Soccer, La Liga, Champions League, Sports Betting, Crypto
   - Age: 18–45
   - Language: Spanish
7. Exclude: Accounts already following @GoalChainSOL (avoid paying for existing followers)

---

## Step 4 — Create Promoted Tweet

Use the Degen Preseason copy already drafted in `ops/x/x_daily_post.sh` angles. Example tweet:

```
⚽⚽⚽ Degen Preseason is LIVE ⚽⚽⚽

Staked SOL → Auto-burns $GCH → Real yield.
528 Genesis NFTs. 10 Mythic. Zero paper hands.

Join the whitelist → https://goalchain.fun/?utm_source=twitter_ad&utm_campaign=spain_football

$SOL | @GoalChainSOL
```

**Do NOT include emoji-only or vague copy** — Twitter's algorithm penalises low-engagement promoted tweets. The tweet above has a clear CTA and URL.

---

## Step 5 — Launch + Monitor

1. Launch the campaign from Twitter Ads dashboard
2. **Day 1–3:** Check impressions, CTR, spend rate
3. **Day 7:** Review conversion pixel data in Twitter Events
4. **Day 14:** ROI calculation using `scripts/marketing/roi_audit.py`

Expected targets:
| Metric | Target |
|--------|--------|
| CPC | $0.10 – $0.50 |
| CTR | > 1.5% |
| Cost per whitelist signup | < $5 |
| Total clicks (30 days) | 2,000 – 10,000 |

---

## ROI Audit

After campaign ends (or every 2 weeks), run:

```bash
cd scripts/marketing
python3 roi_audit.py --campaign spain_football --start-date 2026-06-11
```

Update `campaign_budgets.json` status field when campaign is complete.

---

## Remaining $5,500 Budget Allocation

Once this $1,000 campaign proves ROI, deploy:

| Campaign | Budget | Platform | Notes |
|----------|--------|----------|-------|
| Spain Football (Phase 2) | $1,000 | Twitter Ads | Double down if CPC < $0.30 |
| English-Speaking Markets | $1,500 | Twitter/Reddit | UK, US, LatAm |
| Crypto Community | $1,500 | Reddit, Discord Promoted | DeFi, Solana, NFT subs |
| Creator Partnerships | $1,000 |手动 | Micro-influencers on X |
| Retargeting | $500 | Twitter Retargeting | Visitors who didn't convert |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Campaign not approved | Twitter reviews new advertisers for 24–48h. Check "Needs Review" tab |
| Low impressions | Raise bid or expand targeting interests |
| High CPC (> $1) | Narrow targeting or switch to automatic bidding |
| Pixel not firing | Use Twitter Pixel Helper Chrome extension to debug |
| Billing declined | Check credit card expiry; Twitter Ads requires prepaid credit |

---

## Contacts

- Twitter Ads Support: [@TwitterAds](https://x.com/TwitterAds)
- GoalChain campaign owner: Nico
- Technical contact for pixel: dev agent