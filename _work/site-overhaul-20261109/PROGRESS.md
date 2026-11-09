# PROGRESS — GoalWorld site + repo overhaul (Nov 2026)
Goal: an enormous quality jump for goalworld.fun (goalworld_site/), play.goalworld.fun (goalchain_webapp/) and the repo's public-facing docs: one unified vision, design system, real responsive, EN/ES/IT i18n, expanded sections, zero errors. Preview only — production is gated by Hermes CEO + Nico.
Branch: feat/site-overhaul-20261109 (from origin/main 9beaaeee) · Model: Gemini 4 Argon (High)
Done when: every phase 0–6 is `done` in BACKLOG.json with evidence, and the self-review (phase 6) verdict is PASS.

## Now
Phase: 0 (audit — done)
- Completed full Phase 0 (`A-systematic`) audit of `goalworld.fun`, `play.goalworld.fun`, sub-sites, and repo code (`goalworld_site/`, `docs/`, `goalchain_webapp/`).
- Recorded 48 prioritized findings (`A-001`..`A-048`, 7 P0 / 10 P1 / 25 P2 / 6 P3) in `_work/site-overhaul-20261109/AUDIT.md` and `_work/site-overhaul-20261109/BACKLOG.json`.

## Next
- Phase 1 (Honesty, Canon & Legacy Cleanup): start with `A-001` (archive legacy `docs/*.html` pages with 145+ banned claims to `docs/archive/legacy-2026-11/`, update `scripts/pages/stage_public_tree.py` and `goalworld_site/build.mjs` to emit clean redirect stubs) and `A-002` (replace `/go/reader/index.html` and `/reader.html` with clean redirect stubs to `/book.html#sample`).

## Needs Nico (decisions/facts the agent must not invent)
- Full G2-signed Chapter 1 text from `MANUSCRIPT_v7` for `/book.html#sample` (`A-013`, prior prod blocker).
- Confirm Mileo Chen compliance clearance count in `goalworld_site/src/pages/about.html:57` (`411 consecutive cycles` vs `1,724 consecutive audits` in `FRACTURED_CODE_CANON_NOTE.md:24`, `A-012`).
- Review and apply VPS Caddyfile 301 redirects from `_work/site-overhaul-20261109/evidence/audit/proposed_caddy_redirects.Caddyfile` (`A-001`, `A-002`) and media host alias `Clip_08_Kora_Vega_Harmonic_Rings.mp4` (`A-011`) when promoting to prod.

## Known context
- Prior work: PR #917 (web IA finish) merged 2026-11-04 as b4bf1508. Still open from that review: full Chapter 1 sample (Finding 6), 301 redirects for legacy docs/{goalworld,goalchain,arcade,pitch,mega-guide*}.html (still served 200 on prod), Clip_08 432Hz filename alias.
- No i18n on goalworld.fun today (/es/ and /it/ are 404). play.goalworld.fun already has src/i18n.
- Hermes auto-improve PRs land on main nightly ~04:47 Rome; expect to rebase before review.

## Traps
- Draft PR #923 owns PostHog analytics in goalchain_webapp; don't edit those files.

## Log (newest first, append only)
- 2026-11-09 — PHASE 0: DONE — completed `AUDIT_MAP.md` (all routes mapped across `goalworld_site`, `docs/`, `goalchain_webapp`, sub-sites), `evidence/audit/live_crawl.json` (104 URLs), `evidence/audit/playwright_audit.json` + 45 screenshots (`390x844`, `820x1180`, `1440x900`), `evidence/audit/lighthouse/summary.json` (10 Lighthouse runs mobile+desktop), `evidence/audit/repo_static_audit.json`, `evidence/audit/proposed_caddy_redirects.Caddyfile`, `AUDIT.md` (48 findings `A-001`..`A-048`), and populated `BACKLOG.json` (`phases.0 = "done"`).
- 2026-11-09 — scaffolding created by Grok Bot (rules, progress, backlog).
