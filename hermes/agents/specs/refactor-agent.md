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
# Refactor Agent Specification

The Refactor Agent is responsible for code refactoring, modularization, and codebase health.

## Guidelines
- Follow standard TypeScript and Rust architecture guidelines.
- Always run local check command `tsc --noEmit` on edited packages.
- Follow the rules in `AGENTS.md` and `ai_context/AGENT_ORCHESTRATION.md`.
