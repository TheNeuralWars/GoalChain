# OA Proposal — Issue #356

## Title
[OPENCODE] [GTM] UTM Funnel Tracking - wallet connect to first bet to earn

## Source
GitHub issue #356

## Objective
## Objective
Add funnel analytics to goalchain_webapp tracking the complete user journey: wallet connect → Starting XI set → first penalty bet → first  earned. Powers GTM attribution and retention cohorts.

## Context
- Webapp: goalchain_webapp/ (React/Vite, port 5173)
- Wallet adapter: @solana/wallet-adapter-react
- On-chain interactions via goalchain-sdk
- No external analytics (PostHog, Mixpanel) — self-hosted events to API

## Required Events (client → API)
POST /api/v1/gtm/events
{
  event: "wallet_connected" | "xi_set" | "first_bet" | "first_earn" | "return_visit",
  wallet: "<pubkey>",
  utm_source: "twitter" | "youtube" | "telegram" | "reddit" | "organic" | "direct",
  utm_medium: "social" | "video" | "community" | "search",
  utm_campaign: "mundial_2026_launch" | "genesis_squad" | "penalty_beta",
  utm_content: "player_reveal_argentina" | "jackpot_announcement" | "tutorial_video",
  metadata: { 
    xi_players: [<mint_ids>], 
    bet_amount_gch: 100,
    earnings_gch: 50 
  }
}

## Storage
- Append-only JSONL in /data/apps/hermes/logs/gtm_events.jsonl (rotated daily)
- Or SQLite table: events (id, ts, wallet, event, utm_*, metadata_json)

## API Endpoints (goalchain_api)
GET /api/v1/gtm/funnel?period=24h|7d|30d
Response: {
  wallet_connected: 1250,
  xi_set: 680,
  first_bet: 412,
  first_earn: 387,
  conversion_rates: { connect_to_xi: 54.4, xi_to_bet: 60.6, bet_to_earn: 93.9 }
}

GET /api/v1/gtm/cohorts?period=7d

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-356` and close draft PR.
