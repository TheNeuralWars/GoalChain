# OA Proposal — Issue #365

## Title
[OPENCODE] [OPENCODE] Webapp: Decompose AICommentator → features/commentator (5 components + 5 hooks)

## Source
GitHub issue #365

## Objective
## Objective
## Objective
Decompose monolithic AICommentator.tsx (561 lines) into modular feature architecture.

## Scope
Create goalchain_webapp/src/features/ai-commentator/:

### Components:
1. **CommentatorHeader.tsx** — Title, pulse dot, voice controls, WS bridge badge
2. **LoadingPhases.tsx** — Downloading (progress bar), Compiling (spinner), Active (none)
3. **Avatar.tsx** — SVG robot referee (extracted), speaking glow animation
4. **CommentaryHistory.tsx** — Message list with timestamps, auto-scroll
5. **VoiceSettings.tsx** — Voice select dropdown, mute/speak toggle

### Hooks:
1. **useLoadingPhase.ts** — Phase state machine (downloading→compiling→active), progress simulation
2. **useWebSocketBridge.ts** — WS connection, reconnect, broadcast, status (connected/connecting/error/disabled)
3. **useSpeechSynthesis.ts** — TTS speak, voice selection, mute, speaking state, voice loading
4. **useEventCommentary.ts** — Goal/Bet/Resolve phrase pools (ENGLISH), commentary generation, broadcast
5. **useCommentaryHistory.ts** — History array (max 5), add, clear

### Shared:
- **src/features/ai-commentator/constants/phrases.ts** — ENGLISH commentary pools (goal/bet/resolve)
- **src/features/ai-commentator/types.ts** — CommentaryItem, WSStatus, VoiceOption
- **src/features/ai-commentator/index.ts** — Barrel export

### Migration:
- Original AICommentator.tsx → thin wrapper
- Spanish commentary pools → English constants
- Inline styles → design tokens
- System prompts → English

## Acceptance Criteria
- Feature module builds independently
- Wrapper maintains identical UX
- All phrases in English (i18n keys in en.json)
- WebSocket reconnection works
- TTS voice selection works
- Build passes

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-365` and close draft PR.
