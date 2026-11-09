# PROGRESS — GoalWorld site + repo overhaul (Nov 2026)
Goal: an enormous quality jump for goalworld.fun (goalworld_site/), play.goalworld.fun (goalchain_webapp/) and the repo's public-facing docs: one unified vision, design system, real responsive, EN/ES/IT i18n, expanded sections, zero errors. Preview only — production is gated by Hermes CEO + Nico.
Branch: feat/site-overhaul-20261109 (from origin/main 9beaaeee) · Model: Gemini 4 Argon (High)
Done when: every phase 0–6 is `done` in BACKLOG.json with evidence, and the self-review (phase 6) verdict is PASS.

## Now
Phase: 2 — Real responsive quality on phone, tablet, and desktop (`360x740`, `390x844`, `820x1180`, `1024x1366`, `1440x900`, `1920x1080` + landscape phone) for `goalworld_site` and `goalchain_webapp`.
Slice 3 (`A-051`): Fix all `goalchain_webapp` responsive & one-handed mobile UX findings across all 17 routes (mobile nav drawer & keyboard Escape handling in `PlayLayout.tsx`/`PlayNav.tsx`, one-handed phone ergonomics for dashboard/match/wallet UI, responsive card/scroll containers for tables and wide toolbars, explicit `width`/`height` on all `<img>` tags, ≥44px touch targets on touch viewports, ≥14px mobile font sizes, and zero horizontal overflow or offscreen elements).

## Next
- Slice 4: Run full `node tests/visual/responsive-suite.mjs` across all 30 routes × 6 viewports (180 checks) + landscape phone checks, save all screenshots to `_work/site-overhaul-20261109/evidence/phase2/`, verify all builds green, and mark `phases.2 = "done"`.
- Phase 3 / Phase 4: Content & Feature Depth + EN/ES/IT Internationalization parity (`A-028`–`A-042`).

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
- 2026-11-09 — Phase 2 Slices 1 & 2 complete (`A-049`, `A-050`): created `tests/visual/responsive-suite.mjs` (Playwright + system Chrome across `360x740`, `390x844`, `820x1180`, `1024x1366`, `1440x900`, `1920x1080`) and resolved all 52 baseline `goalworld_site` responsive failures across `site.css` and `site.js` (fixed `404.html` 360px overflow, enforced ≥44px touch targets on nav/footer/brand/chip/reader/TOC controls, bumped mobile interactive text to ≥14px, added container queries, safe-area insets, landscape phone rules, 1920px max-width scaling, and sticky CTA auto-hide on `#sample` + `.site-footer` intersection; 78/78 `goalworld_site` route-viewport checks passing).
- 2026-11-09 — PHASE 1: DONE — completed Slices 4 & 5: archived 21 legacy HTML pages (`docs/*.html`, `docs/go/reader/index.html`, `goalchain_webapp/public/classic-dashboard.html`) into `docs/archive/legacy-html-20261109/` and replaced them with zero-claim redirect stubs (`A-001`, `A-002`, `A-008`); archived legacy `booksData.ts` and `players.json` / `nft_gallery_manifest.json` and sanitized active copies (`A-005`, `A-007`, `A-043`, reducing `KindleReader` chunk from 367 KB to 28 KB); scrubbed banned claims across `GoalWorldPortal.tsx`, `TheNeuralWarsUniverse.tsx`, `KindleReader.tsx`, `StakingBurnDashboard.tsx`, `LayeredNftCard.tsx`, `UserProfile.tsx`, `locales/{en,es}.json`, and `.well-known` / `llms.txt` (`A-004`, `A-006`, `A-009`); added `goalchain_webapp/scripts/check-banned-claims.mjs` (`A-014`); and verified 57 page-viewport checks + 48 screenshots in `evidence/phase1/` with 0 console errors, 0 horizontal overflows, 0 heading skips, and 0 token drift (`phases.1 = "done"`).
- 2026-11-09 — Phase 1 Slice 3 complete: applied unified GoalWorld design system & shell to `goalchain_webapp` (`PlayLayout.tsx`, `PlayNav.tsx`, `playNav.ts`, `App.tsx`, `LandingPage.tsx`, `DashboardGrid.tsx`, `AICoach.tsx`, `index.html`, `manifest.json`, `index.css`, `package.json`); resolved `A-003`, `A-018`, `A-022`, `A-023`, `A-026`, `A-027`, `A-047` (`npm run build && npm run check:i18n` green).
- 2026-11-09 — Phase 1 Slices 1 & 2 complete: wrote `VISION.md`; created `design/tokens.json` + `design/sync-tokens.mjs` (WCAG AA contrast verification + drift check) and synced tokens across `goalworld_site/src/assets/css/site.css` and `goalchain_webapp/src/styles/tokens.css` (`A-015`); archived 1,880 LOC of dead CSS in `docs/archive/webapp-unused-styles-20261109/` (`A-016`); created static site partials (`_header.html`, `_sticky_cta.html`, `_footer.html`), component macro engine in `goalworld_site/build.mjs`, and `goalworld_site/COMPONENTS.md`; rebuilt all 13 `goalworld_site` pages with components and fixed `A-010`, `A-011`, `A-012`, `A-013`, `A-017`, `A-019`, `A-020`, `A-021`, `A-024`, `A-025`, `A-046` (`build.mjs` + `check_links.py` green, 0 heading skips).
- 2026-11-09 — PHASE 0: DONE — completed `AUDIT_MAP.md` (all routes mapped across `goalworld_site`, `docs/`, `goalchain_webapp`, sub-sites), `evidence/audit/live_crawl.json` (104 URLs), `evidence/audit/playwright_audit.json` + 45 screenshots (`390x844`, `820x1180`, `1440x900`), `evidence/audit/lighthouse/summary.json` (10 Lighthouse runs mobile+desktop), `evidence/audit/repo_static_audit.json`, `evidence/audit/proposed_caddy_redirects.Caddyfile`, `AUDIT.md` (48 findings `A-001`..`A-048`), and populated `BACKLOG.json` (`phases.0 = "done"`).
- 2026-11-09 — scaffolding created by Grok Bot (rules, progress, backlog).
