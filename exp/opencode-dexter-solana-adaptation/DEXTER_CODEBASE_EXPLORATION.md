# Dexter Codebase Exploration

**Date:** 2026-05-24

## Repository Structure

Dexter is built with TypeScript and organized around an agent core with pluggable skills and tools.

### Key Directories

- `src/agent/` — Core agent logic, prompts, tool execution, context management
- `src/skills/` — Pluggable skill modules (currently: `dcf`, `x-research`)
- `src/tools/` — Tool implementations (memory, filesystem, web search, etc.)
- `src/components/` — UI components (this appears to be a TUI/CLI app)
- `src/gateway/` — Likely API or external service connections
- `src/utils/` — Utility functions

### Main Entry Points

- `src/cli.ts` — Command line interface
- `src/agent/agent.ts` — Main agent class
- `src/skills/loader.ts` + `registry.ts` — Dynamic skill loading system

## Observations for Solana Adaptation

1. **No direct DEX code found in initial scan**
   - Trading/DEX logic is likely loaded via skills or external tools, not hardcoded in the core.
   - This is good — it suggests Dexter is designed to be extended.

2. **Skills system looks promising**
   - Skills are loaded dynamically.
   - We could potentially create a new `solana-trading` skill that replaces EVM DEX interactions.

3. **Tools are modular**
   - Web search, memory, filesystem tools are separate.
   - A Jupiter tool could be added similarly.

## Next Steps

- Deep dive into `src/skills/` and `src/agent/tool-executor.ts` to understand how external actions are called.
- Identify if there's any existing EVM/DEX skill or if it's all prompt-driven.
- Plan the creation of a minimal `jupiter-swap` tool as the first adapter component.
