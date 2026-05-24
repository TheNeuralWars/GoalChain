# GoalChain Execution Backlog (90 días)

Backlog técnico ejecutable para cerrar Infinity Engine con ownership por capa.

## Objetivo de negocio

- Llegar a Fase 2 con economía consistente entre contrato, oracle y frontend.
- Reducir riesgo de inflación no controlada con enforcement on-chain + loop de buyback verificable.
- Habilitar earning real de usuarios con reglas transparentes y auditable metrics.

## KPIs de control (gate de release)

- `emit_burn_ratio_7d` en rango `0.85 - 1.05`.
- `vault_buyback_coverage` >= `0.25` antes de escalar UA.
- `onchain_sink_coverage` >= `90%` de sinks definidos en docs.
- `config_drift` = 0 (parámetros iguales entre lib.rs, oracle, webapp/docs).
- `claim_rejection_rate` por reglas anti-abuso < 2% (excluyendo bots).

## Ownership por capa

- `goalchain_program`: reglas económicas, fees, taxes, burns, caps, eventos.
- `goalchain_oracle`: fixtures/live state/stats + automatización operativa.
- `goalchain-sdk`: IDL + tipos + seeds + helper methods.
- `goalchain_api`: servicios off-chain (whitelist, coach, analytics, referral off-chain).
- `goalchain_webapp`: cliente transaccional oficial.
- `docs`: landing/docs/read-only dashboards (no simulación contradictoria).

---

## Sprint 0 (semana 1): Cierre P0 + baseline único

### 0.1 Congelar configuración canónica

- **Archivo nuevo**: `docs/ECONOMIC_CANONICAL_CONFIG.json`
- **Contenido mínimo**:
  - `fee_bps`
  - `architect_tax_bps`
  - `potion_burn_lamports`
  - `default_base_yield_lamports`
  - `rarity_base_yields`
  - `max_fee_bps`
  - `token_decimals`
- **DoD**:
  - Versionado semántico del config (`config_version`).
  - Referenciado en docs técnicas (`CURRENT_ECONOMIC_PARAMETERS.md`).

### 0.2 Verificación cruzada de P0 ya implementado

- `goalchain_program/programs/goalchain_program/src/lib.rs`
- `goalchain_program/tests/goalchain_program.ts`
- `goalchain_oracle/src/economy/rarityYield.ts`
- `docs/assets/js/modifiers_simulator.js`
- **Tareas**:
  - Confirmar potion = 100 GCH en contrato y simulador.
  - Confirmar oracle updates porcentuales (+10/+5/-20).
  - Confirmar init por rareza (`initial_base_yield`).
  - Regenerar IDL + sync SDK.
- **Comandos**:
  - `cd goalchain_program && anchor build && anchor test`
  - `cd goalchain_program && npm run idl:sync && npm run idl:check`
- **DoD**:
  - Tests verdes.
  - Sin drift IDL/SDK.

---

## Sprint 1 (semanas 2-3): P1 sinks on-chain (enforcement)

### 1.1 Fee split en claims/payouts

- **Archivos**:
  - `goalchain_program/programs/goalchain_program/src/lib.rs`
  - `goalchain_program/tests/goalchain_program.ts`
  - `goalchain-sdk/src/goalchain_program.ts` (via IDL sync)
- **Cambios**:
  - Extender `GlobalConfig` con:
    - `fee_burn_bps`
    - `fee_jackpot_bps`
    - `max_starters_per_manager`
  - En `claimBetPayout` y `claimMarketPayout`:
    - split default 40/40/20 (burn/jackpot/treasury) o config equivalente.
- **DoD**:
  - Test de split exacto en lamports.
  - Rechazo de config inválida (`sum_bps != 10000`).

### 1.2 Match stamina on-chain

- **Archivos**:
  - `goalchain_program/programs/goalchain_program/src/lib.rs`
  - `goalchain_oracle/src/OracleService.ts`
  - `goalchain_program/tests/goalchain_program.ts`
- **Cambios**:
  - Agregar `oracle_record_match` idempotente por fixture/player.
  - Aplicar `-30` stamina por match (o valor canónico).
- **DoD**:
  - Segundo update mismo fixture no drena doble.
  - Test de stamina + penalidad de claim.

### 1.3 Límite de claims diarios (XI cap)

- **Archivos**:
  - `goalchain_program/programs/goalchain_program/src/lib.rs`
  - `goalchain_program/tests/goalchain_program.ts`
  - `goalchain-sdk` (IDL sync)
- **Cambios**:
  - PDA `ManagerDailyClaim` por manager + UTC day.
  - Máximo 11 claims/día por manager.
