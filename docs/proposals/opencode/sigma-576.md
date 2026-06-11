# OA Proposal: Issue #576 — [OPENCODE] [P0][economy][oracle] Block vault_crank execute mode until real Jupiter/burn integration

**Worker:** sigma (partition 6)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
## Objective
[P0][economy][oracle] Block vault_crank execute mode until real Jupiter/burn integration

## Owner
opencode

## Priority
P0

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
