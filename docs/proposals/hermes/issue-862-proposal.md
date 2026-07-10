# Issue #862 — X-Scout v2: anti-spam forum active-research
**Agent:** hermes (FCC, DIRECT MAIN — cambio urgente keyword presente)
**Date:** 2026-07-10
**Status:** in_progress

---

## Resumen del problema

1. `oa-discord-research-publisher.py` (legacy) + `oa-worker` (loop 20s) republicaban el mismo informe en `#oa-research-live`.
2. Informes vacíos ("none met minimum", score 22/40) se publicaban igualmente.
3. State de Discord no se persistía si fallaba el post a X → repeticiones infinitas.

---

## Análisis: estado actual de cada pieza

| Pieza | Estado | Hallazgo |
|-------|--------|----------|
| `oa-x-scout-discord.py` | ✅ Ya v2 | Hash dedup, cooldown 2h, state inmediato post-Discord OK, `is_quiet_or_useless()` (marcadores "none met minimum", score 22/40, sin github.com). |
| `oa-x-scout-run.py` | ⚠️ Casi v2 | Escribe el `.md` con `<!-- x_scout_quiet -->` cuando Grok marca silencio PERO siempre llama al publisher si `OA_RESEARCH_PUBLISHER_ENABLED=true`. FALTA el gate `X_SCOUT_QUIET` antes de llamar al publisher. |
| `oa-worker.sh` | ✅ Ya v2 | `OA_WORKER_PUBLISH_RESEARCH=false` por defecto + `--exclude-glob "ai-radar-*.md"`. |
| `oa-discord-research-publisher.py` | ✅ Ya v2 | `build_sources()` ya NO incluye `ai-radar-*`. State persiste inmediatamente post-Discord OK. |
| `config.env.example` | ✅ Ya v2 | `OA_RESEARCH_PUBLISHER_ENABLED=true`, `OA_X_SCOUT_MIN_INTERVAL_SEC=7200`, `OA_WORKER_PUBLISH_RESEARCH=false` documentados. |

---

## Cambio requerido (1 archivo, 1 cambio)

### `ops/hermes/oa-x-scout-run.py` — agregar gate X_SCOUT_QUIET antes de publish

**Ubicación:** función `main()`, después de `out.write_text()` y antes de `publish_to_discord(out)`.

**Lógica:**
```python
# Si Grok marcó el ciclo como silencioso, no llamar al publisher.
quiet_marker = "<!-- x_scout_quiet -->"
if quiet_marker in body.lower():
    print(f"x_scout: skip discord (X_SCOUT_QUIET — no signal this cycle)")
    return 0
```

**Justificación:** Grok ya genera `<!-- X_SCOUT_QUIET -->` cuando no hay candidatos con score ≥ 28 Y con repo GitHub + prueba X. El publisher `oa-x-scout-discord.py` tiene `is_quiet_or_useless()` pero el gate correcto es a nivel de `oa-x-scout-run.py` para evitar la llamada RPC innecesaria cuando sabemos de antemano que no hay señal.

---

## Archivos a tocar

| Archivo | Acción |
|---------|--------|
| `ops/hermes/oa-x-scout-run.py` | patch — agregar gate `X_SCOUT_QUIET` antes de `publish_to_discord()` |

---

## Riesgos y regresiones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| El gate filtra ciclos con señal legítima que no tienen `<!-- x_scout_quiet -->` | Baja — Grok agrega el marcador sistemáticamente cuando no hay candidatos | Verificado en prompt de `grok_synthesize()`: "Output ONLY: # GoalChain AI Radar — {ts}\n<!-- X_SCOUT_QUIET -->" |
| Se rompe el publish para ciclos CON señal | Muy baja — gate solo activa cuando el marcador está presente | Test: `python3 oa-x-scout-run.py` en dry-run (OA_RESEARCH_PUBLISHER_ENABLED=false o con X_SCOUT_QUIET en cuerpo) |
| Retrocompatibilidad con despliegues existentes | Ninguna — el gate es adicional, no destructivo | Solo filtra ciclos silenciosos; ciclos normales publican igual |

**Rollback:** `git revert` del commit que agrega el gate. El publisher `oa-x-scout-discord.py` tiene `is_quiet_or_useless()` como segunda línea de defensa.

---

## Test commands

```bash
# 1. Syntax check
python3 -m py_compile ops/hermes/oa-x-scout-run.py && echo "syntax OK"

# 2. Dry-run (no publish, solo genera .md)
OA_RESEARCH_PUBLISHER_ENABLED=false bash ops/hermes/oa-x-scout-run.sh

# 3. Log inspection
tail -30 ~/.hermes/oa/logs/x-scout.log

# 4. Verificar que el gate funciona con cuerpo marcado como quiet
python3 -c "
body = '''# GoalChain AI Radar — 2026-07-10-1200
<!-- x_scout_quiet -->
No candidates reached minimum threshold.
'''
quiet_marker = '<!-- x_scout_quiet -->'
print('PASS: gate fires' if quiet_marker in body.lower() else 'FAIL')
"
```

---

## Owner
Hermes (implementación) → Antigravity (review/merge)