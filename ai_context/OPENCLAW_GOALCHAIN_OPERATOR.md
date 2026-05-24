# OpenClaw — GoalChain General Agent (Hermes role)

**Runtime:** OpenClaw gateway on Hermes server (`178.105.148.109`)  
**Model:** `xai/grok-4.3` (Grok via OAuth)  
**Workspace:** `~/.openclaw/workspace`  
**Repo clone (ops):** `~/hermes/workspace/GoalChain`

OpenClaw is the **conversational general agent** (voice, chat, panel).  
Shell automation stays in `~/hermes/scripts/` and feeds context via `openclaw-context.sh`.

## Division of labor

| Layer | Tool | Responsibility |
|-------|------|----------------|
| Brain + chat + voice UI | **OpenClaw** (`main` agent) | Decide, discuss, draft briefs, triage with Nico |
| Automation | **~/hermes/scripts/** | `sync.sh`, `daily-digest.sh`, `openclaw-context.sh` |
| Code execution | **Cursor** | Implement from `docs/intake/` briefs |
| Review | **Grok** (same model in OpenClaw) / separate review packets |
| Spikes | **Antigravity** | `exp/antigravity-*` only |

## Source of truth

1. **Tasks:** `docs/intake/*.md` in GoalChain repo (or draft in chat → agent writes file)
2. **Tracking:** GitHub issues linked to briefs
3. **Chat/voice:** not authoritative alone — must land in intake or issue same day

## Agent rules (non-negotiable)

- One implementer per task (`Owner: cursor` default)
- No parallel edits on same files across agents
- No on-chain / program changes without brief + Nico OK on P0
- Economy: align with `docs/ECONOMIC_CANONICAL_CONFIG.json`
- Risky flags OFF until validated
- Blocked: `2026-05-22-webapp-devnet-transactions.md` until PRs #32–#34 merged

## PR merge order

1. #32 → #33 → #34

## Server paths

```text
~/.openclaw/workspace/     # agent memory (SOUL, HEARTBEAT, memory/)
~/hermes/workspace/GoalChain/  # git repo
~/hermes/scripts/          # automation
```

## Panel access (Mac)

```bash
ssh -N -L 18790:127.0.0.1:18789 goalchain@178.105.148.109
# http://127.0.0.1:18790/#token=<gateway token>
```

## Voice (Twilio)

- ngrok: `ngrok http 3334` → webhook for voice-call plugin
- `openclaw voicecall setup` must be OK before relying on phone

## Related

- `ai_context/AGENT_ORCHESTRATION.md`
- `ai_context/HERMES_SETUP.md`
- `docs/intake/TEMPLATE.md`
