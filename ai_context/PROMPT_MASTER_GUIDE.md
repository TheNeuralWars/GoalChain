# 📸 GoalChain: Master Image Generation Guide (L2 Player Layer)

Este documento es la instrucción definitiva para la generación de la capa **L2 (Jugador)** de los cromos de GoalChain. Grok debe priorizar este documento sobre cualquier otro para temas estéticos.

## 🎯 Objetivo: Realismo Fotográfico Absoluto
Buscamos un estilo de **Fotografía Deportiva Profesional**, no de videojuego o render 3D. 

### ✅ SÍ: Atributos de Fotografía Real
- **Lente:** 85mm or 105mm (Prime lenses).
- **Apertura:** f/1.8 or f/2.8 (Deep bokeh, blurred background).
- **Iluminación:** High-speed sync (HSS) flash, dramatic side lighting, rim lighting in Solana colors (#14f195 / #9945ff).
- **Textura:** Poros de la piel visibles, sudor realista, pliegues naturales en la tela del jersey.
- **Calidad:** 8k resolution, raw photo, highly detailed, sharp focus on eyes.

### ❌ NO: Estilos Prohibidos (Videojuego/CG)
- **NO** usar: "Unreal Engine", "Octane Render", "3D Model", "Unity", "CGI", "Pixar style".
- **NO** usar: "Caricature", "Cartoon", "Comic", "Artistic".
- **NO** usar: "Low poly", "Stylized".

---

## 📂 Jerarquía de Archivos (Source of Truth)
1. **Nombres de Jugadores:** `docs/assets/data/players.json` (Ej: Lionel Satoshi).
2. **Prompts Base:** `assets/data/nft_master_prompts_100.json`.
3. **Estilo General:** `NFT_STYLE_GUIDE.md`.

---

## 🛠️ Estructura del Prompt para L2 (Jugador Aislado)
Cuando generes la capa L2 para un jugador, usa esta estructura:

```text
Isolated professional sports photography of [PLAYER_DESCRIPTION], wearing [COUNTRY] national team kit (no logos, no brands). Pose: [EPIC_POSE]. Hyper-realistic skin textures, sweat drops, natural hair, focused gaze. Lighting: Dramatic rim light with neon purple (#9945ff) and neon green (#14f195) accents. Captured on 85mm lens, f/1.8, high speed sync flash, 8k resolution, sharp detail, extreme realism, zero caricature, pure transparent background --ar 2:3 --v 6
```

## 🚫 Negative Prompt Obligatorio
`Negative: 3D render, video game character, unreal engine, octane render, caricature, cartoon, drawing, painting, illustration, deformed face, extra fingers, messy hair, text, logos, sponsors, stadium background, grass, ball (unless specified), out of focus player, low resolution, artistic filters.`
