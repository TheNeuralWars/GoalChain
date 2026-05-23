#!/usr/bin/env bash
# Interactive auth helper for OpenCode providers (run manually on server).
set -euo pipefail

echo "OpenCode provider auth helper"
echo "This step is interactive and requires browser/device approval."
echo
echo "1) GitHub Copilot OAuth:"
echo "   opencode providers login -p github-copilot -m \"Login with GitHub Copilot\""
echo "   - choose GitHub.com (Public) unless you use GHE"
echo "   - open github.com/login/device and enter the code shown"
echo
echo "2) xAI / Grok (SuperGrok subscription — recommended):"
echo "   bash ~/hermes/scripts/oa-xai-connect.sh headless"
echo "   # tmux: choose Headless, then open https://x.ai/device and enter code"
echo
echo "   Alternative API key (pay-as-you-go):"
echo "   XAI_API_KEY=... in ~/hermes/config.env"
echo "   bash ~/hermes/scripts/oa-xai-connect.sh apikey"
echo
echo "3) Cloudflare Tunnel (recommended for remote OAuth/callbacks):"
echo "   bash ~/hermes/scripts/setup-tunnel-xai.sh start"
echo
echo "4) Verify:"
echo "   opencode providers list"
echo "   opencode models xai"
echo "   bash ~/hermes/scripts/oa-control.sh status   # includes discord_research status"
echo
echo "5) Set OA model to xAI in ~/hermes/config.env"
echo "   OA_MODEL=\"xai/grok-4.3\""
echo "   then: bash ~/hermes/scripts/oa-control.sh restart"
