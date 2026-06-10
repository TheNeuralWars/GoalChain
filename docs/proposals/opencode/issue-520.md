# Issue #520: [MONEY-PRINTER] Video Render Pipeline (goalchain-video-render skill)

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
Build the **goalchain-video-render** skill: Script JSON → Grok Imagine video clips + ElevenLabs TTS + Pexels stock → assembled MP4 (1080x1920, 30fps).

## Context
- Plan: `docs/implementation-plans/money-printer-goalchain-plan.md`
- Grok Imagine video: 720p, $0.05/s via SuperGrok Pro (native plugin)
- ElevenLabs: Free tier (10k chars/mo), voice "Adam" or "Rachel"
- Pexels API: Free (200 req/hr) for royalty-free B-roll
- 10 FCC workers (α-κ) available for parallel rendering

## Deliverables
1. **Skill**: `~/.hermes/profiles/hermes-ceo/skills/creative/goalchain-video-render/SKILL.md`
2. **Script**: `ops/content-flywheel/scripts/video_render.py`
3. **Presets**: `ops/content-flywheel/config/video_presets.json`

## Pipeline Stages
1. **Visual generation** — Grok Imagine video per scene `visual_prompt` (720p → upscale to 1080)
2. **TTS generation** — ElevenLabs per `narration` line, concat to single WAV
3. **Stock footage** — Pexels search per scene keywords, download 1080x1920 clips
4. **Assembly** — ffmpeg: concat video + audio + subtitles (ASS format) + branding watermark + background music (loop) + CTA end frame
5. **Quality gates** — Duration ±5%, loudness -14 LUFS, watermark present, CTA frame, file <50MB
6. **Output** — `~/hermes/content-buffer/videos/{script_id}.mp4` + metadata JSON

## Skill Hints
- Follow `gstack investigate` workflow for ffmpeg/quality bugs
- Use `gstack review-pass` before opening draft PR

## Verification
```bash
cd ~/hermes/workspace/GoalChain && python ops/content-flywheel/scripts/video_render.py --test-script gc_test_001
# Should produce valid MP4 in buffer with metadata
```

## Priority: P0 — Day 1 core pipeline

## Priority
P0

## Labels
P0,status:ready,agent:opencode,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-520`.
