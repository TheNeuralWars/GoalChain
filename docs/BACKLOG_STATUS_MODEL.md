# Backlog status model (unified)

**Applies to:** `docs/intake/*.md`, `docs/issues/*.md`, `docs/EXECUTION_BACKLOG_90D.md`, GitHub Issues (Manager)

## Canonical statuses

| Status | Meaning | GitHub label |
|--------|---------|--------------|
| `draft` | Idea captured, not ready to implement | — |
| `ready` | Scoped, owner assigned, can start | `status:ready` |
| `in_progress` | Actively being worked | `status:in_progress` |
| `blocked` | Waiting external input | `status:blocked` |
| `done` | Merged / deployed / accepted | `status:done` |
| `cancelled` | Duplicate or won't do | — (note in intake body) |

## Priority

`P0` > `P1` > `P2` — mirror GitHub labels `priority:P0|P1|P2`.

## Owner agents

`cursor` | `opencode` | `antigravity` | `grok` | `hermes` — label `agent:<name>`.

## Where each source lives

| Source | Path | Primary use |
|--------|------|-------------|
| Intake briefs | `docs/intake/YYYY-MM-DD-*.md` | Pre-implementation scope, handoffs |
| Atomic issues | `docs/issues/*.md` | 90d engineering breakdown |
| Execution backlog | `docs/EXECUTION_BACKLOG_90D.md` | Sprint-level plan |
| Manager queue | GitHub Issues + `./scripts/check-tasks.sh` | Live assignment |
| Deep audit | `docs/intake/2026-05-24-repo-deep-audit-todo.md` | Repo-wide `/to_do/n` |

## Required front-matter (intake briefs)

```markdown
- **Status:** ready | in_progress | done | blocked | cancelled
- **Priority:** P0 | P1 | P2
- **Owner:** cursor | opencode | ...
```

## Sync rules

1. **One canonical brief per feature** — duplicates → `cancelled` + link.
2. When a GitHub issue closes, update the linked intake brief `Status` → `done`.
3. `/to_do/n` items in the audit doc are the integration owner's rollup; mark `— done` there when merged.
4. Do not mark `done` in backlog docs until code is on `main` (or explicitly deployed for ops-only tasks).

## Mundial 2026 freeze (2026-05-26 → 2026-06-11)

- **Single P0 track:** `docs/intake/MUNDIAL-2026-MVP.md` — label GitHub `mundial-mvp`
- **FCC batch #95–#99:** frozen — see `docs/intake/2026-05-26-mundial-fcc-queue-freeze.md`
- **Scope policy:** `docs/intake/HERMES-MUNDIAL-SCOPE-FREEZE.md`
- **Master plan hub:** `ai_context/MASTER_PLAN.md` · index `docs/governance/MASTER_PLAN_INDEX.md`

New `ready` issues outside Mundial require CEO exception (`cambio urgente`) noted in intake body.

## Discovery

```bash
./scripts/check-tasks.sh          # GitHub ready tasks
grep -r "Status:" docs/intake/    # intake statuses
```