- **DoD**:
  - 12º claim falla con error explícito.
  - Reset correcto al día siguiente.

### 1.4 Rent split protocolario

- **Archivos**:
  - `goalchain_program/programs/goalchain_program/src/lib.rs`
  - `goalchain_program/tests/goalchain_program.ts`
  - `goalchain_webapp/src/ui/*` (texto UX)
- **Cambios**:
  - `rent_nft`: 70% renter / 25% owner / 5% protocol.
  - Routing del 5% según split de protocolo.
- **DoD**:
  - Tests de distribución.
  - UI sin claims económicos ambiguos.

---

## Sprint 2 (semanas 4-6): P2 mint policy + vault loop operable

### 2.1 Política de mint (governance-ready)

- **Archivos**:
  - `docs/P2_VAULT_MINT_ROADMAP.md`
  - `docs/TOKENOMICS_EQUILIBRIUM.md`
  - scripts ops en `goalchain_oracle/src/*`
- **Decisión requerida**:
  - `1B cap` vs `infinite gated`.
- **DoD**:
  - Decisión firmada en docs.
  - Procedimiento de autoridad (multisig) documentado.

### 2.2 Mint gate por ratio emit/burn

- **Archivos**:
  - `goalchain_oracle/src/` (nuevo script, por ejemplo `mint_gate.ts`)
  - `goalchain_api/src/index.ts` (endpoint observabilidad opcional)
  - `docs/data/*` (snapshot diario)
- **Cambios**:
  - Calcular ratio 7d.
  - Política: pausar mint si ratio fuera de banda.
- **DoD**:
  - Dry run en devnet.
  - Logs auditables por día/epoch.

### 2.3 Vault crank semanal (buyback + burn)

- **Archivos**:
  - `goalchain_oracle/src/` (job/crank)
  - `docs/` (tracker read-only)
- **Cambios**:
  - Pipeline: harvest LST -> swap -> burn.
  - Publicar tx hashes y métricas.
- **DoD**:
  - Ejecución repetible con runbook.
  - Burn tracker visible en frontend docs.

---

## Sprint 3 (semanas 7-9): Unificación producto y confiabilidad

### 3.1 Unificar frontend oficial

- **Decisión**:
  - `goalchain_webapp` = cliente transaccional oficial.
  - `docs` = marketing/docs/dashboard read-only.
- **Acciones**:
  - Mover mensajes económicos a fuente canónica.
  - Eliminar simulaciones que contradicen on-chain.

### 3.2 Observabilidad y auditoría operativa

- **Archivos**:
  - `goalchain_api/src/index.ts` (endpoints de métricas)
  - `docs/` (tablas KPI)
- **Métricas mínimas**:
  - emisiones 24h/7d
  - burns 24h/7d
  - net emission
  - vault buyback coverage
  - fees por canal (bet/rent/market)

### 3.3 Seguridad y release readiness

- **Checklist**:
  - rerun `anchor test`
  - validación de cuentas treasury/jackpot/burn
  - revisión permisos oracle/admin
  - runbook incidente (pausa mint, rollback operativo off-chain)

---

## Backlog por archivo (resumen rápido)

- `goalchain_program/programs/goalchain_program/src/lib.rs`
  - Config extendida + splits + caps + stamina match + XI cap.
- `goalchain_program/tests/goalchain_program.ts`
  - Tests de economía completa (splits, límites, idempotencia, drift guard).
- `goalchain_oracle/src/OracleService.ts`
  - Integrar instrucciones nuevas + hooks de control.
- `goalchain_oracle/src/index.ts`
  - Run mode prod/dev claro, sin defaults de riesgo en mainnet.
- `goalchain-sdk/src/goalchain_program.ts`
  - Sync automático por IDL en cada cambio.
- `goalchain_webapp/src/ui/*.tsx`
  - Mensajes/flows reflejando economía real, no simulada.
- `docs/CURRENT_ECONOMIC_PARAMETERS.md`
  - Estado vigente por versión.
- `docs/TOKENOMICS_EQUILIBRIUM.md`
  - Modelo y supuestos de equilibrio.

---

## Riesgos y mitigación

- Drift entre docs y contrato -> bloquear release si `config_drift != 0`.
- Inflación por picos de actividad -> mint gate + sinks dinámicos.
- UX rota por reglas nuevas -> feature flags en webapp + mensajes claros.
- Dependencia operativa oracle -> runbooks + alertas + fallback manual.

## Criterio de éxito (fin de 90 días)

- Infinity Engine observable y operativo (no solo narrativo).
- Economía ejecutada principalmente on-chain.
- Usuario ve en UI los mismos parámetros que el contrato aplica.
- Equipo puede escalar UA con control de presión inflacionaria.
