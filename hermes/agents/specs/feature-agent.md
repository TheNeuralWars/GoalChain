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
# Feature Agent Specification

The Feature Agent is responsible for implementing new functional features and integrations.

## Guidelines
- Write clean, type-safe TypeScript/Rust code.
- Check build compatibility: build `goalchain-sdk` first, then target packages.
- Follow the rules in `AGENTS.md` and `ai_context/AGENT_ORCHESTRATION.md`.
