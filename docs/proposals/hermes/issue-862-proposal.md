# Issue #862 — X-Scout v2: foro active-research (anti-spam)

## Estado: EN PROGRESO

## Análisis de Requisitos

### Problema Original
- Publisher legacy republicaba mismo informe en `#oa-research-live` cada 20s
- Informes vacíos ("none met minimum", score 22/40) se publicaban
- State de Discord no se persistía → repeticiones infinitas

### Solución Requerida

| Pieza | Requisito | Estado Actual |
|-------|-----------|---------------|
| `oa-x-scout-discord.py` | Publisher dedicado: embeds, foro, hash dedup, cooldown 2h, state inmediato | ✓ Implementado |
| `oa-x-scout-run.py` | Prompt v2, `X_SCOUT_QUIET` si no hay señal, publica solo el `.md` del ciclo | ⚠️ Repo desactualizado vs VPS |
| `oa-worker.sh` | `OA_WORKER_PUBLISH_RESEARCH=false` por defecto; excluye `ai-radar-*.md` | ✓ Implementado |
| `oa-discord-research-publisher.py` | Ya no escanea `ai-radar-*`; persiste state tras Discord OK | ✓ Implementado |

## Cambios Necesarios

### 1. `oa-x-scout-run.py` — Sync con VPS

El VPS tiene una versión más nueva con:
- `OA_SCOUT_SYNTH_MODEL` configurable (default: grok-3)
- `OA_SCOUT_STRATEGY_DEPTH` (novice/expert/world-class)
- Prompt mejorado con 3-pass MoA draft
- Estructura de output más robusta

### 2. Verificación de archivos existentes

Todos los archivos principales ya implementan los requisitos:
- Hash dedup: ✓ `content_hash()` en oa-x-scout-discord.py:56-58
- Cooldown 2h: ✓ `OA_X_SCOUT_MIN_INTERVAL_SEC=7200` en config
- State inmediato: ✓ `save_state()` después de Discord OK
- `is_quiet_or_useless()`: ✓ Filtra reports vacíos
- Exclusion `ai-radar-*`: ✓ En oa-worker.sh:74 y oa-discord-research-publisher.py:46

## Plan de Implementación

1. [ ] Sincronizar `oa-x-scout-run.py` del VPS al repo
2. [ ] Verificar que todos los filtros anti-spam funcionan correctamente
3. [ ] Ejecutar tests de verificación
4. [ ] Commit a main (cambio urgente)

## Test Commands

```bash
# Test del runner
bash ~/hermes/scripts/oa-x-scout-run.sh

# Ver logs
tail -30 ~/hermes/oa/logs/x-scout.log

# Verificar state file
cat ~/hermes/oa/state/x-scout-discord.json
```

## Riesgos y Rollback

### Riesgos
- Ninguno crítico identificado. Los cambios son additive (nuevos env vars con defaults).

### Rollback
- Git revert del commit correspondiente
- Los cambios en config.env no son necesarios (defaults ya establecidos)

## Archivos a Modificar

- `ops/hermes/oa-x-scout-run.py` — Sync con VPS (modelo configurable, strategy depth, prompt mejorado)

## Owner
Hermes (FCC) — Implementación directa a main