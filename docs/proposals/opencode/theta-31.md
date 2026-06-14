# OA Proposal: Issue #31 — [OPENCODE] [P2] Add fee_burn to tokenomics_simulation S0 scenarios

**Worker:** theta (partition 7)
**Owner:** opencode
**Priority:** P2
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
Extend tokenomics_simulation with fee_burn parameter in S0 scenarios. Model burn impact on yield, vault returns, and GCH supply. See GitHub issue #459. Priority: P2, agent: opencode.

## Analysis

### Current State
- S0 scenario ("On-chain today: 1k users, 100 GCH base") used default `fee_burn_share=0.0` (no fee burn)
- On-chain default `DEFAULT_FEE_BURN_BPS = 4000` (40% of fee stream burned)
- Simulation parameter `fee_burn_share` accepts 0.0-1.0 fraction
- Other S scenarios (S1-S4) also used default `fee_burn_share=0.0`

### Changes Implemented
1. **Updated S0 baseline** to use on-chain default `fee_burn_share=0.4` (40%) with explicit `fee_bps=1000`
2. **Added S0 sensitivity variants** showing different fee_burn_share values:
   - S0a: 0% fee burn (no burn, all fees to treasury)
   - S0b: 20% fee burn (partial burn)
   - S0c: 50% fee burn (aggressive)
3. **Modeled impact on**:
   - **Yield**: Higher fee burn → lower net pressure (more GCH removed from circulation)
   - **Vault returns**: Fee treasury decreases as burn share increases (less fees available for vault buyback)
   - **GCH supply**: emit_burn_ratio increases with higher burn share (more deflationary)

### Files Modified
- `scripts/tokenomics_simulation.py` — `scenarios_base()` function

### Verification Results
```
S0:  fee_bps=1000, fee_burn_share=0.4, fee_burn_gch=1000.0, fee_treasury_gch=1500.0, net_pressure=846000.0, emit_burn_ratio=0.246
S0a: fee_bps=1000, fee_burn_share=0.0, fee_burn_gch=0.0,   fee_treasury_gch=2500.0, net_pressure=847000.0, emit_burn_ratio=0.2451
S0b: fee_bps=1000, fee_burn_share=0.2, fee_burn_gch=500.0, fee_treasury_gch=2000.0, net_pressure=846500.0, emit_burn_ratio=0.2455
S0c: fee_bps=1000, fee_burn_share=0.5, fee_burn_gch=1250.0, fee_treasury_gch=1250.0, net_pressure=845750.0, emit_burn_ratio=0.2462
```

### Test Commands
```bash
python3 scripts/tokenomics_simulation.py
# Verify S0 scenarios show fee_burn_gch > 0 for S0/S0b/S0c
grep "scenario,S0" docs/data/tokenomics_scenarios.csv
```

### Risks
- Low: Only modifies scenario definitions, no core logic changes
- Backward compatible: Adds new scenario rows, doesn't remove existing
- CSV schema unchanged

## Structured Plan JSON
```json
{
  "task": "Add fee_burn to tokenomics_simulation S0 scenarios",
  "files": ["scripts/tokenomics_simulation.py"],
  "functions": ["scenarios_base"],
  "tests": ["python3 scripts/tokenomics_simulation.py"],
  "verification": "grep 'scenario,S0' docs/data/tokenomics_scenarios.csv | awk -F',' '{print \$1,\$2,\$14,\$21}'"
}
```

## Status
✅ **COMPLETED** — Implementation done, tests passing, output verified.