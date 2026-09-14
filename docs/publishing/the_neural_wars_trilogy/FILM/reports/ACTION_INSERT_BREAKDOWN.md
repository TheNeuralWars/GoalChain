# ACTION INSERT — Desglose (Director Neural)

**Archivo escena:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/scenes/FC-S06A_ACTION_INSERT.json`  
**scene_id:** `FC-S06A`  
**Estado:** solo storyboard/docs — **sin generación** de imagen/vídeo en este pase.

## Dónde insertar en la timeline

```
… FC-S05 → FC-S06 (Protocol Delta / presión) 
         → 【INSERT FC-S06A — 4 tomas de acción】 
         → FC-S07 (santuario post-evacuación / quietud)
         → FC-S08 …
```

- **No borrar** cortes existentes.
- **Alargar** el arco hacia el clímax de *Fractured Code*: persecución/brecha Delta → umbral Sierra → trio atraviesa escotilla → sello + drones (puente a la calma tensa de S07).

## Tomas (1 cámara cada una)

| id | Beat | Locks |
|---|---|---|
| FC-S06A-01 | Sprint Kora+Mileo por corredor en colapso | Kora, Mileo |
| FC-S06A-02 | Sierra sostiene umbral / gesto de prisa (sin palabra “Mark”) | Sierra |
| FC-S06A-03 | Trio cruza labio de escotilla + vapor | Kora, Mileo, Sierra |
| FC-S06A-04 | Escotilla sella; drones abstractos más allá de malla | — (vacío) |

## Reglas aplicadas

- Hex en prompts; **sin** texto legible / logos / “Resistencia” en ropa.
- Cues de guión solo en `action` / `cues[]`, nunca como título en frame.
- `reference_images: []` listo para que Hermes rellene tras lock stills.
- PG-13; visual bible 2.39 feel.

## Siguiente paso Hermes

1. Generar lock stills (prioridad Kora/Sierra).  
2. Rellenar `reference_images`.  
3. Generar solo estas 4 stills/clips cuando haya saldo API — **no** en este handoff.
