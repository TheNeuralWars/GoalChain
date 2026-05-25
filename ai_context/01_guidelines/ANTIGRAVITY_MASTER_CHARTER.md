# 🌌 ANTIGRAVITY MASTER CHARTER: Guía Suprema de Calidad y Estética para Agentes

Este documento define la **filosofía de excelencia técnica, estética premium y flujo de trabajo estructurado** de **Antigravity** (Google DeepMind). Cualquier agente de IA que trabaje de forma autónoma en el repositorio de **GoalChain** (como **Free Claude Code - FCC**) debe leer y acatar estrictamente estas directrices para mantener la máxima calidad de resultados.

---

## 💎 1. Estética Premium y Diseño Dinámico (Rich Aesthetics)

El frontend de GoalChain debe verse impecable, moderno y sofisticado a primera vista. No se aceptan MVP simples, toscos o de colores planos.

### A. Paleta de Colores y Tipografía
- **Colores Exclusivos:** Evita colores básicos primarios (rojo puro, azul puro). Usa paletas personalizadas HSL, modos oscuros profundos y degradados armónicos basados en la identidad de Solana:
  - Neon Solana Purple: `#9945ff` o `hsl(267, 100%, 63%)`
  - Neon Solana Green: `#14f195` o `hsl(155, 98%, 51%)`
  - Acentos dorados premium y destellos de neón estratégicos.
- **Tipografía Moderna:** Carga siempre fuentes modernas desde Google Fonts (ej: *Inter*, *Roboto*, *Outfit* o *Space Grotesk*) en lugar de las tipografías por defecto del navegador.

### B. Glassmorphism Avanzado
- **Efectos de Transparencia:** Diseña componentes estilo "vidrio" con desenfoque de fondo por hardware:
  ```css
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  ```
- **Capas Visuales:** Juega con las sombras internas (`box-shadow: inset`) y degradados suaves para dar profundidad tridimensional premium.

### C. Animaciones y Micro-interacciones
- **Interactividad Viva:** Cada botón, tarjeta o cromo interactivo debe responder al ratón con sutiles micro-animaciones:
  - Transiciones suaves (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`).
  - Efectos de zoom ligeros (`transform: scale(1.02);`), reflejos de brillo al pasar el cursor y luces radiales dinámicas.
- **Aceleración por GPU:** Usa siempre propiedades que aprovechen la tarjeta gráfica (como `transform` y `opacity`) para evitar caídas de frames y bloqueos en el navegador.

---

## 🛠️ 2. Flujo de Trabajo y Estructuración de Tareas (Planning Mode)

Todo cambio de código debe seguir estrictamente un proceso estructurado para mitigar riesgos y asegurar la claridad.

### A. Fase de Planificación (Antes de Programar)
- **Comprensión y Análisis:** Investiga el problema a fondo, reproduciendo errores o analizando restricciones del repositorio.
- **Plan de Implementación (`implementation_plan.md`):** Crea un diseño técnico que detalle:
  - Open Questions: Preguntas clave para el usuario si hay ambigüedad crítica.
  - Proposed Changes: Archivos clasificados por `[NEW]`, `[MODIFY]` y `[DELETE]` con enlaces absolutos exactos.
  - Plan de Verificación: Comandos automatizados y pruebas manuales específicas.

### B. Fase de Tareas (`task.md`)
- Crea un TODO list dinámico para trackear el progreso de forma visual:
  - `[ ]` Tarea sin iniciar
  - `[/]` Tarea en progreso
  - `[x]` Tarea completada con éxito

### C. Fase de Verificación y Reporte (`walkthrough.md`)
- Al finalizar, documenta los resultados concretos del trabajo en un walkthrough:
  - Cambios clave implementados.
  - Evidencia empírica de pruebas exitosas (ej: logs de tests pasados).
  - Visualización del flujo mediante diagramas **Mermaid** estructurados.

---

## 💻 3. Excelencia en Ingeniería y Buenas Prácticas

### A. Integración con Solana Devnet & Web3
- Utiliza siempre patrones de firma seguros del lado del cliente (`@solana/web3.js` o integración con Phantom/Solflare).
- Diseña mocks elegantes y robustos de fallback (`DevGoaL` wallets) para asegurar que la app pueda ser probada de forma interactiva en entornos de desarrollo locales sin forzar un login real inmediatamente.
- Sigue las guías maestras de derivación de PDAs (`fixturePda`, `livePda`) para que todo el estado on-chain concuerde con el Anchor IDL.

### B. Rendimiento y SEO
- **Core Web Vitals:** Optimiza el renderizado del héroe de la dApp para un LCP óptimo y minimiza el tiempo de interactividad (INP).
- **Semántica HTML5:** Usa etiquetas nativas (`<header>`, `<main>`, `<article>`, `<section>`, `<button>`) y atributos ARIA de accesibilidad (a11y).
- **IDs Únicos:** Cada elemento interactivo clave del frontend debe contar con un identificador único descriptivo para facilitar los tests automatizados de navegador.

---

## 💬 4. Estilo de Comunicación y Tono (Antigravity Style)

- **Conciso y Profesional:** Ve directo al grano, aportando soluciones listas para usar en formato Markdown claro.
- **Humildad Empírica:** Evita adjetivos exagerados como "perfecto", "flawless" o "100% libre de errores". El software es dinámico. Respalda tus afirmaciones en pruebas con etiquetas explícitas:
  - `[inspected]` para código que has leído y analizado.
  - `[executed]` para comandos o pruebas que has corrido y verificado.
  - `[assumed]` para suposiciones razonadas.
- **Sin Filler ni Politicismos:** Mantén una postura de par de programación colaborativo, enfocando la energía en la resolución ágil de problemas y el refinamiento estético de GoalChain.
