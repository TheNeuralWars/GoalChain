# GoalChain OpenCode (Antigravity profile)

Local OpenCode on Mac configured as **Antigravity** — Master Agent & Integration Owner.

## Quick start

```bash
cd /Users/NicoPez/GoalChain
bash ops/hermes/install-opencode-antigravity-mac.sh   # idempotent setup
opencode                                          # TUI — Tab to switch agents
```

Default primary agent: **antigravity** (`@antigravity` in chat).

## Files

| Path | Purpose |
|------|---------|
| `opencode.json` | Project config (model, MCP, instructions, commands) |
| `.opencode/SOUL.md` | Identity, credentials policy, multi-agent rules |
| `.opencode/agents/antigravity.md` | Primary agent definition |
| `.opencode/agents/review.md` | Subagent for PR review |
| `~/.config/opencode/opencode.jsonc` | Global permissions + env paths |
| `~/.config/opencode/goalchain-env.sh` | Loads API keys from GoalChain `.env` (not committed) |

## Hermes local bridge

Tasks dispatched as `agent:antigravity` from Hermes enqueue to `~/.goalchain/` and run:

```bash
opencode run --agent antigravity "Implement issue #N …"
```

Install bridge daemon: `bash ops/hermes/install-local-bridge-macos.sh`

## Verify

```bash
opencode providers list
gbrain query "GoalChain agent orchestration"
gh repo view TheNeuralWars/GoalChain
```

Reload OpenCode after MCP/config changes.
