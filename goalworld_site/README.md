# GoalWorld site — single source of truth

The one landing for **GoalWorld · World of Achievements** (`https://goalworld.fun`).
Static HTML, zero runtime dependencies, one tiny Node build script.

```
goalworld_site/
├── build.mjs                  # assembles src/ -> dist/ (+ sitemap, press zip)
├── src/
│   ├── layout.html            # shared <head>, header, footer (placeholders)
│   ├── pages/*.html           # one file per page, starts with a meta JSON comment
│   ├── assets/css/site.css    # design system (Solana neons, Outfit)
│   ├── assets/js/site.js      # nav toggle only (nothing else needs JS)
│   ├── assets/fonts/          # self-hosted Outfit (variable, ~46 KB total)
│   ├── assets/img/            # web-optimized art (every image < 300 KB)
│   ├── robots.txt             # keeps the existing AI content-signals block
│   └── site.webmanifest
├── tools/
│   ├── make_assets.py         # regenerates src/assets/img from repo masters
│   ├── check_links.py         # static link checker (+ external URLs)
│   ├── build_vercel_output.mjs# assembles docs/.site_out for the Vercel project
│   └── make_press_zip.py      # bundles press downloads
└── dist/                      # build output (gitignored — never commit)
```

## Build

```bash
node goalworld_site/build.mjs
```

Output: `dist/` with `index.html`, `<page>.html`, an extensionless mirror
`<page>/index.html` per page (so `/about` works on plain file servers like Caddy),
`sitemap.xml`, `robots.txt`, `site.webmanifest`, `assets/`, and
`assets/img/press/press-kit.zip`.

Every page also ships JSON-LD structured data (schema.org): a `WebPage` node on all
pages, `Organization` + `WebSite` on the home page, and `FAQPage` on `/faq` generated
from the visible Q&A text (build-time validation keeps the schema in lockstep with the
page — the build fails before shipping if they would drift).

## Pages

| Page | URL | What |
|---|---|---|
| index | `/` | landing: hero + Play CTA, lore, how to play, teasers, roadmap, community |
| about | `/about.html` | The Neural Wars lore: Neo-Citania, the Link, cast, the saga |
| roadmap | `/roadmap.html` | now / next / later (real items only, no dates) |
| faq | `/faq.html` | honest answers incl. "this is a Devnet demo" |
| press | `/press.html` | boilerplate + downloadable logos/art |
| privacy, terms | `/privacy.html`, `/terms.html` | plain-language legal (TODO: lawyer review, see TODO.md) |
| 404 | `/404.html` | on-brand not-found (wire it via Caddy `handle_errors`, see the launch report) |

Internal links to legacy surfaces (`goalworld.html`, `cinema.html`, `/go/reader`, …)
are absolute `https://goalworld.fun/...` URLs — those pages live in the deployed
tree (`docs/` staged to `_site_public`) and are intentionally NOT rebuilt here.

## Content rules

Public copy: English, short, energetic, no corporate tone. **Never invent data**
(no fake metrics, partners, dates, prices, token claims). Anything missing goes to
`goalworld_site/TODO.md` or an HTML comment — never on the page.

## Media policy (read before adding images)

- Images in git must be optimized web versions: webp/jpg **< 300 KB each**;
  the OG image is exactly 1200x630 (< 300 KB). Masters live in `docs/assets/img/`.
  `tools/make_assets.py` regenerates everything from the masters.
- **Videos never go into git.** Teasers link to already-hosted files on
  `https://goalworld.fun/assets/img/neuralwars/...` with local webp posters and
  `preload="none"` (click-to-play). If a teaser ever needs a new encode, put an
  optimized web version (< 8 MB, H.264 mp4 + poster) on the VPS served path and
  document it here.

## Deploy (VPS)

