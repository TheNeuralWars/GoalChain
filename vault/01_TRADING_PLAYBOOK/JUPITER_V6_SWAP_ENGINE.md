# 🚀 Jupiter V6 API & Swap Execution Engine

Documento canónico para que `@trader` y los agentes autónomos de GoalChain ejecuten swaps de alta velocidad en la mainnet de Solana vía Jupiter Aggregator V6.

---

## 🔌 1. Endpoints Oficiales (Jupiter V6)

* **Quote Endpoint:** `GET https://quote-api.jup.ag/v6/quote`
* **Swap Transaction Endpoint:** `POST https://quote-api.jup.ag/v6/swap`
* **Indexed Route Map:** `GET https://quote-api.jup.ag/v6/indexed-route-map`
* **Price API V2:** `https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112`

---

## ⚡ 2. Flujo de Ejecución en 3 Pasos

```
[ 1. Cotización / Quote ] ────► [ 2. Armado de TX / Swap ] ────► [ 3. Firma y Envío RPC / Jito ]
   inputMint / outputMint         userPublicKey                     deserialize VersionedTransaction
   amount (lamports)              wrapAndUnwrapSol                  sign([keypair])
   slippageBps (50 = 0.5%)        prioritizationFeeLamports         sendRawTransaction
```

### Paso 1: Obtención de Cotización (Quote)
```bash
curl -s "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=50000000&slippageBps=50"
```
* **Parámetros Críticos:**
  * `slippageBps`: 50 (representa 0.5% máximo). En el piloto canary de $50 nunca sobrepasar 50 bps.
  * `onlyDirectRoutes`: `false` (permite multi-hop para capturar mejor liquidez en Raydium, Orca y Meteora).

### Paso 2: Generación de la Transacción Serializada
```json
POST https://quote-api.jup.ag/v6/swap
Content-Type: application/json

{
  "quoteResponse": { ... },
  "userPublicKey": "7zNMCLvTdW1YQcVP1yqD6Ct4iyaGaTdztNrZWaYGqopm",
  "wrapAndUnwrapSol": true,
  "dynamicComputeUnitLimit": true,
  "prioritizationFeeLamports": "auto"
}
```

### Paso 3: Firma y Envío con VersionedTransaction (TypeScript)
```typescript
import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';

const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
transaction.sign([keypair]);

const rawTransaction = transaction.serialize();
const txid = await connection.sendRawTransaction(rawTransaction, {
  skipPreflight: true,
  maxRetries: 3
});
```

---

## 🛡️ 3. Reglas de Fallback y Seguridad
* **Max Retries:** 3 intentos con backoff exponencial. Si no entra en 2 slots, invalidar quote para evitar slippage diferido.
* **RPC Endpoint:** Usar endpoint privado de alto rendimiento (Helius / QuickNode / Triton) para evitar bloqueos por rate limit.
