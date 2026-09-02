# 🏛️ Invariantes de Arquitectura de GoalChain & GoalWorld

Este documento establece las reglas técnicas no negociables del ecosistema Solana, Anchor y SDK para todos los agentes de desarrollo.

---

## 🔒 1. Invariantes del Smart Contract (Anchor on Solana)

* **Program ID Oficial:** `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`
* **IDL Canónico:** `goalchain-sdk/src/goalchain_program.json`
* **Semillas Canónicas de PDAs:**
  * Global Config: `[b"global_config"]`
  * Vault State: `[b"vault", vault_id.to_le_bytes()]`
  * User Position: `[b"user_position", user_pubkey.as_ref(), vault_id.to_le_bytes()]`
  * Match Prediction: `[b"match_prediction", match_id.to_le_bytes()]`

---

## 🪙 2. Invariantes Económicos (docs/ECONOMIC_CANONICAL_CONFIG.json)

* **Suministro Total:** 1.000.000.000 GOAL
* **Quemas en Staking (Deflación activa):**
  * Tasa de quema en penalizaciones: 2.5%
  * Reparto de rendimiento en Swarm Vaults: 85% para participantes, 10% tesorería, 5% quema de tokens permanente.
* **Metaplex Core IP:**
  * Regalías secundarias de la saga literaria: 8.5% dirigidas a la recompra y quema de GOAL en el pool de liquidez.

---

## 📡 3. Oráculos y Fixtures Deportivos

* **Red Principal de Oráculos:** `goalchain_oracle`
* **Fuentes de Datos:**
  * API-Football / SportsFi feeds.
  * Consenso multi-agente en el cálculo de probabilidades antes de sellar el resultado on-chain.
