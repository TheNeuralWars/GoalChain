# Hermes + FCC — jornada Discord (setup limpio)

## Roles

| Agente | Qué hace | Modelo recomendado |
|--------|----------|-------------------|
| **Hermes** (Manager) | Chat Discord/WhatsApp, issues, priorización | `xai/grok-4` (rápido, barato para conversación) |
| **FCC** (Código) | `oa-worker` → branches, PRs draft | Ver tiers abajo |

## FCC en el VPS (`~/.fcc/.env`)

```bash
FCC_CLOUD_ONLY=1   # en ~/hermes/fcc.secrets.env

# Tiers (recomendado jornada 8h)
MODEL=open_router/qwen/qwen3-coder-next
MODEL_SONNET=open_router/qwen/qwen3-coder-next
MODEL_OPUS=nvidia_nim/nvidia/nemotron-3-super-120b-a12b   # solo tareas grandes
MODEL_HAIKU=groq/llama-3.3-70b-versatile                  # lecturas rápidas
```

- **Nemotron (NIM) en Opus:** sí, para refactors/decisiones difíciles; no lo uses para cada mensaje de Discord.
- Si NIM devuelve 429: bajá temporalmente `MODEL_OPUS` a `open_router/qwen/qwen3.6-35b-a3b`.

Aplicar: `bash ~/hermes/scripts/configure-fcc-env.sh` → reinicia `fcc-server`.

## Hermes (`~/hermes/config.env`)

- `OA_CODE_ENGINE=fcc`
- `OA_MODEL=xai/grok-4.3` (o el Grok que tengas en xAI)
- `GITHUB_TOKEN` con permisos Issues + Contents

Manager **no** comparte cupo con FCC: Grok para charlar, OpenRouter/NIM/Groq para código.

## Discord mañana — sin elegir modelos

Vos hablás normal; Hermes elige **P0 / P1 / P2** al crear el issue. El worker traduce:

| Vos decís (ejemplos) | Hermes usa | FCC ejecuta |
|----------------------|------------|-------------|
| "refactor play", "tokenomics", "on-chain" | P0 | `--model opus` → `MODEL_OPUS` (NIM) |
| "arreglá el panel", "nueva card" | P1 | `--model sonnet` → `MODEL_SONNET` |
| "cambiá un texto", "css chico" | P2 | `--model haiku` → `MODEL_HAIKU` |

Slugs (`nvidia_nim/...`) viven solo en `~/hermes/fcc.secrets.env` — una vez, no en chat.

## Discord mañana

1. Un issue `agent:opencode` por tarea (no tres workers en el mismo issue).
2. Pedí cambios de UI en el issue con criterios claros; FCC trabaja la rama `exp/opencode-issue-N`.
3. Revisión/merge: Antigravity o vos — Hermes no mergea a `main` solo.

## Play / Ops

- API: `https://crm.goalchain.fun/goalchain-api/api/ops/status`
- Vercel: borrá `VITE_API_BASE_URL` o poné `https://crm.goalchain.fun/goalchain-api` (nunca `api.goalchain.io` hasta DNS).

Ver también: `ops/hermes/FCC_PROVIDERS.md`, `ai_context/HERMES_SETUP.md`.
