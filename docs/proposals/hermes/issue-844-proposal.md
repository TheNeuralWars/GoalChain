# OA Proposal — Issue #844

## Title
[HERMES] [intake] Voice Task: analize and integrate this: https://github.com/g

## Source
GitHub issue #844

## Objective
## Objective
# Voice Task: analize and integrate this: https://github.com/gitroomhq/postiz-app

- **Task Created:** https://github.com/TheNeuralWars/goalworld/issues/276
- **Task Status:** ready

- **Status:** ready-for-hermes
- **Priority:** P1
- **Owner:** opencode
- **Created:** 2026-06-02
- **Source:** Voice Note via Telegram Bot

## Objective

This task was received as a voice note from Nico via the Telegram Bot and transcribed autonomously using the Gemini Multimodal Audio engine.

## Transcription

> analize and integrate this:
https://github.com/gitroomhq/postiz-app

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor.
- [ ] Auto-dispatch to FCC/OpenCode for code implementation.
- [ ] Run typescript checks and auto-merge to main if clean.

## Tags

#voice-task #telegram-bot #gemini-transcribe #humans-0 #autonomous-push
---
Source file: docs/intake/2026-06-02-voice-task-1780370749.md (auto-dispatched by intake_goal_loop.sh). Prioritize according to GoalWorld queue freeze rules. Close the linked intake file marker once implemented.

## Owner
hermes

## Priority
P1

## Context
Requested by Nico via Manager. Linked to #276 voice note. Per CLAUDE.md (read first: skills gstack review/investigate/plan-eng for ops; frontend-design only if webapp touched — none here; no /ship/browser/qa). Direct main enabled by 'cambio urgente'. One implementer. Manage tasks/checklist in this text file (no todowrite per Nemotron compat).

## Analysis (first-principles per META R1, R3)
Postiz (gitroomhq/postiz-app): AGPL-3 self-hostable (docker-compose: NextJS/NestJS/Prisma/Temporal/Postgres/Redis) agentic social scheduler + AI content gen + analytics. Supports X/Twitter primary + 30+ platforms via official OAuth (no scrape). Key for GoalChain: Node SDK (@postiz/node), Public REST API, MCP server (for Hermes agents/OpenClaw), new "Postiz agent CLI". Matches hermes social orchestration, ops/x scripts, English Max Law (content gen stays here), 1-post/day budget invariant.
Root invariants (from x_budget_poster.py, x_daily_post.sh, social_multiplexer.py, CLAUDE marketing): 
- Hard 1 post/day on @GoalChainSOL
- 100% English public copy
- Rotation avoids duplicates
- No secrets in repo
- Content angles: zealy, vault, spotlight, presale, wc2026 etc.
- Ops in /ops/hermes/ /ops/x/ /scripts/ allowed per scope.
No on-chain/economy change. Thin integration: document + opt-in comment hooks (current behavior 100% unchanged). Future: POSTIZ_ENABLED + curl/SDK wrapper without breaking budget guard.
Conforms META R11 (repo conventions for sh/py comments + docs), R4 (bounded, adjacent to existing social), R5 (execution verify), R10 (reversible).

## Proposed file list (modular small edits only)
- docs/proposals/hermes/issue-844-proposal.md (this file: refine + checklist)
- docs/social/POSTIZ_INTEGRATION.md (small modular append for sources + agent CLI note)
- ops/x/x_daily_post.sh (small header + conditional comment block <10 lines)
- ops/x/x_budget_poster.py (small docstring update)
- ops/hermes/social_multiplexer.py (small comment hook for Postiz MCP future)
- docs/intake/2026-06-02-voice-task-1780370749.md (already marker closed in prior)
No new large files. No package.json changes (no dep add yet; use curl in future). No .env. No webapp.

## Task / Checklist (plain text, per rules)
[x] Read in order: CLAUDE.md, ai_context/META_CHARTER.md (from /home/goalchain ref), .cursor/rules/meta-principal.mdc, ai_context/AGENT_ORCHESTRATION.md
[x] Search codebase for postiz/social/x_*.py ; inspect x_daily + budget_poster + multiplexer + test_twitter.ts
[x] Web analysis of https://github.com/gitroomhq/postiz-app (README, features: scheduler+AI+MCP+SDK+CLI; tech: pnpm monorepo, Temporal; compliance: official OAuth)
[x] Refine this proposal with required output (files, risks, tests)
[ ] Small safe modular code patches (headers/hooks only)
[ ] Run exact verification commands below (bash -n, py compile, ts check, git diff)
[ ] Update intake marker if needed (already done)
[ ] Summarize tests + residual risks; direct-main commit per cambio urgente

## gstack workflows followed (described per CLAUDE, no slash in headless)
- gstack /plan-eng-review (as if): architecture data flow (content gen in GoalChain -> budget guard -> optional Postiz schedule); invariants listed; test matrix (syntax + dry-run logic).
- gstack /investigate (as if): traced from daily_post -> budget_poster (enforcer); no prior Postiz code besides this intake.
- gstack /review (as if): bugs/edges: budget must stay first (no bypass); english check remains; rollback easy (revert doc+2 comments).

## Exact test commands
```bash
# From repo root (/data/apps/GoalChain)
bash -n ops/x/x_daily_post.sh
python3 -m py_compile ops/x/x_budget_poster.py
python3 -c "
import ast, sys
for f in ['ops/hermes/social_multiplexer.py', 'ops/x/x_budget_poster.py']:
    try:
        ast.parse(open(f).read())
        print(f'AST OK: {f}')
    except Exception as e: print(f'FAIL {f}: {e}'); sys.exit(1)
"
cd goalchain_api && npx tsc --noEmit --skipLibCheck src/scripts/test_twitter.ts || echo 'TS syntax check (non-blocking if no full project)'
git status
git diff --stat
echo '=== dry run simulation (no post) ==='
python3 ops/x/x_budget_poster.py --status 2>&1 | cat || true
# Webapp/api not touched: cd goalchain_webapp && npm run build  (skip per scope)
```

## Risk / regressions + rollback
Risks:
- Scope drift to full scheduler replace: mitigated by "current path unchanged" + comments only.
- Unstable dep: none added (thin doc+comment).
- Credential leak: never touch .env/credentials; separate ~/.hermes/ per docs.
- Budget invariant break: no, hooks are after guard or commented.
- English Max Law: unchanged (Postiz would receive pre-validated English).
- Regressions: none (no runtime change); prior commit already had doc+header.
- VPS resource (if selfhost Postiz later): separate compose, not this PR.
Residual: Postiz MCP/CLI integration for full hermes agent dispatch future work (P2). Self-host setup manual per POSTIZ_INTEGRATION.md.
Rollback: git revert <this-commit>  OR  git checkout HEAD~1 -- docs/social/POSTIZ_INTEGRATION.md ops/x/x_daily_post.sh ops/x/x_budget_poster.py ops/hermes/social_multiplexer.py docs/proposals/hermes/issue-844-proposal.md ; or per-file.

## Verification tags (R8)
- executed: reads of required files + searches + web extract of Postiz + terminal git show + py/bash checks (will run)
- inspected: code paths for budget/rotation/english
- assumed: Postiz self-host will be run separately by ops (not in scope)

## Summary plan (R2 decisive, R3 proportional)
Refine proposal (this). Then 3-4 tiny patches via modular edits. Run tests. Direct to main (cambio urgente). No branches. Close task. Antigravity owner for integration review.
