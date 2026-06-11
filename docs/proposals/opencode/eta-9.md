# OA Proposal: Issue #9 — [OPENCODE] [DIRECTOR] Demo Filming Script + Screen Record Plan

**Worker:** eta (partition 6)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
## Objective
Create a complete directors package for Nico to self-film the GoalChain Content Engine demo.

## Deliverables
1. **Filming Script** (markdown): Scene-by-scene with dialogue, camera angles, timing, B-roll cues
2. **Screen Recording Plan**: Exact clicks/flows to record for the demo portion (Supabase dashboard, Vercel deploy, generation test)
3. **Technical Checklist**: Camera/mic/lighting setup, OBS/ScreenFlow settings, export specs
4. **Post-Production Notes**: Where Nico adds voiceover, where screen record syncs, music/sfx cues

## Context
- Nico = actor, Manager = director
- No voice cloning — Nico records his own voice
- Demo: GoalChain Content Engine (Voxly spin) — waitlist landing, voice profile concept, multi-platform generation
- Target: 2-3 min final cut for sales calls + waitlist page
- Stack: Supabase (free tier) + Vercel (free tier) + Hermes Agent

## Filming Script Structure
- **Hook (0-15s)**: Problem — content creation bottleneck for sports/betting creators
- **Solution Reveal (15-45s)**: GoalChain Content Engine — "Voxly for sports"
- **Live Demo Walkthrough (45s-2:00)**: Screen record of waitlist → dashboard → generate match preview in Nico's voice
- **B2B Proof (2:00-2:30)**: $72K ARR, 3 contracts, 320 waitlist — social proof
- **CTA (2:30-3:00)**: Join waitlist / Book demo / Contact sales

## Screen Recording Flows to Capture
1. Vercel deploy preview → live URL
2. Supabase dashboard: voice_profiles table, Edge Functions logs
3. Generation API call → JSON response → rendered output
4. Waitlist page: tier selection, email capture, referral link

## Technical Specs
- Camera: 1080p/30fps minimum (phone OK if good light)
- Mic: Lavalier or USB cardioid (no room echo)
- Lighting: Key + fill, 45° angle, no backlight
- Screen record: 1440p/60fps, system audio off (Nico adds VO)
- Export: ProRes or high-bitrate H.264, 1080p final

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

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
  "goal": "Brief description of the objective",
  "issue_number": 123,
  "branch": "exp/opencode-issue-123",
  "steps": [
    {"action": "create vector/ dir", "files": ["src/vector/turbovec_store.py"], "depends_on": []},
    {"action": "implement player index", "files": ["src/vector/player_index.py"], "depends_on": ["create vector/ dir"]}
  ],
  "dependencies": ["turbovec pip package"],
  "risks": ["turbovec API changes", "embedding dim mismatch"],
  "verification": ["pip install turbovec", "python -m pytest tests/vector/", "index build <2s", "RAM <50MB"]
}
```

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`
