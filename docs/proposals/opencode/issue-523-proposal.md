# OA Proposal — Issue #523

## Title
[MONEY-PRINTER] Content Analytics Engine (goalchain-content-analytics skill)

## Source
GitHub issue #523

## Objective
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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-523` and close draft PR.
