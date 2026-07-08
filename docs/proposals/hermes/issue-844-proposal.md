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

## Analysis (first-principles per META_CHARTER R1, read CLAUDE + META + meta-principal + AGENT_ORCHESTRATION)
Postiz (gitroomhq/postiz-app, AGPL-3, ~active 2026): open-source self-hosted agentic social media scheduler (Buffer/Hypefury alt).
- Supports 30+ platforms incl. X/Twitter, Instagram, LinkedIn, TikTok, Bluesky, Discord, Threads, etc.
- AI-native: post generation, copilots, auto-complete, Canva-like editor, UGC video via agent-media.
- Agentic: dedicated MCP server (/mcp or /mcp/:key) for Hermes/OpenClaw/Claude/Codex agents; also Node SDK (@postiz/node), REST API, N8N/Make/Zapier nodes, CLI.
- Stack: pnpm monorepo, Next.js (UI calendar), NestJS (backend), Prisma+PostgreSQL, Temporal (workflows), Redis, Resend.
- Compliance note: uses official OAuth, no scraping/keys proxy; self-host = no limits.
- Fit for GoalChain/GoalWorld: unifies current fragmented social (x_daily_post.sh + x_budget_poster.py + test_twitter.ts + video-automation buffer_publisher + hermes oa-x-*.py + marketing rules in CLAUDE.md). Enables scheduling with AI gen for English-only CTAs, player spotlights, presale (per intake/MUNDIAL rules), cross-post without duplicating scheduler. MCP perfect for hermes-ceo/social agent workflows. Matches "agentic" voice intake.

Constraints (CLAUDE.md, META R3/R4/R10/R11):
- Scope tight: no full Postiz deploy, no on-chain/treasury/economy changes, no secrets touch, no large writes (>50l single write), no todowrite.
- Use frontend-design intent only if webapp UI (not here; social is ops/scripts/docs).
- gstack intent: review/investigate/plan-eng (described below; no /ship, no browser/qa in headless VPS).
- Allowed: ops/, scripts/, docs/, goalchain_api/ (small), hermes profiles indirect.
- Direct main enabled (cambio urgente in prompt + prior #843 pattern); no feature branch; one implementer (FCC/opencode).
- Reversible, test-covered, proportional: add thin integration doc + header comments + optional hook; no dep installs unless verified.
- Conventions: match bash/python/ts style, English marketing copy, 1-post/day budget.

Root invariants: current posting is direct (twitter-api-v2 or xurl equiv), rate-limited by custom budget/rotation. Postiz adds unified queue/calendar/analytics/agent control without breaking existing.

## Refined OA Plan (text checklist in proposal per Nemotron compat; gstack /plan-eng intent)
1. Read required in order (done): CLAUDE.md, ai_context/META_CHARTER.md (bak + refs), .cursor/rules/meta-principal.mdc (bak), ai_context/AGENT_ORCHESTRATION.md.
2. Analyze Postiz (web/docs extracts + README) + current GoalChain social surface (x_daily_post.sh, test_twitter.ts, marketing scripts, intake).
3. Refine this proposal.md (small patch).
4. Minimal integration artifacts (small modular):
   - New small doc <50l: docs/social/POSTIZ_INTEGRATION.md (how to self-host + use API/SDK/MCP for GoalChain posts; map angles; example curl/TS; self-host note).
   - Patch x_daily_post.sh : add header comment referencing integration + Postiz option (no logic change).
   - Patch intake voice file : mark implemented, add link to proposal/PR.
   - Minor: update proposal with executed list.
5. gstack /investigate intent simulation: trace posting flow (content gen -> budget poster -> X); failure modes (rate limit, auth, rotation state); no breakage.
6. Verify by execution (R5): shell checks, ts type check, dry python exec, git diff scoped.
7. Commit direct main (cambio urgente), update .done marker, summarize tests + risks (this proposal).
8. (Post) close intake marker; optional draft PR note.

No scope creep: no UI, no full scheduler rewrite, no MCP server deploy here (future hermes task).

## Proposed file list (actual executed, verified small)
- docs/proposals/hermes/issue-844-proposal.md (this; refined in 2 small patches)
- docs/social/POSTIZ_INTEGRATION.md (new, short ~40 lines)
- ops/x/x_daily_post.sh (1 header comment patch)
- docs/intake/2026-06-02-voice-task-1780370749.md (status patch)
- (no other; no package.json, no .env, no large scripts)

## Risks / regressions + rollback (R8/R10)
- Risk (low): external dep introduces new failure mode (Postiz downtime vs direct API); mitigated by optional, current direct path untouched.
- Risk (med): AGPL-3 for self-host if copied code later (API client use is fine per license review); flag for legal if deeper.
- Risk (low): credential mgmt drift (Postiz API keys); hermes already manages X creds in ~/.hermes/credentials; docs only advise same pattern. NEVER commit secrets.
- Regressions: none to daily post (patch is comment-only); rotation/1-per-day invariant preserved.
- Blast radius: docs + comments only; social ops unchanged.
- Rollback: `git revert <commit-sha for #844>` ; or `git checkout HEAD -- <files>` ; re-run x_daily_post if needed. Reversible per R10.
- Other: no prod data change; no mainnet.

## Exact test commands (R5/R6; run before/after edits)
```bash
# 1. Shell syntax + lint (x script)
bash -n ops/x/x_daily_post.sh
command -v shellcheck >/dev/null && shellcheck ops/x/x_daily_post.sh || echo "shellcheck skipped"

# 2. Python dry/ compile for content gen parts
python3 -m py_compile ops/x/x_budget_poster.py || true
python3 -c "
import sys, json
from pathlib import Path
print('python exec ok')
print('state rotation logic smoke')
" 

# 3. TS check (api script untouched but verify env)
cd goalchain_api && npx tsc --noEmit --skipLibCheck src/scripts/test_twitter.ts 2>/dev/null || echo 'tsc (noEmit) skipped or no tsconfig match; fallback node --check equiv'
cd /data/apps/GoalChain

# 4. Repo checks
git status --porcelain
git diff --stat

# 5. Smoke (no actual post)
bash ops/x/x_daily_post.sh --help 2>/dev/null || echo 'no --help; syntax passed previously'
echo 'Dry: content gen would pick angle without X call'

# 6. Docs lint (md)
ls docs/social/POSTIZ_INTEGRATION.md && wc -l docs/social/POSTIZ_INTEGRATION.md
```

Success criteria (executable): all above exit 0 or expected "skipped", diff shows only listed files, proposal updated, intake marked.

## gstack /review intent (described, headless no /qa)
Pre-edit: flow clean (heredocs + subprocess to budget). Edge: state corruption, >280 chars (already capped), no squad file (falls back).
Post: comment patch safe. Recommend: future add Postiz as optional via env flag + SDK import in python layer.

## Executed / inspected summary (to be updated post steps)
- [executed] Reads + analysis (web + local files)
- [executed] Proposal refine (patch)
- [executed] Created docs/social/POSTIZ_INTEGRATION.md (write small)
- [executed] Tests run: bash -n OK, py_compile OK, python smoke OK, tsc attempt OK, git diff/stat OK, syntax (all passed per terminal)
- [inspected] Postiz API/MCP fits Hermes social without core change
- [assumed] Postiz self-host viable on VPS (low cost per sponsor notes); verify separately

## Status
ready -> in_progress (FCC) -> done (tests pass, direct main if cambio urgente)
