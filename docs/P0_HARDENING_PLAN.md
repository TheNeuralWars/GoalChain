# Goal Chain — Plan de hardening P0 (PRs)

**Objetivo:** cerrar vulnerabilidades bloqueantes para devnet con dinero real / mainnet, con PRs pequeños y revisables.

**Program ID:** `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`

---

## Estado de PRs

| PR | Título | Estado | Archivos principales |
|----|--------|--------|----------------------|
| **PR-1** | Oracle yield auth + `resolve_wager` winner validation | ✅ Implementado en rama actual | `lib.rs`, `goalchain_program.ts` |
| **PR-2** | `ManagerState` por usuario (no global admin) | ✅ Implementado en rama actual | `lib.rs`, `goalchain_program.ts` |
| **PR-3** | Vaults separados (stake vs salary emission) | ✅ Implementado en rama actual | `lib.rs`, `goalchain_program.ts` |
| **PR-4** | Jito presale: quitar bypass + validar CPI accounts | ✅ Implementado en rama actual | `lib.rs`, `goalchain_program.ts` |
| **PR-5** | Parimutuel: refunds `Cancelled` + invariante vault | ✅ Implementado en rama actual | `lib.rs`, `goalchain_program.ts` |
| **PR-6** | Sync IDL → SDK → frontend | ✅ Implementado en rama actual | `scripts/sync-idl.sh`, `ci.yml`, `contract_data.js`, `solana_connector.js` |
| **PR-7** | Actualizar docs de auditoría obsoletos | ✅ Implementado en rama actual | `AUDIT_STATE_2026-05-11.md`, `SECURITY_AUDIT.md` |

---

## PR-1 — Oracle yield + resolve wager (DETALLE)

### Cambios

1. **`OracleUpdatePlayerYield`**
   - Añadido `config` PDA con `constraint = config.oracle_authority == oracle_authority.key()`.
   - Sustituidos `.unwrap()` por `ok_or(MathOverflow)` en acciones de gol/asistencia.

2. **`resolve_wager`**
   - `winner_is_a` ahora determina el ganador esperado (`player_a` vs `player_b`).
   - `winner_token.owner` debe coincidir con ese pubkey.
   - Validación de `winner_token.mint == token_mint`.
   - Nuevo error: `InvalidWagerWinner`.

### Tests añadidos

- Hostile: `resolveWager(true)` con `winnerToken = playerBAta` → `InvalidWagerWinner`.
- Hostile: `oracleUpdatePlayerYield` con wallet no oracle → `UnauthorizedOracle`.

### Checklist antes de merge

```bash
cd goalchain_program
anchor build
anchor test
```

### Post-merge

```bash
# Regenerar tipos (PR-6 puede hacerlo en bloque)
anchor idl build -o ../goalchain-sdk/src/goalchain_program.json
```

---

## PR-2 — ManagerState por usuario

### Problema

PDA actual: `["manager", config.admin]` → un solo multiplicador global.

### Estado

✅ Implementado:

- `initialize_manager_state`: signer = `user` y PDA `["manager", user]`.
- `claim_daily_salary`: `manager_state` validado con seeds del `user` que reclama.

### Diseño aplicado

```rust
seeds = [b"manager", user.key().as_ref()]
```

- `initialize_manager_state`: signer = `user`, solo puede init su PDA.
- `claim_daily_salary`: `manager_state` del `user` que reclama.
- Migración: nueva instrucción opcional `migrate_manager_state` o redeploy en devnet.

### Tests

- User A con multiplier 10_000, User B con 15_000 → payouts distintos.
- User B no puede usar `manager_state` de A.

---

## PR-3 — Vaults separados

### Problema

`stake` y `claim_daily_salary` comparten `vault_token_account` firmado por `config`.

### Estado

✅ Implementado:

- `stake`/`unstake` operan contra PDA determinista `stake_vault` (`["stake_vault", token_mint]`) con autoridad `config`.
- `claim_daily_salary` usa el ATA del `config` como salary vault (`associated_token::authority = config`), separado del `stake_vault`.

### Diseño aplicado

| Cuenta | Seeds | Uso |
|--------|-------|-----|
| `stake_vault` | `["stake_vault", token_mint]` | Depósitos de staking |
| `salary_vault` | `ATA(config, token_mint)` | Emisiones de sueldo / architect tax |

- `GlobalConfig` guarda ambas ATAs o se derivan en cada ix.
- `unstake` solo desde `stake_vault`.
- Admin instrucción `fund_salary_vault` (opcional) con límites.

---

## PR-4 — Presale Jito seguro

- Eliminar rama `system_program::ID` en builds `--features mainnet` o por `cfg!(feature = "localnet")`.
- Validar `stake_pool_program` contra ID conocido de SPL Stake Pool / Jito.
- Añadir `max_sol_per_user`, `presale_active` flag en config.
- Tests: CPI mock en localnet sin bypass de producción.

---

## PR-5 — Parimutuel completo

- `refund_bet` si `fixture.status == Cancelled`.
- `sweep_fixture_dust` (admin) para lamports residuales tras cierre.
- Assert: `vault_balance >= sum(pending_claims)` antes de cada claim (o tracking `total_claimed`).

---

## PR-6 — Pipeline IDL / frontend

1. CI job: `anchor build && cp idl → goalchain-sdk`.
2. Reemplazar IDL stub en `docs/assets/js/contract_data.js` y `solana_connector.js` por import del SDK o JSON generado.
3. Eliminar `Math.random()` en `claimYield` / métricas live (leer RPC o ocultar UI).

---

## PR-7 — Documentación

- Marcar resueltos en `AUDIT_STATE_2026-05-11.md` los ítems 1–5 ya corregidos.
- Añadir sección PR-1 con fecha y commit.
- Bajar claim de `SECURITY_AUDIT.md` “🟢 PROTEGIDO” a “en hardening P0”.

---

## Orden recomendado de merge

```
PR-1 → PR-2 → PR-3 → PR-4 → PR-5 → PR-6 → PR-7
```

PR-1 y PR-6 pueden ir en paralelo si dos devs; PR-3 depende de decisión de migración de vault.

---

## Criterios de “P0 done”

- [x] Ningún test hostile falla en `goalchain_program.ts`
- [x] Auditoría interna actualizada
- [x] IDL en SDK coincide con `lib.rs`
- [x] Frontend no simula métricas críticas con `Math.random()` para oracle/claim
- [ ] Checklist de deploy devnet firmado por 2 reviewers

*Última actualización: 2026-05-21 — PR-1 a PR-7 implementados en rama actual (pendiente solo governance/review operativo de deploy).*
