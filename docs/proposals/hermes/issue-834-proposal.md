# OA Proposal — Issue #834

## Title
[HERMES] Generación automática de videos 9:16 con Grok, Kokoro y Hyperframes

## Source
GitHub issue #834

## Objective
## Objective
Implementar pipeline que: 1) obtiene un tema o prompt (por defecto desde un archivo de queue o args), 2) usa Grok para generar guion en español/inglés, 3) usa Kokoro (TTS) con voz de Enzo Bit para sintetizar audio, 4) usa Hyperframes (o plantilla de video) para generar secuencia visual 9:16, 5) combina audio y video en MP4 usando ffmpeg, 6) guarda el video en ~/hermes/workspace/GoalChain/output/videos/ con timestamp, 7) envía notificación a Discord (canal configurado via webhook o variable DISCORD_NOTIFY_WEBHOOK) con mensaje y opcionalmente adjunta el video si tamaño permitido, 8) incluye manejo de errores y log. No requiere Buffer; la publicación queda como paso manual o futuro cuando se disponga de token.

## Owner
hermes

## Priority
P1

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
- Rollback: revert main commit linked to issue #834
