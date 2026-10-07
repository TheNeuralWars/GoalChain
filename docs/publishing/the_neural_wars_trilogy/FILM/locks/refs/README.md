# Character reference stills — `locks/refs/`

**Authority:** Director Neural owns CANON. Stills here are continuity anchors for i2v / image-edit — not free media dump.

## Naming convention (required)

Path: `locks/refs/<character_id>/<view>.png`

| File | Meaning |
|---|---|
| `front.png` | Face-forward / 3Q head-shoulders lock |
| `profile.png` | True profile (scar / ear side verifiable) |
| `fullbody.png` | Full-body wardrobe lock |

Optional later (do **not** invent without Director Neural + QC):
- `three_quarter.png`, `hands.png`, `detail_<prop_id>.png`

`character_id` must match a key under `WORLD_TOKENS.json` → `characters`  
(today: `mileo_chen`, `kora_vega`, `sierra_catalano`, `okafor`, `riv`, `the_architect`).

## Status

| character_id | Folder | Stills |
|---|---|---|
| `mileo_chen` | `mileo_chen/` | front / profile / fullbody — ready |
| `kora_vega` | `kora_vega/` | front / profile / fullbody — ready |
| `sierra_catalano` | `sierra_catalano/` | front / profile / fullbody — ready |
| `okafor` | `okafor/` | **placeholder only** — stills TBD |
| `riv` | `riv/` | **placeholder only** — stills TBD |
| `the_architect` | `the_architect/` | **prompts ready** — `front_34` / `profile` / `bust` via `REF_GEN_SPEC.json`; NO gen until jefe |

## Rules

1. **Do NOT generate / Imagine / invent images from this README.** Place approved stills only.
2. Re-encode to real PNG before filing (pipeline may return JPEG bytes under `.png`).
3. Vision-QC scar side, eye colour, on-cloth text before marking `refs_status: ready` in WORLD_TOKENS.
4. xAI image-edit needs **2** reference images — duplicate the same anchor if only one is valid.
5. Location environment stills (if added later) go under `locks/refs/locations/<location_id>/` — not here.

See `../README.md`, `../../CANON.md`, `../../WORLD_TOKENS.json`.
