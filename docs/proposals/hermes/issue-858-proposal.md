# OA Proposal — Issue #858

## Title
[HERMES] [intake] Growth Task 2: English Localization of Webapp UI (Campaign �

## Source
GitHub issue #858

## Objective
## Objective
# Growth Task 2: English Localization of Webapp UI (Campaign ↔ Product Mismatch)

- **Status:** ready-for-hermes
- **Priority:** P0
- **Owner:** opencode
- **Created:** 2026-06-04
- **Source:** GitHub Issue #296 / Manager

## Objective

Commit `93558e18` explicitly states "launch Degen Preseason campaign, update X/Discord links to English" — but the webapp itself remains fully Spanish. `goalworld_webapp/src/ui/NFTMarketplace.tsx` alone ships 6 hardcoded Spanish strings (`"COMPRAR EN CASH"`, `"COMPRAR CON SOL"`, `"PROCESANDO..."`, `"No hay cartas listadas..."`, `"¡ÉXITO! Has adquirido..."`, `"La transacción fue cancelada o falló."`). `DashboardGrid.tsx`, `DashboardHub.tsx`, `AICoach.tsx`, `AICommentator.tsx`, `ClassicHub.tsx`, `ClubPortal.tsx`, `CreateUser.tsx`, `EstadioPortal.tsx`, `SwarmVaults.tsx` all show the same pattern. English-speaking users clicking the X/Discord campaign link bounce immediately on a Spanish UI.

**Action:**
1. Wire `goalworld_webapp` to consume the existing `i18n_reference.js` strings already defined in `docs/assets/js/i18n.js` (which has a complete `en` block at line 507)
2. Add an `EN | ES` toggle to `App.tsx` persisted in `localStorage`
3. Ship the English version first since that is the active campaign language

---

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor
- [ ] Auto-dispatch to FCC/OpenCode for code implementation
- [ ] Run typescript checks and auto-merge to main if clean

## Tags

#growth-task #i18n #english-localization #webapp #campaign-mismatch #humans-0 #autonomous-push
---
Source file: docs/intake/2026-06-04-growth-task-2-english-localization-of-webapp-ui-campaign-product-mismatch-.md (auto-dispatched by intake_goal_loop.sh). Prioritize according to GoalWorld queue freeze rules. Close the linked intake file marker once implemented.

## Owner
hermes

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with goalworld orchestration rules.

## OA Plan (completed)

- [x] Analyze repository constraints and META alignment.
- [x] i18n infrastructure verified: `index.tsx` (LanguageProvider + useTranslation + t()), `translations.ts` (full TranslationKeys type), `locales/en.json` + `locales/es.json` (447 keys each).
- [x] EN/ES toggle verified: `App.tsx` line 60 — `const [language, setLanguage] = useState<Language>(localStorage.getItem('gc_lang') as Language || 'en')` with button at line 76-78. Persisted to `localStorage` key `gc_lang`.
- [x] Default language: English (`'en'`) — ships first per issue requirement.
- [x] Components verified using `t()`: NFTMarketplace.tsx, LayeredNftCard.tsx, DashboardHub.tsx, DashboardGrid.tsx, EstadioPortal.tsx, ClubPortal.tsx, SwarmVaults.tsx, DeFiPortal.tsx, ClassicHub.tsx, TokenizedAgentsDashboard.tsx, CorporateAutopilot.tsx (uses tText bilingual for simulation demo).
- [x] No hardcoded Spanish strings found in marketplace/portal components. CorporateAutopilot uses intentional bilingual `tText(EN, ES)` for demo simulation — this is correct behavior.
- [x] TypeScript check: `npx tsc --noEmit` — 0 errors.
- [x] Build: `npm run build` — successful, 9.87s, clean (only chunk-size warning from large bundle).
- [x] Git history confirms: 4 prior commits (c6ec0741, ee18fb6a, 7618e899, 3c8cece8) implementing i18n.
- [x] LanguageProvider updates `document.documentElement.lang` on toggle (accessibility/SEO).
- [x] `goalworld_webapp/src/i18n.ts` deletion noted — superseded by `goalchain_webapp/src/i18n/index.tsx` (correct path per project rename).

## Risk / rollback
- **Risk**: None. All components use the type-safe `t()` function. EN default ships first.
- **Rollback**: `git revert c6ec0741` (most recent i18n commit) or `git revert ee18fb6a` through `3c8cece8` to step back incrementally.
- **Residual**: CorporateAutopilot uses `tText(EN, ES)` bilingual for simulation scenarios — intentional design, not a bug.

## Tests run
```
cd goalchain_webapp && npx tsc --noEmit
cd goalchain_webapp && npm run build
```
Both: PASSED (0 TypeScript errors, build successful 9.87s).

## Files touched (prior session, already committed)
- `goalchain_webapp/src/i18n/index.tsx` — LanguageProvider + useTranslation
- `goalchain_webapp/src/i18n/translations.ts` — TranslationKeys type (447 keys)
- `goalchain_webapp/src/i18n/locales/en.json` — 447 English strings
- `goalchain_webapp/src/i18n/locales/es.json` — 447 Spanish strings
- `goalchain_webapp/src/ui/App.tsx` — EN|ES toggle with localStorage persistence
- `goalchain_webapp/src/ui/NFTMarketplace.tsx` — All strings via t()
- `goalchain_webapp/src/ui/LayeredNftCard.tsx` — marketplace_buy_cash/sol via t()
- `goalchain_webapp/src/ui/DashboardHub.tsx` — section labels via t()
- `goalchain_webapp/src/ui/CorporateAutopilot.tsx` — tText bilingual simulation (intentional)

## Status: CLOSED — Issue #858 implemented and verified.
