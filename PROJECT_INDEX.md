# 🌐 GoalWorld & GoalChain Architecture Index

**Master Source of Truth for all Agents & Developers (Hermes, Antigravity, OpenCode, Claude Code).**  
Read this index before initiating modifications.

---

## 🏛️ 1. Domain & Ecosystem Architecture

GoalWorld is the sovereign parent corporation and creative multiverse of **Nico Pez (@nicopez)**. The architecture is cleanly divided into two complementary domains:

| Domain | Role & Positioning | Target Audience | Primary Assets |
| :--- | :--- | :--- | :--- |
| **`goalworld.fun`** | **Consumer & Multiverse Hub (B2C)**: Sagas, Publisher SaaS (KDP + Solana IP), Neural Asset Forge, and Play dApp. | Readers, Authors, Gamers, Web3 Community | `docs/goalworld.html`, `play.goalworld.fun`, `goalworld_webapp/` |
| **`goalchain.fun`** | **Infrastructure & Developer Protocol (B2B)**: Verifiable Sports Oracles, Anchor Smart Contracts, and TypeScript SDK. | Developers, Solana Builders, Sports Data Users | `docs/protocol.html`, `goalchain-sdk/`, `goalchain_oracle/`, `goalchain_program/` |

---

## 📂 2. Active Core Directories

### 1. [goalchain_webapp](file:///c:/Users/NicoPez/goalchain/goalchain_webapp)
- **Role**: React 18 & Vite play portal (`play.goalworld.fun` / `play.goalchain.fun`).
- **Tech Stack**: React 18, TypeScript, Solana Wallet Adapter, Tailwind.
- **Verification**: Must compile cleanly via `npm run build` with 0 errors before completing any task.

### 2. [docs](file:///c:/Users/NicoPez/goalchain/docs)
- **Role**: Static portals & documentation (`goalworld.fun`, `goalworld.html`, `protocol.html`, `index.html`).
- **Tech Stack**: Vanilla HTML5, CSS3 glassmorphism, ES5/ES6 vanilla JS.
- **Rule 2 (Namespace Safety)**: Always use defensive window scoping:
  ```javascript
  var GW = window.GW || {};
  var GC_PROTO = window.GC_PROTO || {};
  ```

### 3. [goalchain-sdk](file:///c:/Users/NicoPez/goalchain/goalchain-sdk)
- **Role**: Shared TypeScript SDK for Solana Anchor connection, PDAs, and transaction serialization.
- **Build**: `npm run build`.

### 4. [goalchain_oracle](file:///c:/Users/NicoPez/goalchain/goalchain_oracle)
- **Role**: Sports data scraper, Jito MEV protection, and match settlement oracle.
- **Tech Stack**: TypeScript, Node/Bun.

### 5. [goalchain_program](file:///c:/Users/NicoPez/goalchain/goalchain_program)
- **Role**: Solana Smart Contracts (Anchor framework, Rust).
- **Program ID**: `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`.

### 6. [goalchain_api](file:///c:/Users/NicoPez/goalchain/goalchain_api)
- **Role**: Off-chain server API endpoints and economy metrics (Port 3001).

### 7. [ai_context](file:///c:/Users/NicoPez/goalchain/ai_context)
- **Role**: Master user context (`user_profile.md`), roadmap (`GOALWORLD_MASTER_ROADMAP.md`), and guidelines.

### 8. [hermes](file:///c:/Users/NicoPez/goalchain/hermes) & [ops/hermes](file:///c:/Users/NicoPez/goalchain/ops/hermes)
- **Role**: 24/7 Autonomous agent system (Hermes on VPS, Honcho memory, gBrain).

---

## 🚫 3. Purged Legacy Folders (Do Not Reference or Create)
- `_archive/`, `exp/`, `Talks/`, `hermes_tests/`, `venv_parser/`.
- Binary installers (`*.exe`, `*.msi`, `*.bat`) in root.

---

## 📏 4. Mandatory Agent Verification Protocol
1. **Compilation Check**: Run `npm run build` in `goalchain_webapp/` to ensure 0 compilation errors.
2. **Namespace Check**: Never declare global unprotected `const` or `let` in `docs/assets/js/` or HTML `<script>` tags.
3. **Memory Sync**: Persist durable facts to `gbrain remember` with `visibility: world` so all agents share the same state.
4. **Git Transparency**: Commit changes with clear conventional commits and report push status.
