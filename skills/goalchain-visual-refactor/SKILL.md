---
name: goalchain-visual-refactor
version: 1.0.0
description: |
  Ejecuta la refactorización visual masiva y reorganización del ecosistema GoalChain. 
  Asegura el uso de Glassmorphism Premium, consistencia de colores de neón (Solana green/purple) 
  y la interconexión de todas las utilidades clásicas ocultas (penales, simuladores, bots) 
  dentro del Dashboard transaccional.
triggers:
  - "refactor visual"
  - "mega refactoring"
  - "organizar sitio web"
  - "mejorar diseño"
  - "glassmorphism"
tools:
  - view_file
  - write_to_file
  - replace_file_content
  - list_dir
  - run_command
mutating: true
---

# Skill: GoalChain Visual Refactor

Esta skill entrena y guía al agente para realizar la renovación estética y la reorganización de GoalChain.

## Criterios de Diseño (Non-Negotiables)
1. **Glassmorphism Premium:**
   - Usar `.glass-card` con `backdrop-filter: blur(16px) saturate(180%)`.
   - Bordes semi-transparentes suaves: `border: 1px solid rgba(255, 255, 255, 0.05)`.
   - Transiciones suaves y transformaciones en hover (`transform: translateY(-2px)`).
2. **Esquema de Colores (Solana Neon):**
   - Verde Neón: `#14f195` (Para acciones positivas, botones de éxito, goles, depósitos).
   - Púrpura Neón: `#9945ff` (Para branding secundario, staking, transacciones, DeFi).
   - Rojo Neón: `#ff4b4b` (Para cancelaciones, retiros, alertas).
   - Fondo: `#030307` con gradientes radiales oscuros y texturas de rejilla muy sutiles.
3. **Tipografía:**
   - Primaria: `Outfit`, `Plus Jakarta Sans`, sans-serif.

## Mapeo del Proyecto y Rutas de Control
*   **Transactional UI (React):**
    - Layout & Router: `goalchain_webapp/src/ui/App.tsx` y `PlayLayout.tsx`
    - Estilos Base: `goalchain_webapp/src/index.css`
    - Enzo Bit (AI Commentator): `goalchain_webapp/src/ui/AICommentator.tsx`
    - Vibe Trading Bots: `goalchain_webapp/src/ui/TradingTerminal.tsx`
    - Swarm Vaults: `goalchain_webapp/src/ui/SwarmVaults.tsx`
    - Staking Dashboard: `goalchain_webapp/src/ui/StakingBurnDashboard.tsx`
*   **Marketing & Retro Games (HTML/JS):**
    - Main Page: `docs/index.html`
    - Estilos Marketing: `docs/assets/css/style.css`
    - Juego de Penales: `docs/assets/js/penalty_game.js`
    - Simulador de Atributos: `docs/assets/js/modifiers_simulator.js`
    - Pack Opener: `docs/assets/js/pack_opener.js`

## Plan de Ejecución Guiado
1.  **Lectura:** Analizar `goalchain_webapp/src/ui/PlayNav.tsx` y `App.tsx` para comprender la barra de navegación y las rutas del sitio.
2.  **Plan de Menús:** Crear una propuesta de menús unificada que incluya secciones para:
    *   Dashboard transaccional.
    *   Terminal DeFi.
    *   Área de Minijuegos (Penales, Simuladores).
    *   Guías y Manuales.
3.  **Integración de Scripts Clásicos:** Adaptar los minijuegos de `docs/assets/js/` para que puedan renderizarse en modales de React elegantes o páginas dedicadas sin romper sus scripts vanilla.
4.  **Validación de Compilación:** Correr `npx tsc --noEmit` en `goalchain_webapp/` después de cada cambio para garantizar que no existan errores de tipado de TypeScript.
