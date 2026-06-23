# Hermes CEO — Jornada Discord (setup actual)

## Roles

| Agente | Qué hace | Modelo |
|--------|----------|--------|
| **Hermes** (Manager) | Chat Discord/WhatsApp, issues, priorización | `xai/grok-4.3` (rápido, barato para conversación) |
| **Hermes CEO** (Código) | `oa-run-code.sh` → branches, PRs draft | **NVIDIA NIM** (único para P0/P1/P2): `nvidia/nemotron-3-super-120b-a12b` (issue #832) |

---

## Configuración en el VPS (`~/hermes/config.env`)

```bash
# Motor de código unificado
OA_CODE_ENGINE=hermes
OA_CODE_MODEL=nvidia/nemotron-3-super-120b-a12b  # Issue #832: NVIDIA NIM (was: Nemotron-3-Ultra-free)

# Manager (conversación)
OA_MODEL=xai/grok-4.3

# GitHub
GITHUB_TOKEN=...  # permisos Issues + Contents
```

**No hay tier mapping** — Hermes CEO usa Nemotron-3-Ultra-free para P0, P1 y P2.

Manager **no** comparte cupo con code engine: Grok para charlar, Nemotron para código.

---

## Discord mañana — sin elegir modelos

Vos hablás normal; Hermes elige **P0 / P1 / P2** al crear el issue. El worker **no traduce a tier**, usa Nemotron directamente:

| Vos decís (ejemplos) | Hermes usa | Hermes CEO ejecuta |
|----------------------|------------|-------------------|
| "refactor play", "tokenomics", "on-chain" | P0 | `oa-run-code.sh` (Nemotron) |
| "arreglá el panel", "nueva card" | P1 | `oa-run-code.sh` (Nemotron) |
| "cambiá un texto", "css chico" | P2 | `oa-run-code.sh` (Nemotron) |

La concurrencia la controla el **semáforo 4 slots** en `oa-run-code.sh` (no el modelo).

---

## Flujo Discord → Implementación

1. Un issue `agent:opencode` por tarea (no workers paralelos en el mismo issue).
2. Pedí cambios de UI en el issue con criterios claros; Hermes CEO trabaja la rama `exp/opencode-issue-N`.
3. Revisión/merge: **Antigravity** o vos — Hermes no mergea a `main` solo.
4. Si `cambio urgente` en el prompt: push directo a `main` (skip draft PR).

---

## Play / Ops

- API: `https://crm.goalchain.fun/goalchain-api/api/ops/status`
- Vercel: borrá `VITE_API_BASE_URL` o poné `https://crm.goalchain.fun/goalchain-api` (nunca `api.goalchain.io` hasta DNS).

---

## Referencias

- **Motor:** [`ops/hermes/HERMES_CEO_ENGINE.md`](HERMES_CEO_ENGINE.md)
- **Setup:** [`ai_context/HERMES_SETUP.md`](../ai_context/HERMES_SETUP.md)
- **Orchestration:** [`ai_context/AGENT_ORCHESTRATION.md`](../ai_context/AGENT_ORCHESTRATION.md)