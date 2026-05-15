# 📸 GoalChain: Master Image Generation Guide (L2 Player Layer)

Este documento es la instrucción definitiva para la generación de la capa **L2 (Jugador)** de los cromos de GoalChain. Grok debe priorizar este documento sobre cualquier otro para temas estéticos.

## 🎯 Objetivo: Realismo Fotográfico Absoluto
Buscamos un estilo de **Fotografía Deportiva Profesional**, no de videojuego o render 3D. 

### ✅ SÍ: Atributos de Fotografía Real
- **Lente:** 85mm or 105mm (Prime lenses).
- **Apertura:** f/2.8 (Deep bokeh, blurred background).
- **Iluminación:** High-speed sync (HSS) flash, dramatic side lighting.
- **Textura:** Poros de la piel visibles, sudor realista.
- **Calidad:** 8k resolution, raw photo, extreme realism.

---

## 📂 Jerarquía de Archivos (Source of Truth)
1. **Nombres de Jugadores:** `docs/assets/data/players.json`.
2. **Prompts Base:** `assets/data/nft_master_prompts_100.json`.
3. **Referencias Visuales:** Carpeta `ai_context/references/`.

---

## 🔍 Paso 0: Protocolo de Búsqueda Obligatorio
Antes de generar cualquier prompt, Grok DEBE:
1.  **Buscar en X (Twitter) y Web**: "Latest photos of [REAL_PLAYER_NAME] 2024/2026".
2.  **Analizar**: Peinado actual, vello facial, rasgos únicos y complexión física.
3.  **Sintetizar**: Incluir esos hallazgos en la descripción física del prompt.

## 🛠️ Estructura del Prompt para L2 (Jugador Aislado - FULL BODY)
Usa esta estructura para garantizar cuerpo completo y fondo limpio:

```text
[Ultra-detailed physical description from real-life search results]::3 Full length action shot, full body visible from head to toe, [PLAYER_NAME] standing in epic football pose, wearing [COUNTRY] national team kit (no logos, no brands). Hyper-realistic skin textures, sweat, natural hair. [BACKGROUND]: High-key studio photography, shot on pure solid #FFFFFF white background, no floor, no shadows, no grass. [TECHNICAL]: 85mm lens, f/2.8, sharp focus, 8k resolution, extreme realism, zero caricature, professionally isolated --ar 2:3 --v 6
```

## 🎯 Técnica de Parecido (Likeness) y Pesos
1.  **Pesos Pro**: Usa `::3` para la descripción física del jugador para que domine sobre el resto del prompt.
2.  **Cuerpo Completo**: Incluir siempre "Head to toe visible" y "Full length shot" para evitar que la IA haga zoom en la cara.

## 📏 Composición para el Marco v13
*   **Zoom**: El jugador debe ocupar el 85% de la altura de la imagen.
*   **Fondo**: DEBE ser blanco sólido (#FFFFFF). Si el fondo tiene color, el prompt ha fallado.

## 🚫 Negative Prompt Reforzado
`Negative: headshot, portrait, close-up, cropped legs, cut off feet, colored background, grey background, gradient background, stadium, grass, ball, shadows on floor, 3D render, cartoon, caricature, low quality, blurred body.`
