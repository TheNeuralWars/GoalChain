# Internal docs exposure audit — goalworld.fun (issue #881)

Date: 2026-09-10 · Branch: `exp/hermes-issue-881` · Status: mitigation merged, **purge pending owner decision**
This file lives in `docs/REPORTS/`, which is excluded from the published site (see `docs/.assetsignore`).

## 1. Verified exposure (HTTP checks run from the VPS today)

| URL | Code | Notes |
|---|---|---|
| `https://goalworld.fun/intake/` | 200 | Jekyll renders `docs/intake/README.md` as a directory index listing every internal brief |
| `https://goalworld.fun/intake/2026-09-02-fractured-code-forensic-editorial-audit.md` | 200 | `text/markdown`, forensic editorial audit of the unpublished Book 1 |
| `https://goalworld.fun/intake/MUNDIAL-2026-MVP.html` | 200 | Jekyll also renders `.md` -> `.html`, so each brief is reachable twice |
| `https://goalworld.fun/REPORTS/GOALCHAIN_ACTION_PLAN.md` | 200 | internal commercial/architecture audits |
| `https://goalworld.fun/scratch/`, `/proposals/`, `/issues/` | 404 | directories are not indexed, but every file inside is still fetchable by exact path |
| `https://goalworld.fun/reader.html`, `/go/reader/` | 200 | **intentional**: `scripts/build_static_reader.py` embeds Book 1 & Book 2 — the manuscript is published on purpose, so `docs/publishing/` is NOT excluded |

## 2. Critical finding: the site is not the only (or the worst) vector

`gh repo view TheNeuralWars/GoalChain` -> `"visibility": "PUBLIC"`.

```
$ curl -o /dev/null -w '%{http_code}' \
  https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/intake/2026-09-02-fractured-code-forensic-editorial-audit.md
200
```

The forensic audit is committed to a **public GitHub repository**. Deploy filtering (what this PR does)
removes it from the website, but it stays world-readable on github.com and via `raw.githubusercontent.com`,
and it stays in every clone/fork. Removing it from the site is necessary, not sufficient:
unexposing it requires a repo-visibility or history decision by the owner (section 4).

## 3. Inventory — docs/ paths matching internal patterns (this PR does not delete any of them)

Guard run `scripts/pages/guard_published_tree.py --root docs --patterns docs --repo --advisory` -> **603 paths**.

| Path | Files | Size | Classification | Action in this PR |
|---|---|---|---|---|
| `docs/intake/` | 143 | 700K | agent briefs, `.done` markers, forensic audit | excluded from deploy |
| `docs/proposals/` | 376 | 1.8M | OA/open-code proposals incl. this issue's plan | excluded from deploy |
| `docs/REPORTS/` | 2 | 24K | commercial + architecture audits | excluded from deploy |
| `docs/governance/` | 10 | 60K | agent directives, mainnet hardening audit, structure proposal | excluded from deploy |
| `docs/issues/` | 4 | 28K | internal issue drafts | excluded from deploy |
| `docs/scratch/` `docs/tests/` `docs/adr/` `docs/archive/` `docs/insights/` `docs/social/` `docs/x-reposts/` `docs/hermes-workflow/` `docs/hackathons/` | 20 | ~120K | working notes | excluded from deploy |
| `docs/.wrangler/` | - | - | tooling state | excluded from deploy |
| 10 root docs (`SECURITY_AUDIT.md`, `GROK_SYSTEM_PROMPT.md`, `GOALCHAIN_MASTER_PROMPTS_V1.md`, `PLAYER_IMAGE_PROMPTS.md`, `IMPLEMENTATION_STATUS.md`, `EXECUTION_BACKLOG_90D.md`, `BACKLOG_STATUS_MODEL.md`, `AUDIT_STATE_2026-05-11.md`, `NFT_PROMPTS.md`, `GOALCHAIN_PITCH_DECK.md`) | 10 | ~90K | internal ops/prompt docs at the site root, 0 inbound links from any page | excluded from deploy (Tier B) |
| `docs/publishing/` (Book 1/2 manuscripts, outlines, editorial workbench) | 107 | - | **business asset, and intentionally public** through `reader.html` | NOT excluded — flagged for owner awareness only |
| `docs/ceo-log.txt` | 1 | 8.5K | ops log, linked from `ceo.html` ("Fuente: ceo-log.txt") | left public (in-product page link) |

