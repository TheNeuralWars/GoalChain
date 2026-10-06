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
  branded "Lost in the Link" page; extensionless `/terms` and `/about` resolve).
- Rollback verified on staging: deploy #2 backed up 71 paths, `index.html` deleted on purpose,
  `rollback` restored all 71 paths including `index.html`.
- **Nothing went live** — re-verified after all deploys: `goalworld.fun`, `docs.goalchain.fun`
  and `goalchain.fun` all still serve the old 15,380 B hub (HTTP 200), and
  `docs.goalchain.fun/data/burn_tracker.json` still returns JSON.

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

**Preview deployment (commit `580f59b4` on `launch-web`) — verified built:**

- GitHub status `Vercel – goal-chain` → **success** (deployment `5tgLRWXFR8XkMrYmWN2SVLDuEpPv`).
- Preview URL (git-branch alias):
  **https://goal-chain-git-launch-web-theneuralwars-projects.vercel.app**
- ⚠️ The preview is behind Vercel **Deployment Protection (team SSO)** — anonymous curl
  gets `302 → vercel.com/sso-api`. Nico can open it from a Vercel-team browser session.
  For public QA access: Vercel → project `goal-chain` → Settings → Deployment Protection →
  add a Protection Bypass Password (or allow public previews). Content could therefore not be
  rendered from this box; build status is green and the same `buildCommand` was exercised
  locally end-to-end (`node goalworld_site/build.mjs && node ../goalworld_site/tools/build_vercel_output.mjs`
  from `docs/`, output verified: pages + `data/` + `assets/data/` + root JSONs).
- After merge (never done from here): confirm the two post-merge checks below.
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

## Task B — Webapp + Vercel config + final QA

Branch `launch-web`, commits `04069d4f`..`fca14e40` on top of Task A (all pushed to
`origin/launch-web`). Everything below was executed and verified on this VPS; commands
labeled READY-TO-RUN were intentionally NOT executed.

### Summary

- `goalchain_webapp/vercel.json`: `npm ci` install (lockfile in sync — verified locally and
  by a green Vercel build), immutable caching for `/assets/*` (`index.html` stays
  revalidating), and an `ignoreCommand` that builds only when `goalchain_webapp/` or
  `goalchain-sdk/` changed.
- Bundle: Solana wallet stack (`@solana/*`, wallet-adapter, anchor, spl-token) moved out of
  the main chunk into lazy chunks that load only when a wallet/chain feature is used.
  Main JS 1,614 KB → 809 KB (gzip 502 → 268 KB); eager JS total 1,614 KB → 980 KB
  (gzip 502 → 322 KB); on-demand Solana stack 603 KB raw / 172 KB gzip.
- First-use onboarding: clear welcome + how-it-works, working SPA links (the old `/#/hub`
  hash links never routed), honest devnet note, SW shell made deploy-safe.
- QA AFTER: Lighthouse mobile+desktop on the new landing staging and the new webapp build
  vs the BEFORE baseline; OG validation; a11y/SEO fixes found by the audit (bottom-tab
  aria-labels, `<main>` landmark, valid `robots.txt`, OG/description meta).
- Vercel env + domain removal: CLI on this box has **no Vercel credentials**, so those two
  steps are prepared as exact READY-TO-RUN commands below (nothing was changed on Vercel).

### 1) `goalchain_webapp/vercel.json`

```json
"installCommand": "npm ci",
"ignoreCommand": "bash \"$(git rev-parse --show-toplevel)/goalchain_webapp/scripts/vercel-ignore.sh\"",
"headers": [{ "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control",
             "value": "public, max-age=31536000, immutable" }] }]
```

- `npm ci` works with the `@goalchain/sdk = file:../goalchain-sdk` layout: locally
  `npm ci` → 424 packages + `tsc && vite build` green; on Vercel the build for `8f4e280b`
  and `fca14e40` both reached **success** (`Vercel – goalchain_webapp`).
  (`node_modules/@goalchain/sdk` becomes a symlink to `../goalchain-sdk`; the existing
  `vite.config.ts` aliases keep resolving — unchanged.)
- `/assets/*` is where Vite emits hashed JS/CSS, so `immutable` is safe there; `index.html`
  is served at `/` and `/index.html` and is NOT matched by the rule.
