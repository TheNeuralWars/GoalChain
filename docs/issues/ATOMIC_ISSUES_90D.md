# GoalChain Atomic Issues (90D)

Lista de issues técnicos atómicos, ordenados para ejecución semanal.
Cada issue está pensado para ser mergeable en 1 PR pequeña.

## Convenciones

- **Prioridad:** `P0`, `P1`, `P2`, `P3`
- **Tipo:** `contract`, `oracle`, `sdk`, `api`, `webapp`, `docs`, `ops`
- **Regla:** 1 issue = 1 objetivo verificable + tests

---

## Semana 1 - Baseline y cierre P0

### ISSUE-001 - Crear configuración canónica versionada
- **Prioridad:** P0
- **Tipo:** docs
- **Archivo(s):** `docs/ECONOMIC_CANONICAL_CONFIG.json`, `docs/CURRENT_ECONOMIC_PARAMETERS.md`
- **Objetivo:** Definir parámetros económicos únicos con `config_version`.
- **Acceptance criteria:**
  - Existe JSON canónico con todos los parámetros críticos.
  - `CURRENT_ECONOMIC_PARAMETERS.md` referencia esa versión.

### ISSUE-002 - Verificar P0 en contrato y tests
- **Prioridad:** P0
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`, `goalchain_program/tests/goalchain_program.ts`
- **Objetivo:** Confirmar potion 100, yield porcentual, rareza por base yield.
- **Acceptance criteria:**
  - Test explícito de goal -> +10% y assist -> +5%.
  - Test de red card -> -20% y eliminación -> 0.
  - Test de burn potion 100 GCH.

### ISSUE-003 - Regenerar IDL y sincronizar SDK
- **Prioridad:** P0
- **Tipo:** sdk
- **Archivo(s):** `goalchain_program/target/idl/goalchain_program.json`, `goalchain-sdk/src/*`, `goalchain-sdk/dist/*`
- **Objetivo:** Eliminar drift entre contrato y SDK.
- **Acceptance criteria:**
  - `anchor build` y `idl:sync` ejecutados sin diff pendiente.
  - `goalchain_api` y `goalchain_webapp` compilan con SDK actualizado.

### ISSUE-004 - Alinear simulador docs con parámetros canónicos
- **Prioridad:** P0
- **Tipo:** docs
- **Archivo(s):** `docs/assets/js/modifiers_simulator.js`
- **Objetivo:** Evitar contradicciones UX vs contrato.
- **Acceptance criteria:**
  - Potion y textos económicos coinciden con config canónica.
  - No hay valores hardcodeados fuera de la config.

---

## Semana 2 - P1 (config y fee split on-chain)

### ISSUE-005 - Extender GlobalConfig con split y cap starters
- **Prioridad:** P1
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`
- **Objetivo:** Añadir `fee_burn_bps`, `fee_jackpot_bps`, `max_starters_per_manager`.
- **Acceptance criteria:**
  - Validación de suma BPS.
  - Defaults inicializados de forma segura.

### ISSUE-006 - Aplicar split en `claimBetPayout`
- **Prioridad:** P1
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`, `goalchain_program/tests/goalchain_program.ts`
- **Objetivo:** Distribuir fee en burn/jackpot/treasury.
- **Acceptance criteria:**
  - Test de distribución exacta en base units.
  - Eventos emitidos con montos del split.

### ISSUE-007 - Aplicar split en `claimMarketPayout`
- **Prioridad:** P1
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`, `goalchain_program/tests/goalchain_program.ts`
- **Objetivo:** Replicar lógica de split en mercados live.
- **Acceptance criteria:**
  - Test de payout neto + split fee.
  - Paridad de reglas con `claimBetPayout`.

### ISSUE-008 - Exponer campos nuevos en SDK/IDL
- **Prioridad:** P1
- **Tipo:** sdk
- **Archivo(s):** `goalchain-sdk/src/goalchain_program.ts`, `goalchain-sdk/src/index.js`
- **Objetivo:** Que clientes lean/actualicen config extendida.
- **Acceptance criteria:**
  - Tipos incluyen nuevos campos.
  - Helpers de lectura de config disponibles.

---

## Semana 3 - P1 (stamina y XI cap)

### ISSUE-009 - Agregar `oracle_record_match` idempotente
- **Prioridad:** P1
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`, `goalchain_program/tests/goalchain_program.ts`
- **Objetivo:** Drenar stamina por fixture una sola vez.
- **Acceptance criteria:**
  - `-30` stamina por match.
  - Segunda ejecución mismo fixture no vuelve a drenar.

### ISSUE-010 - Integrar `oracle_record_match` en OracleService
- **Prioridad:** P1
- **Tipo:** oracle
- **Archivo(s):** `goalchain_oracle/src/OracleService.ts`
- **Objetivo:** Invocar instrucción al cerrar/actualizar fixture.
- **Acceptance criteria:**
  - Flujo de oracle incluye llamada y manejo de errores.
  - Logs con matchId/player/tx hash.

### ISSUE-011 - Crear PDA `ManagerDailyClaim`
- **Prioridad:** P1
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`
- **Objetivo:** Registrar claims diarios por manager.
- **Acceptance criteria:**
  - Inicializa/actualiza contador por UTC day.
  - Error específico al superar límite.

### ISSUE-012 - Enforce máximo 11 claims por manager/día
- **Prioridad:** P1
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`, `goalchain_program/tests/goalchain_program.ts`
- **Objetivo:** Aplicar cap de Starting XI.
- **Acceptance criteria:**
  - Claim #12 falla.
  - Día siguiente reset correcto.

---

## Semana 4 - P1 (rent split y UX)

### ISSUE-013 - Actualizar `rent_nft` con split 70/25/5
- **Prioridad:** P1
- **Tipo:** contract
- **Archivo(s):** `goalchain_program/programs/goalchain_program/src/lib.rs`, `goalchain_program/tests/goalchain_program.ts`
- **Objetivo:** Distribución renter/owner/protocol.
- **Acceptance criteria:**
  - Test de montos exactos.
  - 5% protocol routeado según split global.

### ISSUE-014 - i18n económico unificado (burn vs treasury)
- **Prioridad:** P1
- **Tipo:** webapp/docs
- **Archivo(s):** `docs/assets/js/i18n.js`, `docs/assets/js/*`, `goalchain_webapp/src/ui/*`
- **Objetivo:** Textos sin ambiguedad económica.
- **Acceptance criteria:**
  - No se usa "burn" donde es treasury transfer.
  - Mensajes consistentes en ES/EN.

### ISSUE-015 - Endpoint API de parámetros económicos activos
- **Prioridad:** P1
- **Tipo:** api
- **Archivo(s):** `goalchain_api/src/index.ts`
- **Objetivo:** Exponer parámetros vigentes para UI.
- **Acceptance criteria:**
  - `GET /api/economy/config` devuelve config_version + parámetros.
  - UI lee endpoint en vez de hardcodear.

---

## Semana 5 - P2 (mint policy y operación)

### ISSUE-016 - Decisión formal de política de supply
- **Prioridad:** P2
- **Tipo:** docs/ops
- **Archivo(s):** `docs/P2_VAULT_MINT_ROADMAP.md`, `docs/TOKENOMICS_EQUILIBRIUM.md`
- **Objetivo:** Elegir `1B cap` o `infinite gated`.
- **Acceptance criteria:**
  - Decisión documentada con pros/contras y trigger de revisión.
  - Referencia de ceremonia multisig.

### ISSUE-017 - Script `mint_gate` por ratio 7d
- **Prioridad:** P2
- **Tipo:** oracle/ops
- **Archivo(s):** `goalchain_oracle/src/mint_gate.ts` (nuevo)
- **Objetivo:** Pausar mint fuera de rango de sostenibilidad.
- **Acceptance criteria:**
  - Calcula `emit_burn_ratio_7d`.
  - Emite recomendación/acción basada en umbrales.

### ISSUE-018 - Runbook de pausa/reanudación de mint
- **Prioridad:** P2
- **Tipo:** ops/docs
- **Archivo(s):** `docs/DEVNET_RELEASE_CHECKLIST.md` o nuevo runbook
- **Objetivo:** Operación segura ante desbalance económico.
- **Acceptance criteria:**
  - Pasos exactos, responsables y rollback.
  - Escenarios de incidente cubiertos.

---

## Semana 6-7 - P2 (vault crank y transparencia)

### ISSUE-019 - Implementar crank semanal de buyback/burn
- **Prioridad:** P2
- **Tipo:** oracle/ops
- **Archivo(s):** `goalchain_oracle/src/*` (nuevo job), `docs/`
- **Objetivo:** Ejecutar Infinity Engine real (yield -> buyback -> burn).
- **Acceptance criteria:**
  - Job idempotente con logs y tx hashes.
  - Alertas en fallo/reintento.

### ISSUE-020 - Publicar burn tracker en docs
- **Prioridad:** P2
- **Tipo:** docs
- **Archivo(s):** `docs/index.html`, `docs/assets/js/*`
- **Objetivo:** Transparencia pública de burn y cobertura.
- **Acceptance criteria:**
  - Muestra burn 24h/7d, net emission, buyback coverage.
  - Datos provienen de fuente verificable (API o snapshots firmados).

---

## Semana 8-9 - P3 (consolidación de producto)

### ISSUE-021 - Definir frontend oficial y deprecaciones
- **Prioridad:** P3
- **Tipo:** product/webapp/docs
- **Archivo(s):** `docs/LAUNCH_READINESS_CHECKLIST.md`, `goalchain_webapp/*`, `docs/*`
- **Objetivo:** `goalchain_webapp` como app transaccional oficial, `docs` read-only.
- **Acceptance criteria:**
  - Flujos críticos transaccionales solo en webapp.
  - Landing/docs sin simulaciones contradictorias.

### ISSUE-022 - Dashboard de observabilidad económica
- **Prioridad:** P3
- **Tipo:** api/docs
- **Archivo(s):** `goalchain_api/src/index.ts`, `docs/*`
- **Objetivo:** Exponer KPIs de sostenibilidad en tiempo real.
- **Acceptance criteria:**
  - Endpoint(s) con `emit_burn_ratio_7d`, `onchain_sink_coverage`, `config_drift`.
  - Visualización legible para comunidad.

### ISSUE-023 - Hardening final de release mainnet
- **Prioridad:** P3
- **Tipo:** contract/oracle/ops
- **Archivo(s):** `docs/LAUNCH_READINESS_CHECKLIST.md`, tests en `goalchain_program/tests/*`
- **Objetivo:** Cerrar riesgos críticos antes de mainnet.
- **Acceptance criteria:**
  - Suite completa verde.
  - Revisión de permisos admin/oracle.
  - Verificación de cuentas treasury/jackpot/burn.

---

## Dependencias críticas

- `ISSUE-003` depende de cambios contractuales previos (P0/P1).
- `ISSUE-010` depende de `ISSUE-009`.
- `ISSUE-012` depende de `ISSUE-011`.
- `ISSUE-017` depende de telemetría mínima de emisión/burn.
- `ISSUE-019` depende de política definida en `ISSUE-016`.

## Orden recomendado de ejecución

1. `ISSUE-001` a `ISSUE-004`
2. `ISSUE-005` a `ISSUE-012`
3. `ISSUE-013` a `ISSUE-015`
4. `ISSUE-016` a `ISSUE-020`
5. `ISSUE-021` a `ISSUE-023`

