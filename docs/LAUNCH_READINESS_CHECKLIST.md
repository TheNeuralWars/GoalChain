# ✅ GoalChain Launch Readiness Checklist (Foundation)

Fecha: **2026-05-14**

Este documento define la base operativa para la siguiente etapa: release readiness, observabilidad y ensayos end-to-end.

---

## 1) Release Readiness (Go/No-Go)

### Configuración crítica on-chain
- [ ] `oracle_authority` validada y controlada por wallet operacional definida
- [ ] `treasury_token_account` verificada contra entorno objetivo
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

---

## 4) Operación Continua

- [ ] Ejecutar checklist antes de cada release candidato
- [ ] Mantener este documento en sincronía con cambios de contratos/reglas
- [ ] Registrar incidentes y mejoras para retroalimentar la fase siguiente
