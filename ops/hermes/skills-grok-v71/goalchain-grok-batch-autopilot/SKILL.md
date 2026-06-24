---
name: goalchain-grok-batch-autopilot
description: Automated autopilot skill to run sequential batch generation without requiring player-by-player confirmation.
---

# goalchain-grok-batch-autopilot

Autopilot execution loop skill for batch processing of players.

## Instructions
- **Autopilot Loop**:
  - No pidas confirmación por cada jugador. Corre secuencialmente desde el primer jugador hasta el último jugador del lote (ID 001 a 030).
  - Si un archivo de salida ya existe, el piloto automático debe omitirlo (saltarlo) a menos que se fuerce con `FORCE`.
- **Procedimiento por Jugador**:
  1. Lee la base de datos de jugadores desde el JSON.
  2. Extrae la información (real_name, physical_description, country, jersey_number, grok_prompt).
  3. Muestra un resumen de 3 líneas del jugador que va a procesar:
     - **Jugador**: [Real Name] ([Country])
     - **Fisionomía**: [Brief summary of physical adjustments]
     - **Jersey**: [Jersey details and number]
  4. Ejecuta `image_generate` con el prompt estructurado, referenciando la imagen de origen `sources/{padded_id}.jpg` y el logo `logo_3d_jersey.jpg`.
  5. Localiza la imagen recién generada en el directorio caché de Hermes (ej. `~/.hermes/cache/images/`).
  6. Copia y renombra la imagen de la caché al directorio de salidas como `/data/apps/GoalChain/scratch/grok_batches_v7/outputs/{padded_id}_{safe_name}.jpg`.
  7. Registra un mensaje de confirmación en la consola:
     `✅ ID [padded_id] - [real_name] completado. Guardar como: [padded_id]_[safe_name].jpg`
  8. Continúa inmediatamente con el siguiente jugador del lote.
- **Resumen Final**:
  - Al completar todos los jugadores del lote, muestra una tabla resumen con el estado de cada jugador (Ej. "ID - Nombre - Estado") y una lista de cualquier fallo que haya ocurrido.
