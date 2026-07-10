# OA Proposal — Issue #863

## Title
[HERMES] [intake] GBrain en Hermes: swap, keys y tus suscripciones

## Source
GitHub issue #863

## Objective
## Objective
# GBrain en Hermes: swap, keys y tus suscripciones

- **Task Created:** https://github.com/TheNeuralWars/goalworld/issues/251
- **Task Status:** ready

- **Date:** 2026-05-24
- **Status:** ready
- **Owner:** Nico

## Qué tenés hoy (suscripciones)

| Suscripción | Sirve para en Hermes | ¿Alimenta GBrain embeddings? |
|-------------|-------------------|------------------------------|
| **GitHub Copilot** | OpenClaw `dev`, OpenCode `OA_MODEL=github-copilot/...` | **No** (modelo de código, no vectores) |
| **Super Grok (xAI)** | OpenClaw chat, OA worker (`xai/grok-4.3`), OAuth ya en servidor | **No** para embeddings; **sí** para LLM en agentes |
| **Cursor** | Tu Mac (desarrollo local) | **No** en el VPS Hermes |

## Qué necesita GBrain (por capa)

| Capa | ¿Obligatorio? | Con tus suscripciones |
|------|---------------|------------------------|
| **Keyword search** (`gbrain query`) | No extra | **Ya funciona** (53 páginas importadas) |
| **Dream nocturno** (`gbrain dream`) | Swap recomendado | Funciona mejor con **2GB swap** (script abajo) |
| **Embeddings** (`gbrain embed`, `gbrain think`) | API aparte | **Necesitás una de estas** (no incluida en Copilot/Cursor/Grok) |

### Opciones para embeddings (elegí una)

| Proveedor | Dónde conseguir key | Costo típico |
|-----------|---------------------|--------------|
| **ZeroEntropy** (recomendado por gbrain) | [zeroentropy.dev](https://zeroentropy.dev) → dashboard → API keys | Plan free / bajo según uso |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/api-keys) | Pay-as-you-go (no es tu sub Copilot) |

**No hace falta** pagar otra suscripción tipo Copilot: con **$0–5/mes** en OpenAI o free tier ZeroEntropy alcanza para un brain chico de goalworld.

Sin ninguna key de embedding: seguís con **keyword search** + dream con tareas que no requieren embed.

### Variables en `~/hermes/config.env` (servidor)

```bash

## OA Plan (concreto — FCC on main)

TASK 1: Refinar propuesta (ESTE ARCHIVO)
  - Agregar OA Plan concreto, Risks/Rollback, Exact test commands
  - Estado: EN PROGRESO

TASK 2: Crear ops/hermes/gbrain-dream-cron.sh
  - Script idempotente para instalar/desinstalar/verificar cron de dream nocturno
  - Verifica swap antes de correr dream
  - Carga config.env para ZEROENTROPY_API_KEY / OPENAI_API_KEY
  - Loguea a $HOME/hermes/logs/gbrain-dream.log
  - Cron: 03:30 UTC nightly (como indica el intake)
  - Tests: shellcheck + dry-run install/uninstall

TASK 3: Crear docs/hermes-workflow/gbrain-hermes-runbook.md
  - Runbook consolidado: suscripción matrix, swap setup, embedding keys, cron
  - Consume la info del intake 2026-05-24-gbrain-keys-y-swap.md
  - Guía paso a paso para operador Hermes

## Risk / rollback
- Risk: script de cron modifica crontab del usuario — mitigado con install/uninstall idempotentes
- Risk: swap requiere sudo — mitigado con verificación de swapon antes de correr dream
- Rollback: bash ops/hermes/gbrain-dream-cron.sh uninstall

## Exact test commands
```bash
# Locales (VPS)
bash ops/hermes/gbrain-dream-cron.sh status
bash ops/hermes/gbrain-dream-cron.sh install --dry-run
# Verificar sintaxis shellcheck
shellcheck ops/hermes/gbrain-dream-cron.sh || true
# Verificar swap
free -h && swapon --show
# dry-run del cron: ver qué se agregaría
crontab -l | grep gbrain || echo "no gbrain cron yet"
```

## Files touched / created
- docs/proposals/hermes/issue-863-proposal.md  (actualizado)
- ops/hermes/gbrain-dream-cron.sh             (NUEVO)
- docs/hermes-workflow/gbrain-hermes-runbook.md (NUEVO)
- docs/intake/2026-05-24-gbrain-keys-y-swap.md  (intake marker .done)
