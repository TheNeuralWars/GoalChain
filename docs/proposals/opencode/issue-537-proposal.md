# OA Proposal — Issue #537

## Title
[OPENCODE] [DIRECTOR] Demo Filming Script + Screen Record Plan

## Source
GitHub issue #537

## Objective
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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-537` and close draft PR.
