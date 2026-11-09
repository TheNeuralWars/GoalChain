# PROGRESS — GoalWorld site + repo overhaul (Nov 2026)
Goal: an enormous quality jump for goalworld.fun (goalworld_site/), play.goalworld.fun (goalchain_webapp/) and the repo's public-facing docs: one unified vision, design system, real responsive, EN/ES/IT i18n, expanded sections, zero errors. Preview only — production is gated by Hermes CEO + Nico.
Branch: feat/site-overhaul-20261109 (from origin/main 9beaaeee) · Model: Gemini 4 Argon (High)
Done when: every phase 0–6 is `done` in BACKLOG.json with evidence, and the self-review (phase 6) verdict is PASS.

## Now
Phase: 0 (audit) — not started

## Next
- Phase 0: deep audit → fill BACKLOG.json with prioritized findings.

## Needs Nico (decisions/facts the agent must not invent)
- Full G2-signed Chapter 1 text for /book.html#sample (prior prod blocker).

## Known context
- Prior work: PR #917 (web IA finish) merged 2026-11-04 as b4bf1508. Still open from that review: full Chapter 1 sample (Finding 6), 301 redirects for legacy docs/{goalworld,goalchain,arcade,pitch,mega-guide*}.html (still served 200 on prod), Clip_08 432Hz filename alias.
- No i18n on goalworld.fun today (/es/ and /it/ are 404). play.goalworld.fun already has src/i18n.
- Hermes auto-improve PRs land on main nightly ~04:47 Rome; expect to rebase before review.

## Traps
- Draft PR #923 owns PostHog analytics in goalchain_webapp; don't edit those files.

## Log (newest first, append only)
- 2026-11-09 — scaffolding created by Grok Bot (rules, progress, backlog).
