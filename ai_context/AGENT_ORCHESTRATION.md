# GoalChain — Multi-Agent Orchestration

**Purpose:** Coordinate Cursor, Grok, Google Antigravity, and Hermes (24/7 server) without file conflicts, scope drift, or duplicate work.

**Related rules (Cursor):** `.cursor/rules/collab-multi-agent.mdc`, `.cursor/rules/meta-principal.mdc`  
**Engineering charter:** `ai_context/META_CHARTER.md` ([meta-llm-charter](https://github.com/entropyvortex/meta-llm-charter))

---

## Agent roster

| Agent | Runtime | Best for | Default owner of |
|-------|---------|----------|------------------|
| **Hermes** | Your server 24/7 | Intake, prioritization, reminders, briefs, Slack hub | `docs/intake/`, issue drafts |
| **Cursor** | IDE | Implementation, PRs, Anchor/API/webapp, verification | Merge + integration |
| **Grok** | xAI CLI / web | Research, review, marketing, alt drafts | `exp/grok-*` branches |
| **Antigravity** | Google | Spikes, UI/plugins skills, exploration | `exp/antigravity-*` branches |

**Integration owner (default):** Cursor — only one agent merges to stacked PR chains unless you reassign per task.

---

## Pipeline: idea → execution

```
Hermes (capture) → docs/intake/ or GitHub issue → Owner assigns implementer
    → Branch (feat/fix/exp-*) → Implement + tests → PR → Review → Merge
```

### 1) Intake (Hermes)

Hermes should write **structured briefs**, not code dumps:

- Path: `docs/intake/YYYY-MM-DD-<slug>.md`
- Template sections: Objective, Context, Allowed files, Out of scope, Acceptance criteria, Test commands, Owner, Priority, Status

Statuses: `draft` → `ready` → `assigned` → `in_progress` → `done` | `cancelled`

### 2) Triage (you or Hermes)

- P0: on-chain / economy / security
- P1: webapp transactional / oracle
- P2: docs / marketing / ops automation
- Assign **one** implementer; others advisory only.

### 3) Execution (Cursor / Antigravity / Grok)

- Cursor: production paths (`goalchain_program`, `goalchain_api`, `goalchain_webapp`, `goalchain_oracle`)
- Antigravity: spikes aligned with `ai_context/01_guidelines/AGENT_GUIDE.md` skills (Solana, glass UI, client AI)
- Grok: review packets, marketing, non-merge drafts

### 4) Closure

- PR with test plan, risks, rollback
- Update intake brief status to `done` with PR link
- Hermes can archive summary for your personal knowledge base

---

## Slack / multi-agent chat (when connected)

Recommended pattern (does not require a specific vendor):

1. **Channels:** `#goalchain-intake`, `#goalchain-dev`, `#goalchain-releases`
2. **Hermes** posts new briefs and daily priority stack
3. **No commit from chat alone** — every actionable item must link to `docs/intake/*.md` or a GitHub issue
4. **Decision log:** scope changes get copied into the intake file or issue within the same day
5. **@mentions:** `@cursor-task`, `@grok-review`, `@antigravity-spike` as labels in the brief, not as parallel editors on the same branch

Optional later: bot that mirrors `docs/intake/` ↔ Slack threads (Hermes server).

---

## Hermes 24/7 server — suggested responsibilities

- Poll or receive voice/text notes → normalize to intake markdown
- Weekly digest: open briefs, PR queue (#32–#34 merge order), KPI health (`/api/economy/health`)
- Nudge when `humanpending.md` items block execution (META Zero-Pause protocol, if used)
- **Do not** hold production keys or deploy without explicit runbook step

Store server-side config (example env, not committed):

- `GOALCHAIN_REPO_PATH`
- `SLACK_WEBHOOK_URL` / bot token
- `GITHUB_TOKEN` (issues only, least privilege)
- Read-only RPC for health checks

---

## Branch naming

| Prefix | Agent | Merge policy |
|--------|-------|----------------|
| `feat/*` `fix/*` | Cursor | Stacked PRs, reviewed |
| `exp/grok-*` | Grok | Cherry-pick or new PR after review |
| `exp/antigravity-*` | Antigravity | Same |
| `docs/intake-*` | Hermes | Direct to main only if markdown-only |

---

## Conflict prevention checklist

- [ ] One implementer per task
- [ ] No overlapping file edits across agents
- [ ] Brief lists allowed + forbidden paths
- [ ] Economy changes reference `docs/ECONOMIC_CANONICAL_CONFIG.json`
- [ ] Risky features default OFF (`ORACLE_VIDEO_ALERTS_ENABLED`, mint gate, etc.)
- [ ] Cursor runs lint/build before merge

---

## Current stacked PR order (reference)

1. [#32](https://github.com/TheNeuralWars/GoalChain/pull/32) consolidation  
2. [#33](https://github.com/TheNeuralWars/GoalChain/pull/33) video automation (flagged)  
3. [#34](https://github.com/TheNeuralWars/GoalChain/pull/34) observability + alerts  

New work on economy/oracle should branch from latest merged base or rebase on `#34` chain.

---

## Quick prompts

**Hermes → Cursor handoff**

```text
Implement intake docs/intake/<file>.md
Owner: Cursor. Do not expand scope. Run tests listed in brief.
```

**Grok review packet**

```text
Review only. Files: <list>. Output: risks, test gaps, rollback. No file edits.
```

**Antigravity spike**

```text
Spike only on branch exp/antigravity-<slug>. Max 1 day. Deliver: approach + diff proposal, no merge.
```
