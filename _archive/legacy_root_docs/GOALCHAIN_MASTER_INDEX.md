# 🏛️ GOALCHAIN MASTER INDEX (V9.0)

Este documento es la única fuente de verdad para el diseño y generación de la colección Genesis Squad.

## 🖼️ Master Assets (Files)
- **Frontend source folder:** [`/docs`](./docs)
- **Player registry in use:** [`/docs/assets/data/players.json`](./docs/assets/data/players.json)
- **NFT generation dataset:** [`/assets/data/nft_generation_data.json`](./assets/data/nft_generation_data.json)

> Nota: Se removieron rutas locales `file:///Users/...` no portables para mantener compatibilidad en GitHub y CI.

## 🏗️ Architectural Standards
- **System:** Layered Composition (Base Photo + Master Frame + CSS Tint + Dynamic Text).
- **Aspect Ratio:** 2:3 Vertical.
- **Rarity Colors (CSS):**
  - `Mythic`: Silver/White Glow.
  - `Legendary`: Gold Liquid Glow.
  - `Epic`: Purple Electric Neon.
  - `Rare`: Solana Green Glow.
  - `Common`: Matte Steel.

## 📝 Generation Guidelines
- **Prompt V9 (Realistic):** "Hyper-realistic 8k sports photography of [PHYSICAL_TRAITS]. 85mm lens, f/1.8, stadium background, deep bokeh, professional lighting. NO caricature, NO borders, NO logos."
- **Parody Names:** Always used in UI, never in IA prompt to avoid filters.

## 🔄 Dynamic Evolution
- Players can upgrade rarity via code. The `layer-frame` class `rarity-[LEVEL]` handles all visual shifts.
