# Lanzamiento de los Primeros Agentes Tokenizados (Fase 0)

**Estado:** Plan de lanzamiento
**Fecha:** 2026-05-23
**Relacionado:** `docs/GENESIS_AGENTS_PROTOCOL.md`

---

## Objetivo

Lanzar los primeros 3 agentes tokenizados en Virtuals.io una vez que `main` tenga mergeados los PRs #26–#34.

---

## Agentes Seleccionados para Fase 0

### 1. Hermes (OpenClaw)
- **Nombre en Virtuals:** `Hermes - GoalChain Operator`
- **Descripción:** Agente 24/7 responsable de intake, priorización de tareas, generación de briefs y digest diario del ecosistema.
- **Categoría:** Operator
- **Revenue Model:** Fees de intake + comisiones por tareas automatizadas
- **Split:** 40% Holder / 30% Infinity Vault / 20% Treasury / 10% Mantenimiento
- **Lanzamiento estimado:** 7-10 días post-merge

### 2. Vault Sentinel
- **Nombre en Virtuals:** `Vault Sentinel`
- **Descripción:** Agente encargado de monitorear el yield del Infinity Engine, ejecutar buybacks y alertar sobre salud del Vault.
- **Categoría:** Vault
- **Revenue Model:** Porcentaje del yield generado
- **Split:** 30% Holder / 50% Infinity Vault / 10% Treasury / 10% Mantenimiento
- **Lanzamiento estimado:** 10-14 días post-merge

### 3. Devnet Oracle
- **Nombre en Virtuals:** `Devnet Oracle Agent`
- **Descripción:** Agente de validación de datos en devnet, simulación de apuestas y reportes de performance.
- **Categoría:** Oracle
- **Revenue Model:** Comisiones de simulación y testing de apuestas
- **Split:** 35% Holder / 35% Infinity Vault / 20% Treasury / 10% Mantenimiento
- **Lanzamiento estimado:** 14-21 días post-merge

---

## Requisitos Previos al Lanzamiento

- [ ] Merge completo de PRs #26–#34 en `main`
- [ ] Repositorio de agentes en `/opt/hermes/agents/`
- [ ] Sistema de revenue share definido (off-chain treasury inicial)
- [ ] Página de "Genesis Agents" en goalchain.fun
- [ ] Dashboard básico de performance de agentes (métricas simples)
- [ ] Política de emisión de nuevos agentes documentada

---

## Cronograma Sugerido

| Semana | Acción |
|--------|--------|
| Semana 0 | Merge de stack actual + setup de `/opt/hermes/agents/` |
| Semana 1 | Desarrollo y test de Hermes Agent + lanzamiento en Virtuals |
| Semana 2 | Lanzamiento de Vault Sentinel |
| Semana 3 | Lanzamiento de Devnet Oracle + anuncio conjunto |

---

## Consideraciones de Lanzamiento

- Usar **precios de entrada accesibles** (ej: 0.1–0.5 ETH o equivalente en $GCH) para los primeros agentes.
- Ofrecer **beneficios tempranos** a holders de Genesis Squad (descuento o prioridad).
- Publicar roadmap de agentes en `docs/GENESIS_AGENTS_ROADMAP.md`.
- Establecer un canal de comunicación claro (Discord/Telegram) para holders de agentes.

---

*Este documento se actualizará con fechas reales una vez que se complete el merge de la stack actual.*
