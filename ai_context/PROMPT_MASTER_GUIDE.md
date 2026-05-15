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
4. **Referencias Visuales:** Carpeta `ai_context/references/`.
    *   **Estadios:** Ver `GCH_STADIUM_DIAMOND_render.png` y `GCH_STADIUM_GOLD_render.png`.
    *   **Marco Maestro:** Ver `chassis_v13_clean.png`.
    *   **Logo Oficial:** Ver `logo.png`.

---

## 🛠️ Estructura del Prompt para L2 (Jugador Aislado)
Cuando generes la capa L2 para un jugador, usa esta estructura:

```text
[Ultra-detailed physical description of real-life player facial features and hair]::2 Isolated professional sports photography of [PLAYER_NAME], wearing [COUNTRY] national team kit (no logos, no brands). Pose: [EPIC_POSE]. Hyper-realistic skin textures, sweat drops, natural hair, focused gaze. Lighting: Dramatic rim light with neon purple (#9945ff) and neon green (#14f195) accents. [TECHNICAL]: Captured on 85mm lens, f/1.8, high speed sync flash, 8k resolution, sharp detail, extreme realism, zero caricature, pure transparent background --ar 2:3 --v 6
```

## 🎯 Técnica de Parecido (Likeness)
Para que el jugador sea una copia idéntica del real:
1.  **Anatomía Facial**: Grok debe buscar y añadir rasgos únicos (ej: "Strong square jawline", "Prominent nose", "Intense brown eyes", "Specific fade haircut").
2.  **Pesos (Weighting)**: Usa `::2` al final de la descripción física para darle prioridad sobre el estilo.
3.  **Referencia de Personaje**: Si el usuario provee una imagen, usa el parámetro `--cref [URL]` al final del prompt.

## 📏 Composición y Encuadre
*   **Referencia:** Ver `references/chassis_v13_clean.png`.
*   **Regla:** El jugador debe estar centrado. El zoom debe ser suficiente para que el cuerpo (generalmente de la cintura para arriba) llene el rectángulo central del marco v13, dejando espacio para que la cabeza no toque el borde superior.

## 🚫 Negative Prompt Obligatorio
`Negative: 3D render, video game character, unreal engine, octane render, caricature, cartoon, drawing, painting, illustration, deformed face, extra fingers, messy hair, text, logos, sponsors, stadium background, grass, ball (unless specified), out of focus player, low resolution, artistic filters.`
