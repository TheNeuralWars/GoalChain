# Propuesta de estructura — finalización Plan Maestro

**Objetivo:** Un repo donde cualquier agente encuentra **una entrada**, **un dueño** y **una fuente de verdad** por vértice.

**Estado:** Propuesta 2026-05-26 — aplicar en PRs pequeños post-merge stack.

---

## 1. Árbol objetivo (añadir / mover)

```
ai_context/
  MASTER_PLAN.md              ← NUEVO hub ejecutivo
  AGENT_ORCHESTRATION.md
  HERMES_SETUP.md
  META_CHARTER.md

docs/
  governance/                 ← NUEVO paquete
    MASTER_PLAN_INDEX.md
    VERTEX_REGISTRY.md
    PARAMETER_EXCELLENCE.md
    AGENT_DIRECTIVES.md
    STRUCTURE_PROPOSAL.md
  audit/                      ← NUEVO (opcional Fase 2)
    MATRIX.csv                ← path,export,used_by,action
  intake/                     (sin cambio; briefs tácticos)
  ECONOMIC_CANONICAL_CONFIG.json

goalchain_program/
goalchain_oracle/
goalchain_api/
goalchain_webapp/
goalchain-sdk/
ops/hermes/

_archive/                     ← NUEVO (post-Mundial)
  goalchain_backend/          mover desde root
  goalchain_web/              si sigue vacío
```

---

## 2. Cambios inmediatos (bajo riesgo)

| Acción | PR owner | Notas |
|--------|----------|-------|
| Enlazar `README.md` → `ai_context/MASTER_PLAN.md` | Cursor/Antigravity | Hecho o en mismo PR |
| `docs/intake/README.md` → apuntar a governance index | Hermes/Cursor | |
| `BACKLOG_STATUS_MODEL.md` → regla Mundial freeze | Cursor | |
| `goalchain_backend/ARCHIVED.md` | done | No mover hasta post-Mundial |
| Eliminar referencias a `goalchain_web` en README si vacío | Antigravity | |

---

## 3. Cambios post-Mundial (medio riesgo)

| Acción | Razón |
|--------|-------|
| Mover `goalchain_backend/` → `_archive/` | Reduce confusión arquitectura (L7) |
| Generar `docs/audit/MATRIX.csv` desde script | Trazabilidad 2500+ archivos |
| Deprecar `DashboardHub.tsx` (borrar o mover `_archive`) | Código muerto |
| Unificar coach: `goalchain_webapp/src/hooks/useCoach.ts` | Elimina localhost L8 |
| `exp/` → `_archive/exp-dexter` o README “no productivo” | Scope creep |

---

## 4. CI / scripts sugeridos

| Script | Propósito |
|--------|-----------|
| `scripts/verify-canonical-economy.sh` | Diff JSON vs API `/api/economy/config` |
| `scripts/check-tasks.sh` | Ya existe — añadir filtro label `mundial-mvp` |
| `.github/workflows/mundial-smoke.yml` | `smoke-devnet.sh` en PR touching webapp |

---

## 5. Vercel / DNS (fuera del repo, checklist CEO)

| Variable | Valor |
|----------|-------|
| `VITE_API_BASE_URL` | `https://crm.goalchain.fun/goalchain-api` |
| Play host | `play.goalchain.fun` → ver `docs/PLAY_DEPLOY_GUIDE.md` |

---

## 6. Orden de aplicación (3 PRs)

1. **PR-A governance docs** — solo `ai_context/MASTER_PLAN.md` + `docs/governance/*` + README links  
2. **PR-B post-merge** — Antigravity merge stack + actualizar `IMPLEMENTATION_STATUS`  
3. **PR-C deploy** — Vercel env + smoke workflow  

No mezclar A+B+C en un solo PR (regla collab-multi-agent).
