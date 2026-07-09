# FCC batch queue — Nico dispatch 2026-05-25

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/255
- **Task Status:** closed

**Status:** **CLOSED** (2026-07-09) — batch was FROZEN on 2026-05-26 per [`2026-05-26-mundial-fcc-queue-freeze.md`](2026-05-26-mundial-fcc-queue-freeze.md); Mundial MVP track completed. Intake closed by issue #852.

**Owner:** FCC (`agent:opencode`) via `oa-worker`  
**Order:** worker picks `status:ready` issues one at a time; prefer this sequence.

| Order | Issue | Priority | Title |
|-------|-------|----------|-------|
| 1 | [#95](https://github.com/TheNeuralWars/GoalChain/issues/95) | P2 | OAuth remote runbook |
| 2 | [#96](https://github.com/TheNeuralWars/GoalChain/issues/96) | P2 | Simulation badges webapp |
| 3 | [#97](https://github.com/TheNeuralWars/GoalChain/issues/97) | P2 | API health banner webapp |
| 4 | [#99](https://github.com/TheNeuralWars/GoalChain/issues/99) | P1 | smoke-devnet.sh hardening |
| — | ~~[#93](https://github.com/TheNeuralWars/GoalChain/issues/93)~~ | — | **Fuera de cola FCC** — tarea Hermes/Manager (Discord), no `oa-worker` |

**Orden activo del worker:** #95 → #96 → #97 → #99 (por `createdAt`; #93 sin `agent:opencode`).

**Dispatched:** 2026-05-25 by Cursor (Nico request). Labels: `agent:opencode`, `status:ready`, `fcc-batch` en #95–#99.

**Rules for all:** draft PR only, read `CLAUDE.md`, no merge to `main`, Antigravity reviews.

**Hermes:** Do not create duplicate issues for this batch.
