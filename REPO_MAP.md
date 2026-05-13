# 🗺️ GoalChain Repository Map

Este documento sirve como guía maestra para desarrolladores y agentes de IA. Aquí se detalla la utilidad de cada carpeta y archivo vital del proyecto.

---

## 🚀 Aplicaciones Principales (Production)

### [/goalchain_web](file:///Users/NicoPez/GoalChain/goalchain_web)
**Estado:** Activo (Main Frontend)
*   **Propósito:** Es el sitio web principal de GoalChain.
*   **Tecnología:** HTML, Vanilla CSS, Javascript.
*   **Características:** Galería 3D de NFTs, apertura de sobres, filtros avanzados, visor de Pitch Deck.
*   **Archivo clave:** `assets/js/nft_registry.js` (Lógica de los cromos).

### [/goalchain_hub](file:///Users/NicoPez/GoalChain/goalchain_hub)
**Estado:** Activo (Internal Tool)
*   **Propósito:** Portal de desarrollo interno para el equipo (Nico, Lucas y hermanos).
*   **Uso:** Seguimiento de hitos (Roadmap) y coordinación diaria.

---

## ⚙️ Infraestructura y Backend

### [/goalchain_api](file:///Users/NicoPez/GoalChain/goalchain_api)
**Estado:** Activo (Backend Bridge)
*   **Propósito:** API en Node.js que conecta la web con la blockchain de Solana.
*   **Función:** Lee los partidos (fixtures) y mercados de apuestas directamente del Smart Contract usando Anchor IDL.

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

### [/docs](file:///Users/NicoPez/GoalChain/docs)
*   Contiene la documentación histórica y guías de estilo.
*   **Subcarpeta `/archive`**: Documentos obsoletos o de brainstorming inicial.

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
