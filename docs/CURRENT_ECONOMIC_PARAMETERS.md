# CURRENT_ECONOMIC_PARAMETERS

Estado auditado de parámetros económicos y rutas de captura detectadas.

## Canonical config version

- `config_version`: `v1.0.0-p0`
- Source of truth: `docs/ECONOMIC_CANONICAL_CONFIG.json`

## On-chain (`goalchain_program/programs/goalchain_program/src/lib.rs`)

- `MAX_FEE_BPS = 100` (1% cap).
- `ARCHITECT_TAX_BPS = 100` (1% salario).
- `POTION_BURN_LAMPORTS = 100 * 1_000_000`.
- `DEFAULT_BASE_YIELD_LAMPORTS = 100 * 1_000_000`.
- `base_yield_for_rarity_tier`:
  - rare: 50
  - epic: 250
  - legendary: 1000
  - mythic: 5000

## Configuración de protocolo

- `GlobalConfig.treasury_token_account`: destino de fees.
- `GlobalConfig.fee_bps`: configurable por admin, ahora limitado a 1%.
- `ClaimDailySalary.architect_pool_account`: restringido a `config.treasury_token_account`.

## Oracle / operación (`goalchain_oracle`)

- `OracleService.syncOracleAuthority` usa `fee_bps = 100` por defecto.
- `initialize_mainnet.ts` usa `FEE_BPS` default `100`.

## Mint y royalties (`mint_setup`)

- `sellerFeeBasisPoints = 100` (1% royalties secundarios).
- `creators` distribuidos:
  - Founder: 1%
  - Builder Fund: 10% (incluye financiación de APIs/modelos/infra y marketing)
  - Community Treasury: 89%
- `solPayment.destination` movido a treasury comunitaria.

## Frontend / simulación

- `docs/assets/js/colab_app.js`: equity simulado actualizado a 1/10/89.

## Pendientes para cierre total de Fase 1

1. Validar ownership real de wallets en entornos activos (devnet/mainnet).
2. Implementar `BuilderFund` on-chain explícito (PDA dedicada, no solo treasury).
3. Enlazar gastos de APIs/modelos/marketing al sub-ledger del Builder Fund (10%).
