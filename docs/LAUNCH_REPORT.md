# GoalWorld Web Launch — Technical Report

Work done from the Goalchain VPS by Hermes-CEO for Nico (owner). Branch: `launch-web`
(worktree `/data/work/launch-web`, never the live checkouts). All changes are unmerged;
nothing here touches DNS, Cloudflare, Vercel production, the live `_site_public` tree,
or the twenty-caddy container.

---

## Task A — Landing

### What exists today (the 4 versions, compared)

| # | Where | What it was | Kept from it |
|---|-------|-------------|--------------|
| 1 | `goalworld.fun` (live) = `docs/index.html` staged to `/data/apps/GoalChain/_site_public` | v2 hub: "World of Achievements", atmosphere video, 5 "beats", Outfit + Solana neons | brand tokens (bg `#030307`, green `#14f195`, purple `#9945ff`, Outfit), hub concept, CTA hierarchy |
| 2 | `goalworld-fun.pages.dev` (old CF Pages) | v2 minus the Well beat (stale copy of #1) | nothing unique — verified identical otherwise |
| 3 | old goalchain.fun-era tree (`/data/apps/GoalWorld/docs`, repo `TheNeuralWars/GoalWorld`, CNAME `goalworld.fun`) | v1 hub: "Four verticals. One settlement layer." card grid + shortcuts | the crisp vertical-card grid, "GoalChain = settlement" clarity, shortcut nav |
| 4 | `docs.goalchain.fun` (Vercel `goal-chain`, root dir `docs/`) | byte-identical to #1 (15,380 B) | nothing unique |

Also mined: `docs/goalworld.html` (Spanish lore portal — real lore depth),
`docs/publishing/the_neural_wars_trilogy/` (series bible, canon, film locks),
`ai_context/GOALWORLD_MASTER_ROADMAP.md` (roadmap phases), and the webapp source
(`goalchain_webapp/src`) for the honest how-to-play steps.

### Deliverable: `goalworld_site/` — one source of truth

```
goalworld_site/
├── build.mjs            zero-dep node build: layout + page fragments -> dist/
├── src/layout.html      shared head/header/footer
├── src/pages/*.html     index, about, roadmap, faq, press, privacy, terms, 404
├── src/assets/          css/js (self-hosted Outfit, 46 KB fonts), optimized art
├── tools/               make_assets.py, check_links.py, build_vercel_output.mjs
├── README.md            build/deploy/media policy docs
└── TODO.md              human-decision items (never visible on the page)
```

- `dist/` is gitignored (root `.gitignore` already had `dist/`; also `goalworld_site/.gitignore`).
  A tiny `docs/.site_out` staging dir used only inside Vercel build containers is ignored too.
- Pages ship as `<slug>.html` **plus** an extensionless mirror `<slug>/index.html`, so
  `/about`, `/terms`, `/privacy` (referenced by the Postiz config as `goalworld.fun/terms`
  and `goalworld.fun/privacy`) resolve on plain Caddy `file_server`. Canonical URLs are
  the `.html` form on `https://goalworld.fun`.
- **Media policy enforced:** every committed image < 300 KB (audit in `tools/make_assets.py`),
  OG image exactly 1200x630 (137 KB). Videos are NOT in git — teasers use the already-hosted
  files at `https://goalworld.fun/assets/img/neuralwars/...` (verified HTTP 200), with local
  webp posters and `preload="none"` (click-to-play).

### Landing content (no invented data)

- Hero: brand + `Play →` CTA to `https://play.goalworld.fun`, plus "Read Fractured Code"
  (`/go/reader`, exists live) and trailer anchor. Honest note: Devnet demo, no real capital.
- Lore: real canon only — Neo-Citania, the Link, NeuroSys, the Architect, Renaissance Protocol,
  the Fractured/Sierra Catalano, Cascade sensitivity, Serpent's Coil, Yggdrasil, the Gardeners;
  the prologue quote ("The rain falls in sevens.") is verbatim from
  `BOOK_01_FRACTURED_CODE/SAMPLE/prologue_en.md`. Cast: Mileo Chen, Kora Vega, Sierra Catalano,
  Dr. Darius Thorne (names/roles from `00_SERIES_BIBLE_AND_CANON/` + film lock sheets).
- Saga: Book 1 *Fractured Code* (complete), Book 2 *Earth's New Song / Convergence Protocol*
  (written — title from `BOOK_02_EARTHS_NEW_SONG/ENGLISH_EDITION_2026/README.md`), Book 3
  *Evolution Matrix* (outline), planned seven-book arc (series outline).
- How to play: 4 steps taken from the actual webapp flows (connect Phantom → create manager
  (username/avatar/role) → build club/squad → Arena matches → World Cup Predictor/Pick'Em),
  with the honest "playable demo on Solana Devnet… does not execute real on-chain transactions"
  (matches the app's own `SIMULACIÓN` badges and `README-SPIKE.md`).
- Roadmap: now/next/later mapped to real workstreams (`ai_context/GOALWORLD_MASTER_ROADMAP.md`
  phases + film pipeline + KDP pipeline + Genesis Agents). **No dates, on purpose.**
- Community: `x.com/nicopez` (verified HTTP 200) + GitHub `TheNeuralWars/GoalChain` (verified).
  Excluded with TODO notes: Discord invite `discord.gg/nzjHNBfSh` (API: "Unknown Invite" — dead),
  `x.com/GoalChainDotFun` (HTTP 404), `instagram.com/goalchain.fun` (unverified login wall).

### Launch quality (verified)

- Unique `<title>` + meta description + canonical per page; OG + Twitter `summary_large_image`
  with absolute `https://goalworld.fun/assets/img/og-image.jpg` (1200x630, 137 KB).
- `sitemap.xml` (7 URLs, build-stamped `lastmod`), `robots.txt` (keeps the existing AI
  content-signals comment block, adds `User-agent`/`Allow`/`Sitemap`), favicon set
  (`favicon.ico`, SVG mark, `apple-touch-icon.png`, `icon-192/512.png`), `site.webmanifest`,
  `theme-color #030307`.
- Semantic HTML, alt text on every image, skip-link, `:focus-visible` outlines, AA contrast
  (fixed the purple small-text tag to `#c084fc`), `prefers-reduced-motion`, `width/height` on
  images + responsive `srcset`/`sizes`, hero preloaded with `imagesrcset`, self-hosted fonts
  (`font-display: swap`, no Google Fonts request), JS = 700 B nav toggle, no console errors.
- Lighthouse (mobile, throttled, `http://127.0.0.1:8787`) — **≥95 on all four categories
  on every page**:

  | Page | Perf | A11y | Best Practices | SEO | LCP |
  |---|---|---|---|---|---|
  | `/` (landing) | 97 | 100 | 100 | 100 | 2.4 s |
  | `/about.html` | 98 | 100 | 100 | 100 | 2.4 s |
  | `/roadmap.html` | 98 | 100 | 100 | 100 | 2.4 s |
  | `/faq.html` | 99 | 100 | 100 | 100 | 2.1 s |
  | `/press.html` | 96 | 100 | 100 | 100 | 2.8 s |
  | `/privacy.html` | 100 | 100 | 100 | 100 | 1.7 s |
  | `/terms.html` | 100 | 100 | 100 | 100 | 1.6 s |
  | `/404.html` | 100 | 100 | 100 | 100 | 1.7 s |

  Landing metrics: FCP 0.8 s, CLS 0, TBT 110 ms. JSON reports in
  `/data/work/launch-reports/lighthouse/`. Perf fixes that moved the needle: responsive
  `srcset` variants (−527 KB potential), webp posters (−61 KB), tiny brand logo, lighter
  keyframe hero, AA-safe purple small-text, heading order. Remaining diagnostics on the
  dev server (`uses-long-cache-ttl`, `render-blocking-resources` ~160 ms) are served by
  the proposed Caddy cache headers / already within budget.

### Link check

`goalworld_site/tools/check_links.py` — 14 built HTML files, **496 links checked, 0 broken**
(internal links incl. anchors; legacy sibling pages like `/cinema.html`, `/go/reader/`
verified against the live deployed tree; external targets `x.com/nicopez` and GitHub → 200).

### Staging (NOT live)

- Deployed with the deploy script: `--ref launch-web --target /data/work/launch-staging/goalworld`.
- Served in tmux session `gw-staging`: `npx -y serve -l 8787 /data/work/launch-staging/goalworld`
  → QA URL **http://127.0.0.1:8787** (404 page verified: unknown URL returns HTTP 404 with the
  branded "Lost in the Link" page).

### Vercel (`goal-chain` project → docs.goalchain.fun)

How the project is wired (evidence): no root `vercel.json`; `docs/vercel.json` exists;
`docs.goalchain.fun/` serves `docs/index.html` with `cleanUrls` behaviour → project root
directory is `docs/`. The Vercel CLI on this box is **not logged in** (no token), so
deploy/verification goes through the Vercel GitHub integration (previews on branch pushes).

New `docs/vercel.json` (kept `docs/` files in place — nothing moved):

- `buildCommand` runs `goalworld_site/build.mjs` + `tools/build_vercel_output.mjs`,
  `outputDirectory: .site_out` — the project now serves the **same source** as goalworld.fun.
  The assembler also copies the machine-readable docs data surface (`data/`, `assets/data/`,
  root `*.json`) into the output.
- **Host-conditional redirect**: only `Host: docs.goalchain.fun` 301s to
  `https://goalworld.fun/:path*`; preview `*.vercel.app` hosts serve the site and never redirect.
- **Excluded from the redirect** (keep working exactly as today):
  `https://docs.goalchain.fun/data/*` (e.g. `data/burn_tracker.json`, written by the
  openclaw economy-crank crons and `goalchain_oracle/src/vault_crank.ts`, read by
  `goalchain_api/src/index.ts` and `docs/assets/js/burn_tracker.js`),
  `https://docs.goalchain.fun/assets/data/*` (`players.json`, `wc2026_fixture.json` — fetched by
  `docs/play/pack.html` and `ops/x/x_daily_post.sh` material), and root `*.json`
  (`ECONOMIC_CANONICAL_CONFIG.json`, fetched by the tokenomics page).
  Repo/crons/scripts/VPS grep found **no** consumer that hardcodes `docs.goalchain.fun` for
  anything else; every other path lands on `goalworld.fun` with the same file (the VPS serves the
  same staged tree).
- Legacy extensionless URLs (`/goalworld`, `/reader`, `/cinema`, … and `/play/pack`)
  map explicitly to their real `.html` at `goalworld.fun`, so they survive the redirect even
  before the Caddyfile clean-URL change below is applied.
- `ignoreCommand: "git diff --quiet HEAD^ HEAD -- goalworld_site docs/vercel.json"` — exit 0
  (no changes in those paths) skips the build.
- The old `rewrites` list (pointing into `docs/*.html`) was dropped: those files are not part of
  this deployment; on the production host the redirects above handle them.
- ⚠️ Post-merge verification (production-only behaviour, cannot be tested from a preview):
  `curl -sIL https://docs.goalchain.fun/` must show `301 → https://goalworld.fun/`, while
  `curl -s https://docs.goalchain.fun/data/burn_tracker.json` must still return JSON.

### Deploy script — `scripts/deploy_goalworld_site.sh`

```bash
./scripts/deploy_goalworld_site.sh --dry-run                  # preview, writes nothing
./scripts/deploy_goalworld_site.sh --ref origin/main          # deploy default target
./scripts/deploy_goalworld_site.sh --ref launch-web --target /data/work/launch-staging/goalworld
./scripts/deploy_goalworld_site.sh rollback --target <target> # restore latest backup
./scripts/deploy_goalworld_site.sh rollback --target <target> --backup <tarball>
```

Guarantees (documented in `goalworld_site/README.md`): fetch + checkout in the dedicated
deploy worktree `/data/work/gw-site-deploy` (never the live checkouts), build, timestamped
backup tarball in `/data/work/goalworld-site-backups/<target-name>/`, then a **merge rsync
without `--delete`** into the target — everything else in `_site_public` that other pipelines
depend on (`data/`, `publishing/`, `go/`, `play/`, film media, NFT assets, `ECONOMIC_*.json`)
stays untouched. Backups cover exactly the paths the deploy overwrites (use `--full-backup`
for a full-tree tarball; a 3 GB tarball per deploy would exhaust the disk). The target
directory itself is never replaced (docker bind mount — same rule as `scripts/pages/deploy_origin.sh`).

**What is in `_site_public` that is NOT the landing** (kept by design): the whole staged `docs/`
tree — `assets/img/neuralwars/` (1.1 GB film media, serves the teaser URLs),
`assets/img/nfts/` (362 MB), `assets/img/stadiums/` (17 MB, used by the marketing pipeline),
`docs/data/`, `publishing/`, `go/` (Kindle reader), `play/`, `architecture/`, `ops/`,
`superpowers/`, and ~40 root-level working docs. The landing only overwrites `index.html`
(today's v2 hub) and adds the new pages.

### Proposed Caddyfile diff (NOT applied — twenty-caddy untouched)

Evidence first: `curl -sI https://goalworld.fun/this-does-not-exist` returns a bare `404`
with **no body** (there is no `handle_errors` and Caddy does not fall back to `404.html`),
and `/assets/*` only gets Cloudflare's default `cache-control: max-age=14400` for some types.

Proposed for the `goalworld.fun` / `goalchain.fun` blocks (Caddy v2.11.3 — this build has no
core `try_files` directive, so the `file` matcher + `rewrite` recipe is used):

```caddyfile
    # clean URLs: /goalworld -> /goalworld.html, /about -> /about/index.html
    @clean {
        file {path} {path}.html {path}/index.html
        not path *.html *.json *.xml *.txt *.ico *.webmanifest *.png *.jpg *.jpeg *.webp *.svg *.mp4 *.woff2 *.css *.js
    }
    rewrite @clean {http.matchers.file.relative}

    # cache: images/fonts rarely change; css/js revalidate hourly (not fingerprinted)
    @cacheable path *.webp *.png *.jpg *.jpeg *.svg *.ico *.woff2
    header @cacheable Cache-Control "public, max-age=604800"
    @revalidate path *.css *.js *.webmanifest
    header @revalidate Cache-Control "public, max-age=3600"

    # real 404 page (served with the 404 status)
    handle_errors {
        @notfound expression `{http.error.status_code} == 404`
        handle @notfound {
            rewrite * /404.html
            file_server
        }
    }
```

Optional: `encode gzip zstd` instead of `encode gzip`. After applying, verify:
`curl -s -o /dev/null -w '%{http_code}' https://goalworld.fun/nope` → 404 (with branded body),
`curl -sIL https://goalworld.fun/about` → serves the page, and purge Cloudflare's cached 404s
for anything requested during this window (see the deploy-timer cache trap).

### TODOs for Nico

See `goalworld_site/TODO.md` (legal review of Privacy/Terms + contact email, dead Discord
invite, `x.com/GoalChainDotFun` 404, Instagram unverified, Book 2 date). Nothing from that
list appears on any public page.

### Security note

The repo-root `CLAUDE.md` was flagged by the agent harness as containing potential
prompt-injection / known-C2-framework patterns and was **not loaded or followed** (metadata
only: tracked file, 6.4 KB, last commit `8cde9dd7` "thin SkillSpector integration for AI agent
skills security" — likely security-scanner test fixtures). Please review it manually.

---
