# LOCATION LOCK — Underbelly Alley (Sector 17)
**id:** `underbelly_alley`  
**aliases:** Sector 17 alley; Sector 17 alley mud; Neo-Citania underbelly night alley  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN environment brief

---

## 1. Identity

Narrow industrial alley in Neo-Citania underbelly Sector 17. Reduced neural coverage zone. Cracked wet walls, rust vapor, sparse cold rain. Primary Mileo escape surface (FC-S01).

## 2. Palette

| Role | Hex |
|---|---|
| Walls / pipes | `#708090` / `#C0C0C0` |
| Glass bounce (distant) | `#F8F8FF` / `#4682B4` |
| Atmosphere | `#000000` / `#301934` |
| Mud accents | muted `#B87333` (dirt only) |

## 3. Materials

- Wet cracked concrete / poured underbelly cladding
- Exposed steel conduit and steam mains
- Mud floor with reflective black puddles
- Optional discarded blank gray tunic fabric (no lettering) as prop only

## 4. Fog

- Density: **medium** — rust-colored vapor drifting between pipes
- Persistent volumetric haze; never crystal-clear night
- Rain streaks catch practical rims

## 5. Scale

- Claustrophobic width; walls close
- Distant mega-towers only as cold glass silhouette above alley mouth (out of focus)
- Figure fills frame in medium; establishing shows tiny human in canyon alley

## 6. Time / lighting

- **Night**
- Key: hard practical cutting half-lit faces (chiaroscuro)
- Fill: ~1:3–1:5 from wet ground bounce
- Rim: cold glass bounce or weak sodium
- No warm golden-hour; keep steel-cold + Atmosphere purple

## 7. Prompt injection (EN)

`Sector 17 underbelly alley night: cracked wet concrete walls, rust vapor, sparse cold rain, mud puddles, volumetric fog, Atmosphere #000000/#301934, steel gray #708090/#C0C0C0, cold distant glass bounce #4682B4, claustrophobic scale, chiaroscuro, single camera 2.39`

## 8. Negatives

- NO readable text, street signs, carteles, drone IDs
- NO faction labels; NO logos
- NO multi-panel; NO daylight override without storyboard note

## 9. RENDER CONTRACT (locked)

- **location_id:** `underbelly_alley` (must equal the `location_id` field in every shot that uses it)
- **time_lock:** night_only
- **palette_lock (hex only, never faction names):** walls/pipes #708090 / #C0C0C0; distant glass bounce #F8F8FF / #4682B4; atmosphere #000000 / #301934; mud #B87333 (dirt only, muted)
- **scale_anchor:** claustrophobic canyon: close walls, towering megastructure above; establishing = tiny figure in the alley
- **fog / atmosphere:** medium rust-colored vapor drifting between pipes; persistent haze — never crystal clear
- **canon shots:** FC-S01 (Link cut escape), FC-S08 sky/sidewalk continuity link

### Practicals (the only light sources allowed)
1. hard practical cutting half-lit faces (chiaroscuro)
2. sparse cold rain catching rims
3. distant out-of-focus mega-tower glass silhouette above the alley mouth

### Prohibitions (append verbatim to every prompt)
- readable text / street signs / carteles / drone IDs
- faction labels or logos
- multi-panel
- warm golden-hour light
- daylight override without an explicit storyboard note
- NO readable text, NO logos, NO multi-panel / split-screen — always.

### Deterministic injection order
`[character lock invariants] + [this location's §7 prompt injection] + [beat] + [prohibitions] + [global negatives from WORLD_TOKENS.json]`
