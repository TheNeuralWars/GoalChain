# OA Proposal: Issue #523 — [MONEY-PRINTER] Content Analytics Engine (goalchain-content-analytics skill)

**Worker:** omega (partition 1)
**Owner:** opencode
**Priority:** P1
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
## Objective
Build **goalchain-content-analytics** skill: Collect metrics from all platforms → attribute to videos → feedback loop to script_gen prompts.

## Context
- Plan: `docs/implementation-plans/money-printer-goalchain-plan.md`
- Platforms: TikTok, IG, YT, X APIs (require auth tokens)
- GoalChain SDK: Track referral clicks → signups → on-chain activity
- State DB: `~/hermes/content-buffer/state.db` (extend schema)

## Deliverables
1. **Skill**: `~/.hermes/profiles/marketing-active/skills/data-science/goalchain-content-analytics/SKILL.md`
2. **Script**: `ops/content-flywheel/scripts/analytics.py`
3. **Dashboard**: Simple HTML/JS at `~/hermes/content-buffer/dashboard/index.html`

## Metrics to Collect
| Metric | Source | Attribution |
|--------|--------|-------------|
| Views | Platform API | video_id + platform |
| Watch time / retention | Platform API | video_id |
| CTR (link clicks) | Platform API + UTM | video_id + platform |
| Referral signups | GoalChain API / SDK | UTM → wallet |
| First match played | On-chain (program) | referral_code |
| Revenue (affiliate) | Betting partner API | UTM → deposit |

## Feedback Loop
1. Daily: Top 20% videos by CTR → extract hook patterns, visual styles
2. Weekly: Fine-tune Grok script_gen prompts with winning patterns
3. Monthly: Retrain template weights (which templates convert best)

## Dashboard
- Real-time: Videos published, views, CTR, signups
- Per-video drilldown: Retention curve, platform breakdown
- Template performance: Conversion by template type
- Cost/video: Grok Imagine + ElevenLabs + Pexels (all tracked)

## Verification
```bash
cd ~/hermes/workspace/GoalChain && python ops/content-flywheel/scripts/analytics.py --collect --days 7
# Should populate state.db with metrics
# Dashboard served at http://localhost:8080 (or deployed)
```

## Priority: P1 — Phase 2 (Day 4-5)
