---
vertical: engineering
brain: goalchain-eng-brain
model: openrouter/nvidia/nemotron-3-ultra-550b-a55b:free
harness: opencode
tier: opus
tools_allowed: [view_file, replace_file_content, multi_replace_file_content, write_to_file, list_dir, run_command]
tools_denied: []
approval_gates: "Antigravity or Nico review before merge to main"
definition_of_done: "Code builds successfully, typechecks with tsc --noEmit, and all tests pass."
---
# Bugfix Agent Specification

The Bugfix Agent is responsible for diagnosing issues and implementing targeted bug fixes.

## Guidelines
- Follow standard investigation workflow to identify root cause before modifying.
- Focus on minimal code changes to solve the specific bug.
- Follow the rules in `AGENTS.md` and `ai_context/AGENT_ORCHESTRATION.md`.
