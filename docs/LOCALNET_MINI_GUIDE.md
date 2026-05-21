# GoalChain — Mini guía (Localnet + Tests)

Fecha: **2026-05-12**

Esta guía es operativa: qué correr y en qué orden para trabajar con el MVP (Fixtures Betting) en **localnet** sin confusiones.

---

## TL;DR (lo mínimo)

1) Levantá el validator local (idealmente reseteando ledger).
2) Corré los tests contra localnet (saltando el validator interno de Anchor).

---

## 1) Levantar localnet: `solana-test-validator`

En este repo ya está preparada la task de VS Code:

- **Task:** `solana-test-validator (local)`
- Hace:
  - mata cualquier validator previo
  - borra el ledger en `/tmp/solana-test-ledger`
  - levanta `solana-test-validator` en RPC **8899**

### Cuándo conviene resetear (recomendado)

Reseteá el ledger si:
- repetís tests y ves errores tipo `Allocate: account already in use`.
- te aparece `Unauthorized` al intentar `update_config`.
- cualquier estado viejo “ensucia” los asserts.

### Por qué pasa esto (importante)

`GlobalConfig` es un **singleton PDA**:
- seeds: `seeds = [b"config"]`
- `update_config` exige: `config.admin == admin.key()`

Entonces:
- si dejás un ledger persistente con un `config` viejo
- y en una corrida nueva tu `admin` (wallet) no coincide

vas a ver `Unauthorized`. Eso **no es un bug**: es la seguridad funcionando.

---

## 2) Correr tests contra localnet (Anchor)

Una vez que el validator está levantado, corré los tests desde `goalchain_program/`:

- `anchor test --skip-local-validator --provider.cluster localnet`

### Qué significa `--skip-local-validator`

Significa: **Anchor NO levanta un validator** por su cuenta.
- Vos te ocupás de tenerlo corriendo.
- Si no está corriendo, el comando falla o no conecta.

---

## 3) Solo compilar (sin localnet)

Si solo editaste Rust/Anchor y querés validar rápido sin tocar estado on-chain:

- `anchor build`

---

## Notas

- El flujo más simple y reproducible para dev es:
  - **reset ledger → correr tests**.
