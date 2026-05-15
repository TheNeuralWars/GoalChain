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
Usa esta estructura para forzar el **CUERPO COMPLETO** (Si no se ven los pies, es un fallo):

```text
[Ultra-detailed physical description from real-life search results]::3 Full length action shot, standing from a distance, HEAD TO TOE VISIBLE, BOTH FEET AND FOOTWEAR MUST BE IN THE FRAME, [PLAYER_NAME] in epic pose. [KIT]: Minimalist unbranded [COUNTRY] kit, NO logos. [BACKGROUND]: High-key studio photography, pure solid #FFFFFF white, NO floor, NO shadows. [TECHNICAL]: 85mm lens, f/4 (deep focus), 8k resolution, extreme realism, zero caricature, professionally isolated --ar 2:3 --v 6
```

## 🎯 Técnica de Parecido (Likeness) y Pesos
1.  **Pesos Pro**: Usa `::3` para el físico.
2.  **Cuerpo Completo**: Obligatorio. "Full length shot, shoes and feet must be visible". Si el calzado está cortado, el prompt ha fallado.

## 📏 Composición para el Marco v13
*   **Zoom**: El jugador debe estar centrado y verse de cuerpo entero, dejando aire por arriba y por abajo.
*   **Fondo**: Blanco Puro (#FFFFFF).

## 🚫 Negative Prompt (Extremo)
`Negative: portrait, headshot, close-up, half-body shot, cropped feet, cut off shoes, waist-up shot, blurred legs, grey background, shadows, floor, grass, stadium, logos, brands, sponsors, 3D render, cartoon.`
