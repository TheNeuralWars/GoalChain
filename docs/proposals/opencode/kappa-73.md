# OA Proposal: Issue #73 — [OPENCODE] [DRAFT] Polymarket Bot: brain.py - Grok reasoning engine for thesis generation

**Worker:** kappa (partition 9)
**Owner:** opencode
**Priority:** P1
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body

### Objective
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

**Verification:**
```bash
cd /data/apps/GoalChain/polymarket_bot
python brain.py
cat thesis.json | jq '.[] | {market, action, confidence, kelly_size, regime_check, prob_distribution}'
```

Files to create: brain.py, requirements.txt (add openai client), prompts/brain_system.md, nemotron_client.py, regime_detector.py

---

## Detailed Implementation Plan

### Phase 1: Foundation Files
1. **requirements.txt** - Add `openai` client, `python-dotenv`, `httpx`, `pydantic`
2. **prompts/brain_system.md** - System prompt with antpalkin lessons, 4-check framework, regime detection rules
3. **nemotron_client.py** - Async client for Hermes gateway (localhost:8642/v1), OpenAI-compatible, temperature=0.1

### Phase 2: Core Logic Modules
4. **regime_detector.py** - Regime detection logic:
   - Volume anomaly detection (2x+ spike vs avg)
   - Whale dump detection (large sells from target wallets)
   - News shock detection (breaking news in last 6h)
   - Liquidation cascade (orderbook depth drop >50%)
   - Returns regime_check JSON structure

5. **brain.py** - Main orchestration:
   - Load markets from `markets_cache.json` (serves as queue.json)
   - Load poly_data for base rates (mock for now, GBrain integration later)
   - Load target wallets (47 wallets from poly_data analysis)
   - For each market: run 4 checks + regime detection
   - Aggregate: if 3/4 agree → generate thesis with confidence
   - Kelly sizing with quarter-Kelly cap (max 25% of f*)
   - Probability distribution: {"low": 0.15, "mid": 0.70, "high": 0.15}
   - Write thesis.json with full audit trail

### Phase 3: Verification
6. Run `python brain.py` and verify output matches expected schema
7. Test with `jq` extraction command from issue

---

## Data Structures

### Input: markets_cache.json (already exists)
Array of market objects with: condition_id, question, description, end_date_iso, active, closed, volume_24h, avg_volume_24h, tokens[]

### Input: poly_data (mock for now)
- Base rates by category: crypto_directional ~0.48, crypto_updown ~0.52
- Target wallets: 47 wallet addresses with strategy profiles

### Output: thesis.json (already exists as mock)
Array of thesis objects with:
- market, condition_id, token_id, category, is_updown, regime_flag
- action: "buy_yes" | "buy_no" | "skip"
- confidence: 0-1
- kelly_size: float (USD)
- probability_dist: {low, mid, high}
- regime_check: {market_flipped, confidence, action, signals[]}
- reasoning: string
- base_rate: float
- news_check: {agree, confidence, reasoning, relevant_news[]}
- whale_check: {agree, confidence, reasoning, active_whales[]}
- disposition_check: {agree, confidence, reasoning}
- created_at: ISO timestamp

---

## Risk / Rollback
- Risk: Nemotron gateway not available locally → mock fallback for development
- Risk: Scope drift — stick to 5 files only
- Rollback: revert branch `exp/opencode-issue-73` and close draft PR