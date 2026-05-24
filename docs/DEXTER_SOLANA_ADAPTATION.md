# Dexter Solana Adaptation — Integration Spike

**Branch:** `exp/opencode-dexter-solana-adaptation`
**Owner:** opencode
**Status:** draft
**Priority:** P2
**Created:** 2026-05-24

## Objective
Explorar y planificar la adaptación de Dexter (AI trading agent framework) a Solana como base para agentes tokenizables de GoalChain.

## Context
Dexter (github.com/virattt/dexter) es un framework open-source para construir agentes de trading autónomos con LLMs. Actualmente soporta principalmente EVM. Adaptarlo a Solana permitiría crear agentes de yield/trading que puedan integrarse con el Infinity Engine y ser tokenizados dentro del Genesis Agents Protocol.

## Allowed files
- `docs/DEXTER_SOLANA_ADAPTATION.md` (este documento)
- `exp/opencode-dexter-solana-adaptation/` (cualquier prototipo o análisis)

## Out of scope
- Implementación completa del fork
- Cambios en `goalchain_program/` o contratos
- Deploy en mainnet o devnet
- Integración con Vault real

## Acceptance criteria
- Documento de análisis completo con:
  - Componentes clave de Dexter
  - Diferencias técnicas EVM vs Solana
  - Arquitectura propuesta para la adaptación
  - Riesgos y esfuerzo estimado
  - Recomendación de siguiente paso

## Test commands
```bash
# Ninguno por ahora (solo análisis)
```

## Risks
- Complejidad de portar lógica de trading de EVM a Solana
- Dependencias de Jupiter API y wallet adapters
- Tiempo de desarrollo mayor al estimado
- Posible obsolescencia del framework original

## Rollback
- `git checkout main && git branch -D exp/opencode-dexter-solana-adaptation`
- Borrar carpeta de análisis si es necesario
- Actualizar este brief a `cancelled`

## Next Steps (if approved)
1. Clonar Dexter y analizar su arquitectura
2. Identificar los módulos que requieren adaptación a Solana
3. Proponer una arquitectura mínima viable
4. Evaluar si vale la pena mantenerlo como proyecto separado o integrarlo directamente en GoalChain agents
