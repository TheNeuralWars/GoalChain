# OA Proposal — Issue #833

## Title
[HERMES] Automatización de videos con Grok y Buffer

## Source
GitHub issue #833

## Objective
Implementar y ejecutar el pipeline que genera videos en 9:16 con Grok
(narrativa), Kokoro (TTS de Enzo Bit) e Hyperframes (visuales) y los
publica automáticamente en YouTube Shorts, X y TikTok vía Buffer.

## Owner
hermes

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight
and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - hermes: `exp/hermes-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main`
  unless `cambio urgente`

## Closure analysis (executed, 2026-06-23)

The #833 issue body is **byte-identical** to the #831 issue body
that was already shipped to `main` (c5d23f5f + 277d1229, both
`oa: cambio urgente` per CLAUDE.md direct-main authorization).
Per AGENT_ORCHESTRATION.md §4 Closure + META R3 / R7 / R10 the
correct action is to **close #833 as a superset of #831** rather
than ship duplicate code.

### Evidence already on `main` (inspected)

| File (all on main) | Role in #833 |
|---|---|
| `scripts/marketing/video-automation/compose/grok_narrative.py` | Grok xAI API → 6–10s English narration |
| `scripts/marketing/video-automation/compose/english_check.py` | English Max Law guard (delegates to `social_multiplexer.check_english_max_law`) |
| `scripts/marketing/video-automation/compose/buffer_publisher.py` | Buffer REST client (`POST /1/updates/create.json`), per-channel fan-out |
| `scripts/marketing/video-automation/compose/buffer_config.py` | Env loader (`BUFFER_ACCESS_TOKEN`, `*_PROFILE_ID`, `ORACLE_VIDEO_BUFFER_PUBLISH`) |
| `scripts/marketing/video-automation/compose/compose_916.py` | Orchestrator: Grok → english-check → Hyperframes render → Kokoro TTS → ffmpeg mux → Buffer |
| `scripts/marketing/video-automation/index_916.html` | 1080×1920 portrait composition |
| `scripts/post_produce_reel.py` (+ `--aspect 9x16`, `--narrative-source grok\|hardcoded\|json`) | Render pipeline wrapper |
| `scripts/tests/test_video_pipeline_831.py` | 10 unittest contracts (english-check ×3, Buffer config ×2, Buffer payload ×3, publish-gate ×1, Grok fallback ×1) — all PASS |
| `ops/hermes/create-video-pipeline-issue831.sh` | Cron-friendly thin wrapper |

### Tests run (executed)

`python3 scripts/tests/test_video_pipeline_831.py` →
10/10 PASS in 0.056s. Output captured in this proposal. No code
edit was required to satisfy #833.

### Residual risks / activation checklist (R10)

- `BUFFER_ACCESS_TOKEN` provisioned out-of-band; nothing in repo.
- `ORACLE_VIDEO_BUFFER_PUBLISH=0` (default OFF per PR #33 / `AGENT_ORCHESTRATION.md`).
- One manual test post to Buffer in a staging profile before live enable.
- Enzo Bit voice maps to current Kokoro default `ef_dora`
  (single-line change elsewhere if feedback requests different voice).

## Risk / rollback
- Risk: re-implementing #831 to satisfy #833 would violate R3 / R7
  / R10 (duplicated logic, contradictory patterns, blast radius on
  an already-audited merge). We chose closure-by-superset instead.
- Rollback: none required on `main` for #833. If a future change
  regresses the shipped pipeline, revert the offending commit;
  the #831 evidence above is the audit trail.
