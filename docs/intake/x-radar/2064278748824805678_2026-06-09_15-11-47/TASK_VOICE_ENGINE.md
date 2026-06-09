# FCC Task: [VOXLY] Voice Learning Engine (P0)

## Issue Spec for GitHub

**Title:** `[OPENCODE] [VOXLY] Voice Learning Engine`
**Labels:** `agent:opencode`, `priority:P0`, `status:ready`, `source:manager`

---

## Objective
Build the core voice-learning engine that learns a creator's voice from their published content history and generates new content in that voice across platforms.

---

## Detailed Requirements

### Core Voice Learning Pipeline

#### 1. Input Ingestion
- Accept user's published content URLs (X/Twitter, LinkedIn, newsletters, blogs)
- Scrape/import historical posts (last 100-500 posts minimum)
- Support manual text paste for quick onboarding

#### 2. Voice Profile Extraction
- Analyze linguistic patterns: vocabulary, sentence structure, tone, formatting, emoji usage, hashtag style
- Identify signature phrases, recurring topics, argument structures, hook patterns
- Extract platform-specific variants (X vs LinkedIn vs newsletter voice)
- Build embedding-based style fingerprint (use sentence-transformers or similar)

#### 3. Voice Profile Storage
- Store in Supabase: `voice_profiles` table (user_id, platform, embeddings, patterns, examples, version)
- Version each profile update (re-learning from new content)
- RLS policies for multi-tenancy

#### 4. Generation Engine
- Input: topic, key points, target platform, voice_profile_id
- Output: Platform-optimized content in user's voice
- Use Hermes Agent (Grok primary, Ollama fallback) with voice profile as system context
- Include few-shot examples from user's top-performing posts

#### 5. Quality Scoring
- Score generated content against voice profile (cosine similarity on embeddings)
- Flag deviations > threshold for review
- Track user edits as feedback for re-training

---

## Technical Stack
- **Supabase**: PostgreSQL + pgvector for embeddings, Auth, Storage, Edge Functions
- **Hermes Agent**: Grok (xai/grok-4.3) primary, Ollama (qwen2.5:32b) local fallback
- **Python/TypeScript**: Edge Functions for ingestion/scoring, Next.js for dashboard
- **Embedding Model**: sentence-transformers/all-MiniLM-L6-v2 (384-dim, fast) or bge-small-en-v1.5

---

## API Surface (Edge Functions)
```
POST /api/voice/ingest          - Ingest content URLs/text
GET  /api/voice/profile/:id     - Get voice profile + stats
POST /api/voice/generate        - Generate content in voice
POST /api/voice/feedback        - User edit feedback
POST /api/voice/relearn         - Trigger re-learning from new content
```

---

## Acceptance Criteria
- [ ] Ingest 100 X posts in < 60 seconds
- [ ] Generate X post in < 10 seconds
- [ ] Voice similarity score > 0.85 on held-out test posts
- [ ] Support 3+ platforms (X, LinkedIn, Newsletter) with platform-specific variants
- [ ] Multi-tenant RLS working (user A cannot access user B's profile)
- [ ] Edge Functions deployed to Supabase, callable from Vercel frontend

---

## Owner
opencode (FCC)

## Priority
P0

## Context
This is the core IP for Voxly-track (GoalChain Content Engine). Based on @0xDepressionn's validated model: 320 waitlist, 3 B2B @ $2K/mo, $72K ARR locked. Same stack principles (Supabase + Vercel + AI dev) applied to GoalChain sports/crypto domain.

## Implementation Notes
- Use existing GoalChain Supabase project (separate schema: `voxly_*`)
- Deploy Edge Functions via Supabase CLI
- Hermes Agent integration via existing MCP tools
- FCC tier: **opus** (NVIDIA NIM / nemotron) for complex ML pipeline
- Estimated: 20 hours

---

## Required First Output: Plan JSON
Before any code changes, output this JSON to stdout:
```json
{
  "goal": "Build voice-learning engine: ingestion → embedding → profile storage → generation → scoring",
  "issue_number": TBD,
  "branch": "exp/opencode-issue-TBD",
  "steps": [
    {"action": "create voxly schema in Supabase", "files": ["supabase/schemas/voxly_voice_profiles.sql"], "depends_on": []},
    {"action": "implement ingestion Edge Function", "files": ["supabase/functions/voice-ingest/index.ts"], "depends_on": ["create voxly schema"]},
    {"action": "implement voice profile extraction (embeddings)", "files": ["supabase/functions/voice-extract/index.ts", "supabase/functions/_shared/embeddings.ts"], "depends_on": ["create voxly schema"]},
    {"action": "implement generation Edge Function", "files": ["supabase/functions/voice-generate/index.ts"], "depends_on": ["voice profile extraction"]},
    {"action": "implement quality scoring", "files": ["supabase/functions/voice-score/index.ts"], "depends_on": ["generation"]},
    {"action": "add RLS policies", "files": ["supabase/schemas/voxly_rls.sql"], "depends_on": ["create voxly schema"]},
    {"action": "deploy Edge Functions", "files": [], "depends_on": ["all functions"]},
    {"action": "integration tests", "files": ["supabase/functions/*/test.ts"], "depends_on": ["deploy"]}
  ],
  "dependencies": ["pgvector", "sentence-transformers", "supabase CLI", "Hermes MCP tools"],
  "risks": ["embedding dimension mismatch", "Hermes Agent API changes", "Supabase Edge Function cold starts", "X/Twitter API rate limits"],
  "verification": [
    "curl POST /api/voice/ingest with 100 posts → <60s",
    "curl POST /api/voice/generate → <10s",
    "similarity score > 0.85 on test set",
    "RLS policies block cross-tenant access"
  ]
}
```

---

## Workflow (Producer-Critic Pattern)
1. **Implementer** (opencode) creates PR on branch `exp/opencode-issue-XXX`
2. **Critic Agent** reviews PR automatically (read-only, no code changes)
3. Critic posts structured review: PASS/FAIL + findings
4. If FAIL: Implementer addresses findings, pushes updates
5. If PASS: Label `status:critic_pass` → Antigravity/Nico human review
6. Merge after human approval