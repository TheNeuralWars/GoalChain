# OA Proposal — Issue #746

## Title
[OPENCODE] [DRAFT] Polymarket Bot: brain.py - Grok reasoning engine for thesis generation

## Source
GitHub issue #746

## Objective
## Objective
For each market in queue.json, run 4 checks via **Nemotron 3 Ultra (free tier via NVIDIA NIM, proxied through Hermes gateway localhost:8642/v1)** and generate thesis:

1. **Base rate**: historical win rate from poly_data for this market category
2. **News**: any relevant news in last 6h (use X_RAPIDAPI_KEY from vault to search X)
3. **Whale check**: are any of the 47 target wallets (from poly_data analysis) active in this market? Track their recent behavior (entry/exit timing, sizing)
4. **Disposition**: is the crowd making a cognitive error? (Nemotron reasoning)
5. **NEW: Regime detection** — critical lesson from antpalkin ($200K loss):
   - Detect "market flipped": news shock, volume anomaly, whale dump, liquidation cascade
   - If regime_changed → auto-reduce Kelly to 1/8 or trigger kill_switch

**Decision logic:**
- If 3/4 checks agree → generate thesis with confidence %
- If confidence > 75% → size with Kelly (quarter Kelly cap: max 25% of f*)
- **NEW: Probability distribution** (not point estimate): {"low": 0.15, "mid": 0.70, "high": 0.15} — enables Kelly with full distribution
- **NEW: Regime check output** (see below)

**Regime Check Output (MANDATORY):**
```json
"regime_check": {
  "market_flipped": false,
  "confidence": 0.92,
  "action": "continue",  // "continue" | "reduce_kelly" | "kill_switch"
  "signals": ["volume_spike_2x", "whale_dump_detected", "news_shock_CPI"]
}
```
- If `action == "reduce_kelly"` → Kelly fraction = f* / 8
- If `action == "kill_switch"` → no trade, alert immediately

**Integration:**
- Call Nemotron via **local Hermes gateway**: `http://localhost:8642/v1/chat/completions`
- Model: `nvidia/nemotron-3-ultra:free` (same as FCC uses)
- No separate API key needed — gateway handles NVIDIA NIM proxy
- Use GBrain (MCP) to store/retrieve target wallets list from poly_data analysis + their strategy profiles (from Polybot reverse-engineering)
- Log full reasoning for audit trail
- Temperature: 0.1 (deterministic reasoning)
- System prompt in `prompts/brain_system.md` (includes antpalkin lessons)

**Auto-reinvest:** kelly_size calculates from current bankroll (50% profits compounded, 50% withdrawn)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-746` and close draft PR.
