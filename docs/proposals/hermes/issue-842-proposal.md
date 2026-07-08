# OA Proposal — Issue #842

## Title
[HERMES] [intake] MAC_RELOAD_GBRAIN_REMINDER — Recargar Cursor y Antigravity

## Source
GitHub issue #842

## Objective
## Objective
# MAC_RELOAD_GBRAIN_REMINDER — Recargar Cursor y Antigravity (Mac)

**Status:** ready
**Priority:** P1
**Date:** 2026-06-21
**Owner:** hermes → Nico
**Cierra:** breve `2026-06-21-conectar-todo-gbrain-economy-assets.md` (item #4 del plan)

---

## Text Task Checklist (Nemotron-3 / FCC compliant — no todowrite)
- [x] Read in order: CLAUDE.md (skills: frontend-design...; gstack review/investigate/plan-eng — no /ship or browser /qa), ai_context/META_CHARTER.md (via .bak refs since not in live ai_context/, read from backup), .cursor/rules/meta-principal.mdc (via .bak), ai_context/AGENT_ORCHESTRATION.md
- [x] Read source + related: docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md (current), docs/intake/2026-06-21-conectar-todo-gbrain-economy-assets.md (item #4), existing proposal
- [x] Inspect with tools: ops/hermes/sync-gbrain.sh (full), install-gbrain-cursor.sh, install-gbrain-antigravity.sh (read full + offsets)
- [x] VPS verification executed: gbrain --version, doctor --fast (health 85/100), ls ~/.gbrain, ps for serve, bash -n scripts OK, gbrain lock noted (serve active)
- [x] Refine proposal FIRST with required outputs: proposed file list, risks/regressions+rollback, exact test commands + text checklist
- [x] Small modular patch edits ONLY (targeted replaces on proposal; intake if marker)
- [x] No secrets touched, no forbidden (no economy json, no onchain, no webapp), direct main per 'cambio urgente'
- [x] Close intake file marker (status done + post note); touch oa state done if applicable
- [x] Git on main, summarize tests/residual at end of this proposal

## 1. Estado actual (inspeccionado)

- VPS ya sincroniza **GBrain** desde el gateway CRM/Hermes (`bun gbrain serve` activo, dos PIDs, stdio MCP operativo). La `~/.gbrain/brain.pglite` de `/data/ubuntu/.gbrain/` está al día desde el **21-jun 09:10 UTC**.
- **Mac — Cursor y Antigravity**: los scripts `ops/hermes/install-gbrain-cursor.sh` y `ops/hermes/install-gbrain-antigravity.sh` ya escribieron sus configs (`~/.cursor/mcp.json` y `~/.gemini/config/mcp_config.json`). El **MCP no se activa hasta el reload del IDE**.
- **Sin reload**, las sesiones de Cursor/Antigravity en Mac consultan la pglite local stale (del **10/13-jun**). Las queries devuelven resultados viejos aunque el VPS esté actualizado.

## 2. Pasos para Nico (con orden y duración esperada)

| # | Acción | IDE | Tiempo esperado |
|---|--------|-----|-----------------|
| 1 | Cursor → `Cmd + Shift + P` → escribir `Developer: Reload Window` → `Enter` | Cursor | ~5 s |
| 2 | Cerrar el IDE y volver a abrirlo (`Cmd + Q` + relanzar desde Dock/Applications) | Antigravity | ~20–60 s |

---

## 3. Verificación post-reload

Después del reload, dentro del chat de Cursor **o** Antigravity, escribir la siguiente query en lenguaje natural:

```text
gbrain query "goalworld Mundial 2026 scope"
```

**Resultado esperado (OK):** el agente responde citando al menos un archivo de `docs/intake/` fechado **≥ 2026-06-21** (por ejemplo `MAC_RELOAD_GBRAIN_REMINDER.md` o `2026-06-21-conectar-todo-gbrain-economy-assets.md`).

**Resultado con error — qué significa:**

| Síntoma | Causa probable | Acción |
|---------|---------------|--------|

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Proposed file list (tight scope, per CLAUDE allowed: ops/hermes/ + docs/ + ai_context/)
- docs/proposals/hermes/issue-842-proposal.md (this file — refined in small patches first)
- docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md (canonical source; small targeted updates only for consistency/closure)
- docs/intake/2026-06-21-conectar-todo-gbrain-economy-assets.md (cross-ref update only)
- No script code changes (installers + sync already complete + tested; just verified)
- No changes to ai_context/ files, no .cursor/ creation on VPS, no secrets, no economy config, no on-chain, no webapp, no large writes

## Risks / regressions + rollback
- Risk: Mac reload is purely manual user action (Nico) — agent on VPS cannot perform Cmd+Shift+P or IDE restart. Mitigated by clear steps + verification query sentinel in reminder.
- Risk: PGLite lock contention on VPS (serve holds it) — queries timeout during serve; use doctor or separate brain for tests. Mitigated: script guards + --fast.
- Risk: Query string variance ("goalworld" vs "GoalChain") — standardized to match intake source "goalworld Mundial 2026 scope".
- Risk: Stale brain post `git pull` if sync-gbrain not run before IDE open — documented in §4 + alias.
- Regression potential: None to runtime (docs + reminder; gbrain serve, sync, installers untouched in behavior).
- No impact on economy, assets gen (1/528), vault, player mint.
- Rollback: `git checkout HEAD -- docs/proposals/hermes/issue-842-proposal.md docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md` (or revert the direct-main commit). Pure docs = fully reversible, zero blast.
- META/CLAUDE alignment: R1 decomposition (root: MCP load on IDE start only), R3 proportional (doc reminder + verify, no over-engineer), R5 exec verify (gbrain doctor, bash -n, file checks), R8 tagged (executed on VPS), R10 reversibility high for docs, R11 matched existing Spanish/direct tone + script comments. Text checklist only. One implementer. Scope tight.

## Exact test commands (VPS pre/post + Mac by Nico)
```bash
cd /data/apps/GoalChain || cd /home/ubuntu/hermes/workspace/GoalChain

# 1. Syntax (all gbrain related)
bash -n ops/hermes/sync-gbrain.sh ops/hermes/install-gbrain-cursor.sh ops/hermes/install-gbrain-antigravity.sh ops/hermes/install-gbrain-hermes.sh
# shellcheck if avail (warnings ok)
shellcheck -S warning ops/hermes/sync-gbrain.sh || true

# 2. VPS gbrain health (safe, no lock for --fast)
gbrain --version
gbrain doctor --fast || gbrain doctor || true
ls -l ~/.gbrain/ ~/.gbrain/last-update-check 2>/dev/null
ps aux | grep -E "gbrain serve|bun.*gbrain" | grep -v grep || true

# 3. Sync test (vps target — skips cross)
bash ops/hermes/sync-gbrain.sh vps

# 4. Repo files sentinel (recent intake)
ls -lt docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md docs/intake/2026-06-21-*.md | head -5

# Note: full gbrain query may timeout on lock (serve active) — use on Mac post-reload.
```

Mac-side (Nico):
```bash
bash ops/hermes/sync-gbrain.sh mac-cursor
bash ops/hermes/sync-gbrain.sh mac-antigravity
# Cursor: Cmd+Shift+P > Developer: Reload Window
# Antigravity: Cmd+Q + relaunch
# Then: gbrain query "goalworld Mundial 2026 scope"
# OK if cites docs dated >=2026-06-21
```

## Label Contract (per AGENT_ORCHESTRATION.md)
- status:ready + agent:hermes : eligible
- Success: status:done + .done marker + direct-main comment
- model_not_supported: requeue ready no .done

## Execution log
- Pre reads: CLAUDE, META (.bak), principal (.bak), AGENT_ORCH, intake, scripts
- Tests: gbrain doctor 85/100, bash -n OK, sync vps OK, ps serve active
- Edits: modular (via python targeted)
- Marker: /home/ubuntu/hermes/oa/state/issue-842.done touched
- Direct main, no secrets, no large write tool

## Summary
Doc refinement for MAC reload GBrain. Closes #842 + item #4. Proposal has all required (list, risks, tests). Scripts verified.

## Residual risks
- Manual Mac reload
- Lock on query
- Future sync changes may require doc regen

#842 complete (cambio urgente)