## 4. Purge decision — needs the owner (nothing is deleted before that)

Removal from the working tree is not removal from history: the content stays in every commit, in
`raw.githubusercontent.com`, in forks, and in Cloudflare's copy of the site. Options, cheapest first:

1. **Keep files, keep them unpublished** (state after this PR): repo stays readable on github.com.
   Cheap, reversible, no history rewrite. Does not stop the GitHub-side leak.
2. **Move the internal tree out of the public repo** (`ai_context/intake/` + a private repo/submodule):
   kills future exposure at the source. 159 files in the repo reference `docs/intake` paths
   (scripts, hermes agents, `gbrain.yml`), so it must be a coordinated change, not a drive-by.
3. **History purge** (`git filter-repo` / BFG on `docs/intake/`, `docs/proposals/`, `docs/REPORTS/`,
   `docs/governance/`) + force-push all branches + purge the Cloudflare cache. Irreversible,
   breaks every clone/fork, and must be coordinated with Antigravity (integration owner) and any
   external mirrors (Notion sync, Drive backup workflows).
4. **Make the repo private** if the repo is not meant to be public at all — one setting, but it also
   hides the public SDK/program surface the project currently uses.

Owner decision requested (one line each):
- Which of tiers 1-4 for `docs/intake/` and `docs/proposals/`?
- Is `docs/publishing/` (full Book 1/2 manuscripts, inside a public repo) intentional?
- Is `docs/ceo-log.txt` on `ceo.html` intentional?

## 5. What this PR changes (mitigation)

- `docs/.assetsignore` — single source of truth for internal-doc patterns (dirs, globs, hard `.done`
  / `.env*` / `*.keypair.json` markers), with the Tier B root docs listed explicitly.
- `scripts/pages/stage_public_tree.py` — the Pages deploy no longer uploads `docs/` verbatim; it
  uploads a filtered copy, and drops `README.md` / `index.md` so Jekyll cannot build a directory index.
- `scripts/pages/guard_published_tree.py` — fails the deploy if any internal-pattern path, symlink, or
  index-next-to-internal-file survives into the upload tree. `--advisory` mode reports repo state.
- `scripts/pages/pages_patterns.py` — pattern loader (shared by both scripts).
- `scripts/pages/test_guard_published_tree.py` — 5 contract tests (staging excludes internal docs,
  index files dropped, guard blocks a leak, guard passes a clean tree, advisory mode).
- `.github/workflows/goalchain-ci-cd.yml` — new `public-tree-guard` job on every PR/push; `deploy`
  now stages + guards and uploads `_site_public` instead of `./docs`.

## 6. Verification and residual risks

Run: `python3 scripts/pages/test_guard_published_tree.py` (5/5 OK), staging + guard over the real tree
(25 internal paths excluded, 0 violations), guard on `docs/` in advisory mode (603 repo-side paths).
Post-merge verification (cannot be run before deploy): `/intake/` and `/intake/*.md` must return 404,
and `/`, `/go/`, `/play/`, `/reader.html` must stay 200.

Residual risks:
- The public GitHub repo still exposes the same content (section 2) — **not fixed by this PR**.
- Exclusions are deny-by-pattern: a new internal doc dropped in a *public* directory under `docs/`
  (e.g. `docs/notes-mine.md`) is caught only if its name matches a pattern (`*INTERNAL*`, `.done`, …).
- Cloudflare caches the site (`cache-control: max-age=600`); a purged URL can stay warm briefly.
- `docs/publishing/` (manuscript) stays on the site and in the public repo by current design.

