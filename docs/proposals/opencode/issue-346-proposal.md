# OA Proposal — Issue #346

## Title
[OPENCODE] Webapp: Build OnboardingFlow → features/onboarding (6 components + 3 hooks)

## Source
GitHub issue #346

## Objective
## Objective
Build the new OnboardingFlow in features/onboarding/:

## Scope
Create `src/features/onboarding/` with:

**Components:**
1. `WelcomeScreen.tsx` - Hero animation, value props, CTA "Start Journey"
2. `WalletConnectStep.tsx` - Wallet adapter, supported wallets, continue
3. `PersonaSelect.tsx` - 4 cards: Speculator, Coach, Architect, Fan (hover preview)
4. `TutorialOverlay.tsx` - Full-screen highlight tour, step controls, skip
5. `FirstAction.tsx` - Guided first trade/bet/mint with tooltip coach marks
6. `CompletionScreen.tsx` - Confetti, reward claim, "Explore Dashboard"

**Hooks:**
7. `useOnboardingState.ts` - Step state, completion flags, localStorage persistence
8. `usePersona.ts` - Persona selection, preset defaults (risk, features, layout)
9. `useTutorial.ts` - Step progression, element targeting, coach marks

**Composition:**
10. `types.ts` - OnboardingStep, Persona, TutorialStep, Reward
11. `constants.ts` - Persona presets, tutorial steps (ENGLISH ONLY)
12. `index.ts` - Barrel export
13. `OnboardingFlow.tsx` - Composed wrapper with step router

## English-Only Enforcement
- "WELCOME TO GOALCHAIN", "YOUR JOURNEY STARTS HERE"
- "CONNECT WALLET", "SELECT YOUR PATH"
- "SPECULATOR", "COACH", "ARCHITECT", "FAN"
- "PLACE YOUR FIRST BET", "MINT YOUR FIRST PLAYER", "START A VAULT"
- "YOU'RE ALL SET", "CLAIM REWARD", "EXPLORE DASHBOARD"

## Acceptance Criteria
- Each file < 200 lines
- Persona presets affect: default page, risk settings, feature visibility
- Tutorial highlights real UI elements (not overlay fake)
- Completion rewards: starter player + GCH bonus
- Mobile: full-screen steps, swipe gestures

## Skill Hint

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #346