- `scripts/vercel-ignore.sh` exits 0 (skip build) when the commit diff touches neither
  `goalchain_webapp/` nor `goalchain-sdk/`, exit 1 (build) otherwise. The Ignored Build
  Step runs from the project Root Directory (`goalchain_webapp/`), so the command anchors
  itself at `git rev-parse --show-toplevel`. Local logic tests (real commits):

  | case | commits | diff touches | exit | verdict |
  |---|---|---|---|---|
  | webapp change | `e812febd..d3f86b8e` | `goalchain_webapp/` | 1 | builds ✓ |
  | docs-only | `580f59b4..HEAD` (docs/LAUNCH_REPORT.md) | — | 0 | skipped ✓ |
  | no `VERCEL_GIT_PREVIOUS_SHA` | falls back to `HEAD^` | — | 0 | skipped ✓ |

  Degenerate cases (unknown parent, shallow clone, non-git upload) exit 1 → always build.

### 2) Bundle split (before/after `vite build`)

Architecture: `src/wallet/gate.tsx` (tiny gate, imports NO Solana libs) +
`src/wallet/WalletProviders.tsx` (real `ConnectionProvider/WalletProvider/WalletModalProvider`,
dynamic-imported) + `src/wallet/ConnectButton.tsx` (plain button that opens the modal via the
gate, hands over to the stock `WalletMultiButton` once loaded). Wallet-consuming pages
(`CreateUser`, `UserProfile`, `FixturesPanel`, `LiveEventFeed`, `NFTMarketplace`) are
`React.lazy` + wrapped in `WalletRequired`; `vite.config.ts` `manualChunks` groups
`solana-core`, `wallet-adapter`, `react-vendor`, `polyfill`.

| chunk | before raw / gzip | after raw / gzip | when loaded |
|---|---|---|---|
| main `index-*.js` | 1,604.7 / 502.1 KB | 809.5 / 267.8 KB | first paint |
| eager total (main + react-vendor + polyfill) | 1,604.7 / 502.1 KB | 979.6 / 321.8 KB | first paint |
| `solana-core` (web3.js, spl-token, anchor) | — (inside main) | 418.1 / 120.6 KB | wallet/chain feature |
| `wallet-adapter` | — (inside main) | 136.5 / 43.6 KB | wallet/chain feature |
| `goalchainClient` | — (inside main) | 48.8 / 9.5 KB | wallet/chain feature |
| `wallet-adapter-*.css` | 4.9 KB (eager w/ main css) | 4.9 / 1.4 KB | wallet/chain feature |
| page chunks (CreateUser, UserProfile, FixturesPanel, NFTMarketplace, LiveEventFeed…) | partly eager | 2.5–27.2 KB each | per route/tab |

On-demand Solana stack total: 603.5 KB raw / 172.4 KB gzip. Files:
`/data/work/launch-reports/bundle/{before,after}.txt`.

Smoke test (headless Chromium against `vite preview`, fresh profile):

- `/` renders, **zero** solana/wallet resources at first paint (resource-timing proof).
- Clicking "Connect Wallet" fetches `WalletProviders/wallet-adapter/solana-core` chunks and
  opens the modal — title "Connect a wallet on Solana to continue", Phantom listed. ✓
- `/estadio` fixtures + live feed render real devnet content after the lazy load; `/club`
  market tab renders; `/crear-usuario` renders. Console clean except the local-only
  `/_vercel/insights/script.js` 404 (Vercel Analytics is injected by the platform on
  Vercel deploys — see pending items).
- A real bug was found and fixed during this test: the wallet-gate bridge published wallet
  state with a fresh object identity each time, causing an infinite render loop that pinned
  lazy panels on their Suspense fallback (commit `6ac29b4e`).

### 3) First-use onboarding (play app `/`)

- Hero keeps the product pitch ("Football Meets DeFi…") and now leads with the canonical
  brand line "GoalWorld · World of Achievements"; primary CTA = Connect Wallet, secondary =
  "How it works ↓".
- New "New here? You are playing in three steps." section (Create account → Matchday →
  Club) with working SPA links, plus quick links (Dashboard / Matchday / Club / Staking) and
  an honest status note: "Playable demo running on Solana devnet. Features marked
  'Simulation' are not live markets."
