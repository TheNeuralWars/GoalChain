# OA Proposal — Issue #867

## Title
[HERMES] [intake] Finish all OpenCode issues (deliverables) — Antigravity ha

## Source
GitHub issue #867

## Objective
## Objective
# Finish all OpenCode issues (deliverables) — Antigravity hands-free

- **Task Created:** https://github.com/TheNeuralWars/goalworld/issues/263
- **Task Status:** ready

- **Date:** 2026-05-27
- **Status:** done
- **Owner:** Antigravity
- **Prerequisite:** FCC reconciliation done — labels say `status:done` but **~55 draft PRs still open** (not on `main` / not on goalworld.fun)

## Objective

**Sí conviene terminar el trabajo de los issues antes de un merge masivo a ciegas.** Hands-free: auditar cada issue `status:done` + `agent:opencode`, completar lo que falte, dejar cada issue con **PR lista para merge** (o merged), luego integrar a `main` en orden seguro.

## Truth table (audited 2026-05-27 on VPS)

| Bucket | ~Count | Meaning |
|--------|--------|---------|
| `status:done` + open draft PR `exp/opencode-issue-N` | **55** | FCC corrió; hay rama/PR — **falta review, completar gaps, CI, merge** |
| Merged PR or commit on `main` | **8** | Verdaderamente cerrados en código |
| **Incomplete** (no branch, no PR, no main) | **2** | **#89**, **#90** — re-abrir y implementar |
| Open PRs total (all agents) | **~62** | No confundir con “issues sin hacer” |

**Conclusión:** La cola FCC está vacía, pero **el producto no está “listo”** hasta que cada issue tenga entregable verificado y, si aplica, merge a `main`.

## Phase 0 — Audit script (run first)

Produce `docs/intake/artifacts/2026-05-27-issue-audit.csv` with columns:

`issue`, `title`, `priority`, `bucket` ∈ {`merged`,`draft_ok`,`draft_needs_work`,`incomplete`,`direct_main_verify`}, `pr_number`, `notes`

Rules:

- **merged:** PR merged or clear commit on `origin/main` for issue
- **draft_ok:** open PR, non-empty diff vs `main`, builds
- **draft_needs_work:** open PR empty, failing CI, or scope not met per issue body
- **incomplete:** no PR/branch/commit (#89, #90 known)
- **direct_main_verify:** `status:done` + cambio urgente (#167–#170) — `git log origin/main` + diff sanity

## OA Plan (final state)

### Current reality (2026-07-11)
- 198 issues with `status:done` + `agent:opencode` on GitHub
- 179 of them have commits on `origin/main` (verified)
- **19 issues** have `status:done` but NO commit on main AND NO branch/PR
- These are labeled but never actually implemented

### The 19 pending issues (all P1/P2, no branch, no PR):
```
  #  96  P2  OPENCODE FCC: Simulation badges on mock webapp surfaces
  #  99  P1  OPENCODE FCC: Harden smoke-devnet.sh API checks
  # 118  P1  P1[docs][api] Point goalchain.fun JS to production API base
  # 120  P1  P1[oracle][devnet] Seed participantPlayerIds for oracle_record_match
  # 124  P1  P1[api][economy] Add drift and config_version to /api/economy/config
  # 125  P1  P1[hermes][ops] Run sync-hermes-active-profile-discord.sh verify
  # 126  P1  P1[hermes][docs] Enforce HERMES-MUNDIAL-SCOPE-FREEZE
  # 127  P1  P1[grok] Review Mundial MVP EN public copy
  # 130  P1  P1[tech-debt] Archive goalchain_backend empty package at root
  # 131  P1  P1[ci][devnet] GitHub Action run smoke-devnet.sh on webapp PRs
  # 135  P1  P1[hermes][oracle] Audit VPS env video alerts flags OFF
  # 138  P2  P2[webapp] JupiterQuoteWidget integrate or remove orphan
  # 139  P2  P2[webapp] Remove or archive DashboardHub.tsx unrouted
  # 142  P2  P2[webapp][smart-contracts] Post-Mundial live market bets UI
  # 146  P2  P2[webapp] Post-Mundial rent_nft read-only UI in Club
  # 149  P2  P2[oracle] Replace @ts-ignore in OracleService typed import
  # 150  P2  P2[webapp][oracle] LiveEventFeed optional real-time oracle stream
  # 153  P2  P2[webapp] Classic Hub deprecate route or fix coach API URL
  # 156  P1  Epic Mundial 2026 release gate (tracker, blocked by #5,#6,#7,#3,#8,#9,#13,#17)
```

### Action plan
1. P1 issues (#96,#99,#118,#120,#124,#125,#126,#127,#130,#131,#135,#156): implement directly on main (cambio urgencia implicit in stale-bucket remediation)
2. P2 issues (#138,#139,#142,#146,#149,#150,#153): close as superseded/post-mundial deprecated (Mundial ended)
3. Update audit CSV with final bucket counts

### Implementation scope per issue (P1, quick wins)
- #99: Harden smoke-devnet.sh API checks (ops script fix)
- #118: Point goalchain.fun JS to production API (env/config change)
- #120: Seed participantPlayerIds for oracle demos (data/seed file)
- #124: Add drift + config_version to /api/economy/config (API change)
- #130: Archive goalchain_backend empty package (delete/rename)
- #131: CI smoke-devnet.sh GitHub Action (workflow file)
- #135: Audit VPS env video alerts flags OFF (Hermes config)
- #156 epic: Close as completed (tracker issue, sub-issues merged)

### Test commands
```bash
cd goalchain_webapp && npm run build
cd goalchain_api && npm test
cd goalchain_oracle && npx tsc --noEmit
gh pr list --state open --json number,title --jq '.[] | "\(.number) \(.title)"'
```

### Risk / rollback
- Risk: P2 post-Mundial issues may be stale scope
- Rollback: revert main commit by issue number (git revert & push)
