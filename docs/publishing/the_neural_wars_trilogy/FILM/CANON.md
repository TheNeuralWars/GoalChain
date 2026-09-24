# CANON — The Neural Wars FILM (Fractured Code)

## Qué leer primero (checklist)

1. Este `CANON.md`
2. `WORLD_TOKENS.json` — `character_id` / `location_id` estables
3. `locks/LOCK_SHEET_*.md` + `locks/refs/<character_id>/`
4. `locks/locations/*.md` — briefs de entorno (hex, fog, scale)
5. `VISUAL_BIBLE.md` — luz, cámara, negativos globales (hub; no duplicar locations)
6. `wardrobe.md` — wardrobe congelado (hex; nunca nombres de facción como label)
7. `schemas/shot_schema_v2.json` — `character_ids[]` + `location_id` required
8. `scenes/*.json` — storyboards (ids deben alinear con tokens)

**Regla:** todo storyboard/prompt nuevo DEBE referenciar `character_id`/`character_ids[]` + `location_id` desde WORLD_TOKENS; `lock_sheet_id`; `reference_images` opcionales (obligatorias cuando existan stills en refs).

**Prohibiciones:** texto legible; labels de facción en ropa; cues de guion (`Mark`) en prompts; lenguaje de panel (`upper frame`); prosa libre que contradiga `character_id`/`location_id`.

**Authority order (read top → bottom; later docs lose on conflict):**

1. `CANON.md` (this file) — entrypoint for ANY agent/tool
2. `VISUAL_BIBLE.md` — lighting, aspect, camera grammar, global negatives
3. `wardrobe.md` — frozen wardrobe (hex only in prompts; never faction names as labels)
4. `locks/` — character lock-sheets (`LOCK_SHEET_*.md`) + `locks/refs/` stills
5. `WORLD_TOKENS.json` — machine-readable ids (characters, locations, palette)
6. `schemas/shot_schema_v2.json` — required shot fields (`lock_sheet_id`, `reference_images`, …)
7. `scenes/*.json` — storyboards (must reference token ids)
8. `renders/` — generated media (not canon; replaceable)

## Non-negotiables

- **Determinism:** every gen prompt MUST pull character/location tokens from `WORLD_TOKENS.json` + lock prose; do not free-invent face/wardrobe/scars.
- **One camera per shot.** No multi-panel / diptych / “upper frame” language in image prompts.
- **No readable text / logos / faction-name lettering** on screen or wardrobe.
- **Cue words stay out of image/video prompts** (put in `action` / `cues[]` only).
- **Aspect target:** 2.39 feel (interim 16:9 SD is pipeline debt, not bible).
- **i2v:** video must animate the approved still (`image` field); never pure text-to-video.

## How any AI should generate

```
Read CANON.md → VISUAL_BIBLE.md → relevant LOCK_SHEET_*.md → WORLD_TOKENS.json
Attach reference_images from locks/refs/<CHAR_ID>/
Compose image_prompt = [lock invariants] + [location token] + [beat] + [global negatives]
Animate with i2v from that still
```

## Live workstreams (do not block canon)

- Regen queue: `reports/REGEN_QUEUE_v1.md`
- Action insert: `scenes/FC-S06A_ACTION_INSERT.json` (between S06 and S07)
- QC: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/`

## Owners

- Visual canon / storyboard: Director Neural
- Generation / lock stills / i2v: Hermes-ceo on Goalchain
- Publish GoalWorld page: Jefe (draft); Obra gates YouTube only

## Source of truth for ids (machine)

`CANON.md` → `WORLD_TOKENS.json` → `locks/` (chars + `locks/locations/`) → `VISUAL_BIBLE.md` → `wardrobe.md` → `scenes/*.json`

Prose in scenes must not contradict token ids.
