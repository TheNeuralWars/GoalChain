# OA Proposal: Issue #5 — [OPENCODE] [P2][webapp][smart-contracts] Post-Mundial live market bets UI

**Worker:** theta (partition 7)
**Owner:** opencode
**Priority:** P2
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
## Objective
[P2][webapp][smart-contracts] Post-Mundial live market bets UI

## Owner
opencode

## Priority
P2

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). **All implementation by server workers (FCC/OpenCode)** — not Antigravity Mac or Grok gateway.

Original agent assignment: opencode
Epic: post-mundial
Blocked by: scope-freeze,master-plan

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
