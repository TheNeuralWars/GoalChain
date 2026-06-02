# Finish all OpenCode issues (deliverables) — Antigravity hands-free

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/263
- **Task Status:** ready

- **Date:** 2026-05-27
- **Status:** done
- **Owner:** Antigravity
- **Prerequisite:** FCC reconciliation done — labels say `status:done` but **~55 draft PRs still open** (not on `main` / not on goalchain.fun)

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

```bash
cd ~/hermes/workspace/GoalChain   # or local clone
gh issue list --label status:done --label agent:opencode --state all --json number,title,labels --limit 200 > /tmp/done.json
# iterate: gh pr list --head exp/opencode-issue-N ; gh pr diff N --stat ; npm run build on touched packages
```

## Phase 1 — Complete incomplete issues (must do)

| Issue | Action |
|-------|--------|
| **#89** | Implement x-Scout inicial per body; branch `exp/opencode-issue-89`; draft PR |
| **#90** | Recover lost features post-Vercel migration per body; branch + draft PR |

Re-label: remove `status:done` → add `status:in_progress` while working → `status:done` only when PR exists and builds.

## Phase 2 — Fix draft PRs that need work (`draft_needs_work`)

For each issue in audit bucket:

1. Read issue body + acceptance criteria
2. `gh pr checkout <PR>` or create branch if missing
3. Implement missing pieces (minimal scope, META, no drive-by)
4. `cd goalchain_webapp && npm run build` / API tests if touched
5. `gh pr ready` when CI-ready; comment on issue with test evidence

**Do not** close issues as done without a verifiable PR or main commit.

## Phase 3 — Polish `draft_ok` (55 PRs)

Light pass hands-free:

- Merge `origin/main` into branch
- Fix conflicts, lint, trivial CI
- Confirm feature flags OFF (oracle mint, video automation) unless issue says otherwise
- Mark `gh pr ready` if still draft
- Issue comment: “Ready for merge — tests: …”

Skip re-implementing from scratch if diff already satisfies body.

## Phase 4 — Merge to main (after Phases 1–3)

Only then run landing plan from [`2026-05-27-pr-landings-antigravity.md`](2026-05-27-pr-landings-antigravity.md):

- Tier 1: `goalchain_webapp` / Mundial visible first
- One PR at a time, squash default
- Confirm Vercel deploy / goalchain.fun

## Allowed / forbidden

Same as FCC reconciliation brief: no `ECONOMIC_CANONICAL_CONFIG.json` value changes, no mainnet/treasury, no force-push `main`.

## Acceptance criteria

- [ ] Audit CSV committed or pasted in closing comment
- [ ] #89, #90 have open draft PRs with non-empty diff + build pass
- [ ] Zero issues in `incomplete` bucket
- [ ] Every remaining `status:done` opencode issue has merged PR OR linked open PR marked ready with CI green
- [ ] Summary for Nico: counts per bucket, next merge batch (#list)

## Hands-free rule

No questions to Nico unless: economy P0 ambiguity, merge conflict unresolvable in 3 attempts, or mainnet scope.
