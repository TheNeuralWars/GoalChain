# Antigravity — spikes post-merge (GoalChain)

- **Status:** draft (blocked until PRs #26–#34 en `main`)
- **Priority:** P2
- **Owner (implementer):** antigravity
- **Reviewers:** cursor
- **Created:** 2026-05-23

## Objective

Explorar mejoras UI/cliente y skills en ramas `exp/antigravity-*` **después** de que `main` incluya la stack #26–#34.

## Context

- **Manager (OpenClaw):** intake y priorización por WhatsApp — no implementa merges.
- **Cursor:** único integrador a `main`.
- Handoff ops server: `docs/intake/2026-05-23-antigravity-hermes-openclaw-handoff.md` (marcar `done` cuando Nico confirme).

## Allowed files

- `goalchain_webapp/src/ui/**` (solo en branch `exp/antigravity-*`)
- `ai_context/01_guidelines/**` (borradores)
- `docs/intake/*.md`

## Out of scope

- `goalchain_program`, `goalchain_api`, merges a `main`
- Editar `~/.openclaw` en server (solo Cursor/Nico ops)

## Suggested spikes (pick 1)

1. `exp/antigravity-webapp-polish` — glass UI en `TradingTerminal` / `FixturesPanel` (mock data OK)
2. `exp/antigravity-ai-commentator` — prototipo `AICommentator.tsx` sin wire prod
3. `exp/antigravity-docs-skills` — skill pack Solana para agentes

## Acceptance criteria

- Branch `exp/antigravity-<slug>` con README de 1 página: approach, riesgos, propuesta de PR
- Sin merge; Cursor cherry-pick si aprueba Nico

## Test commands

```bash
cd goalchain_webapp && npm run build
```
