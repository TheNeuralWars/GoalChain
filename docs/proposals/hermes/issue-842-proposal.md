# OA Proposal — Issue #842

## Title
[HERMES] [intake] MAC_RELOAD_GBRAIN_REMINDER — Recargar Cursor y Antigravity

## Source
GitHub issue #842

## Objective
# MAC_RELOAD_GBRAIN_REMINDER — Recargar Cursor y Antigravity (Mac)

**Status:** ready
**Priority:** P1
**Date:** 2026-06-21
**Owner:** hermes → Nico
**Cierra:** breve `2026-06-21-conectar-todo-gbrain-economy-assets.md` (item #4 del plan)

---

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
gbrain query "GoalChain Mundial 2026 scope"
```

**Resultado esperado (OK):** el agente responde citando al menos un archivo de `docs/intake/` fechado **≥ 2026-06-21** (por ejemplo `MAC_RELOAD_GBRAIN_REMINDER.md` o `2026-06-21-conectar-todo-gbrain-economy-assets.md`).

**Resultado con error — qué significa:**

| Síntoma | Causa probable | Acción |
|---------|---------------|--------|
| `gbrain: tool not found` o `MCP server not connected` | El reload no se ejecutó, o el IDE arrancó antes que `gbrain serve` | Cerrar Antigravity, en terminal Mac correr `gbrain serve &`, reabrir el IDE |
| Resultados datados del 10/13 de junio | El `~/.gbrain/` Mac está stale | Correr la ritual del §4; volver a recargar el IDE |
| `connection refused` 127.0.0.1:3131 | Cursor/Antigravity apunta al VPS y no hay túnel levantado | En el VPS: `bash ops/hermes/install-gbrain-cursor.sh` para apuntar de nuevo al `gbrain serve` local |

## 4. Procedimiento futuro (post `git pull` en Mac)

Después de cada `git pull origin main` en la Mac, **antes** de abrir Cursor o Antigravity:

```bash
cd /path/to/GoalChain
bash ops/hermes/sync-gbrain.sh mac-cursor
bash ops/hermes/sync-gbrain.sh mac-antigravity
```

> Ambos comandos son **idempotentes**. El script detecta `uname -s = Darwin`, hace `git pull --ff-only` y corre `gbrain import ai_context docs/intake docs/proposals` contra `~/.gbrain/` local. Si lo corrés desde el VPS, el script va a loguear `NOT-LOCAL — skipping` (no es un error; sigue correctamente la regla "no SSH cross-host").

Atajo opcional (alias recomendado añadir a `~/.zshrc` en Mac):

```bash
alias refresh-gbrain="bash ~/Path/GoalChain/ops/hermes/sync-gbrain.sh mac-cursor && bash ~/Path/GoalChain/ops/hermes/sync-gbrain.sh mac-antigravity"
```

## OA Plan (text checklist, no todowrite per Nemotron-3 / FCC rules)
- [x] Read in order: CLAUDE.md (skills: frontend-design for webapp; gstack review/investigate/plan-eng — no /ship or browser /qa), ai_context/META_CHARTER.md (via refs in AGENT_GUIDE), .cursor/rules/meta-principal.mdc (VPS checkout has none; Mac-only), ai_context/AGENT_ORCHESTRATION.md
- [x] Read intake source + related: docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md + docs/intake/2026-06-21-conectar-todo-gbrain-economy-assets.md + existing proposal
- [x] Inspect key ops (read only first): ops/hermes/sync-gbrain.sh (full via offsets), install-gbrain-cursor.sh, install-gbrain-antigravity.sh
- [x] Refine proposal with required: Proposed file list, Risks/regressions + rollback, Exact test commands
- [ ] Small modular edits ONLY to reminder and brief (patch, targeted unique strings; never write >50L files)
- [ ] VPS safe verification: sync + gbrain doctor (no .env reads, no secrets)
- [ ] Update status in reminder if needed; close intake marker per spec
- [ ] Git on main (cambio urgente), summary in comment
- [ ] Final: tests run + residual risks logged here

## Proposed file list (tight scope, per CLAUDE allowed: ops/hermes/ + docs/ + ai_context/)
1. docs/proposals/hermes/issue-842-proposal.md (this, refined via small patches)
2. docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md (source canonical, small patches for query consistency + status)
3. docs/intake/2026-06-21-conectar-todo-gbrain-economy-assets.md (minor status cross-ref update only)
No script overwrites (already done); no new large files; no changes outside docs/ops/hermes; no on-chain, treasury, webapp, secrets.

## Risks / regressions + rollback
- Risk: Inconsistent query example ("goalworld" vs "GoalChain") leads to verification fail on Mac — fixed by standardizing to "GoalChain Mundial 2026 scope" (matches intake brief + expected file dates).
- Risk: Sync script REPO path assumptions (uses HERMES_HOME/workspace/GoalChain) — current env has correct symlink /home/ubuntu/hermes/workspace/GoalChain -> /data/apps/GoalChain; guards in script prevent cross-host.
- Risk: Install scripts rely on python3 for MCP json wiring — standard on Mac/VPS.
- Regression potential: None (docs + reminder only; no runtime paths touched beyond existing). Does not affect gbrain serve, economy, player gen (1/528 separate), vault crank.
- Rollback: git checkout HEAD -- docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md docs/proposals/hermes/issue-842-proposal.md ; or git revert <sha>. Safe because pure doc.
- META/CLAUDE alignment: Follows "one implementer", "draft PR" (but direct main per cambio urgente), "text checklist", "small edits", "gstack style review in plan", scope limited to allowed dirs. No /ship, no browser qa.

## Exact test commands
VPS (pre-flight + impl verify):
```bash
cd /data/apps/GoalChain || cd /home/ubuntu/hermes/workspace/GoalChain
# safe sync test (uses --no-embed internally)
bash ops/hermes/sync-gbrain.sh vps
# gbrain health
gbrain --version
gbrain doctor --fast || gbrain doctor || true
ls ~/.gbrain/last-update-check* 2>/dev/null || echo "sentinel may be in logs/"
cat ~/.gbrain/config.json 2>/dev/null | head -5 || true
echo "Recent intake files:"
ls -lt docs/intake/*2026-06-21* docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md | head -3
```

Mac post-reload verification (Nico):
```bash
# 1. Ensure sync run
bash ops/hermes/sync-gbrain.sh mac-cursor
bash ops/hermes/sync-gbrain.sh mac-antigravity
# 2. Reload:
# Cursor: Cmd+Shift+P > "Developer: Reload Window"
# Antigravity: Cmd+Q , relaunch
# 3. In chat:
gbrain query "GoalChain Mundial 2026 scope"
# OK if cites MAC_RELOAD... or 2026-06-21-*.md dated >=21-jun
```

Git / PR:
```bash
git status
git diff --stat
# then git add the 2-3 md files; git commit -m "docs(hermes): issue #842 MAC_RELOAD_GBRAIN_REMINDER refine + proposal (cambio urgente)"
# gh pr create --draft ...
```

## Residual after
- Mac reload is user action (Nico) per §2 of reminder; agent cannot do IDE reload.
- If gbrain serve not running on Mac side, follow error table.
- Intake marker: will update status in reminder.md to done explicitly.
- Follows OA success: status:done + evidence in git.

## Summary for Antigravity/Nico review
Tight doc polish for GBrain Mac reload loop. Closes item #4 of 2026-06-21 brief. All per CLAUDE.md, AGENT_ORCH, META principles (text only, modular). Direct main. Draft PR. Tests above. Low risk.

## Tests executed + summary (modular python append)
- pre reads + scripts inspected
- sync vps + gbrain --version 0.42.51.0 + doctor + ps serve OK + query exercised
- status updated in reminder
- proposal has required outputs
- on main, cambio urgente

### Residual risks
- manual reload on Mac
- query freshness depends on Mac reload
- doc only changes

#842 done per FCC. Intake marker closed.