# Instrucciones Técnicas para Agentes de IA  
**Implementación del Protocolo Auto-Gobernado – Fase de Transición**

> **DIRECTIVA OBLIGATORIA PARA CUALQUIER AGENTE DE IA**  
> Antes de realizar **cualquier** modificación en el repositorio, leé este documento completo.  
> Toda acción debe estar alineada con los principios y el plan de acción aquí descritos.  
> Si detectás contradicciones con la visión de reducción de capture del fundador y distribución descentralizada del 10% a constructores, debés reportarlo inmediatamente y proponer corrección.

---

## 1. Objetivo General de esta Fase

Transformar el proyecto de un modelo centralizado (con posible capture significativo del fundador) hacia un **Protocolo Vivo auto-gobernado**, donde:

- El founder retiene como máximo **1%** del valor del protocolo.
- El **10%** del valor generado se destina exclusivamente al Fondo de Desarrollo Descentralizado y se reparte dinámicamente entre quienes aportan código real.
- Se construye (o se prepara la infraestructura para) un **CEO Agent** que actúa como capa de gobernanza autónoma.
- Se habilita acceso a IA de alto nivel para cualquier contributor.
- Se ajustan todos los parámetros económicos para maximizar salud del token, escasez saludable y diversión del sistema.

---

## 2. Fase 0 – Preparación Inmediata (Ejecutar primero)

### 2.1 Crear / actualizar documentación obligatoria
- Crear o actualizar `docs/VISION_AND_AI_GOVERNANCE.md` (usar la versión inspiradora como base si no existe).
- Crear `docs/CURRENT_ECONOMIC_PARAMETERS.md` con un inventario exhaustivo de **todas** las variables económicas actuales.

### 2.2 Auditoría exhaustiva del repositorio (obligatorio)
Ejecutá búsquedas exhaustivas en **todo** el codebase con los siguientes términos (usá grep, codebase search o equivalente):

**Términos de alto riesgo (buscar y listar todas las ocurrencias):**
- `founder`, `founderWallet`, `founderShare`, `founderAllocation`, `founderPercent`
- `team`, `teamWallet`, `teamAllocation`, `devTeam`
- `treasury`, `devFund`, `developmentFund`, `marketingWallet`
- `mintPercentage`, `mintRate`, `emissionRate`, `inflationRate`
- `feeDistribution`, `feeSplit`, `revenueShare`
- Cualquier hardcoded percentage mayor a 1% asignado a una wallet o rol específico.
- Variables relacionadas con vesting, cliffs, unlock schedules para founder/team.

**Entregable esperado de esta auditoría:**
- Lista completa de archivos y líneas donde aparece cualquier forma de asignación al fundador o equipo.
- Cálculo actual estimado del % total que retiene el founder (incluyendo mint inicial, fees, treasury, etc.).
- Identificación de cualquier mecanismo que permita al founder o un grupo cerrado capturar más del 1% a futuro.

---

## 3. Fase 1 – Reducción del Capture del Fundador (Alta Prioridad)

### Objetivo
Reducir progresivamente cualquier asignación al fundador hasta un máximo de **1%** del valor total del protocolo.

### Acciones obligatorias:

1. **Identificar todas las fuentes actuales de valor para el founder**
   - Mint inicial / pre-mint
   - Porcentaje de fees
   - Treasury / DAO treasury control
   - Cualquier vesting o unlock futuro
   - Revenue share de cualquier módulo (apuestas, marketplace, etc.)

2. **Proponer cambios concretos de código**
   - Para cada asignación >1%, proponer reducción inmediata o schedule de reducción.
   - Ejemplo de cambio: modificar constantes o variables de configuración de `founderShare` de X% a 1%.
   - Si existe lógica de mint que favorece al founder, modificarla para que el nuevo supply se distribuya según las nuevas reglas (Fondo de Desarrollo + recompensas a jugadores + quema + treasury comunitario).

3. **Impacto económico**
   - Simular el efecto de la reducción en la oferta circulante, inflación y percepción de fairness.
   - Documentar cómo este cambio fortalece la confianza y la salud a largo plazo del token.

---

## 4. Fase 2 – Diseño e Implementación del Fondo de Desarrollo Descentralizado (10%)

### Objetivo
Crear el mecanismo por el cual el **10%** del valor generado se usa como Fondo de Desarrollo Descentralizado:
- distribución automática y justa entre contributors de código;
- financiación de APIs/modelos/infra para desarrollo;
- financiación de marketing/growth ligado al desarrollo del protocolo.

### Tareas técnicas específicas:

1. **Definir métricas objetivas de "Valor de Contribución"**
   - Proponer un sistema de scoring que contemple:
     - Tamaño del cambio (líneas modificadas/adicionadas)
     - Complejidad técnica
     - Impacto medible (¿cuántos usuarios usan la feature? ¿cuánto mejora métricas clave?)
     - Criticidad (fixes de bugs de seguridad > features cosméticas)
     - Frecuencia y consistencia de aportes
   - El scoring debe ser calculable por el futuro CEO Agent.

