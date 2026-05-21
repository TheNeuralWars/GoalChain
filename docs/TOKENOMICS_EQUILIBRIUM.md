# GoalChain $GCH — Tokenomics Equilibrium Report

**Version:** 1.0 (post-analysis implementation)  
**Program:** `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`  
**Simulation data:** [`docs/data/tokenomics_scenarios.csv`](data/tokenomics_scenarios.csv), [`docs/data/tokenomics_vault_agentic.csv`](data/tokenomics_vault_agentic.csv)  
**Vault / IA:** [`VAULT_AGENTIC_STRATEGIES.md`](VAULT_AGENTIC_STRATEGIES.md)  
**Reproduce:** `python3 scripts/tokenomics_simulation.py`

---

## 1. Executive summary

GoalChain’s economy spans three layers that were **misaligned** before this pass:

| Layer | Role |
|-------|------|
| **On-chain** (`lib.rs`) | Enforced transfers, one burn sink, parimutuel fees |
| **Oracle** | Mint authority, player init, yield updates |
| **Docs / simulators** | Target tokenomics, UX, marketing |

**Central finding:** Token scarcity is **not enforced by the program**. Circulating supply follows off-chain mint policy. On-chain deflation was essentially **`feed_potion` only** (previously 250 GCH; now **100 GCH** per P0).

**P0 applied in this repo:**

- Oracle yield uses **percentages** (+10% goal, +5% assist, −20% red card).
- Potion burn unified at **100 GCH**.
- `init_parody_player` accepts **`initial_base_yield`**; rarity mapping in `base_yield_for_rarity_tier` and [`goalchain_oracle/src/economy/rarityYield.ts`](../goalchain_oracle/src/economy/rarityYield.ts).

**Still roadmap (P1/P2):** Fee burn/jackpot split, match stamina drain, XI cap, rent split, vault buyback crank, mint gate.

---

## 2. Variable inventory (supply → circulation → burn)

### 2.1 Supply

| Variable | On-chain | Control | Scarcity effect |
|----------|----------|---------|-----------------|
| Max supply | None | Mint authority | Unlimited unless revoked |
| Decimals | 6 | Fixed | 1 GCH = 1e6 lamports |
| Program mint | No | — | Emission = oracle `mintTo` → `salary_vault` |
| TGE models in docs | 1B vs infinite | Product | Not enforced |

### 2.2 Emission (faucets)

| Mechanism | Formula | Default / cap |
|-----------|---------|---------------|
| Daily salary | `base × manager_bps/1e4 × stadium_bps/1e4`; stamina &lt; 30 → ÷2; **1% protocol tax** | base **100 GCH** or rarity table |
| Oracle goal | `base += base/10` | +10% per goal |
| Oracle assist | `base += base/20` | +5% |
| Oracle red | `base × 80/100`, stamina → 0 | −20% |
| Elimination | `base = 0` | Death pledge |
| Jersey | `base += base/10` | +10% |
| Betting wins | Parimutuel net after `fee_bps` | Default 100 (1%) |
| PvP wager | Winner `2×` stake | Zero-sum |
| Rent | `price_per_match` → owner | 100% owner (no split yet) |

**Max catalog emission** (528 NFTs × `players.json` salaries, 1 claim/day): **153,400 GCH/day** gross.

### 2.3 Sinks

| Mechanism | Type | Magnitude |
|-----------|------|-----------|
| `feed_potion` | **Burn** | **100 GCH** |
| Bet `fee_bps` | Treasury transfer | 0–1% of winner gross (hard-capped) |
| Protocol salary tax | Transfer | 1% of salary |
| Stake | Lock | No yield yet |
| Golden recall | Transfer | 50% rent to borrower |

### 2.4 Circulation velocity

- 24h salary cooldown per NFT
- −5 stamina per claim (doc: −30 per real match — **not on-chain**)
- Parimutuel recycles losing stakes to winners

---

## 3. Doc vs chain gaps (resolved / open)

| Gap | Status |
|-----|--------|
| Oracle +10 lamports (negligible) | **Fixed** → +10% |
| Potion 250 vs sim 10 | **Fixed** → 100 GCH everywhere P0 |
| Base yield 100 for all rarities | **Fixed** → `initial_base_yield` + rarity helpers |
| Bet fee = burn (marketing) | **Open** → treasury only; see P1 |
| Stamina −30/match | **Open** → P1 `oracle_record_match` |
| Vault buyback | **Open** → P2 |
| 5-2-3 revenue split | **Open** → not in program |

