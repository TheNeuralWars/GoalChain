# GoalChain — CLAUDE.md

Instructions for every coding agent (Claude Code, FCC, Hermes, others) working in this repo.

## Read first
- `README.md` — product and architecture context (Solana football-manager ecosystem).
- `ai_context/AGENT_ORCHESTRATION.md` — GitHub label contract for issue pickup.
- `docs/ECONOMIC_CANONICAL_CONFIG.json` — canonical economy config (on-chain-sensitive; see hard limits).

## Role & workflow
- Implement GitHub issues (label `agent:opencode` or as assigned).
- Branch: `exp/opencode-issue-<number>`; PR title references the issue.
- On the PR: note tests run, files touched, and residual risks.

## Merge & deploy policy
All agent work (Hermes or other agents) is merged to main and deployed to production automatically, without asking Nico, ONLY when build/tests/QA are green and a rollback is ready; if anything breaks in production the agent reverts on its own and reports. Hermes owns merges.

## Proactivity
Propose and build unrequested improvements that add to the product and its growth.

## Hard limits (always, no exceptions)
- No spending money.
- No touching on-chain economy, treasury, or mainnet; never change `docs/ECONOMIC_CANONICAL_CONFIG.json` values without explicit issue text.
- No deleting projects.
- No DNS changes — DNS goes through Grok Bot.
- No Cloudflare tunnels, OAuth, or credential/key changes.
- Never invent public data, figures, prices, or dates.

## Secrets
- Never read, print, or commit `.env`, `config.env`, key files, or wallet material.

## Scope
- Allowed: `goalchain_webapp/`, `goalchain_api/`, `goalchain_program/`, `goalchain_oracle/`, `goalchain-sdk/`, `ops/hermes/`, `docs/`, `ai_context/`, `scripts/`, `tests/`
- Forbidden without explicit issue text: mainnet deploy, treasury operations, mint gates, enabling risky feature flags.

## Verification (run what applies)
```bash
cd goalchain_webapp && npm run build        # webapp (tsc + vite build)
cd goalchain_api && npm run check           # api (tsc lint + build)
cd goalchain_program && npm test            # anchor test --validator legacy
bash scripts/sync-idl.sh --check            # IDL sync check after program changes
```

## URLs
- Official site: https://goalworld.fun (goalchain.fun redirects to it)
- App: https://play.goalworld.fun

## Publishing / lore
- Trilogy manuscripts and series bible: `docs/publishing/the_neural_wars_trilogy/`; film draft assets: `docs/assets/img/neuralwars/`.

## Marketing & public copy
- **English Max Law**: all public copy (X, Discord, Zealy, the sites) is 100% English — zero Spanish words.
- Never cross-blast identical content across platforms or channels; keep posts spaced out.
