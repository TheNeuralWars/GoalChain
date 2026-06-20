path = '/home/goalchain/hermes/scripts/oa-worker.sh'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''      gh issue edit --repo "${GITHUB_REPO}" "${number}" \\
        --remove-label "status:ready" \\
        --remove-label "status:in_progress" \\
        --add-label "status:done" >/dev/null 2>&1 || true
      touch "${done_marker}"
      log "Finished issue #${number} (direct-main mode)"
      return 0'''

replacement = '''      gh issue edit --repo "${GITHUB_REPO}" "${number}" \\
        --remove-label "status:ready" \\
        --remove-label "status:in_progress" \\
        --add-label "status:done" >/dev/null 2>&1 || true
      touch "${done_marker}"
      # Send done/changelog reports also in direct-main urgent mode!
      python3 /home/goalchain/hermes/scripts/hermes_reporter.py --done --issue "${number}" --title "${title:-Task}" --tier "${fcc_tier:-}" --agent "hermes" 2>/dev/null || true
      log "Finished issue #${number} (direct-main mode)"
      return 0'''

if target in content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.replace(target, replacement))
    print('✅ Successfully patched oa-worker.sh with direct-main done reports!')
else:
    # Loose check for spacing
    target_loose = 'log "Finished issue #${number} (direct-main mode)"\n      return 0'
    replacement_loose = 'python3 /home/goalchain/hermes/scripts/hermes_reporter.py --done --issue "${number}" --title "${title:-Task}" --tier "${fcc_tier:-}" --agent "hermes" 2>/dev/null || true\n      log "Finished issue #${number} (direct-main mode)"\n      return 0'
    if target_loose in content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content.replace(target_loose, replacement_loose))
        print('✅ Successfully patched oa-worker.sh via loose matching!')
    else:
        print('❌ Pattern not found in oa-worker.sh!')
