# Economic Parameters Validation Report

This document reports the validation and strict alignment check of GoalChain's tokenomics parameters between the active codebase implementations and the canonical specification in `docs/ECONOMIC_CANONICAL_CONFIG.json` (v1.0.0-p0) as required by issue #128.

## 1. Core Economic Parameters Reference
All core metrics are verified to align perfectly with `docs/ECONOMIC_CANONICAL_CONFIG.json`:

| Parameter | Canonical Value (JSON) | Codebase Status | Status |
|---|---|---|---|
| `token_symbol` | `"GCH"` | Matches all UI & SDK references | ✅ Verified |
| `token_decimals` | `6` | Defined in Program & SDK | ✅ Verified |
| `max_fee_bps` | `100` (1% fee cap) | Matching contract defaults | ✅ Verified |
| `architect_tax_bps` | `100` (1% tax) | Matching claim logic | ✅ Verified |
| `potion_burn_lamports` | `100_000_000` (100 GCH) | Applied in Stamina/Yield calculations | ✅ Verified |
| `default_base_yield` | `100_000_000` (100 GCH) | Matches baseline unknown yield | ✅ Verified |

## 2. Oracle Yield Modifiers Policy
The parimutuel / performance yield multipliers map identically to:
- **Goal Scored**: `+10%`
- **Goal Assist**: `+5%`
- **Red Card**: `-20%`
- **Match Elimination**: Yield drops to `0`

These values are correctly utilized by the `goalchain_oracle` matching engine.

## 3. Policy Alignment Checklist
1. **Fee splits**: 40% burn / 40% jackpot / 20% treasury split verified.
2. **Disclaimer badges**: All mock surfaces display `SIMULACIÓN` / `DEVNET` indicators.
3. **Circular Feed**: Circular economy sinks (buying stamina potions, and burn loops) align perfectly with marketing specs.

Report generated on: 2026-05-27.
