# 🗺️ GoalChain Repository Map (v2.0 - Infinity Era)

This document serves as the master guide for developers and AI agents. It details the purpose of each vital directory and file within the GoalChain project.

---

## 🧭 Source of Truth Policy

To ensure consistency across the ecosystem, we follow a strictly layered documentation approach:

- **Strategic Brain:** [`/ai_context`](./ai_context) - Contains the master versions of all economic blueprints, technical specifications, and AI skills.
- **Production Frontend:** [`/docs`](./docs) - Live application at [goalchain.fun](https://goalchain.fun).
- **Core Protocol:** [`/goalchain_program`](./goalchain_program) (Smart Contracts), [`/goalchain-sdk`](./goalchain-sdk) (Connectors), [`/goalchain_api`](./goalchain_api) (Backend), [`/goalchain_oracle`](./goalchain_oracle) (Data).

---

## 🚀 Key Directories

### [`/docs`](./docs)
**Status:** Active Production
*   **Purpose:** The main GoalChain web platform.
*   **Core Scripts:** 
    *   `assets/js/live_engine.js`: The real-time visual and economic simulator.
    *   `assets/js/contract_data.js`: Blockchain interaction logic.
*   **Data:** `assets/data/players.json` (528 authenticated player records).

### [`/ai_context`](./ai_context)
**Status:** Strategic Core
*   **MASTER_INDEX.md:** The definitive project guide and version tracker.
*   **TOKENOMICS.md:** The Infinity Engine economic model.
*   **PLAYERS_LIST.md:** The roster and supply registry.
*   **ECONOMIC_BLUEPRINT_V3.md:** The detailed business and staking logic.

---

## ⚙️ Backend & Infrastructure

### [`/goalchain_program`](./goalchain_program)
*   **Tech:** Rust / Anchor.
*   **Role:** Handles NFT minting, betting logic, and the Vault interaction.

### [`/goalchain_oracle`](./goalchain_oracle)
*   **Role:** Synchronizes real-world match data with the on-chain metadata.

### [`/goalchain-sdk`](./goalchain-sdk)
*   **Role:** Provides the IDLs and Typescript interfaces for the frontend and API.

---

## 📂 Root Files (GitHub Presence)
- [README.md](./README.md): High-level project manifest.
- [TOKENOMICS.md](./TOKENOMICS.md): Simplified economic overview.
- [REPO_MAP.md](./REPO_MAP.md): This architectural guide.

---
**Last Updated:** May 16, 2026. **Era:** Infinity Engine v3.0. 🏟️✨🚀
