# Genesis Agents Protocol — Tokenización de Agentes en GoalChain

**Estado:** Conceptual (Fase 0)
**Fecha:** 2026-05-23
**Autor:** OpenCode (colaborador)

---

## 1. Visión General

El **Genesis Agents Protocol** permite tokenizar agentes de IA que operan dentro del ecosistema GoalChain. Cada agente se convierte en un activo digital (NFT o token) que genera revenue y reparte yield a sus holders, manteniendo alineación con el modelo **Zero Value Loss** del Infinity Engine.

---

## 2. Categorías de Agentes

| Categoría     | Descripción                              | Ejemplos de Agentes                  | Revenue Principal                  |
|---------------|------------------------------------------|--------------------------------------|------------------------------------|
| **Operator**  | Agentes que ejecutan operaciones 24/7    | Hermes, Intake Agent, Digest Agent   | Fees de intake, comisiones de tareas |
| **Oracle**    | Agentes de datos y predicción            | Live Betting Agent, Prediction Agent | Comisiones de apuestas / oráculos  |
| **Vault**     | Agentes que gestionan yield y buyback    | Vault Sentinel, Buyback Agent        | Yield share del Infinity Engine    |
| **Manager**   | Agentes vinculados a jugadores NFT       | Squad Manager Agent                  | Performance fee de managers        |
| **Content**   | Agentes de generación de contenido       | Lore Agent, Social Media Agent       | Monetización de contenido          |

---

## 3. Modelo Económico (Revenue Split)

Propuesta base por agente tokenizado:

| Destino                    | Porcentaje | Notas |
|---------------------------|------------|-------|
| **Holder del Agente**     | 35-45%     | Depende de la categoría |
| **Infinity Engine Vault** | 25-40%     | Buyback & burn de $GCH |
| **Treasury / Jackpot**    | 15-20%     | Comunidad y desarrollo |
| **Mantenimiento del Agente** | 10%     | Hosting, actualizaciones, monitoring |

**Regla de oro:** Todo revenue generado por un agente debe tener al menos **25%** destinado al Vault.

---

## 4. Primeros Agentes a Lanzar (Fase 0)

### Agente 1: Hermes (OpenClaw)
- **Rol:** Intake, priorización, briefs, digest diario
- **Categoría:** Operator
- **Revenue:** Fees de intake + comisiones de tareas automatizadas
- **Split propuesto:** 40% Holder / 30% Vault / 20% Treasury / 10% Mantenimiento
- **Lanzamiento:** Post-merge de PRs #26–#34

### Agente 2: Vault Sentinel
- **Rol:** Monitoreo de yield, ejecución de buyback, alertas de salud
- **Categoría:** Vault
- **Revenue:** Porcentaje del yield generado por el Vault
- **Split propuesto:** 30% Holder / 50% Vault / 10% Treasury / 10% Mantenimiento

### Agente 3: Devnet Oracle
- **Rol:** Validación de datos devnet, simulación de apuestas, reportes
- **Categoría:** Oracle
- **Revenue:** Comisiones de simulación / testing de apuestas
- **Split propuesto:** 35% Holder / 35% Vault / 20% Treasury / 10% Mantenimiento

---

## 5. Flujo de Lanzamiento de un Agente

1. Definir brief en `docs/intake/`
2. Crear agente en el servidor Hermes (`/opt/hermes/agents/`)
3. Desplegar en Virtuals.io como NFT/token
4. Configurar revenue split (smart contract o off-chain treasury)
5. Anunciar en página/app + notificación a holders de Genesis Squad
6. Monitoreo de performance y revenue (Hermes + dashboard)

---

## 6. Integración con Virtuals.io

- Cada agente se lanza como **NFT** en Virtuals.
- Los holders reciben yield proporcional a su ownership.
- Virtuals actúa como marketplace secundario de agentes.
- GoalChain retiene control sobre la lógica y revenue share.

---

## 7. Próximos Pasos

- [ ] Definir smart contract de revenue share (o treasury off-chain inicial)
- [ ] Crear página de "Genesis Agents" en goalchain.fun
- [ ] Desarrollar primer agente (Hermes) en rama `exp/opencode-hermes-tokenization`
- [ ] Establecer política de emisión de nuevos agentes (governance)

---

*Documento vivo. Actualizar conforme avance la implementación.*
