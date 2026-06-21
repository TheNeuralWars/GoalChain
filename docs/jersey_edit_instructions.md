# Guía de Edición de Jerseys y Composición con Grok CLI

Esta guía define las instrucciones de contexto, prompts y especificaciones técnicas para que Grok CLI ejecute la edición de camisetas de los 528 jugadores del juego, garantizando la calidad visual y la protección legal del proyecto.

---

## 1. Arquitectura de Referencia (4 Archivos Locales)

Para cada edición de jugador, se deben cargar y codificar en Base64 exactamente 4 archivos de referencia locales (no URLs):

1. **Referencia 1 (Jugador Base v4)**: El retrato original del jugador con la cara, pelo, cuerpo y pose perfectas.
   - *Ruta local*: `scratch/grok_batches/batch_XX/refs/{id}.jpg` (ej. `001.jpg`).
2. **Referencia 2 (Logo GoalChain)**: El logo oficial limpio y transparente en 3D.
   - *Ruta local*: `docs/assets/img/logo_3d_clean.png`.
3. **Referencia 3 (Logo Solana)**: El logo oficial de la espiral de Solana.
   - *Ruta local*: `docs/assets/img/solana_logo.png`.
4. **Referencia 4 (Camiseta de la Selección 2026)**: El diseño descargado de Footy Headlines de la camiseta unificada de la selección nacional del jugador.
   - *Ruta local*: `scratch/refs/jerseys/{pais}.png` (ej. `Argentina.png`).

---

## 2. El Prompt Oficial para Grok Image Edit

Cuando invoquemos la API de Grok, el prompt exacto debe estructurarse de la siguiente manera:

```text
This is an image-to-image edit. The character's face, eyes, hair, skin, body pose, features, and the overall anime drawing style from reference image 1 must be kept 100% identical and unchanged. Do not change or alter the face, facial details, or expression.

On the character's jersey from reference image 1, make the following edits:
1. Replace the shirt with the soccer jersey design, colors (stripes/patterns) shown in reference image 4 (without its original manufacturer logos or brand badges).
2. Overlay the GoalChain sponsor logo from reference image 2 centered on the middle of the chest.
3. Draw the number {jersey_num} clearly on the chest below the GoalChain logo in a bold clean font.
4. Add the Solana logo from reference image 3 on the left sleeve.

Erase any football federation crests or national shields (e.g. AFA crest) from the jersey completely to prevent copyright issues. The background must remain solid pure white. No borders, no frames.
```

---

## 3. Pipeline de Procesamiento por Lotes (Script de Control)

El script ejecutor `scratch/process_all_batches.py` o similar debe automatizar este proceso por lotes para los 528 jugadores realizando los siguientes pasos para cada uno:

1. **Lectura de Biometría y Datos**: Leer del archivo `docs/assets/data/players.json` el nombre, país y `jersey_number` del jugador.
2. **Llamada a Grok API**: Ejecutar el endpoint `/images/edits` de xAI con las 4 referencias locales codificadas en Data URIs.
3. **Remoción de Fondo (Transparencia)**: Aplicar la librería local `rembg` sobre el output de Grok para obtener un canal alfa transparente limpio (RGBA).
4. **Guardar en la Webapp**: Almacenar el archivo resultante en `docs/assets/img/pilot_v5/{id}.png` para que el portal web de GoalChain (`pre-nft.html`) lo renderice.
5. **Prevenir Rate Limits**: Colocar una pausa prudente (`time.sleep(3)`) entre cada jugador.

---

## 4. Archivos de Reglas y Configuración del Agente

* **`CLAUDE.md` / `AGENTS.md`**: Contienen las instrucciones generales que respetará el CLI de Grok al ejecutarse en el repositorio de forma interactiva.
* **`~/.grok/config.toml`**: Configuración global del CLI de Grok donde se define la conexión con el servidor MCP `gbrain` para indexar el contexto completo del proyecto.
