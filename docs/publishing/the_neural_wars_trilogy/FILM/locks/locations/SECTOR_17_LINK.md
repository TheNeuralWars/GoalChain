# LOCATION LOCK — Sector 17 Link
**id:** `sector_17_link`  
**aliases:** Sector 17 alley→shaft threshold; ventilation grate mouth under Sector 17  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN environment brief

---

## 1. Identity

Transition node where Sector 17 underbelly alley meets the maintenance ventilation grate and ladder into the shaft. Wet cracked concrete, rusted grate flush with mud, steam pipes overhead. Night only for FC-S01/S02 beats.

## 2. Palette (hex only — never faction words as on-screen text)

| Role | Hex |
|---|---|
| Wet concrete / steel | `#708090` / `#C0C0C0` / `#4682B4` |
| Mud / rust vapor | `#B87333` / `#FF8C00` (vapor only; muted) |
| Atmosphere deep | `#000000` / `#301934` |
| Cold scan wash (alert) | `#0080FF` / `#4682B4` (soft, not readable HUD) |

## 3. Materials

- Cracked wet concrete walls with black runoff stains
- Corroded steel pipes sweating condensation
- Iron ventilation grate (abstract geometry; **no unit IDs, no letters**)
- Mud patch with shallow reflective puddles
- Sparse cold rain / mist

## 4. Fog / atmosphere

- Density: **medium-high** rust-colored vapor + cold rain mist
- Always volumetric haze between pipes
- Visibility: alley length fades into Atmosphere purple-black within ~15–20 m

## 5. Scale notes

- Human figure small vs vertical pipe stacks and grate mouth
- Ladder drop into shaft reads as deep vertical void below grate
- Camera prefers low/eye-level for mud beats; high-angle for grate descent

## 6. Time of day / lighting

- **Night** (canon for alley-link beats)
- Key: sparse cold Neo-Citania bounce `#4682B4` / `#F8F8FF` from distant glass (weak)
- Fill: mud reflection ~1:4 vs key
- Rim: occasional sodium filament amber from distant Underbelly practicals
- Alert wash: cool blue scan pass — abstract light only, **no readable glyphs**

## 7. Prompt injection (EN)

`Sector 17 link: wet cracked concrete alley meeting rusted iron ventilation grate, mud patch, rust vapor between steel pipes, cold night rain mist, volumetric fog, Atmosphere #000000/#301934, steel #708090/#C0C0C0, human scale small vs grate and pipes, single camera, anamorphic 2.39 feel`

## 8. Negatives (always)

- NO readable text, logos, unit IDs, hatch numbers, map labels
- NO faction name labels on walls/cloth
- NO multi-panel / upper-frame language
- NO sunny daytime unless scene explicitly overrides (default night)

## 9. RENDER CONTRACT (locked)

- **location_id:** `sector_17_link` (must equal the `location_id` field in every shot that uses it)
- **time_lock:** night_only
- **palette_lock (hex only, never faction names):** steel #708090 / #C0C0C0 / #4682B4; mud+rust vapor #B87333 / #FF8C00 (vapor/dirt ONLY, never cloth); atmosphere #000000 / #301934; alert scan #0080FF (soft wash, never glyphs)
- **scale_anchor:** rusted grate mouth + vertical pipe stacks dwarf a standing figure; ladder drop reads as black vertical void
- **fog / atmosphere:** medium-high rust vapor + rain mist; alley fades to atmosphere within 15-20 m
- **canon shots:** FC-S01-08 (grate entry), FC-S02 (shaft threshold)

### Practicals (the only light sources allowed)
1. sparse cold rain
2. sodium filament amber rim from distant underbelly lamp
3. cool glass bounce #4682B4 from distant towers (weak)
4. alert scan wash (cool blue, abstract)

### Prohibitions (append verbatim to every prompt)
- readable text / unit IDs / hatch numbers / map labels on grate or walls
- faction names as cloth or wall labels
- daylight
- multi-panel / insert / upper-frame layout language
- dry clean alley — mud and standing water are required
- NO readable text, NO logos, NO multi-panel / split-screen — always.

### Deterministic injection order
`[character lock invariants] + [this location's §7 prompt injection] + [beat] + [prohibitions] + [global negatives from WORLD_TOKENS.json]`
