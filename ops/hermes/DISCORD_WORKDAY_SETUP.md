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
OA_CODE_MODEL=xiaomi/mimo-v2.6-pro  # default actual: MiMo 2.6 Pro via nous (era: Nemotron-3 / NIM)

# Manager (conversación)
OA_MODEL=xai/grok-4.3

# GitHub
GITHUB_TOKEN=...  # permisos Issues + Contents
```

**No hay tier mapping** — Hermes CEO usa MiMo 2.6 Pro (`xiaomi/mimo-v2.6-pro`, nous) para P0, P1 y P2.

Manager **no** comparte cupo con code engine: Grok para charlar, MiMo para código.

---

## Discord mañana — sin elegir modelos

Vos hablás normal; Hermes elige **P0 / P1 / P2** al crear el issue. El worker **no traduce a tier**, usa MiMo directamente:

| Vos decís (ejemplos) | Hermes usa | Hermes CEO ejecuta |
|----------------------|------------|-------------------|
| "refactor play", "tokenomics", "on-chain" | P0 | `oa-run-code.sh` (MiMo) |
| "arreglá el panel", "nueva card" | P1 | `oa-run-code.sh` (MiMo) |
| "cambiá un texto", "css chico" | P2 | `oa-run-code.sh` (MiMo) |

La concurrencia la controla el **semáforo 4 slots** en `oa-run-code.sh` (no el modelo).

---

## Flujo Discord → Implementación

1. Un issue `agent:opencode` por tarea (no workers paralelos en el mismo issue).
2. Pedí cambios de UI en el issue con criterios claros; Hermes CEO trabaja la rama `exp/opencode-issue-N`.
3. Revisión/merge: **Hermes** mergea a `main` cuando build/tests/QA están verdes y hay rollback listo (auto-revert si producción se rompe).
4. Ya no existe el keyword `cambio urgente`: Hermes es dueño de los merges y no necesita aprobación manual para mergear.

---

## Play / Ops

- API: `https://crm.goalchain.fun/goalchain-api/api/ops/status`
- Vercel: borrá `VITE_API_BASE_URL` o poné `https://crm.goalchain.fun/goalchain-api` (nunca `api.goalchain.io` hasta DNS).

---

## Referencias

- **Motor:** [`ops/hermes/HERMES_CEO_ENGINE.md`](HERMES_CEO_ENGINE.md)
- **Setup:** [`ai_context/HERMES_SETUP.md`](../ai_context/HERMES_SETUP.md)
- **Orchestration:** [`ai_context/AGENT_ORCHESTRATION.md`](../ai_context/AGENT_ORCHESTRATION.md)