---
name: goalchain-grok-visual-v71
description: Orchestrator skill for GoalChain visual updates containing file path rules and image generation requirements.
---

# goalchain-grok-visual-v71

Orchestrator skill for managing paths, inputs, and outputs of player caricature updates.

## Rules & Parameters
- **Rutas de Disco (VPS)**:
  - Batch JSON: `/data/apps/GoalChain/scratch/grok_batches_v7/batch_{batch_id}_players.json`
  - Logo: `/data/apps/GoalChain/scratch/grok_batches_v7/logo_3d_jersey.jpg`
  - Fuentes: `/data/apps/GoalChain/scratch/grok_batches_v7/sources/{padded_id}.jpg`
  - Salidas: `/data/apps/GoalChain/scratch/grok_batches_v7/outputs/{padded_id}_{safe_name}.jpg`
- **Motor Obligatorio**:
  - Usa el comando/herramienta `image_generate` con `image_url` apuntando a la ruta absoluta de la fuente JPG en el VPS.
  - Parámetros de generación: `aspect_ratio: portrait` (ó 2:3).
  - Proveedor: `xai` (OAuth super grok), sin usar FAL.
- **Reglas del Canvas**:
  - **Pies y Soporte**: Strictly barefoot. Pies descalzos visibles (talón, planta y dedos) apoyados planos directamente sobre el suelo blanco. Sin calzado ni calcetines. Absolutamente SIN base, pedestal, tarima, plataforma, stand ni soporte debajo de los pies.
  - **Fondo**: Fondo blanco puro (#FFFFFF) completamente liso, plano, sin sombras en el piso ni degradados. El piso y el fondo son un solo plano uniforme.
- **Flujo de Ejecución**:
  - Procesa secuencialmente cada jugador según el prompt.
  - Al completar una generación, copia la imagen resultante desde la caché de Hermes (`~/.hermes/cache/images/...`) a la ruta de salida definitiva `/data/apps/GoalChain/scratch/grok_batches_v7/outputs/{padded_id}_{safe_name}.jpg`.
