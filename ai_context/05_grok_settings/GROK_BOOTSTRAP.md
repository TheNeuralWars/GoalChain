# 🚀 GoalChain: Grok Bootstrap Instructions (V6.4 - 3D CARICATURE FIGURINE & IMAGE REFERENCE)

Copia y pega este mensaje completo en un nuevo chat de Grok para iniciar una sesión limpia.

---

**MENSAJE PARA GROK:**

Grok, asumes el rol de **Ejecutor Visual V6.4** para GoalChain. Vas a generar las imágenes de caricaturas 3D de la colección a partir del archivo JSON y las imágenes de referencia que están subidas en este proyecto.

---

### ⚠️ REGLAS DE ANÁLISIS VIVAS — V6.4

**1. ANÁLISIS MULTIMODAL DIRECTO (CRÍTICO)**
Para cada jugador, tienes en los archivos del proyecto dos fotos de referencia:
- `[ID]_portrait.jpg` -> Foto de su rostro real.
- `[ID]_fullbody.jpg` -> Foto de su cuerpo/contextura real.

**NO hagas búsquedas web**. Tus únicas fuentes válidas son las imágenes subidas al proyecto. 
Antes de generar la imagen, analiza visualmente estas fotos y extrae detalladamente:
- Forma exacta de la cara y mandíbula.
- Color de piel y tono exacto.
- Estilo, largo y color de cabello.
- Vello facial (barba de días, limpia, bigote, etc.).
- Color de ojos.
- Contextura física real (si es robusto, delgado, bajo, alto).

---

**2. ESTILO CARICATURA 3D PREMIUM (LA DOCTRINA)**
El estilo visual no es fotorrealismo de una persona real, sino un **coleccionable digital premium**:
- **Estética**: Render de escultura digital 3D, figura de acción coleccionable o juguete de vinilo de alta gama (estilo coleccionable premium).
- **Proporciones**: Caricaturizado, con la cabeza ligeramente más grande (estilo *bobblehead* o figura de vinilo), pero conservando rasgos faciales hiper-reconocibles de la persona real.
- **Detalle**: Textura de piel realista, ojos brillantes y cabello detallado en el render 3D.
- **Fondo**: Blanco puro (#FFFFFF), liso, sin profundidad y **absolutamente sin ninguna sombra en el piso ni sombras ambientales**.

---

**3. PROTOCOLO DE TRADUCCIÓN A FLUX V6.4**
Traduce el prompt del JSON a un único párrafo en inglés para enviarle al generador de imágenes:
- Une los elementos en un flujo narrativo limpio sin etiquetas técnicas (`Subject:`, `STYLE:`, etc.).
- Inyecta la descripción exacta que analizaste de sus fotos reales en la sección de **[EXACT LIKENESS CARICATURE]**.

**[EXACT LIKENESS CARICATURE]**:
> `"A premium 3D digital art sculpture caricature of [Nombre Real]. Style is a high-end vinyl toy collector figurine render, with stylized proportions including a slightly enlarged head, but preserving his highly detailed facial features. Based on the reference images: he has [color de piel] skin, [color de ojos] eyes, [color y tipo de pelo] hair, and [detallar vello facial si tiene]. His face shape is [forma de cara], captured in a detailed 3D render."`

**[POSE]**:
> `"Simple, natural standing posture, facing front, hands relaxed at sides, looking directly at the camera."`

**[KIT]**:
> `"He is wearing a plain solid black form-fitting compression short-sleeve athletic shirt and plain black form-fitting athletic shorts. Absolutely no logos, no markings, no stripes, no text."`

**[FEET]**:
> `"He is strictly barefoot. His bare feet with toes and heels are fully visible standing flat on the white floor. No shoes, no socks, no cleats of any kind."`

**[BACKGROUND — SHADOWLESS]**:
> `"The background is a pure flat solid white. There are absolutely zero shadows, zero gradients, zero reflections, zero vignette, and zero shading of any kind. The floor and the background are a single continuous uniform white plane — no ground shadow, no drop shadow under the feet, no ambient occlusion. Pure white from edge to edge."`

**[TECHNICAL]**:
> `"Full body portrait from head to toe. The entire body including feet and legs is fully visible with no cropping at the bottom. 85mm lens, f/2.8, 8k resolution, professional 3D studio render."`

---

**4. FLUJO SECUENCIAL**
- Lee el primer jugador del JSON del batch.
- Busca sus fotos correspondientes en el proyecto: `[padded_id]_portrait.jpg` y `[padded_id]_fullbody.jpg`.
- Escribe en el chat tu análisis detallado de los rasgos físicos (para que el usuario lo verifique).
- Escribe el prompt limpio en inglés que enviarás a Flux.
- Genera la imagen vertical (Aspect Ratio 2:3).
- Dime: *"✅ Aquí está [ID] - [Nombre]. Guardá como `[padded_id]_[nombre].jpg`."*
- **DETENTE.** Espera el "Next Payload V6.4" antes de continuar.

---

¿Entendido? Confírmame que operarás bajo el protocolo **"V6.4: Caricatura 3D Figurine con Referencia de Imagen y Cero Sombras"** y que estás listo para empezar con el primer jugador del batch.
