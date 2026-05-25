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

## GBrain (memoria opcional)

```bash
bash ops/hermes/install-gbrain-hermes.sh
```

Guía: `docs/intake/2026-05-24-hermes-gbrain-copilot-setup.md`. API: `ZEROENTROPY_API_KEY` en `config.env`.

## OpenClaw (legacy, opcional)

Si aún usas OpenClaw en algún host: `ops/openclaw/deploy-workspace.sh`. El VPS actual usa **Hermes Agent**, no OpenClaw.

## System prompt

Hermes Agent carga `~/.hermes/SOUL.md`. Referencia: `ai_context/AGENT_ORCHESTRATION.md` + `docs/intake/README.md`.

## Auth GitHub

- **Desarrollo:** `gh auth login` (ya autenticado en tu Mac).
- **Server 24/7:** crear PAT fine-grained: Issues (R/W), Contents (R/W), Metadata (R). Guardar en `GITHUB_TOKEN`.

## Relación con otros agentes

Ver `ai_context/AGENT_ORCHESTRATION.md`. Hermes no mergea código de producción.
