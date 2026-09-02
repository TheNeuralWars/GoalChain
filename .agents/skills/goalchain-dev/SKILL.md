---
name: goalchain-dev
description: >-
  Comprehensive engineering runbook and autonomous workflow guide for developing,
  testing, and verifying GoalWorld & GoalChain components (Solana smart contracts,
  @goalchain/sdk, goalchain_webapp, oracles, and static portals).
---

# ⚡ GoalWorld & GoalChain Autonomous Engineering Runbook

This skill provides step-by-step procedures and constraints for developing, refactoring, and verifying code across the GoalChain and GoalWorld repositories.

---

## 🏛️ 1. Architecture & Non-Negotiable Invariants

All agents must uphold these canonical invariants:

1. **Solana Program ID**: `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` (never invent or alter).
2. **Canonical Economic Configuration**: `docs/ECONOMIC_CANONICAL_CONFIG.json` is the sole source of truth for tokenomics, staking rules, and fees.
3. **Single Source of Truth for Anchor IDL**: `goalchain-sdk/src/goalchain_program.json`.
4. **No Secrets in Repos**: Never read, print, or commit `.env`, `fcc.secrets.env`, or private keypairs.
5. **Memory Synchronization**: When completing significant architectural changes, store durable facts in `gbrain remember` with `visibility: world` so Hermes (VPS) and Antigravity stay aligned.

---

## 📂 2. Core Package Responsibilities

| Package | Path | Tech Stack | Mandatory Verification |
| :--- | :--- | :--- | :--- |
| **Play Webapp** | `goalchain_webapp/` | React 18, Vite, Tailwind, Solana Wallet Adapter | `npm run build` (0 TS errors) |
| **Solana SDK** | `goalchain-sdk/` | TypeScript, `@coral-xyz/anchor`, `@solana/web3.js` | `npm run build` |
| **Static Portals** | `docs/` | Vanilla HTML5/CSS3/ES6 | Namespace safety audit |
| **Oracle & Scraper** | `goalchain_oracle/` | Node/Bun, Jito MEV | Compile & test feeds |
| **Smart Contracts** | `goalchain_program/` | Solana Anchor, Rust | `anchor test` / syntax check |

---

## 🧪 3. Closed-Loop Autonomous Verification Runbook

Before marking any task complete, execute the applicable verification cycle:

### Step 1: SDK Build (if touched `goalchain-sdk` or IDL)
```bash
cd goalchain-sdk && npm run build
```
Verify exit code 0 and clean `dist/` compilation.

### Step 2: Webapp Build (Mandatory for frontend changes)
```bash
cd goalchain_webapp && npm run build
```
Requirements:
- Zero TypeScript (`tsc`) compilation errors.
- Clean Vite bundling into `dist/`.
- Inspect chunk sizes. Avoid conflicting static + dynamic imports of the same component.

### Step 3: Namespace Safety Check (for `docs/` or static JS)
Static scripts loaded sequentially in `docs/index.html` or `docs/goalworld.html` must **never** declare naked top-level `const` or `let`. Always wrap in defensive window scopes:
```javascript
var GW = window.GW || {};
var GC_PROTO = window.GC_PROTO || {};
```

---

## 🔧 4. Autonomous Self-Correction Protocol

When a build or test fails during autonomous execution, follow this strict 4-step loop:

1. **Diagnose**: Inspect the exact line number, column, and error code (e.g., TS2339, TS2322) from the compiler log.
2. **Formulate Hypothesis**: Determine if the issue is a missing type definition, an incorrect import path, or an interface mismatch between SDK and UI.
3. **Targeted Edit**: Apply the minimal surgical change using `replace_file_content`. Avoid blanket file rewrites.
4. **Re-Verify**: Re-run the specific build command (`npm run build`). Repeat up to 3 times. If unresolved after 3 attempts, formulate a clear report with the error trace for the user.

---

## 📦 5. Subagent Delegation Guidelines

For heavy or long-running tasks, utilize specialized subagents to conserve main context:
- **`research`**: Read-only codebase exploration, searching documentation, or surveying files.
- **`self` (QA / Build Worker)**: Running intensive tests or isolated compile audits without polluting the active conversation history.
