# Growth Task 2: English Localization of Webapp UI (Campaign ↔ Product Mismatch)

- **Status:** ready-for-hermes
- **Priority:** P0
- **Owner:** opencode
- **Created:** 2026-06-04
- **Source:** GitHub Issue #296 / Manager

## Objective

Commit `93558e18` explicitly states "launch Degen Preseason campaign, update X/Discord links to English" — but the webapp itself remains fully Spanish. `goalchain_webapp/src/ui/NFTMarketplace.tsx` alone ships 6 hardcoded Spanish strings (`"COMPRAR EN CASH"`, `"COMPRAR CON SOL"`, `"PROCESANDO..."`, `"No hay cartas listadas..."`, `"¡ÉXITO! Has adquirido..."`, `"La transacción fue cancelada o falló."`). `DashboardGrid.tsx`, `DashboardHub.tsx`, `AICoach.tsx`, `AICommentator.tsx`, `ClassicHub.tsx`, `ClubPortal.tsx`, `CreateUser.tsx`, `EstadioPortal.tsx`, `SwarmVaults.tsx` all show the same pattern. English-speaking users clicking the X/Discord campaign link bounce immediately on a Spanish UI.

**Action:**
1. Wire `goalchain_webapp` to consume the existing `i18n_reference.js` strings already defined in `docs/assets/js/i18n.js` (which has a complete `en` block at line 507)
2. Add an `EN | ES` toggle to `App.tsx` persisted in `localStorage`
3. Ship the English version first since that is the active campaign language

---

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor
- [ ] Auto-dispatch to FCC/OpenCode for code implementation
- [ ] Run typescript checks and auto-merge to main if clean

## Tags

#growth-task #i18n #english-localization #webapp #campaign-mismatch #humans-0 #autonomous-push