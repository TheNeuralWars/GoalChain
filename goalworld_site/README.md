# GoalWorld site — single source of truth (`goalworld.fun`)

The official editorial & studio site for **GoalWorld — Canon. Code. Cinema.** (`https://goalworld.fun`).
Zero runtime framework dependencies, shared design tokens (`design/tokens.json`), reusable HTML component macros (`COMPONENTS.md`), and full trilingual output (`EN`, `ES`, `IT`).

```
goalworld_site/
├── build.mjs                  # assembles src/ -> dist/ across en/es/it (+ sitemap, feeds, press zip)
├── COMPONENTS.md              # documentation for <gw-*> build-time component macros
├── src/
│   ├── layout.html            # shared <head>, hreflang, JSON-LD, header & footer partials
│   ├── partials/              # header.html, footer.html, devnet-banner.html
│   ├── i18n/                  # en.json, es.json, it.json (780 keys per locale, 100% parity)
│   ├── pages/*.html           # 13 pages, each starting with a meta JSON comment
│   ├── data/live-feed.json    # structured feed backing /live.html, /feed.xml, and /feed.json
│   ├── assets/css/tokens.css  # generated from design/tokens.json (do not hand-edit)
│   ├── assets/css/site.css    # editorial design system (#0a0b0e obsidian + #e5a93c warm amber)
│   ├── assets/js/site.js      # nav drawer, locale switcher (gw_lang), live-feed filter, reader settings
│   ├── assets/fonts/          # self-hosted Newsreader, Outfit & JetBrains Mono variable woff2
│   ├── assets/img/            # web-optimized art (every image < 300 KB)
│   ├── .well-known/           # security.txt, ai-plugin.json, mcp.json
│   ├── llms.txt               # structured briefing for AI/LLM agents
│   ├── robots.txt             # crawler rules + AI content-signals block
│   └── site.webmanifest
├── tools/
│   ├── make_assets.py         # regenerates src/assets/img from repo masters
│   ├── check_links.py         # static link + asset + canonical + hreflang checker
│   ├── build_vercel_output.mjs# assembles docs/.site_out for the Vercel project
│   └── make_press_zip.py      # bundles press downloads
└── dist/                      # build output (gitignored — never commit)
```

## Build & Verify

```bash
node scripts/build-tokens.mjs
node goalworld_site/build.mjs
python3 goalworld_site/tools/check_links.py
```

Output: `dist/` with localized trees at `/` (`en`), `/es/`, and `/it/` (`84` HTML routes total — both `<page>.html` and extensionless `<page>/index.html` per locale so `/about`, `/es/about`, and `/it/about` work on plain file servers like Caddy), plus `sitemap.xml` (with `xhtml:link` `hreflang` alternates), `feed.xml` (RSS 2.0), `feed.json` (JSON Feed 1.1), `robots.txt`, `llms.txt`, `.well-known/*`, `site.webmanifest`, `assets/`, and `assets/img/press/press-kit.zip`.

Every page also ships localized JSON-LD structured data (schema.org): `WebPage` + `BreadcrumbList` on all pages, `Organization` + `WebSite` on `/`, `Book` on `/book.html`, `VideoObject` on `/cinema.html`, `SoftwareApplication` on `/studio.html`, and `FAQPage` on `/faq.html` generated from the visible Q&A text (build-time validation keeps the schema in lockstep with the page — the build fails before shipping if they would drift).

## Pages

| Page | URL | What |
|---|---|---|
| index | `/` | landing: hero + Read/Play CTAs, bento pillars, featured canon, cinema, code, live feed, roadmap, community |
| book | `/book.html` | Fractured Code (Book 1): blurb, cover, free Chapter 1 preview, saga ladder |
| cinema | `/cinema.html` | AI cinema: official trailer + film-draft clips, 6-step pipeline, festival holdback notice |
| studio | `/studio.html` | From manuscript to living world: case study, Living Canon engine, slate, author waitlist |
| live | `/live.html` | live studio board: runtime feed of shipped, submitted and WIP projects |
| collect | `/collect.html` | collectors & creators: provenance first, no token sale / no yield |
| about | `/about.html` | The Neural Wars lore: Neo-Citania, the Link, cast, the saga |
| roadmap | `/roadmap.html` | now / next / later (real items only, no dates) |
| faq | `/faq.html` | honest answers incl. "this is a Devnet demo" |
| press | `/press.html` | boilerplate + downloadable logos/art + press contact |
| privacy, terms | `/privacy.html`, `/terms.html` | plain-language legal (TODO: lawyer review, see TODO.md) |
| 404 | `/404.html` | on-brand not-found with search |

### Reader sample (`/book.html#sample` & `play.goalworld.fun/reader`)
- The free preview on `/book.html#sample` (and `play.goalworld.fun/reader`) ships the canonical opening excerpt of **Chapter 1: *Threshold*** from `MANUSCRIPT_v7` across `EN`, `ES`, and `IT`, complete with interactive typography size (`S`/`M`/`L`), reading theme (`Dark`/`Sepia`), and reading-progress controls.
- Full Chapter 1 expansion remains gated on **Gate 2 (G2)** editorial sign-off (`TODO(nico)`). Do not alter canonical prose or exceed ~6% of the 74k-word manuscript if retailer exclusivity is later chosen.

Internal links between `goalworld_site` pages (`/book.html`, `/book.html#sample`,
`/cinema.html`, `/studio.html`, `/collect.html`, `/live.html`, `/about.html`,
`/roadmap.html`, `/faq.html`, `/press.html`) are site-relative so preview deployments
resolve locally without leaking clicks to production. Standalone sub-apps hosted on the
VPS (`/blast-radius/`, `/hermes-demo/`) and external video streams
(`https://goalworld.fun/assets/img/neuralwars/...`) use explicit URLs.

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
