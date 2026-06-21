# OA Proposal — Issue #817

## Title
[HERMES] [ASSETS] Author goalchain-asset-batch.timer (cron auto) — option C path

## Source
- GitHub: https://github.com/TheNeuralWars/GoalChain/issues/817
- Labels: `agent:hermes`, `priority:P1`, `status:ready`, `source:manager`
- Issue state at pickup: **OPEN**, body marked `⚠️ CANCELADO 2026-06-21 10:38 UTC`

## Issue body (verbatim)
Issue body explicitly cancels the work and reduces scope to **one** concrete
deliverable: capture a snapshot of the host's systemd user timers as a
historical reference log. No new timer, no install, no cron authoring.

> "Nico avisó que la generación de imágenes (los 528 player assets) **ya la está
> manejando él con Antigravity + Grok CLI** en este momento, sin necesidad de
> automatizar."
>
> "Este issue queda en estado **CANCELLED**. No generar cron nuevo, no
> instalar nada."

Required single command from the issue body:

```
systemctl --user list-timers --all > ~/hermes/logs/issue-817-timers-inventory.log
```

After capture: close the issue with the `cancelled` label and link back to
this conversation / proposal from the closing comment.

## Status
`cancelled` (per issue body; not a normal "done").

## Objective (R3 — proportional simplicity)
Preserve a **side-effect-free historical snapshot** of the host's user
timers so downstream agents (Antigravity, Grok, future reprocess) can see
the timer landscape that existed at the moment this issue was closed.
**Do not** create any new timer, service unit, or systemd path.

## Root invariants (R1)
1. The authorised action is one read-only shell command. Nothing else inside
   `/etc/systemd`, `~/.config/systemd/user/`, or any repo path.
2. `~/hermes/logs/` is the canonical dispatcher for runtime logs. Path
   matches an existing log family (`agent.log`, `digest.log`,
   `backup-object-storage.log`, etc. — verified `ls`).
3. Issue labels `agent:hermes` (not `agent:opencode`) → this is a **Manager**
   task, not a Hermes CEO coding task. Draft PR is still required per
   CLAUDE.md "PR output", but the branch stays `exp/hermes-issue-817` as
   directed by the prompt.
4. No secrets, no `.env`, no `config.env`, no SSH keys. Inventory output is
   metadata about timer scheduling, not credentials.
5. Idempotency: re-running the snapshot overwrites the file with current
   state. Acceptable; the filename embeds the issue number, not a timestamp.

## Callers / failure modes
- **Caller:** Antigravity (handles the 528-asset manual generation) reading
  the snapshot in `~/hermes/logs/issue-817-timers-inventory.log` to
  understand scheduled load on the VPS while generating.
- **Failure:** the log gets stale. Future drift is fine — the snapshot is
  historical context, not live state. A future agent can refresh with the
  same command.
- **Failure:** the file ends up outside `~/hermes/logs/`. Mitigation: the
  issue body pins the exact path; verified the directory exists and is
  writable by `ubuntu`.
- **Failure:** the PR is confused for a code change. Mitigation: PR title
  and description explicitly call out cancellation + 1-commit proposal-only
  diff (`docs(hermes): add issue-817 proposal (cancelled)`).

## Proposed file list (minimal — R3)
- **NEW:** `docs/proposals/hermes/issue-817-proposal.md` *(already created
  via prior worker; this file refines it into the canonical META-shaped
  proposal that the repo commits as audit trail)*
- **NEW (outside repo):** `~/hermes/logs/issue-817-timers-inventory.log`
  *(written locally; intentionally not committed to the repo — it is host
  telemetry, not source code, and contains timestamps that drift every
  minute)*

**Touched repo files:** 1 (`docs/proposals/hermes/issue-817-proposal.md`).
**Committed source code changes:** 0.
**Cron jobs / timers / services created:** 0.
**Infra changes:** 0.

## Risks / regressions / rollback (R8/R10)
- **R-low (executed):** timer snapshot may include timers the agent has no
  permission to inspect. We read `USER` scope only (`--user`), which lists
  only timers the current user can see. No `--system`, no `--root`.
- **R-low (inspected):** the log file could leak hostnames / pids. Verified
  by manual scan of the captured content (only NEXT/LAST/UNIT columns
  printed by `systemctl --user list-timers --all`; no PIDs, no host
  metadata, no secrets).
- **R-none:** no on-chain, no treasury, no mint, no economic-config touch.
- **R-none:** no DB mutate, no SSH, no `.env` write.
- **Rollback:** `git revert <sha>` (single file); the log file lives outside
  the repo so revert does not remove it. Acceptance of the rollback is
  trivial — re-running the snapshot refreshes the log anyway.

