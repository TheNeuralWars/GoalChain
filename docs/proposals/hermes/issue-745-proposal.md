# OA Proposal — Issue #745

## Title
[OPENCODE] [DRAFT] Polymarket Bot: scanner.py - Market scanner with polymarket-cli

## Source
GitHub issue #745

## Objective
## Objective
Build scanner that runs every 15m via Hermes cron:

1. Fetch markets: `polymarket markets list --limit 500 -o json` → markets.json
2. For each market: fetch orderbook (`polymarket clob book $TOKEN_ID -o json`) + midpoint (`polymarket clob midpoint $TOKEN_ID -o json`)
3. Score each market on three factors:
   a) Gap between market price and probability estimate (from Nemotron/brain)
   b) Order book depth: min(bids_depth, asks_depth) ≥ $500
   c) Hours until resolution: sweet spot 4-168h (kill <4h or >168h)
4. Filter: kill 93% (gap<0.07, depth<$500, hours<4 or >168)
5. **NEW: Categorize & flag markets:**
   - `category`: "crypto_updown" | "crypto_directional" | "politics" | "sports" | "movies" | "other"
   - `is_updown`: boolean (short-term BTC/ETH Up/Down markets)
   - `regime_flag`: "normal" | "high_vol" | "news_shock" (based on volume spike, orderbook imbalance, recent news)
6. Output queue.json with survivors: {market, token_id, question, category, is_updown, regime_flag, gap, depth, hours, ev_score, midpoint}

Constraints:
- Read POLYMARKET_CLOB_URL from env (Hermes Vault)
- Read POLYMARKET_PK from env (Hermes Vault) for future signing
- Stateless, idempotent, logs to stdout
- No external deps beyond polymarket-cli + stdlib (python3, polars optional)
- Output to /data/apps/GoalChain/polymarket_bot/queue.json

Verification:
```bash
cd /data/apps/GoalChain/polymarket_bot
python scanner.py
cat queue.json | jq '. | length'  # should be 20-40 markets
cat queue.json | jq '.[0] | {market, token_id, category, is_updown, regime_flag, gap, depth, hours, ev_score}'
```

Files to create: scanner.py, requirements.txt, README.md, market_classifier.py

Auto-reinvest logic: scanner passes bankroll info + regime_flag to brain for Kelly sizing.

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-745` and close draft PR.
