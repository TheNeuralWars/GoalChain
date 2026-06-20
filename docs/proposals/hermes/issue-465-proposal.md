# OA Proposal — Issue #465

## Title
[OPENCODE] [DRAFT] Open Source: CONTRIBUTING.md + COLLABORATORS.md + GOVERNANCE.md drafts

## Source
GitHub issue #465

## Objective
## Objective
## Objective
Create three foundational governance documents for GoalChain open source collaboration.

## Files to create
1. **CONTRIBUTING.md** (root) - Guía completa para desarrolladores individuales:
   - Quick start: dev env setup (devcontainer/nix), build, test, lint commands
   - Good first issues etiquetados: good first issue + help wanted
   - PR checklist: tests, docs, economy impact, security
   - Code style: Rust/Anchor, TypeScript/React, commit conventions
   - Review flow: Manager dispatches -> FCC implements -> Antigravity reviews -> Nico merges

2. **COLLABORATORS.md** (root) - Framework para socios institucionales:
   - Categorías: DeFi, Gaming, AI Agents, Oracles, Infra
   - Criteria de partnership: alignment, tooling value, distribution reach
   - Benefits: early access, co-marketing, GCH allocation, advisory seat
   - Onboarding flow: intro call -> technical integration -> announcement

3. **docs/GOVERNANCE.md** - Modelo de gobernanza multi-stakeholder:
   - Core Team (merge authority, economic params, security)
   - Institutional Partners (advisory council quarterly)
   - Contributors (merit-based -> maintainer rights per subsystem)
   - Community (Discord/forum voice, snapshot voting post-mainnet)

## Constraints
- All docs in Spanish (primary) + English summaries
- Align with MASTER_PLAN.md economics + META_CHARTER.md Zero-Pause principles
- Reference existing ai_context/AGENT_ORCHESTRATION.md for agent workflow

## Verification
ls -la CONTRIBUTING.md COLLABORATORS.md docs/GOVERNANCE.md
grep -c "good first issue" CONTRIBUTING.md
grep -i "advisory\|partner" COLLABORATORS.md

## Skill hints
- Writing/technical documentation skill
- No code changes - pure markdown creation


## Owner

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #465
