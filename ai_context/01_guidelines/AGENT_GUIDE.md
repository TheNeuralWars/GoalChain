# 🤖 GoalChain: AI Agent Master Instructions (V3.0 - Phase 4)

Este documento es la fuente de verdad absoluta para cualquier IA que trabaje en GoalChain. **Prioridad Máxima sobre cualquier otro README.**

## 🎯 Visión Actual del Proyecto (Fase 4: Devnet y On-Chain Integrations)
GoalChain es un ecosistema de fútbol Web3 en Solana. Hemos completado la base visual y ahora nos encontramos en la **Fase 4: Integraciones en Devnet y Oráculos de Torneos**.
Nuestra prioridad actual es dotar a la dApp de interactividad real mediante firmas de transacciones en Solana Devnet y paneles de torneos impulsados por oráculos on-chain.

### 🚨 REGLA DE ORO DE DESPLIEGUE (OBLIGATORIA)
- **Sincronización y Purga Total Inmediata**: CADA VEZ que se modifique cualquier archivo en `/docs` o documentos estratégicos, el AGENTE debe realizar un `git push` automáticamente y seguidamente ejecutar la purga de caché de Cloudflare corriendo `python3 scratch/cloudflare_manager.py`.
- **Propósito**: Garantizar que `goalchain.fun` sea siempre un reflejo exacto y en tiempo real del trabajo realizado, sin demoras de caché. **NO terminar una tarea web sin hacer push y purgar la caché.**

### 🌐 Frontend & Deployment (/docs)
- **Source of Truth**: La carpeta `/docs` es la ÚNICA fuente para el frontend.
1.  **Directorio de Trabajo:** El frontend principal es `/docs`. NO uses carpetas obsoletas o archivos fuera de esta ruta para la web.
2.  **Tecnología:** Usamos HTML5, Vanilla CSS (Glassmorphism) y Javascript nativo para el frontend. No instalar frameworks pesados sin autorización.
3.  **Fuentes de Datos:**
    *   `docs/assets/data/players.json`: Es la base de datos maestra de jugadores (528 reales rebalanceados).
    *   `docs/assets/data/metadata/*.json`: Archivos para el minting en Solana.

---

## 🛠️ Herramientas y Custom Skills (Antigravity Plugins)
Hemos integrado en la configuración global de la IA (`/Users/NicoPez/.gemini/config/plugins/goalchain-plugin/`) tres habilidades personalizadas nativas para Antigravity. La IA **DEBE** invocar y basarse en estas habilidades para cualquier tarea relacionada:

1.  **`solana-web3-integration`**:
    *   *Propósito:* Reglas para firmas de transacciones en Devnet, derivación de PDAs (`fixturePda`, `livePda`), integraciones con Anchor IDLs, y lógica de mock fallbacks (`DevGoaL` wallets).
2.  **`responsive-glassmorphism`**:
    *   *Propósito:* Guías de responsive design para adaptar la dApp a PC, Tablet y Mobile. Optimización de rendimiento de animaciones (LCP, INP, GPU Rasterization) y diseño de efectos de Glassmorphism premium.
3.  **`client-side-ai-ml`**:
    *   *Propósito:* Patrones de integración de modelos de IA locales y en navegador (WebGPU, WASM, Web Workers, IndexedDB weight caching) para commentary de partidos y simulación de tácticas locales.

---

## 🔑 APIs, Tokens y Credenciales Integradas
Para cualquier tarea que involucre integraciones externas, el Agente debe saber que todas las APIs y tokens están pre-configurados localmente y listos para usar. **Prohibido volver a solicitar credenciales al usuario.**
*   **Discord, X (Twitter), y x.AI (Grok):** Todos los tokens están configurados en el archivo `.env` del directorio raíz del proyecto (`/Users/NicoPez/GoalChain/.env`).
*   **Cloudflare (goalchain.fun):** Configurado directamente en `/Users/NicoPez/GoalChain/scratch/cloudflare_manager.py` (ACCOUNT_ID, ZONE_ID, API_TOKEN). Para purgar la caché, ejecutar `python3 scratch/cloudflare_manager.py`.

---

## 💎 Identidad Visual y Assets
*   **Estética:** Dark Mode, Glassmorphism premium, Colores Solana (#14f195, #9945ff), destellos dorados y de neón.
*   **Cromos:** Siempre deben ser 3D e interactivos (clic para girar).
*   **Banderas:** Cada jugador debe mostrar su bandera usando el `FLAG_MAP` definido en `nft_registry.js`.
*   **Jugadores:** Usar nombres parodiados (Crypto-parody, ej: *Lionel Satoshi*) para evitar problemas legales.

## 🖼️ Generación de Imágenes (Master Guidelines)
*   **Single Source of Truth (Nombres):** Usa exclusivamente `docs/assets/data/players.json`.
*   **Prompts Base:** Usa los archivos JSON en `ai_context/` (ej: `nft_master_prompts_*.json`).
*   **Estilo Visual Obligatorio:** "Professional Sports Photography Style" detallado en el skill `GROK_IMAGE_GENERATOR_SKILL.md`.

## 📈 Lógica Económica
*   GoalChain usa un sistema de **Contrato Profesional**: Los dueños de NFTs ganan sueldos según el desempeño real.
*   Toda venta de NFT se deposita en Liquid Staking (JitoSOL/mSOL) para alimentar la recompra mecánica de $GCH.

## 🛠️ Flujo de Desarrollo
1.  Antes de codificar, revisa el [REPO_MAP.md](./REPO_MAP.md) para entender dónde va cada pieza.
2.  **Sincronización Continua (Mandatorio):** Realizar `git push` al finalizar cualquier cambio en archivos de la página web, seguido de la purga de caché con `python3 scratch/cloudflare_manager.py`.
3.  Si realizas cambios en la estructura de datos (`players.json`), replica los cambios tanto en `docs/assets/data/players.json` como en `ai_context/03_data/players.json`.

---

**Última actualización:** 19 de Mayo, 2026 (Transición a Fase 4, Integración de Skills de Antigravity, Despliegue en Devnet, y Purga de Caché Automatizada con Cloudflare)
