# 🏛️ GoalChain NFT Creation Framework

Este documento define el proceso industrial para la generación, ensamblaje y despliegue de los 1,248 NFTs de la Genesis Squad.

## 🔄 El Pipeline de Producción

| Fase | Nombre | Descripción | Output |
| :--- | :--- | :--- | :--- |
| **01** | **Data Ingestion** | Extracción de stats reales vía Oráculo. | `players_stats.json` |
| **02** | **Asset Generation** | Creación de figuras de jugadores (PNG transparentes). | `player_assets/` |
| **03** | **Layered Assembly** | Combinación de las 5 capas (Fondo, Jugador, Marco V13, Logos, Stats). | `final_renders/` |
| **04** | **Solana Minting** | Despliegue masivo usando State Compression (cNFTs). | `mint_receipts.json` |
| **05** | **Dynamic Update** | Actualización de metadatos según el rendimiento real. | `metadata_updates/` |

## 📁 Documentación Detallada (Archivos de Referencia)

1. **[ART_PIPELINE.md](file:///Users/NicoPez/GoalChain/docs/ART_PIPELINE.md):** Guía de diseño, dimensiones y orden de capas.
2. **[DATA_ORACLE_GUIDE.md](file:///Users/NicoPez/GoalChain/docs/DATA_ORACLE_GUIDE.md):** Protocolo de captura de estadísticas y mapeo de atributos.
3. **[MINTING_STRATEGY.md](file:///Users/NicoPez/GoalChain/docs/MINTING_STRATEGY.md):** Detalles técnicos del despliegue en Solana.
4. **[METADATA_SPEC.md](file:///Users/NicoPez/GoalChain/docs/METADATA_SPEC.md):** Definición de rasgos (traits) y URI dinámico.

---
*Este framework asegura que cada uno de los 1,248 NFTs mantenga el estándar de calidad V14.0.*
