# 🗺️ GoalChain Repository Map

Este documento sirve como guía maestra para desarrolladores y agentes de IA. Aquí se detalla la utilidad de cada carpeta y archivo vital del proyecto.

---

## 🚀 Aplicaciones Principales (Production)

### [/docs](file:///Users/NicoPez/GoalChain/docs)
**Estado:** Activo (Production & Development)
*   **Propósito:** Es el sitio web principal de GoalChain (goalchain.fun).
*   **Tecnología:** HTML, Vanilla CSS, Javascript.
*   **Características:** Galería 3D de NFTs, apertura de sobres, visor de Pitch Deck, juego de penaltis.
*   **Archivo clave:** `assets/js/nft_registry.js` (Lógica de los cromos).

### [/goalchain_hub](file:///Users/NicoPez/GoalChain/goalchain_hub)
**Estado:** Activo (Internal Tool)
*   **Propósito:** Portal de desarrollo interno para el equipo.

---

## ⚙️ Infraestructura y Backend

### [/goalchain_api](file:///Users/NicoPez/GoalChain/goalchain_api)
**Estado:** Activo (Backend Bridge)
*   **Propósito:** API en Node.js que conecta la web con la blockchain de Solana.

### [/goalchain_program](file:///Users/NicoPez/GoalChain/goalchain_program)
**Estado:** Activo (Smart Contract)
*   **Propósito:** El corazón de GoalChain en la blockchain.
*   **Tecnología:** Rust / Anchor Framework.
*   **Función:** Lógica de apuestas, minteo de NFTs y distribución de premios.

### [/goalchain_oracle](file:///Users/NicoPez/GoalChain/goalchain_oracle)
**Estado:** Activo (Data Sync)
*   **Propósito:** Scripts para sincronizar datos reales del Mundial con la blockchain y los metadatos de los NFTs.

### [/goalchain-sdk](file:///Users/NicoPez/GoalChain/goalchain-sdk)
**Estado:** Vital (SDK)
*   **Propósito:** Contiene las definiciones (IDL) y conectores necesarios para que las apps hablen con el Smart Contract.

---

## 🎨 Activos y Documentos

### [/scratch](file:///Users/NicoPez/GoalChain/scratch)
*   Scripts temporales y de prueba para generación de datos.

---

## 📁 Archivos de Raíz (Clave)
*   [GOALCHAIN_PITCH_DECK.md](file:///Users/NicoPez/GoalChain/GOALCHAIN_PITCH_DECK.md): Presentación oficial para inversores (Bilingüe).
*   [TOKENOMICS.md](file:///Users/NicoPez/GoalChain/TOKENOMICS.md): Definición económica del token $GCH y rarezas de NFTs.
*   [ECONOMIC_BLUEPRINT.md](file:///Users/NicoPez/GoalChain/ECONOMIC_BLUEPRINT.md): Detalles del modelo de negocio.
*   [REPO_MAP.md](file:///Users/NicoPez/GoalChain/REPO_MAP.md): Este archivo.

---

## 📦 Archivo Histórico
*   **[/_archive](file:///Users/NicoPez/GoalChain/_archive)**: Contiene experimentos antiguos con React, Tailwind y versiones obsoletas del backend. No tocar a menos que se quiera migrar la arquitectura.

---
**Actualizado:** 13 de mayo, 2026
