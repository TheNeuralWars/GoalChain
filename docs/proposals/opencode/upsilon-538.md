# OA Proposal: Issue #538 — [OPENCODE] [VOXLY] Voice Learning Engine

**Worker:** upsilon (partition 8)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
## Objective
Build the core voice-learning engine that clones a user's voice from 30-60 seconds of reference audio and generates TTS in that voice for GoalChain content (match previews, betting analysis, coach personas).

## Owner
opencode

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

Part of Voxly-style AI Content Engine track (Score 53/60 GO decision). Voice-learning IP becomes GoalChain moat: coach personas, automated match previews in user's voice, betting analysis in analyst voice, white-label for sportsbooks/fantasy platforms.

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
  "goal": "Build voice cloning engine for GoalChain content automation",
  "issue_number": 123,
  "branch": "exp/opencode-issue-123",
  "steps": [
    {"action": "setup project structure", "files": ["voice_engine/", "voice_engine/main.py"], "depends_on": []},
    {"action": "integrate OpenVoice v2", "files": ["voice_engine/cloning.py", "voice_engine/models/"], "depends_on": ["setup project structure"]},
    {"action": "implement FastAPI endpoints", "files": ["voice_engine/api.py"], "depends_on": ["integrate OpenVoice v2"]},
    {"action": "add football domain adaptation", "files": ["voice_engine/football_presets.py"], "depends_on": ["implement FastAPI endpoints"]},
    {"action": "Supabase storage integration", "files": ["voice_engine/storage.py"], "depends_on": ["implement FastAPI endpoints"]},
    {"action": "Docker deployment config", "files": ["Dockerfile", "docker-compose.yml"], "depends_on": ["Supabase storage integration"]}
  ],
  "dependencies": ["openvoice", "onnxruntime", "fastapi", "supabase-py", "redis"],
  "risks": ["ARM64 compatibility (Oracle Cloud)", "Model license (OpenVoice v2 = MIT)", "Latency target <3s for 30s audio", "Storage: voice embeddings ~50MB each"],
  "verification": ["curl -X POST /voice/clone -F 'audio=@sample.wav'", "curl -X POST /voice/synthesize -d '{\"voice_id\":\"...\",\"text\":\"test\",\"style\":\"analyst_calm\"}'", "python -m pytest tests/voice/ -v"]
}
```

## Technical Specification

### EXACT DELIVERABLES:
1. **Voice Cloning Service (FastAPI)**:
   - POST /voice/clone: upload 30-60s reference audio (wav/mp3) → returns voice_id
   - POST /voice/synthesize: voice_id + text + emotion/style → audio file (mp3/wav)
   - GET /voice/models: list available cloned voices
   - DELETE /voice/models/{voice_id}: cleanup

2. **Model Backend** (pick one, prioritize local/zero-API-cost):
   - **Option A: OpenVoice v2 (MIT, multilingual, few-second cloning) — RECOMMENDED**
   - Option B: RVC (Retrieval-based Voice Conversion) — high quality, needs training
   - Option C: Coqui TTS XTTS v2 — multilingual, 6s reference

3. **Football/GoalChain Domain Adaptation**:
   - Emotion presets: 'analyst_calm', 'coach_hype', 'commentator_excited', 'narrator_neutral'
   - Football terminology pronunciation dictionary (player names, team names, tactics terms)
   - SSML-style tags for pacing: <pause>, <emphasis>, <prosody rate>

4. **Integration Points**:
   - Output feeds directly into MoneyPrinterTurbo video generation pipeline
   - Hermes MCP tool 'voice-ops' for cron/agent access
   - Supabase storage for voice models + generated audio

### TECHNICAL STACK:
- FastAPI + Pydantic + Uvicorn (async)
- Model inference: ONNX Runtime / torch.compile for speed
- Storage: Supabase (existing GoalChain project)
- Queue: Redis (existing) for async synthesis jobs
- Deployment: Docker on VPS (same as MoneyPrinterTurbo)

### VERIFICATION COMMANDS:
- curl -X POST http://localhost:8081/voice/clone -F 'audio=@sample.wav' → returns voice_id
- curl -X POST http://localhost:8081/voice/synthesize -d '{"voice_id":"...","text":"GoalChain alpha signal: Real Madrid over 2.5 goals","style":"analyst_calm"}' → audio.mp3
- python -m pytest tests/voice/ -v

### RISKS:
- ARM64 compatibility (Oracle Cloud) — use ONNX/NCNN compiled models
- Model license (OpenVoice v2 = MIT, RVC = non-commercial, XTTS = Coqui CoCPL)
- Latency: target <3s for 30s audio generation
- Storage: voice embeddings ~50MB each, plan for 100+ voices

### DEPENDENCIES:
- Supabase project (existing)
- Redis (existing)
- FFmpeg (existing in MoneyPrinterTurbo container)

## FCC Tier
opus (nemotron-3-super via NVIDIA NIM) — P0 architecture task
Apply frontend-design skill for any UI components. Follow gstack plan-eng-review before coding.
