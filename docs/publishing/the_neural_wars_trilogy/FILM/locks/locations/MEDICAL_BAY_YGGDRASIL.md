# LOCATION LOCK — Medical Bay (Yggdrasil / Fracturados)
**id:** `medical_bay_yggdrasil`  
**aliases:** Fracturados makeshift medical / extraction bay; surgical gurney bay; medical bay transmission bank  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN environment brief

---

## 1. Identity

Makeshift underground medical / Link-extraction bay inside Fracturados redoubt (decommissioned metro fabric). Steel surgical gurney with heavy canvas straps, coiled fiber-optic cables, scavenged monitors with **abstract glow only**. Okafor / Riv / Mileo extraction beats (FC-S05–S06).

## 2. Palette

| Role | Hex |
|---|---|
| Steel / instruments | `#C0C0C0` / `#708090` / `#FFFFFF` (highlights) |
| Copper cable accents | `#B87333` / `#FFBF00` |
| Monitor / scan glow | `#0080FF` / `#4682B4` (abstract; no UI text) |
| Emergency strobe (post-surge) | muted crimson practical — keep non-lettered globes |
| Atmosphere walls | `#000000` / `#301934` |
| Coil (subject) | `#4B0082` / `#3F00FF` |

## 3. Materials

- Steel gurney + canvas straps (blank)
- Fiber-optic extraction probes / coiled cables (glow abstract)
- Brick or poured concrete bay walls (metro remnant)
- Scavenged analog equipment housings — **blank faces, no brands**
- Optional shortwave radio bank for Riv (knobs/geometry only; no frequency text)

## 4. Fog

- Density: **low–medium** clinical haze / dust in practical beams
- Post-surge: thicker haze cut by rotating beacon globes
- Never sterile white OR room — keep underground grit

## 5. Scale

- Intimate bay; gurney anchors midground
- Ceiling low industrial; cables hang into frame
- Figures dominate medium/close; establishing shows bay as pocket in larger redoubt

## 6. Time / lighting

- Underground practicals
- Key: hard surgical practical over gurney (cool steel + slight warm copper)
- Fill: ~1:3 bounce from concrete
- Rim: blue scan glow on skin / Coil indigo on Mileo LEFT wrist/forearm
- Ratio target verbal LUT: key 1.0 / fill 0.30–0.40 / rim 0.50–0.70 (scan or Coil)

## 7. Prompt injection (EN)

`Makeshift underground medical extraction bay in decommissioned metro redoubt: steel surgical gurney canvas straps, coiled fiber-optic cables, scavenged blank monitors with abstract blue glow (#0080FF/#4682B4), copper cable accents (#B87333), Atmosphere #000000/#301934, volumetric haze low-medium, chiaroscuro, single camera 2.39, PG-13 non-graphic medical`

## 8. Negatives

- NO readable UI, vitals text, brand logos, “Yggdrasil” lettering, faction labels
- NO gore porn; PG-13 scar/extraction only
- NO multi-panel monitor walls as comic layout

## 9. RENDER CONTRACT (locked)

- **location_id:** `medical_bay_yggdrasil` (must equal the `location_id` field in every shot that uses it)
- **time_lock:** underground_practicals
- **palette_lock (hex only, never faction names):** steel/instruments #C0C0C0 / #708090 / #FFFFFF (speculars); copper cable #B87333 / #FFBF00; scan/UI glow #0080FF / #4682B4 (abstract only); post-surge beacon = muted crimson globe (non-lettered); walls #000000 / #301934; subject Coil #4B0082 / #3F00FF
- **scale_anchor:** intimate bay; gurney anchors midground; low industrial ceiling with cables hanging into frame
- **fog / atmosphere:** low-medium clinical haze in practical beams; thicker post-surge; never a sterile white OR
- **canon shots:** FC-S05, FC-S06 (extraction), FC-S06A, FC-S07 exit toward jump point

### Practicals (the only light sources allowed)
1. hard surgical practical over the gurney (cool steel, slight warm copper)
2. blank scavenged analog monitor faces with abstract glow
3. shortwave radio bank: knobs and geometry only, no frequency numerals
4. rotating non-lettered beacon globes post-surge

### Prohibitions (append verbatim to every prompt)
- readable vitals / UI text / brand logos / 'Yggdrasil' or faction lettering
- gore: PG-13 non-graphic only
- monitor-wall comic layout
- sterile corporate-white operating theatre
- NO readable text, NO logos, NO multi-panel / split-screen — always.

### Deterministic injection order
`[character lock invariants] + [this location's §7 prompt injection] + [beat] + [prohibitions] + [global negatives from WORLD_TOKENS.json]`
