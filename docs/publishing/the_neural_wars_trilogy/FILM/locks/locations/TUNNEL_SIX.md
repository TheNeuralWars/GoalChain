# LOCATION LOCK — Tunnel Six
**id:** `tunnel_six`  
**aliases:** Tunnel Six legacy storm-drain; steam main corridor; Underbelly drainage conduit into Tunnel Six  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN environment brief

---

## 1. Identity

Legacy storm-drain / industrial tunnel network under Neo-Citania. Heavy mildew haze, stagnant black runoff, sparse orange filament emergency lamps. Kora first contact zone (FC-S03).

## 2. Palette

| Role | Hex |
|---|---|
| Filament lamps | `#FF8C00` / `#FFBF00` / `#B87333` |
| Wet concrete / mildew | `#708090` / `#301934` |
| Runoff / void | `#000000` |
| Coil accents (character only) | `#4B0082` / `#3F00FF` / `#0080FF` |

## 3. Materials

- Aged concrete barrel / rectangular conduit with mildew bloom
- Rusted steam main (large diameter pipe) as landmark prop
- Stagnant reflective black water film on floor
- Orange filament emergency lamps on irregular spacing (abstract housings; **no text**)

## 4. Fog

- Density: **high** mildew / steam haze
- Lamps bloom through fog; shafts of orange pierce purple-black void
- Visibility often <10–15 m along tunnel axis

## 5. Scale

- Extreme wides: tiny figures in long vanishing tunnel
- Steam main diameter roughly human-height+ as scale anchor
- Low ceilings in side conduits; main run taller industrial

## 6. Time / lighting

- Timeless underground (no daylight)
- Key: flickering orange filament practicals (uneven)
- Fill: wet floor reflection ~1:4
- Rim: occasional indigo Coil glow on Mileo post-awakening only
- Chiaroscuro: faces half-lit against deep Atmosphere

## 7. Prompt injection (EN)

`Tunnel Six legacy storm-drain under Neo-Citania: heavy mildew haze, stagnant black runoff, sparse orange filament emergency lamps (#FF8C00/#FFBF00) flickering, rusted steam main landmark, wet concrete #708090, Atmosphere #000000/#301934, volumetric fog high density, tiny human scale in long tunnel, chiaroscuro, single camera anamorphic 2.39`

## 8. Negatives

- NO readable text, route markers, “Tunnel Six” lettering on walls
- NO logos; NO HUD maps
- NO multi-panel / insert layout language

## 9. RENDER CONTRACT (locked)

- **location_id:** `tunnel_six` (must equal the `location_id` field in every shot that uses it)
- **time_lock:** underground_timeless
- **palette_lock (hex only, never faction names):** filament amber #FF8C00 / #FFBF00 / #B87333; wet concrete + mildew #708090 / #301934; runoff void #000000; Coil indigo #4B0082 / #3F00FF / #0080FF (Mileo LEFT wrist/forearm only, post-cut)
- **scale_anchor:** rusted steam main is human-height or larger; extreme wide = tiny figures in a long vanishing tunnel
- **fog / atmosphere:** high mildew/steam haze; lamp bloom; visibility often <10-15 m on axis
- **canon shots:** FC-S03 (Kora first contact), FC-S06 (Coil as guide light), FC-S06A

### Practicals (the only light sources allowed)
1. flickering orange filament emergency lamps on irregular spacing (abstract blank housings)
2. steam bleed from rusted steam main
3. indigo Coil glow as the only blue source

### Prohibitions (append verbatim to every prompt)
- route markers or any legible direction lettering on walls
- HUD maps
- faction labels
- multi-panel / insert language
- clean dry tunnel — mildew, wet film and haze always present
- NO readable text, NO logos, NO multi-panel / split-screen — always.

### Deterministic injection order
`[character lock invariants] + [this location's §7 prompt injection] + [beat] + [prohibitions] + [global negatives from WORLD_TOKENS.json]`
