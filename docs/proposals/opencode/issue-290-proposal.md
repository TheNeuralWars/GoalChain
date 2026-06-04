# OA Proposal — Issue #290

## Title
[OPENCODE] [DRAFT] Discord Community Agent + Zealy Leaderboard Integration

## Source
GitHub issue #290

## Objective
## Contexto

El agente de comunidad de Discord ya existe parcialmente como un bot separado en `discord-community-bot/` y un enrutador de marketing en `discord-marketing-router/`. El leaderboard actual es solo web (Google Sheets), sin presencia en Discord. **No hay integración con Zealy en absoluto.**

El usuario reportó que cuando alguien completa una quest en Zealy y pregunta en Discord sobre su posición en el leaderboard, el bot no responde ni muestra los rankings. Zealy tiene API pública documentada.

## Zealy API (Investigación Completada)

- **Base URL:** `https://api.zealy.io/v2`
- **Auth:** `X-API-Key` header
- **API Key actual:** `27e07f...n` — **NO FUNCIONA** (falta scopes)
- **Community ID:** `goalchain` (slug) / `e19c99c0-f978-476a-951e-6422c23ea1d3` (UUID)

### Scopes Necesarios (CRÍTICO)
La API key actual fue generada sin los permisos correctos. Se necesitan:
- ✅ `community:read`
- ✅ `quests:read`
- ✅ `quests:write` (para eliminar quests redundantes)
- ✅ `leaderboard:read`

### Endpoints Disponibles
- `GET /v2/communities/{id}/leaderboard` — Top usuarios con XP
- `GET /v2/communities/{id}/users/{user_id}/xp` — XP individual
- `GET /v2/communities/{id}/quests` — Listar quests
- `DELETE /v2/communities/{id}/quests/{quest_id}` — Eliminar quest
- Webhooks para actualizaciones en tiempo real

## Objetivo

Crear un **subagente de Discord** (community agent) que:
1. **Monitoree Discord** — detecte preguntas sobre leaderboard, quests, posiciones
2. **Consulte Zealy API** — obtenga datos de leaderboard, XP por usuario, quests completadas
3. **Responda en Discord** — muestre rankings, posición individual, progreso
4. **Actualización periódica** — publique rankings diarios/semanales en canales específicos
5. **Auditoría de Quests** — identifique y elimine quests redundantes/repetidas

## Ubicación en el Repo

Crear nuevo directorio: `community-agent/` en la raíz del repo

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-290` and close draft PR.
