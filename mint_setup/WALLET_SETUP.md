# Mint wallet setup — B-002

Los archivos en `mint_setup/` usan **direcciones placeholder** (`Fndrxxx...`) para las wallets que reciben royalties del mint cNFT y pagos SOL del candy guard.

## ¿Tenés que hacer algo con una wallet?

**Sí, pero solo decidir y pegar direcciones públicas** — no hace falta conectar Phantom en el repo ni commitear claves privadas.

Necesitás **3 wallets de Solana** (pueden ser 3 cuentas Phantom distintas o multisigs):

| Rol | Share | Para qué sirve |
|-----|-------|----------------|
| **Founder** | 1% | Royalty secundaria del creador / founder |
| **Builder Fund** | 10% | APIs, infra, marketing, contribuidores (alineado con BuilderFund on-chain) |
| **Community Treasury** | 89% | Tesorería comunitaria + destino del `solPayment` del mint guard |

## Procedimiento exacto (devnet primero)

### 1. Crear o elegir 3 direcciones

Opción A — **Phantom (rápido para devnet):**

1. Abrí Phantom → Settings → activá **Devnet** (Settings → Developer Settings → Testnet mode / Devnet).
2. Anotá tu dirección principal → esa puede ser **Founder** (1%).
3. Creá 2 cuentas adicionales en Phantom (Add / Create account) → una para **Builder Fund**, otra para **Community Treasury**.
4. Copiá las 3 direcciones públicas (formato base58, ~44 caracteres). Ejemplo: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

Opción B — **Multisig (recomendado para mainnet):**

- Usá Squads o similar para Treasury y Builder Fund.
- Founder puede ser cold wallet personal.

### 2. Enviame (o pegá en issue) las 3 pubkeys

Formato:

```
FOUNDER=<pubkey>
BUILDER_FUND=<pubkey>
COMMUNITY_TREASURY=<pubkey>
ENV=devnet
```

Con eso el agente regenera:

- `mint_setup/config.json`
- Metadatos en `mint_setup/assets/*.json` (creators block)
- Script de validación opcional

### 3. Qué NO tenés que hacer

- No subir seed phrase ni JSON de keypair al repo.
- No firmar transacciones de mint todavía — solo reemplazar placeholders en config.

### Devnet vs mainnet

Las **mismas 3 pubkeys** en `mint_setup/wallets.json` aplican a devnet y mainnet (campo `environment: devnet,mainnet`). El deploy del mint es **por cluster**: devnet primero para probar, mainnet cuando estés listo con candy guard y RPC de producción.

### Regenerar tras cambio de wallets

```bash
# 1) Editar mint_setup/wallets.json
# 2) Aplicar a config + assets
python3 mint_setup/apply_wallets.py
# 3) Verificar
grep -r "xxxx" mint_setup/config.json mint_setup/assets/ | head
```

## Wallets activas (2026-05-24)

Ver `mint_setup/wallets.json` — mismas direcciones para devnet y mainnet.


El **Builder Fund on-chain** (PDA en el programa) es distinto del campo **creator share** del mint Metaplex, pero en producción conviene que la pubkey `BldrFund...` del mint apunte a la misma wallet (o multisig) que controla el flota operativo del Builder Fund documentado en `docs/CURRENT_ECONOMIC_PARAMETERS.md`.
