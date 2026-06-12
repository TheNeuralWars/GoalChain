# Hermes — Setup (GoalChain)

Bootstrap local o en server 24/7. **Manager conversacional:** Hermes Agent (Grok) en el VPS. **Agente de código:** **Hermes CEO** (Nemotron-3-Ultra-free) vía `oa-run-code.sh` (semáforo 4 slots). **Fuente de verdad de tareas:** `docs/intake/` + issues GitHub `agent:opencode`.

## Quick start (Mac / Linux)

```bash
cd /path/to/GoalChain
chmod +x ops/hermes/*.sh
./ops/hermes/bootstrap.sh
nano ~/hermes/config.env   # opcional: GITHUB_TOKEN, API_BASE_URL, Slack
./ops/hermes/sync.sh
```

## Hermes CLI en Mac (espejo del VPS)

Misma config y API keys que el server (`~/.hermes` en Oracle `ubuntu@89.168.20.135`):

```bash
bash ops/hermes/install-hermes-mirror-mac.sh
# Re-sync cuando cambien keys en el VPS:
GOALCHAIN_SSH=ubuntu@89.168.20.135 bash ops/hermes/install-hermes-mirror-mac.sh
```

Uso local (mismos comandos que upstream):

```bash
hermes                                    # sesión interactiva
hermes chat -q "GoalChain ops status"
hermes chat --provider openrouter -q "hello"
hermes -s hermes-agent-dev -q "open draft PR for issue 93"
hermes --continue
hermes -w -q "spike on webapp routing"
```

Modelo por defecto tras mirror: **Grok** (`xai-oauth`), igual que el gateway en el VPS.

### Mac → VPS (aplicar cambios al server)

Si configurás keys, modelo o `SOUL.md` en la Mac y querés que el **gateway 24/7** use lo mismo:

```bash
bash ops/hermes/push-hermes-mirror-to-server.sh
# Solo API keys:
bash ops/hermes/push-hermes-mirror-to-server.sh --env-only
# Sin reiniciar gateway:
bash ops/hermes/push-hermes-mirror-to-server.sh --no-restart
```

Qué hace el push:

| Archivo | Comportamiento |
|---------|----------------|
| `.env` | Keys de Mac → server; conserva vars solo del VPS |
| `auth.json` | Copia OAuth/providers (xAI, etc.) |
| `config.yaml` | Fusiona `model`, MCP, agent; **no borra** discord/slack/whatsapp |
| `SOUL.md` | Copia al server |
| Gateway | `fix-hermes-gateway-service.sh` + restart |

**Flujo recomendado:** cambios en Mac → `push-hermes-mirror-to-server.sh` · cambios en VPS → `install-hermes-mirror-mac.sh`.

## Layout en el server

```text
~/hermes/
├── config.env          # secretos (NO en git)
├── logs/
├── memory/goalchain/   # digests locales (no sustituyen intake)
└── workspace/
    └── GoalChain/      # clone git
```

## Variables clave (`config.env`)

| Variable | Uso |
|----------|-----|
| `GOALCHAIN_REPO_PATH` | Ruta al clone |
| `GITHUB_REPO` | `TheNeuralWars/GoalChain` |
| `GITHUB_TOKEN` | Opcional si no usas `gh auth` |
| `API_BASE_URL` / `HEALTH_URL` | KPI health post-merge #34 |
| `BLOCKED_BRIEFS` | Briefs en cola hasta tu OK |
| `SLACK_*` | Vacío hasta Fase 2 |
| `OA_CODE_ENGINE` | `hermes` (motor unificado Hermes CEO) |
| `OA_CODE_MODEL` | `nemotron-3-ultra-free` (único modelo para P0/P1/P2) |

## Cron sugerido (servidor)

```cron
# cada 30 min — sync repo
*/30 * * * * HERMES_HOME=$HOME/hermes $HOME/hermes/workspace/GoalChain/ops/hermes/sync.sh >> $HOME/hermes/logs/sync.log 2>&1

# 08:00 — digest (tu proceso Hermes llama al LLM con memory/goalchain/daily/)
0 8 * * * ...
```

