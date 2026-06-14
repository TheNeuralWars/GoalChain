# GoalChain Jito/MEV Strategic Positioning & Roadmap

**Status:** `DRAFT` → `APPROVED` (pending review)
**Owner:** Hermes (Strategy) / Antigravity (Implementation)
**Last Updated:** 2026-06-14
**Related Issues:** #1, #2, #3, #4, #5, #6, #7 (Jito implementation issues)

---

## Executive Summary

GoalChain positions itself as the **first MEV-internalizing prediction market** on Solana, leveraging the full Jito stack (Bundles, DontFront, ShredStream, JitoSOL) to capture value that traditionally leaks to searchers. This document codifies the strategic pillars, competitive differentiation, revenue model, and implementation roadmap that guide all Jito-related engineering decisions.

---

## 1. Strategic Pillars

### 1.1 MEV-Internalizing Prediction Market (Core Differentiator)

**Thesis:** Traditional prediction markets leak MEV to searchers via front-running bets and sandwiching settlements.

**GoalChain Approach:**
- **DontFront** for user bets — zero-cost MEV protection for retail
- **Jito Bundles** for vault crank + settlement — atomic execution, no mempool exposure
- **ShredStream** for oracle latency advantage — same-slot settlement capability

**Value Capture Loop:**
```
Protocol Fees (2.5%) + Jito Tips (net) + JitoSOL Yield (7-9% APY)
       ↓
Vault Crank Buybacks → GCH Burn → Deflationary Pressure
       ↓
Higher GCH Price → More Protocol Revenue → Compounding Loop
```

**Moat:** Few (if any) Solana prediction markets use the full Jito stack natively.

---

### 1.2 Treasury as Productive Capital (Capital Efficiency)

| Current State | Target State |
|---------------|--------------|
| Treasury SOL sits idle | 100% of treasury SOL staked as JitoSOL |
| Zero yield | ~7-9% APY from MEV tips + staking |
| No deflationary mechanism | Yield → Buybacks → GCH Burn |

**Yield Flow:**
```
JitoSOL APY (~7-9%) 
    → Vault Crank Harvest (weekly)
    → Jupiter Swap (SOL → GCH)
    → Burn (100% of yield)
    → Deflationary Pressure on GCH
```

**Compounding:** JitoSOL auto-compounds; harvest realizes gains for buybacks.
**Narrative:** "Real yield from MEV tips" — powerful for GCH holders and investors.

---

### 1.3 Jito-Native Architecture (Ecosystem Alignment)

**Principle:** Not just *using* Jito — built *for* Jito.

| Component | Implementation |
|-----------|----------------|
| Stake Pool CPI | Native in program (not wrapper) — see `contribute_presale` in `lib.rs:1162` |
| Transaction Design | Bundle-first for all cranks, settlements |
| Oracle | ShredStream for latency advantage (not just RPC) |
| Tip Accounts | First-class config, fetched dynamically via `/api/v1/tip_accounts` |

**Benefits:** Priority Jito support, early feature access, ecosystem credibility, technical partnership opportunities.

---

### 1.4 Devnet → Mainnet Graduation Path (Risk Mitigation)

| Phase | Network | Jito Features | Success Criteria |
|-------|---------|---------------|------------------|
| 1 | Devnet | Bundles, Tips, DontFront | 100% bundle success, 0 MEV incidents |
| 2 | Devnet + | ShredStream, JitoSOL yield | <100ms latency, yield > 0 |
| 3 | Testnet | Full stack + load test | 1000 TPS burst, 99.9% uptime |
| 4 | Mainnet | Production | TVL > $1M, 0 critical incidents |

**Key Decision (2026-06-07):** Use testnet Block Engine for devnet — Jito doesn't run separate devnet Block Engine.

---

## 2. Competitive Landscape

| Project | MEV Protection | Jito Bundles | ShredStream | JitoSOL Yield | Internalizes MEV |
|---------|---------------|--------------|-------------|---------------|-----------------|
| **GoalChain** | ✅ DontFront + Bundles | ✅ Native | ✅ Planned | ✅ Native | ✅ Full |
| Drift | Partial (Keeper) | ❌ | ❌ | ❌ | Partial |
| MarginFi | ❌ | ❌ | ❌ | ✅ (lending) | ❌ |
| Kamino | ❌ | ❌ | ❌ | ✅ (vaults) | ❌ |
| Generic PM | ❌ | ❌ | ❌ | ❌ | ❌ |

*PM = Prediction Market*

**Key Insight:** GoalChain is the only prediction market with full-stack Jito integration. This is a defensible technical moat.

---

## 3. Revenue Model (Projected at Scale)

| Source | Mechanism | Est. Monthly (at $10M TVL) |
|--------|-----------|----------------------------|
| Protocol fees | 2.5% on settled volume | $2,500 (at $100k vol) |
| Jito tips (net) | Bundle tips - floor | $500 (conservative) |
| JitoSOL yield | 7% APY on treasury | $5,833 (at $10M SOL) |
| MEV capture | Internalized vs leaked | $2,000+ (estimated) |
| **Total** | | **~$10,833/mo** |

**Assumptions:** $10M TVL, $100k monthly settled volume, $10M treasury SOL staked as JitoSOL.
**Scaling:** Revenue scales super-linearly with TVL (yield compounds, volume grows).

