# OA Proposal — Issue #861

## Title
[HERMES] [intake] HANDOFF → Hermes (goalworld Manager)

## Source
GitHub issue #861

## Objective
## Objective
# HANDOFF → Hermes (goalworld Manager)

- **Task Created:** https://github.com/TheNeuralWars/goalworld/issues/259
- **Task Status:** ready

**To:** Hermes / goalworld Manager (`jito-strategy` profile)  
**From:** Cursor (local session, bridge down)  
**Date:** 2026-05-26  
**Language:** English for public channels · Spanish OK with Nico in `manager:` WhatsApp

---

## Executive summary

goalworld has completed **Mundial 2026 MVP implementation in the local repo** (bet + claim, simulation badges, oracle `record_match`, economy banner code, governance docs). The **Hermes bridge is Git + intake**, not live GBrain sync.

**Your job as coordinator:**

1. Pull this handoff from `main` after Nico/Antigravity push.
2. Run `gbrain import ai_context docs/intake`.
3. **Bulk-create ~50 GitHub issues** from [`GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv`](GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv) (issue #50 in CSV).
4. Enforce **Mundial scope freeze** until 2026-06-11.
5. **Do not** reopen merge stack PRs #32–#34 — already merged via **#26** and **#35**.

**North star:** Demo devnet bet→claim on `play.goalworld.fun` before **11 Jun 2026**. CEO does 3 commands only: `prioridad` | `dispatch` | `estado`.

---

## Merge queue — DO NOT CREATE ISSUES

| PR | Status | Note |
|----|--------|------|
| #26 Week 1 canonical | **MERGED** 2026-05-23 | — |
| #35 Stack #27–#34 → main | **MERGED** 2026-05-23 | Supersedes individual #32–#34 |
| #32, #33, #34 | **Superseded** | No re-merge |
| FCC drafts #95–#99, #103 | **Close** | Issue CSV #13 |

**Only doc follow-up:** Issue #29 — update stale “merge pending” text in `MASTER_PLAN.md`, `IMPLEMENTATION_STATUS.md`.

## FCC Analysis (2026-07-10)

### Status audit

| Task | Status | Notes |
|------|--------|-------|
| Git pull / handoff landed on main | ✅ Done | docs/intake/2026-05-26-hermes-manager-handoff.md committed |
| gbrain import | ⏭️ Skipped | gbrain tool not available on VPS; informational |
| Bulk create ~50 GitHub issues | ⏸️ Needs approval | Per handoff: "only after Nico approves". CSV in docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv. Issues NOT yet in GitHub (confirmed via gh). |
| Scope freeze 2026-06-11 | ✅ Informational | doc: docs/intake/HERMES-MUNDIAL-SCOPE-FREEZE.md; deadline passed (Jul 2026). |
| PR #32-34 NOT reopened | ✅ Confirmed | GitHub shows #26 + #35 MERGED only; superseded PRs not present. |
| Stale text in MASTER_PLAN / IMPLEMENTATION_STATUS | ✅ Already clean | grep confirms 0 occurrences of "merge pending" / "blocked PR #32-34". |

### GitHub issues CSV audit
- CSV rows 1-49 correspond to Mundial backlog items
- None of the CSV-titled issues (P0/P1/P2 prefix) found in current GitHub
- Issue #753 (FutureHook) is close to CSV #21 but different numbering
- Bulk create blocked per handoff approval requirement

## Tasks implemented (FCC direct-main)

### T1 — Archive scope freeze as historical
- Move/create: docs/intake/HERMES-MUNDIAL-SCOPE-FREEZE.md → add `[ARCHIVED 2026-06-11]` header
- Freeze period: 2026-05-26 → 2026-06-11 (expired)
- No change to core content; informational only

### T2 — Close intake marker for #861
- Create: docs/intake/2026-05-26-hermes-manager-handoff.md.done
- Mark handoff as processed and archived

### T3 — Update proposal with full audit results
- Done (this file)

## Files touched
- docs/intake/HERMES-MUNDIAL-SCOPE-FREEZE.md (add archive header)
- docs/intake/2026-05-26-hermes-manager-handoff.md (create .done marker)

## Tests run
- `grep "merge pending\|PR #32" docs/IMPLEMENTATION_STATUS.md` → 0 matches ✅
- `grep "merge pending\|PR #32" docs/governance/MASTER_PLAN_INDEX.md` → 0 matches ✅
- `gh issue list --repo TheNeuralWars/GoalChain --state all` → confirmed CSV issues not in GitHub ✅

## Residual risks
1. **Bulk issue create (CSV rows 1-49)**: Needs Nico explicit approval via WhatsApp manager. FCC should NOT run `subprocess.run` in the bulk-create script without that approval.
2. **Scope freeze expired 2026-06-11**: Archive status noted; post-Mundial items (CSV #34-49 epic #49) may now be unblocked — CEO must confirm.
3. **gbrain import**: Not executable on VPS; requires external gbrain tool.

## Rollback
- Revert any edits to HERMES-MUNDIAL-SCOPE-FREEZE.md by restoring original content.
- Remove .done marker file.

---
*FCC — GoalChain code agent — 2026-07-10*