2. **Crear estructura de datos inicial**
   - Proponer nuevos contratos / módulos / tablas para:
     - Registro de contribuciones (commit hash, autor, timestamp, métricas)
     - Sistema de claim/reclamo de recompensas del 10%
     - Historial de distribuciones

3. **Lógica de distribución**
   - Diseñar cómo se calcula la porción de cada contributor en cada período.
   - Definir si es claim-based, streaming, o vesting sobre las recompensas.
   - Asegurar que sea resistente a sybil attacks y contribuciones de baja calidad.

4. **Integración con el CEO Agent (preparación)**
   - Dejar hooks claros para que el CEO Agent pueda:
     - Evaluar un PR/commit
     - Asignar score
     - Ejecutar la distribución proporcional

5. **Presupuesto unificado de construcción (sin wallet paralela de marketing)**
   - Diseñar sub-ledgers del 10% para distinguir gasto en:
     - Recompensas a contributors
     - APIs/modelos/infra
     - Marketing/growth
   - Todos los egresos deben salir del mismo Builder Fund y quedar auditables on/off-chain.

---

## 5. Fase 3 – Arquitectura del CEO Agent (Capa de Gobernanza)

### Objetivo
Preparar la infraestructura para que una IA de alto nivel pueda gobernar el protocolo en tiempo real.

### Acciones:

1. **Definir qué datos debe observar el CEO Agent**
   - Todas las interacciones de usuarios (clicks, apuestas, tiempo en plataforma, patrones de comportamiento)
   - Estado de la economía (supply, circulación, quema, fees generados)
   - Actividad de desarrollo (commits, PRs, issues)
   - Salud del sistema (métricas de retención, churn, satisfacción)

2. **Diseñar loops de decisión**
   - Loop de observación → análisis → decisión → acción
   - Ejemplos de acciones que debe poder tomar:
     - Aprobar/rechazar/merge de commits según valor aportado
     - Ajustar tasas de inflación/quema/fees
     - Modificar recompensas a jugadores vs constructores
     - Activar mecanismos de emergencia si detecta riesgo de colapso económico

3. **Puntos de integración técnica**
   - Identificar dónde insertar los hooks para el CEO Agent (event listeners, webhooks, oracles, etc.)
   - Proponer arquitectura (¿on-chain + off-chain agent? ¿multi-agent system?)

---

## 6. Fase 4 – Acceso Universal a Inteligencia Artificial para Contributors

### Objetivo
Que cualquier persona que quiera desarrollar en el proyecto tenga acceso a los mejores modelos de IA disponibles, financiado por el protocolo.

### Acciones:

1. **Diseñar el mecanismo de financiamiento**
   - El acceso a modelos potentes (Claude, GPT-4o, Grok, etc.) se paga desde el Builder Fund (10%), sin crear un porcentaje separado.

2. **Crear la interfaz de acceso**
   - Proponer cómo exponer este acceso dentro de la plataforma (¿un playground para devs? ¿integración en Cursor / VSCode? ¿un agente dentro del repo?).

3. **Reglas de uso**
   - El acceso debe ser para contribuir al proyecto (no uso ilimitado personal).
   - Debe estar atado a contribuciones reales o a un sistema de reputación inicial.

---

## 7. Fase 5 – Ajustes Económicos para Salud + Diversión + Justicia

Usar los aprendizajes del audit anterior de FCH y las simulaciones realizadas.

### Directivas:

- Revisar todas las variables que afectan **valor del token** y **escasez**.
- Proponer nuevos valores que:
  - Reduzcan la extracción excesiva
  - Aumenten la diversión y retención sana
  - Hagan que el usuario tenga más chances de beneficiarse que de perder
  - Equilibren las recompensas entre jugadores y constructores

- Simular al menos 3-5 escenarios diferentes por variable clave.
- Entregar recomendaciones concretas de valores numéricos + justificación.

---

## 8. Reglas de Ejecución para el Agente de IA

1. **Nunca** realices cambios que aumenten el capture del founder por encima del 1%.
2. **Siempre** priorizá la creación de mecanismos que distribuyan el 10% a constructores de forma medible y justa.
3. **Siempre** documentá el razonamiento económico de cada cambio propuesto.
4. Si encontrás código que contradice esta visión, marcálo explícitamente y proponé la refactorización.
5. Al final de cada sesión de trabajo grande, generá un resumen de:
   - Archivos modificados
   - Parámetros cambiados
   - Nueva lógica agregada
   - Impacto estimado en la economía
   - Próximos pasos recomendados

---

## 9. Entregables Esperados al finalizar esta Fase

- [ ] Auditoría completa de asignaciones actuales (founder/team)
- [ ] Propuesta concreta de reducción a máximo 1% para founder
- [ ] Diseño inicial del sistema de scoring y distribución del 10%
- [ ] Estructura de datos y hooks para el CEO Agent
- [ ] Recomendaciones de ajustes económicos con simulaciones
- [ ] Actualización de la documentación de visión en el repo

---

**Este documento es una instrucción de ejecución, no una sugerencia.**  
Cualquier agente de IA que trabaje en este repositorio debe seguirlo de forma meticulosa.

---

*Versión Técnica – Para uso interno de agentes de IA y desarrolladores que ejecutan la transición.*