```bash
# build + backup + rsync into the served tree (default target: /data/apps/GoalChain/_site_public)
./scripts/deploy_goalworld_site.sh --dry-run                 # preview only
./scripts/deploy_goalworld_site.sh --ref origin/main         # real deploy

# stage somewhere else (QA)
./scripts/deploy_goalworld_site.sh --ref launch-web --target /data/work/launch-staging/goalworld

# undo the last deploy
./scripts/deploy_goalworld_site.sh rollback --target <target>
./scripts/deploy_goalworld_site.sh rollback --target <target> --backup /data/work/goalworld-site-backups/<name>/<stamp>.tar.gz
```

What the script guarantees:

- checks the ref out in a **dedicated deploy worktree** (`/data/work/gw-site-deploy`),
  never in the live checkouts (`/home/ubuntu/GoalChain`, `/data/apps/GoalChain`);
- **merges** into the target (rsync without `--delete`) — files the rest of the
  pipeline depends on (`data/`, `publishing/`, `go/`, `play/`, film media, …) stay put;
- makes a **timestamped backup tarball** before writing anything
  (`/data/work/goalworld-site-backups/<target-name>/`), covering every path the
  deploy overwrites (use `--full-backup` for a full-tree tarball);
- `rollback` restores that tarball over the target;
- never replaces the target directory itself (it is a docker bind mount);
- re-ships the **press-kit zip** (`PressKit_GoalChain.zip`, 64 MB, gitignored — kept on
  disk only) into `press/` and `assets/` on every deploy, and writes the **landing
  manifest** (`/data/work/goalworld-landing.paths`, override with
  `GOALWORLD_LANDING_MANIFEST`) listing every path the landing owns in the target;
- holds `git-dir/deploy-origin.lock` (the same lock `scripts/pages/deploy_origin.sh`
  takes for its whole run) so the 5-min origin restage cannot race the deploy.

### Why the landing manifest exists (origin restage interplay)

The 5-min `goalworld-origin-deploy.timer` restages `docs/` into the served tree with
`rsync --delete` (that pipeline publishes `data/`, `assets/data/`, film media, the
burn-tracker, …). The landing is **not** part of `docs/`, so a restage would delete it
again and revert `/index.html` to `docs/index.html`. Since this deploy, every restage
preserves exactly the manifest paths verbatim (landing files win over same-path `docs/`
files): `scripts/pages/stage_public_tree.py` copies them from the served tree into the
new staged tree before the rsync. No manifest → staging behaves as before.

The press kit is also staged from `docs/assets/PressKit_GoalChain.zip` when that file
exists on disk (it is gitignored), so the legacy
`https://goalworld.fun/assets/PressKit_GoalChain.zip` download self-heals through the
staging pipeline too.

The target tree is served by `twenty-caddy` at `goalworld.fun` (mount
`/data/apps/GoalChain/_site_public` → `/srv/goalworld`). A proposed Caddyfile diff
(404 handling, cache headers) is in `docs/LAUNCH_REPORT.md` — not applied.

## Vercel (docs.goalchain.fun previews)

`docs/vercel.json` builds **this same source** for the `goal-chain` project
(Vercel root directory is `docs/`), assembling `docs/.site_out/` from
`goalworld_site/dist` plus the machine-readable `docs/` data surface
(`data/`, `assets/data/`, root `*.json`) so pipeline URLs keep working.
Production host `docs.goalchain.fun` 301s to `https://goalworld.fun/:path*`;
preview `*.vercel.app` hosts serve the site and never redirect.
`ignoreCommand` limits builds to changes under `goalworld_site/` or `docs/vercel.json`.
The pathspecs are `:(top)`-anchored on purpose: Vercel runs the Ignored Build Step from
the project Root Directory (`docs/`), where unanchored pathspecs resolve to
`docs/goalworld_site` and silently match nothing (every build was skipped until this
was fixed on 2026-10-06 — same anchoring trick as `goalchain_webapp/scripts/vercel-ignore.sh`).
