# LOCATION LOCK — Neo-Citania Glass (Surface)
**id:** `neo_citania_glass`  
**aliases:** Neo-Citania skyline / towers; Surface Residential District Subsector Seventeen; polarized glass facades  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN environment brief

---

## 1. Identity

Neo-Citania surface architecture: flawless right-angle towers, polarized glass facades that reveal nothing, desalted air, calculated civic calm. Used for skyline establishing and surface residential approaches (FC-S08 mauve afternoon).

## 2. Palette

| Role | Hex |
|---|---|
| Glass / sky bounce | `#F8F8FF` / `#FFFFFF` / `#4682B4` |
| Steel structure | `#C0C0C0` / `#708090` |
| Mauve afternoon wash | soft mix Atmosphere `#301934` into sky (low saturation) |
| Shadows | `#000000` / deep `#708090` |

## 3. Materials

- Polarized curtain-wall glass (opaque/reflective; no interior readable signage)
- Precision steel/aluminum mullions
- Clean poured stone sidewalks / right-angle plazas
- Desalted air — minimal particulate vs Underbelly

## 4. Fog

- Density: **low** — thin desalted haze / soft atmospheric perspective on distant towers
- Not tunnel mildew; keep “clean civic” volume
- Optional light mauve veil for Subsector Seventeen afternoon

## 5. Scale

- Mega-towers dwarf humans on sidewalk
- Establishing: architecture dominates; people ant-scale
- Sidewalk beats: medium human scale with glass canyon walls

## 6. Time / lighting

- Skyline: day or dusk glass bounce OK
- FC-S08 residential: **calculated mauve afternoon**
- Key: soft broad skylight / glass bounce (lower contrast than Underbelly)
- Fill: high (~1:2) — cleaner than tunnels but still cinematic shadow under brows
- Avoid neon cyberpunk overload; Neo-Citania is cold corporate clarity

## 7. Prompt injection (EN)

`Neo-Citania surface glass towers: flawless right-angle architecture, polarized reflective facades (#F8F8FF/#FFFFFF/#4682B4), steel #C0C0C0/#708090, desalted thin haze, mauve afternoon wash optional (#301934 soft), humans tiny vs towers, single camera anamorphic 2.39, no signage`

## 8. Negatives

- NO readable building names, ads, carteles, logos, maps
- NO faction banners
- NO multi-panel; NO cyberpunk kanji spam

## 9. RENDER CONTRACT (locked)

- **location_id:** `neo_citania_glass` (must equal the `location_id` field in every shot that uses it)
- **time_lock:** day_or_dusk; FC-S08 = calculated mauve afternoon
- **palette_lock (hex only, never faction names):** glass/sky bounce #F8F8FF / #FFFFFF / #4682B4; steel #C0C0C0 / #708090; mauve wash #301934 at low saturation; shadows #000000
- **scale_anchor:** mega-towers dwarf pedestrians to ant scale; sidewalk beats = human medium with glass canyon walls
- **fog / atmosphere:** low thin desalted haze for atmospheric perspective on distant towers; clean civic volume, never tunnel mildew
- **canon shots:** FC-S08 (surface residential / sidewalk sanitation ops, sky freeze)

### Practicals (the only light sources allowed)
1. broad soft skylight / glass bounce as key (lower contrast than undercity)
2. clean poured-stone sidewalk speculars
3. optional low mauve afternoon veil for Subsector Seventeen

### Prohibitions (append verbatim to every prompt)
- readable building names / ads / carteles / logos / maps
- faction banners
- multi-panel
- cyberpunk neon kanji spam — Neo-Citania is cold corporate clarity
- underbelly grime in the surface district
- NO readable text, NO logos, NO multi-panel / split-screen — always.

### Deterministic injection order
`[character lock invariants] + [this location's §7 prompt injection] + [beat] + [prohibitions] + [global negatives from WORLD_TOKENS.json]`
