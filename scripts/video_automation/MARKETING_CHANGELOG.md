# Marketing Pipeline CHANGELOG

Hermes Manager is the canonical owner of `scripts/video_automation/` since
2026-06-24. Every change to any file in this folder MUST add an entry here
before merging to `main`.

## [2026-06-24] — Hermes Manager · Bloque A+B+C+D
- **A. Higiene**
  - `BUFFER_TOKEN` + `BUFFER_ORG_ID` movidos a `.env` (creado `.env.example`).
  - Removida variable residual `VPS_HOST = "ubuntu@89.168.20.135"` y rama SSH
    Hetzner en `grok_super_pipeline.py`, `trend_researcher.py`,
    `schedule_optimizer.py` (security theatre fix on issue family #828).
  - `data/marketing_pipeline/*.mp4`, `*.png`, `daemon_status.json`,
    `schedule_preview.json`, `logs/` añadidos a `.gitignore`. Source of truth
    = filesystem + `reconstruct_runs.py`.
  - `ai_context/marketing_strategy_and_architecture.md` commiteado (8K, walk
    a Vigo para Antigravity).
  - `scripts/video_automation/output/` ahora es symlink al directorio real de
    outputs (fix del bug de "no existe directorio output" del walkthrough).
  - Saneado `runs.json`: 1 run `generating` stuck → `failed`.

- **B. Robustez de pipeline**
  - Per-invocation lock en `/home/ubuntu/.grok/sessions/.hermes_locks/` para
    evitar que dos procesos paralelos borren los outputs del otro.
  - Empty-prompt rechazado en `generate_image_on_vps` y
    `generate_video_on_vps` (corrige bug "Grok recibe prompt vacío").
  - Cost guard `MAX_GROK_GENERATIONS_PER_DAY` (default 40) → bloquea el
    pipeline si excede el presupuesto del día. Persiste en
    `cost_guard.json`.
  - `pipeline_daemon.main()` ahora corre `reconstruct_runs.main()` +
    `_prune_stuck_generating()` al arrancar (self-heal).
  - `time.sleep(1)` tras Grok antes del `find` para sincronizar FS.

- **C. Marketing-stack**
  - 5 módulos nuevos:
    - `ab_tester.py` — 3 hook variants (question / contrarian / prohibition)
      + 3 CTA variants (link_bio / urgency / social_proof) asignados
      round-robin determinístico por (account, day).
    - `story_arc.py` — agrupa runs en series de 2-4 episodes por account.
      Detox automático después de 14 días sin episode.
    - `hashtag_researcher.py` — 4-6 tags mezclando brand fijo + LATAM
      discovery + player hint, sin repetir el set completo entre runs.
    - `quality_scorer.py` — pre-flight check (post_text length, hook length,
      prompts presentes). Warn-only; nunca bloquea.
    - `captions_burnin.py` — render ffmpeg drawtext. Detecta `ffmpeg`
      automáticamente; OFF por defecto, opt-in via `CAPTIONS_ENABLED=true`.
  - `grok_super_pipeline.run_pipeline()` envuelve prompts + post_text con
    A/B + arc + hashtags, registra `hook_variant`, `cta_variant`,
    `story_arc_id`, `episode`, `hashtags`, `quality_score`, `captions_render`
    en cada `runs.json` run.

- **D. Operación a largo plazo**
  - `pipeline_health.py` — endpoint one-shot para inspeccionar heartbeat,
    queue counts, cost guard, último refill, última publish. Ver
    `MARKETING_README.md`.

## [Earlier, by Antigravity — 2026-06-22/23]
- Smart scheduling engine (`schedule_optimizer.py`)
- Auto-refill daemon cycle (`pipeline_daemon.py`)
- Pipeline Grok base (`grok_super_pipeline.py`)
- Trend researcher HCMT (`trend_researcher.py`)
- Reconstructor from filesystem (`reconstruct_runs.py`)
- Webapp dashboard `MarketingControlCenter.tsx`
- facade `grok_super_pipeline.py` restricted image search path to
  `~/.grok/sessions/` (fix repeated image bug)
- Caption normalization hot-fix `normalize_prompts`
