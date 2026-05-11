# GoalChain — Audit State (Snapshot)

Fecha: **2026-05-11**

Este documento es un **snapshot** del estado actual del smart contract y del diseño MVP (Fixtures Sports Betting). La idea es usarlo como checklist vivo para repasar y cerrar cada punto de seguridad, consistencia matemática y completitud funcional.

---

## Scope del MVP (definido)

- **MVP principal:** Sports Betting de Fixtures (parimutuel pools TeamA/TeamB/Draw).
- **Penalty PvP:** se mantiene en **Opción A** (resolución por oráculo/back-end), pero queda fuera del “Definition of Done” del MVP.
- **Token mint ($GCH):** **NO existe aún** (solo hay ProgramID desplegado). Para MVP en devnet/localnet se puede usar un mint de testing (SPL) temporal.

---

## Hallazgos críticos (bloqueantes para Mainnet / MVP “real money”)

### 1) `claim_bet_payout` no paga (fondos no salen del vault)
- Estado: calcula `user_share`, marca `claimed = true`, pero **no transfiere** desde `fixture_vault` a `user_token_account`.
- Riesgo: sistema no funciona económicamente; se pueden crear estados “claimed” sin pago.
- Acción: implementar CPI `transfer_checked` con signer seeds del `fixture` (PDA authority) y mover:
  - payout al usuario
  - fees a `house/jackpot/treasury` (definir cuentas destino)

### 2) Autoridad de oráculo no está anclada on-chain
- Estado: `UpdateFixtureStatus` y `UpdatePlayerStats` solo requieren `Signer`, no verifican contra una autoridad conocida.
- Riesgo: cualquiera puede finalizar fixtures o setear winner si pasa accounts correctas.
- Acción: crear `GlobalConfig` PDA con `oracle_authority` (y opcional `admin`, `treasury`, etc) y aplicar constraints/verificaciones.

### 3) Matemática insegura / sin `checked_*` en algunos sumatorios
- Estado: `total_pool = fixture.pool_a + fixture.pool_b + fixture.pool_draw;` (suma directa).
- Riesgo: overflow silencioso (en Rust release wrap) → corrupción payout.
- Acción: reemplazar por `checked_add` encadenados y manejar error.

### 4) Fixture vault authority / signer seeds
- Estado: `fixture_vault` se crea con `token::authority = fixture` (bien), pero hay que firmar CPI con seeds de `fixture` al pagar.
- Acción: en `claim_bet_payout` derivar seeds `b"fixture", match_id.as_bytes(), [bump]`.

### 5) Ventana de apuestas (cutoff) y estados
- Estado: se permite `place_bet` mientras fixture no esté `Completed`. No hay regla de cutoff por `start_timestamp`/`Live`.
- Riesgo: apuestas tardías, manipulación por info asimétrica.
- Acción: definir y enforcear política:
  - `Upcoming`: se puede apostar
  - `Live/Completed/Cancelled`: no se puede apostar
  - opcional: `require!(clock.unix_timestamp < fixture.start_timestamp - X)`

---

## Hallazgos importantes (no bloqueantes pero recomendados)

### 6) `UserBet` no impide doble apuesta por usuario vs múltiples tickets
- Estado: `UserBet` seed = `["bet", user, fixture]` → 1 bet max por usuario/fixture.
- Impacto: simplifica UX, pero limita “DCA”/multi-entries.
- Decisión: mantener para MVP o permitir múltiples bets (seed con nonce).

### 7) No hay evento/logs estructurados
- Acción: emitir `emit!` events para:
  - FixtureInitialized
  - BetPlaced
  - FixtureUpdated
  - PayoutClaimed

### 8) Fees hardcodeadas (5/2/3)
- Riesgo: no actualizable; governance difícil.
- Acción: mover fees a `GlobalConfig` (basis points) con límites.

---

## Puntos de explotación / amenazas

- **Oracle compromise:** permite setear ganador y drenar pools. Mitigar con config + (futuro) multisig.
- **Low-liquidity pool manipulation:** un whale puede distorsionar payout esperado.
- **Late betting / sniping:** si se permite apostar durante `Live` o cerca del start.
- **Rug by misconfig treasury:** sin cuentas destino fijas, fees pueden ir a cuentas arbitrarias.

---

## Estado de Wager (Penalty PvP) — fuera del MVP pero con issues

- `resolve_wager` envía a `winner_token` arbitrario (si oráculo firma). Falta validar que `winner_token.owner` == ganador.
- Autoridad oráculo no está anclada (mismo problema de config).

---

## Próximos pasos propuestos (orden)

1) Implementar `GlobalConfig` PDA + `initialize_config`.
2) Endurecer `update_fixture_status` usando config (solo oráculo).
3) Endurecer `initialize_fixture` usando config (solo oráculo/admin).
4) Cerrar `place_bet` (cutoff + solo `Upcoming`).
5) Implementar payout completo en `claim_bet_payout`:
   - transfer a usuario
   - transfer fees (house/jackpot/treasury)
   - matemática checked
6) Actualizar tests TS para:
   - crear mint dev
   - crear fixture
   - place bets
   - completar fixture
   - claim payout y validar balances

---

## Notas

- ProgramID en repo: `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`.
- Falta determinar mint `$GCH` real. Para pruebas: crear SPL mint temporal.
