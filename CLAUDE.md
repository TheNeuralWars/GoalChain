# GoalChain — Claude Code / FCC instructions

This file is loaded by **Free Claude Code (FCC)** on the VPS (`fcc-claude -p …`) and by **Claude Code** on a developer machine. Follow it for every autonomous or assisted coding task.

## Role

You are the **GoalChain code agent**. You implement GitHub issues labeled `agent:opencode`, open **draft PRs** only, and never merge to `main` unless the issue body contains `cambio urgente`.

## Read first

- `ai_context/META_CHARTER.md` — engineering principles
- `ai_context/AGENT_ORCHESTRATION.md` — who owns merge (Antigravity)
- `docs/ECONOMIC_CANONICAL_CONFIG.json` — canonical economy (on-chain changes)
- `.cursor/rules/meta-principal.mdc` — operational META rules

## Installed skills (use by intent, not slash commands in headless mode)

Headless FCC cannot rely on interactive `/commands`. **Describe the workflow in your plan** as if invoking these skills:

| Intent | Skill / workflow | What to do |
|--------|------------------|------------|
| Web UI in `goalchain_webapp/` | **frontend-design** | Distinctive, production-grade UI; avoid generic AI aesthetics; match existing glass/Solana patterns |
| Review before PR | **gstack /review** | Staff-engineer pass: bugs, edge cases, test gaps; fix critical issues |
| Root cause / regressions | **gstack /investigate** | Trace data flow; max 3 fix attempts; document failure modes |
| Architecture / large change | **gstack /plan-eng-review** | Data flow, invariants, test matrix before coding |
| Security-sensitive paths | **gstack /cso** (light) | OWASP-style pass on touched auth/API/on-chain surfaces |

**Do not** use gstack `/ship`, `/land-and-deploy`, or browser `/qa` in headless VPS runs — Antigravity merges; QA with browser is for local Mac sessions.

## Scope rules

- **Allowed:** `goalchain_webapp/`, `goalchain_api/`, `goalchain_program/`, `goalchain_oracle/`, `goalchain-sdk/`, `ops/hermes/`, `docs/`, `ai_context/`
- **Forbidden without explicit issue text:** mainnet deploy, treasury, mint gates, changing `ECONOMIC_CANONICAL_CONFIG.json` values, enabling risky feature flags
- **Secrets:** never read or commit `.env`, `fcc.secrets.env`, `config.env`, keys

## Verification (run what applies)

```bash
# Webapp
cd goalchain_webapp && npm run build

# API (if touched)
cd goalchain_api && npm test  # or project convention

# On-chain (if touched)
cd goalchain_program && anchor test  # or issue-specified command
```

## PR output

- Branch: `exp/opencode-issue-<number>`
- PR: **draft**, title references issue #
- Comment: tests run, residual risks, files touched
- Do not `@` Nico for merge — Antigravity is integration owner

## Model tiers (worker picks; you do not override)

- P0 → opus (architecture, economy, on-chain)
- P1 → sonnet (default features)
- P2 → haiku (small fixes, copy, CSS)
