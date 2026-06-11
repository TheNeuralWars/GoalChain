# OA Proposal: Issue #534 — [OPENCODE] [VOXLY] Multi-Platform Generation Pipeline

**Worker:** omicron (partition 4)
**Owner:** opencode
**Priority:** P1
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
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

| Platform | Max Chars | Format | Special Features |
|----------|-----------|--------|------------------|
| **X/Twitter** | 280 | Thread support | Hashtags, mentions, media, polls |
| **LinkedIn** | 3000 | Rich text | Hashtags, mentions, article link |
| **Newsletter** | Unlimited | Markdown/HTML | Sections, CTAs, unsubscribe |
| **Discord** | 2000 | Markdown | Embeds, mentions, code blocks |
| **Telegram** | 4096 | HTML/Markdown | Bold, italic, links, previews |
| **Web (GoalChain)** | Unlimited | React/MDX | Components, interactive elements |

### Generation Modes
1. **Single-shot**: One topic → all platforms at once
2. **Iterative**: Human reviews X → approves → auto-generates others
3. **Scheduled**: Cron job generates daily/weekly content from content calendar
4. **Reactive**: Trigger on events (match start, injury news, price alert)

### Content Calendar Integration
- Store content plans in Supabase: `content_calendar` (user_id, topic, key_points, schedule, platforms[], status)
- Hermes cronjob triggers generation at scheduled time
- Deliver via webhook to Discord/Telegram/Email

### Hermes Agent Integration
- Use existing Hermes skills system for platform-specific prompts
- Skills: `voxly-x-generator`, `voxly-linkedin-generator`, etc.
- Each skill loads platform rules + user's voice examples
- Grok primary, Ollama fallback with automatic retry

---

## Technical Stack
- **Supabase**: PostgreSQL (content_calendar, generated_content tables), Edge Functions
- **Hermes Agent**: Skills + Grok/Ollama via MCP
- **TypeScript**: Edge Functions, Next.js dashboard components
- **Delivery**: Discord webhook, Telegram bot, Email (Resend/SendGrid)

---

## API Surface (Edge Functions)
```
POST /api/generate/batch        - Generate for multiple platforms
POST /api/generate/single       - Generate for one platform
POST /api/calendar/create       - Schedule future generation
GET  /api/calendar/upcoming     - List scheduled content
POST /api/deliver/discord       - Push to Discord webhook
POST /api/deliver/telegram      - Push to Telegram bot
```

---

## Acceptance Criteria
- [ ] Generate for 6 platforms in < 30 seconds total
- [ ] Platform adapters produce valid format (thread for X, markdown for Discord, etc.)
- [ ] Voice similarity > 0.85 per platform
- [ ] Scheduled generation runs via Hermes cron (test with 5-min interval)
- [ ] Discord/Telegram delivery works end-to-end
- [ ] Content calendar CRUD + status tracking (pending/generating/delivered/failed)

---

## Owner
opencode (FCC)

## Priority
P1

## Context
Part of Voxly-track. Depends on Voice Learning Engine (P0) for voice profiles. Enables the "multi-platform" value prop that Voxly validates.

## Implementation Notes
- Reuse existing GoalChain Discord bot infrastructure (`oa-worker`)
- Hermes cronjobs already running — add voxly generation schedule
- FCC tier: **sonnet** (OpenRouter coder) for TypeScript pipeline work
- Estimated: 16 hours

---

## Required First Output: Plan JSON
```json
{
  "goal": "Build multi-platform generation pipeline with platform adapters, Hermes skills, scheduled delivery",
  "issue_number": TBD,
  "branch": "exp/opencode-issue-TBD",
  "steps": [
    {"action": "create platform adapter interfaces", "files": ["supabase/functions/_shared/platform-adapters.ts"], "depends_on": []},
    {"action": "implement X/Twitter adapter (threads, hashtags)", "files": ["supabase/functions/adapters/x.ts"], "depends_on": ["interfaces"]},
    {"action": "implement LinkedIn adapter", "files": ["supabase/functions/adapters/linkedin.ts"], "depends_on": ["interfaces"]},
    {"action": "implement Newsletter adapter (MDX)", "files": ["supabase/functions/adapters/newsletter.ts"], "depends_on": ["interfaces"]},
    {"action": "implement Discord/Telegram adapters", "files": ["supabase/functions/adapters/discord.ts", "supabase/functions/adapters/telegram.ts"], "depends_on": ["interfaces"]},
    {"action": "implement Web/GoalChain adapter", "files": ["supabase/functions/adapters/web.ts"], "depends_on": ["interfaces"]},
    {"action": "create batch generation orchestrator", "files": ["supabase/functions/generate-batch/index.ts"], "depends_on": ["all adapters"]},
    {"action": "create Hermes skills for each platform", "files": ["~/.hermes/profiles/side-projects/skills/voxly-*"], "depends_on": ["batch orchestrator"]},
    {"action": "implement content calendar tables + Edge Functions", "files": ["supabase/schemas/voxly_calendar.sql", "supabase/functions/calendar-*"], "depends_on": ["batch orchestrator"]},
    {"action": "implement Discord/Telegram delivery", "files": ["supabase/functions/deliver-*"], "depends_on": ["calendar"]},
    {"action": "add Hermes cronjob for scheduled generation", "files": ["~/.hermes/profiles/side-projects/cron/voxly-generation.yaml"], "depends_on": ["delivery"]},
    {"action": "integration tests", "files": [], "depends_on": ["all"]}
  ],
  "dependencies": ["Voice Learning Engine (P0)", "Hermes Agent skills system", "oa-worker Discord bot", "Supabase Edge Functions"],
  "risks": ["Platform API changes", "Hermes skill loading", "Discord/Telegram rate limits", "Thread generation complexity"],
  "verification": [
    "POST /generate/batch with 6 platforms → <30s",
    "X output: valid thread format",
    "Discord delivery: message appears in test channel",
    "Scheduled cron: triggers at correct time",
    "Voice similarity > 0.85 on all platforms"
  ]
}
```

## Owner
opencode

## Priority
P1

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
