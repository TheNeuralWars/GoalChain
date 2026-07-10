# OA Proposal — Issue #858 (REVISED)
## English Localization of Webapp UI (Campaign ↔ Product Mismatch)

## Source
GitHub issue #858 — Growth Task 2

## Status
IN PROGRESS — FCC implementation

## Root Cause Analysis

The webapp has **TWO i18n systems**:
1. **Custom system** (`src/i18n/index.tsx`): Works correctly, localStorage-persisted, default EN, 447 keys in en.json/es.json. Used by NFTMarketplace, LayeredNftCard, DashboardHub.
2. **react-i18next** (`src/i18n/_i18next-init.ts`): **NOT imported anywhere** — `i18next.init()` never runs. The 8 affected components (`react-i18next`) return raw key strings (no translation visible).

**The real bug**: react-i18next never initialized → English users see raw key strings like `t('dashboard.club')` instead of translations.

## Scope

### Already DONE (prior sessions):
- i18n infrastructure: LanguageProvider, useTranslation hook, 447 EN/ES keys
- NFTMarketplace.tsx — fully localized (t() for all strings)
- LayeredNftCard.tsx — fully localized
- DashboardHub.tsx — uses custom system correctly
- App.tsx — EN|ES toggle button, LanguageProvider wrapping app

### Remaining work:
- **8 components** using react-i18next must switch to `../i18n/index` + flat keys
- **~150 new translation keys** need to be added (AI coach, commentator, classic hub, club portal, create user, estadio portal, dashboard grid)
- Translation strings added to en.json and es.json

## Proposed Changes

### Step 1: translations.ts — add missing keys
Add TranslationKeys entries for all flat key equivalents of `namespace.key` patterns used by the 8 components.

### Step 2: en.json + es.json — add translations
Add ~150 key-value pairs in both languages. EN values match active campaign tone.

### Step 3: Migrate 8 components from react-i18next to ../i18n/index
Pattern: `import { useTranslation } from 'react-i18next'` → `import { useTranslation } from '../i18n/index'`
Key format: `t('dashboard.xxx')` → `t('dashboard_xxx')`

Components to migrate:
1. DashboardGrid.tsx
2. AICoach.tsx
3. AICommentator.tsx
4. ClassicHub.tsx
5. ClubPortal.tsx
6. CreateUser.tsx
7. EstadioPortal.tsx
8. SwarmVaults.tsx

### Step 4: Build verification
```bash
cd goalchain_webapp && npm run build
```

## File List
```
goalchain_webapp/src/i18n/translations.ts    — add ~150 new key types
goalchain_webapp/src/i18n/locales/en.json     — add EN values
goalchain_webapp/src/i18n/locales/es.json     — add ES values
goalchain_webapp/src/ui/DashboardGrid.tsx    — migrate i18n import
goalchain_webapp/src/ui/AICoach.tsx          — migrate i18n import
goalchain_webapp/src/ui/AICommentator.tsx    — migrate i18n import
goalchain_webapp/src/ui/ClassicHub.tsx       — migrate i18n import
goalchain_webapp/src/ui/ClubPortal.tsx       — migrate i18n import
goalchain_webapp/src/ui/CreateUser.tsx       — migrate i18n import
goalchain_webapp/src/ui/EstadioPortal.tsx    — migrate i18n import
goalchain_webapp/src/ui/SwarmVaults.tsx      — migrate i18n import (partially done)
```

## Risk Assessment
- **Low risk**: Adding new translation keys + changing imports; no business logic touched
- **Regression risk**: Components switching i18n source — verify with build
- **Rollback**: `git checkout HEAD -- goalchain_webapp/src/ui/*.tsx goalchain_webapp/src/i18n/`

## Test Commands
```bash
cd /data/apps/GoalChain/goalchain_webapp && npm run build
```

## Branch / Merge Strategy
Working on `main` (Nico directive: DIRECT MAIN MODE). No feature branch. No draft PR needed.