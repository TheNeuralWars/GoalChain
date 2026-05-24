# GoalChain Workflow (Permanent Rules)

This document defines the mandatory workflow for all agents working on GoalChain (FCC, Cursor, Antigravity, Manager, etc.).

## 1. Planning Mode (Mandatory)

Before writing any code, every agent **must** follow this sequence:

1. **Research Phase**
   - Understand the full context of the task.
   - Review relevant files, existing code, and documentation.

2. **Create `implementation_plan.md`**
   - List all files that will be created or modified.
   - Include exact paths.
   - Classify changes (new feature, refactor, bugfix, etc.).

3. **Maintain `task.md`**
   - Keep a living TODO list.
   - Update status as work progresses.

4. **Document tests in `walkthrough.md`**
   - Include step-by-step verification.
   - Add Mermaid flow diagrams when useful.

## 2. Persistence Rule

- Once a task is started, **do not stop** until it is fully delivered.
- Always try the best solution first.
- If the best solution fails, move to the second best, and so on.
- **Never leave a task unfinished** waiting for external nudges.

## 3. Evidence-Based Communication

All statements must be backed by evidence using these tags:

- `[executed]` — Action was performed.
- `[inspected]` — Code or output was reviewed.
- `[assumed]` — Based on reasonable assumption (must be validated later).

**No superlatives, no fluff, no false optimism.** Be direct.

## 4. Economic & Security Rules

- All economic logic **must** follow `docs/ECONOMIC_CANONICAL_CONFIG.json`.
- Use **DevGoaL wallets** for Solana Devnet testing and transaction mocks.
- Never hardcode private keys or secrets.

## 5. FCC Delivery Rule (Specific)

When Free Claude Code (opencode) receives a task:

- It **must** complete the full objective.
- It **must** open a Pull Request with the changes.
- It should not consider the task finished until a PR exists.

## 6. Agent Coordination

- Issues using `dispatch:local-queued` + `agent:opencode` are handled by the Local Bridge.
- The Manager monitors these issues and notifies when PRs are opened.
- All agents should read this `WORKFLOW.md` at the start of any task.

---

**Last updated:** 2026-05-24
**Applies to:** All agents working on GoalChain
