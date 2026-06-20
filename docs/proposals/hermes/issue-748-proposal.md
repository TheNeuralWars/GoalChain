# OA Proposal — Issue #748

## Title
[OPENCODE] [DRAFT] Polymarket Bot: exit_monitor.py - Three-trigger exit strategy (daemon)

## Source
GitHub issue #748

## Objective
## Objective
Daemon monitoring open positions (positions.json), triggers exits every 60s:

**Core Exit Triggers (from poly_data analysis — 91% exits early):**
1. **TARGET HIT**: current_price ≥ entry_price + 0.85 * expected_gap (take profit at 85% of move)
2. **VOLUME SPIKE**: 10m volume > 3x avg_10m_volume (smart money leaving — PRIMARY exit signal)
3. **TIME DECAY**: hours_since_entry > 24h AND |price_change| < 0.02 (stale thesis)

**NEW: Regime Change Exits (critical — antpalkin lesson):**
4. **REGIME FLIP**: brain.regime_check.market_flipped == true → exit ALL positions immediately (market structure changed)
5. **LIQUIDATION CASCADE**: orderbook depth drop > 50% in 1m → exit (prevents stuck positions)
6. **WHALE EXIT**: any of 47 target wallets closes same position → reduce 50% or full exit

**On Exit Trigger:**
- Place opposite order via polymarket-cli (market order for speed on regime/liquidation exits; limit for target/volume)
- Calculate realized PnL, update trades.json with:
```json
{
  "market": "...",
  "token_id": "...",
  "entry_price": 0.42,
  "exit_price": 0.61,
  "size": 12.50,
  "pnl": 2.37,
  "reason": "TARGET_HIT|VOLUME_SPIKE|TIME_DECAY|REGIME_FLIP|LIQUIDATION_CASCADE|WHALE_EXIT",
  "timestamp": "2026-06-13T16:45:00Z",
  "kelly_fraction_at_entry": 0.08,
  "regime_at_exit": "news_shock"
}
```
- Update positions.json: status=CLOSED
- Alert via webhook: 🔴 EXIT {market} {reason} PnL: ${pnl:+.2f}

**NEW: Learning Loop Integration (GBrain + Nemotron):**
- On every exit: store {thesis, outcome, regime, PnL} in GBrain via MCP
- Weekly: Nemotron analyzes all trades → generates pattern report → updates prompts/thresholds
- Monthly: Auto-reoptimize scanner thresholds, Kelly fraction, exit parameters

**Run:** systemd service (always alive, restart on crash)
Config: POLYMARKET_PK, POLYMARKET_CLOB_URL from Hermes Vault

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-748` and close draft PR.