- **Pulled from public copy** (unverified, restorable from git history): rarity counts
  "Mythic 10 / Legendary 50 / Genesis NFTs 528" and "$GCH Presale Active … 30% of the
  5,000 SOL hard cap already raised". Rationale in the `TODO(marketing)` comment in
  `src/ui/LandingPage.tsx` — Nico's call to restore.
- Fixed broken links: `/#/hub`, `/#/staking`, `/#/club`, `/#` (hash URLs never routed under
  BrowserRouter) → real routes.
- `sw.js`: navigations now network-first (stale cached `index.html` referenced deleted
  hashed chunks after every deploy), cache bumped to `goalchain-v2` with activate cleanup.
- Mobile QA at 390×844: no horizontal overflow, CTAs visible.

### 4) Vercel env — Preview variables (BLOCKED: no CLI credentials)

`vercel` on this box is not logged in. Exact output:

```
Vercel CLI 54.10.3 (Node.js 22.23.3)
> No existing credentials found. Starting login flow...
>   Visit https://vercel.com/oauth/device?user_code=XXXX-XXXX
```

READY-TO-RUN (Nico; values never printed — pulled to a root-only temp file and piped):

```bash
vercel login                        # or: export VERCEL_TOKEN=… (token, not shown here)
cd /data/work/launch-web/goalchain_webapp
vercel link --project goalchain_webapp --yes        # only if not linked yet
umask 077
vercel env pull /tmp/.vercel-prod.env --environment=production --yes
for NAME in VITE_API_BASE_URL VITE_RPC_URL; do
  vercel env rm "$NAME" preview --yes 2>/dev/null || true
  sed -n "s/^$NAME=//p" /tmp/.vercel-prod.env | vercel env add "$NAME" preview
done
rm -f /tmp/.vercel-prod.env
vercel env ls                       # expect the 2 names with scope Preview+Production
```

### 5) Vercel domains — remove `goalworld.fun`, `www.goalworld.fun`, `crm.goalworld.fun` from `goal-chain` ONLY (BLOCKED: no CLI credentials)

Verified the three hostnames do NOT resolve to Vercel (safe to remove; `play.goalworld.fun`
IS on Vercel and stays untouched):

| host | DNS | HTTP | served by |
|---|---|---|---|
| goalworld.fun | 172.67.167.91, 104.21.73.224 (Cloudflare) | 200, `server: cloudflare`, no `x-vercel-*` | Cloudflare → VPS Caddy |
| www.goalworld.fun | same Cloudflare pair | 200, `server: cloudflare` | Cloudflare → VPS Caddy |
| crm.goalworld.fun | `localhost.` / 127.0.0.1 | 200 | not Vercel |
| play.goalworld.fun | `cname.vercel-dns.com` | — | Vercel (keep) |

READY-TO-RUN (Nico; only project `goal-chain`):

```bash
vercel whoami --scope theneuralwars-projects
vercel domains ls --scope theneuralwars-projects        # confirm the 3 are on goal-chain
vercel domains rm goalworld.fun --yes --scope theneuralwars-projects
vercel domains rm www.goalworld.fun --yes --scope theneuralwars-projects
vercel domains rm crm.goalworld.fun --yes --scope theneuralwars-projects
```

(If the CLI insists the domains are project-level aliases rather than team domains, use the
dashboard: project `goal-chain` → Settings → Domains → remove each. Do NOT touch DNS.)

### 6) Preview deployments (both projects green)

| project | deployment | preview URL | state |
|---|---|---|---|
| goal-chain | `6WkgiUX6PJfjmpV5H3dFpw1rhG7D` | https://goal-chain-git-launch-web-theneuralwars-projects.vercel.app | success, **SSO-protected** |
| goalchain_webapp | `EHCd4yatbW7Xn41bZ5YFQ8YtJ4Vy` | https://goalchainwebapp-lreni0s0d-theneuralwars-projects.vercel.app | success, **SSO-protected** |

Latest pushes `8f4e280b` and `fca14e40` both show `Vercel – goal-chain=success` and
`Vercel – goalchain_webapp=success` in the GitHub commit statuses. Both preview hosts return
`302 → https://vercel.com/sso-api` for anonymous requests (Vercel Deployment Protection,
team SSO) — settings untouched, per instructions. Because of that, Lighthouse ran against
local staging/preview (below) and the immutable `/assets/` header could not be curl-verified
through the protected preview (config is deployed with the green build; verify from a
Vercel-team browser or with a Protection Bypass for QA).

