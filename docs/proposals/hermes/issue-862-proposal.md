# Issue #862 Proposal: X-Scout v2 — foro active-research (anti-spam)

## Estado: IMPLEMENTADO
**Fecha:** 2026-05-25
**Owner:** Hermes-CEO (FCC implementation)
**Priority:** P1
**Verificado:** 2026-07-10

---

## Resumen del Problema

El publisher legacy (`oa-discord-research-publisher.py`) + `oa-worker` (loop 20s) republicaba el mismo informe en `#oa-research-live`.
Informes vacíos ("none met minimum", score 22/40) se publicaban igualmente.
State de Discord no se persistía al fallar el post → repeticiones infinitas.

---

## Cambios Implementados

### 1. `ops/hermes/oa-x-scout-discord.py` ✅
- Publisher dedicado para forum active-research
- Embeds ricos con título, thesis, candidatos, why_now, 48h PoC, links
- Hash dedup (SHA256, 16 chars)
- Cooldown configurable (default 2h via `OA_X_SCOUT_MIN_INTERVAL_SEC=7200`)
- State persistente inmediatamente tras Discord OK
- Filtro anti-spam: rechaza informes sin señal (`X_SCOUT_QUIET`, score <28, sin GitHub links)

### 2. `ops/hermes/oa-x-scout-run.py` ✅
- Prompt v2 con estructura MoA (3-pass synthesis)
- `X_SCOUT_QUIET` marker para ciclos sin señal
- Publica solo el `.md` del ciclo actual
- Modelo configurable via `OA_SCOUT_SYNTH_MODEL`

### 3. `ops/hermes/oa-worker.sh` ✅
- `OA_WORKER_PUBLISH_RESEARCH=false` por defecto
- `--exclude-glob "ai-radar-*.md"` excluye reportes X-Scout del worker
- Cooldown file para retry tras fallos

### 4. `ops/hermes/oa-discord-research-publisher.py` ✅
- Ya NO escanea `ai-radar-*` (sources explícitas sin ese patrón)
- Soporta `--exclude-glob` para filtros adicionales
- Persiste state INMEDIATAMENTE tras Discord OK (línea 382-383)
- Rechaza informes inútiles (is_useless_report)

---

## Configuración VPS Requerida (`~/hermes/config.env`)

```bash
# Forum active-research channel
DISCORD_RESEARCH_CHANNEL_ID=<ID_DEL_FORO_ACTIVE-RESEARCH>

# Habilitar publisher de X-Scout (publica solo si hay señal de calidad)
OA_RESEARCH_PUBLISHER_ENABLED=true

# Worker NO publica research (X-Scout owns ai-radar-*)
OA_WORKER_PUBLISH_RESEARCH=false

# Cooldown entre posts: 2 horas
OA_X_SCOUT_MIN_INTERVAL_SEC=7200
```

---

## Archivos Modificados/Creados

| Archivo | Acción |
|---------|--------|
| `ops/hermes/oa-x-scout-discord.py` | Creado/actualizado |
| `ops/hermes/oa-x-scout-run.py` | Creado/actualizado |
| `ops/hermes/oa-worker.sh` | Creado/actualizado |
| `ops/hermes/oa-discord-research-publisher.py` | Creado/actualizado |

---

## Verificación

```bash
# Test manual del ciclo X-Scout
bash ~/hermes/scripts/oa-x-scout-run.sh

# Ver logs
tail -30 ~/hermes/oa/logs/x-scout.log

# Ver estado del publisher
cat ~/hermes/oa/state/x-scout-discord.json
```

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| xAI credits agotados | Media | alto | Logs mostram error 403; requiere recarga |
| DISCORD_RESEARCH_CHANNEL_ID vacío | Alta | alto | Verificar config.env; publicar en channel correcto |
| Cooldown muy corto | Baja | medio | Default 2h; configurable via env |
| Duplicación si worker corre con publish=true | Alta | alto | worker usa `OA_WORKER_PUBLISH_RESEARCH=false` |

---

## Rollback

Si hay problemas:

```bash
# Deshabilitar publisher X-Scout
sed -i 's/OA_RESEARCH_PUBLISHER_ENABLED=true/OA_RESEARCH_PUBLISHER_ENABLED=false/' ~/hermes/config.env

# Habilitar worker research publishing si era necesario
sed -i 's/OA_WORKER_PUBLISH_RESEARCH=false/OA_WORKER_PUBLISH_RESEARCH=true/' ~/hermes/config.env

# Reiniciar worker
touch ~/hermes/oa/RUNNING
```

---

## Tests Ejecutados

1. Verificado que `oa-x-scout-discord.py` existe y tiene lógica anti-spam
2. Verificado que `oa-x-scout-run.py` genera `<!-- X_SCOUT_QUIET -->` en ciclos vacíos
3. Verificado que `oa-worker.sh` tiene `--exclude-glob "ai-radar-*.md"`
4. Verificado que `oa-discord-research-publisher.py` persiste state tras Discord OK
5. Config verificada en `~/hermes/config.env`

---

## Residuos/Riesgos Restantes

- **xAI API credits**: Último log muestra `permission-denied` por credits agotados. Requiere recarga.
- **DISCORD_RESEARCH_CHANNEL_ID**: Está vacío en config.env. Nico debe obtener el ID del canal forum.
- **Verificación de posting real**: No se probó el posting completo a Discord (solo simulación).

---

## Close Marker

Archivo: `docs/intake/2026-05-25-x-scout-v2-forum.done` ✅
Fecha: 2026-07-10 22:24 UTC