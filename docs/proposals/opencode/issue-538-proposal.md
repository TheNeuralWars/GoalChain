# OA Proposal — Issue #538

## Title
[OPENCODE] [VOXLY] Voice Learning Engine

## Source
GitHub issue #538

## Objective
## Objective
Build the core voice-learning engine that clones a user's voice from 30-60 seconds of reference audio and generates TTS in that voice for GoalChain content (match previews, betting analysis, coach personas).

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

Part of Voxly-style AI Content Engine track (Score 53/60 GO decision). Voice-learning IP becomes GoalChain moat: coach personas, automated match previews in user's voice, betting analysis in analyst voice, white-label for sportsbooks/fantasy platforms.

## Workflow (Producer-Critic Pattern)
1. **Implementer** (opencode) creates PR on branch `exp/opencode-issue-XXX`
2. **Critic Agent** reviews PR automatically (read-only, no code changes)
3. Critic posts structured review: PASS/FAIL + findings
4. If FAIL: Implementer addresses findings, pushes updates
5. If PASS: Label `status:critic_pass` → Antigravity/Nico human review
6. Merge after human approval

## Required Output (Implementer)
- Proposed file list
- Risks/regressions + rollback
- Exact test commands
- **Structured plan JSON** as FIRST output (see below)

## Required First Output: Plan JSON
Before any code changes, output this JSON to stdout:
```json
{
  "goal": "Build voice cloning engine for GoalChain content automation",
  "issue_number": 123,
  "branch": "exp/opencode-issue-123",
  "steps": [
    {"action": "setup project structure", "files": ["voice_engine/", "voice_engine/main.py"], "depends_on": []},
    {"action": "integrate OpenVoice v2", "files": ["voice_engine/cloning.py", "voice_engine/models/"], "depends_on": ["setup project structure"]},
    {"action": "implement FastAPI endpoints", "files": ["voice_engine/api.py"], "depends_on": ["integrate OpenVoice v2"]},
    {"action": "add football domain adaptation", "files": ["voice_engine/football_presets.py"], "depends_on": ["implement FastAPI endpoints"]},

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-538` and close draft PR.
