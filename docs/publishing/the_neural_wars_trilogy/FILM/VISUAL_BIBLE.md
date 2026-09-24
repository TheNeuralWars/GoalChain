# VISUAL BIBLE — The Neural Wars FILM (short)
**Scope:** Fractured Code film package under `docs/publishing/the_neural_wars_trilogy/FILM`  
**Authority:** `CANON.md` (entrypoint) → `WORLD_TOKENS.json` → `locks/` (+ `locks/locations/`) → this bible → `wardrobe.md`  
**Rating:** PG-13

---

## Lighting grammar

- **Chiaroscuro:** hard practicals cutting deep shadow; faces half-lit
- **Volumetric fog / haze:** Underbelly steam, tunnel mildew, shaft dust — always atmosphere present
- **Scale contrast:** tiny human figures vs mega-infrastructure (alleys, metro vaults, ventilation shafts)
- Practical sources: sodium/filament amber, recycled solar warm, cold Neo-Citania glass bounce, Coil indigo bioluminescence (post-awakening only)

Palette tokens (hex only in prompts — never faction names as on-screen labels):

| Role | Hex |
|---|---|
| Cascade | `#4B0082` / `#0080FF` / `#3F00FF` |
| Neo-Citania | `#F8F8FF` / `#FFFFFF` / `#708090` / `#4682B4` / `#C0C0C0` |
| Copper/gold accents | `#B87333` / `#FFD700` / `#FFBF00` / `#FF8C00` |
| Atmosphere | `#000000` / `#301934` |

---

## Aspect & delivery target

- **Bible target feel:** cinematic **2.39** anamorphic widescreen
- **Current renders (as of QC):** stills often 1280×720; video often **848×480** 16:9 — treat as pipeline interim, not canon
- Conform later: crop/letterbox toward 2.39 + upscale; do not change this bible to match interim SD

---

## Shot = one camera

- One prompt = **one camera setup**
- No multi-panel, quad-split, diptych, “upper frame / lower insert”, storyboard tiles inside a single frame
- Split beats → separate shot entries with their own `id` / `order`

---

## Text & graphics

- **NO readable text anywhere in frame** (clothes, walls, HUDs, badges, drones, carts, hatches)
- No logos, carteles, signage, unit IDs, map labels
- Abstract glow / blank geometry instead of lettering
- Keep `NO readable text, NO logos` at the **end** of image_prompt and video_prompt (repeated)

---

## Character continuity

- Principals: lock-sheets under `FILM/locks/`
  - `LOCK_SHEET_MILEO_CHEN`
  - `LOCK_SHEET_KORA_VEGA`
  - `LOCK_SHEET_SIERRA_CATALANO`
- Every character shot should carry:
  - `lock_sheet_id` (or map characters → sheets)
  - `reference_images[]` (paths to approved lock stills / prior good stills)
- Eyes canon: Mileo **green**; Kora **brown + indigo flecks**; Sierra **hazel**
- QC: Mileo strong; Kora & Sierra weak → prioritize their lock stills before regenerating S03/S04

---

## PG-13

- Violence implied / tactical; no gore porn
- Medical scar / extraction detail OK if non-graphic
- No sexual content; no torture spectacle

---

## Forbidden prompt patterns

Do **not** put these strings in `image_prompt` / `video_prompt` (they get painted literally):

| Pattern | Why |
|---|---|
| `Mark` / `SIERRA MARK` / hand-cue named “Mark” | Rendered as title card (FC-S08-06) |
| `upper frame` / `lower frame` / `insert` as layout | Multi-panel composite |
| `quad-split` / `diptych` / `split-screen` / `panel` | Tiled storyboard inside one frame |
| `Resistencia` / `Resistance` as cloth/label word | Burned onto wardrobe (FC-S07-07/08) |
| Faction names as color labels in the same breath as cloth | Model paints the word; use hex only |
| `Nivel 7` / badge lettering / any readable Spanish/English on props | Wardrobe forbids readable text |
| Script directions meant for editors (`cut to`, beat sheets as on-screen) | Bleed into image |

Put editorial cues in separate non-rendered fields (`action`, `cues[]` if added later) — never in prompts sent to image/video models.

---

## Schema note

Shot objects should follow `schemas/shot_schema_v2.json` (`reference_images`, `lock_sheet_id` + legacy fields).

---

## Environments / locations (hub)

**Do not fork location prose here.** Deterministic environment locks live under `locks/locations/` and are keyed in `WORLD_TOKENS.json` → `locations`:

| location_id | Lock file |
|---|---|
| `sector_17_link` | `locks/locations/SECTOR_17_LINK.md` |
| `underbelly_alley` | `locks/locations/UNDERBELLY_ALLEY.md` |
| `tunnel_six` | `locks/locations/TUNNEL_SIX.md` |
| `forgotten_tunnels` | `locks/locations/FORGOTTEN_TUNNELS.md` |
| `vent_shaft` | `locks/locations/VENT_SHAFT.md` |
| `fracturados_redoubt` | `locks/locations/FRACTURADOS_REDOUBT.md` |
| `medical_bay_yggdrasil` | `locks/locations/MEDICAL_BAY_YGGDRASIL.md` |
| `neo_citania_glass` | `locks/locations/NEO_CITANIA_GLASS.md` |
| `residential_mauve_district` | `locks/locations/RESIDENTIAL_MAUVE_DISTRICT.md` |
| `node_17_sanitation_lock` | `locks/locations/NODE_17_SANITATION_LOCK.md` |

Each lock: palette hex, fog density, materials, scale, time-of-day, negatives. **NO faction words as on-screen text.**


---

## Key props (ids in WORLD_TOKENS.props)

- `emp_dampener` — Mileo belt pouch (pre-cut); abstract; no logos
- `link_nodule` — base of skull / nape
- `serpent_coil_left_wrist` — indigo biolume **LEFT** wrist post-cut only (`#4B0082` / `#3F00FF` / `#0080FF`)
- `bone_conduction_left_clavicle` — Kora **LEFT** clavicle; faint copper glow; no UI text
- `shock_pistol` — Kora; abstract non-branded
- `copper_mesh_blast_doors` — Fracturados redoubt threshold
- `sanitation_cart` — surface cover; blank panels
- `cloned_chip_palm` — blank wafer in palm; no serials

Full machine entries: `WORLD_TOKENS.json` → `props`.


---

## Lighting LUT (verbal)

See `WORLD_TOKENS.json` → `lighting.lut_verbal` + `lighting.lighting_ids`.

- **Chiaroscuro:** hard practical key; faces half-lit
- **Key/fill/rim (default Underbelly):** key 1.0 / fill 0.20–0.35 / rim 0.40–0.60
- **Volumetric fog:** always present — low (civic), medium (alley/shaft), high (tunnels)
- **Cascade indigo accents** only on Coil/biolume characters — vs **steel gray** Neo-Citania surfaces (`#708090` / `#C0C0C0` / `#F8F8FF`)


---

## Global negative prompts (EN)

Pull full list from `WORLD_TOKENS.json` → `negatives_global`. Minimum append to every `image_prompt` / `video_prompt`:

`NO readable text, NO logos, NO signage, NO carteles, NO faction name labels, NO multi-panel, NO upper frame, NO Mark, NO title cards`

