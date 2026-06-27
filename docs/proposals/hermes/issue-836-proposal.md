# OA Proposal — Issue #836

## Title
[HERMES] [HERMES TASK] Dynamic Token Burn Thresholds (Mistral Large 3 Validation)

## Source
GitHub issue #836

## Objective
## Objective
 - Usar el skill `github-issues` para crear un issue en `GoalChain/GoalChain` con: - Title: `[HERMES TASK] Dynamic Token Burn Thresholds (Mistral Large 3 Validation)` - Body: ```markdown **Objetivo**: Implementar lógica para thresholds dinámicos de burn en función de: 1. Volumen de transacciones en las últimas 24h (umbral: 10% del promedio mensual). 2. Precio del token en USD (umbral: 5% de variación intradiaria). 3. Estado del fondo de liquidez (umbral: 20% de reservas). **Archivos a modificar**: - `src/onchain/token_economy.rs` (lógica de thresholds) - `src/api/v1/thresholds.rs` (endpoint GET `/v1/thresholds`) - `migrations/202606_dynamic_burn_seed.sql` (seed inicial) **Requisitos Mistral Large 3**: - Código debe ser 100% compatible con Nemotron-3-Super (fallback). - Usar `rustc 1.78` y `solana-program 1.18`. - Incluir tests unitarios para los 3 umbrales. - PR debe pasar `cargo clippy -- -D warnings` y `cargo fmt`. **Skills requeridos**: - `github-code-review` (para el PR). - `plan` (para el plan de implementación en `.hermes/plans/`). - `systematic-debugging` (si hay errores). **Priority**: P0 **Etiquetas**: `hermes`, `tokenomics`, `mistral` ``` - Asegurar que el primer commit del PR tenga el mensaje: ``` feat(token-economy): dynamic token burn thresholds [mistral-large-3] ``` - Ejecutar manualmente después de que Hermes CEO abra el PR: ```bash cd ~/hermes/workspace/GoalChain && cargo test --test token_economy_thresholds ``` - Si falla, agregar un comentario en el PR con el error y reabrir la tarea. 

## Owner
hermes

## Priority
P0

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - hermes: `exp/hermes-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #836
