# GoalChain Production Readiness & Exponential Expansion Action Plan

Based on the Principal Staff Engineer Code Audit (`docs/REPORTS/GOALCHAIN_ARCHITECTURE_AUDIT.md`) and architectural growth opportunities, this document details the Action Plan to resolve codebase issues and expand GoalChain's features using advanced Web3 and client-side AI technologies.

---

## Task Matrix & Fleet Division

We have split the plan into 15 modular tasks. All tasks are currently in progress by the 24-worker Greek autonomous fleet on the Oracle VPS.

```mermaid
graph TD
    AuditReport[docs/REPORTS/GOALCHAIN_ARCHITECTURE_AUDIT.md] --> Plan[docs/REPORTS/GOALCHAIN_ACTION_PLAN.md]
    
    subgraph Core Stability Tasks (In Progress)
        Plan --> IssueA["Issue #775: Shared SDK & Constants Sync"]
        Plan --> IssueB["Issue #777: RPC Retries, Caching & Fetch Timeouts"]
        Plan --> IssueC["Issue #778: API Validation & Alert Persistence"]
        Plan --> IssueD["Issue #779: Graceful Shutdowns, Logging & Unit Tests"]
        Plan --> IssueK["Issue #786: Resilient Vault Crank Jupiter Swaps"]
        Plan --> IssueL["Issue #787: Minimum Priority Fee Floors & Caching"]
        Plan --> IssueM["Issue #788: Add Transaction Simulation (simulateTransaction)"]
        Plan --> IssueN["Issue #789: Standardize Logging with Winston/Pino"]
        Plan --> IssueO["Issue #790: Document Env Vars in .env.example"]
        Plan --> IssueP["Issue #791: Fix computeMintGate & WSOL Fallbacks"]
    end

    subgraph Exponential Expansion Tasks (In Progress)
        Plan --> IssueF["Issue #781: Jito MEV Bundle Staking Integration"]
        Plan --> IssueG["Issue #782: WASM/WebGPU Client Match Simulator & Commentary"]
        Plan --> IssueH["Issue #783: Premium Glassmorphic Staking Dashboard"]
        Plan --> IssueI["Issue #784: Consensus-Driven Multi-Source Oracle Scraper"]
        Plan --> IssueJ["Issue #785: OpenTelemetry & Prometheus Ingestion Metrics"]
    end
```

---

## Core Stability Tasks (In Progress)

### Issue #775 (P1): Extract Shared SDK Constants and PDA Seeds
- **Assignee:** Worker `chi`
- **Focus:** Consolidate seeds (like `"global-config"`, `"vault"`) and configurations into `goalchain-sdk` so API and Oracle share the same types.

### Issue #777 (P0): Implement RPC Retries, Priority Fee Caching & Network Timeouts
- **Assignee:** Worker `theta`
- **Focus:** Implement `AbortController` timeouts on Helius/Jupiter calls, add exponential backoff retry wrappers, and cache priority fees.

### Issue #778 (P1): Express API Input Validation & Persistent Alert State
- **Assignee:** Worker `rho`
- **Focus:** Wrap backend file reads in try-catch blocks, add validation middleware, and persist alert state in a SQLite/Redis store.

### Issue #779 (P2): Implement Graceful Daemon Shutdowns & Unit Tests
- **Assignee:** Worker `nu`
- **Focus:** Implement `SIGINT`/`SIGTERM` signal listeners in the Oracle daemon, use structured logging, and add unit tests for `parseCsv`.

### Issue #786 (P0): Resilient Vault Crank Jupiter Swaps (Replaces failed #776)
- **Assignee:** Worker `omicron`
- **Focus:** Replace the risky SOL transfer fallback in `vault_crank.ts` with Jupiter swap token burns, verify the returned transaction, and handle token-burning.

### Issue #787 (P1): Minimum Priority Fee Floors & Compute Unit Caching
- **Assignee:** Worker `sigma`
- **Focus:** Enforce minimum priority fee floors via environment variables and cache compute unit estimates in `priorityFees.ts`.

### Issue #788 (P1): Add Transaction Simulation (`simulateTransaction`) to Critical Paths
- **Assignee:** Worker `eta`
- **Focus:** Run transaction simulations before every mainnet submission to catch failures pre-flight.

### Issue #789 (P2): Standardize Logging with Winston/Pino across API & Oracle
- **Assignee:** Worker `tau`
- **Focus:** Replace generic `console.log` statements with structured, JSON-formatted logs for better cloud monitoring.

### Issue #790 (P2): Document All Environment Variables in `.env.example`
- **Assignee:** Worker `psi`
- **Focus:** Create a complete `.env.example` file detailing all configuration requirements, defaults, and security notices.

### Issue #791 (P1): Fix `computeMintGateFromRows` & WSOL Fallbacks
- **Assignee:** Worker `alpha`
- **Focus:** Fix edge cases in `computeMintGateFromRows` (empty selections) and remove dangerous fallback mint resolutions to WSOL in `vault_crank.ts:217`.

---

## Exponential Expansion Tasks (In Progress)

### Issue #781 (P0): Jito MEV Bundle Staking Integration
- **Assignee:** Worker `phi`
- **Goal:** Guarantee staking transaction execution during network congestion and optimize validator tip routing.
- **Action Items:**
  1. Integrate Jito's JSON-RPC API (`sendBundle` endpoint) in `vault_crank.ts`.
  2. Implement automatic MEV tip calculation and append tip transfer instructions to staking transaction packages.

### Issue #782 (P1): Client-Side WASM/WebGPU Match Simulator & Live Commentary Engine
- **Assignee:** Worker `upsilon`
- **Goal:** Drive user engagement by simulating matches client-side with rich scrolling text commentary.
- **Action Items:**
  1. Build a Web Worker-based match simulator in `goalchain_webapp/src/` that runs off-main-thread.
  2. Implement a lightweight local parser using WASM or WebGPU to generate real-time, stylized soccer commentary based on player statistics.

### Issue #783 (P0): Premium Glassmorphic Staking & Infinity Burn Dashboard
- **Assignee:** Worker `mu`
- **Goal:** Provide a high-fidelity visual experience representing $GCH burns and staking yields.
- **Action Items:**
  1. Revamp the React staking UI with hardware-accelerated SVG flame animations, glassmorphic cards, and interactive yield calculators.
  2. Implement real-time stats mapping from the Express API economy endpoints.

### Issue #784 (P1): Consensus-Driven Multi-Source Oracle Scraper
- **Assignee:** Worker `kappa`
- **Goal:** Remove single points of failure in sports score ingestion.
- **Action Items:**
  1. Refactor `oracle_scraper.py` to fetch live soccer scores from multiple providers (e.g. ESPN, SofaScore, Transfermarkt) in parallel.
  2. Implement a simple consensus algorithm to resolve discrepancies before writing the canonical match state.

### Issue #785 (P2): OpenTelemetry & Prometheus Ingestion Metrics
- **Assignee:** Worker `lambda`
- **Goal:** Track system health and burn metrics for presale campaigns.
- **Action Items:**
  1. Integrate `prom-client` or OpenTelemetry in the Express API to expose real-time metrics (RPC health, burn rate, Presale SOL totals).
  2. Expose a `/metrics` scrape endpoint for Prometheus dashboard visualization.
