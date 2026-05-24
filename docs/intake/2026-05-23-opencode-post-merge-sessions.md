# OpenCode — sesiones post-merge (GoalChain)

- **Status:** draft (blocked until PRs #26–#34 en `main`)
- **Priority:** P2
- **Owner (implementer):** opencode
- **Reviewers:** cursor
- **Created:** 2026-05-23

## Objective

Usar OpenCode como copiloto de sesiones para prototipos y alternativas en ramas `exp/opencode-*` despues de que `main` tenga la stack #26–#34.

## Context

- **Manager (OpenClaw):** intake y priorizacion por WhatsApp.
- **Cursor:** unico integrador a `main`.
- **OpenCode:** apoyo en sesiones, propuestas de implementacion y diffs revisables.
- Reglas base: `ai_context/AGENT_ORCHESTRATION.md`, `ai_context/META_CHARTER.md`.

## Allowed files

- `goalchain_webapp/src/**` (solo en branch `exp/opencode-*`)
- `goalchain_oracle/src/**` (solo prototipos y guardrails no productivos)
- `docs/intake/*.md`
- `ai_context/**` (solo docs de proceso)

## Out of scope

- Merge directo a `main`
- Cambios on-chain de alto riesgo sin brief P0
- Editar `~/.openclaw` en server (solo Cursor/Nico ops)

## Suggested sessions (pick 1)

1. `exp/opencode-webapp-devnet-flow` — wireframe de flujo devnet en UI con datos reales (sin merge)
2. `exp/opencode-oracle-guardrails` — hardening no invasivo y runbook corto
3. `exp/opencode-docs-cleanup` — claridad de handoffs y prompts multi-agente

**Spike iniciado:** `exp/opencode-dexter-solana-adaptation` — Análisis de adaptación de Dexter a Solana como base para agentes tokenizables.

**Estado actual:** Análisis inicial completado. Ver `docs/DEXTER_SOLANA_ADAPTATION.md` y `exp/opencode-dexter-solana-adaptation/ANALYSIS.md`.

## Acceptance criteria

- Branch `exp/opencode-<slug>` con:
  - diff acotado al scope
  - nota de riesgos/regresiones
  - plan de rollback en 3-5 lineas
- Sin merge: Cursor decide cherry-pick o PR nuevo

## Test commands

```bash
cd goalchain_webapp && npm run build
cd goalchain_oracle && npm test
```
