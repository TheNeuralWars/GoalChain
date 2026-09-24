# Locks — The Neural Wars FILM

**Entrypoint:** [`../CANON.md`](../CANON.md) · **Machine ids:** [`../WORLD_TOKENS.json`](../WORLD_TOKENS.json)

## Characters

| character_id | lock_sheet_id | File | QC |
|---|---|---|---|
| `mileo_chen` | `LOCK_SHEET_MILEO_CHEN` | [LOCK_SHEET_MILEO_CHEN.md](./LOCK_SHEET_MILEO_CHEN.md) | Strong; refs ready |
| `kora_vega` | `LOCK_SHEET_KORA_VEGA` | [LOCK_SHEET_KORA_VEGA.md](./LOCK_SHEET_KORA_VEGA.md) | Weak — needs refs |
| `sierra_catalano` | `LOCK_SHEET_SIERRA_CATALANO` | [LOCK_SHEET_SIERRA_CATALANO.md](./LOCK_SHEET_SIERRA_CATALANO.md) | Weak — needs refs |
| `okafor` | _(none yet)_ | wardrobe.md + WORLD_TOKENS | Ensemble FC-S05 |
| `riv` | _(none yet)_ | wardrobe.md + WORLD_TOKENS | Ensemble FC-S05 |

Approved stills: `locks/refs/<character_id>/` (see also `../locksheets/` for Hermes manifests).

## Locations

See [`locations/README.md`](./locations/README.md) — all `location_id` keys in WORLD_TOKENS.

## How to use with future gens

1. Pick `character_ids[]` + `location_id` from `WORLD_TOKENS.json`.
2. Read matching `LOCK_SHEET_*.md` and `locks/locations/*.md`.
3. Set `lock_sheet_id` / `lock_sheet_ids` + `reference_images`.
4. Follow `../VISUAL_BIBLE.md` + `../wardrobe.md`: hex only; never faction names as on-screen labels; no “Mark” / panel language in prompts.
5. Schema: `../schemas/shot_schema_v2.json` (requires `character_ids` + `location_id`).

**Do not** invent logos or readable text. Mileo hexagonal badge = blank geometry only.

## Generation pitfalls (learned 2026-09-14)

- The xAI image-edit endpoint requires **2 reference images**; one ref returns HTTP 422. Duplicate the same anchor when only one is valid.
- A **403** from the image endpoint means the quota is spent — stop, do not burn retries.
- **Never reuse stills that encode a wrong invariant** (e.g. the FC-S03 stills carry a left-cheek scar, so any Kora gen anchored on them reproduces it). Generate text-only, verify with vision, then chain the clean still as the anchor.
- Returns come back as **JPEG bytes regardless of extension** — re-encode to real PNG before filing under `locks/refs/`.
- Always vision-QC the scar side, eye colour, and on-cloth text; text instructions do not reliably override a reference image.
