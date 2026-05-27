# OA Proposal — Issue #71

## Title
[GROK] /to_do/11 unify backlog status model

## Source
GitHub issue #71

## Objective
## Objective
Harmonize docs/intake, docs/issues and execution backlog status taxonomy and references.

## Source
Deep audit: `docs/intake/2026-05-24-repo-deep-audit-todo.md`

## Owner
grok

## Priority
P2

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- Keep scope tight to this todo
- Open PR or update issue with execution notes
- If blocked by external dependency/credential/approval, document blocker and continue with next todo

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-71` and close draft PR.
