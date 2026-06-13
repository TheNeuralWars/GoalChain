# OA Proposal — Issue #734

## Title
[P0] English Localization of Webapp UI — Full i18n Parity for Growth Campaigns

## Source
GitHub issue #734

## Objective
## 🚨 P0 — Blocks Growth Campaign (Campaign/Product Language Mismatch)

**Problem:** Webapp UI is Spanish-only but growth campaigns (ads, landing, social) are in English. Users click English ads → land on Spanish UI → bounce.

**Scope:** Full English localization of user-facing strings in `goalchain_webapp/`

**Files to modify:**
- `goalchain_webapp/src/i18n/locales/en.json` — **create complete English locale** (currently empty/partial)
- `goalchain_webapp/src/i18n/locales/es.json` — audit for completeness
- `goalchain_webapp/src/i18n/translations.ts` — ensure all keys used in components
- Components with hardcoded Spanish strings (grep: `goalchain_webapp/src/**/*.tsx` for Spanish text)

**Acceptance criteria:**
1. `en.json` has 100% parity with `es.json` keys
2. Zero hardcoded Spanish strings in components (all via `t('key')`)
3. Language toggle works (LanguageSwitcher component)
4. `npm run build` passes
5. Manual QA: switch language → all UI updates

**Priority:** P0 — **Blocks paid acquisition campaigns**
**Owner:** opencode (FCC)
**Skill hint:** Apply `frontend-design` skill. Follow `gstack plan-eng-review`.

**Verification:**
```bash
cd goalchain_webapp && npm run build && npm run lint
# Manual: open dev server, toggle language, verify all screens
```

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-734` and close draft PR.
