# GoalChain — Multi-Agent Orchestration

**Purpose:** Coordinate Cursor, Grok, Google Antigravity, and the **Hermes general agent** (OpenClaw on the 24/7 server) without file conflicts, scope drift, or duplicate work.

**Hermes runtime:** OpenClaw + Grok (`xai/grok-4.3`) for chat/voice/panel; shell scripts in `~/hermes/scripts/` for sync and digests. See `ai_context/OPENCLAW_GOALCHAIN_OPERATOR.md`.

**Related rules (Cursor):** `.cursor/rules/collab-multi-agent.mdc`, `.cursor/rules/meta-principal.mdc`  
**Engineering charter:** `ai_context/META_CHARTER.md` ([meta-llm-charter](https://github.com/entropyvortex/meta-llm-charter))

---

## Agent roster

| Agent | Runtime | Best for | Default owner of |
|-------|---------|----------|------------------|
| **Hermes** (OpenClaw) | Server 24/7 (`178.105.148.109`) | Intake, prioritization, reminders, briefs, voice/chat, Slack hub | `docs/intake/`, issue drafts |
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

## Hermes 24/7 server (OpenClaw + scripts)

**Conversational layer:** OpenClaw workspace `~/.openclaw/workspace` (SOUL/HEARTBEAT/USER). Deploy templates: `ops/openclaw/deploy-workspace.sh`.

**Automation layer:** `~/hermes/scripts/` — `sync.sh`, `daily-digest.sh`, `openclaw-context.sh`, `create-brief.sh`.

Responsibilities:

- Voice/text/chat → normalize to `docs/intake/` or GitHub issues
- Cron (OpenClaw): morning digest + periodic repo sync (`ops/openclaw/install-cron.sh`)
- Heartbeat: sync + ops snapshot (`HEARTBEAT.md`)
- Nudge on blockers; **do not** deploy on-chain/prod without runbook + explicit OK

Bootstrap: `ops/hermes/bootstrap.sh` → `~/hermes/config.env` + clone. See `ai_context/HERMES_SETUP.md` and `ai_context/OPENCLAW_GOALCHAIN_OPERATOR.md`.

### Hands-free dispatch (Discord / WhatsApp -> execution)

Hermes OA now supports wait-mode automation:

- Incoming webhook messages are normalized from generic JSON, Discord-like payloads, and WhatsApp/Twilio forms.
- Free-text directives (example: "dale un spike a antigravity para integrar X") are auto-parsed into owner/priority/title/objective.
- OA creates a GitHub issue with `agent:*` + `status:ready`.
- If wait-mode command hooks are configured (`OA_AGENT_*_CMD`), OA auto-dispatches the task immediately without manual prompt entry in each app.
- `cursor` / `antigravity` / `opencode` can be routed to a local Mac bridge queue (`dispatch:local-queued`) and executed by a launchd daemon.
- `grok` can remain server-side or be routed local depending on command hook.

Recommended security:

- Set `OA_WEBHOOK_TOKEN` and send it as `Authorization: Bearer <token>` or `X-OA-Token`.
- Optionally restrict channels with `OA_WEBHOOK_ALLOWED_SOURCES` (comma-separated).

Store server-side config (not committed):

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

## Emergency override: `cambio urgente`

You requested a global override keyword. The operational policy is:

- If Nico includes `cambio urgente` in a task, treat it as **direct-to-main authorization**.
- Applies to all agents (Cursor, Antigravity, OpenCode local, OpenCode server) at dispatch policy level.
- For OpenCode server OA, this is enforced in code: the worker skips draft PR flow and pushes directly to `main`.
- For other agents, Manager must include explicit issue/body note: `Policy: direct main push requested by Nico via keyword cambio urgente.`
- Every direct-main execution must leave an audit trace in issue comments or session summary.

Risk note: this bypasses normal PR safety. Use only for high-impact hotfixes where speed is more important than review.

---

## Current stacked PR order (reference)

Merge **in this order** (each PR targets the previous head branch):

1. [#26](https://github.com/TheNeuralWars/GoalChain/pull/26) week1 canonical config  
2. [#27](https://github.com/TheNeuralWars/GoalChain/pull/27) → … through [#31](https://github.com/TheNeuralWars/GoalChain/pull/31)  
3. [#32](https://github.com/TheNeuralWars/GoalChain/pull/32) consolidation  
4. [#33](https://github.com/TheNeuralWars/GoalChain/pull/33) video automation (flags OFF)  
5. [#34](https://github.com/TheNeuralWars/GoalChain/pull/34) observability + health  

Runbook: `docs/intake/2026-05-23-merge-stack-convergence.md`

After `main` is current: **Cursor** → webapp devnet brief; **Antigravity** → `exp/antigravity-*` only (`docs/intake/2026-05-23-antigravity-post-merge-spikes.md`).

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
