# OA Proposal — Issue #375

## Title
[OPENCODE] [GTM] HyperFrames Video Production Pipeline — project setup, templates, batch rendering

## Source
GitHub issue #375

## Objective
## Objective
Set up a complete HyperFrames video production pipeline in the GoalChain repo for autonomous faceless YouTube content generation. This replaces the Mac-only prototype with a VPS-native, deterministic, version-controlled system.

## Context
- **Current state**: Working HyperFrames project at `/scripts/marketing/video-automation/` (scoreboard template, 5s, 1080x1080)
- **Player data**: 1,248 parody players in `docs/assets/data/players.json` with stats, rarity, physical traits
- **Dashboard API**: Issue #354 (P0) will provide real-time metrics
- **Assets**: Stadium videos, NFT background videos available
- **TTS**: edge-tts available on VPS (free), ElevenLabs as premium option
- **Storage**: Cloudflare R2 (10GB free tier) for asset hosting
- **Notion**: 6 databases for pipeline orchestration

## Required Work

### 1. HyperFrames Project Structure (`scripts/marketing/video-production/`)
Create a proper monorepo structure for HyperFrames compositions:
```
scripts/marketing/video-production/
├── package.json                    # npm scripts (dev, check, render, publish)
├── hyperframes.json                # config (registry, paths)
├── meta.json                       # project metadata
├── index.html                      # main entry (orchestrator)
├── compositions/
│   ├── player-card.hf.html         # Player reveal template (15-30s)
│   ├── matchday-preview.hf.html    # Daily match preview (60s)
│   ├── economy-dashboard.hf.html   #  metrics (45s)
│   ├── penalty-highlight.hf.html   # Bet event highlight (30s)
│   ├── jackpot-milestone.hf.html   # Jackpot threshold (20s)
│   ├── top-earner.hf.html          # Weekly spotlight (60s)
│   ├── tutorial-penalty.hf.html    # How-to (90s)
│   ├── tutorial-rent-earn.hf.html  # How-to (90s)
│   └── builder-public.hf.html      # Dev updates (120s)
├── components/                     # Reusable UI components
│   ├── scoreboard/
│   ├── stat-bar/
│   ├── player-card/
│   ├── counter/
│   └── lower-third/
├── assets/
│   ├── fonts/                      # Local @font-face (Outfit, etc.)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-375` and close draft PR.
