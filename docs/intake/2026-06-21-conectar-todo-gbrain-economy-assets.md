# Brief — Conectar todo y dejarlo funcional (GBrain + economy cron + assets)

**Date:** 2026-06-21 10:08 UTC
**Author:** Manager (Grok on Hermes VPS)
**Scope:** destrabar GBrain, destrabar economía/vault cron, y destrabar la generación de los 528 player assets antes del Mundial MVP.
**Auto-encode:** `agent:hermes`

---

## TL;DR

GBrain como servicio de memoria institucional ya está **instalado y respondiendo en el VPS**, pero hay 5 brechas que:

1. lo dejan **sin mantener** desde el lado Mac (Cursor/Antigravity configurados pero sin reload → nunca consultan)
2. tienen la **economía en modo dry-run** desde el 15-jun (vault_crank stale, mint_gate paused)
3. tienen **1/528 assets generados** desde el 15-jun (gen pipeline congelado)
4. no hay **script de sync reproducible** entre Mac ↔ VPS

Resultado hoy: la “memoria institucional” funciona local en el VPS, pero los tres IDEs (Cursor Mac, Antigravity Mac, y cualquier GH Action sin VPN) están stale; y la economía opera en modo fantasma.

---

## Lo que YA está OK (no tocar)

- `bun /home/ubuntu/.bun/bin/gbrain serve` — 2 PIDs activos, stdio MCP funcionando, `gbrain query`, `gbrain import`, `gbrain think` disponibles.
- Data dir `/data/ubuntu/.gbrain/` con `brain.pglite/` (PGLite), `audit/`, `migrations/`, `last-update-check` actualizado hoy 09:10.
- MCP registrado en `~/.hermes/config.yaml` (mcp_servers.gbrain).
- Mac: scripts `install-gbrain-cursor.sh` + `install-gbrain-antigravity.sh` ejecutados; configs `.cursor/mcp.json` y `~/.gemini/config/mcp_config.json` apuntan a `gbrain serve` (verificación pendiente tras reload IDE).

## Las 5 brechas (de mayor a menor impacto)

**P0 · Brecha 1 — Vault crank stale desde 15-jun (6 días)**
- Estado on-chain `goalchain_ops_status` → `vault_crank.stale: true`, `mode: dry-run`, `excess_sol: 32.7`, `estimated_gch_burned: 353160`, `buyback_sol: 19.62`.
- Implicancia: economy_daemon no corre o falló. La presión de sink prometida en `docs/ECONOMIC_CANONICAL_CONFIG.json` nunca se ejecutó.
- Acción: verificar si `goalchain-economy-crank.timer` está activo. Si lo está y falló, leer el log (`journalctl -u goalchain-economy-crank --since "7 days ago"`). Resolvelo y volver a habilitar `live` mode solo cuando NICO confirme (risky flag en canonical config).

**P0 · Brecha 2 — Mint gate paused 48h por ratio 0.116**
- Estado: `mint_gate.allow: false`, `ratio_burn_over_emit: 0.116` (umbral 0.85). Lleva 48h en pause. Verificar si esta restricción sigue siendo la correcta o si el threshold cambió en una propuesta reciente.
- Acción: confirmar threshold en `docs/ECONOMIC_CANONICAL_CONFIG.json`. Si está OK, no tocar. Si está mal, abrir issue con Nicolás antes de cambiarlo.

**P1 · Brecha 3 — Player assets 1/528 (0.19%)**
- Estado: `get_generation_progress` → 1 generated / 528 total, `last_updated` 15-jun (6 días congelado).
- Implicancia: bloquea toda la capa visual del Mundial MVP. No hay pipeline activo.
- Acción: verificar `goalchain-asset-generation.timer` y/o `goalchain-batch-generator` worker. Re-arrancar la cola con `mcp_goalchain_ops_get_next_visual_batch(count=5)`. Si falla por provider keys, alertar a Nico (FAL key vigente o no).

**P0 · Brecha 4 — Cursor/Antigravity Mac nunca recargan GBrain**
- Estado: configs escritas (`.cursor/mcp.json`, `~/.gemini/config/mcp_config.json`) pero MCP sólo se carga al arrancar el IDE. Si Nico no reinició Cursor/Antigravity desde que corrimos los installers (10 jun y 13 jun respectivamente), sus sesiones activas no ven `gbrain`.
- Acción: confirmar con Nico si reinició; si no, generar un reminder + un alias `refresh-mcp` que pueda correr desde la terminal Mac para forzar reload. Cada IDE tiene su mecanismo (Cursor = `Cmd+Shift+P → "Reload Window"`, Antigravity = restart IDE).

