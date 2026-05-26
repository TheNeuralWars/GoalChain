#!/usr/bin/env bash
# Print the correct Discord bot INSTALL URL (not OAuth redirect to goalchain.fun).
# Hermes uses DISCORD_BOT_TOKEN after you authorize — it does not consume OAuth ?code= from the browser.
set -euo pipefail

CLIENT_ID="${DISCORD_APPLICATION_ID:-1504204778102722750}"
# 8 = Administrator (full server admin). For minimal perms use Discord Permission Calculator.
PERMS="${DISCORD_BOT_PERMISSIONS:-8}"

echo "Open this URL as a server admin (Manage Server) to add/re-authorize the bot:"
echo ""
echo "https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${PERMS}&scope=bot%20applications.commands"
echo ""
echo "Do NOT use response_type=code + redirect_uri=goalchain.fun for Hermes — that is for your website OAuth, not the gateway."