## Runtime en el VPS (recomendado)

Tras `git pull` en `~/hermes/workspace/GoalChain`:

```bash
bash ops/hermes/setup-hermes-runtime.sh
bash ~/hermes/scripts/oa-control.sh status
bash ~/hermes/scripts/hermes-context.sh
```

| Rol | Runtime | Variable |
|-----|---------|----------|
| **Manager** (Hermes) | `hermes-hermes-ceo.service` + Grok | `OA_MODEL=xai/grok-4.3` |
| **Código** (Hermes CEO) | `oa-run-code.sh` (semáforo 4 slots) | `OA_CODE_ENGINE=hermes` |
| **Integración** | Antigravity (merge) | — |

Workspace Manager: `~/.hermes/SOUL.md` (plantilla: `ops/hermes/workspace-templates/SOUL.md`).

**Idioma:** inglés por defecto y en canales públicos (Discord/Slack/foro). Español solo con Nico en WhatsApp privado (`manager:`). Aplicar en VPS:

```bash
bash ops/hermes/configure-hermes-language.sh
systemctl --user restart hermes-hermes-ceo
```

Flujo dev (Discord/WhatsApp): Manager crea issue `agent:opencode` → `oa-run-code.sh` ejecuta Hermes CEO en `exp/opencode-issue-*` (máx 4 concurrentes) → draft PR → revisión Antigravity/Nico.

### Hermes CEO — motor unificado (Nemotron-3-Ultra-free)

- **Config:** sin `fcc.secrets.env` ni `configure-fcc-env.sh` — usa keys directas de `~/hermes/config.env` (NVIDIA_NIM_API_KEY, OPENROUTER_API_KEY, etc.)
- **Ejecución:** `bash ~/hermes/scripts/oa-run-code.sh --workdir <repo> --prompt-file <file> --log <log>` (sin `--tier`)
- **Concurrencia:** semáforo 4 slots (`worker_1.lock`–`worker_4.lock`) — evita sobrecarga del VPS
- **Skills:** `CLAUDE.md` (repo root) + `~/.claude/skills/{frontend-design,gstack}` — instalar:
  ```bash
  bash ops/hermes/install-hermes-superpowers.sh
  ```
- **Guía para Nico y handoffs:** **`ai_context/AGENT_TOOLS_GUIDE.md`**

## GBrain (memoria institucional)

Tres runtimes, **sin sync automática** entre sí. Fuente común: repo Git (`ai_context/`, `docs/intake/`) + `gbrain import` tras cada `git pull`.

| Host | Script | MCP / store |
|------|--------|-------------|
| **Hermes VPS** | `install-gbrain-hermes.sh` | `~/.hermes/config.yaml` → `mcp_servers.gbrain`; reinicia `hermes-hermes-ceo` |
| **Cursor (Mac)** | `install-gbrain-cursor.sh` | `.cursor/mcp.json` → recargar ventana Cursor |
| **Antigravity (Mac)** | `install-gbrain-antigravity.sh` | `~/.gemini/config/mcp_config.json` → **reiniciar Antigravity IDE** |

En la Mac de Nico, Cursor y Antigravity comparten el mismo `~/.gbrain` (una sola instancia PGLite local). El VPS tiene el suyo en el servidor.

**Cursor MCP y `bun`:** el binario `gbrain` usa shebang `#!/usr/bin/env bun`. La app Cursor no hereda el PATH del shell → error `env: bun: No such file or directory`. El MCP debe invocar `bun` con ruta absoluta: `"command": "~/.bun/bin/bun", "args": ["~/.bun/bin/gbrain", "serve"]` (lo escribe `install-gbrain-cursor.sh`). Tras cambiar `.cursor/mcp.json`, **Reload Window**.

**Mensaje para Manager (Hermes):** Cursor y Antigravity en Mac ya tienen GBrain instalado vía MCP; hasta que Nico reinicie Cursor/Antigravity, las sesiones activas pueden no "recordar" el tool — en el VPS vos sí usás `mcp_servers.gbrain` tras `install-gbrain-hermes.sh`.

