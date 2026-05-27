# ✅ GoalChain Launch Readiness Checklist (Foundation)

Fecha: **2026-05-14**

Este documento define la base operativa para la siguiente etapa: release readiness, observabilidad y ensayos end-to-end.

---

## 1) Release Readiness (Go/No-Go)

### Consolidación de producto (Week 8-9)
- [ ] `goalchain_webapp` publicado como frontend transaccional oficial en **`play.goalchain.fun`** (wallet, claims, markets, rent)
- [x] `docs` confirmado en modo **read-only** — CTAs → `/go/`, `app.html` redirect (PR #75)
- [x] CTA y copy en landing alineados al ownership por capa (`webapp` transaccional, `docs` informativo)

### Configuración crítica on-chain
- [ ] `oracle_authority` validada y controlada por wallet operacional definida
- [ ] `treasury_token_account` verificada contra entorno objetivo
- [ ] `jackpot_token_account` verificada contra entorno objetivo
- [ ] Cuenta de burn/fee sink validada para rutas de split de protocolo
- [ ] `fee_bps` y `cutoff_buffer_seconds` revisados y aprobados
- [ ] Program ID y cluster objetivo confirmados (localnet/devnet/mainnet según release)

### Activos y economía
- [ ] Mint de token de operación definido por entorno (testing vs producción)
- [ ] Políticas de market (`delay`, `cooldown`, `close_minute`) documentadas por tipo
- [ ] Plan de rollback documentado (pausa de mercados + actualización de config)

### Entrega técnica
- [ ] CI en verde (SDK/API/Program TS/Oracle)
- [ ] Seguridad de dependencias revisada (Dependency Review + npm audit)
- [ ] Documentación canónica actualizada (raíz) y copias web sincronizadas cuando aplique

---

## 2) Observabilidad Base (API + Oracle + Flujo de Mercado)

### API (`goalchain_api`)
- [ ] Healthcheck monitorizado (`/health`)
- [ ] Logging estructurado por endpoint (`fixtures`, `markets/:fixtureId`)
- [ ] Correlación mínima por request (request id / timestamp)
- [ ] Endpoint `GET /api/economy/metrics` operativo y estable
- [ ] KPIs publicados: `emit_burn_ratio_7d`, `onchain_sink_coverage`, `config_drift`, `vault_buyback_coverage`
- [ ] Fuente de datos documentada (config canónico + burn tracker + snapshot económico)

### Oracle (`goalchain_oracle`)
- [ ] Logs por evento emitido (`init fixture`, `live update`, `resolve`)
- [ ] Registro de intentos fallidos y motivo (RPC/network/invalid accounts)
- [ ] Trazabilidad por `matchId` para reconstrucción de incidentes

### Smart contract / operación
- [ ] Evidencia de claims exitosos y rechazados (winner/loser/too-early)
- [ ] Métricas operativas mínimas por fixture/market (pool total, fee, payouts)

---

## 3) Ensayos Integrales E2E (Criterios de Aceptación)

### Flujo core: fixture → apuestas → resolución → payout
1. Crear fixture con oráculo autorizado
2. Abrir mercado y aceptar apuestas válidas
3. Resolver fixture/market con ganador
4. Validar que:
   - losers no cobran
   - winners cobran neto correcto
   - treasury recibe fee correcto

### Criterios de aceptación
- [ ] No hay overflows/underflows en sumatorias de pool o payout
- [ ] Reglas de cutoff/cooldown/delay se cumplen
- [ ] Validaciones de PDA/mint/treasury bloquean cuentas inválidas
- [ ] Estados quedan consistentes tras cada operación (`claimed`, `status`, `winner`)

### Entornos
- [ ] **Localnet:** corrida reproducible con ledger limpio
- [ ] **Devnet:** smoke test de integración con endpoints de API y scripts Oracle
- [ ] **Mainnet dry-run:** checklist de permisos y cuentas completado sin drift

---

## 3.1) Hardening de permisos (ISSUE-023)

- [ ] `admin` en `GlobalConfig` apunta a multisig operativa válida
- [ ] `oracle_authority` rotada y auditada (sin keys de desarrollo)
- [ ] `treasury_token_account` y `jackpot_token_account` bajo control operacional esperado
- [ ] Verificación de split (`fee_burn_bps + fee_jackpot_bps <= 10000`) en entorno target
- [ ] Runbook de incidente validado: pausa mint, pausa mercados, rollback operativo off-chain

---

## 4) Operación Continua

- [ ] Ejecutar checklist antes de cada release candidato
- [ ] Mantener este documento en sincronía con cambios de contratos/reglas
- [ ] Registrar incidentes y mejoras para retroalimentar la fase siguiente

---

## 5) Post-Mundial Mainnet Gate — Scope Freeze Lifted 2026-05-27 (issue #145)

> Esta sección es la **puerta de mainnet** post-Mundial 2026. Todos los ítems deben estar en `[x]` antes de aprobar el deploy a mainnet.

### 5.1 Economía verificada
- [ ] `ECONOMIC_VALIDATION_REPORT.md` aprobado por Nico (ver `docs/governance/ECONOMIC_VALIDATION_REPORT.md`)
- [ ] Parámetros canónicos vs marketing docs alineados (`fee_bps`, `burn_bps`, `jackpot_bps`)
- [ ] `scripts/verify-canonical-economy.sh` pasa sin drift en entorno target (issue #132)
- [ ] `emit_burn_ratio_7d ≥ 0.3` y `onchain_sink_coverage ≥ 0.7` en observabilidad (issue #24)

### 5.2 On-chain hardening
- [ ] Program ID `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` verificado para mainnet
- [ ] `admin` multisig operativa configurada (no dev key)
- [ ] `oracle_authority` rotada desde key de desarrollo
- [ ] `vault_crank` bloqueado en modo `fake` — real path disponible y testeado (issue #144)
- [ ] `migrate_config.ts` archivado — `migrateConfig()` removida de ops runbooks (issue #1)
- [ ] `anchor test --validator legacy` pasa en CI (issue #4)

### 5.3 Frontend y API
- [ ] `play.goalchain.fun` activo con `VITE_API_BASE_URL` apuntando a producción
- [ ] `EconomyConfigBanner` muestra `v1.0.0-p0` y drift cuando on-chain difiere (issue #3)
- [ ] API `/api/economy/observability` retorna KPIs reales (issue #24)
- [ ] WebSocket AICommentator no bloquea UI con errores no manejados (issue #25 backlog)

### 5.4 Genesis Agents (opcional para mainnet v1)
- [ ] Brief aprobado (`docs/governance/GENESIS_AGENTS_BRIEF.md`)
- [ ] Si se incluyen: `register_genesis_agent` auditado, permisos mínimos confirmados

### 5.5 Go/No-Go final
- [ ] Nico aprueba el gate en este documento (checkbox manual)
- [ ] Rama `release/mainnet-v1` creada desde `main` verde
- [ ] Deploy ejecutado por Nico (no automático)

**Bloqueantes conocidos al 2026-05-27:** issues #144 (vault_crank real), #3 (EconomyConfigBanner), #4 (anchor CI).

