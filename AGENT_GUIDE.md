# 🤖 GoalChain: AI Agent Master Instructions (V2.1)

Este documento es la fuente de verdad para cualquier IA que trabaje en GoalChain. **Prioridad Máxima sobre cualquier otro README.**

## 🎯 Visión Actual del Proyecto
GoalChain es un ecosistema de fútbol Web3 en Solana. Estamos en fase de pre-lanzamiento, centrados en la galería de NFTs dinámicos y el Pitch Deck para inversores.

## 📁 Reglas de Arquitectura (No romper)
1.  **Directorio de Trabajo:** El frontend principal es `/goalchain_web`. NO uses las carpetas dentro de `/_archive`.
2.  **Tecnología:** Usamos HTML5, Vanilla CSS (Glassmorphism) y Javascript nativo para el frontend. No instalar frameworks pesados sin autorización.
3.  **Fuentes de Datos:**
    *   `goalchain_web/assets/data/players.json`: Es la base de datos maestra.
    *   `goalchain_web/assets/data/metadata/*.json`: Archivos para el minting en Solana.
4.  **Backend:** El backend oficial es `goalchain_api`. Usa este directorio para cualquier lógica que requiera conexión con el Smart Contract de Solana.

## 💎 Identidad Visual y Assets
*   **Estética:** Dark Mode, Glassmorphism, Colores Solana (#14f195, #9945ff).
*   **Cromos:** Siempre deben ser 3D e interactivos (clic para girar).
*   **Banderas:** Cada jugador debe mostrar su bandera usando el `FLAG_MAP` definido en `nft_registry.js`.
*   **Jugadores:** Usar nombres parodiados (Crypto-parody) para evitar problemas legales.

## 📈 Lógica Económica (Knowledge)
*   Lee [TOKENOMICS.md](./TOKENOMICS.md) antes de proponer cambios en rarezas o recompensas.
*   GoalChain usa un sistema de **Contrato Profesional**: Los dueños de NFTs ganan sueldos según el desempeño real.

## 🛠️ Flujo de Desarrollo
1.  Antes de codificar, revisa el [REPO_MAP.md](./REPO_MAP.md) para entender dónde va cada pieza.
2.  **Sincronización Continua (Mandatorio):** Cada vez que realices un cambio en archivos de la página web (`goalchain_web`), debes realizar automáticamente un `git push` al finalizar el turno para que el usuario pueda ver los cambios en vivo inmediatamente.
3.  Si generas imágenes o assets, coordina con **Lucas** (vía Git) para no sobreescribir su trabajo de arte.


---
**Última actualización:** 13 de Mayo, 2026
