# GoalChain NFT Image Generator

Automated pipeline for generating player card images from NFT metadata.

## Overview

Generates SVG (and optionally PNG/WebP) player card images for all 528 Genesis NFT players. The cards include:
- Player ID and rarity badge
- Country flag emoji
- Player name and position
- Stats bars (ATK, DEF, HYPE)
- Base yield information

## Files

- `generate_nft_card.py` — Core SVG generator
- `batch_generate.sh` — Batch processor for all 528 players
- `render_png.py` — Optional PNG renderer using Playwright
- `requirements.txt` — Python dependencies

## Quick Start

```bash
# 1. Navigate to script directory
cd scripts/generate_nft_images

# 2. Generate SVG for single player
python3 generate_nft_card.py --player-id 1

# 3. Generate SVG for all players (528)
./batch_generate.sh

# 4. For PNG output (requires Playwright)
pip install -r requirements.txt
playwright install chromium
python3 render_png.py --batch --input-dir . --output-dir ../docs/assets/img/nfts
```

## Options

### generate_nft_card.py
```
--player-id N      Player ID to generate (required)
--metadata-path    Path to nft_metadata_index.json (default: ../../docs/assets/data/)
--output-dir       Output directory (default: ../../docs/assets/img/nfts/)
--format           svg or png (default: svg)
```

### batch_generate.sh
```
--start N          Start player ID (default: 1)
--end N            End player ID (default: 528)
--batch-size N     Report progress every N players (default: 50)
--format           svg or png (default: svg)
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
{player_id:03d}_{player_slug}.svg
Example: 001_lionel_satoshi.svg
```

## Dependencies

- Python 3.8+
- playwright (for PNG rendering, optional)

## Notes

- SVG output is the default and works without additional dependencies
- PNG rendering requires Playwright with Chromium installed
- The 528 players consist of: 10 Mythic, 50 Legendary, and the rest Epic/Rare
- Existing images in `docs/assets/img/nfts/` will NOT be overwritten by default