### 7) QA AFTER — Lighthouse (13.5.0) + OG

Measured locally because both previews are SSO-protected:
landing = Task A staging `http://127.0.0.1:8787`, webapp = `vite preview` `http://127.0.0.1:4173`.
BEFORE numbers come from the baseline in `/data/work/launch-reports/before/SUMMARY.md`
(measured against the LIVE hosts). Caveat: localhost runs lack TLS/CDN latency — compare
scores/metrics directionally, not as identical conditions.

| site | form | perf | a11y | best-practices | SEO | (BEFORE perf/a11y/bp/SEO) |
|---|---|---|---|---|---|---|
| landing (staging :8787) | mobile | 99 | 100 | 100 | 100 | 70 / 89 / 100 / 100 (goalworld.fun live) |
| landing (staging :8787) | desktop | 100 | 100 | 100 | 100 | 79 / 98 / 100 / 100 |
| webapp (vite preview :4173) | mobile | 84 | 100 | 96 | 100 | 68 / 94 / 100 / 82 (play.goalworld.fun live) |
| webapp (vite preview :4173) | desktop | 99 | 100 | 96 | 100 | 97 / 98 / 100 / 82 |

Webapp key metrics (AFTER): mobile FCP 3.4 s, LCP 3.5 s, TBT 0 ms, CLS 0.019, 366 KiB
transferred (BEFORE: FCP 4.9 s, LCP 4.9 s, TBT 150 ms, CLS 0.020, 586 KiB); desktop
FCP 0.8 s / LCP 0.8 s / CLS 0.006. Raw JSON in `/data/work/launch-reports/after/`.

Audit-driven fixes folded into this task (commits `8f4e280b`, `fca14e40`):
bottom-tab links got `aria-label` (a11y link-name), page content wrapped in `<main>`
(landmark), `public/robots.txt` added (the SPA rewrite was answering `/robots.txt` with HTML
— "robots.txt is not valid: 34 errors"; note root `.gitignore` ignores `*.txt`, the file is
force-added), and the webapp `index.html` gained description + OG/Twitter meta
(SEO 82 → 100 vs baseline). The only remaining best-practices deduction (96) is
`errors-in-console` from `/_vercel/insights/script.js` **404ing on localhost** — the file is
served by the Vercel platform on real deploys; verify Web Analytics is enabled for
`goalchain_webapp` (see pending). Lighthouse 13.5's new `agentic-browsing` checks
(`llms.txt`, `ai-catalog.json`) also flag the app — informational, listed as pending.

OG validation:

- Landing pages `/`, `/about`, `/faq`, `/press`, `/404` all expose `og:type/site_name/url/
  title/description/image` + `twitter:card/title/description/image` from `layout.html`. ✓
- `og:image` = `https://goalworld.fun/assets/img/og-image.jpg`, declared 1200×630. The same
  path on staging returns **200 `image/jpeg`, 140,859 B (<300 KB), real dimensions
  1200×630** (verified by JPEG SOF parsing). The absolute URL on the live host currently
  returns **404** because `goalworld.fun` still serves the old tree — it resolves the moment
  the deploy in (b) below goes live. Same image is reused by the webapp's new OG tags.
- Webapp: previously title-only; now has full OG/Twitter meta pointing at
  `https://play.goalworld.fun/` + the same `og:image`. ✓

### Commits on `launch-web` vs `origin/main` (11)

```
fca14e40 qa(webapp): OG/description meta, valid robots.txt, a11y fixes
8f4e280b webapp(onboarding): clear first-30-seconds landing + reliable SW shell
6ac29b4e perf(webapp): lazy Solana wallet stack — main JS 1.60MB -> 799KB
4b7f844a scripts(deploy_goalworld_site.sh): dry-run robustness
04069d4f vercel(goalchain_webapp): npm ci, immutable /assets/ cache, ignoreCommand
a5575a13 docs: LAUNCH_REPORT — Vercel preview URL (SSO note), staging + rollback evidence
580f59b4 site: launch-quality QA fixes + LAUNCH_REPORT
f44ad59a fix(site): track goalworld_site/src/robots.txt (root .gitignore has *.txt)
9941f004 scripts: deploy_goalworld_site.sh
85e1e1ce vercel(goal-chain): serve the new goalworld_site on docs.goalchain.fun previews
a7cef5a4 site(goalworld_site): single-source-of-truth GoalWorld landing + pages
```

