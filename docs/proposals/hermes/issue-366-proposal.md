# OA Proposal — Issue #366

## Title
[OPENCODE] [OPENCODE] Webapp: Decompose AICoach → features/coach (5 components + 5 hooks)

## Source
GitHub issue #366

## Objective
## Objective
## Objective
Decompose monolithic AICoach.tsx (410 lines) into modular feature architecture.

## Scope
Create goalchain_webapp/src/features/ai-coach/:

### Components:
1. **CoachChat.tsx** — Chat window, message bubbles (user/coach/system), input form, auto-scroll
2. **CoachSettings.tsx** — API key modal (password input, save/clear, localStorage)
3. **AdvisoriesPanel.tsx** — Stamina warning/success, country/club synergy cards (icon, title, desc)
4. **RainmakerPredictor.tsx** — Match probabilities (stacked bar), betbot/optimizer toggles
5. **TacticalStateDisplay.tsx** — Current player, stats, stamina, league, jersey, synergies, stadium, balance

### Hooks:
1. **useChat.ts** — Message history, send, loading, scroll ref
2. **useGeminiProxy.ts** — Local key → backend proxy → heuristic fallback chain
3. **useTacticalState.ts** — Mock tactical state (player, stats, stamina, synergies, balance)
4. **useRainmaker.ts** — Match prob simulation (home/draw/away), betbot/optimizer state
5. **useAdvisories.ts** — Derive advisories from tactical state (stamina, synergies)

### Shared:
- **src/features/ai-coach/constants/systemPrompts.ts** — ENGLISH system prompt template
- **src/features/ai-coach/types.ts** — Advisory, ChatMessage, TacticalState, MatchProb
- **src/features/ai-coach/index.ts** — Barrel export

### Migration:
- Original AICoach.tsx → thin wrapper (2-column grid)
- Spanish system prompt → English constant
- Spanish advisories → i18n keys
- Spanish chat replies → English (i18n detects lang)

## Acceptance Criteria
- Feature module builds independently
- Wrapper maintains identical UX
- All user-facing text via i18n (en.json keys)
- System prompt in English
- Gemini proxy chain works
- Build passes

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-366` and close draft PR.
