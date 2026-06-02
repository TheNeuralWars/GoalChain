# Merge stack #26–#34 + convergencia multi-agente

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/247
- **Task Status:** ready

- **Status:** ready
- **Priority:** P0
- **Owner (implementer):** cursor
- **Reviewers:** grok, manager (OpenClaw)
- **Created:** 2026-05-23

## Objective

Cerrar la cadena apilada **#26 → #34** en `main`, desbloquear intake/webapp y alinear **Manager (OpenClaw)**, **Cursor**, **Grok**, **Antigravity**.

## Context

Cadena real (no solo #32–#34):

| PR | Base → Head |
|----|-------------|
| [#26](https://github.com/TheNeuralWars/GoalChain/pull/26) | `main` → `week1-p0-canonical-config` |
| [#27](https://github.com/TheNeuralWars/GoalChain/pull/27) | `week1` → `week2-p1-fee-split` |
| [#28](https://github.com/TheNeuralWars/GoalChain/pull/28) | `week2` → `week3-p1-stamina-xi-cap` |
| [#29](https://github.com/TheNeuralWars/GoalChain/pull/29) | `week3` → `week4-p1-rent-ux-api` |
| [#30](https://github.com/TheNeuralWars/GoalChain/pull/30) | `week4` → `week5-p2-mint-gate-policy` |
| [#31](https://github.com/TheNeuralWars/GoalChain/pull/31) | `week5` → `week6-7-p2-vault-crank-tracker` |
| [#32](https://github.com/TheNeuralWars/GoalChain/pull/32) | `week6` → `week8-9-p3-consolidation-observability` |
| [#33](https://github.com/TheNeuralWars/GoalChain/pull/33) | `week8-9` → `video-alert-automation-hardening` |
| [#34](https://github.com/TheNeuralWars/GoalChain/pull/34) | `video` → `observability-kpi-health-guards` |

**OpenClaw / Manager:** operador 24/7 (WhatsApp). **Antigravity:** spikes `exp/antigravity-*` tras `main` actualizado.

## CI blockers conocidos (2026-05-23)

- `goalchain-program-ts`: Prettier en `scripts/create_token.js`, `tests/treasury_agents_test.ts`
- `goalchain-api`: `goalchain-sdk` falta `rootDir` en `tsconfig.json`
- `npm-audit` / `dependency-review`: revisar si son required en ruleset
- `Vercel`: permisos autor git (no bloquea merge si no es required)

## Allowed files

- `goalchain_program/scripts/create_token.js`
- `goalchain_program/tests/treasury_agents_test.ts`
- `goalchain-sdk/tsconfig.json`
- `ai_context/AGENT_ORCHESTRATION.md`
- `docs/intake/*.md` (este archivo)

## Out of scope

- Features nuevas fuera de fixes CI mínimos para merge
- Cambios on-chain sin brief P0

## Acceptance criteria

1. Merge secuencial #26…#34 a `main` (o squash según preferencia Nico)
2. `main` tiene `docs/intake/`, health endpoint, flags video OFF
3. Brief `2026-05-22-webapp-devnet-transactions.md` pasa a `assigned` → Cursor
4. `ai_context/AGENT_ORCHESTRATION.md` refleja orden #26–#34 y roles post-merge

## Test commands

```bash
cd goalchain_program && npm run lint
cd goalchain-sdk && npm run build
cd goalchain_api && npm test
cd goalchain_oracle && npm test
```

## Post-merge — agentes

| Agente | Siguiente trabajo |
|--------|-------------------|
| **Manager** | Sync server, anunciar stack cerrado, cola intake |
| **Cursor** | `feat/webapp-devnet-mvp` desde `main` |
| **Grok** | Review PR webapp |
| **Antigravity** | `exp/antigravity-*` UI/skills; no tocar `main` sin PR |

## Rollback

Revert merge commits en orden inverso #34→#26 si economía/oracle rompe prod.
