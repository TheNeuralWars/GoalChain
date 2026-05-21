# GoalChain — Audit State (Snapshot)

Fecha: **2026-05-11**

Este documento es un **snapshot** del estado actual del smart contract y del diseño MVP (Fixtures Sports Betting). La idea es usarlo como checklist vivo para repasar y cerrar cada punto de seguridad, consistencia matemática y completitud funcional.

---

## Scope del MVP (definido)

- **MVP principal:** Sports Betting de Fixtures (parimutuel pools TeamA/TeamB/Draw).
- **Penalty PvP:** se mantiene en **Opción A** (resolución por oráculo/back-end), pero queda fuera del “Definition of Done” del MVP.
- **Token mint ($GCH):** **NO existe aún** (solo hay ProgramID desplegado). Para MVP en devnet/localnet se puede usar un mint de testing (SPL) temporal.

---

## Decisiones de reglas (MVP)

### Cutoff de apuestas (anti-bots / anti-sniping)

- Se implementa política **B**:
  1) Solo se aceptan bets si `fixture.status == Upcoming`.
  2) Además, se exige `clock.unix_timestamp <= fixture.start_timestamp - cutoff_buffer_seconds`.
- Objetivo: reducir “late money” basado en información privilegiada y minimizar bots de timing.

> `cutoff_buffer_seconds` se vuelve **configurable** en `GlobalConfig` (con límites razonables) para ajustar sin redeploy.

---

## Hallazgos críticos (bloqueantes para Mainnet / MVP “real money”)

> **Actualización 2026-05-21 (P0 PR-1..PR-6):** los bloqueantes técnicos del hardening P0 fueron implementados y cubiertos por tests en `goalchain_program/tests/goalchain_program.ts`. Ver [`P0_HARDENING_PLAN.md`](./P0_HARDENING_PLAN.md).

### 1) `claim_bet_payout` no paga — **RESUELTO**
- Implementado CPI `transfer_checked` con signer seeds del fixture PDA + fee a treasury.

### 2) Autoridad de oráculo — **RESUELTO (P0)**
- ✅ `UpdateFixtureStatus`, `UpdatePlayerStats`, live markets, `oracle_update_player_yield` con validación contra `GlobalConfig.oracle_authority`.
- 🔲 Pendiente para siguiente fase (no P0): multisig, rotación de oracle, timelock.

### 3) Matemática `checked_*` en pools — **RESUELTO** en claims y place_bet.

### 4) Fixture vault signer seeds — **RESUELTO** en `claim_bet_payout`.

### 5) Cutoff de apuestas — **RESUELTO** (`cutoff_buffer_seconds` en config).

### Nuevo bloqueante P0 (2026-05-21) — estado final

| ID | Issue | Estado |
|----|-------|--------|
| P0-A | `resolve_wager` pagaba a ATA arbitraria | **RESUELTO PR-1** (`InvalidWagerWinner`) |
| P0-B | `ManagerState` global por admin | **RESUELTO PR-2** |
| P0-C | Vault único stake + salary | **RESUELTO PR-3** |
| P0-D | Jito presale bypass localnet | **RESUELTO PR-4** (guardas + límite por usuario + flag de preventa) |
| P0-E | `Cancelled` sin refunds + sin barrido de dust | **RESUELTO PR-5** (`refund_bet`, `sweep_fixture_dust`) |
| P0-F | IDL/SDK/frontend desalineados | **RESUELTO PR-6** (sync script + CI + JSON generado en docs) |

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

## Estado de Wager (Penalty PvP) — fuera del MVP

- ✅ `resolve_wager` valida ganador esperado (`winner_is_a`) y owner de `winner_token`; error explícito `InvalidWagerWinner`.
- ✅ Autoridad de oráculo anclada a `GlobalConfig`.
- 🔲 Pendiente de fase posterior: UX de disputes y trazabilidad externa del resultado oracle.

---

## Próximos pasos recomendados (post-P0)

1) Gobernanza operacional: migrar `admin`/`oracle` a multisig + runbook de rotación.
2) Observabilidad: emitir `emit!` events estructurados para indexación y monitoreo.
3) Riesgo de mercado: límites por fixture/market + circuit breakers de liquidez.
4) Deploy discipline: checklist firmado por 2 reviewers antes de devnet/mainnet.

---

## Notas

- ProgramID en repo: `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`.
- El keypair oficial del programa se resguarda fuera del repo.
- El flujo de desarrollo local puede compilar con `--ignore-keys`, pero deploy oficial requiere el keypair canónico.
