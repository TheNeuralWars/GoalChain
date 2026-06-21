# MAC_RELOAD_GBRAIN_REMINDER — Recargar Cursor y Antigravity (Mac)

**Status:** ready
**Priority:** P1
**Date:** 2026-06-21
**Owner:** hermes → Nico
**Cierra:** breve `2026-06-21-conectar-todo-gbrain-economy-assets.md` (item #4 del plan)

---

## 1. Estado actual (inspeccionado)

- VPS ya sincroniza **GBrain** desde el gateway CRM/Hermes (`bun gbrain serve` activo, dos PIDs, stdio MCP operativo). La `~/.gbrain/brain.pglite` de `/data/ubuntu/.gbrain/` está al día desde el **21-jun 09:10 UTC**.
- **Mac — Cursor y Antigravity**: los scripts `ops/hermes/install-gbrain-cursor.sh` y `ops/hermes/install-gbrain-antigravity.sh` ya escribieron sus configs (`~/.cursor/mcp.json` y `~/.gemini/config/mcp_config.json`). El **MCP no se activa hasta el reload del IDE**.
- **Sin reload**, las sesiones de Cursor/Antigravity en Mac consultan la pglite local stale (del **10/13-jun**). Las queries devuelven resultados viejos aunque el VPS esté actualizado.

## 2. Pasos para Nico (con orden y duración esperada)

| # | Acción | IDE | Tiempo esperado |
|---|--------|-----|-----------------|
| 1 | Cursor → `Cmd + Shift + P` → escribir `Developer: Reload Window` → `Enter` | Cursor | ~5 s |
| 2 | Cerrar el IDE y volver a abrirlo (`Cmd + Q` + relanzar desde Dock/Applications) | Antigravity | ~20–60 s |

---

## 3. Verificación post-reload

Después del reload, dentro del chat de Cursor **o** Antigravity, escribir la siguiente query en lenguaje natural:

```text
gbrain query "GoalChain Mundial 2026 scope"
```

**Resultado esperado (OK):** el agente responde citando al menos un archivo de `docs/intake/` fechado **≥ 2026-06-21** (por ejemplo `MAC_RELOAD_GBRAIN_REMINDER.md` o `2026-06-21-conectar-todo-gbrain-economy-assets.md`).

**Resultado con error — qué significa:**

| Síntoma | Causa probable | Acción |
|---------|---------------|--------|
| `gbrain: tool not found` o `MCP server not connected` | El reload no se ejecutó, o el IDE arrancó antes que `gbrain serve` | Cerrar Antigravity, en terminal Mac correr `gbrain serve &`, reabrir el IDE |
| Resultados datados del 10/13 de junio | El `~/.gbrain/` Mac está stale | Correr la ritual del §4; volver a recargar el IDE |
| `connection refused` 127.0.0.1:3131 | Cursor/Antigravity apunta al VPS y no hay túnel levantado | En el VPS: `bash ops/hermes/install-gbrain-cursor.sh` para apuntar de nuevo al `gbrain serve` local |

---

## 4. Procedimiento futuro (post `git pull` en Mac)

Después de cada `git pull origin main` en la Mac, **antes** de abrir Cursor o Antigravity:

```bash
cd /path/to/GoalChain
bash ops/hermes/sync-gbrain.sh mac-cursor
bash ops/hermes/sync-gbrain.sh mac-antigravity
```

> Ambos comandos son **idempotentes**. El script detecta `uname -s = Darwin`, hace `git pull --ff-only` y corre `gbrain import ai_context docs/intake docs/proposals` contra `~/.gbrain/` local. Si lo corrés desde el VPS, el script va a loguear `NOT-LOCAL — skipping` (no es un error; sigue correctamente la regla "no SSH cross-host").

Atajo opcional (alias recomendado añadir a `~/.zshrc` en Mac):

```bash
alias refresh-gbrain="bash ~/Path/GoalChain/ops/hermes/sync-gbrain.sh mac-cursor && bash ~/Path/GoalChain/ops/hermes/sync-gbrain.sh mac-antigravity"
```

---

## 5. Documentar este reminder como referencia

- **Este archivo (`docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md`)** queda como referencia canónica en el repo. Se referencia desde:
  - breve upstream `docs/intake/2026-06-21-conectar-todo-gbrain-economy-assets.md` (plan de cierre).
  - skill `goalchain-hermes-ops` cuando se publique la próxima actualización.
- Si en el futuro cambian los flags de `ops/hermes/sync-gbrain.sh` (por ejemplo se agrega `mac-all` o se renombra el cerebro local), regenerar este brief por PR de docs.
- **Tono**: español directo. Audiencia = Nico.
- **Modificar este archivo** sólo si:
  1. Cambia el hot-reload path de Cursor o Antigravity.
  2. Cambia `ops/hermes/sync-gbrain.sh`.
  3. Cambia la ruta de PGLite (`~/.gbrain/`).
  4. La verificación post-reload deja de ser un buen sentinel (porque los archivos en `docs/intake/` dejan de actualizarse).

---

## 6. Referencias

- `ops/hermes/sync-gbrain.sh` — script multi-target (commit `e09cccaf`, issue #813).
- `ops/hermes/install-gbrain-cursor.sh` — installer Cursor (configura `~/.cursor/mcp.json`).
- `ops/hermes/install-gbrain-antigravity.sh` — installer Antigravity (configura `~/.gemini/config/mcp_config.json`).
- `docs/intake/2026-06-21-conectar-todo-gbrain-economy-assets.md` — brief upstream (item #4).
- `docs/intake/2026-05-24-hermes-gbrain-copilot-setup.md` — setup GBrain inicial (Cursor + Antigravity).
- `ai_context/AGENT_ORCHESTRATION.md` — orquestación multi-agente, modos, owners.
- GBrain upstream: <https://github.com/garrytan/gbrain>

---

## 7. Estado y cierre

- **Status actual:** `ready`.
- **Cierre:** cuando Nico confirme que Cursor **y** Antigravity devuelven resultados recientes en `gbrain query "GoalChain Mundial 2026 scope"`. Marcamos `done` con el comentario de Nico en este archivo o en #814.
- **Owner del cierre:** hermes (vuelve a verificar gbrain y, si lo confirmás, cambia `Status: ready → done`).
