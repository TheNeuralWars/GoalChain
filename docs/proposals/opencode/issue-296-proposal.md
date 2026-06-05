# Issue #296: English Localization of Webapp UI (Campaign ↔ Product Mismatch)

## Objective
Wire `goalchain_webapp` to consume existing `i18n_reference.js` strings from `docs/assets/js/i18n.js`, add an `EN | ES` toggle to `App.tsx` persisted in `localStorage`, and ship English as default language.

## Current State
- `docs/assets/js/i18n.js` has complete `en` (line 364) and `es` (line 3) translation blocks
- `goalchain_webapp/src/i18n/` has partial infrastructure: `index.ts` (LanguageProvider), `translations.ts` (incomplete type definitions), empty `locales/` folder
- All UI components (`NFTMarketplace.tsx`, `DashboardGrid.tsx`, `DashboardHub.tsx`, `AICoach.tsx`, `AICommentator.tsx`, `ClassicHub.tsx`, `ClubPortal.tsx`, `CreateUser.tsx`, `EstadioPortal.tsx`, `SwarmVaults.tsx`, `PlayNav.tsx`) have hardcoded Spanish strings
- App.tsx does not use LanguageProvider

## Proposed Implementation

### 1. Create Locale JSON Files
Create `/data/apps/GoalChain/goalchain_webapp/src/i18n/locales/en.json` and `es.json` from `docs/assets/js/i18n.js` TRANSLATIONS object.

### 2. Update i18n Infrastructure
- **translations.ts**: Complete the TranslationKeys type with all keys from i18n.js
- **index.ts**: Load translations from JSON files, keep existing LanguageProvider API

### 3. Add Language Toggle
- Add `LanguageToggle` component in `src/components/LanguageToggle.tsx`
- Integrate into `PlayNav.tsx` (top-right of nav) or `App.tsx` header
- Persist selection in `localStorage` (key: `gc_lang`)

### 4. Wrap App with LanguageProvider
- Update `App.tsx` to import and use `LanguageProvider` with loaded translations
- Set default language to `'en'` (English first for campaign)

### 5. Migrate All UI Components
Replace hardcoded strings with `useTranslation()` hook calls. Priority components:
- `NFTMarketplace.tsx` (6+ strings identified in issue)
- `DashboardGrid.tsx`, `DashboardHub.tsx`
- `AICoach.tsx`, `AICommentator.tsx`
- `ClubPortal.tsx`, `CreateUser.tsx`
- `EstadioPortal.tsx`, `SwarmVaults.tsx`
- `PlayNav.tsx`, `ClassicHub.tsx`
- `PlayLayout.tsx`, `DeFiPortal.tsx`, `FixturesPanel.tsx`, `LiveEventFeed.tsx`, `OpsStatusPanel.tsx`, `SquadGallery.tsx`, `TradingTerminal.tsx`, `UserProfile.tsx`

## File List (Proposed Changes)

### New Files
- `goalchain_webapp/src/i18n/locales/en.json`
- `goalchain_webapp/src/i18n/locales/es.json`
- `goalchain_webapp/src/components/LanguageToggle.tsx`

### Modified Files
- `goalchain_webapp/src/i18n/translations.ts` (complete type definitions)
- `goalchain_webapp/src/i18n/index.ts` (load from JSON)
- `goalchain_webapp/src/ui/App.tsx` (wrap with LanguageProvider)
- `goalchain_webapp/src/ui/PlayNav.tsx` (add LanguageToggle)
- All UI components listed above (use useTranslation hook)

## Risks & Regressions
1. **Missing translation keys**: Some UI strings may not have corresponding keys in i18n.js — need to add them
2. **HTML content**: Some strings contain HTML (e.g., `hero_title` with `<span>`) — need `tHtml` for these
3. **Dynamic content**: Strings with interpolated variables (e.g., `¡ÉXITO! Has adquirido a ${player.name}`) — need template approach
4. **TypeScript errors**: Incomplete `TranslationKeys` type will cause compile errors if not fully updated
5. **Build breaking**: `npm run build` must pass after changes

## Rollback Plan
- Revert all modified files via git
- Delete new locale files and LanguageToggle component
- App.tsx reverts to no LanguageProvider

## Test Commands
```bash
# TypeScript check (must pass)
cd goalchain_webapp && npx tsc --noEmit

# Build (must pass)
cd goalchain_webapp && npm run build

# Lint
cd goalchain_webapp && npm run lint  # if exists, else tsc --noEmit

# Manual verification
# 1. Start dev server: cd goalchain_webapp && npm run dev
# 2. Verify EN is default language
# 3. Toggle to ES, verify Spanish strings appear
# 4. Refresh page, verify language persists
# 5. Navigate all routes, verify no hardcoded Spanish remains
```

## Implementation Order
1. Create locale JSON files (foundation)
2. Update i18n infrastructure (translations.ts, index.ts)
3. Add LanguageToggle component
4. Wrap App.tsx with LanguageProvider
5. Migrate PlayNav.tsx (add toggle to nav)
6. Migrate remaining UI components (can be done in batches)
7. Run typecheck and build
8. Verify manually

## Notes
- Follow frontend-design skill: distinctive, production-grade UI; match existing glass/Solana patterns
- English ships first (default `initialLanguage: 'en'`)
- The `i18n.js` reference has ~360 keys per language — comprehensive coverage
- Some components (e.g., `AICommentator.tsx` voice selection) may need special handling for language-specific voice filtering

---

**Status**: Ready for implementation
**Branch**: Working on `main` per `cambio urgente` directive
**Owner**: opencode