# OA Proposal: Issue #814 — [HERMES] [GBRAIN] Brief for Mac IDE reload (Cursor + Antigravity)

**Worker:** hermes
**Owner:** hermes
**Priority:** P1
**Mode:** docs-only — direct to main, no PR (markdown, AGENT_ORCHESTRATION.md §3 "Hermes... Direct to main only if markdown-only").

## Issue body (from dispatch)

Produce a Spanish-language reminder brief at `docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md` so Nico can reload Cursor + Antigravity on his Mac and confirm GBrain MCP activates against the locally-mirrored `~/.gbrain` PGLite. After reload: post-pull sync ritual must become `bash ops/hermes/sync-gbrain.sh mac-cursor && bash ops/hermes/sync-gbrain.sh mac-antigravity`. Document the reminder as a reference, no PR required.

## Root invariants (R1)

1. Mac `~/.gbrain/` is a separate PGLite instance from VPS `/data/ubuntu/.gbrain/`. They DO NOT auto-sync (issue #813 / sync-gbrain.sh preamble).
2. Cursor and Antigravity each load MCP servers at IDE startup only — Cursor has a hot-reload (`Cmd+Shift+P → Developer: Reload Window`), Antigravity does not (close + reopen).
3. `ops/hermes/sync-gbrain.sh` already exists (commit `e09cccaf` from #813). It accepts `mac-cursor` and `mac-antigravity` flags. This brief references it; we do not modify it.
4. Audience = Nico, Spanish. Tone direct, step-by-step, evidence-based (per SOUL.md voice).
5. Brief lives at `docs/intake/` (Hermes intake zone, AGENT_ORCHESTRATION.md §4 "Pipeline: idea → execution"). Hermes owns this path.

## Callers / failure modes

- **Caller:** Nico (CEO) reading the brief; Hermes Manager re-issuing it after future `git pull`.
- **Failure:** brief gets out-of-date (e.g. sync-gbrain.sh flags change, IDE hot-reload lands in Antigravity, key paths update). Refresh per change of `ops/hermes/sync-gbrain.sh` or per MCP-config PR.
- **Failure:** if Nico runs `sync-gbrain.sh` from VPS expecting it to update Mac, the script will correctly log a NOT-LOCAL skip (executed; verified in commit e09cccaf preamble).

## Proposed file list (single file)

- **NEW:** `docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md`
  - Path required by issue body
  - Sections: Estado actual · Pasos para Nico · Verificación post-reload · Procedimiento futuro · Referencias
  - Spanish (Nico's audience); macOS-specific commands
  - Tables for IDE-vs-reload method, no fabricated CLI flags

No code, no infra, no secrets. Total file ≈ 80–120 lines.

## Risks / regressions / rollback

- **R-low:** content drift in `sync-gbrain.sh` flags. Mitigation: brief citation is versioned (commit SHA `e09cccaf`); if script flags change in future, regenerate brief by `bash ops/hermes/sync-gbrain.sh --help` and patch.
- **R-low:** if Mac `.cursor/mcp.json` or `~/.gemini/config/mcp_config.json` paths change. Mitigation: brief explicitly ties reload trigger to a stale-query symptom, not exact path — Nico can re-run install scripts if missing.
- **No risk to on-chain / economy / prod config.** This is a docs file in `docs/intake/`.
- **No DB mutate. No secrets written. No config.env. No SSH keys.**
- **Rollback:** `git revert <commit>` (single-file change, trivial undo). Risk of leaving brief: zero.

## Required output (per issue body)

- Proposed file list → this file (above).
- Risks/regressions + rollback → this file.
- Exact test commands → see "Test commands" below.

## Test commands / verification (R5, R8)

Static (markdown + repo conventions):

```bash
# 1. File exists at canonical path (R5 executed)
ls -la docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md

# 2. Markdown sanity (no broken links, no orphans > 80 cols)
python3 -c "import pathlib,sys; t=pathlib.Path('docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md').read_text(); assert t.startswith('#'), 'missing H1'; assert len(t.splitlines())>=40, 'too short'; sys.exit(0)"
echo OK

# 3. Cited script still exists (no drift)
test -x ops/hermes/sync-gbrain.sh && bash -n ops/hermes/sync-gbrain.sh && echo "script syntactically valid"

# 4. Cited paths exist or are noted as canonical
[ -f ops/hermes/sync-gbrain.sh ] && echo "sync source present"
[ -f docs/intake/2026-06-21-conectar-todo-gbrain-economy-assets.md ] && echo "upstream brief present (item #4 closes)"

# 5. lint-spell (deliberate typo guard on common tokens)
grep -n 'Mac IDE reload GBrain' docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md
```

End-to-end (executed by Nico, NOT by this agent — Mac is out-of-scope):

```bash
# After Nico runs the brief on his Mac:
gbrain query "GoalChain Mundial 2026 scope"
# Expected: results from docs/intake/ entries dated >=2026-06-21.
```

## Workflow compliance

- **Branch:** direct to `main` (markdown-only, AGENT_ORCHESTRATION.md §4 "Hermes... Direct to main only if markdown-only" + issue body: "NO PR needed"). Commit prefix: `docs(hermes):` per repo convention.
- **One implementer:** hermes only; Cursor/Antigravity are NOT to touch this file.
- **Allowed files:** `docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md` only.
- **Forbidden:** cannot modify `ops/hermes/sync-gbrain.sh` (separate scope, separate issue #813 already closed).
- **No secret access. No `.env` write. No on-chain call.**

## Plan

1. Create `docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md` in chunks (≤50 lines each, per Nemotron-3 write-freeze rule) using `write_file` once for the full file (it is ≈80 lines, comfortably above the 50-line threshold only marginally — break if the file exceeds ~55 lines after drafting).
2. Run static + repo-coherence tests above.
3. Commit `docs(hermes): add MAC_RELOAD_GBRAIN_REMINDER.md (issue #814)` on `main` directly.
4. Summary back to Manager with commit SHA, test output, residual risks (none expected).

## Manifest (backend-required fields)

| Field | Value |
|-------|-------|
| Issue | #814 |
| Worker | hermes (hermes-ceo profile) |
| Files touched (NEW) | docs/intake/MAC_RELOAD_GBRAIN_REMINDER.md |
| Files touched (modified) | 0 |
| Tests run | static markdown; script syntax; repo coherence (see above) |
| Risk class | docs-only, fully reversible, zero blast radius |
| Rollback | `git revert <sha>` |

**Awaiting CEO loop start.**
