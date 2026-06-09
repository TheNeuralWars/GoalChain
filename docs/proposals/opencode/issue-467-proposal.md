# OA Proposal — Issue #467

## Title
[ANTIGRAVITY] [DRAFT] Open Source: Validate dev env + CI readiness for external PRs

## Source
Local queue (autonomous mode)

## Objective
## Objective
## Objective
Validate that GoalChain's dev environment and CI/CD are ready for external contributors before merge stack #32-#34 lands on main.

## Scope
1. **Dev Environment**: Verify devcontainer / nix setup works one-click for Rust/Anchor + React/Next + TypeScript
2. **Build Commands**: `make build`, `make test`, `make lint` all pass on clean checkout
3. **Documentation**: Check `docs/DEV_ENV_SETUP.md` exists and is accurate (or create if missing)
4. **CI/CD**: GitHub Actions workflows run successfully for PRs (lint, test, build)
5. **Preview Deployments**: Vercel preview for webapp PRs (verify configuration)
6. **Good First Issues**: Identify 3-5 issues suitable for "good first issue" labeling

## Deliverable
Report in this issue with:
- ✅/❌ per check above
- List of blockers (if any)
- Recommended fixes for FCC to implement
- List of suggested "good first issue" candidates

## Context
External contributions blocked until this validation passes. Merge stack #32-#34 landing on main is the trigger.

## Verification
Run locally: `make test`, `make build`, `make lint`
Check GitHub Actions: recent workflow runs on main


## Owner
antigravity

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Workflow (Producer-Critic Pattern)
1. **Implementer** (antigravity) creates PR on branch `exp/antigravity-issue-XXX`
2. **Critic Agent** reviews PR automatically (read-only, no code changes)
3. Critic posts structured review: PASS/FAIL + findings

## Priority
P1

## Labels
status:ready,source:manager,priority:P1,agent:antigravity,

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-467`.