---

## 4. Technical Debt & Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Jito Block Engine devnet instability | Medium | High (blocks cranks) | Fallback to standard RPC + Helius |
| ShredStream UDP blocked by VPS firewall | Low | Medium | Test connectivity early; have TCP fallback |
| JitoSOL smart contract exploit | Very Low | Critical | Only stake treasury surplus; audit trail |
| Tip account rotation (if Jito changes) | Low | Medium | Fetch dynamically via `/api/v1/tip_accounts` |
| MEV strategy becomes unprofitable | Low | Medium | Monitor tip floor; adjust bundle economics |

**Monitoring:** All risks tracked in `docs/governance/RISK_REGISTER.md` (to be created).

---

## 5. Roadmap Prioritization (Recommended Order)

| Priority | Issue | Description | Dependency |
|----------|-------|-------------|------------|
| **P0** | #2 | Priority Fees v2 | Foundation for all reliability |
| **P0** | #1 | Vault Crank Bundle | Highest economic impact, proves pattern |
| **P1** | #3 | Bet Settlement Bundle | Core product MEV protection |
| **P1** | #5 | JitoSOL Yield Harvest | Sustainable revenue, compounds |
| **P1** | #7 | Jito Monitoring | Operational necessity |
| **P1** | #4 | DontFront Integration | User-facing, marketing value |
| **P2** | #6 | ShredStream Oracle | Competitive moat, advanced |

**Bundle Design Constraint (2026-06-07):** Max 5 transactions per bundle, tip in last transaction.

---

## 6. Decision Log

| Date | Decision | Rationale | Issues Affected |
|------|----------|-----------|-----------------|
| 2026-06-07 | Use testnet Block Engine for devnet | Jito doesn't run separate devnet Block Engine | #1, #3, #6 |
| 2026-06-07 | Bundle max 5 txs, tip in last | Jito protocol constraint | #1, #3 |
| 2026-06-07 | Priority Fee Tiers: Economy/Standard/Priority/Urgent | Matches Helius percentiles + Jito urgency | #2 |
| 2026-06-07 | DontFront for user txs, Bundles for cranks | Cost/benefit optimization | #4 vs #1, #3 |

*This log must be updated as new architectural decisions are made.*

---

## 7. Success Metrics (North Stars)

| Metric | Devnet Target | Mainnet Target | Measurement |
|--------|---------------|----------------|-------------|
| Bundle success rate | > 95% | > 98% | Jito Block Engine API + on-chain confirmation |
| MEV incidents | 0 | 0 | User reports + automated sandwich detection |
| Treasury yield coverage | > 50% buyback SOL | > 100% buyback SOL | Vault crank reports vs buyback volume |
| ShredStream latency advantage | N/A | > 90% settle in target slot | Oracle settlement slot vs target slot |
| Developer experience | < 5 min new Jito tx type | < 5 min new Jito tx type | Time-to-implement new protected instruction |

---

## 8. Implementation Guidelines for Engineers

### 8.1 Adding New Jito-Protected Transaction Types

1. **Default to Bundles** for all crank/settlement operations
2. **Use DontFront** for user-initiated transactions (bets, claims)
3. **Fetch tip accounts dynamically** — never hardcode
4. **Simulate before submit** — use Priority Fees v2 `simulateAndSend`
5. **Log bundle ID** for debugging and monitoring

### 8.2 Priority Fee Tier Configuration

```typescript
// From Priority Fees v2 (#2)
enum PriorityTier {
  ECONOMY = "economy",     // 50th percentile
  STANDARD = "standard",   // 75th percentile
  PRIORITY = "priority",   // 90th percentile
  URGENT = "urgent"        // 99th percentile + Jito tip
}
```

### 8.3 Vault Crank Pattern (Reference Implementation)

```typescript
// Pattern established in issue #1 / #754
async function executeVaultCrank(connection, wallet, excessSolLamports) {
  const simulation = await simulateVaultCrankBundle(connection, wallet, excessSolLamports);
  if (!simulation.success) throw new Error(`Simulation failed: ${simulation.error}`);
  
  const bundle = await buildVaultCrankBundle(connection, wallet, excessSolLamports);
  const bundleId = await submitBundle(BLOCK_ENGINE_URL, bundle);
  const result = await waitForBundleConfirmation(connection, bundleId);
  
  // Verify on-chain effects
  return result;
}
```

---

## 9. Related Documents

- `VAULT_TECH_ROADMAP.md` — Technical vault implementation details
- `ECONOMIC_BLUEPRINT_V3.md` — Overall economic model
- `docs/ECONOMIC_CANONICAL_CONFIG.json` — On-chain economy parameters
- `goalchain_program/src/lib.rs:1162` — JitoSOL Presale Vault CPI (native stake pool)
- `goalchain_oracle/src/vault_crank.ts` — Current vault crank implementation
- `docs/proposals/opencode/issue-754-proposal.md` — Vault Crank v2 with Jito bundles

---

## 10. Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-06-14 | Hermes (mu) | Initial draft from Issue #87 requirements |
| 1.0 | TBD | Antigravity | Review & approval |

---

*This document is a living strategic artifact. Update the Decision Log and Roadmap as implementation progresses. All Jito-related issues should reference this document for architectural consistency.*