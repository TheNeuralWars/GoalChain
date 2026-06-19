# Pendientes post-audit (retomar)

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/253
- **Task Status:** ready

- **Date:** 2026-05-24
- **Status:** ready
- **Owner:** Nico (infra) + cursor (cuando haya acceso)
- **Context:** Audit `/to_do/1–14` mergeado en `main` (`4ddae52`, PR #84). API Ops live en VPS; play en Vercel pendiente de env.

---

## Completado (no rehacer)

| Item | Estado |
|------|--------|
| `/to_do/1–14` | En `main` (PR #84) |
| Issues #66–68, #72–74 | Cerrados |
| API Ops en VPS | `https://crm.goalchain.fun/goalchain-api/api/ops/status` |
| Wallets mint | `mint_setup/wallets.json` (devnet + mainnet) |
| `play.goalchain.fun` | Vercel valid (B-001) |

---

## Pendientes (acción humana)

### P-001 — GitHub Actions billing (bloquea CI)

**Síntoma:** Jobs fallan en ~2s sin ejecutar código.

```
The job was not started because recent account payments have failed
or your spending limit needs to be increased.
```

**Pasos:**
1. GitHub → org/repo **TheNeuralWars/GoalChain** → **Settings → Billing & plans**
2. Arreglar método de pago o subir spending limit
3. Re-run workflow en un PR o push a `main` para confirmar verde

**Verificar:**
```bash
gh run list --repo TheNeuralWars/GoalChain --branch main --limit 3
```

---

### P-002 — Ops panel live en `play.goalchain.fun` (Vercel)

**Objetivo:** Panel Ops (mint gate, vault crank, contributor epoch) deja de mostrar "API offline".

**Pasos:**
1. Vercel → proyecto `goalchain_webapp` → **Settings → Environment Variables** → Production
2. Agregar o editar:
   ```
   VITE_API_BASE_URL=https://crm.goalchain.fun/goalchain-api
   ```
   (sin barra final)
3. Mantener `VITE_RPC_URL=https://api.devnet.solana.com` para devnet
4. **Deployments → Redeploy** (Vite embebe vars en build time)

**Verificar:**
```bash
curl -s "https://crm.goalchain.fun/goalchain-api/api/ops/status" | head -c 200
# En navegador: https://play.goalchain.fun → panel Ops con datos
```

**Guía:** `docs/PLAY_DEPLOY_GUIDE.md` → Paso 1b

---

### P-003 — URL limpia `api.goalchain.fun` (opcional)

**Hoy:** API expuesta vía path en CRM (`crm.goalchain.fun/goalchain-api`).

**Mejora:** subdominio dedicado.

**Pasos:**
1. DNS en `goalchain.fun`:
   ```
   Tipo: A
   Nombre: api
   Valor: 178.105.148.109
   ```
2. Esperar propagación (5–30 min). Caddy en VPS ya tiene bloque `api.goalchain.fun` → pedirá cert Let's Encrypt.
3. Cambiar en Vercel:
   ```
   VITE_API_BASE_URL=https://api.goalchain.fun
   ```
4. Redeploy webapp

**Verificar:**
```bash
curl -s "https://api.goalchain.fun/api/ops/status" | head -c 200
```

---

### P-004 — Vercel: permisos de deploy en PRs (opcional)

**Síntoma en PR #84:** check falló — *"Git author bellonicopez must have access to the project on Vercel"* / *Deployment was blocked*.

**Pasos:** Vercel → Team → Members → invitar al autor de commits que disparen preview, o usar solo deploy desde `main` post-merge.

---

## Pendientes ops (servidor Hermes)

### P-005 — Re-sync scripts Hermes tras merge

Repo en VPS ya en `4ddae52`. Si querés copiar scripts a `~/hermes/scripts`:

```bash
ssh goalchain@178.105.148.109
bash ~/hermes/workspace/GoalChain/ops/hermes/install-hermes-server.sh
# o solo API:
bash ~/hermes/workspace/GoalChain/ops/hermes/deploy-goalchain-api-vps.sh
```

### P-006 — Local bridge en Mac (hands-free cursor/antigravity/opencode)

Si usás dispatch local:

```bash
bash ops/hermes/install-local-bridge-macos.sh
# Editar ~/.goalchain/local-bridge.env con LOCAL_*_CMD
```

---

## Issues GitHub aún abiertos (fuera del audit 1–14)

| # | Título | Agente |
|---|--------|--------|
| 48 | InsForge backend spike | antigravity |
| 49 | Weekly pending tasks check | opencode |
| 41–46 | OA Discord/research spikes | opencode |

Listar actuales: `./scripts/check-tasks.sh`

---

## P-007 — GBrain + Copilot en Hermes (en progreso)

**Guía:** `docs/intake/2026-05-24-hermes-gbrain-copilot-setup.md`  
**Script:** `ops/hermes/install-gbrain-hermes.sh`

**Hecho en servidor (2026-05-24):**
- Bun 1.2.15 en `~/.bun/bin` (sin `unzip` del sistema; instalado vía Python)
- GBrain 0.40.8.1 clonado en `~/gbrain-src`, `gbrain init --pglite --no-embedding`
- Importados `ai_context` + `docs/intake` (53 páginas, keyword search)
- MCP `gbrain` registrado en `~/.openclaw/openclaw.json`
- Copilot OAuth ya activo (OpenCode + agente OpenClaw `dev`)

**Pendiente Nico:**
1. Agregar `ZEROENTROPY_API_KEY` o `OPENAI_API_KEY` en `~/hermes/config.env` → `gbrain embed --stale`
2. Reiniciar gateway OpenClaw (tmux/servicio) para cargar MCP gbrain
3. Opcional: 2–4 GB swap o más RAM (init PGLite hizo segfault la 1ª vez por memoria)
4. `cd ~/gbrain-src && gbrain skillpack scaffold --all --workspace ~/.openclaw/workspace`

## Orden sugerido al retomar

1. **P-001** (billing) — desbloquea CI para futuros PRs
2. **P-002** (Vercel env) — Ops visible en play
3. **P-007** (GBrain keys + restart OpenClaw) — memoria Hermes + Copilot
4. **P-003** (DNS api) — solo si querés URL limpia
5. **P-005–P-006** — si usás hands-free / Hermes activo

---

## Referencias

- Audit master: `docs/intake/2026-05-24-repo-deep-audit-todo.md`
- Play deploy: `docs/PLAY_DEPLOY_GUIDE.md`
- API deploy VPS: `ops/hermes/deploy-goalchain-api-vps.sh`
- Hermes install: `ops/hermes/install-hermes-server.sh`
