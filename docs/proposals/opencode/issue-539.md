# Issue #539: [OPENCODE] [VOXLY] Multi-Platform Generation Pipeline

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Build the multi-platform content generation and publishing pipeline that takes cloned voice audio + generated scripts and produces platform-optimized videos for YouTube Shorts, TikTok, Instagram Reels, X (Twitter), Discord, and Telegram — with scheduling, analytics, and revenue tracking.

## Owner
opencode

## Priority
P1

## Context
Part of Voxly-style AI Content Engine track. Replicates Voxly's multi-platform distribution (X, Discord, TG, Web) but adapted for GoalChain football niche. Feeds into MoneyPrinterTurbo for video rendering + voice engine for narration.

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
- **Structured plan JSON** as FIRST output

## Technical Specification

### PLATFORMS & FORMATS:
| Platform | Format | Duration | Aspect | API |
|----------|--------|----------|--------|-----|
| YouTube Shorts | MP4 | 15-60s | 9:16 | YouTube Data API v3 |
| TikTok | MP4 | 15-60s | 9:16 | TikTok API (login required) |
| Instagram Reels | MP4 | 15-90s | 9:16 | Instagram Graph API |
| X (Twitter) | MP4/GIF | 140s | 16:9/9:16 | X API v2 |
| Discord | MP4/WebM | Any | Any | Webhook / Bot |
| Telegram | MP4 | Any | Any | Bot API |

### PIPELINE STAGES:
1. **Content Generation** (cron every 6h):

## Priority
P1

## Labels
status:ready,source:manager,agent:opencode,priority:P1,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-539`.
