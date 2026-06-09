# OA Proposal — Issue #475

## Title
[opencode] P1: Integrate Jito ShredStream (testnet Dallas: `141.98.218.12:1002`) for ultra-low-latency block streaming, enabling oracle to submit settlements and cranks in the same slot as block production — critical for MEV-competitive execution.

## Source
GitHub issue #475

## Objective
## Objective
Integrate Jito ShredStream (testnet Dallas: `141.98.218.12:1002`) for ultra-low-latency block streaming, enabling oracle to submit settlements and cranks in the same slot as block production — critical for MEV-competitive execution.

## Context
- **ShredStream:** Jito's proprietary block streaming protocol (UDP, shreds before consensus)
- **Testnet Dallas endpoint:** `141.98.218.12:1002` (closest to us-east for GoalChain infra)
- **Latency advantage:** ~100-200ms faster than standard RPC block subscription
- **Use case:** Oracle sees block N-1 → builds bundle for slot N → submits before public mempool

## Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    SHREDSTREAM INTEGRATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Jito Block Engine (Dallas)                                     │
│       │                                                         │
│       ▼  UDP Shreds (slot N-1)                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ShredStream Client (Rust/Go)                             │   │
│  │ - Connects to 141.98.218.12:1002                         │   │
│  │ - Reassembles shreds → full blocks                       │   │
│  │ - Emits `SlotUpdate(slot, blockhash, transactions)`      │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Oracle Decision Engine                                   │   │
│  │ - On SlotUpdate:                                         │   │
│  │   1. Check pending settlements for this slot            │   │
│  │   2. Build Jito bundle with fresh blockhash             │   │
│  │   3. Submit to Block Engine API (< 50ms target)         │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Jito Block Engine REST API                               │   │
│  │ POST /api/v1/bundles                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-475` and close draft PR.
