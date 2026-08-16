#!/bin/bash
MM_URL="http://localhost:8065"
NEW_URL="http://172.17.0.1:8088"
TEAM_ID="r8j8wxubi7r9jrp7yohmrxnuga"

echo "Logging into Mattermost..."
TOKEN=$(curl -s -i -X POST "$MM_URL/api/v4/users/login" \
  -H "Content-Type: application/json" \
  -d '{"login_id":"admin","password":"GoalChain2026!"}' \
  | grep -i "^token:" | awk '{print $2}' | tr -d '\r')

if [ -z "$TOKEN" ]; then
  echo "Error: Could not login to Mattermost"
  exit 1
fi
echo "Token: ${TOKEN:0:16}..."

# List commands with team_id
echo "Fetching slash commands for team $TEAM_ID..."
COMMANDS=$(curl -s -H "Authorization: Bearer $TOKEN" "$MM_URL/api/v4/commands?team_id=$TEAM_ID&custom_only=true")
echo "Commands response: $COMMANDS"

HERMES_CMD_ID=$(echo "$COMMANDS" | python3 -c "
import sys, json
try:
    cmds = json.load(sys.stdin)
    if isinstance(cmds, dict):
        print(f\"Error response: {cmds}\")
    else:
        for c in cmds:
            if c.get('trigger') == 'hermes':
                print(c['id'])
                break
except Exception as e:
    print('error:', e)
" 2>/dev/null)

if [ -n "$HERMES_CMD_ID" ] && [ "$HERMES_CMD_ID" != "error" ]; then
  echo "Found hermes slash command ID: $HERMES_CMD_ID. Updating URL to $NEW_URL..."
  CMD_DETAIL=$(curl -s -H "Authorization: Bearer $TOKEN" "$MM_URL/api/v4/commands/$HERMES_CMD_ID")
  
  PATCH_PAYLOAD=$(echo "$CMD_DETAIL" | python3 -c "
import sys, json
cmd = json.load(sys.stdin)
cmd['url'] = '$NEW_URL'
patch = {k: v for k, v in cmd.items() if k in ['trigger', 'method', 'url', 'username', 'description', 'auto_complete', 'auto_complete_desc', 'auto_complete_hint', 'display_name']}
print(json.dumps(patch))
" 2>/dev/null)

  curl -s -X PUT "$MM_URL/api/v4/commands/$HERMES_CMD_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PATCH_PAYLOAD" | grep -o '"url":"[^"]*"'
else
  echo "Hermes slash command not found in list."
fi

# List and update webhooks
echo ""
echo "Fetching outgoing webhooks..."
HOOKS=$(curl -s -H "Authorization: Bearer $TOKEN" "$MM_URL/api/v4/hooks/outgoing?team_id=$TEAM_ID")
echo "Hooks response: $HOOKS"

HERMES_HOOK_ID=$(echo "$HOOKS" | python3 -c "
import sys, json
try:
    hooks = json.load(sys.stdin)
    for h in hooks:
        if 'hermes' in str(h.get('trigger_words', [])).lower() or 'hermes' in h.get('display_name', '').lower():
            print(h['id'])
            break
except Exception as e:
    print('error:', e)
" 2>/dev/null)

if [ -n "$HERMES_HOOK_ID" ] && [ "$HERMES_HOOK_ID" != "error" ]; then
  echo "Found hermes outgoing webhook ID: $HERMES_HOOK_ID. Updating callback URL to $NEW_URL..."
  HOOK_DETAIL=$(curl -s -H "Authorization: Bearer $TOKEN" "$MM_URL/api/v4/hooks/outgoing/$HERMES_HOOK_ID")
  
  PATCH_HOOK=$(echo "$HOOK_DETAIL" | python3 -c "
import sys, json
hook = json.load(sys.stdin)
hook['callback_urls'] = ['$NEW_URL']
print(json.dumps(hook))
" 2>/dev/null)

  curl -s -X PUT "$MM_URL/api/v4/hooks/outgoing/$HERMES_HOOK_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PATCH_HOOK" | grep -o '"callback_urls":\[[^\]]*\]'
else
  echo "Hermes outgoing webhook not found in list."
fi
