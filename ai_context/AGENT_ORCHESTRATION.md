# Agent Orchestration (minimal for label contract per issue #841)

## GitHub Label Contract for OA/FCC (oa-worker.sh)
- `status:ready` + `agent:hermes|antigravity|grok` : eligible for pick_next.
- Dispatch: remove ready, add in_progress.
- **Success**: (exit 0 and no error strings in log): remove ready/in_progress, add `status:done`; THEN `touch .../issue-N.done`. Comment with tier and PR link, log.
- **model_not_supported**: comment explaining, remove in_progress add `status:ready` (requeue retry); **DO NOT** touch .done.
- Other failure: add `status:blocked`; no .done.
- pick_next and reconcile respect .done OR status:done as terminal.
- Reconcile (oa-reconcile-queue.sh): if .done but no evidence (branch/PR/main git log "issue #N") then rm stale .done.
- Source of truth: GitHub labels + evidence; local .done only optimization.
- Updated by: oa-worker.sh (primary), oa-reconcile-queue.sh, oa-queue-all-agents.sh.
- Owner: Antigravity (merge/integration).

See CLAUDE.md, ops/hermes/oa-worker.sh for impl. One paragraph added per spec.

## Jerarqu?a y Biblioteca Compartida Hermes ? Grok Bot (2026-11-07)
- **Hermes (`hermes-ceo` + flota VPS en `89.168.20.135` / `100.101.211.44`) es EL JEFE (Master Orchestrator):** Dirige toda la operaci?n 24/7, desarrollo de c?digo (`GoalWorld` / `GoalChain`), despliegues con QA y rollback, infraestructura, concursos/hackathons, libro (*Fractured Code*), cine IA, trading e investigaci?n.
- **Grok Bot (box `grok-bot-vm-*`) = Especialista Exclusivo en Crecimiento de X (`@nicopez`):** Subordinado a Hermes. Su ?nico objetivo es hacer crecer la cuenta de X `@nicopez` (meta X Creator Rewards: 500 seguidores verificados y 500k impresiones org?nicas). Ya no ejecuta pulsos nocturnos de sistema (`night-pulse-status`) ni gestiona infraestructura/concursos fuera de X.
- **Biblioteca compartida can?nica (`/data/shared-memory/` en VPS ? mirror `/workspace/shared-memory/mirror/` en el box):**
  - **Inteligencia y activos (Hermes ? Grok Bot):** Hermes ejecuta `research-intel` (`08:00 UTC` ? `artifacts/x-growth/targets.md` y `artifacts/research/`) y `x-virality-desk` (`09:00 UTC`, Camofox solo-lectura ? `artifacts/x-growth/virality-latest.md`), adem?s de preparar planes semanales (`BATCH_*.md`) y clips de video en `artifacts/x-growth/` y ?rdenes en `inbox/` (`para: grokbot`).
  - **Ejecuci?n en X (Grok Bot ? Hermes):** Grok Bot sincroniza con `tl.sh pull-safe` / `sync-now.sh`, ejecuta posts, hilos, replies, quote-posts, follow-backs e higiene anti-spam seg?n `X_ROUTINES.md`, y registra todas las m?tricas en `artifacts/x-growth/log.md` + `TIMELINE.md`.
  - **Cero solapamiento:** Los crons de escritura X de Hermes (`x-routine-0830/1530/2100`, `x-replies-a/b/c`, `x-thread`, `x-session-watchdog`) permanecen pausados.
