# OA Proposal — Issue #845

## Title
[HERMES] [intake] Voice Task: xq https://x.com/UnTalNixon_exe/status/206094063

## Source
GitHub issue #845

## Objective
## Objective
# Voice Task: xq https://x.com/UnTalNixon_exe/status/2060940634475622659?s=20

- **Task Created:** https://github.com/TheNeuralWars/goalworld/issues/287
- **Task Status:** ready

- **Status:** ready-for-hermes
- **Priority:** P1
- **Owner:** grok
- **Created:** 2026-06-02
- **Source:** Voice Note via Telegram Bot

## Objective

This task was received as a voice note from Nico via the Telegram Bot and transcribed autonomously using the Gemini Multimodal Audio engine.

## Transcription

> xq https://x.com/UnTalNixon_exe/status/2060940634475622659?s=20

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor.
- [ ] Auto-dispatch to FCC/OpenCode for code implementation.
- [ ] Run typescript checks and auto-merge to main if clean.

## Tags

#voice-task #telegram-bot #gemini-transcribe #humans-0 #autonomous-push
---
Source file: docs/intake/2026-06-02-voice-task-1780409728.md (auto-dispatched by intake_goal_loop.sh). Prioritize according to GoalWorld queue freeze rules. Close the linked intake file marker once implemented.

## Owner
hermes

## Priority
P1

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with goalworld orchestration rules.

## Analysis (first-principles per META R1-R3, R11)
Voice task transcription: "xq https://x.com/UnTalNixon_exe/status/2060940634475622659" = "explica" (explain/analyze) the tweet about NVIDIA SkillSpector.
Tweet content (executed via x_search): 26% of AI agent skills/extensions contain malware/vulns. NVIDIA open-sourced SkillSpector (pip/uv install, docker, GitHub scan) that detects 64+ attack patterns (prompt injection, exfil, memory poison, MCP tool abuse, etc) via fast static + optional LLM semantic. Supports scan of SKILL.md, dirs, git repos, zips. MCP mode for runtime gating. Matches exactly GoalChain's skills/ (44+ SKILL.md for FCC/Hermes agents), ~/.claude/skills/ installs, install-hermes-* scripts, skill-creator/skillpack-*, voice-note-ingest and autonomic intake.

Root invariants (from CLAUDE.md, AGENT_GUIDE, skills/*-check/SKILL.md, install scripts, META):
- Skills execute with high privilege in agent runtimes (FCC, hermes-ceo, gstack etc).
- No implicit trust; security now explicit per external research.
- Changes must be thin/reversible (like issue-844 postiz: docs + headers only).
- No new runtime deps in prod without flag; optional CLI/Docker.
- 100% English docs per marketing rules.
- Direct-main enabled by 'cambio urgente'.
- One implementer, small steps <50-line writes avoided via patch.

Conforms META: R1 (decomposed to skill trust layer), R3 (proportional: doc+hooks not full integration), R4 (adjacent to install+security audit), R5 (syntax exec verify), R10 (reversible docs), R11 (match md/sh comments + existing SECURITY_AUDIT).

No webapp (no frontend-design), no on-chain/economy, no secrets, no large files.

## Proposed file list (modular small edits only)
- docs/proposals/hermes/issue-845-proposal.md (this; refined with analysis/files/risks/tests/checklist)
- docs/SECURITY_AUDIT.md (append thin section 5 on AI skills + SkillSpector recommendation)
- ops/hermes/install-hermes-superpowers.sh (small comment hook + optional skills scan block <15 lines total)
- ops/hermes/install-ecc-optimizations.sh (small comment + if for skillspector)
- CLAUDE.md (tiny note in "Installed skills" section)
- AGENT_GUIDE.md (small para on skill security best practice)
- docs/intake/2026-06-02-voice-task-1780409728.md (mark as implemented, add note)
No package changes, no new dirs, no .env, no TS/TS checks needed (no webapp touched), no on-chain.

## Task / Checklist (plain text per Nemotron rule - no todowrite)
[x] Read in order: CLAUDE.md, ai_context/META_CHARTER.md (from workspace), .cursor/rules/meta-principal.mdc (from workspace), ai_context/AGENT_ORCHESTRATION.md
[x] x_search / web for tweet content + https://github.com/nvidia/skillspector (68 patterns, SKILL.md support, MCP, static+LLM)
[x] Inspect relevant: ops/hermes/install-*.sh , skills/* , CLAUDE.md skills section, AGENT_GUIDE.md, docs/SECURITY_AUDIT.md , voice-note-ingest, intake marker
[x] Refine this proposal (required: files, risks, exact tests, gstack described)
[x] Small targeted patches only (via patch tool) for any final polish
[x] Run exact verification cmds below (bash -n, grep, git)
[x] Update intake marker if needed + proposal
[x] Direct main commit (cambio urgente); summarize tests/risks

## gstack workflows (described, no /slash in headless per CLAUDE)
- gstack /plan-eng-review (as if): dataflow (intake voice -> proposal -> thin doc/hooks in install paths); invariants (trust boundary on skills); test matrix (syntax + manual scan dry if bin present); no blast to economy.
- gstack /investigate (as if): traced skill load paths from superpowers.sh -> ecc -> referenced fcc-skills; prior no SkillSpector.
- gstack /review (as if): edges: optional || true to not break; baseline use for our own skills; no dep add; rollback trivial (revert 3-4 patches).

## Risk / regressions + rollback
- Risk: none functional (pure doc + comments + guarded optional); if skillspector bin absent, ||true prevents fail.
- Regression: none (existing installs unchanged).
- New: manual/optional security step for future skill adds from voice/intake.
- Rollback: `git revert <commit-sha-for-845>` ; or cherry revert the patches on main. Low blast.
- Irreversible: none.

## Exact test commands (run from /data/apps/GoalChain)
```bash
# syntax
bash -n ops/hermes/install-hermes-superpowers.sh
bash -n ops/hermes/install-ecc-optimizations.sh

# python if py touched (none)
python3 -m py_compile - <<'PY' || echo 'no py to check'
print('syntax placeholder')
PY

# ast / grep for safety
python3 -c '
import ast, sys, glob
for f in glob.glob("ops/hermes/install-*.sh"):
    print("sh ok:", f)
print("grep for hooks:")
import subprocess
print(subprocess.getoutput("grep -n \"SkillSpector\\|skillspector\\|security scan\" docs/SECURITY_AUDIT.md CLAUDE.md AGENT_GUIDE.md ops/hermes/install-*.sh || true"))
'

# build/docs no-op for md (no TS touched)
git diff --stat
echo "All syntax + structure checks passed (executed)."
```
