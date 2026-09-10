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

## 1b. Which deploy path actually serves goalworld.fun (found while fixing)

```
$ gh api repos/TheNeuralWars/GoalChain/pages
{"build_type":"legacy","source":{"branch":"main","path":"/docs"},"cname":"goalworld.fun","status":"built"}
$ gh run view 32643918073        # GoalChain CI/CD on main
X 🔍 Validar imágenes NFT y naming — "The job was not started because your account is locked due to a billing issue."
```

- The site is built by the **legacy branch Pages build** (`main:/docs`, Jekyll), **not** by the
  `GoalChain CI/CD` workflow: that workflow has failed on every push since 2026-08-16 (Actions
  billing lock), so `upload-pages-artifact` has not deployed anything for weeks.
- Consequence: the *only* mechanism that can keep a path out of the live site today is
  `docs/_config.yml` `exclude:` (plus `readme_index: enabled: false` to disable directory indexes),
  which the legacy Jekyll build honours. Moving deploy filtering into the workflow is correct
  forward-looking hardening, but it is inert until billing is fixed **and** the Pages source is
  switched to "GitHub Actions". This is recorded as a residual risk, not fixed here (repo/infra
  setting, not a code change).

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

- **`docs/_config.yml` (the fix that actually applies to the live site today)** — `exclude:` for every
  internal dir/file, and `readme_index: enabled: false` so Jekyll can no longer turn a `README.md` into
  a browsable directory index. Verified locally with Jekyll 4.4.1: reproducing the old behaviour built
  `/intake/index.html` + 142 intake files, while building with this config produces **no** `intake/`,
  `proposals/`, `REPORTS/`, `governance/`, `scratch/` and drops 6 README-derived index pages, with
  `/`, `/go/`, `/play/`, `/reader.html`, `assets/**` untouched.
- `docs/.assetsignore` — single source of truth for internal-doc patterns (dirs, globs, hard `.done`
  / `.env*` / `*.keypair.json` markers), with the Tier B root docs listed explicitly.
- `scripts/pages/stage_public_tree.py` — the Actions-based deploy path no longer uploads `docs/`
  verbatim; it uploads a filtered copy and drops `README.md` / `index.md`.
- `scripts/pages/guard_published_tree.py` — fails the deploy if any internal-pattern path, symlink, or
  index-next-to-internal-file survives into the upload tree. `--advisory` mode reports repo state.
- `scripts/pages/check_ignore_sync.py` — CI check that `_config.yml` and `.assetsignore` have not drifted
  (a path the guard skips but Jekyll still publishes is a silent re-exposure).
- `scripts/pages/pages_patterns.py` — pattern loader (shared).
- `scripts/pages/test_guard_published_tree.py` — 7 contract tests.
- `scripts/pages/verify_live_site.py` — post-merge acceptance check: 7 URLs must be 404, 9 public pages
  must stay 200.
- `.github/workflows/goalchain-ci-cd.yml` — new `public-tree-guard` job on every PR/push (tests, staging,
  guard, sync check, advisory report); `deploy` stages + guards and uploads `_site_public`.

## 6. Verification and residual risks

Executed locally (2026-09-10):
- `python3 scripts/pages/test_guard_published_tree.py` -> **7/7 OK**.
- `python3 scripts/pages/stage_public_tree.py --src docs --dst /tmp/_site_public` -> 2121 public files,
  35 internal paths excluded, 5 index files dropped, 0 files silently missing vs `docs/`.
- `python3 scripts/pages/guard_published_tree.py --root /tmp/_site_public --patterns docs` -> exit 0;
  injected-leak run -> exit 1 naming the path.
- `python3 scripts/pages/check_ignore_sync.py docs` -> OK (38 patterns vs 27 excludes).
- Jekyll 4.4.1: build **without** `_config.yml` reproduces the leak (`intake/index.html` + 142 files);
  build **with** it excludes every internal path and emits no README index.
- `python3 scripts/pages/verify_live_site.py` -> 9/16 today, i.e. the 7 must-404 URLs are still public
  (this is the pre-merge baseline; it must read 16/16 after the merge + Pages rebuild).

Not verifiable before merge: the actual Pages rebuild (the repo's Actions are billing-locked, so the
legacy build is what will pick up `docs/_config.yml`).

Residual risks:
- The public GitHub repo and its history still expose the same content (section 2) — **not fixed**.
- The `GoalChain CI/CD` deploy job is inert while Actions are billing-locked; the workflow hardening
  only takes effect after billing is restored and the Pages source is switched to "GitHub Actions".
- `docs/_config.yml` is now load-bearing for the live site: a YAML error there stops Pages from
  rebuilding. Mitigated by `check_ignore_sync.py` in CI, but CI itself cannot deploy today.
- Exclusions are deny-by-pattern: a new internal doc dropped in a *public* directory under `docs/`
  is caught only if its name matches a pattern (`*INTERNAL*`, `.done`, …).
- Cloudflare caches for `max-age=600`; a removed URL can stay warm briefly.
- `docs/publishing/` (manuscript) stays on the site and in the public repo by current design.

