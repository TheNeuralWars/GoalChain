# Zealy Integration Guide

## Overview

GoalChain integrates with Zealy Season 1 via a webhook endpoint that:
1. Verifies Zealy quest completion payloads (HMAC-SHA256 signature)
2. Logs completions to `data/zealy_completions.json` for analytics
3. Assigns the `Degen` Discord role to the completing user

---

## Endpoint

```
POST /api/zealy/webhook
Content-Type: application/json
x-zealy-signature: <HMAC-SHA256 hex digest>
```

### Payload (from Zealy)

```json
{
  "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTjkA6wAhXodGy7ao",
  "user_id": "123456789012345678",
  "quest_id": "follow_twitter"
}
```

### Response

- `200 { "ok": true }` — success
- `400` — missing required fields
- `401` — invalid or missing `x-zealy-signature`

---

## Environment Variables

| Variable | Description |
|---|---|
| `ZEALY_WEBHOOK_SECRET` | HMAC secret from Zealy webhook config. If unset, webhook runs in dev mode (no signature verification). |
| `DISCORD_COMMUNITY_BOT_TOKEN` | Discord bot token (must have `GuildMembers` intent + `Manage Roles` permission) |
| `DISCORD_GUILD_ID` | Your Discord server ID |
| `DISCORD_DEGEN_ROLE_ID` | Role ID for the "Degen" role to assign |

### Getting Discord IDs

```bash
# Enable Developer Mode in Discord → right-click server → Copy ID
# Right-click role → Copy ID
```

---

## Zealy Webhook Configuration

1. In Zealy admin panel → your campaign → Webhooks
2. Add webhook URL: `https://goalchain.fun/api/zealy/webhook`
3. Set secret: copy the `ZEALY_WEBHOOK_SECRET` value to your server's env
4. Select events: `quest_completed`

---

## Logs

Completions are saved to `data/zealy_completions.json`:

```json
[
  {
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTjkA6wAhXodGy7ao",
    "user_id": "123456789012345678",
    "quest_id": "follow_twitter",
    "timestamp": "2026-06-05T14:30:00.000Z"
  }
]
```

Log is rotated: last 1000 entries only.

---

## Testing Locally

```bash
# Start the API server
cd goalchain_api && npm run dev

# Simulate a Zealy payload (without real secret — triggers dev mode)
curl -X POST http://localhost:3001/api/zealy/webhook \
  -H "Content-Type: application/json" \
  -d '{"wallet":"test123","user_id":"999","quest_id":"test_quest"}'

# With correct HMAC (if ZEALY_WEBHOOK_SECRET=mysecret):
# HMAC = echo -n '{"wallet":"test123","user_id":"999","quest_id":"test_quest"}' | openssl dgst -sha256 -hmac mysecret
curl -X POST http://localhost:3001/api/zealy/webhook \
  -H "Content-Type: application/json" \
  -H "x-zealy-signature: <computed-hmac>" \
  -d '{"wallet":"test123","user_id":"999","quest_id":"test_quest"}'
```

---

## Discord Role Requirements

The bot must have:
- **Intents**: `GuildMembers` (enabled in Discord Developer Portal → Bot → Privileged Gateway Intents)
- **Permissions**: `Manage Roles` — bot's role must be higher than the "Degen" role in the role hierarchy

The role assignment uses Discord REST API v10:
```
PUT https://discord.com/api/v10/guilds/{GUILD_ID}/members/{user_id}/roles/{ROLE_ID}
Authorization: Bot {DISCORD_COMMUNITY_BOT_TOKEN}
```

---

## Security Notes

- HMAC verification prevents spoofed quest completions
- Dev mode (no `ZEALY_WEBHOOK_SECRET`) should only be used locally
- Discord token must have minimal permissions (only `Manage Roles` on the guild)
- Logs are append-only and rotated automatically