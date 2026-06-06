# OA Proposal — Issue #337

## Title
[OPENCODE] Webapp: Decompose AICommentator → features/commentator (5 components + 5 hooks)

## Source
GitHub issue #337

## Objective
## Objective
Decompose the 561-line AICommentator monolith into features/commentator/:

## Scope
Create `src/features/commentator/` with:

**Components:**
1. `Avatar.tsx` - SVG robot referee with animated glow, speaking state, antenna pulse
2. `CommentaryFeed.tsx` - Scrollable history, timestamps, event type badges
3. `VoiceControls.tsx` - TTS toggle, voice selector (Web Speech API), mute button
4. `StreamingBadge.tsx` - WebSocket bridge status: LIVE CAST (count), CONNECTING, OFFLINE, ERROR
5. `LoadingPhase.tsx` - Download progress (simulated), compile phase, animated pulse

**Hooks:**
6. `useCommentaryEngine.ts` - Event listener, phrase pool selection, commentary generation
7. `useWebSocketBridge.ts` - WS connection, reconnection, broadcastCommentary()
8. `useSpeechSynthesis.ts` - speak(), cancel(), voice selection, onstart/onend
9. `useVoiceSelection.ts` - Load voices, filter EN/ES, persist selection
10. `useLoadingPhase.ts` - Download → compile → active state machine

**Composition:**
11. `types.ts` - CommentaryItem, VoiceConfig, WSStatus, LoadingPhase
12. `constants.ts` - ENGLISH ONLY phrase pools (12 templates: GOAL, BET, RESOLVE × 4 each)
13. `index.ts` - Barrel export
14. `AICommentator.tsx` - Composed page component

## English-Only Phrase Pools (REPLACE ALL SPANISH)
- GOAL: "GOAL! GOAL! GOALAZO! Enzo Bit reports: {msg}. Predictive markets are on fire!"
- BET: "Bet detected in feed! {msg}. Liquidity in this pool is growing exponentially!"
- RESOLVE: "Oracle has resolved! {msg}. Deposited funds are being released!"

## Acceptance Criteria
- Each file < 200 lines
- Zero Spanish strings in constants.ts
- WebSocket reconnection with exponential backoff
- TTS voice persistence in localStorage
- Mobile: avatar compact, feed scrollable

## Skill Hint
Apply frontend-design skill (no generic AI UI).

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #337
