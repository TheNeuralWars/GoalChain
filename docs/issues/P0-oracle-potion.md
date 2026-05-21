# [P0] Oracle % yield, potion 100 GCH, rarity base yield

**Labels:** `economy`, `P0`, `mainnet-blocker`  
**Status:** Implemented in branch (verify with `anchor test`)

## Problem

1. `oracle_update_player_yield` added **+10 lamports** per goal (~0.00001 GCH), not +10%.
2. `feed_potion` burned **250 GCH** while simulator used **10 GCH**.
3. All players initialized with **100 GCH** regardless of NFT rarity.

## Acceptance criteria

- [x] Goal: `base_yield_rate` increases by **10%** (100 → 110 GCH).
- [x] Assist: **+5%**; Red card: **−20%**; Elimination: **0**.
- [x] `feed_potion` burns **100_000_000** lamports.
- [x] `init_parody_player(..., initial_base_yield)` with validation ≤ 10k GCH.
- [x] `base_yield_for_rarity_tier` + `goalchain_oracle/src/economy/rarityYield.ts`.
- [x] Test: oracle goal → `110000000` base units.
- [x] Simulator: potion cost **100 GCH**.
- [ ] Regenerate IDL / SDK (`anchor build` + `scripts/sync-idl.sh`).

## Files

- `goalchain_program/programs/goalchain_program/src/lib.rs`
- `goalchain_program/tests/goalchain_program.ts`
- `docs/assets/js/modifiers_simulator.js`
- `goalchain_oracle/src/economy/rarityYield.ts`

## Oracle integration

When initializing players from metadata:

```ts
import { baseYieldForRarityName } from "./economy/rarityYield";
const yield = baseYieldForRarityName(player.rarity);
await program.methods.initParodyPlayer(..., new BN(yield));
```
