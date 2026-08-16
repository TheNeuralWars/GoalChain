---
name: hermes-ops
description: >-
  Orchestrate and synchronize Hermes autonomous agent system, VPS daemons,
  Honcho memory backend, and GoalChain operations from Antigravity.
---

# Hermes Operations & Memory Sync Skill

This skill provides Antigravity with direct operational control and memory synchronisation procedures for Hermes, Honcho, and GoalChain.

---

## 🧠 1. Honcho & Memory Protocol

- **Workspace**: `hermes`
- **Backend**: Unified memory with remote VPS Hermes (observations, dialectic, recall).
- **gBrain Memory Verbs**:
  - `remember`: Store durable facts, decisions, and system constraints.
  - `recall`: Retrieve budget-packed context by query or entity name.
  - `entity`: Get instant summary cards for key actors, wallets, or subsystems.
  - `synthesize`: Cross-page semantic reasoning.
  - `forget`: Invalidate expired facts.

---

## 🛠️ 2. MCP Tools Available

1. **`goalworld-ops`**:
   - `goalchain_ops_status`: Health and system metrics of the GoalChain API.
   - `goalchain_economy_health` & `goalchain_economy_config`: In-depth tokenomics and economy state.
   - `goalchain_onchain_program_info`: Live Solana Devnet program state.
2. **`gbrain`**:
   - Local and remote knowledge graph queries, timeline tracking, and semantic search.
3. **`agent-reach` (Exa)**:
   - High-precision web search (`web_search_exa`) and URL retrieval (`web_fetch_exa`).
4. **`filesystem`**:
   - Safe multi-root access to `goalchain`, `C:\antigravity-mcp`, and `C:\Users\NicoPez\hermes-home`.

---

## 🚀 3. VPS & Local Synchronization Commands

### A. Sync Local Context to Brain / VPS
```powershell
# Sync Markdown intake and decisions to gbrain
& "C:\Users\NicoPez\.bun\bin\gbrain.exe" import "c:\Users\NicoPez\goalchain\ai_context"
& "C:\Users\NicoPez\.bun\bin\gbrain.exe" import "c:\Users\NicoPez\goalchain\docs\intake"
```

### B. Trigger Local Memory Sync
```powershell
powershell -ExecutionPolicy Bypass -File "c:\Users\NicoPez\goalchain\ops\hermes\gbrainsync-client.ps1"
```

### C. Verify Health
Run the healthcheck script through `goalworld-ops` or manually via python:
```powershell
python "c:\Users\NicoPez\goalchain\ops\hermes\mcp-goalchain-ops.py"
```
