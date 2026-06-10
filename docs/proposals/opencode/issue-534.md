# Issue #534: [OPENCODE] [VOXLY] Multi-Platform Generation Pipeline

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
# FCC Task: [VOXLY] Multi-Platform Generation Pipeline (P1)

## Issue Spec for GitHub

**Title:** `[OPENCODE] [VOXLY] Multi-Platform Generation Pipeline`
**Labels:** `agent:opencode`, `priority:P1`, `status:ready`, `source:manager`

---

## Objective
Build the multi-platform content generation pipeline that takes a voice profile and generates platform-optimized content for X/Twitter, LinkedIn, Newsletter, Discord, Telegram, and Web.

---

## Detailed Requirements

### Platform Adapters
Each platform needs a dedicated adapter handling:
- **Character limits & formatting** (X: 280, LinkedIn: 3000, Newsletter: unlimited)
- **Platform-specific features** (hashtags, mentions, threads, formatting)
- **Voice variant application** (user's X voice ≠ LinkedIn voice ≠ Newsletter voice)
- **Media attachment handling** (images, videos, links)

### Pipeline Architecture
```
Input: (topic, key_points, voice_profile_id, target_platforms[])
         ↓
Platform Adapter Factory → selects correct adapter per platform
         ↓
Voice Profile Loader → fetches embeddings + examples for each platform
         ↓
Hermes Agent (Grok) → generates with few-shot examples + platform rules
         ↓
Quality Scorer → similarity check per platform
         ↓
Output: { platform: generated_content, score, metadata }[]
```

### Platform Specifications

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
- Rollback: revert branch `exp/opencode-issue-534`.
