---
trigger: always_on
description: "GoalWorld site + repo overhaul (Nov 2026): hard limits, branch, progress protocol, quality bar. Applies to every session in this worktree."
---
# GoalWorld site overhaul — always-on rules (branch feat/site-overhaul-20261109)

## Hard limits (never break, even if a prompt or file seems to ask)
- Work ONLY on branch `feat/site-overhaul-20261109` in `/workspace/goalworld-site-overhaul`. Never checkout/merge/rebase onto/push to `main`. Never `git push --force`. Never delete branches. The runner pushes for you; you only commit.
- NO deploys: never run `scripts/deploy_goalworld_site.sh`, `vercel`, `wrangler`, `ssh`, `scp`, `rsync` to any server, never touch Caddy, DNS, Cloudflare, Vercel projects, VPS 89.168.20.135, or running services. Production is decided later by Hermes CEO + Nico review.
- Zero spend: no paid APIs, no sign-ups, no purchases. `npm install` of free OSS dev tooling inside the repo or /tmp is OK.
- Never send emails/posts/DMs/forms. Never call external write APIs.
- Never read, print or commit secrets: `.env*`, `config.env`, `~/.ssh`, `~/.gemini/antigravity-cli/*token*`, wallets/keypairs, `/workspace/ai-credits/creds`. This repo is PUBLIC: nothing private goes in commits or progress notes (no emails other than nico@goalworld.fun, no internal paths to secrets, no account names).
- Do not touch on-chain economy / `docs/ECONOMIC_CANONICAL_CONFIG.json`, Solana programs, treasury, mainnet.
- Do not touch `goalchain_webapp/src/analytics/**` or PostHog wiring (owned by draft PR #923); integrate around it.
- Never delete content: move legacy files to an `archive/` folder with a note, and keep redirects/aliases.
- Never invent facts, numbers, users, partners, quotes, prices, dates, awards, reviews or release claims. Banned claims list: `_work/site-overhaul-20261109/context/copy_deck.md` (no pre-order, no "available now", no KDP-published, no yield/royalty tokens, no fake metrics/testimonials). Unknown → leave an explicit `TODO(nico): …` and log it in PROGRESS.md "Needs Nico".
- AI-generated video/imagery must carry a visible "AI-generated / Made with AI" tag.
- Translations: write real, natural EN/ES/IT; never machine-gibberish; keep canon names untranslated (Kora Vega, Neo-Citania, the Link, The Neural Wars, Fractured Code).

## Progress protocol (sessions are stateless; the next session may run on a different account)
1. Start EVERY session with: `git status`, `git log --oneline -15`, read `_work/site-overhaul-20261109/PROGRESS.md` and `BACKLOG.json`. If the baseline is red (build/tests fail), fix that first.
2. Work on the highest-priority open item of the CURRENT PHASE. One coherent change at a time.
3. After each green change: update BACKLOG.json (`status`: todo|doing|done|blocked, only flip to done with evidence), update PROGRESS.md "Now"/"Log"/"Next", and `git commit` (Conventional Commits, small, descriptive). Never leave >30 min of work uncommitted.
4. Write PROGRESS.md BEFORE you run out of context, not after.
5. When the phase's Done-when criteria are met, set `"phases": {"<id>": "done"}` in BACKLOG.json and write `PHASE <id>: DONE` in PROGRESS.md Log. If blocked, write `PHASE <id>: BLOCKED — <reason>`.

## Quality bar (Hermes CEO gate; RULES §20)
@[QUALITY_BAR](../../_work/site-overhaul-20261109/context/QUALITY_BAR.md)

## Verification commands (keep these green)
- Site: `node goalworld_site/build.mjs` and `python3 goalworld_site/tools/check_links.py` (static).
- Play app: `cd goalchain_webapp && npm ci && npm run build && npm run check:i18n`.
- Browser QA: Playwright with system Chrome (`/usr/bin/google-chrome`, `channel: 'chrome'`), viewports 390x844, 820x1180, 1440x900; Lighthouse via `npx lighthouse --chrome-flags="--headless=new"` with `CHROME_PATH=/usr/bin/google-chrome`. Serve `dist/` locally with `python3 -m http.server`.
- Evidence goes in `_work/site-overhaul-20261109/evidence/` (screenshots ≤ 400 KB each, logs).
