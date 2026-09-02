# 🛡️ Jito Bundles & Anti-MEV Protection

Estrategia de ejecución protegida contra bots sándwich y congestión en Solana mainnet para los agentes de GoalChain.

---

## 🏛️ 1. ¿Qué es Jito y por qué lo usamos?

En la mempool pública de Solana, las transacciones pueden ser interceptadas por bots de arbitraje MEV (Maximal Extractable Value) que aplican ataques de sándwich (comprar justo antes y vender justo después de tu orden, degradando tu precio de ejecución).

**Jito Block Engine** permite agrupar transacciones en **Bundles atómicos (hasta 5 transacciones)** que viajan directamente a los validadores líderes sin pasar por la mempool pública:
* Si una transacción del bundle falla, **todo el bundle se descarta** (cero transacciones a medio ejecutar).
* Cero riesgo de MEV sándwich.
* Inclusión garantizada en el siguiente bloque pagando una propina (*Tip*) directa al validador.

---

## 📍 2. Endpoints de Block Engine

* **Mainnet Block Engine:** `https://mainnet.block-engine.jito.wtf/api/v1/bundles`
* **Consulta de Cuentas de Propina:** `https://mainnet.block-engine.jito.wtf/api/v1/getTipAccounts`
* **Piso de Propina en Vivo:** `https://bundles.jito.wtf/api/v1/bundles/tip_floor`

---

## 💸 3. Protocolo de Tipping Dinámico

Para que el validador procese el bundle, la última instrucción del paquete debe transferir SOL a una de las 8 cuentas oficiales de Jito:

```typescript
import { SystemProgram, PublicKey } from '@solana/web3.js';

// 1. Obtener una cuenta de propina válida
const JITO_TIP_ACCOUNTS = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT"
];

// 2. Instrucción de propina (ejemplo: 50.000 a 100.000 lamports = $0.007 a $0.015 USD)
const tipInstruction = SystemProgram.transfer({
  fromPubkey: keypair.publicKey,
  toPubkey: new PublicKey(JITO_TIP_ACCOUNTS[0]),
  lamports: 50000 // 0.00005 SOL
});
```

---

## 📊 4. Matriz de Decisión para `@trader`

| Condición de Red | Método de Envío | Costo Estimado | Nivel de Riesgo |
| :--- | :--- | :--- | :--- |
| **Volatilidad Baja (Normal)** | RPC Estándar + Dynamic CU | ~0.000005 SOL | Bajo (Slippage controlado) |
| **Pico de Volatilidad (Breakout)** | **Jito Bundle con Tip Floor** | ~0.00005 SOL | **0% MEV / Ejecución Atómica** |
| **Congestión Extrema** | Espera o Blackout (No-Trade) | 0 SOL | Evita comisiones derrochadas |
