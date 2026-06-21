# Recordatorio Nico — Decisiones bloqueantes (issues #811 y #812)

**Date:** 2026-06-21 10:25 UTC
**Author:** Manager
**Status:** necesito tu OK antes de cerrar #811/#812

---

## 1. Threshold de mint_gate (issue #811)

`mcp_goalchain_ops_goalchain_ops_status.mint_gate` está en `allow:false, ratio_burn_over_emit: 0.116, reason: "Burn/emit ratio below 0.85. Pause mint for 48h and increase sink pressure."` desde hace 48h.

Pregunta concreta:
- ¿El umbral correcto sigue siendo **0.85** (configurado en `docs/ECONOMIC_CANONICAL_CONFIG.json`)?
- ¿O querés que mantengamos el 0.85 pero extendamos el cooldown (lo cual requería tocar la lógica de gobernanza del mint gate)?

Si me decís "0.85 está bien, dejá", no cambio nada — solo documento en el issue.
Si querés cambiar a otro valor (0.5, 1.0, etc.) puedo abrir issue aparte con el cambio al canonical config.

---

## 2. Live mode de vault_crank (issue #811)

Hoy `vault_crank.mode: dry-run`, `stale: true` desde 15-jun. Quiere decir que cualquier buyback/burn se calcula pero NO se ejecuta on-chain. Vamos a tener 32.7 SOL de exceso esperando + 19.62 SOL de buyback sugerido + 353160 GCH estimado a quemar.

Pregunta concreta:
- ¿Activamos `mode: live` y dejamos que el MCP worker ejecute real on-chain al próximo trigger?
- ¿O mantenemos dry-run hasta validar el threshold nuevo del punto 1?

**Default que tomé (sin tu OK no lo cambio)**: dejar dry-run, identificar el path para volver a live cuando vos confirmes.

---

## 3. Automatización de la cola de assets (issue #812)

Encontré que el contador 1/528 está congelado porque nadie llama `mcp_goalchain_ops_get_next_visual_batch` + `upload_generated_asset` en loop. Hoy depende de invocación manual de Grok.

Tres opciones:

**Opción A — Mantener manual** (status quo). Bajo costo, pero impredecible. Si vos abrís el chat y pedís assets, aparecen. Si no, no.

**Opción B — Cron nuevo `goalchain-asset-batch.timer`** cada 20 min en horario hábil (08:00–22:00 UTC) + burst 06:00 UTC de 30 assets. Predecible, ~€X/día de FAL (no puedo calcular exacto sin saber el plan). NECESITA TU OK para instalar el timer.

**Opción C — Disparar desde `goalchain-sync-queue.timer`** (uno de los 12 timers existentes, sin agregar nuevo unit). Más limpio, reutiliza infraestructura. Verificar primero que ese timer tenga ciclos disponibles y aceptar que comparte cuota.

Mi recomendación: **C si hay capacidad, fallback B si no, default A si querés conservar control manual**. Pero necesito tu OK concreto para B o C.

---

## 4. Cosas que voy a hacer sin tu OK (autónomas, scribbles)

- Brief de audit cron resultado (#815) — voy a ejecutarlo igual.
- Crear `ops/hermes/gbrain-vacuum.service` + timer mensual (#816, nuevo) — no toca datos, sólo VACUUM/REINDEX de pglite. Ver abajo.
- `sync-gbrain.sh` (#813) — script puro, no toca gbrain funcional.
- MAC_RELOAD_GBRAIN_REMINDER.md (#814) — sólo docs/intake, sin código.

---

## 5. Chequeo de salud actual (snapshot del VPS, 2026-06-21 10:21 UTC)

- pglite: 75 MB, sin riesgo OOM.
- RAM libre: 16 GB.
- Disk `/data` 160 GB libres / `/` 4.6 GB libres (90% used — pero gbrain vive en /data, fuera de peligro).
- 12 timers systemd --user activos, 1 worker MCP `goalchain-ops` corriendo, gateway hermes OK.
- FAL backend configurado (FLUX 2 Klein 9B).

---

## Acción esperada de tu parte

Respondeme en #hermes o acá:
1. 0.85 OK / cambiar a otro valor / N/A.
2. live mode ON / mantener dry-run.
3. Asset automation A / B / C.

Mientras espero, sigo con los issues #813, #814, #815, #816 que no dependen de tu decisión.
