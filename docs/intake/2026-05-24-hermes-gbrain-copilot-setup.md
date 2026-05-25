# Hermes + GBrain + GitHub Copilot — reconfiguración

- **Date:** 2026-05-24
- **Status:** in_progress
- **Owner:** Nico + cursor
- **Server:** `goalchain@178.105.148.109` (Hermes / OpenClaw)
- **Upstream:** [garrytan/gbrain](https://github.com/garrytan/gbrain)

## Objetivo

Dar a Hermes una **capa de memoria persistente** (GBrain: búsqueda híbrida, grafo, `gbrain think`) y usar tu **suscripción GitHub Copilot** como modelo de código en el agente `dev` y en OpenCode (OA), sin reemplazar Grok para chat/voz público.

## Qué es cada pieza

| Pieza | Rol en GoalChain |
|-------|------------------|
| **OpenClaw** | Chat, voz, panel, cron (Hermes conversacional) |
| **GBrain** | Memoria institucional: intake, decisiones, contexto GoalChain |
| **GitHub Copilot** | Modelo LLM vía `github-copilot/*` (ya OAuth en OpenCode + agente `dev`) |
| **Grok (xAI)** | Modelo default chat + OA worker (sigue en `config.env`) |
| **~/hermes/scripts/** | Automatización GoalChain (sync, dispatch, API) |

## Estado actual en el servidor (inspeccionado)

- OpenClaw `2026.5.20`, gateway `:18789`
- Agente **`dev`** → `github-copilot/claude-sonnet-4.5` (Copilot activo)
- Agente **`public`** → Grok, solo lectura Discord
- OpenCode → **GitHub Copilot OAuth** en `~/.local/share/opencode/auth.json`
- **Sin GBrain** instalado aún (`gbrain` / `bun` ausentes)
- RAM ~3.7 GiB total, ~1 GiB libre con Docker (Twenty + goalchain-api) — usar PGLite y `--no-embedding` hasta tener API key

## Arquitectura objetivo

```text
                    ┌─────────────────┐
  Discord / chat ──►│ OpenClaw        │
                    │  dev → Copilot │
                    │  public → Grok │
                    └────────┬────────┘
                             │ MCP stdio
                             ▼
                    ┌─────────────────┐
                    │ gbrain serve    │
                    │  PGLite ~/brain │
                    └────────┬────────┘
                             │ import/sync
                             ▼
                    ┌─────────────────┐
                    │ GoalChain repo  │
                    │ docs/intake,    │
                    │ ai_context, ops │
                    └─────────────────┘

  OA worker ──► OpenCode ──► Copilot (fallback) / xAI Grok
```

## Instalación (servidor)

```bash
ssh goalchain@178.105.148.109
cd ~/hermes/workspace/GoalChain
git pull origin main
bash ops/hermes/install-gbrain-hermes.sh
```

El script:
1. Instala **Bun** + **gbrain** global
2. `gbrain init --pglite` (sin embedding si no hay keys)
3. Crea `~/brain` e importa contexto GoalChain (sin `mint_setup/assets`)
4. `gbrain skillpack scaffold --all` en `~/.openclaw/workspace`
5. Registra MCP `gbrain` en `~/.openclaw/openclaw.json`
6. Cron dream/sync (opcional si hay API keys)

## API keys, swap y suscripciones (Copilot / Grok / Cursor)

Guía detallada: **`docs/intake/2026-05-24-gbrain-keys-y-swap.md`**

- **Copilot / Grok / Cursor** no reemplazan la API de embeddings de GBrain.
- **Swap 2GB:** `sudo bash ops/hermes/setup-swap.sh` (una vez con sudo en VPS).
- **GitHub token en config.env:** `bash ops/hermes/sync-github-token-to-config.sh`

Para búsqueda vectorial + rerank (opcional, API aparte):

| Key | Uso |
|-----|-----|
| `ZEROENTROPY_API_KEY` | Default embedding + rerank en gbrain |
| `OPENAI_API_KEY` | Fallback embedding / expansión |
| `ANTHROPIC_API_KEY` | Opcional, mejora query expansion |

Guardar en `~/hermes/config.env` o `export` en profile:

```bash
export ZEROENTROPY_API_KEY=ze-...
# luego:
gbrain embed --stale
```

Sin keys: **keyword search** sigue funcionando.

## Copilot — cómo se usa

### OpenClaw agente `dev` (coding)

Ya configurado: `github-copilot/claude-sonnet-4.5`.

Para tareas de código desde panel/chat, enrutar al agente `dev` (no `public`).

### OpenCode (OA worker)

Copilot OAuth ya presente. Verificar:

```bash
opencode providers list
# debe mostrar GitHub Copilot oauth

# Correr issue con Copilot (ejemplo):
OA_MODEL=github-copilot/claude-sonnet-4.5 bash ~/hermes/scripts/oa-agent-runner.sh
```

Opcional en `~/hermes/config.env`:

```bash
OA_MODEL=github-copilot/claude-sonnet-4.5
```

Mantener `xai/grok-4.3` para research/chat si preferís separar costos.

### Cursor + Antigravity en Mac

```bash
cd /path/to/GoalChain
bash ops/hermes/install-gbrain-cursor.sh
bash ops/hermes/install-gbrain-antigravity.sh
```

- Cursor MCP: `.cursor/mcp.json`
- Antigravity MCP: `~/.gemini/config/mcp_config.json` (reiniciar IDE tras install)
- Misma Mac → un solo `~/.gbrain` para ambos IDEs

**Para Hermes:** Cursor y Antigravity en Mac ya tienen GBrain cableado; Nico debe reiniciar Cursor/Antigravity para que la sesión cargue el MCP. En el VPS, Hermes usa `mcp_servers.gbrain` (no auto-sync con Mac — `git pull` + `gbrain import`).

Túnel al MCP HTTP de gbrain en el VPS (fase 2, opcional):

```bash
ssh -N -L 13131:127.0.0.1:3131 goalchain@178.105.148.109
# Cursor MCP: http://127.0.0.1:13131
```

## Verificación

```bash
gbrain doctor
gbrain query "GoalChain mint gate ops status"
gbrain think "what are open P0 blockers for GoalChain?"
openclaw gateway status
# En openclaw: usar agente dev y preguntar algo que esté en ~/brain
```

## Modo búsqueda (una vez con keys)

Tras `gbrain init`, elegir modo con el operador (ver INSTALL_FOR_AGENTS.md Step 3.5):

- `conservative` — barato, Haiku-class
- `balanced` — medio
- `tokenmax` — máximo contexto (default gbrain)

```bash
gbrain config set search.mode balanced   # recomendado en VPS 4GB
```

## Riesgos / rollback

| Riesgo | Mitigación |
|--------|------------|
| RAM en VPS | PGLite + sin embed inicial; no importar 1248 JSON mint |
| Copilot rate limits | Grok sigue como fallback en OA |
| Scope creep | GBrain solo lee/escribe `~/brain`; no toca on-chain |

Rollback:

```bash
# Quitar MCP de openclaw.json (backup en install script)
rm -rf ~/.gbrain ~/brain/.gbrain
openclaw gateway restart  # si aplica
```

## Relación con pendientes anteriores

Ver `docs/intake/2026-05-24-pendientes-post-audit.md` (Vercel Ops, DNS api, billing CI).

## Referencias

- `ops/hermes/install-gbrain-hermes.sh`
- `ops/hermes/install-gbrain-cursor.sh`
- `ops/hermes/install-gbrain-antigravity.sh`
- `ai_context/OPENCLAW_GOALCHAIN_OPERATOR.md`
- `ai_context/HERMES_SETUP.md`
- https://github.com/garrytan/gbrain/blob/master/INSTALL_FOR_AGENTS.md
