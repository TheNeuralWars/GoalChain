# X-Scout v2 — foro active-research (anti-spam)

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/256
- **Task Status:** ready

- **Date:** 2026-05-25
- **Status:** done
- **Owner:** Cursor (draft) / Antigravity merge

## Problema

- El publisher legacy (`oa-discord-research-publisher.py`) + `oa-worker` (loop 20s) republicaba el mismo informe en `#oa-research-live`.
- Informes vacíos ("none met minimum", score 22/40) igual se publicaban.
- State de Discord no se persistía si fallaba el post a X → repeticiones infinitas.

## Solución

| Pieza | Cambio |
|-------|--------|
| `oa-x-scout-discord.py` | Publisher dedicado: embeds, foro, hash dedup, cooldown 2h, state inmediato |
| `oa-x-scout-run.py` | Prompt v2, `X_SCOUT_QUIET` si no hay señal, publica solo el `.md` del ciclo |
| `oa-worker.sh` | `OA_WORKER_PUBLISH_RESEARCH=false` por defecto; excluye `ai-radar-*.md` |
| `oa-discord-research-publisher.py` | Ya no escanea `ai-radar-*`; persiste state tras Discord OK |

## Config VPS (`~/hermes/config.env`)

```bash
DISCORD_RESEARCH_CHANNEL_ID=<ID del foro active-research>
OA_RESEARCH_PUBLISHER_ENABLED=true
OA_WORKER_PUBLISH_RESEARCH=false
OA_X_SCOUT_MIN_INTERVAL_SEC=7200
```

## Verificación

```bash
bash ~/hermes/scripts/oa-x-scout-run.sh
tail -30 ~/hermes/oa/logs/x-scout.log
```

Esperado: un hilo nuevo en active-research como máximo cada 2h, solo si hay candidato con repo GitHub + enlace X.
