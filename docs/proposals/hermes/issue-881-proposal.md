# OA Proposal — Issue #881 (HERMES / FCC implementation)

## Title
SECURITY: internal working docs are published on goalworld.fun (docs/intake is public and directory-listed)

## Branch / mode
`exp/hermes-issue-881` · draft PR only (no `cambio urgente` in the issue body) · merge owner: Antigravity

## Pre-work reading (order requested by the issue)
- `CLAUDE.md` — scope rules (`docs/` and `ai_context/` allowed; never read `.env`/`config.env`), skill intents
  (frontend-design for `goalchain_webapp/`, gstack /review, /investigate, /plan-eng-review, light /cso),
  and the Nemotron-3 constraints (no `todowrite`; no single write >50 lines).
- `ai_context/AGENT_ORCHESTRATION.md` — label contract, Antigravity owns merge/integration.
- `ai_context/META_CHARTER.md` and `.cursor/rules/meta-principal.mdc` — **absent in this checkout**
  (`.cursor/` does not exist). The charter exists in `../GoalChain.bak/ai_context/META_CHARTER.md`;
  I applied it from there: R1 decompose, R2 decisiveness, R3 proportional simplicity, R5 verification by
  execution, R6 tests encode contracts, R8 calibrated reporting, R10 reversibility-weighted verification.
  Cleaning this drift (charter file missing from the active checkout) is out of scope here → follow-up.

## Problem (measured today, not assumed)
- `docs/` is the GitHub Pages site root for goalworld.fun; the deploy uploads `docs/` verbatim.
- `https://goalworld.fun/intake/` -> **200**: Jekyll renders `docs/intake/README.md` as a directory index.
- `https://goalworld.fun/intake/<brief>.md` and the Jekyll-generated `.html` twin -> **200**.
- `https://goalworld.fun/REPORTS/GOALCHAIN_ACTION_PLAN.md` -> **200**.
- **New finding:** `TheNeuralWars/GoalChain` is a **PUBLIC** repo, so the same internal docs are readable at
  `raw.githubusercontent.com/.../docs/intake/...` (200) and live in every clone and fork. Deploy filtering
  (this PR) is necessary but not sufficient; the unexpose decision is the owner's (audit §2 and §4).
- 603 paths under `docs/` match internal-doc patterns (guard `--repo --advisory`).

## Design decisions (with alternatives that were rejected)
1. **Fix at the deploy boundary, not by moving files.** The issue allows either. Rejected moving
   `docs/intake/` -> `ai_context/intake/`: 159 files reference `docs/intake` (hermes agents, ops scripts,
   `gbrain.yml`) and the issue forbids deleting/relocating before the owner confirms what is internal-only.
   R3/R10: a filtered upload is small, reversible, and does not break the agent intake workflow.
2. **Publish-time filter = "no internal pattern reaches the artifact", with the guard failing closed** if
   the filter is bypassed (new file that the pattern list misses). Deny-by-pattern is auditable in one file.
3. **Kill the directory-listing vector deterministically**: the staged tree drops `README.md` / `index.md`,
   so Jekyll cannot synthesize an index page. Rejected a `_config.yml readme_index: false` because it relies
   on GitHub Pages honouring an artifact-side Jekyll config, which I could not verify before merge.
4. **No `_config.yml`, no `.nojekyll`**: Jekyll `.md -> .html` rendering is live behaviour
   (`/intake/MUNDIAL-2026-MVP.html` = 200) and public pages may rely on it. Out of scope to change.
5. **`docs/publishing/` is NOT excluded**: `scripts/build_static_reader.py` intentionally embeds Book 1 & 2
   into `docs/reader.html`, i.e. the manuscript is public by design. Excluding it would fight the product.
   Flagged for owner awareness in the audit instead.
6. **Leave `docs/ceo-log.txt` public**: `ceo.html` links it in-product.

## Task list (plain text; `todowrite` is forbidden with Nemotron-3)
- [x] T1 Read repo constraints, CLAUDE.md, AGENT_ORCHESTRATION.md, META charter (from .bak copy).
- [x] T2 Reproduce the exposure live (HTTP codes) + audit what is already public.
- [x] T3 `docs/.assetsignore` as the single pattern source of truth (Tier A dirs, hard markers, Tier B root docs).
- [x] T4 `scripts/pages/pages_patterns.py` (loader) + `stage_public_tree.py` (filtered staging + index drop).
- [x] T5 `scripts/pages/guard_published_tree.py` (fail-closed CI guard).
- [x] T6 Contract tests `scripts/pages/test_guard_published_tree.py` (5 tests, all green).
- [x] T7 `.github/workflows/goalchain-ci-cd.yml`: `public-tree-guard` job + deploy uploads `_site_public`.
- [x] T8 Audit report `docs/REPORTS/SECURITY_INTERNAL_DOCS_AUDIT_2026-09-10.md` (no deletions).
- [ ] T9 Owner decisions: which purge tier (audit §4), manuscript + ceo-log intent.
- [ ] T10 Post-merge verification: `/intake/` must 404; `/`, `/go/`, `/play/`, `/reader.html` must stay 200.
- [ ] T11 Follow-up issue: restore `ai_context/META_CHARTER.md` + `.cursor/rules/meta-principal.mdc` in the active checkout.

## Files touched
`docs/.assetsignore`, `docs/REPORTS/SECURITY_INTERNAL_DOCS_AUDIT_2026-09-10.md`,
`docs/proposals/hermes/issue-881-proposal.md`, `scripts/pages/{pages_patterns,stage_public_tree,guard_published_tree,test_guard_published_tree}.py`,
`.github/workflows/goalchain-ci-cd.yml`. No app code, no on-chain, no economy config, no secrets.

## Scope that was deliberately NOT touched
- No deletions of tracked files (issue: owner confirms internal-only first).
- No history rewrite, no force-push, no repo-visibility change.
- No changes to `ai_context/`, webapp, API, program, oracle, `ECONOMIC_CANONICAL_CONFIG.json`.

## Risk / rollback
- Risk: a filtered deploy accidentally hides a page that is publicly linked. Mitigation: exclusions were
  chosen from measured inbound-reference counts (0 inbound `.html` links for every excluded path);
  the change is reversible by editing one file (`docs/.assetsignore`) or reverting the workflow step.
- Risk: the guard blocks a legitimate future deploy. Mitigation: explicit `--advisory` mode and path-level
  allowlisting in `docs/.assetsignore`.
- Rollback: `git revert` the merge commit (or restore `path: ./docs` in the workflow) and close the PR/branch.

