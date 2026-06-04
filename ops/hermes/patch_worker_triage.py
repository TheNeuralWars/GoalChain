import os

path = '/home/goalchain/hermes/scripts/oa-worker.sh'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar a agent:grok-triage a CODE_AGENTS
content = content.replace(
    'CODE_AGENTS=frozenset({"agent:opencode", "agent:antigravity", "agent:grok"})',
    'CODE_AGENTS=frozenset({"agent:opencode", "agent:antigravity", "agent:grok", "agent:grok-triage"})'
)

# 2. Agregar la bifurcación para agent:grok-triage
target_routing = '  # Notify Discord that the task is actively being processed by a specific agent\n  if [[ ",${labels_csv}," == *",agent:grok,"* ]]; then'

replacement_routing = '  # Notify Discord that the task is actively being processed by a specific agent\n  if [[ ",${labels_csv}," == *",agent:grok-triage,"* ]]; then\n    python3 /home/goalchain/hermes/scripts/hermes_reporter.py --active --issue "${number}" --title "${title}" --tier "grok-4.3" --agent "grok-triage" 2>/dev/null || true\n    \n    log "Grok Triage Agent priority=${priority} for issue #${number}"\n    (\n      cd "${REPO}"\n      timeout 3600 /home/goalchain/.local/bin/grok --permission-mode dontAsk --system-prompt-override "/home/goalchain/hermes/prompts/grok_triage_system.txt" --prompt-file "${prompt_file}" >> "${run_log}" 2>&1\n    ) || run_status=$?\n    \n  elif [[ ",${labels_csv}," == *",agent:grok,"* ]]; then'

if target_routing in content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.replace(target_routing, replacement_routing))
    print('✅ Successfully patched oa-worker.sh with Grok Triage Agent support!')
else:
    # Loose match for target routing just in case of newline spacing
    target_loose = 'if [[ ",${labels_csv}," == *",agent:grok,"* ]]; then'
    replacement_loose = 'if [[ ",${labels_csv}," == *",agent:grok-triage,"* ]]; then\n    python3 /home/goalchain/hermes/scripts/hermes_reporter.py --active --issue "${number}" --title "${title}" --tier "grok-4.3" --agent "grok-triage" 2>/dev/null || true\n    \n    log "Grok Triage Agent priority=${priority} for issue #${number}"\n    (\n      cd "${REPO}"\n      timeout 3600 /home/goalchain/.local/bin/grok --permission-mode dontAsk --system-prompt-override "/home/goalchain/hermes/prompts/grok_triage_system.txt" --prompt-file "${prompt_file}" >> "${run_log}" 2>&1\n    ) || run_status=$?\n  elif [[ ",${labels_csv}," == *",agent:grok,"* ]]; then'
    if target_loose in content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content.replace(target_loose, replacement_loose))
        print('✅ Successfully patched oa-worker.sh via loose pattern matching!')
    else:
        print('❌ Loose match pattern not found!')
