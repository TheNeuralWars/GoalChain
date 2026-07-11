# Proposal: Issue #872 — Recordatorio Nico Decisiones Bloqueantes

## Summary
Este issue documenta el cierre de las decisiones bloqueantes de los issues #811, #812, y #817. Es un issue de **documentación y cierre**, no de implementación de código.

## Estado Actual de Issues Relacionados

| Issue | Título | Status | Acción Requerida |
|-------|--------|--------|------------------|
| #811 | Diagnose+fix vault_crank stale + validate mint_gate threshold | ✅ done | Confirmar guard rails |
| #812 | Restart player asset generation queue | ✅ done | Agregar comentario "ya no aplica" |
| #817 | Author goalchain-asset-batch.timer | ✅ done + cancelled | Ninguna (ya cancelado) |

## Decisiones Tomadas (documentadas 2026-06-21)

### 1. Threshold mint_gate (issue #811) ✅
- **Decisión**: Mantener `0.85` sin cambios
- **Rationale**: Valor conservador, empuja a sinks reales
- **Estado**: OK - sin cambios en ECONOMIC_CANONICAL_CONFIG.json

### 2. Live mode vault_crank (issue #811) ✅
- **Decisión condicional**: Cambiar a `mode: execute` (live) si:
  - ✅ Wallet firmante tiene ≥ 1 SOL libre
  - ✅ RPC devnet sin HTTP 429 en últimas 24h
- **Si falla cualquiera**: Mantener `dry-run` una semana más

#### Implementación técnica
El modo de vault_crank se controla via variable de entorno:
```typescript
// goalchain_oracle/src/vault_crank.ts:88
const mode = process.env.VAULT_CRANK_EXECUTE === "1" ? "execute" : "dry-run";
```

Para activar modo live:
```bash
export VAULT_CRANK_EXECUTE=1
# Reiniciar el servicio/oracle
```

### 3. Asset automation (issue #817) ❌ CANCELADO
- **Fecha cancelación**: 2026-06-21 10:38 UTC
- **Razón**: Nico está resolviendo la cola de 528 player assets manualmente con Antigravity + Grok CLI
- **Resultado**: Ningún cron instalado, issue cerrado con label `cancelled`

## Acciones de Cierre Requeridas

### Alta prioridad (P1)
- [x] Issue #811: status:done ✅
- [x] Issue #812: status:done ✅
- [x] Issue #817: label:cancelled ✅
- [ ] Issue #872: Agregar comentario final + cerrar

### Comentarios a agregar
1. **Issue #811**: Confirmar que mint_gate=0.85 está OK
2. **Issue #812**: "Ya no aplica - Nico está procesando la cola por su cuenta"
3. **Issue #872**: Resumen del estado y cerrar

## Guard Rails Verification (requiere acceso VPS)

| Guard Rail | Estado | Verificación |
|------------|--------|--------------|
| Wallet ≥ 1 SOL libre | ⚠️ MANUAL | `solana balance <WALLET_PUBKEY>` |
| RPC sin 429 en 24h | ⚠️ MANUAL | Revisar logs de Helius/Devnet |

## Riesgos y Consideraciones

### Si se activa vault_crank en modo live
- **Riesgo**: ~19.62 SOL buyback + ~32.7 SOL excess swap por ejecución
- **Quemado GCH esperado**: ~353,160 tokens
- **Ratio burn/emit**: ~0.5 (revisar si <0.5 estructural → nuevo issue)
- **Rollback**: `export VAULT_CRANK_EXECUTE=0` y reiniciar

### Para issue #872
- **Riesgo regression**: NINGUNO - solo documentación
- **Rollback**: N/A - cambios de labels y comentarios en GitHub

## Test Commands

```bash
# Verificar modo actual de vault_crank
grep -n "VAULT_CRANK_EXECUTE" ~/.hermes/config.env 2>/dev/null || echo "No VAULT_CRANK_EXECUTE set (default: dry-run)"

# Verificar estado de issues
gh issue view 811 --json state,labels
gh issue view 812 --json state,labels  
gh issue view 817 --json state,labels
gh issue view 872 --json state,labels

# Verificar que no hay cron de assets instalado
systemctl --user list-timers --all | grep -i asset || echo "No asset cron installed"
```

## Files Touched (solo documentación)
- `docs/intake/2026-06-21-recordatorio-decisiones-bloqueantes.md` (ya existe)
- GitHub issues: #811, #812, #817, #872 (labels + comentarios)

## Decisión Final FCC

Dado que los issues relacionados ya tienen `status:done` y #817 tiene label `cancelled`, este issue #872 se cierra documentando:

1. ✅ Decisiones de #811 confirmadas (mint_gate 0.85, vault_crank conditional)
2. ✅ #812 cerrado como "ya no aplica"
3. ✅ #817 cancelado
4. ⚠️ vault_crank sigue en `dry-run` hasta verificar guard rails manualmente

**Este issue es de documentación puro. No requiere cambios de código.**