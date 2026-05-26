# HANDOFF → Hermes (GoalChain Manager)

**To:** Hermes / GoalChain Manager (`jito-strategy` profile)  
**From:** Cursor (local session, bridge down)  
**Date:** 2026-05-26  
**Language:** English for public channels · Spanish OK with Nico in `manager:` WhatsApp

---

## Executive summary

GoalChain has completed **Mundial 2026 MVP implementation in the local repo** (bet + claim, simulation badges, oracle `record_match`, economy banner code, governance docs). The **Hermes bridge is Git + intake**, not live GBrain sync.

**Your job as coordinator:**

1. Pull this handoff from `main` after Nico/Antigravity push.
2. Run `gbrain import ai_context docs/intake`.
3. **Bulk-create ~50 GitHub issues** from [`GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv`](GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv) (issue #50 in CSV).
4. Enforce **Mundial scope freeze** until 2026-06-11.
5. **Do not** reopen merge stack PRs #32–#34 — already merged via **#26** and **#35**.

**North star:** Demo devnet bet→claim on `play.goalchain.fun` before **11 Jun 2026**. CEO does 3 commands only: `prioridad` | `dispatch` | `estado`.

---

## Merge queue — DO NOT CREATE ISSUES

| PR | Status | Note |
|----|--------|------|
| #26 Week 1 canonical | **MERGED** 2026-05-23 | — |
| #35 Stack #27–#34 → main | **MERGED** 2026-05-23 | Supersedes individual #32–#34 |
| #32, #33, #34 | **Superseded** | No re-merge |
| FCC drafts #95–#99, #103 | **Close** | Issue CSV #13 |

**Only doc follow-up:** Issue #29 — update stale “merge pending” text in `MASTER_PLAN.md`, `IMPLEMENTATION_STATUS.md`.

---

## Recommended execution order (Hermes orchestration)

### Wave 0 — Bridge (today)

| Step | Action | Who |
|------|--------|-----|
| 0.1 | `git pull` on VPS | Hermes / sync.sh |
| 0.2 | `gbrain import ai_context docs/intake` | Hermes |
| 0.3 | `sync-hermes-active-profile-discord.sh` + restart gateway | Hermes |
| 0.4 | Create GitHub issues from CSV (P0 first) | Hermes → `gh issue create` loop |
| 0.5 | Close FCC draft PRs #95–#99 | Hermes comment + Antigravity |

### Wave 1 — P0 (days 1–3)

| Order | Issue ID | Title (short) | Agent label |
|-------|----------|---------------|-------------|
| 1 | 7 | Merge Mundial MVP to main | antigravity |
| 2 | 1 | Deprecate migrate_config.ts | antigravity |
| 3 | 2 | Block vault_crank fake execute | antigravity |
| 4 | 3 | Fix EconomyConfigBanner API | opencode |
| 5 | 4 | Fix anchor test / surfpool CI | antigravity |
| 6 | 5 | Deploy Play Vercel | antigravity (+ CEO creds) |
| 7 | 6 | QA bet→claim runbook | opencode |

### Wave 2 — P1 Mundial honesty (days 4–7)

Issues **8, 9, 12, 13, 16, 17, 18, 19** + epics **48**.

### Wave 3 — P1/P2 hygiene (parallel, low priority)

Issues **10–11, 14–15, 20–28, 29–33, 40–47** — only if Wave 1–2 green.

### Post-Mundial (after 2026-06-11)

Epic **49** + issues **34–38, 36–37, 42** — require CEO unfreeze.

---

## How to create GitHub issues (Hermes)

### Option A — From CSV (recommended)

```bash
cd ~/hermes/workspace/GoalChain
# After pull:
python3 <<'PY'
import csv, subprocess, textwrap, os
repo = os.environ.get("GITHUB_REPO", "TheNeuralWars/GoalChain")
path = "docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv"
# Create labels first (idempotent) via gh label create ...
with open(path, newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        if row["id"] == "50":  # meta issue — create manually first
            continue
        title = row["title"]
        labels = row["labels"]
        body = f"""## Auto-imported from intake backlog
- **Priority:** {row['priority']}
- **Suggested agent:** {row['agent']}
- **Epic:** {row.get('epic') or '—'}
- **Source:** {row['source']}
- **Blocked by:** {row.get('blocked_by') or '—'}

Full spec: `docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md` issue #{row['id']}.

## Agent hints
See backlog markdown for acceptance criteria and test commands.
"""
        cmd = ["gh", "issue", "create", "--repo", repo, "--title", title, "--body", body]
        for lab in labels.split(","):
            cmd.extend(["--label", lab.strip()])
        # Uncomment to execute:
        # subprocess.run(cmd, check=True)
        print("would create:", title[:60])
PY
```

**Run with uncommented `subprocess.run` only after Nico approves bulk create.**

### Option B — Dispatch to FCC (`agent:opencode`)

For each P0/P1 implementation issue:

1. Create issue with labels: `agent:opencode`, `status:ready`, `mundial-mvp` (if applicable).
2. Body must include:
   - Allowed files
   - Test commands
   - `Apply frontend-design skill` (webapp)
   - `Follow gstack review pass before opening draft PR`
3. `oa-worker` picks one at a time.

### Option C — Dispatch to Antigravity

Issues **1, 2, 4, 5, 7, 10, 12, 13, 16, 17, 22, 23, 27** → label `agent:antigravity`, `status:ready`.  
Nico merges on Mac; Hermes does not merge.

### Option D — Grok review only

Issues **18, 19, 20, 35, 37, 39, 44, 49** → `agent:grok`, no code.

---

## Distribution table (assign after issue create)

| Agent | Count | Issue IDs |
|-------|-------|-----------|
| **opencode** | 16 | 3,6,8,9,11,14,15,25,26,30,31,34,38,41,42,45 |
| **antigravity** | 14 | 1,2,4,5,7,10,12,13,16,17,22,23,27,36,47,48 |
| **grok** | 8 | 18,19,20,35,37,39,44,49 |
| **cursor** | 9 | 21,24,28,29,32,33,40,43,46 |
| **hermes (ops)** | 1 | 50 (bulk create meta) |

---

## Priority breakdown

| Priority | Count | Focus |
|----------|-------|-------|
| **P0** | 7 | Safety, deploy, QA, merge MVP |
| **P1** | 22 | Honesty UI, ops, reviews, CI |
| **P2** | 20 | Tech debt, post-Mundial |
| **Epics** | 2 | #48 Mundial gate, #49 post-Mundial |

---

## What is already DONE in repo (do not re-implement)

| Item | Verify via |
|------|------------|
| claim_bet_payout UI | `goalchainClient.ts`, `FixturesPanel.tsx` |
| Simulation badges DeFi/Club | `SimulationBadge.tsx` |
| oracle_record_match on FT | `OracleService.completeFixture` |
| rarityYield canonical JSON | `goalchain_oracle/src/economy/rarityYield.ts` |
| Governance MASTER_PLAN | `ai_context/MASTER_PLAN.md` |

Create **verification/QA issues** (#6, #7), not duplicate implementation.

---

## Suggested `estado` reply template (after pull)

```
[Manager] Bridge pack landed on main.
Merge stack: #26 + #35 MERGED — do not reopen #32-34.
Mundial MVP: coded locally — issues #7 #5 #6 track merge/deploy/QA.
Backlog: 49 issues in docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv
P0 queue: migrate_config, vault_crank, economy banner, anchor CI, Play deploy.
FCC: close drafts #95-99; single track mundial-mvp.
API: https://crm.goalchain.fun/goalchain-api/health
Next CEO: demo devnet — docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md
```

---

## Suggested `prioridad` queue (Mundial)

1. P0 issues #7 → #1 → #2 → #3 → #5 → #6  
2. P1 honesty #8, #9, #19 (Grok)  
3. Close FCC drafts #13  
4. Defer post-Mundial epic #49  
5. Reject new DeFi/Genesis/video intake per [`HERMES-MUNDIAL-SCOPE-FREEZE.md`](HERMES-MUNDIAL-SCOPE-FREEZE.md)

---

## Files you must read after `git pull`

| File | Purpose |
|------|---------|
| [`2026-05-26-hermes-bridge-reconnect.md`](2026-05-26-hermes-bridge-reconnect.md) | Reconnect steps |
| [`GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md`](GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md) | Full issue bodies |
| [`GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv`](GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv) | Bulk create |
| [`MUNDIAL-2026-MVP.md`](MUNDIAL-2026-MVP.md) | MVP acceptance |
| [`MUNDIAL-2026-DEMO-RUNBOOK.md`](MUNDIAL-2026-DEMO-RUNBOOK.md) | CEO demo |
| [`HERMES-MUNDIAL-SCOPE-FREEZE.md`](HERMES-MUNDIAL-SCOPE-FREEZE.md) | Intake policy |
| [`ai_context/MASTER_PLAN.md`](../../ai_context/MASTER_PLAN.md) | Executive north |

---

## Nico action required (outside Hermes)

- `git push` this handoff pack from Mac  
- Vercel credentials for issue #5  
- One devnet demo (issue #6)  
- Approve bulk `gh issue create` from CSV  

---

*Hermes: acknowledge in #hermes with `manager: recibido backlog mundial` after pull.*
