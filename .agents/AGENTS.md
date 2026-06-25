# GoalChain Workspace Agent Guidelines

These rules apply specifically to all workspaces in this repository.

## 📂 1. Directory Structure & Ignored Folders
- Always prioritize the active core directories: `goalchain_webapp/`, `docs/`, `goalchain_program/`, `goalchain_oracle/`, `goalchain-sdk/`, `goalchain_api/`, `agentic-inbox/`, `hermes/`, `scripts/`.
- Do **not** read or modify files in legacy directories: `_archive/`, `exp/`, `Talks/`, `hermes_tests/`, `venv_parser/`.
- Refer to [PROJECT_INDEX.md](file:///PROJECT_INDEX.md) for details on current directories.

## 📏 2. Namespace Safety in Non-Modular Scripts (docs/)
- When editing static web assets (inside `docs/assets/js/` or other script files loaded sequentially in `index.html`), **never** declare variables, constants, or functions in the global scope using `const` or `let` if there is any chance they are already declared.
- Declaring `const MY_VAR` in multiple scripts loaded in the same window throws a fatal `SyntaxError` which completely breaks execution.
- **Always** use defensive window properties or re-declarable variables:
  ```javascript
  var MY_VAR = window.MY_VAR || { ... };
  ```

## 🧪 3. Multi-Tiered Verification Policy
Before marking any frontend task as complete, you MUST:
1. **Compilation Check**: Run `npm run build` in the respective sub-project folder (e.g. `goalchain_webapp/`) to ensure no TypeScript compilation or bundling errors exist.
2. **Console Audit**: Use the browser subagent to navigate to the modified page (or open it locally) and inspect the browser console log. If any Red/Error line or SyntaxError appears, investigate and resolve it immediately.

## 🚀 4. Git Status Transparency
- When a build compiles successfully, explicitly state whether changes have been committed and pushed to remote.
- Provide the user with exact terminal instructions (e.g. `git push origin main`) to deploy local changes.
