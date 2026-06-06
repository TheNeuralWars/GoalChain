# OA Proposal — Issue #338

## Title
[OPENCODE] Webapp: Decompose AICoach → features/coach (5 components + 5 hooks)

## Source
GitHub issue #338

## Objective
## Objective
Decompose the 410-line AICoach monolith into features/coach/:

## Scope
Create `src/features/coach/` with:

**Components:**
1. `ChatInterface.tsx` - Message list, auto-scroll, loading indicator, input form
2. `MessageBubble.tsx` - User/coach/system variants, avatar, timestamp, copy action
3. `AdvisoryCard.tsx` - Warning/success/info variants, icon, title, description, dismiss
4. `ApiKeyModal.tsx` - Gemini API key input (password), save/clear, localStorage hint
5. `PredictorPanel.tsx` - Rainmaker AI: match selector, probability bars, betbot/optimizer toggles

**Hooks:**
6. `useChat.ts` - Message state, send, streaming response, fallback chain (local → backend → heuristic)
7. `useAdvisories.ts` - Compute advisories from tactical state (stamina, country/club synergy)
8. `useGeminiProxy.ts` - Backend proxy call, error handling, timeout
9. `usePredictor.ts` - Match probabilities, Pyth/Drift feed drift simulation
10. `useTacticalState.ts` - Player, stats, stamina, league, jersey, synergy, stadium, balance

**Composition:**
11. `types.ts` - Advisory, ChatMessage, TacticalState, MatchProbability
12. `constants.ts` - ENGLISH ONLY: advisory titles, placeholder text, button labels
13. `index.ts` - Barrel export
14. `AICoach.tsx` - Composed page component

## English-Only Enforcement
- "Fatigue penalty", "Stamina at X%", "Country Synergy Incomplete", "Club Synergy Incomplete"
- "AI Coach Chat (Eliza)", "Tactical Assistance & Live Optimization"
- "Configure Gemini API Key", "Data stored locally only"
- "Eliza is thinking...", "Ask your tactical coach..."
- "Tactical Advisor Suggestions", "Rainmaker AI WC2026", "Match Predictor & Live Betting"
- "IMPLIED WIN PROBABILITIES", "HOME", "DRAW", "AWAY"
- "BETBOT ACTIVE", "START BETBOT", "AUTO-MANAGER ON", "START AUTO-MANAGER"

## Acceptance Criteria
- Each file < 200 lines
- Zero Spanish strings
- Chat persists in sessionStorage
- Fallback chain works offline

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #338
