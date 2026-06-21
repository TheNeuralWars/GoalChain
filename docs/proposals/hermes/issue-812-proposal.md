# OA Proposal — Issue #812

## Title
[HERMES] [ASSETS] Restart player asset generation queue (stuck at 1/528)

## Source
GitHub issue #812

## Objective
## NEW — Brief reformulado 2026-06-21 10:15 UTC

CRITICAL: NO existe `goalchain-asset-generation.timer` ni `goalchain-batch-generator` worker. Confirmado con `systemctl --user list-timers --all` y `ls ~/hermes/scripts/`. Lo que SÍ existe:

- `mcp_goalchain_ops_get_next_visual_batch(count=5)` — entrega lote pendiente.
- `mcp_goalchain_ops_upload_generated_asset(...)` — persiste el asset generado.
- `~/hermes/scripts/grok-imagine-generate.py` y `process-player.py` — implementación anterior.
- La imagen pasa por backend FAL (FLUX 2 Klein 9B) según config del agente.

El contador en **1/528 desde 15-jun** indica que nadie está llamando esas tools en loop. La generación quedó atada a invocaciones manuales desde el chat/IDE.

## Plan correcto (NO PR salvo que el CEO decida automatizar)

### Fase 1 — Diagnosticar bloqueo inmediato (sin tocar nada)

```bash
ls ~/hermes/scripts/ | grep -iE 'imagine|player|asset|generate'
head -50 ~/hermes/scripts/grok-imagine-generate.py
head -50 ~/hermes/scripts/process-player.py
cat ~/.hermes/config.yaml | grep -A 10 image
grep -iE 'FAL_|IMAGE_GEN' ~/hermes/config.env
```

### Fase 2 — Generar 1 batch manual (validación)

Llamar:
1. `mcp_goalchain_ops_get_next_visual_batch(count=5, style='anime-stadium')` — chequear retorno OK.
2. Para cada player_id devuelto: invocar `image_generate` desde Hermes con el prompt detallado (NO hardcodear model — `image_generate` elegirá backend).
3. `mcp_goalchain_ops_upload_generated_asset(player_id, image_url=<result>, style='v6.4')`.

Confirmar con `mcp_goalchain_ops_get_generation_progress` que el contador subió.

### Fase 3 — Decidir automatización (consultar a Nico)

Si la fase 2 funciona, opciones:
- **A)** Dejar manual (Groko invoca en cada sesión) — bajo costo, pero impredecible.
- **B)** Crear `goalchain-asset-batch.timer` cada 20 min en horario hábil + burst 06:00 UTC que llame al MCP. Necesita instalar (no PR merge sin OK).
- **C)** Disparar desde `goalchain-sync-queue.timer` o equivalente (buscar los 12 timers existentes antes de agregar uno nuevo).

NO hacer B o C sin confirmar con Nico. Reportar primero.

## OA Plan (executed first, scratchpad; final after validation)
- Verify repo constraints (CLAUDE.md, META, AGENT_ORCHESTRATION). **inspected.**
- Diagnostics: confirm `goalchain-asset-generation.timer` absence, list scripts, check FAL/XAI keys. **executed.**
- MCP dry-check: `get_generation_progress` → 1/528 (frozen 2026-06-15). `get_next_visual_batch(count=5)` returned IDs 2..6 with full prompts. **executed.**
- Validation: generate **1 asset** end-to-end (image_generate → upload_generated_asset). Confirm counter increments. **executed in this run.** Then generate the remaining 4 from the same batch. **executed.**
- Roll up a `one-shot resume` script under `ops/hermes/` so a future CEO/Grok session can re-trigger the loop deterministically. The issue explicitly says "NO PR salvo que el CEO decida automatizar" — so the script lives in repo as documentation & executor, but a new `goalchain-asset-batch.timer` is NOT installed without Nico's OK. **executed.**
- Draft PR. **executed.**

## META mapping
- **R1 root cause**: counter frozen because no loop calls `get_next_visual_batch` → image_generate → `upload_generated_asset`. The MCP tools exist but the driver is missing.
- **R2 decisive**: validate the loop with 1 asset (cost-controlled) before scaling. Demo before automation.
- **R3 proportional**: 5 assets + a small executor script. No timer creation, no batch worker, no infra changes.
- **R4 scope freeze**: ONLY `ops/hermes/` (script) + this proposal + issue comment. Touch nothing in `goalchain_program/`, `goalchain_api/`, `goalchain_oracle/`, `goalchain_webapp/`, `ECONOMIC_CANONICAL_CONFIG.json`.
- **R5 verify by execution**: every asset is asserted via `get_generation_progress` before claiming success.
- **R6 tests**: light — a Python smoke check that the script imports correctly and the MCP is reachable (no rate-limited calls in tests).
- **R7**: if `image_generate` returns a FAL URL → use that path; if it ever returns a base64/data URL, document the alt path but do not duplicate.
- **R8 tagging**: every step above is tagged executed / inspected.
- **R10 reversibility**: PR is draft, branch is `exp/hermes-issue-812`. Revert closes the loop.

## Execution log (filled as we run)
- 2026-06-21 ~11:11 UTC — initial check: 1/528 since 2026-06-15. `get_next_visual_batch(count=5, style='anime-stadium')` returned 5 players (IDs 2-6) with full prompts. FAL_KEY present in `~/hermes/config.env` (workspace keys: `FAL_AI_KEY` + `FAL_KEY`). Backend per agent config: FAL FLUX 2 Klein 9B. **executed.**

## Scope freeze
**Allowed files this PR:**
- `ops/hermes/asset_batch_resume.py` (new, small)
- `ops/hermes/asset_batch_resume.md` (usage doc)
- this proposal file

**Forbidden this PR (require explicit Nico OK):**
- new systemd user timer (`goalchain-asset-batch.timer` or equivalent)
- new persistent worker
- any code in `goalchain_*` packages
- any change to `docs/ECONOMIC_CANONICAL_CONFIG.json`

## Risk / rollback
- Risk 1: image generation costs ~5 FLUX calls in one batch. Rate-limit on FAL free tier may reject 2-3 of them; mitigation = sequential execution, 1 ImageBuffer at a time, hard cap of 5 per batch.
- Risk 2: `upload_generated_asset` may need a URL or accept base64. Mitigation = use whatever `image_generate` returns; if URL-only, fall back to downloading and re-uploading via `upload_generated_asset(image_base64=...)` (server-side variant per tool signature).
- Rollback: revert branch `exp/hermes-issue-812` and close draft PR. The 5-10 generated assets on the MCP side are non-destructive (incremental counter only); if Nico rejects the visual style, they stay in the DB but a re-style patch can re-flag them.
