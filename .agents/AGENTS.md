# GoalChain Workspace Agent Guidelines

These rules apply specifically to all workspaces in this repository.

---

## 📂 1. Directory Structure & Ignored Folders
- Always prioritize the active core directories: `goalchain_webapp/`, `docs/`, `goalchain_program/`, `goalchain_oracle/`, `goalchain-sdk/`, `goalchain_api/`, `agentic-inbox/`, `hermes/`, `scripts/`.
- Do **not** read or modify files in legacy directories: `_archive/`, `exp/`, `Talks/`, `hermes_tests/`, `venv_parser/`.
- Refer to [PROJECT_INDEX.md](file:///c:/Users/NicoPez/goalchain/PROJECT_INDEX.md) for architecture details.

---

## 🏛️ 2. Architectural Invariants & Non-Negotiables
- **Program ID**: Solana Anchor program ID is strictly `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`.
- **Single Source of Truth for Economy**: `docs/ECONOMIC_CANONICAL_CONFIG.json`.
- **Single Source of Truth for IDL**: `goalchain-sdk/src/goalchain_program.json`.
- **Secrets Protection**: Never read, print, or commit `.env`, `fcc.secrets.env`, or private keypair files.

---

## 📏 3. Namespace Safety in Non-Modular Scripts (docs/)
- When editing static web assets (inside `docs/assets/js/` or other script files loaded sequentially in `index.html`), **never** declare variables, constants, or functions in the global scope using `const` or `let` if there is any chance they are already declared.
- Declaring `const MY_VAR` in multiple scripts loaded in the same window throws a fatal `SyntaxError` which completely breaks execution.
- **Always** use defensive window properties or re-declarable variables:
  ```javascript
  var MY_VAR = window.MY_VAR || { ... };
  ```

---

## 🧪 4. Multi-Tiered Verification Policy
Before marking any task as complete, you MUST execute the relevant builds:
1. **Solana SDK**: `cd goalchain-sdk && npm run build` (if SDK or Anchor IDL touched).
2. **Webapp Compilation Check**: `cd goalchain_webapp && npm run build` (mandatory for frontend changes; must exit 0 with 0 TypeScript errors).
3. **Console & UI Audit**: For UI changes, inspect browser console logs for any red errors or uncaught exceptions.

---

## 🔄 5. Autonomous Self-Correction Protocol
When executing autonomously, follow a structured remediation loop if builds or tests fail:
1. **Precise Diagnosis**: Parse the compiler error message, file path, and line number.
2. **Surgical Patching**: Modify only the offending type definitions, imports, or statements. Avoid wholesale rewrites.
3. **Re-Verification**: Re-run the build command immediately.
4. **Retry Ceiling**: Limit automatic retry cycles to a maximum of 3 targeted iterations. If the issue persists, provide a structured failure diagnosis to the user.

---

## 🧠 6. Memory Synchronization Protocol (gBrain & Hermes)
- GoalChain is an autonomous multi-agent ecosystem shared between Antigravity (local workstation) and Hermes (VPS).
- When establishing key architecture decisions, milestone completions, or shared state updates, record them in `gbrain` via `call_mcp_tool` (`ServerName: "gbrain"`, `ToolName: "remember"`) with `visibility: world`.
- This ensures Hermes on the VPS and local agents operate with synchronized context.

---

## 🚀 7. Git Status Transparency
- When a build compiles successfully, explicitly state whether changes have been committed and pushed to remote.
- Provide the user with exact terminal instructions (e.g. `git push origin <branch>`) to deploy local changes.