```bash
# VPS
bash ops/hermes/install-gbrain-hermes.sh
systemctl --user restart hermes-hermes-ceo

# Mac (Nico)
bash ops/hermes/install-gbrain-cursor.sh
bash ops/hermes/install-gbrain-antigravity.sh
```

Re-sync memoria tras merge a `main`:
```bash
gbrain import ai_context docs/intake && gbrain embed --stale
```

Guía: `docs/intake/2026-05-24-hermes-gbrain-copilot-setup.md`. Embeddings: `ZEROENTROPY_API_KEY` o `OPENAI_API_KEY` en `config.env` / `.env`.

## Superpowers (swap + MCP on-chain + cron + webhooks)

En el VPS, tras pull:

```bash
sudo SWAP_SIZE_GB=2 SWAP_FILE=/swapfile2 bash ~/hermes/scripts/setup-swap-extra.sh   # +2GB (requiere sudo en VPS)
bash ~/hermes/scripts/install-hermes-superpowers.sh
```

| Capa | Qué hace |
|------|----------|
| **native-mcp** | `mcp_servers.goalchain-ops` (venv python) → API ops/health/config + on-chain |
| **webhook-subscriptions** | `:8644` + `goalchain-alpha-push` → WhatsApp (`--deliver-only`) |
| **hermes cron** | Alpha `*/30 * * * *`, scan 05:00 UTC, resumen 07:00 UTC → `WHATSAPP_TARGET` |

Requisitos: `WHATSAPP_TARGET` en `~/hermes/config.env`, `approvals.cron_mode: allow`. Si Twenty CRM ocupa `:3000`, el instalador fija `whatsapp.extra.bridge_port: 3001`.

## Perfiles Hermes (agentes GoalChain) — Discord + X + OAuth compartidos

Hermes **no** comparte `.env` entre perfiles. Los agentes canónicos están en `ops/hermes/goalchain-agent-profiles.list`:

`daily-routine`, `jito-strategy`, `marketing-active`, `player-images`, `repo-deepdive`, `x-scout`.

**No usar** el cron Hermes `x-scout-research-cycle` (creado desde chat): duplica el pipeline GoalChain (`hermes-x-scout.timer` + perfil `x-scout`). Borrar con:

```bash
bash ops/hermes/sync-goalchain-agent-profiles.sh --prune-x-scout-cron
```

Los crons GoalChain en **default** (`goalchain-alpha-watch`, `goalchain-morning-conclusions`, `goalchain-nightly-scan`) se mantienen. Perfil **`daily-routine`**: crons `daily-gm` / `daily-gn` (GM/GN en `#dev-room`). Eliminar solo el duplicado molesto: `x-scout-research-cycle` (`--prune-x-scout-cron`).

### macOS en pausa (VPS = producción)

No editar perfiles en Mac hasta nuevo aviso. Para apagar gateways locales:

```bash
bash ops/hermes/disable-hermes-mac.sh
```

### Flujo recomendado (cada agente nuevo)

```bash
# 1) Crear perfil copiando config + .env + SOUL del default (o template)
hermes profile create mi-agente --clone --clone-from default

# 2) Compartir Discord, X API y OAuth (auth.json) desde default
bash ops/hermes/on-profile-created.sh mi-agente

# 3) Si el agente usa gateway propio
mi-agente gateway start
```

### Fuentes canónicas de secretos

| Archivo | Qué guardar |
|---------|-------------|
| `~/.hermes/.env` | `DISCORD_BOT_TOKEN`, `XAI_API_KEY`, keys Hermes gateway |
| `~/hermes/config.env` | `DISCORD_TOKEN`, `DISCORD_RESEARCH_CHANNEL_ID`, `XAI_API_KEY` (scripts OA/X-Scout). **No** `X_API_KEY` (API de X desactivada; solo OAuth Grok / búsqueda vía skills). |

El script `bootstrap-profile-secrets.sh` fusiona ambos y escribe en `~/.hermes/profiles/<nombre>/.env`.

### OAuth Grok (xai-oauth)

`--clone` **no** copia `auth.json`. Para Grok en el perfil:

