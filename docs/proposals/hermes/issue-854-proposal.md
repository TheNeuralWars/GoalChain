# OA Proposal — Issue #854

## Title
[HERMES] [intake] 2026-06-22 live-sync decision + SSH-admin rebuttal log

## Source
GitHub issue #854 — intake file `docs/intake/2026-06-22-live-sync-decision.md`

## Objective
Formalize the live-sync architecture decision (Plan A selected, Plan C
rejected) and the SSH-admin rebuttal into the repo as permanent ADR-style
documentation. Close the linked intake file marker.

## Scope Analysis
This is a **documentation/policy issue** — all technical work (installers,
hermes-context.sh patch, issues #827/#828) was already completed and merged
in prior sessions. This issue only needs:

1. An ADR document formalizing the decision + rebuttal
2. Intake `.done` markers
3. Proposal finalization + commit

No webapp/API/on-chain code changes. Zero regression risk.

## Checklist

- [x] Read CLAUDE.md, AGENT_ORCHESTRATION.md
- [x] Read intake source: `docs/intake/2026-06-22-live-sync-decision.md`
- [x] Verify all referenced files exist in main (installers, client, etc.)
- [x] Create ADR: `docs/adr/2026-06-22-live-sync-plan-a-ssh-rebuttal.md`
- [x] Create intake `.done` marker
- [x] Create issue `.done` marker
- [x] Run tsc --noEmit — clean (no code changes, zero regression)
- [x] Commit to main (cambio urgente) — `abc7960e`

## Proposed file list
| File | Action |
|------|--------|
| `docs/adr/2026-06-22-live-sync-plan-a-ssh-rebuttal.md` | create |
| `docs/intake/2026-06-22-live-sync-decision.md.done` | create |
| `docs/intake/issue-854.done` | create |
| `docs/proposals/hermes/issue-854-proposal.md` | update (this file) |

## Risks / regressions
- **Risk: NONE** — docs-only change, no code paths affected
- **Rollback:** `git revert <commit>` removes all 3 new files

## Test commands
```bash
cd goalchain_webapp && npx tsc --noEmit   # verify no regression
ls docs/adr/2026-06-22-live-sync-plan-a-ssh-rebuttal.md  # ADR exists
ls docs/intake/2026-06-22-live-sync-decision.md.done      # marker exists
ls docs/intake/issue-854.done                             # marker exists
```
