# LOCATION LOCK — Ventilation Shaft
**id:** `vent_shaft`  
**aliases:** Sector 17 ventilation shaft; decommissioned ventilation shaft sanctuary; blast-hatch corridor; maintenance ladder mid-shaft  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN environment brief

---

## 1. Identity

Vertical / near-vertical decommissioned industrial ventilation shaft under Sector 17. Rusted iron maintenance ladder, corrugated metal ducting, damp concrete, hanging cables. Links alley grate to forgotten tunnels / Fracturados sanctuary mouth (FC-S02, FC-S07).

## 2. Palette

| Role | Hex |
|---|---|
| Iron / ducting | `#708090` / `#C0C0C0` / `#B87333` (rust) |
| Sodium practicals | `#FF8C00` / `#FFBF00` |
| Atmosphere void | `#000000` / `#301934` |
| Damp concrete | `#708090` / `#4682B4` (cool wet) |

## 3. Materials

- Corrugated metal duct walls
- Rusted iron ladder rungs (no stamped IDs)
- Damp concrete ledges / blast-hatch lip
- Hanging cables (blank jackets; no labels)
- Condensation / dripping water

## 4. Fog

- Density: **medium** dust + steam rising vertically
- Light shafts from hatch above when open; otherwise deep void
- Volumetric particles always present

## 5. Scale

- Vertical mega-infrastructure; human tiny on ladder
- High-angle looking down ladder into darkness (classic FC-S02)
- Hatch mouth as bright/ambient aperture vs black shaft

## 6. Time / lighting

- Underground / shaft interior
- Key: sodium amber practicals at irregular intervals OR hatch spill
- Fill: very low (~1:5–1:8); deep shadow on faces OK
- Rim: edge light on ladder rails
- Sanctuary mouth (FC-S07): warmer sodium + copper mesh glints `#B87333`

## 7. Prompt injection (EN)

`Decommissioned industrial ventilation shaft: corrugated metal ducting, rusted iron maintenance ladder, damp concrete, hanging cables, sodium amber practicals (#FF8C00), volumetric dust fog, Atmosphere #000000/#301934, human tiny vs vertical shaft scale, single camera 2.39 chiaroscuro`

## 8. Negatives

- NO readable text on ducts, hatches, cables
- NO logos; NO multi-panel
- NO bright clean corporate shaft aesthetic — keep scavenged/decommissioned

## 9. RENDER CONTRACT (locked)

- **location_id:** `vent_shaft` (must equal the `location_id` field in every shot that uses it)
- **time_lock:** underground_shaft_interior
- **palette_lock (hex only, never faction names):** iron/ducting #708090 / #C0C0C0 with rust #B87333; sodium amber #FF8C00 / #FFBF00; void #000000 / #301934; damp cool concrete #4682B4
- **scale_anchor:** vertical mega-infrastructure; a figure on the ladder is small; high-angle down the ladder into blackness
- **fog / atmosphere:** medium vertical rising dust/steam; volumetric particles always present; hatch mouth = bright aperture vs black shaft
- **canon shots:** FC-S02 (descent), FC-S07 (sanctuary bay beyond the shaft)

### Practicals (the only light sources allowed)
1. sodium amber practicals at irregular intervals up/down the shaft
2. warm spill through the open hatch mouth
3. copper mesh glints #B87333 at the sanctuary mouth (FC-S07)
4. condensation drip catching rim light

### Prohibitions (append verbatim to every prompt)
- stamped IDs or lettering on ducts, hatch, cables, ladder
- faction labels
- multi-panel
- bright clean corporate shaft aesthetic — must read decommissioned/scavenged
- NO readable text, NO logos, NO multi-panel / split-screen — always.

### Deterministic injection order
`[character lock invariants] + [this location's §7 prompt injection] + [beat] + [prohibitions] + [global negatives from WORLD_TOKENS.json]`
