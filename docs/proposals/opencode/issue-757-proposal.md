# OA Proposal — Issue #757

## Title
[OPENCODE] [DELEGATED] [manager] P0: Jito/MEV Strategic Positioning & Roadmap

## Source
GitHub issue #757

## Objective
## Objective
Document and codify GoalChain's strategic positioning in the Solana MEV/Jito ecosystem. This issue captures high-level architectural decisions, competitive differentiation, and long-term roadmap that should guide implementation priority and design choices across all Jito-related issues.

## Strategic Pillars

### 1. **MEV-Internalizing Prediction Market** (Core Differentiator)
- **Thesis:** Traditional prediction markets leak MEV to searchers (front-running bets, sandwiching settlements)
- **GoalChain approach:** Internalize MEV via:
  - DontFront for user bets (zero-cost protection)
  - Jito bundles for vault crank + settlement (atomic, no mempool)
  - ShredStream for oracle latency advantage (same-slot settlement)
- **Value capture:** Protocol fees + Jito tips + JitoSOL yield = sustainable revenue loop
- **Moat:** Few (if any) Solana prediction markets use full Jito stack

### 2. **Treasury as Productive Capital** (Capital Efficiency)
- **Current:** Treasury SOL sits idle
- **Target:** 100% of treasury SOL staked as JitoSOL
- **Yield flow:** JitoSOL APY (~7-9%) → vault crank buybacks → GCH burn → deflationary pressure
- **Compounding:** JitoSOL auto-compounds; harvest realizes gains for buybacks
- **Narrative:** "Real yield from MEV tips" — powerful for GCH holders

### 3. **Jito-Native Architecture** (Ecosystem Alignment)
- **Not just using Jito** — built *for* Jito:
  - Stake Pool CPI native in program (not wrapper)
  - Bundle-first transaction design (all cranks, settlements)
  - ShredStream for oracle (not just RPC)
  - Tip accounts as first-class config
- **Benefits:** Priority Jito support, early feature access, ecosystem credibility

### 4. **Devnet → Mainnet Graduation Path** (Risk Mitigation)
| Phase | Network | Jito Features | Success Criteria |
|-------|---------|---------------|------------------|
| 1 | Devnet | Bundles, Tips, DontFront | 100% bundle success, 0 MEV incidents |
| 2 | Devnet + | ShredStream, JitoSOL yield | <100ms latency, yield > 0 |
| 3 | Testnet | Full stack + load test | 1000 TPS burst, 99.9% uptime |
| 4 | Mainnet | Production | TVL > $1M, 0 critical incidents |

## Competitive Landscape
| Project | MEV Protection | Jito Bundles | ShredStream | JitoSOL Yield | Internalizes MEV |
|---------|---------------|--------------|-------------|---------------|-----------------|

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-757` and close draft PR.
