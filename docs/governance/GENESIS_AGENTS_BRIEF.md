# Post-Mundial Genesis Agents — Protocol Intake Brief

**Issue:** [#143](https://github.com/TheNeuralWars/GoalChain/issues/143)  
**Backlog ID:** 35  
**Priority:** P2  
**Epic:** post-mundial  
**Status:** intake-ready  
**Generated:** 2026-05-27

---

## Objective

Define the genesis protocol for GoalChain AI Agents — the initialization sequence, staking requirements, on-chain identity registration, and initial capability grants for agents entering the GoalChain ecosystem post-Mundial.

---

## Context

The Mundial 2026 demo validated the core bet→claim flow on devnet. Post-Mundial, the product roadmap calls for **Genesis Agents** — specialized on-chain entities (oracles, validators, market makers) that operate autonomously within the GoalChain program.

This brief defines how those agents are initialized, what collateral they require, and how their permissions are scoped.

---

## Agent Categories

| Agent Type | Role | On-chain Account | Collateral |
|-----------|------|-----------------|-----------|
| **Oracle Agent** | Reports match outcomes | `oracle_record` PDA | Reputation stake (GOAL tokens) |
| **Market Maker Agent** | Seeds liquidity pools | `vault` PDA | Min 10 GOAL |
| **Validator Agent** | Cross-checks oracle reports | `validator` PDA | Reputation stake |
| **BuilderFund Agent** | Tracks contributor epochs | `builder_fund` PDA | None (governance) |

---

## Genesis Protocol Steps

### Phase 1 — Registration
1. Agent submits `register_genesis_agent` instruction with:
   - `agent_type`: oracle | market_maker | validator | builder_fund
   - `agent_pubkey`: agent's signing key
   - `stake_lamports`: collateral amount
   - `metadata_uri`: off-chain config (IPFS or Arweave)
2. Program validates stake ≥ minimum, creates `genesis_agent` PDA
3. Agent receives `agent_capability_token` (NFT) scoped to its role

### Phase 2 — Capability Grants
- Oracle agents: granted `can_record_match = true`
- Market makers: granted `can_seed_vault = true`, cap at 1000 GOAL per epoch
- Validators: granted `can_challenge_oracle = true`, 24h window per match
- All agents: subject to `slashing_enabled = false` (devnet phase)

### Phase 3 — Activation
- Admin co-signs activation via `activate_genesis_agent`
- Agent enters `active` state — can begin operating

---

## Acceptance Criteria

- [ ] `docs/governance/GENESIS_AGENTS_BRIEF.md` present and reviewed by Nico
- [ ] On-chain instruction names (`register_genesis_agent`, `activate_genesis_agent`) agreed
- [ ] Collateral minimums documented in `ECONOMIC_CANONICAL_CONFIG.json` (do not change values — add comments only)
- [ ] Agent type enum documented in program `state.rs` comments
- [ ] No code changes until Nico approves on-chain scope

---

## Dependencies

- `#144` — vault_crank real execute path (market maker agents depend on real burns)
- `#145` — LAUNCH_READINESS_CHECKLIST (agents need mainnet gate to pass)
- `#25` — Mainnet permission audit (agent permissions must pass audit)

---

## Open Questions for Nico

1. Should slashing be enabled on devnet for testing, or mainnet-only?
2. What is the minimum stake for oracle agents? (Suggested: 5 GOAL)
3. Should `metadata_uri` be required or optional at genesis?

---

## Next Steps

1. Nico reviews and approves this brief
2. Agent creates `feat/genesis-agents-protocol` branch
3. Implements `register_genesis_agent` and `activate_genesis_agent` in `goalchain_program/programs/goalchain_program/src/lib.rs`
4. PR reviewed → merge to `main` after anchor test passes
