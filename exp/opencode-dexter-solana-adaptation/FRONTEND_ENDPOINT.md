# Jupiter Quote Endpoint - Frontend Ready

**Fecha:** 2026-05-24
**Estado:** Operativo

## Endpoint creado

**URL:** `POST /api/solana/jupiter/quote`

**Body esperado:**
```json
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": 1000000000,
  "slippageBps": 50
}
```

**Respuesta:**
```json
{
  "success": true,
  "quote": {
    "inputMint": "...",
    "outputMint": "...",
    "inAmount": "...",
    "outAmount": "...",
    "priceImpactPct": "...",
    "routePlan": ["..."]
  },
  "raw": { ... }
}
```

## Uso desde frontend

```ts
const res = await fetch("http://localhost:3001/api/solana/jupiter/quote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    inputMint: "So11111111111111111111111111111111111111112", // SOL
    outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    amount: 1_000_000_000, // 1 SOL
    slippageBps: 50,
  }),
});

const data = await res.json();
console.log(data.quote);
```

## Notas

- Este endpoint está listo para ser consumido desde el frontend de GoalChain.
- Actualmente solo devuelve quotes (no ejecuta swaps).
- Para ejecución real de swaps se necesitaría agregar wallet connection y signing.

## Archivos modificados

- `goalchain_api/src/index.ts` → Agregado endpoint `/api/solana/jupiter/quote`

## Componente React de ejemplo

- `exp/opencode-dexter-solana-adaptation/JupiterQuoteWidget.tsx` → Componente listo para usar en el frontend.
