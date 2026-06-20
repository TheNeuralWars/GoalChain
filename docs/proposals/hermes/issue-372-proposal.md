# OA Proposal — Issue #372

## Title
[OPENCODE] [OPENCODE] Webapp: Legacy cleanup - remove Spanish strings, delete deprecated files, fix hardcoded values (MAX Law)

## Source
GitHub issue #372

## Objective
## Objective
## Objective
Sweep and remove ALL Spanish strings from webapp source code. Replace with i18n keys (en.json).

## Scope
Files to clean (replace inline Spanish -> i18n.t() keys):

### Feature Components (already decomposed, but verify):
- features/nft-marketplace/ - 12 strings (alerts, UI labels)
- features/swarm-vaults/ - 6 strings (alerts, console logs)
- features/ai-commentator/ - 15 strings (commentary pools, UI labels, welcome)
- features/ai-coach/ - 20 strings (system prompt, advisories, chat, buttons)
- features/club-portal/ - 6 strings (honesty note, subtitle, tabs, registration)
- features/estadio-portal/ - 8 strings (fixtures toasts, feed errors, tab labels)

### Layout & Shared:
- src/components/ui/ - Any Spanish in primitives
- src/components/layout/ - PlayNav tabs, sidebar labels
- src/components/SimulationBadge.tsx - Check text
- src/components/LanguageToggle.tsx - Check labels

### Legacy (before deletion):
- src/ui/NFTMarketplace.tsx - Verify wrapper only
- src/ui/ClubPortal.tsx - Verify wrapper only
- src/ui/EstadioPortal.tsx - Verify wrapper only
- src/ui/DeFiPortal.tsx - Verify wrapper only
- src/ui/SwarmVaults.tsx - Verify wrapper only
- src/ui/TradingTerminal.tsx - Verify wrapper only
- src/ui/AICommentator.tsx - Verify wrapper only
- src/ui/AICoach.tsx - Verify wrapper only
- src/ui/FixturesPanel.tsx - Verify wrapper only
- src/ui/LiveEventFeed.tsx - Verify wrapper only

### i18n Keys to Add (en.json):
See STEP3_WEBAPP_UI_REFACTOR.md Section 4 for complete key list.
Add all keys to src/i18n/locales/en.json
Update src/i18n/locales/es.json with translations

### Cleanup:
- Delete src/ui/*.tsx legacy files after verification

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-372` and close draft PR.
