# OA Proposal — Issue #573

## Title
[OPENCODE] [FCC] #523 Content Analytics Engine

## Source
GitHub issue #573

## Objective
## Objective
Implement goalchain-content-analytics skill per intake 2026-06-04-growth-task-5. Build analytics engine for content performance tracking across platforms (X, Discord, YouTube). Requirements: track engagement metrics, ROI per content piece, viral coefficient, best posting times. Output: TypeScript skill in skills/goalchain-content-analytics/ with CLI + MCP server. Verify: npm run lint && npm test. Apply gstack investigate workflow for any bugs.

## Owner
opencode

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Workflow (Producer-Critic Pattern)
1. **Implementer** (opencode) creates PR on branch `exp/opencode-issue-XXX`
2. **Critic Agent** reviews PR automatically (read-only, no code changes)
3. Critic posts structured review: PASS/FAIL + findings
4. If FAIL: Implementer addresses findings, pushes updates
5. If PASS: Label `status:critic_pass` → Antigravity/Nico human review
6. Merge after human approval

## Required Output (Implementer)
- Proposed file list
- Risks/regressions + rollback
- Exact test commands
- **Structured plan JSON** as FIRST output (see below)

## Required First Output: Plan JSON
Before any code changes, output this JSON to stdout:
```json
{
  "goal": "Brief description of the objective",
  "issue_number": 123,
  "branch": "exp/opencode-issue-123",
  "steps": [
    {"action": "create vector/ dir", "files": ["src/vector/turbovec_store.py"], "depends_on": []},
    {"action": "implement player index", "files": ["src/vector/player_index.py"], "depends_on": ["create vector/ dir"]}
  ],
  "dependencies": ["turbovec pip package"],
  "risks": ["turbovec API changes", "embedding dim mismatch"],
  "verification": ["pip install turbovec", "python -m pytest tests/vector/", "index build <2s", "RAM <50MB"]

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #573
