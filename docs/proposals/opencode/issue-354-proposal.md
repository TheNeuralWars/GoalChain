# OA Proposal — Issue #354

## Title
[OPENCODE] [GTM] Public Dashboard API - jackpot, burns, active users, top earners

## Source
GitHub issue #354

## Objective
## Objective
Build a public read-only API in goalchain_api that exposes real-time on-chain metrics for GTM proof-as-marketing (Bencera playbook). This powers the public dashboard, X/Telegram auto-posts, and YouTube video overlays.

## Context
- GoalChain program ID: FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg (devnet/mainnet)
- Oracle: goalchain_oracle provides match data, player stats
- Economic blueprint: docs/ECONOMIC_BLUEPRINT.md (sinks, emissions, jackpot, rent-to-earn)
- Current API: goalchain_api/ (Express, port 3001, consumes goalchain-sdk)

## Required Endpoints
GET /api/v1/gtm/dashboard
Response: {
  jackpot: { total_usd, total_gch, last_updated_slot },
  burns_24h: { gch_amount, usd_equiv, tx_count },
  active_users_24h: { starting_xi_set, bets_placed, unique_wallets },
  top_earners_24h: [{ wallet, gch_earned, rank, player_names }],
  penalty_betting: { volume_gch, volume_usd, bets_count, house_cut_gch },
  supply_metrics: { circulating, burned_total, inflation_rate_24h },
  mystery_nft_progress: { by_country: { country: { completed_albums, total_holders } } }
}

GET /api/v1/gtm/leaderboard?period=24h|7d|30d
Paginated top earners with wallet, earnings, starting XI composition

GET /api/v1/gtm/jackpot/history?limit=100
Time-series for charting jackpot growth

## Technical Notes
- Use goalchain-sdk for on-chain reads (no new deps)
- Cache responses 60s (Redis in-memory or node-cache)
- Handle missing accounts gracefully (return zeros, not 500)
- Add CORS headers for public dashboard consumption
- Rate limit: 60 req/min per IP

## Verification
- curl localhost:3001/api/v1/gtm/dashboard returns valid JSON with all fields
- Response time < 500ms (cached)
- No errors when oracle/program accounts not yet initialized

## Skill Hints

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #354
