# GoalChain Project Directory & Architecture Index

This index is the single source of truth for the codebase structure, compilation instructions, and coding standards. All agents and developers MUST read this index before initiating modifications.

---

## 📂 Active Core Directories

### 1. [goalchain_webapp](file:///c:/Users/NicoPez/goalchain/goalchain_webapp)
- **Role**: React & Vite play portal (`play.goalchain.fun`).
- **Tech Stack**: React 18, TypeScript, Solana Wallet Adapter, Tailwind (Vite plugin).
- **Scope**: Fully isolated ES6 modules. No global window variables unless explicitly defined defensive properties.
- **Build**: Run `npm run build` to compile production assets to `dist/`.

### 2. [docs](file:///c:/Users/NicoPez/goalchain/docs)
- **Role**: Static landing page & documentation (`goalchain.fun`).
- **Tech Stack**: Vanilla HTML5, CSS3, ES5/ES6 vanilla JS.
- **Scope**: **Shared Global Window Scope**. Since files are loaded via `<script>` tags in `index.html`, variables, constants, and functions are declared globally.
- **Strict Rule**: Never declare global `const` or `let` variables with overlapping names (e.g. `BG_IMAGE_MAP`, `FLAG_MAP`). Use defensive window mapping or encapsulating modules:
  ```javascript
  var MY_GLOBAL = window.MY_GLOBAL || { ... };
  ```

### 3. [goalchain_program](file:///c:/Users/NicoPez/goalchain/goalchain_program)
- **Role**: Solana Smart Contract (on-chain program).
- **Tech Stack**: Rust, Anchor Framework.
- **Build**: Run `anchor build` to compile.

### 4. [goalchain_oracle](file:///c:/Users/NicoPez/goalchain/goalchain_oracle)
- **Role**: Sports scraper and on-chain state update oracle.
- **Tech Stack**: TypeScript, Node/Bun.
- **Build**: Run `bun run build` or `npm run build`.

### 5. [goalchain-sdk](file:///c:/Users/NicoPez/goalchain/goalchain-sdk)
- **Role**: Shared connection and transaction serialization library.
- **Tech Stack**: TypeScript.

### 6. [goalchain_api](file:///c:/Users/NicoPez/goalchain/goalchain_api)
- **Role**: Off-chain server API endpoints.
- **Tech Stack**: Node/Bun, Express.

### 7. [agentic-inbox](file:///c:/Users/NicoPez/goalchain/agentic-inbox)
- **Role**: Cloudflare Worker notifications application.
- **Tech Stack**: Cloudflare Workers, React Router.

### 8. [hermes](file:///c:/Users/NicoPez/goalchain/hermes)
- **Role**: Discord community bot and agentic handlers.

### 9. [scripts](file:///c:/Users/NicoPez/goalchain/scripts)
- **Role**: Production automation scripts, image processing, and highlights generation.

---

## 🚫 Purged Legacy Folders (Do Not Reference/Create)
- `_archive/` (Legacy archive)
- `exp/` (Experimental drafts)
- `Talks/` (Historical transcripts)
- `hermes_tests/` (Ad-hoc temp tests)
- `venv_parser/` (Local parsing environments)
- Binary installers (`*.exe`, `*.msi`, `*.bat`) in root.

---

## 📏 Mandatory Coding & Verification Guidelines

1. **Global Variable Collisions**: When writing code in `docs/assets/js/`, you MUST verify that any dictionary or map is declared defensively with `var` or `window.` to prevent duplicate declaration crashes (`SyntaxError`).
2. **Pre-commit Build Validation**: Any change to `goalchain_webapp` MUST be validated using `npm run build` in its directory to catch compilation breaks.
3. **Landing Page Sandbox Check**: Any change to `docs/` MUST be verified using a browser agent to inspect console logs. If any SyntaxError appears, the task has FAILED.
4. **Git Sync Visibility**: Whenever a change is completed locally, clearly guide the user to run `git push origin main` to sync and trigger the live Vercel/GitHub Pages pipelines.
