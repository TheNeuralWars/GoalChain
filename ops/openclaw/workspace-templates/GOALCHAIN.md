# GoalChain — quick context (Manager)

Read this when Nico asks about the project on WhatsApp or panel.

## Repo

`/home/goalchain/hermes/workspace/GoalChain` — sync: `bash ~/hermes/scripts/sync.sh`

## Live status

Run before answering "estado", "PRs", "qué hay pendiente":

```bash
bash ~/hermes/scripts/openclaw-context.sh
```

## Stack (high level)

- `goalchain_program` (on-chain)
- `goalchain_api`, `goalchain_webapp`, `goalchain_oracle`
- Intake: `docs/intake/*.md`

## Task dispatch from WhatsApp

When Nico says "assign this to Cursor/Antigravity/OpenCode/Grok", run:

```bash
bash ~/hermes/scripts/create-task.sh <owner> <P0|P1|P2> "<title>" "<objective>"
```

This creates a GitHub issue with labels:

- `agent:<owner>`
- `priority:<P0|P1|P2>`
- `status:ready`
- `source:manager`

Then reply to Nico with the issue URL.

If task text contains `cambio urgente`, include in issue objective:

`Policy: direct main push requested by Nico via keyword cambio urgente.`

This means emergency direct-main mode for the assigned agent.

## OA (OpenCode Autonomous) control

Manager can control OA worker from commands:

```bash
bash ~/hermes/scripts/oa-control.sh start
bash ~/hermes/scripts/oa-control.sh stop
bash ~/hermes/scripts/oa-control.sh status
bash ~/hermes/scripts/oa-control.sh auth
```

Persistent mode (recommended after setup):

```bash
bash ~/hermes/scripts/oa-control.sh systemd-install
bash ~/hermes/scripts/oa-control.sh systemd-status
```

Webhook inbox for OA messages:

```bash
curl -X POST http://127.0.0.1:3456/webhook \
  -H "Content-Type: application/json" \
  -d '{"source":"telegram","from":"Nico","text":"task opencode P1 \"Title\" \"Objective\""}'
```

OA writes proposals to:

- `docs/proposals/opencode/`

## xAI + OpenCode (SuperGrok subscription)

```bash
bash ~/hermes/scripts/oa-xai-connect.sh headless
tmux attach -t oa-xai-auth   # https://x.ai/device + code
bash ~/hermes/scripts/oa-xai-connect.sh verify
```

WhatsApp: `manager: xai auth`

## Tunnel (webhook / optional callback)

Set `TUNNEL_HOSTNAME`, `TUNNEL_ID`, `TUNNEL_CREDENTIALS_FILE` in `~/hermes/config.env`, then:

```bash
bash ~/hermes/scripts/setup-tunnel-xai.sh start
```

WhatsApp: `manager: tunnel start|stop|status`

## Discord research publishing

OA now publishes new `ai-radar-*` and `ai-ecosystem-opportunities*` reports continuously.

In `~/hermes/config.env` set one of:

```bash
DISCORD_RESEARCH_WEBHOOK_URL="https://discord.com/api/webhooks/..."
# or:
DISCORD_TOKEN="..."
DISCORD_RESEARCH_CHANNEL_ID="<new_channel_id>"
```

Verify:

```bash
bash ~/hermes/scripts/oa-control.sh status
# should show: discord_research: configured(...)
```

## Handoff to code

For implementation requests, open issue first (task dispatch), then optionally create/update `docs/intake/*.md` for larger scopes.
