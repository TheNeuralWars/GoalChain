# Economic Model Stress Test - Fri Jun 26 05:31:25 UTC 2026

## 1. Load Canonical Config
Config file found. Showing key parameters:
{
  "config_version": "v1.0.0-p0",
  "network_defaults": {
    "program_id": "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg",
    "token_symbol": "GCH",
    "token_decimals": 6
  },
  "core_parameters": {
    "gch_lamports": 1000000,
    "max_fee_bps": 100,
    "architect_tax_bps": 100,
    "default_base_yield_lamports": 100000000,
    "max_base_yield_lamports": 10000000000,
    "potion_burn_lamports": 100000000
  },
  "rarity_base_yields_lamports": {
    "unknown": 100000000,
    "rare": 50000000,
    "epic": 250000000,
    "legendary": 1000000000,
    "mythic": 5000000000
  },
  "oracle_yield_policy": {
    "goal_percent": 10,
    "assist_percent": 5,
    "red_card_percent": -20,
    "elimination_sets_zero": true
  },
  "notes": [
    "Source of truth for P0 across docs/UI/oracle references.",

## 2. Yield Snapshots (last 7 days)
Running: gbrain query "SELECT avg(yield_rate) FROM vault_snapshots WHERE timestamp > now() - interval '7 days';"
GBrain: Timed out waiting for PGLite lock.

## 3. Failed Oracle Updates (last 24h)
Running: gbrain query "SELECT count(*) FROM failed_oracle_updates WHERE timestamp > now() - interval '24h';"
GBrain: Timed out waiting for PGLite lock.

## 4. Stress Test Scenarios (Qualitative)
### Outage: Oracle settles 12 hours late
- Impact: delayed settlements, potential user dissatisfaction.
- Mitigation: buffers, penalty fees, fallback oracles.

### Mass Claim: 85% of users withdraw staking rewards concurrently
- Impact: liquidity pressure on vault; need to ensure sufficient reserves.
- Mitigation: vesting cooldowns, withdrawal limits, emergency pause.

### Upset: Massive sports prediction win event
- Impact: large payouts could deplete treasury if not capped.
- Mitigation: payout limits, dynamic fee adjustment, treasury diversification.

## 5. Sensitivity Matrix (Placeholder)
- Yield fee percentage: high impact on revenue.
- Penalty ratio: affects user behavior during disputes.
- Staking reward math: influences TVL stability.

## Verification
This file contains the raw query outputs and qualitative analysis. For quantitative risk assessment, further modeling with the extracted data is required.
