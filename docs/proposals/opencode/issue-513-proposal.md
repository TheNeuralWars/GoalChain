# OA Proposal — Issue #513

## Title
[OPENCODE] [P0] #296 English Localization of Webapp UI (Campaign ↔ Product Mismatch)

## Source
Local queue (autonomous mode)

## Objective
# [OPENCODE] [P0] #296 English Localization of Webapp UI (Campaign ↔ Product Mismatch)

## Priority: P0 (webapp — public facing)
## Labels: agent:opencode, priority:P0, area:webapp, status:blocked

## Problem
Webapp UI has mixed Spanish/English strings, campaign copy doesn't match product terminology. All user-facing text must be English (per SOUL.md: English on all public surfaces).

## Scope
1. **Audit** all user-visible strings in webapp
2. **Replace** Spanish strings with English equivalents
3. **Align** campaign terminology with product:
   - "Campaña" → "Campaign"
   - "Apuesta" → "Bet" / "Wager"
   - "Ganar" → "Win" / "Claim"
   - "Jugador" → "Player"
   - "Partido" → "Match" / "Fixture"
4. **Add** i18n infrastructure for future (keys, not full i18n yet)

## Files to Check/Modify
- `goalchain_webapp/src/**/*.tsx` — all components
- `goalchain_webapp/src/features/**/*.tsx` — feature components
- `goalchain_webapp/src/pages/*.tsx` — page components
- `goalchain_webapp/src/components/ui/*.tsx` — primitives

## Verification
```bash
cd goalchain_webapp
# Search for Spanish words
grep -r -i "partido\|apuesta\|ganar\|jugador\|campaña\|equipo\|torneo" src/ --include="*.tsx" | grep -v node_modules
# Typecheck
npm run typecheck
# Build
npm run build
```

## Acceptance Criteria
- Zero Spanish user-facing strings in production build
- All copy uses consistent English terminology
- Campaign landing → Play flow terminology aligned

## Priority
P0

## Labels
status:ready,agent:opencode,priority:P0,area:webapp,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-513`.
