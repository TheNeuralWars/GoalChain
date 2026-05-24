# Hermes — Setup (GoalChain)

Bootstrap local o en server 24/7. **Agente conversacional:** OpenClaw (Hermes) — ver `ai_context/OPENCLAW_GOALCHAIN_OPERATOR.md`. **Fuente de verdad de tareas:** `docs/intake/` en el repo.

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

## GBrain (memoria persistente + Copilot)

Instala la capa de memoria [gbrain](https://github.com/garrytan/gbrain) y usa GitHub Copilot en el agente `dev`:

```bash
bash ops/hermes/install-gbrain-hermes.sh   # servidor: Bun + PGLite + MCP OpenClaw
```

Guía completa: `docs/intake/2026-05-24-hermes-gbrain-copilot-setup.md`

- **Copilot:** agente OpenClaw `dev` → `github-copilot/claude-sonnet-4.5`; OpenCode ya tiene OAuth.
- **Grok:** default chat / agente `public` / OA worker (`OA_MODEL` en config.env).
- **API keys gbrain:** `ZEROENTROPY_API_KEY` o `OPENAI_API_KEY` en `config.env` → `gbrain embed --stale`.

## OpenClaw (servidor — agente general)

```bash
# Desde el repo (tras pull) o tras scp de ops/openclaw:
bash ops/openclaw/deploy-workspace.sh    # en el server: ~/openclaw/deploy-workspace.sh
bash ops/openclaw/install-cron.sh        # digest 09:00 UTC + sync cada 6h
```

Panel (Mac): `ssh -N -L 18790:127.0.0.1:18789 goalchain@178.105.148.109` → `http://127.0.0.1:18790/#token=...`

Workspace: `SOUL.md`, `HEARTBEAT.md`, `USER.md`, symlink `GoalChain/` → `~/hermes/workspace/GoalChain`.

## System prompt (legacy / manual)

OpenClaw carga `SOUL.md` automáticamente. Referencia adicional: `ai_context/AGENT_ORCHESTRATION.md` + `docs/intake/README.md`.

## Auth GitHub

- **Desarrollo:** `gh auth login` (ya autenticado en tu Mac).
- **Server 24/7:** crear PAT fine-grained: Issues (R/W), Contents (R/W), Metadata (R). Guardar en `GITHUB_TOKEN`.

## Relación con otros agentes

Ver `ai_context/AGENT_ORCHESTRATION.md`. Hermes no mergea código de producción.
