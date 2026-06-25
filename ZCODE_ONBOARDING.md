# 🤖 ZCode (GLM 5.2) Onboarding & Workspace Guide

Este documento sirve como la guía de inducción y mapa de ruta definitivo para que **ZCode (GLM 5.2)** asuma el control total y ejecute la mega-refactorización visual y organizativa de **GoalChain**.

---

## 📂 Mapa de Archivos Clave del Proyecto

Para tener control total de la estructura y estilo de GoalChain, debes leer y modificar archivos en dos grandes capas:

### 1. El Portal de Juego Transaccional (`goalchain_webapp/`)
Esta es la SPA interactiva de React + Vite + TypeScript.
*   **Punto de entrada:** [App.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/App.tsx) (Define rutas, layouts y lazy-loading).
*   **Maqueta/Chasis:** [PlayLayout.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/PlayLayout.tsx) y [PlayNav.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/PlayNav.tsx) (Cabeceras, menú lateral y navegación).
*   **Hoja de Estilo Principal:** [index.css](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/index.css) (Contiene los tokens de diseño, animaciones y clases de Glassmorphism).
*   **Paneles y Widgets Interactivos (`src/ui/`):**
    *   [AICommentator.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/AICommentator.tsx): Relator de IA en tiempo real ("Enzo Bit") con WebSpeech y WebGPU simulado.
    *   [TradingTerminal.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/TradingTerminal.tsx): Terminal con bots automatizados (*El Toro* y *El Oso*).
    *   [SwarmVaults.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/SwarmVaults.tsx): Bóvedas de inversión y gráficos SVG animados de distribución de fondos.
    *   [StakingBurnDashboard.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/StakingBurnDashboard.tsx): Panel DeFi de staking y quema de tokens.
    *   [ClubPortal.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/ClubPortal.tsx): Portal de gestión del equipo.
    *   [EstadioPortal.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/EstadioPortal.tsx): Interfaz de administración del estadio.
    *   [FixturesPanel.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/FixturesPanel.tsx) y [MatchSimulator.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/MatchSimulator.tsx): Simulación de partidos y feeds de eventos.

### 2. El Sitio Web de Marketing y Utilidades Clásicas (`docs/`)
Sitio de lectura y juegos interactivos construidos en HTML5, CSS vanilla y Vanilla JS.
*   **Landing Page Central:** [index.html](file:///c:/Users/NicoPez/goalchain/docs/index.html) (Contiene secciones clave: X-Scout, Portales de Héroe, Roadmaps).
*   **Estilo del Sitio:** [style.css](file:///c:/Users/NicoPez/goalchain/docs/assets/css/style.css) (Estilo glassmórfico general).
*   **Utilidades y Minijuegos Ocultos/Escondidos (`docs/assets/js/`):**
    *   [penalty_game.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/penalty_game.js): Minijuego interactivo de penales.
    *   [minigames_hub.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/minigames_hub.js): Hub unificado de minijuegos.
    *   [modifiers_simulator.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/modifiers_simulator.js): Simulador interactivo de atributos de jugadores.
    *   [pack_opener.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/pack_opener.js): Animación de apertura de sobres NFT.
    *   [ai_agent.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/ai_agent.js): Comportamiento interactivo de agentes de IA en el navegador.
    *   [lending_app.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/lending_app.js) y [drift_markets.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/drift_markets.js): Integraciones financieras simuladas.
    *   [burn_tracker.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/burn_tracker.js) y [economy_observability.js](file:///c:/Users/NicoPez/goalchain/docs/assets/js/economy_observability.js): Panel observador de quema y economía en tiempo real.

---

## 🏛️ Reglas Arquitectónicas Inalterables

1.  **Fuente Única de Verdad de la Economía:** Cualquier alteración del modelo de tokenomics debe reflejarse en `docs/ECONOMIC_CANONICAL_CONFIG.json`.
2.  **Fuente Única de Verdad de Jugadores:** El listado de 528 jugadores está en `docs/assets/data/players.json` y `ai_context/03_data/players.json`. Deben mantenerse 100% sincronizados.
3.  **Seguridad de Credenciales:** Nunca expongas o guardes claves, frases semilla, ni archivos `.env` en commits de Git.
4.  **Idioma:** Toda interfaz expuesta de cara al usuario en redes sociales o páginas de marketing principales debe estar en **inglés de forma predeterminada**, con soporte i18n bien implementado para traducción en español.

---

## 🤖 System Prompt Propuesto para ZCode (GLM 5.2)

> Puedes copiar y pegar el siguiente texto en la configuración del agente o del sistema en ZCode:

```markdown
You are the Lead Visual & UI/UX Engineer for GoalChain. You have full access to the workspace. Your mission is to implement a comprehensive visual and organizational refactoring of both the transactional React webapp (goalchain_webapp/) and the marketing pages (docs/).

Follow these rules for your refactoring:
1. DESIGN SYSTEM & GLASSMORPHISM: Apply a high-end, premium aesthetic. Use dark mode grids (#030307), glassmorphism cards (.glass-card with backdrop-filter, saturate, and thin semi-transparent white borders), and glowing neon accents (Solana Green #14f195, Solana Purple #9945ff). Use Outift/Plus Jakarta Sans typography.
2. ORGANIZATION: Connect and surface all features. Do not let old scripts, minigames (penalty shootouts, pack openers, simulators), or AI features (commentator Enzo Bit, vibe bots) stay hidden. Build intuitive navigation menus, submenus, sidebars, dashboard grids, and interactive modals/tooltips so the user can easily find and use them.
3. CODE INTEGRITY: Keep existing business logic, states, Solana web3 connectors, and React hooks intact. Only improve styling, layout structure, responsive grids, and presentation components.
4. COMPILATION VALIDATION: Always verify that typechecks and builds pass after your edits. Run 'npx tsc --noEmit' in goalchain_webapp/ to confirm no TypeScript compilation errors were introduced.
```

---

## 🚀 Plan de Trabajo para la Refactorización

Recomienda seguir este flujo de trabajo ordenado con ZCode:

### Fase 1: Auditoría e Inventario de Componentes
*   Pide a ZCode que mapee todos los minijuegos y utilidades de `docs/assets/js/` y evalúe cómo unificarlos con el Dashboard de `goalchain_webapp/`.

### Fase 2: Creación del Layout Global y Menús
*   Diseñar una barra de navegación (Header/Sidebar) unificada que sirva como "puerto de mando" para GoalChain Play, permitiendo saltar entre:
    *   **Inicio / Dashboard Hub**
    *   **Estadio & Simulador en vivo** (conectado a Enzo Bit)
    *   **DeFi Terminal** (Staking, Bóvedas, Vibe Trading, Burn Trackers)
    *   **Mi Club & Vestuario** (Galería de NFTs, Apertura de Sobres, Modificadores)
    *   **Minijuegos** (Penales, Simulador de Atributos)
    *   **Documentación & Guías**

### Fase 3: Unificación del Estilo CSS
*   Pulir `goalchain_webapp/src/index.css` y `docs/assets/css/style.css` para compartir los mismos colores de neón, gradientes en los textos y efectos de desenfoque de fondo.

### Fase 4: Integración en Modals e Interfaces Flotantes
*   Utilizar ventanas modales elegantes para los juegos rápidos (como el juego de penales o el pack opener) para que el usuario pueda jugarlos en cualquier momento sin abandonar el dashboard transaccional.
