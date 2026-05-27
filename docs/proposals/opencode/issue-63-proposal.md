# OA Proposal — Issue #63

## Title
[GROK] /to_do/3 reconcile stale docs vs implementation

## Source
GitHub issue #63

## Objective
## Objective
Update docs that still mark implemented backend/on-chain features as pending. Keep one accurate operational source of truth with concrete references.

## Source
Deep audit: `docs/intake/2026-05-24-repo-deep-audit-todo.md`

## Owner
grok

## Priority
P1

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
- Rollback: revert branch `exp/opencode-issue-63` and close draft PR.
