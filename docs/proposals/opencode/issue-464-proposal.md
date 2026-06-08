# OA Proposal — Issue #464

## Title
[OPENCODE] [DRAFT] Open Source: GitHub issue/PR templates + auto-label external-contribution

## Source
GitHub issue #464

## Objective
## Objective
## Objective
Implement GitHub issue and PR templates for external contributions, plus auto-labeling for PRs from outside the core team.

## Context
GoalChain is opening to external contributors (institutional + individual). Need proper templates and automation before merge stack #32-#34 lands on main.

## Files to create/modify
- .github/ISSUE_TEMPLATE/bug_report.yml
- .github/ISSUE_TEMPLATE/feature_request.yml
- .github/ISSUE_TEMPLATE/external_contribution.yml (new type)
- .github/PULL_REQUEST_TEMPLATE.md with checklist: tests, docs, economy impact, security
- GitHub Actions workflow for auto-labeling PRs from external contributors with external-contribution label

## Constraints
- Must work with existing CI/CD
- Auto-label logic: PR author not in core team (Nico, Lucas, Antigravity) -> add external-contribution label
- Templates in Spanish + English (primary Spanish per project convention)

## Verification
ls -la .github/ISSUE_TEMPLATE/ .github/PULL_REQUEST_TEMPLATE.md
# Check workflow exists
ls -la .github/workflows/
# Test: create draft PR from fork, verify label applied

## Skill hints
- Follow gstack plan-eng-review before coding (architecture change)
- Apply frontend-design skill for any UI touchpoints (PR template rendering)


## Owner
opencode

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Workflow (Producer-Critic Pattern)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-464` and close draft PR.
