# Issue #858 Proposal: English Localization of Webapp UI

## Status
- **Issue:** ready-for-hermes | Owner: hermes | P1
- **Author:** Nico (Manager) | Created: 2026-06-04
- **Source:** GitHub Issue #296 / Commit `93558e18`
- **Mode:** DIRECT MAIN (cambio urgente) — no feature branches

---

## Problem Statement

Commit `93558e18` launches the Degen Preseason campaign in English, but the webapp (`goalchain_webapp/`) remains fully Spanish. English-speaking users clicking X/Discord campaign links bounce immediately.

The webapp has **two competing i18n systems**:
1. **Custom `useTranslation`** (from `../i18n/index.tsx`) — uses `locales/en.json` / `locales/es.json` — WORKING
2. **`react-i18next`** (from `../i18n/index.ts`) — initialized but NOT wired to locale files — BROKEN

Components importing `react-i18next` get empty translation strings in both languages.

---

## Root Cause Analysis

| File | Issue |
|------|-------|
| `LayeredNftCard.tsx` | Hardcoded Spanish: "Sin rasgos especiales" (line 415), narrative fallback (line 456) |
| `DashboardHub.tsx` | Uses `react-i18next` → no `dashboard_hub.*` keys in react-i18next resources → empty strings |
| `DashboardGrid.tsx` | Uses `react-i18next` → broken (but keys happen to overlap with custom hook keys — partial fix) |
| `CorporateAutopilot.tsx` | Mixed-language log messages (EN + ES) |
| `translations.ts` | Missing keys: `dashboard_hub.*`, `card_no_traits`, `card_narrative_fallback` |
| `locales/en.json` | Missing: all `dashboard_hub.*` section keys |
| `locales/es.json` | Missing: all `dashboard_hub.*` section keys |

---

## Required Tasks

### Phase 1 — Sync translation files (no code change)
1. Add missing keys to `translations.ts`
2. Add missing keys to `locales/en.json`
3. Add missing keys to `locales/es.json`

### Phase 2 — Fix LayeredNftCard hardcoded strings
4. Replace "Sin rasgos especiales" → `t('card_no_traits')`
5. Replace narrative fallback → `t('card_narrative_fallback')`

### Phase 3 — Migrate DashboardHub to custom hook
6. Change import from `react-i18next` → `../i18n/index`
7. Add `dashboard_hub.*` keys for all PLAY_SECTIONS (dashboard, hub, ops, fixtures, trading, squad, vaults, commentator, feed)

### Phase 4 — Verify build
8. `cd goalchain_webapp && npm run build`

---

## File List

| File | Change |
|------|--------|
| `goalchain_webapp/src/i18n/translations.ts` | Add 11 new keys |
| `goalchain_webapp/src/i18n/locales/en.json` | Add EN translations for new keys |
| `goalchain_webapp/src/i18n/locales/es.json` | Add ES translations for new keys |
| `goalchain_webapp/src/ui/LayeredNftCard.tsx` | Replace 2 hardcoded Spanish strings |
| `goalchain_webapp/src/ui/DashboardHub.tsx` | Migrate from react-i18next to custom hook |
| `goalchain_webapp/src/config/playNav.ts` | No change (already has i18n keys) |

---

## Risks & Regressions

| Risk | Severity | Mitigation |
|------|----------|------------|
| Build failure from bad JSON | Medium | Validate JSON syntax before commit |
| react-i18next unused but kept in main.tsx | Low | Does not affect runtime (custom hook takes priority) |
| CorporateAutopilot mixed-language logs | Low | Log messages; no UI impact. Deferred for follow-up issue. |
| App.tsx uses different localStorage key ('language') than custom hook ('gc_lang') | Medium | Already exists pre-issue; separate follow-up |

### Rollback
```bash
git checkout HEAD~1 -- goalchain_webapp/src/i18n/ goalchain_webapp/src/ui/LayeredNftCard.tsx goalchain_webapp/src/ui/DashboardHub.tsx
```

---

## Test Commands

```bash
# 1. Validate JSON files
node -e "JSON.parse(require('fs').readFileSync('goalchain_webapp/src/i18n/locales/en.json')); console.log('en.json: OK')"
node -e "JSON.parse(require('fs').readFileSync('goalchain_webapp/src/i18n/locales/es.json')); console.log('es.json: OK')"

# 2. TypeScript / build
cd goalchain_webapp && npm run build

# 3. Verify no hardcoded Spanish in LayeredNftCard
grep -n "Sin rasgos\|Fichado en el draft" goalchain_webapp/src/ui/LayeredNftCard.tsx
# Expected: no output
```

---

## Success Criteria

- [ ] `npm run build` exits with code 0
- [ ] `LayeredNftCard.tsx` has no hardcoded Spanish strings
- [ ] `DashboardHub.tsx` uses `../i18n/index` hook
- [ ] All `dashboard_hub.*` keys present in both locale JSON files
- [ ] EN locale is default (no `gc_lang` in localStorage → English)