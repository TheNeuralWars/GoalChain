# FC-AX — Desglose Architect (Director Neural)

**Escena:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/scenes/FC-AX_ARCHITECT_INSERTS.json`  
**scene_id:** `FC-AX`  
**character_id:** `the_architect`  
**lock_sheet_id:** `LOCK_SHEET_THE_ARCHITECT`  
**Estado:** solo storyboard/docs — **cero** generación de imagen/vídeo en este pase.

## Por qué (v3)

En `FC_full_conform_v2` (~382 s) la presencia del antagonista es **casi nula**. El plan P1 pide 3–5 inserts de amenaza/vigilancia/símbolo **sin tirar** S01–S08. Gramática: drones, residual Coil índigo (Cascade `#4B0082` / `#3F00FF` / `#0080FF`), flicker de malla neural, ojos vacíos de cumplimiento, silueta lejana **o** mirada-sistema — **no** reveal de cuerpo/cara completo. PG-13. Sin texto legible.

## Beats por slot

```
S01 → S02 → 【AX01】 → S03 → S04 → S05 → 【AX02】 → S06 → 【AX03】 → S06A → S07 → 【AX04】→【AX05】 → S08
```

| shot_id | slot | after→before | Beat (ES) | Por qué este slot |
|---|---|---|---|---|
| FC-AX01 | between_S02_S03 | S02→S03 | POV vigilancia baja el pozo de ventilación; residual índigo | Tras el descenso al laberinto, el sistema “nos mira” antes del contacto Tunnel Six |
| FC-AX02 | between_S05_S06 | S05→S06 | Ojos vacíos de cumplimiento + mesh en cristal médico | Post-extracción Yggdrasil: el coste humano del Link; puente a Protocol Delta |
| FC-AX03 | pre_S06A | S06→S06A | Corredor vacío, drones, Coil en malla de cobre | Carga la amenaza **antes** del sprint de acción (S06A) |
| FC-AX04 | pre_S08 | S07→S08 | Silueta velada lejana en cañón residencial | Tras la vigilia del shaft: Architect como horizonte, sin cara |
| FC-AX05 | pre_S08 | AX04→S08 | Close mesh/Coil en cristal Node 17 | Sting simbólico inmediato antes del breach de superficie |

## Reglas aplicadas

- `character_ids`: siempre `the_architect` (extras anónimos solo en AX02, no leads).
- `location_id` desde WORLD_TOKENS; `lock_sheet_id` + `reference_images: []`.
- Hex Cascade en prompts; **sin** Mark / paneles / labels de facción / HUD legible.
- Una cámara por toma; no multi-panel.

## Siguiente paso (Hermes — no pedir gen ahora)

1. Lock stills Architect (`locks/refs/the_architect/`: silhouette, coil_motif, system_gaze).  
2. Rellenar `reference_images`.  
3. i2v anclado a stills → montar en ASSEMBLY_v3 + audio bed → `_conform_v3`.  
4. Digest QC: ¿se siente The Architect?
