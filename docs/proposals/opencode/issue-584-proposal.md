# OA Proposal — Issue #584

## Title
[OPENCODE] [P1][docs][api] Point goalchain.fun JS to production API base

## Source
GitHub issue #584

## Objective
## Objective
[P1][docs][api] Point goalchain.fun JS to production API base

## Owner
opencode

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). **All implementation by server workers (FCC/OpenCode)** — not Antigravity Mac or Grok gateway.

Original agent assignment: antigravity

## Workflow (Producer-Critic Pattern)
1. **Implementer** (opencode via FCC/OpenCode) creates PR on branch `exp/opencode-issue-XXX`
2. **Critic Agent** reviews PR automatically (read-only, no code changes)
3. Critic posts structured review: PASS/FAIL + findings
4. If FAIL: Implementer addresses findings, pushes updates
5. If PASS: Label `status:critic_pass` → Antigravity/Nico human review
6. Merge after human approval

## Required Output (Implementer)
- Proposed file list
- Risks/regressions + rollback
- Exact test commands
- **Structured plan JSON** as FIRST output

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-584` and close draft PR.