---

## 4. Scenario results (from CSV)

| ID | Emission/day | Potion burn/day | Net pressure |
|----|--------------|-----------------|--------------|
| S0 (1k users, 100 base) | ~1.12M | ~62.5k | **+1.06M inflation** |
| S1 (528, doc salaries) | ~166k | ~726k | **−560k deflation** |
| S2 (100k users) | ~153M | ~6.25M | **+146.7M hyperinflation** |
| S3 (10k casual) | ~9.9M | ~625k | **+9.3M inflation** |
| S4 (WC peak stamina) | ~10.1M | ~16.5M | **−6.4M deflation** |

**Break-even potion price (S0, 50% adoption):** ~2,805 GCH — far above 100 GCH → at scale, **other sinks or mint discipline required**.

**Vault buyback** (5k SOL, 7.5% APY, GCH @ $0.01): ~**15.4k GCH/day** — covers full catalog emission (~153k) only with larger treasury or higher price.

---

## 5. Equilibrium targets

Target steady-state: **emit/burn ratio 0.85–1.05**.

| Lever | Recommended |
|-------|-------------|
| `fee_bps` | 100 hard-cap now; future split requires DAO-governed redesign (P1) |
| `feed_potion` | **100 GCH** base; tiered 5% of daily base (future) |
| `initial_base_yield` | rare 50 / epic 250 / leg 1000 / mythic 5000 |
| Active XI cap | **11 claims/manager/day** (P1) |
| Match stamina | **−25/−30** per fixture (P1) |
| Vault SOL | **≥ 5k SOL** before 10k+ MAU (P2) |
| Founder/protocol tax | 1% hard-cap (already applied) |

## 5.1 Builder Fund API financing policy

El **10% Builder Fund** no solo remunera contribuciones: también financia APIs/modelos/infra de desarrollo (incluyendo marketing/growth).  
Se elimina el concepto de un bucket separado de marketing fuera de ese 10%.

---

## 6. Hypothesis summary (H1–H8)

See [`docs/data/tokenomics_scenarios.csv`](data/tokenomics_scenarios.csv) for full grids.

- **H1:** Split bet fees → 25–37.5k GCH/day burn at 1M volume, 40–50% burn share.
- **H2:** Mint gate on emit/burn ratio (pause mint if ratio &gt; 10).
- **H3:** Dynamic potion 250–600 GCH for ratio 0.5–1.2 at 1M emit.
- **H4:** Doc stamina → ~5k GCH burn/season/player vs ~1k chain-only.
- **H5:** % oracle → 154 GCH/day after 5 goals + 1 red (vs ~100.00005 bug).
- **H6:** Rent protocol fee 5% → ~3.1k GCH/week burn+jakcpot.
- **H7:** Vault buyback scales with SOL treasury and GCH price.
- **H8:** Mythic XI cap 1 → 5.5k GCH/day vs 153k if all 528 claim.

---

## 7. Priority roadmap

| Priority | Item | Doc |
|----------|------|-----|
| **P0** | Oracle %, potion 100, rarity yield | This file + `lib.rs` |
| **P1** | Fee burn/jackpot, stamina, XI cap, rent | [`P1_ONCHAIN_SINKS_DESIGN.md`](P1_ONCHAIN_SINKS_DESIGN.md) |
| **P2** | Mint gate, vault crank, revoke mint | [`P2_VAULT_MINT_ROADMAP.md`](P2_VAULT_MINT_ROADMAP.md) |
| **P2+** | Copa Pressure, team potion, staking yield | Plan §7 |

---

## 8. Related files

- On-chain: [`goalchain_program/programs/goalchain_program/src/lib.rs`](../goalchain_program/programs/goalchain_program/src/lib.rs)
- Simulation: [`scripts/tokenomics_simulation.py`](../scripts/tokenomics_simulation.py)
- Issue drafts: [`docs/issues/`](issues/)
- Design sources: [`ai_context/02_economy/`](../ai_context/02_economy/)
