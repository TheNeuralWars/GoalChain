# 🗺️ GoalChain Repository Map

Este documento sirve como guía maestra para desarrolladores y agentes de IA. Aquí se detalla la utilidad de cada carpeta y archivo vital del proyecto.

---

## 🧭 Política de Organización (Source of Truth)

- **Frontend de producción:** [`/docs`](./docs)
- **Smart contract:** [`/goalchain_program`](./goalchain_program)
- **SDK:** [`/goalchain-sdk`](./goalchain-sdk)
- **Backend API:** [`/goalchain_api`](./goalchain_api)
- **Oracle / sincronización:** [`/goalchain_oracle`](./goalchain_oracle)
- **Histórico / legado:** [`/_archive`](./_archive)

### Canonicalidad de documentación estratégica

Para evitar drift, la versión canónica de documentos estratégicos vive en la **raíz** del repositorio.

- Canónicos en raíz: `GOALCHAIN_PITCH_DECK.md`, `TOKENOMICS.md`, `ECONOMIC_BLUEPRINT.md`, `NFT_PROMPTS.md`, `NFT_STYLE_GUIDE.md`, `PLAYERS_LIST.md`
- Copias en `/docs` se tratan como material de publicación web y deben sincronizarse explícitamente.

### Política de versionado (tooling JS/TS)

- Se alinea `@coral-xyz/anchor` en módulos JS/TS activos (`goalchain_api`, `goalchain-sdk`, `goalchain_oracle`) a la rama `0.30.x` para evitar incompatibilidades de tipos y runtime entre SDK/API/Oracle.

---

## 🚀 Aplicaciones Principales (Production)

### [`/docs`](./docs)
**Estado:** Activo (Production & Development)
*   **Propósito:** Es el sitio web principal de GoalChain (goalchain.fun).
*   **Tecnología:** HTML, Vanilla CSS, Javascript.
*   **Características:** Galería 3D de NFTs, apertura de sobres, visor de Pitch Deck, juego de penaltis.
*   **Archivo clave:** `assets/js/nft_registry.js` (Lógica de los cromos).

### [`/goalchain_hub`](./goalchain_hub)
**Estado:** Activo (Internal Tool)
*   **Propósito:** Portal de desarrollo interno para el equipo.

---

## ⚙️ Infraestructura y Backend

### [`/goalchain_api`](./goalchain_api)
**Estado:** Activo (Backend Bridge)
*   **Propósito:** API en Node.js que conecta la web con la blockchain de Solana.

### [`/goalchain_program`](./goalchain_program)
**Estado:** Activo (Smart Contract)
*   **Propósito:** El corazón de GoalChain en la blockchain.
*   **Tecnología:** Rust / Anchor Framework.
*   **Función:** Lógica de apuestas, minteo de NFTs y distribución de premios.

### [`/goalchain_oracle`](./goalchain_oracle)
**Estado:** Activo (Data Sync)
*   **Propósito:** Scripts para sincronizar datos reales del Mundial con la blockchain y los metadatos de los NFTs.

### [`/goalchain-sdk`](./goalchain-sdk)
**Estado:** Vital (SDK)
*   **Propósito:** Contiene las definiciones (IDL) y conectores necesarios para que las apps hablen con el Smart Contract.

---

## 🎨 Activos y Documentos

### [`/scratch`](./scratch)
*   Scripts temporales y de prueba para generación de datos.

---

## 📁 Archivos de Raíz (Clave)
*   [GOALCHAIN_PITCH_DECK.md](./GOALCHAIN_PITCH_DECK.md): Presentación oficial para inversores (Bilingüe).
*   [TOKENOMICS.md](./TOKENOMICS.md): Definición económica del token $GCH y rarezas de NFTs.
*   [ECONOMIC_BLUEPRINT.md](./ECONOMIC_BLUEPRINT.md): Detalles del modelo de negocio.
*   [REPO_MAP.md](./REPO_MAP.md): Este archivo.

---

## 📦 Archivo Histórico
*   **[`/_archive`](./_archive)**: Contiene experimentos antiguos con React, Tailwind y versiones obsoletas del backend. No tocar a menos que se quiera migrar la arquitectura.

---
**Actualizado:** 14 de mayo, 2026
