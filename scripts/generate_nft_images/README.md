# GoalChain NFT Image Generator

Automated pipeline for generating player card images from NFT metadata.

## Overview

Generates WebP (default), PNG, or SVG player card images for all 528 Genesis NFT players. The cards include:
- Player ID and rarity badge
- Country flag emoji
- Player name and position
- Stats bars (ATK, DEF, HYPE)
- Base yield information

## Files

- `generate_nft_card.py` — Core SVG + WebP/PNG generator (via cairosvg + PIL)
- `batch_generate.sh` — Batch processor for all 528 players; auto-creates venv on first run
- `render_png.py` — Optional standalone PNG renderer
- `requirements.txt` — Python dependencies (cairosvg, pillow)
- `venv/` — Auto-created virtual environment (not committed to git)

## Quick Start

```bash
# Navigate to script directory
cd scripts/generate_nft_images

# Generate WebP for all 528 players (auto-creates venv on first run)
./batch_generate.sh

# Generate WebP for a single player
./venv/bin/python generate_nft_card.py --player-id 1 --format webp

# Generate SVG only (no venv needed)
./venv/bin/python generate_nft_card.py --player-id 1 --format svg
```

## Options

### generate_nft_card.py
```
--player-id N      Player ID to generate (required)
--metadata-path    Path to nft_metadata_index.json (default: ../../docs/assets/data/)
--output-dir       Output directory (default: ../../docs/assets/img/nfts/)
--format           svg, png, or webp (default: webp)
```

### batch_generate.sh
```
--start N          Start player ID (default: 1)
--end N            End player ID (default: 528)
--batch-size N     Report progress every N players (default: 50)
--format           svg, png, or webp (default: webp)
```

## Rarity Colors

| Rarity    | Primary   | Secondary |
|-----------|-----------|-----------|
| Mythic    | #FFD700   | #FFA500   |
| Legendary | #9400D3   | #8A2BE2   |
| Epic      | #4B0082   | #6A5ACD   |
| Rare      | #1E90FF   | #4169E1   |
| Common    | #808080   | #A9A9A9   |

## Output Format

Generated files follow the naming convention:
```
{player_id:03d}_{player_slug}.webp
Example: 001_Lionel_Satoshi.webp
```

Output directory: `docs/assets/img/nfts/composed/` (served by the webapp via `getPlayerImagePath()`)

## Dependencies

- Python 3.8+
- cairosvg (SVG → PNG conversion)
- pillow (PNG → WebP export)
- batch_generate.sh auto-installs these into a local venv on first run

## Notes

- WebP output is the default (800×1120 px, ~30-70KB per file)
- The 528 players consist of: 10 Mythic, 50 Legendary, and the rest Epic/Rare
- Existing images in `docs/assets/img/nfts/composed/` will NOT be overwritten by default