# GitHub Issues Backlog — Mundial 2026 + Audit + Plan Maestro

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/269
- **Task Status:** ready

**Generated:** 2026-05-26  
**Machine-readable:** [`GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv`](GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv)  
**Hermes handoff:** [`2026-05-26-hermes-manager-handoff.md`](2026-05-26-hermes-manager-handoff.md)  
**Bridge reconnect:** [`2026-05-26-hermes-bridge-reconnect.md`](2026-05-26-hermes-bridge-reconnect.md)

**Total issues:** 49 (+ CSV row 50 = meta bulk-create task)  
**Do NOT file:** Re-merge PR #32, #33, #34 (merged via #35).

---

## Summary tables

### By priority

| Priority | Count | IDs |
|----------|-------|-----|
| P0 | 7 | 1–7 |
| P1 | 22 | 8–28, 48 |
| P2 | 20 | 29–47, 49 |

### By agent

| Agent | Count | IDs |
|-------|-------|-----|
| opencode | 16 | 3,6,8,9,11,14,15,25,26,30,31,34,38,41,42,45 |
| antigravity | 14 | 1,2,4,5,7,10,12,13,16,17,22,23,27,36,47,48 |
| grok | 8 | 18,19,20,35,37,39,44,49 |
| cursor | 9 | 21,24,28,29,32,33,40,43,46 |

---

## P0 Issues

### #1 — Deprecate migrate_config.ts

- **Title:** `[P0][oracle] Deprecate migrate_config.ts — migrateConfig instruction does not exist`
- **Labels:** `P0`, `bug`, `oracle`, `ops`, `agent:antigravity`
- **Agent:** antigravity
- **Description:** `goalchain_oracle/src/migrate_config.ts` calls `migrateConfig()` but ix absent from IDL/program.
- **Acceptance:** Script archived/removed; docs updated; no ops runbook references without warning.
- **Test:** `grep -r migrateConfig goalchain-sdk goalchain_program || true`
- **Hints:** P0 — Follow gstack investigate workflow.

### #2 — Block vault_crank fake execute

- **Title:** `[P0][economy][oracle] Block vault_crank execute mode until real Jupiter/burn integration`
- **Labels:** `P0`, `bug`, `economy`, `oracle`, `observability`, `agent:antigravity`
- **Agent:** antigravity
- **Description:** `vault_crank.ts` L74–80 uses `fakeTx()` when `VAULT_CRANK_EXECUTE=1`.
- **Acceptance:** Execute hard-fails OR real txs; API ops reflects unavailable crank.
- **Hints:** P0 economy honesty.

### #3 — Fix EconomyConfigBanner

- **Title:** `[P0][webapp][api] EconomyConfigBanner reads wrong fields from /api/economy/config`
- **Labels:** `P0`, `bug`, `webapp`, `api`, `economy`, `devnet`, `mundial-mvp`, `agent:opencode`
- **Agent:** opencode
- **Description:** UI expects `config_version`/`drift`; API returns `canonicalConfig` nested object.
- **Acceptance:** Banner shows v1.0.0-p0; drift visible when on-chain differs.
- **Test:** `cd goalchain_webapp && npm run build`
- **Hints:** Apply frontend-design skill. Follow gstack review pass before draft PR.

### #4 — Fix anchor test runner

- **Title:** `[P0][smart-contracts] Fix anchor test runner — surfpool missing breaks program tests`
- **Labels:** `P0`, `ci`, `smart-contracts`, `devnet`, `agent:antigravity`
- **Agent:** antigravity
- **Description:** `anchor test` fails spawning surfpool.
- **Acceptance:** CI/local test path documented and green for program PRs.

### #5 — Deploy Play production

- **Title:** `[P0][webapp][ops] Deploy play.goalchain.fun with VITE_API_BASE_URL production`
- **Labels:** `P0`, `devnet`, `webapp`, `ops`, `mundial-mvp`, `agent:antigravity`
- **Agent:** antigravity
- **Blocked by:** CEO Vercel credentials
- **Acceptance:** play.goalchain.fun live; API prod URL; banners load.

### #6 — QA Mundial demo

- **Title:** `[P0][devnet][webapp] QA — Complete Mundial demo runbook on production Play`
- **Labels:** `P0`, `devnet`, `webapp`, `mundial-mvp`, `qa`, `agent:opencode`
- **Agent:** opencode
- **Depends:** #5
- **Acceptance:** bet→claim &lt; 5 min per `MUNDIAL-2026-DEMO-RUNBOOK.md`.

