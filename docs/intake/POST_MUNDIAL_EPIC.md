# Epic: Post-Mundial Backlog — Markets, Genesis Vault, Mainnet

**Issue:** [#157](https://github.com/TheNeuralWars/GoalChain/issues/157)  
**Backlog ID:** 49  
**Priority:** P2 (Epic)  
**Scope Freeze Lifted:** 2026-05-27  
**Generated:** 2026-05-27

---

## Scope

This epic tracks the post-Mundial 2026 roadmap: live markets, Genesis Vault, and mainnet launch. All items were frozen pending the Mundial 2026 demo. Scope freeze was lifted on 2026-05-27.

---

## Child Issues

| # | Title | Status | Blocker |
|---|-------|--------|---------|
| #143 | Genesis Agents protocol intake brief | ✅ brief ready | Nico approval |
| #144 | Post-Mundial real vault_crank execute path | 🔄 in progress | Jupiter integration |
| #145 | LAUNCH_READINESS_CHECKLIST mainnet gate | ✅ checklist updated | All child issues |
| #147 | Tune alpha-watch Mundial pre-match reminders | 🔄 in progress | — |
| #152 | X-Scout Mundial competitor research cadence | ✅ cadence defined | VPS cron config |
| #155 | BuilderFund contributor epoch validation runbook | ✅ runbook ready | contributors.json |
| #23 | Define official transactional frontend | 🔄 pending | — |
| #24 | Economy observability dashboard endpoints | 🔄 pending | — |
| #25 | Mainnet release hardening + permission audit | 🔄 pending | #144, #4 |

---

## Phases

### Phase 1 — Devnet Hardening (current)
- vault_crank real path guarded (#144)
- Economy observability endpoints (#24)
- anchor CI fixed (#4 — open)
- EconomyConfigBanner fixed (#3 — open)

### Phase 2 — Pre-Mainnet
- Genesis Agents protocol implemented (#143)
- BuilderFund PDA live
- All LAUNCH_READINESS_CHECKLIST items checked (#145)
- Permission audit complete (#25)

### Phase 3 — Mainnet Launch
- `release/mainnet-v1` branch created and reviewed
- Go/No-Go gate signed by Nico in LAUNCH_READINESS_CHECKLIST
- Program deployed to mainnet by Nico
- live markets seeded with Genesis Vault liquidity

---

## Definition of Done

- All child issues closed with merged PRs
- `LAUNCH_READINESS_CHECKLIST.md` section 5 fully checked
- Nico approves Go/No-Go gate
- `release/mainnet-v1` merged to `main`
