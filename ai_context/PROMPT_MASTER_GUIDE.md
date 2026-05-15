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
Usa esta estructura para garantizar cuerpo completo, fondo **INEXISTENTE** y cero logos:

```text
[Ultra-detailed physical description from real-life search results]::3 Full length action shot, head to toe visible, [PLAYER_NAME] standing in epic football pose. [KIT]: Minimalist unbranded [COUNTRY] kit, plain colors, NO logos. [BACKGROUND]: High-key studio photography, shot on PURE SOLID #FFFFFF WHITE BACKGROUND, NO shadows, NO floor, NO gradients, NO grey. The background must be a perfect flat white canvas. [TECHNICAL]: 85mm lens, f/2.8, extreme realism, zero caricature, professionally isolated, 8k resolution --ar 2:3 --v 6
```

## 🎯 Técnica de Parecido (Likeness) y Pesos
1.  **Pesos Pro**: Usa `::3` para la descripción física del jugador.
2.  **Cuerpo Completo**: "Full length shot, head to toe visible". El calzado debe ser visible.

## 📏 Composición para el Marco v13
*   **Fondo**: DEBE ser **Blanco Puro (#FFFFFF)**. Si sale gris o con sombras, el prompt ha fallado.
*   **Contraste**: El jugador debe estar perfectamente recortado visualmente contra el blanco.

## 🚫 Negative Prompt (Refuerzo Blanco Puro)
`Negative: grey background, gray background, shadows, floor, grass, stadium, gradients, vignette, dark corners, logos, brands, sponsors, headshot, portrait, 3D render, cartoon.`