```bash
hermes profile create mi-agente --clone-all --clone-from default   # incluye auth.json + OAuth
# o
bash ops/hermes/bootstrap-profile-secrets.sh --profile mi-agente --also-auth
```

### Actualizar todos los agentes tras cambiar una key

```bash
bash ops/hermes/sync-goalchain-agent-profiles.sh
# equivalente:
bash ops/hermes/bootstrap-profile-secrets.sh --agent-profiles --also-auth
```

### Template perfil (opcional)

Una vez, con todo configurado en `default`:

```bash
hermes profile create goalchain-template --clone-all --clone-from default
```

Luego siempre: `hermes profile create NUEVO --clone --clone-from goalchain-template`

## Hermes Vault (credenciales + OAuth Grok sin babysitting)

Instala [hermes-vault](https://github.com/asimons81/hermes-vault) + timer que refresca **xAI OAuth** en `auth.json` (misma lógica que el gateway) cada 15 min:

```bash
bash ops/hermes/install-hermes-vault.sh
# Mac y VPS (VPS: reiniciar gateway tras install si añade MCP)
systemctl --user status goalchain-credential-maintain.timer   # solo Linux/VPS
```

| Pieza | Ruta |
|-------|------|
| Passphrase | `~/.hermes/vault.passphrase` y `~/.hermes/vault.env` (systemd) — **hacer backup** |
| Vault data | `~/.hermes/hermes-vault-data` |
| Log | `~/hermes/logs/credential-maintain.log` |
| Manual | `bash ~/hermes/scripts/hermes-credential-maintain.sh` |

**Grok OAuth:** hermes-vault no incluye provider `xai` built-in; el timer usa `hermes-xai-oauth-refresh.py --all-agent-profiles` (default + lista en `goalchain-agent-profiles.list`). Tras login en default, propagá con `sync-goalchain-agent-profiles.sh`.

Si falla con `relogin_required`, re-login en default (`hermes auth add xai-oauth`) y volvé a ejecutar el sync.

## X-Scout (foro active-research)

- Timer: `hermes-x-scout.timer` → `ops/hermes/oa-x-scout-run.sh`
- Publicación: `ops/hermes/oa-x-scout-discord.py` (embed + un hilo por ciclo; cooldown `OA_X_SCOUT_MIN_INTERVAL_SEC`, default 7200)
- Config: `DISCORD_RESEARCH_CHANNEL_ID` = foro **active-research**; `OA_WORKER_PUBLISH_RESEARCH=false` evita spam del worker

## Troubleshooting — Discord sin respuesta

Si Hermes dejó de responder en `#openclaw-chat` pero el bot parecía vivo antes:

```bash
# Gateway en crash loop (venv path roto tras sed HERMES_HOME):
bash ops/hermes/fix-hermes-gateway-service.sh
bash ops/hermes/configure-discord-openclaw-chat.sh
systemctl --user restart hermes-hermes-ceo
journalctl --user -u hermes-hermes-ceo -n 30 --no-pager
```

**Causa típica:** `hermes-gateway.service` apuntando a `~/hermes/hermes-agent/venv` (no existe). Correcto: venv `~/.hermes/hermes-agent/venv`, **`HERMES_HOME` en systemd = `~/.hermes`** (carga `.env` y token Discord). Scripts GoalChain usan `~/hermes/config.env` por ruta fija, no confundir las dos carpetas.

## OpenClaw (legacy, opcional)

Si aún usas OpenClaw en algún host: `ops/openclaw/deploy-workspace.sh`. El VPS actual usa **Hermes Agent**, no OpenClaw.

## System prompt

Hermes Agent carga `~/.hermes/SOUL.md`. Referencia: `ai_context/AGENT_ORCHESTRATION.md` + `docs/intake/README.md`.

## Auth GitHub

- **Desarrollo:** `gh auth login` (ya autenticado en tu Mac).
- **Server 24/7:** crear PAT fine-grained: Issues (R/W), Contents (R/W), Metadata (R). Guardar en `GITHUB_TOKEN`.

## Relación con otros agentes

Ver `ai_context/AGENT_ORCHESTRATION.md`. Hermes no mergea código de producción.