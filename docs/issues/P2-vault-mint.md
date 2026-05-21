# [P2] Vault crank buyback, mint gate, revoke mint authority

**Labels:** `economy`, `P2`, `infra`  
**Roadmap:** [`docs/P2_VAULT_MINT_ROADMAP.md`](../P2_VAULT_MINT_ROADMAP.md)

## Scope

### Phase A (pre-mainnet)

- [ ] TGE mint policy documented (1B cap vs gated infinite).
- [ ] Revoke SPL mint authority on multisig ceremony.
- [ ] Public supply dashboard.

### Phase B

- [ ] `goalchain_oracle/scripts/mint_gate.ts` — 7d emit/burn ratio.
- [ ] Multisig policy: pause mint if ratio &lt; 0.85.
- [ ] Builder Fund policy: one 10% budget for contributors + APIs/models + marketing (auditable sub-ledger).

### Phase C

- [ ] Weekly crank: JitoSOL harvest → Jupiter → GCH burn (60% yield).
- [ ] Burn tracker on website.

### Phase D (optional)

- [ ] `vault_harvest_buyback` instruction with slippage guard.

## Dependencies

- P1 fee burn feeds `burn_7d` metric.
- P0 stable emission baselines for ratio.

## Estimate

Phase A–B: 1 week ops; Phase C: 2 weeks eng + audit.
