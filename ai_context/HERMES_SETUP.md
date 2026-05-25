# Hermes — Setup (GoalChain)

Bootstrap local o en server 24/7. **Manager conversacional:** Hermes Agent (Grok) en el VPS. **Agente de código:** Free Claude Code (FCC) vía `oa-worker`. **Fuente de verdad de tareas:** `docs/intake/` + issues GitHub `agent:opencode`.

## Quick start (Mac / Linux)

```bash
cd /path/to/GoalChain
chmod +x ops/hermes/*.sh
./ops/hermes/bootstrap.sh
nano ~/hermes/config.env   # opcional: GITHUB_TOKEN, API_BASE_URL, Slack
./ops/hermes/sync.sh
```

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
| **Manager** (Hermes) | `hermes-gateway.service` + Grok | `OA_MODEL=xai/grok-4.3` |
| **Código** (FCC) | `oa-worker` + `fcc-claude` | `OA_CODE_ENGINE=fcc` |
| **Integración** | Antigravity (merge) | — |

Workspace Manager: `~/.hermes/SOUL.md` (plantilla: `ops/hermes/workspace-templates/SOUL.md`).

Flujo dev (Discord/WhatsApp): Manager crea issue `agent:opencode` → OA worker ejecuta FCC en `exp/opencode-issue-*` → draft PR → revisión Antigravity/Nico.

### FCC — proveedores 1–18 (sin LM Studio en el VPS)

- Config: `~/hermes/fcc.secrets.env` → `bash ~/hermes/scripts/configure-fcc-env.sh` → `~/.fcc/.env`
- Guía (español): **`ops/hermes/FCC_PROVIDERS.md`** — proveedores 1–14 = API keys; **15–17 = solo local** (URL, no key); catálogo LM Studio → slugs `open_router/` / `nvidia_nim/`
- En el VPS Hermes: **`FCC_CLOUD_ONLY=1`** en secrets (no descargar modelos de 50GB); Admin UI vía `ssh -L 8082:127.0.0.1:8082 goalchain@178.105.148.109`
- **Routing automático:** Hermes solo elige P0/P1/P2; `fcc-resolve-tier.sh` + `fcc-claude --model opus|sonnet|haiku` — ver `ops/hermes/DISCORD_WORKDAY_SETUP.md`

## GBrain (memoria institucional)

Tres runtimes, **sin sync automática** entre sí. Fuente común: repo Git (`ai_context/`, `docs/intake/`) + `gbrain import` tras cada `git pull`.

| Host | Script | MCP / store |
|------|--------|-------------|
| **Hermes VPS** | `install-gbrain-hermes.sh` | `~/.hermes/config.yaml` → `mcp_servers.gbrain`; reinicia `hermes-gateway` |
| **Cursor (Mac)** | `install-gbrain-cursor.sh` | `.cursor/mcp.json` → recargar ventana Cursor |
| **Antigravity (Mac)** | `install-gbrain-antigravity.sh` | `~/.gemini/config/mcp_config.json` → **reiniciar Antigravity IDE** |

En la Mac de Nico, Cursor y Antigravity comparten el mismo `~/.gbrain` (una sola instancia PGLite local). El VPS tiene el suyo en el servidor.

**Mensaje para Manager (Hermes):** Cursor y Antigravity en Mac ya tienen GBrain instalado vía MCP; hasta que Nico reinicie Cursor/Antigravity, las sesiones activas pueden no “recordar” el tool — en el VPS vos sí usás `mcp_servers.gbrain` tras `install-gbrain-hermes.sh`.

```bash
# VPS
bash ops/hermes/install-gbrain-hermes.sh
systemctl --user restart hermes-gateway

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

## X-Scout (foro active-research)

- Timer: `hermes-x-scout.timer` → `ops/hermes/oa-x-scout-run.sh`
- Publicación: `ops/hermes/oa-x-scout-discord.py` (embed + un hilo por ciclo; cooldown `OA_X_SCOUT_MIN_INTERVAL_SEC`, default 7200)
- Config: `DISCORD_RESEARCH_CHANNEL_ID` = foro **active-research**; `OA_WORKER_PUBLISH_RESEARCH=false` evita spam del worker

## OpenClaw (legacy, opcional)

Si aún usas OpenClaw en algún host: `ops/openclaw/deploy-workspace.sh`. El VPS actual usa **Hermes Agent**, no OpenClaw.

## System prompt

Hermes Agent carga `~/.hermes/SOUL.md`. Referencia: `ai_context/AGENT_ORCHESTRATION.md` + `docs/intake/README.md`.

## Auth GitHub

- **Desarrollo:** `gh auth login` (ya autenticado en tu Mac).
- **Server 24/7:** crear PAT fine-grained: Issues (R/W), Contents (R/W), Metadata (R). Guardar en `GITHUB_TOKEN`.

## Relación con otros agentes

Ver `ai_context/AGENT_ORCHESTRATION.md`. Hermes no mergea código de producción.
