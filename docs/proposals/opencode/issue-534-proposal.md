# OA Proposal — Issue #534

## Title
[OPENCODE] [VOXLY] Multi-Platform Generation Pipeline

## Source
GitHub issue #534

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-534` and close draft PR.