**P1 · Brecha 5 — No existe script de sync Mac ↔ VPS**
- Estado: cada host tiene su `~/.gbrain/`. Hoy se actualiza “a mano” con `gbrain import ai_context docs/intake`. No es CI, no es cron.
- Acción: crear `ops/hermes/sync-gbrain.sh` que parametrizado corre `git pull + gbrain import` para VPS, Mac (Cursor) y Mac (Antigravity). Y registrarlo en la skill `goalchain-hermes-ops`.

---

## Arquitectura target (post-fix)

```
      ┌────────────────────────────────────┐
      │  VPS — Hermes Manager (este host)  │
      │  ~/.gbrain (PGLite)                │
      │  bun gbrain serve (stdio MCP)      │
      │  cron: economy, assets, alpha      │
      └────────────────────────────────────┘
                  ▲           ▲
        git pull + │           │ gbrain query/think
        gbrain     │           │
        import     │           ▼
      ┌─────────────────┐    ┌──────────────────────┐
      │ Mac — Cursor    │    │ Mac — Antigravity    │
      │ ~/.gbrain       │    │ ~/.gbrain            │
      │ (mirror local)  │    │ (mirror local)       │
      └─────────────────┘    └──────────────────────┘
```

Cada host tiene su cerebro local para no depender de la red; el `sync-gbrain.sh` reconcilia periódicamente desde el repo (single source of truth = `ai_context/` + `docs/intake/` + `docs/proposals/`).

---

## Addendum 2026-06-21 10:15 UTC — hallazgos del audit pre-CEO

Antes de que el CEO arranque, fijate esto:

- **No existe `goalchain-economy-crank.timer` ni `goalchain-asset-generation.timer`** en `~/.config/systemd/user/`. Confirmado con `systemctl list-timers --all` (12 timers, ninguno coincide). La economía NO está automatizada con cron; vive en el MCP worker `goalchain-ops` y se invoca a demanda.
- **Cobertura pglite**: 75 MB totales (pglite 70 MB + WAL 2x16 MB pendientes de checkpoint). Hay 160 GB libres en `/data` y 16 GB de RAM disponible. No hay riesgo de OOM con el sync normal; el WAL rotativo sugiere que convendría un VACUUM tras el backfill de docs (326 proposals + 1951 docs).
- **12 timers viven en `~/.config/systemd/user/`** bajo el daemon de usuario (`systemctl --user list-timers`). El CEO debería usar ese namespace para cualquier cron nuevo, no `/etc/systemd/system`.
- **Providers de asset gen**: el único path que encontré es `grok-imagine-generate.py` + `process-player.py` (`~/hermes/scripts/`). El MCP `goalchain-ops` expone `get_next_visual_batch` y `upload_generated_asset`, pero ningún worker los está llamando en loop. Por eso el contador está en 1/528.

**Implicancia para los issues #811 y #812**: reformular para que apunten al worker/handler de MCP, no al cron. Si querés automatización real, hay que autor un cron NUEVO (`goalchain-asset-batch.timer` cada 20 min en horario hábil + burst 06:00 UTC).

---

## Plan de issues (todo se delega a `agent:hermes`)

1. `P0` — Diagnóstico y fix del economy daemon (vault_crank + mint_gate).
2. `P0` — Confirmar/configurar cron de asset generation + reanudar cola hasta cubrir gap.
3. `P1` — Crear `ops/hermes/sync-gbrain.sh` (Mac + VPS) y actualizar skill. **(closed)**
4. `P1` — Crear brief `docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md` para que Nico recargue Cursor/Antigravity. **(closed via issue #842 — reminder canonical, scripts verified, status=done)**
5. `P2` — Auditar otros timers/cron (`goalchain-ops` MCP list) y centralizar health check en `goalchain-ops:.health` resource.

---

## Verificación de cierre

Una vez ejecutado todo:

- `mcp_goalchain_ops_goalchain_economy_health` → `status: healthy`
- `vault_crank.stale: false` y `mode: live`
- `get_generation_progress` incrementa en cada corrida
- `bash sync-gbrain.sh vps` y `bash sync-gbrain.sh mac` → exit 0
- Nico confirma que Cursor y Antigravity ya pueden hacer queries gbrain

---

**Update #842 (item #4 closed):** See docs/proposals/hermes/issue-842-proposal.md for full verification, tests, risks, file list. Reminder doc updated to done. Scripts (sync-gbrain, installers) inspected/executed successfully on VPS. Mac-side reload by Nico required to activate. Other P0/P1/P2 tracked in separate issues.

**End of brief.** Listo para abrir issues P0/P1/P2. (item #4 closed by #842)
