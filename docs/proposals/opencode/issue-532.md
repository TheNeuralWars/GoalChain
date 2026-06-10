# Issue #532: [OPENCODE] [DRAFT] World Cup 2026 — Confirmed Starting XI + Full Player Data Overhaul

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
# FCC Task: World Cup 2026 — Confirmed Starting XI + Full Player Data Overhaul

**Priority: P0** — Massive research + data restructuring task. Follow `gstack plan-eng-review` before coding. Apply `frontend-design` skill for any UI touchpoints.

---

## Objective

Replace the current `docs/assets/data/players.json` (528 players across 48 countries × 11) with **verified, confirmed 2026 World Cup starting XIs** — 11 starters per qualified nation — with **complete physical attributes, real market values, trait assignments, parody clubs, and GoalChain lore narratives**.

**Source of truth:** Official FIFA 2026 World Cup squad announcements + confirmed starting lineups from opening matches / official team sheets.

---

## Scope

| Metric | Current | Target |
|--------|---------|--------|
| Countries | 48 | 48 (only qualified nations) |
| Players per country | 11 | 11 (confirmed starters only) |
| Total players | 528 | 528 |
| Physical attributes | Partial / inconsistent | 100% complete per schema |
| `match_salary_gch` | Placeholder | Real market value (€) → GCH mapping |
| `traits` | Sparse | Full taxonomy assignment |
| `meta.parody_club` | Inconsistent | Consistent per real club |
| `meta.narrative` | Generic | GoalChain lore + player lore blend |

---

## Research Methodology (MANDATORY — do not hallucinate)

### 1. Confirm Qualified Nations (48)
Use **FIFA.com**, **official confederation sites** (UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC) to list the exact 48 qualified teams.  
**Do not assume** — verify each.

### 2. For Each Nation: Identify the 11 Confirmed Starters
- **Primary source:** Official FIFA squad list (26-man) + matchday lineups from World Cup 2026 openers
- **Secondary:** Reputable beat reporters (Fabrizio Romano, The Athletic, Marca, Olé, L'Équipe, ESPN, Globo Esporte)
- **Tertiary:** Club official sites / national federation announcements

## Priority
P0

## Labels
status:ready,source:manager,agent:opencode,priority:P0,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-532`.
