# 🔬 GoalChain Technical Roadmap: The Vault Integration

## 1. Arquitectura de Conexión
Para implementar la filosofía de "Zero Value Loss", el tesoro de GoalChain debe interactuar con protocolos de **Liquid Staking (LST)**.

### A. Protocolos Seleccionados:
1.  **Jito (JitoSOL)**: Para capturar no solo el staking yield, sino también el MEV (Maximum Extractable Value) generado en la red. Es el más eficiente en Solana.
2.  **Marinade (mSOL)**: Para diversificación y estabilidad de delegación automática.

---

## 2. Flujo del Smart Contract (Rust/Anchor)
El programa de Solana de GoalChain ejecutará las siguientes instrucciones:

1.  **Deposit**: Al recibir SOL de una venta de NFT, el contrato llama a la API de Jito/Marinade para mintear LSTs.
2.  **Hold**: Los LSTs se mantienen en una PDA (Program Derived Address) bajo el control del protocolo GoalChain.
3.  **Harvest**: Semanalmente, un "Crank" (script automatizado) calcula el exceso de valor (el yield) por encima del principal depositado.
4.  **Buyback**: Ese exceso se envía a un DEX (ej: Jupiter) para comprar $GCH.
5.  **Burn**: Los $GCH comprados se envían a la dirección `11111111111111111111111111111111` (Burn address).

---

## 3. Oráculo de Precios (Pyth Network)
Utilizaremos **Pyth** para obtener el precio en tiempo real de:
*   SOL/USD
*   $GCH/SOL (para calcular el impacto de la quema).
*   LST/SOL (para asegurar que el cambio JitoSOL/SOL sea correcto).

---

## 4. Automatización (Helius o Clockwork)
Para que la quema sea perpetua y no requiera intervención manual:
*   Usaremos **Webhooks de Helius** para detectar entradas de capital en The Vault.
*   Usaremos un sistema de **Cranks** (tareas programadas) para ejecutar la cosecha de yield y la quema cada domingo a las 00:00 UTC.

---
**Informe preparado para NicoPez. GoalChain: La Bóveda está lista.**
