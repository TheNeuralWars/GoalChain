# OA Proposal: Issue #646 — [OPENCODE] [P2][oracle][economy] Post-Mundial real vault_crank execute path

**Worker:** sigma (partition 6)
**Owner:** opencode
**Priority:** P2
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
## Objective
[P2][oracle][economy] Post-Mundial real vault_crank execute path

## Owner
opencode

## Priority
P2

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). **All implementation by server workers (FCC/OpenCode)** — not Antigravity Mac or Grok gateway.

Original agent assignment: antigravity
Epic: post-mundial
Blocked by: 2,master-plan

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