`git diff --stat origin/main...launch-web`: **92 files changed, 3,397 insertions(+),
104 deletions(-)**. No big binaries added; `goalchain_webapp/public/PressKit_GoalChain.zip`
(64 MB) predates this branch (tracked on `main`) — flagged below, untouched here.

### READY-TO-RUN commands (NOT executed)

(a) Merge `launch-web` into `main`:

```bash
cd /data/work/launch-web
gh pr create --repo TheNeuralWars/GoalChain --base main --head launch-web \
  --title "GoalWorld web launch: landing site + webapp launch QA" \
  --body "See docs/LAUNCH_REPORT.md. Preview: goal-chain + goalchain_webapp (SSO)."
gh pr merge launch-web --merge          # merge commit (keeps the 11 commits)
# …or: gh pr merge launch-web --squash  # single commit, cleaner main history
```

(b) Deploy the landing to live `goalworld.fun` (VPS; safe, timestamped backups):

```bash
bash /data/work/launch-web/scripts/deploy_goalworld_site.sh --dry-run   # inspect first
bash /data/work/launch-web/scripts/deploy_goalworld_site.sh             # deploy origin/main
# NOTE: run AFTER (a) is merged — the script deploys --ref origin/main by default.
# Or deploy this branch explicitly: …/deploy_goalworld_site.sh --ref launch-web
```

(c) Rollback:

```bash
# landing (VPS): restore the latest backup the deploy just wrote
bash /data/work/launch-web/scripts/deploy_goalworld_site.sh rollback
bash /data/work/launch-web/scripts/deploy_goalworld_site.sh rollback --backup <tarball>

# Vercel (from a logged-in machine): promote the previous deployment
vercel rollback goal-chain --scope theneuralwars-projects
vercel rollback goalchain_webapp --scope theneuralwars-projects
# or in the dashboard: project → Deployments → previous → Promote to Production

# git: revert the merge commit created in (a)
git revert -m 1 <merge-commit-sha> && git push origin main
```

### Pending items

1. **Vercel login on this VPS** (or `VERCEL_TOKEN` in the environment) to run (4) and (5)
   above — both are one-liners once authenticated.
2. **Web Analytics**: confirm `goalchain_webapp` has Vercel Web Analytics enabled —
   otherwise `/_vercel/insights/script.js` 404s in production too (console error + BP
   deduction).
3. **og:image live URL** resolves only after deploy (b) — currently 404 on `goalworld.fun`.
4. **Unverified marketing claims** pulled from the webapp landing (rarity counts, $GCH
   presale %/hard cap) — restore from git history if Nico confirms the numbers.
5. `goalchain_webapp/public/PressKit_GoalChain.zip` (64 MB) is tracked in git and ships in
   every Vercel build output — consider `git rm --cached` + external hosting (not done
   here: it is linked from the Press Kit page).
6. Lighthouse 13.5 `agentic-browsing` checks: add `llms.txt` / `ai-catalog.json` if we want
   those green (new category, not part of the four classic scores).
7. In-app i18n: some demo strings inside `NFTMarketplace`/`SquadGallery` are hardcoded
   Spanish — cosmetic inconsistency for EN users (left untouched to stay contained).

### Decisions for Nico

- Merge style for (a): merge commit vs squash.
- Restore the presale/rarity marketing block on the play-app landing (needs verified
  numbers) or keep the how-it-works version.
- Enable public preview access / Protection Bypass for the two Vercel projects so QA and
  Lighthouse can run against the real previews (current: team SSO).
- What to do with the 64 MB press-kit zip tracked in git.

---

*Task B executed by Hermes-CEO on 2026-10-06. Nothing outside `goalchain_webapp/`,
`scripts/deploy_goalworld_site.sh` and this report was modified; `main`, live
`goalworld.fun` files, DNS, tunnels, Caddy and Vercel project settings were not touched.*
