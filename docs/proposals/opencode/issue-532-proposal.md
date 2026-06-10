# OA Proposal — Issue #532

## Title
[OPENCODE] [DRAFT] World Cup 2026 — Confirmed Starting XI + Full Player Data Overhaul

## Source
GitHub issue #532

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

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-532` and close draft PR.