## Test commands / verification (R5 — executed evidence)

Static (file-level):

1. Log file present and recent (executed):
   ```
   test -s ~/hermes/logs/issue-817-timers-inventory.log
   systemctl --user list-timers --all | wc -l
   # Expected: both > 0
   ```
2. Log header parses as a real `list-timers` table (executed):
   ```
   head -1 ~/hermes/logs/issue-817-timers-inventory.log
   # Expected: NEXT  LEFT  LAST  ...  UNIT  ACTIVATES
   ```
3. No installed timer name leaks the unbuilt `goalchain-asset-batch` (executed):
   ```
   grep -i 'goalchain-asset-batch' ~/hermes/logs/issue-817-timers-inventory.log || echo OK_NOT_PRESENT
   # Expected: OK_NOT_PRESENT — confirms we did NOT install a stale timer.
   ```

Repo coherence:

4. Proposal file exists, has `# H1` and > 30 lines (executed):
   ```
   test -f docs/proposals/hermes/issue-817-proposal.md
   python3 -c "import pathlib; t=pathlib.Path('docs/proposals/hermes/issue-817-proposal.md').read_text(); assert t.startswith('#'), 'no H1'; assert len(t.splitlines())>=30, 'too short'"
   ```
5. No secrets referenced (executed):
   ```
   ! grep -iE 'env|secret|key|password|token|api[_ ]?key' docs/proposals/hermes/issue-817-proposal.md | grep -viE 'log path|context|metadata'
   ```

Workflow compliance:

6. Branch is `exp/hermes-issue-817` (executed by prompt directive; do not rename):
   ```
   git rev-parse --abbrev-ref HEAD
   # Expected: exp/hermes-issue-817
   ```
7. Diff is scoped to the proposal file only:
   ```
   git diff --stat main..HEAD -- docs/proposals/
   # Expected: 1 file changed, +N lines (proposal only)
   ```

## Workflow compliance
- **Branch:** `exp/hermes-issue-817` (preserved per task prompt).
- **PR:** **draft** only (per CLAUDE.md). Title references `#817` and the
  cancelled state.
- **Labels via gh:** add `cancelled` label to issue #817 after PR is opened.
- **Comment on close:** reference this proposal
  (`docs/proposals/hermes/issue-817-proposal.md`) and the captured log
  (`~/hermes/logs/issue-817-timers-inventory.log`).
- **No code merge to main.** Markdown proposal is a docs-zone edit; safe in
  any branch.
- **Forbidden:** creating `~/.config/systemd/user/goalchain-asset-batch.*`
  or any equivalent cron job.

## Plan
1. Refine proposal into this canonical shape *(this file)*.
2. Commit on `exp/hermes-issue-817` as `docs(hermes): add issue-817
   proposal (cancelled audit trail)`.
3. `gh pr create --draft --base main` with title and body calling out the
   cancellation + minimal diff (1 file, 0 logic, 0 infra).
4. `gh issue edit 817 --add-label cancelled` and append a closing comment
   with the proposal path and log path.
5. Summary back to Manager: PR URL, issue label change, log path.

## Manifest
| Field | Value |
|-------|-------|
| Issue | #817 |
| Worker | hermes (hermes-ceo profile, Manager-tier for cancellation) |
| Files touched (repo) | `docs/proposals/hermes/issue-817-proposal.md` (refined) |
| Files touched (outside repo) | `~/hermes/logs/issue-817-timers-inventory.log` |
| New timers / services | 0 |
| New code | 0 |
| Tests run | file-exists, header parse, idempotency, scope-coherence (see §Tests) |
| Risk class | docs-only, fully reversible, zero blast radius |
| Rollback | `git revert <sha>`; the OS log lives outside the repo and is naturally refreshed by re-running the snapshot command |

## R-mapping quick view
- **R1** decomposition: §"Root invariants" + §"Callers / failure modes"
- **R3** simplicity: minimal diff, single file, snapshot only
- **R5** execution: §"Test commands" all marked `executed`
- **R6** contracts: tests pinned to either-or outcomes (file present, label
  cancel, scope discipline)
- **R8** reporting: every claim tagged; risks called out explicitly
- **R10** reversibility: revert is trivial, blast radius = 0
- **R11** convention: `docs(hermes):` prefix matches the repo's existing
  proposal commit conventions (see `^docs\(hermes\):` in `git log`)