### #7 — Merge Mundial MVP to main

- **Title:** `[P0][integration] Merge Mundial MVP PR — claim UI, simulation badges, oracle hooks`
- **Labels:** `P0`, `mundial-mvp`, `webapp`, `oracle`, `agent:antigravity`
- **Agent:** antigravity
- **Acceptance:** Single PR; build/lint green; not blocked by #32–34 (already merged).

---

## P1 Issues (8–28)

| ID | Title | Agent | Labels (core) |
|----|-------|-------|---------------|
| 8 | UserProfile mock honesty | opencode | P1, webapp, mundial-mvp |
| 9 | Estadio simulation badges | opencode | P1, webapp, mundial-mvp |
| 10 | Marketing JS prod API | antigravity | P1, docs, api |
| 11 | Play coach apiBaseUrl | opencode | P1, webapp, api |
| 12 | Oracle participantPlayerIds seed | antigravity | P1, oracle, devnet |
| 13 | Close FCC drafts #95–99 | antigravity | P1, ops, mundial-mvp |
| 14 | npm audit high webapp | opencode | P1, security, webapp |
| 15 | Webapp code-split | opencode | P1, performance |
| 16 | API economy drift field | antigravity | P1, api, economy |
| 17 | Hermes discord profile sync | antigravity | P1, hermes, ops |
| 18 | Enforce scope freeze | grok | P1, hermes, docs |
| 19 | Grok MVP copy review | grok | P1, grok, mundial-mvp |
| 20 | Grok parameter vs marketing | grok | P1, economy |
| 21 | Document FutureHook no-op | cursor | P1, smart-contracts, docs |
| 22 | Archive goalchain_backend | antigravity | P1, tech-debt |
| 23 | CI mundial-smoke workflow | antigravity | P1, ci, devnet |
| 24 | verify-canonical-economy.sh | cursor | P1, economy, ops |
| 25 | AICommentator WS errors UI | opencode | P1, webapp |
| 26 | FixturesPanel inline errors | opencode | P1, webapp, devnet |
| 27 | Video alerts env audit VPS | antigravity | P1, hermes, oracle |
| 28 | CreateUser localStorage docs | cursor | P1, webapp, docs |

**Epic #48:** `[Epic][P1][mundial-mvp] Mundial 2026 release gate` — antigravity — tracks #5,6,7,3,8,9,13,17.

---

## P2 Issues (29–47)

| ID | Title | Agent |
|----|-------|-------|
| 29 | Update docs merge stack complete | cursor |
| 30 | JupiterQuoteWidget orphan | opencode |
| 31 | Deprecate DashboardHub | opencode |
| 32 | audit MATRIX.csv | cursor |
| 33 | Mark exp/ non-productive | cursor |
| 34 | Post-Mundial live markets UI | opencode |
| 35 | Post-Mundial Genesis intake | grok |
| 36 | Post-Mundial vault crank real | antigravity |
| 37 | Post-Mundial mainnet checklist | grok |
| 38 | Post-Mundial rent NFT UI | opencode |
| 39 | Mundial pre-match cron | grok |
| 40 | gbrain PR template ritual | cursor |
| 41 | OracleService remove @ts-ignore | opencode |
| 42 | LiveEventFeed WS oracle | opencode |
| 43 | check-tasks mundial filter | cursor |
| 44 | X-Scout Mundial cadence | grok |
| 45 | Classic Hub deprecate/fix | opencode |
| 46 | tokenomics fee_burn S0 | cursor |
| 47 | BuilderFund runbook | antigravity |

**Epic #49:** Post-Mundial backlog — grok — frozen until 2026-06-11.

---

## Already done — verification only

| Feature | Issue action |
|---------|----------------|
| claim/refund UI | QA #6, merge #7 |
| Simulation badges DeFi/Club | Extend #9 to Estadio |
| oracle_record_match | #12 seed IDs |
| rarityYield JSON | Verify in #7 |
| MASTER_PLAN / governance | #29 doc sync |

---

## Meta #50 — Hermes bulk create

- **Title:** `[P1][ops] Bulk create GitHub issues from GITHUB_ISSUES_BACKLOG CSV`
- **Agent:** hermes (Manager)
- **Action:** Run script after Nico approves; link all issues to epic #48.

---

*End of backlog. Hermes: import with `gbrain import docs/intake`.*
