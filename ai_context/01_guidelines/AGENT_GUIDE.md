# 🤖 GoalChain: AI Agent Master Instructions (V2.1)

Este documento es la fuente de verdad para cualquier IA que trabaje en GoalChain. **Prioridad Máxima sobre cualquier otro README.**

## 🎯 Visión Actual del Proyecto
GoalChain es un ecosistema de fútbol Web3 en Solana. Estamos en fase de pre-lanzamiento, centrados en la galería de NFTs dinámicos y el Pitch Deck para inversores.

### 🚨 REGLA DE ORO DE DESPLIEGUE (OBLIGATORIA)
- **Sincronización Total Inmediata**: CADA VEZ que se modifique cualquier archivo en `/docs` o documentos estratégicos, el AGENTE debe realizar un `git push` automáticamente.
- **Propósito**: Garantizar que `goalchain.fun` sea siempre un reflejo exacto del trabajo realizado en tiempo real. **NO terminar una tarea web sin hacer push.**

### 🌐 Frontend & Deployment (/docs)
- **Source of Truth**: La carpeta `/docs` es la ÚNICA fuente para el frontend.
1.  **Directorio de Trabajo:** El frontend principal es `/docs`. NO uses carpetas obsoletas o archivos fuera de esta ruta para la web.
2.  **Tecnología:** Usamos HTML5, Vanilla CSS (Glassmorphism) y Javascript nativo para el frontend. No instalar frameworks pesados sin autorización.
3.  **Fuentes de Datos:**
    *   `docs/assets/data/players.json`: Es la base de datos maestra.
    *   `docs/assets/data/metadata/*.json`: Archivos para el minting en Solana.
4.  **Backend:** El backend oficial es `goalchain_api`. Usa este directorio para cualquier lógica que requiera conexión con el Smart Contract de Solana.

## 💎 Identidad Visual y Assets
*   **Estética:** Dark Mode, Glassmorphism, Colores Solana (#14f195, #9945ff).
*   **Cromos:** Siempre deben ser 3D e interactivos (clic para girar).
*   **Banderas:** Cada jugador debe mostrar su bandera usando el `FLAG_MAP` definido en `nft_registry.js`.
*   **Jugadores:** Usar nombres parodiados (Crypto-parody) para evitar problemas legales.

## 🖼️ Generación de Imágenes (Master Guidelines)
*   **Single Source of Truth (Nombres):** Usa exclusivamente `docs/assets/data/players.json`. El nombre oficial de Messi es **Lionel Satoshi** (NO Lionel Bitcoin).
*   **Single Source of Truth (Prompts):** Usa `assets/data/nft_master_prompts_100.json`.
*   **Estilo Visual Obligatorio:** "Professional Sports Photography Style". 
    *   **NO** usar términos que induzcan a look de videojuego (ej: "3D", "Unreal Engine", "Octane Render") a menos que sea para iluminación.
    *   **SÍ** usar términos de fotografía real: "85mm lens", "f/1.8", "high speed sync", "8k resolution", "ultra-detailed skin texture", "hyper-realistic sports photography".
    *   **Zero Caricature:** Prohibido cualquier rasgo de caricatura o deformación. Los rostros deben ser 100% realistas y fotográficos.
*   **Capa L2 (Player Layer):** Solo la figura del jugador, fondo eliminado (alpha channel), pose épica según el prompt maestro.

## 📈 Lógica Económica (Knowledge)
*   Lee [TOKENOMICS.md](./TOKENOMICS.md) antes de proponer cambios en rarezas o recompensas.
*   GoalChain usa un sistema de **Contrato Profesional**: Los dueños de NFTs ganan sueldos según el desempeño real.

## 🛠️ Flujo de Desarrollo
1.  Antes de codificar, revisa el [REPO_MAP.md](./REPO_MAP.md) para entender dónde va cada pieza.
2.  **Sincronización Continua (Mandatorio):** Cada vez que realices un cambio en archivos de la página web (`goalchain_web`), debes realizar automáticamente un `git push` al finalizar el turno para que el usuario pueda ver los cambios en vivo inmediatamente.
3.  Si generas imágenes o assets, coordina con **Lucas** (vía Git) para no sobreescribir su trabajo de arte.


---

## 📂 Estructura de Contexto Crítico (`ai_context/`)
Este directorio contiene copias de seguridad de la "Fuente de Verdad" para ser leídas por Grok:
*   `players.json`: Base de datos maestra de jugadores.
*   `PROMPT_MASTER_GUIDE.md`: Instrucciones estéticas definitivas.
*   `GROK_BOOTSTRAP.md`: Mensaje de activación de sesión para el usuario.
*   `GROK_PROJECT_SETTINGS.md`: Instrucciones del sistema para el proyecto Grok.
*   `references/`: Imágenes de referencia (estadios, marcos, logos).

## 🛠️ Protocolo de Sincronización
Cualquier cambio en la lógica de nombres, stats o estilo visual debe ser replicado en `ai_context/` antes de finalizar la sesión. El agente debe verificar que `players.json` coincida con `docs/assets/data/players.json`.

**Última actualización:** 15 de Mayo, 2026 (Refuerzo de Parecido Físico y Contexto Grok)
