# Hermes: Cloudflare Tunnel + xAI for OA

**Status:** ready (needs Nico credentials on server)  
**Owner:** Nico + Manager  
**Scope:** `~/hermes/config.env`, Cloudflare Zero Trust, OpenCode/OA

## Why

- **SuperGrok subscription** → OpenCode OAuth (headless device code at https://x.ai/device). No API key.
- **Cloudflare Tunnel** exposes webhook + optional `/callback` for OAuth; browser OAuth on VPS still needs `ssh -L 56121:127.0.0.1:56121` because xAI redirects to loopback.

## Services exposed

| Path / host | Local | Purpose |
|-------------|-------|---------|
| `https://<TUNNEL_HOSTNAME>/webhook*` | `127.0.0.1:3456` | OA webhook |
| `https://<TUNNEL_HOSTNAME>/` | `127.0.0.1:18789` | OpenClaw gateway |

## One-time setup (server)

1. **Cloudflare tunnel**
   ```bash
   ~/bin/cloudflared tunnel login
   ~/bin/cloudflared tunnel create goalchain-hermes
   ~/bin/cloudflared tunnel route dns goalchain-hermes oa.YOURDOMAIN.com
   ```
   Note `TUNNEL_ID` and credentials JSON path under `~/.cloudflared/`.

2. **xAI in OpenCode (subscription)**
   ```bash
   bash ~/hermes/scripts/install-opencode-xai.sh
   bash ~/hermes/scripts/oa-xai-connect.sh headless
   tmux attach -t oa-xai-auth
   # Select Headless → open https://x.ai/device → enter code
   bash ~/hermes/scripts/oa-xai-connect.sh verify
   ```

3. **Tunnel (optional but recommended for webhook)**
   Edit `~/hermes/config.env`:
   ```bash
   TUNNEL_HOSTNAME=oa.YOURDOMAIN.com
   TUNNEL_ID=<uuid>
   TUNNEL_CREDENTIALS_FILE=/home/goalchain/.cloudflared/<uuid>.json
   OA_MODEL=xai/grok-4.3
   ```
   ```bash
   bash ~/hermes/scripts/setup-tunnel-xai.sh start
   bash ~/hermes/scripts/oa-control.sh restart
   ```

## WhatsApp (Manager)

- `manager: tunnel status`
- `manager: oa start`

## Rollback

```bash
bash ~/hermes/scripts/setup-tunnel-xai.sh stop
# remove DNS route in Cloudflare if retiring tunnel
```

## Notes

- OpenClaw (Manager) already uses Grok via OpenClaw xAI plugin; OA uses **separate** `XAI_API_KEY` in `config.env`.
- GitHub Copilot OAuth for OpenCode can stay as fallback (`opencode providers list`).
