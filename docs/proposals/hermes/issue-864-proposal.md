# OA Proposal — Issue #864

## Title
[HERMES] [intake] Epic: Post-Mundial Backlog — Markets, Genesis Vault, Mainnet

## Source
GitHub issue #864

## Priority
P1 (Nico keyword: cambio urgente - work on main directly)

## Objective
Epic que consolida el backlog post-Mundial 2026: live markets, Genesis Vault, y mainnet launch. Scope freeze liftado el 2026-05-27.

---

## Child Issues Status Summary

| # | Title | Status | Action Required |
|---|-------|--------|-----------------|
| #143 | Genesis Agents protocol intake brief | ✅ brief ready | Nico approval pending |
| #144 | Post-Mundial real vault_crank execute path | 🔄 in progress | Jupiter integration blocker |
| #145 | LAUNCH_READINESS_CHECKLIST mainnet gate | ✅ checklist updated | All child issues gate |
| #147 | Tune alpha-watch Mundial pre-match reminders | 🔄 in progress | — |
| #152 | X-Scout Mundial competitor research cadence | ✅ cadence defined | VPS cron config pending |
| #155 | BuilderFund contributor epoch validation runbook | ✅ runbook ready | contributors.json pending |
| #23 | Define official transactional frontend | 🔄 pending | play.goalchain.fun |
| #24 | Economy observability dashboard endpoints | 🔄 pending | /api/economy/metrics |
| #25 | Mainnet release hardening + permission audit | 🔄 pending | Blocked by #144, #4 |

---

## Phase Analysis

### Phase 1 — Devnet Hardening (CURRENT)
- ✅ vault_crank has simulation guard (`simulateAndValidate` in vault_crank.ts:24-47)
- 🔄 Economy observability endpoints pending (#24)
- 🔄 LAUNCH_READINESS_CHECKLIST sections 1-4 items pending

### Phase 2 — Pre-Mainnet
- 🔄 Genesis Agents protocol implementation (#143) — Nico approval needed
- 🔄 BuilderFund PDA live (#155) — contributors.json pending
- 🔄 All checklist items checked (#145)
- 🔄 Permission audit complete (#25)

### Phase 3 — Mainnet Launch
- 🔄 release/mainnet-v1 branch
- 🔄 Nico Go/No-Go gate sign-off
- 🔄 Program deploy by Nico
- 🔄 Live markets seeded with Genesis Vault liquidity

---

## Implementation Plan (This Session)

Since this is an Epic intake (status consolidation, not new code):

1. **Update this proposal** with current child issue statuses ✅
2. **Verify LAUNCH_READINESS_CHECKLIST.md** exists at docs/LAUNCH_READINESS_CHECKLIST.md ✅
3. **Verify vault_crank.ts** has simulation guard ✅
4. **Create .done marker** for POST_MUNDIAL_EPIC.md intake
5. **Commit to main** with "cambio urgente" mode

---

## Files Affected

- `/data/apps/GoalChain/docs/proposals/hermes/issue-864-proposal.md` (this file - updated)
- `/data/apps/GoalChain/docs/intake/POST_MUNDIAL_EPIC.md` (source intake file)
- `/data/apps/GoalChain/docs/intake/POST_MUNDIAL_EPIC.md.done` (new - marker created)

---

## Proposed File List for Child Issues

### #143 Genesis Agents Protocol
- `docs/intake/genesis-agents-protocol.md` (brief ready)

### #144 vault_crank Real Path
- `goalchain_oracle/src/vault_crank.ts` (guard exists)
- `goalchain_oracle/src/jitoBundle.ts` (Jupiter integration)

### #145 LAUNCH_READINESS_CHECKLIST
- `docs/LAUNCH_READINESS_CHECKLIST.md` (exists, updated)

### #23 Official Transactional Frontend
- `goalchain_webapp/` (play.goalchain.fun target)

### #24 Economy Observability
- `goalchain_api/src/routes/economy.ts` (endpoints needed)
- `docs/ECONOMIC_CANONICAL_CONFIG.json` (source of truth)

### #25 Mainnet Hardening
- `goalchain_program/src/lib.rs` (permission audit)
- `docs/LAUNCH_READINESS_CHECKLIST.md#section-3.1` (permissions)

---

## Risks and Rollback

| Risk | Mitigation | Rollback |
|------|------------|----------|
| Scope drift from Epic aggregation | Work stays in child issues | Revert this commit |
| Premature mainnet gate | #145 gated by all child issues | Remove .done marker |
| vault_crank simulation bypass | Guard is preflight-only, not runtime | Revert vault_crank.ts changes |

---

## Verification Commands

```bash
# Check vault_crank has simulation guard
grep -n "simulateAndValidate" goalchain_oracle/src/vault_crank.ts

# Verify LAUNCH_READINESS_CHECKLIST exists
ls -la docs/LAUNCH_READINESS_CHECKLIST.md

# Verify economic config is valid JSON
python3 -c "import json; json.load(open('docs/ECONOMIC_CANONICAL_CONFIG.json'))"

# Check all child issue .done markers
ls docs/intake/*.done | grep -E "issue-(143|144|145|147|152|155|23|24|25)" || echo "No child .done files yet"
```

---

## OA Plan (Final)
- [x] Analyze repository constraints and META alignment
- [x] Verify key files exist (vault_crank.ts simulation guard, checklist)
- [x] Document child issue statuses
- [x] Create .done marker for intake file
- [ ] Commit to main with "cambio urgente"
- [ ] Close GitHub issue #864 with status summary

---

## Status
**INTAKE COMPLETE** — Epic is documented, child issues tracked. This session marks the intake as processed and creates the .done marker.
