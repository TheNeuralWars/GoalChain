# OA Proposal — Issue #852

## Title
[HERMES] [intake] FCC batch queue — Nico dispatch 2026-05-25

## Source
GitHub issue #852

## Objective
Close the FCC batch queue intake marker (2026-05-25-fcc-batch-queue.md).
The batch (#95→#96→#97→#99) was FROZEN on 2026-05-26 in favor of the
Mundial 2026 MVP track. The Mundial MVP has since shipped (.done exists).
This issue is documentation/dispatch closure — no functional code changes.

## Owner
hermes

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). The batch queue was
dispatched 2026-05-25 by Cursor with labels `agent:opencode`, `status:ready`,
`fcc-batch` on issues #95–#99. One day later (2026-05-26) the queue was
frozen to focus all FCC capacity on the Mundial MVP demo.

## Batch queue (frozen issues)
| Order | Issue | Priority | Title | Freeze status |
|-------|-------|----------|-------|---------------|
| 1 | #95 | P2 | OAuth remote runbook | frozen |
| 2 | #96 | P2 | Simulation badges webapp | superseded by Mundial MVP |
| 3 | #97 | P2 | API health banner webapp | superseded by Mundial MVP |
| 4 | #99 | P1 | smoke-devnet.sh hardening | superseded by Mundial MVP |
| — | ~~#93~~ | — | Fuera de cola FCC (Discord) | never in FCC queue |

## Implementation checklist
- [x] Read CLAUDE.md, AGENT_ORCHESTRATION.md
- [x] Verify intake source file exists (2026-05-25-fcc-batch-queue.md)
- [x] Verify freeze file exists (2026-05-26-mundial-fcc-queue-freeze.md)
- [x] Verify Mundial MVP .done exists (MUNDIAL-2026-MVP.md.done)
- [x] Update intake source: mark status CLOSED (freeze executed)
- [x] Create intake .done marker: 2026-05-25-fcc-batch-queue.md.done
- [x] Create issue .done marker: issue-852.done
- [x] No duplicate issues created
- [x] No code changes needed
- [x] Commit direct to main (cambio urgente)

## Files touched
- `docs/intake/2026-05-25-fcc-batch-queue.md` — status update FROZEN→CLOSED
- `docs/intake/2026-05-25-fcc-batch-queue.md.done` — intake closure marker
- `docs/intake/issue-852.done` — issue closure marker
- `docs/proposals/hermes/issue-852-proposal.md` — this proposal

## Risk / rollback
- Risk: None. Documentation-only changes with no functional impact.
- Rollback: `git revert <commit-sha>`

## Test commands
```bash
# Verify markers exist
ls -la docs/intake/2026-05-25-fcc-batch-queue.md.done
ls -la docs/intake/issue-852.done
# Verify no build regressions (docs only, but sanity check)
cd goalchain_webapp && npx tsc --noEmit
```
