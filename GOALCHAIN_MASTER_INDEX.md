# 🏛️ GOALCHAIN MASTER INDEX (V9.0)

Este documento es la única fuente de verdad para el diseño y generación de la colección Genesis Squad.

## 🖼️ Master Assets (Files)
- **Master Frame:** [master_frame_v9.png](file:///Users/NicoPez/GoalChain/goalchain_web/assets/img/templates/master_frame_v9.png)
- **Master Logo:** [logo_master.png](file:///Users/NicoPez/GoalChain/goalchain_web/assets/img/logo_master.png)
- **Physical Registry:** [nft_master_prompts_100.json](file:///Users/NicoPez/GoalChain/assets/data/nft_master_prompts_100.json)

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
