# PROGRESS — GoalWorld site + repo overhaul (Nov 2026)
Goal: an enormous quality jump for goalworld.fun (goalworld_site/), play.goalworld.fun (goalchain_webapp/) and the repo's public-facing docs: one unified vision, design system, real responsive, EN/ES/IT i18n, expanded sections, zero errors. Preview only — production is gated by Hermes CEO + Nico.
Branch: feat/site-overhaul-20261109 (from origin/main 9beaaeee) · Model: Gemini 4 Argon (High)
Done when: every phase 0–6 is `done` in BACKLOG.json with evidence, and the self-review (phase 6) verdict is PASS.

## Now
Phase: 1 (Unified Vision, Design System & Honesty/Canon Alignment — in progress)
- Slice 4 (active): Complete Phase 1 honesty, canon & legacy cleanup items (`A-001`, `A-002`, `A-004`–`A-009`, `A-014`) across `docs/` and `goalchain_webapp/`.
- Slice 5: Capture Playwright before/after screenshots (`evidence/phase1/`) and verify all builds, link checks, and drift checks green.

## Next
- Complete Slice 4 (archive legacy `docs/*.html` + `classic-dashboard.html`, replace with clean zero-claim redirect stubs, scrub banned claims across `goalchain_webapp` portals/locales/JSONs, add `check-banned-claims.mjs`), then Slice 5 (Playwright screenshots in `evidence/phase1/`).

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
- 2026-11-09 — Phase 1 Slice 3 complete: applied unified GoalWorld design system & shell to `goalchain_webapp` (`PlayLayout.tsx`, `PlayNav.tsx`, `playNav.ts`, `App.tsx`, `LandingPage.tsx`, `DashboardGrid.tsx`, `AICoach.tsx`, `index.html`, `manifest.json`, `index.css`, `package.json`); resolved `A-003`, `A-018`, `A-022`, `A-023`, `A-026`, `A-027`, `A-047` (`npm run build && npm run check:i18n` green).
- 2026-11-09 — Phase 1 Slices 1 & 2 complete: wrote `VISION.md`; created `design/tokens.json` + `design/sync-tokens.mjs` (WCAG AA contrast verification + drift check) and synced tokens across `goalworld_site/src/assets/css/site.css` and `goalchain_webapp/src/styles/tokens.css` (`A-015`); archived 1,880 LOC of dead CSS in `docs/archive/webapp-unused-styles-20261109/` (`A-016`); created static site partials (`_header.html`, `_sticky_cta.html`, `_footer.html`), component macro engine in `goalworld_site/build.mjs`, and `goalworld_site/COMPONENTS.md`; rebuilt all 13 `goalworld_site` pages with components and fixed `A-010`, `A-011`, `A-012`, `A-013`, `A-017`, `A-019`, `A-020`, `A-021`, `A-024`, `A-025`, `A-046` (`build.mjs` + `check_links.py` green, 0 heading skips).
- 2026-11-09 — PHASE 0: DONE — completed `AUDIT_MAP.md` (all routes mapped across `goalworld_site`, `docs/`, `goalchain_webapp`, sub-sites), `evidence/audit/live_crawl.json` (104 URLs), `evidence/audit/playwright_audit.json` + 45 screenshots (`390x844`, `820x1180`, `1440x900`), `evidence/audit/lighthouse/summary.json` (10 Lighthouse runs mobile+desktop), `evidence/audit/repo_static_audit.json`, `evidence/audit/proposed_caddy_redirects.Caddyfile`, `AUDIT.md` (48 findings `A-001`..`A-048`), and populated `BACKLOG.json` (`phases.0 = "done"`).
- 2026-11-09 — scaffolding created by Grok Bot (rules, progress, backlog).
