# Location locks — The Neural Wars FILM

Deterministic environment briefs for prompt injection. **ids must match `../WORLD_TOKENS.json` → `locations`.**

| location_id | File | Notes |
|---|---|---|
| `sector_17_link` | [SECTOR_17_LINK.md](./SECTOR_17_LINK.md) | Alley↔grate↔shaft link |
| `underbelly_alley` | [UNDERBELLY_ALLEY.md](./UNDERBELLY_ALLEY.md) | Sector 17 alley night |
| `tunnel_six` | [TUNNEL_SIX.md](./TUNNEL_SIX.md) | Storm-drain / steam main |
| `vent_shaft` | [VENT_SHAFT.md](./VENT_SHAFT.md) | Ladder shaft / sanctuary mouth |
| `medical_bay_yggdrasil` | [MEDICAL_BAY_YGGDRASIL.md](./MEDICAL_BAY_YGGDRASIL.md) | Extraction bay |
| `neo_citania_glass` | [NEO_CITANIA_GLASS.md](./NEO_CITANIA_GLASS.md) | Surface towers / glass |
| `forgotten_tunnels` | [FORGOTTEN_TUNNELS.md](./FORGOTTEN_TUNNELS.md) | Labyrinth undercity |
| `fracturados_redoubt` | [FRACTURADOS_REDOUBT.md](./FRACTURADOS_REDOUBT.md) | Metro redoubt + copper mesh |
| `residential_mauve_district` | [RESIDENTIAL_MAUVE_DISTRICT.md](./RESIDENTIAL_MAUVE_DISTRICT.md) | FC-S08 sidewalk ops |
| `node_17_sanitation_lock` | [NODE_17_SANITATION_LOCK.md](./NODE_17_SANITATION_LOCK.md) | Hatch threshold |

## Usage

1. Set shot `location_id` to a key above (required in schema v2).
2. Inject location lock **Prompt injection** block + palette hex into `image_prompt`.
3. Never print location names or faction words as on-screen text.
4. Optional: `locks/refs/` is for **character** stills; location ref stills TBD under `locks/refs/locations/` if added later.

See `../../CANON.md` and `../../WORLD_TOKENS.json`.
