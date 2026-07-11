#!/usr/bin/env python3
"""
GoalChain NFT Card Generator — Batch Processing Script
=======================================================
Generates player card images from NFT metadata.

Usage:
    # Generate single card (SVG output):
    python3 generate_nft_card.py --player-id 1

    # Generate PNG:
    python3 generate_nft_card.py --player-id 1 --format png

    # Generate WebP (preferred):
    python3 generate_nft_card.py --player-id 1 --format webp

    # Generate batch (all 528):
    ./batch_generate.sh --format webp

Requirements:
    pip install -r requirements.txt
    # For PNG/WebP output (run once):
    python3 -m venv venv && venv/bin/pip install cairosvg Pillow
"""

import json
import os
import sys
import argparse
from pathlib import Path
from typing import Optional

# Rarity colors
RARITY_COLORS = {
    "Mythic": {"primary": "#FFD700", "secondary": "#FFA500", "glow": "#FFEC8B"},
    "Legendary": {"primary": "#9400D3", "secondary": "#8A2BE2", "glow": "#DA70D6"},
    "Epic": {"primary": "#4B0082", "secondary": "#6A5ACD", "glow": "#9370DB"},
    "Rare": {"primary": "#1E90FF", "secondary": "#4169E1", "glow": "#87CEEB"},
    "Common": {"primary": "#808080", "secondary": "#A9A9A9", "glow": "#D3D3D3"},
}

# Country emoji mapping
COUNTRY_EMOJIS = {
    "Argentina": "🇦🇷", "Spain": "🇪🇸", "France": "🇫🇷", "Brazil": "🇧🇷",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Germany": "🇩🇪", "Italy": "🇮🇹", "Portugal": "🇵🇹",
    "Netherlands": "🇳🇱", "Belgium": "🇧🇪", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "United Kingdom": "🇬🇧", "USA": "🇺🇸", "Uruguay": "🇺🇾", "Colombia": "🇨🇴",
    "Mexico": "🇲🇽", "Japan": "🇯🇵", "South Korea": "🇰🇷", "Nigeria": "🇳🇬",
    "Morocco": "🇲🇦", "Senegal": "🇸🇳", "Croatia": "🇭🇷", "Poland": "🇵🇱",
    "Ukraine": "🇺🇦", "Austria": "🇦🇹", "Switzerland": "🇨🇭", "Denmark": "🇩🇰",
    "Sweden": "🇸🇪", "Norway": "🇳🇴", "Cameroon": "🇨🇲", "Ghana": "🇬🇭",
}

def load_metadata(metadata_path: str) -> list:
    """Load NFT metadata index."""
    with open(metadata_path, 'r') as f:
        return json.load(f)

def get_player_metadata(metadata: list, player_id: int) -> Optional[dict]:
    """Get metadata for a specific player."""
    for player in metadata:
        if player.get('id') == player_id:
            return player
    return None

def get_attr_value(attributes: list, trait_type: str) -> str:
    """Extract attribute value from attributes list."""
    for attr in attributes:
        if attr.get('trait_type') == trait_type:
            return str(attr.get('value', ''))
    return ''

def get_rarity_info(rarity: str) -> dict:
    """Get color scheme for rarity."""
    return RARITY_COLORS.get(rarity, RARITY_COLORS["Common"])

def slugify(name: str) -> str:
    """Convert name to slug for filename."""
    return name.lower().replace(' ', '_').replace('—', '-').replace('#', '')

def generate_svg(player_metadata: dict) -> str:
    """Generate SVG card for a player."""
    meta = player_metadata.get('metadata', {})
    attrs = meta.get('attributes', [])

    player_id = player_metadata.get('id', 0)
    filename = player_metadata.get('filename', f'{player_id:03d}.webp')
    name = meta.get('name', f'Player #{player_id}')
    description = meta.get('description', '')

    rarity = get_attr_value(attrs, 'Rarity')
    position = get_attr_value(attrs, 'Position')
    country = get_attr_value(attrs, 'Country')
    real_name = get_attr_value(attrs, 'Real Name')
    atk = get_attr_value(attrs, 'ATK')
    defense = get_attr_value(attrs, 'DEF')
    hype = get_attr_value(attrs, 'HYPE')
    base_yield = get_attr_value(attrs, 'Base Yield (GCH/day)')
    stamina = get_attr_value(attrs, 'Stamina')

    rarity_info = get_rarity_info(rarity)
    country_emoji = COUNTRY_EMOJIS.get(country, '🌍')

    # Extract traits (max 3)
    traits = [a.get('value', '') for a in attrs if a.get('trait_type') == 'Trait'][:3]
    traits_str = ' • '.join(traits) if traits else ''

    # Stars for rarity
    stars = get_attr_value(attrs, 'Rarity Stars')
    stars_display = stars if stars else '⭐' * 3

    # Club
    club = get_attr_value(attrs, 'Parody Club')
    visual_effect = get_attr_value(attrs, 'Visual Effect')

    def stat_bar(value: str, max_val: int = 100) -> int:
        """Calculate percentage for stat bar."""
        try:
            val = int(value)
        except (ValueError, TypeError):
            val = 0
        pct = min(100, max(0, val * 100 // max_val))
        return pct

    atk_pct = stat_bar(atk)
    def_pct = stat_bar(defense)
    hype_pct = stat_bar(hype)
    stam_pct = stat_bar(stamina)

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f"/>
      <stop offset="50%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#{rarity_info['secondary'][1:]}"/>
    </linearGradient>
    <linearGradient id="rarity-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:{rarity_info['primary']}"/>
      <stop offset="100%" style="stop-color:{rarity_info['secondary']}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="400" height="560" fill="url(#bg)" rx="16"/>

  <!-- Rarity border -->
  <rect x="4" y="4" width="392" height="552" fill="none" stroke="url(#rarity-grad)" stroke-width="3" rx="14"/>

  <!-- Header: ID + Rarity -->
  <rect x="20" y="20" width="100" height="28" fill="{rarity_info['primary']}" rx="6"/>
  <text x="70" y="40" font-family="Arial Black, sans-serif" font-size="14" fill="#0a0a0f" text-anchor="middle" font-weight="bold">
    #{player_id:03d}
  </text>

  <rect x="280" y="20" width="100" height="28" fill="{rarity_info['primary']}" rx="6"/>
  <text x="330" y="40" font-family="Arial, sans-serif" font-size="12" fill="#0a0a0f" text-anchor="middle" font-weight="bold">
    {rarity}
  </text>

  <!-- Player silhouette placeholder -->
  <circle cx="200" cy="220" r="100" fill="{rarity_info['glow']}" opacity="0.3" filter="url(#glow)"/>
  <text x="200" y="230" font-family="Arial, sans-serif" font-size="72" fill="{rarity_info['primary']}" text-anchor="middle">
    {country_emoji}
  </text>

  <!-- Player name -->
  <text x="200" y="355" font-family="Arial Black, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" font-weight="bold">
    {name.split('—')[0].strip()}
  </text>

  <!-- Position badge -->
  <rect x="175" y="365" width="50" height="24" fill="{rarity_info['primary']}" rx="4"/>
  <text x="200" y="382" font-family="Arial Black, sans-serif" font-size="14" fill="#0a0a0f" text-anchor="middle" font-weight="bold">
    {position}
  </text>

  <!-- Real name + Country -->
  <text x="200" y="410" font-family="Arial, sans-serif" font-size="12" fill="#aaa" text-anchor="middle">
    {real_name} {country_emoji}
  </text>

  <!-- Club -->
  <text x="200" y="430" font-family="Arial, sans-serif" font-size="11" fill="#888" text-anchor="middle">
    {club}
  </text>

  <!-- Stats section -->
  <rect x="30" y="445" width="340" height="2" fill="{rarity_info['primary']}" opacity="0.5"/>

  <!-- ATK -->
  <text x="40" y="468" font-family="Arial, sans-serif" font-size="11" fill="#aaa">ATK</text>
  <rect x="80" y="460" width="200" height="12" fill="#222" rx="3"/>
  <rect x="80" y="460" width="{atk_pct * 2}" height="12" fill="{rarity_info['primary']}" rx="3"/>
  <text x="290" y="470" font-family="Arial, sans-serif" font-size="11" fill="#fff">{atk}</text>

  <!-- DEF -->
  <text x="40" y="490" font-family="Arial, sans-serif" font-size="11" fill="#aaa">DEF</text>
  <rect x="80" y="482" width="200" height="12" fill="#222" rx="3"/>
  <rect x="80" y="482" width="{def_pct * 2}" height="12" fill="#4B9CD3" rx="3"/>
  <text x="290" y="492" font-family="Arial, sans-serif" font-size="11" fill="#fff">{defense}</text>

  <!-- HYPE -->
  <text x="40" y="512" font-family="Arial, sans-serif" font-size="11" fill="#aaa">HYPE</text>
  <rect x="80" y="504" width="200" height="12" fill="#222" rx="3"/>
  <rect x="80" y="504" width="{hype_pct * 2}" height="12" fill="#FF6B6B" rx="3"/>
  <text x="290" y="514" font-family="Arial, sans-serif" font-size="11" fill="#fff">{hype}</text>

  <!-- Footer: Yield + Stars -->
  <text x="200" y="540" font-family="Arial, sans-serif" font-size="10" fill="#666" text-anchor="middle">
    Base Yield: {base_yield} GCH/day
  </text>
</svg>'''

    return svg

def main():
    parser = argparse.ArgumentParser(description='GoalChain NFT Card Generator')
    parser.add_argument('--player-id', type=int, required=True, help='Player ID to generate')
    parser.add_argument('--metadata-path', type=str, default='../../docs/assets/data/nft_metadata_index.json', help='Path to metadata JSON')
    parser.add_argument('--output-dir', type=str, default='../../docs/assets/img/nfts/composed', help='Output directory (default: composed/ subdir under nfts/)')
    parser.add_argument('--format', choices=['svg', 'png', 'webp'], default='webp', help='Output format: svg, png, or webp (default: webp)')
    args = parser.parse_args()

    # Resolve paths relative to script location
    script_dir = Path(__file__).parent.resolve()
    metadata_path = script_dir / args.metadata_path
    output_dir = script_dir / args.output_dir

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load metadata
    print(f"Loading metadata from {metadata_path}...")
    all_metadata = load_metadata(str(metadata_path))

    # Find player
    player = get_player_metadata(all_metadata, args.player_id)
    if not player:
        print(f"Player #{args.player_id} not found in metadata")
        sys.exit(1)

    # Generate SVG
    svg_content = generate_svg(player)
    meta = player.get('metadata', {})
    name = meta.get('name', f'Player_{args.player_id}')
    slug = slugify(name.split('—')[-1].strip() if '—' in name else name)

    if args.format == 'svg':
        output_path = output_dir / f'{args.player_id:03d}_{slug}.svg'
        with open(output_path, 'w') as f:
            f.write(svg_content)
        print(f"✅ SVG saved: {output_path}")
    else:
        # PNG/WebP: convert SVG using cairosvg + PIL
        try:
            import cairosvg
            from PIL import Image
            import io
            png_bytes = cairosvg.svg2png(bytestring=svg_content.encode('utf-8'), output_width=800, output_height=1120)
            img = Image.open(io.BytesIO(png_bytes)).convert('RGBA')
            ext = args.format  # 'png' or 'webp'
            output_path = output_dir / f'{args.player_id:03d}_{slug}.{ext}'
            img.save(str(output_path), format=args.format.upper())
            print(f"✅ {args.format.upper()} saved: {output_path}")
        except ImportError as e:
            # Fallback: save SVG with correct name
            output_path = output_dir / f'{args.player_id:03d}_{slug}.{args.format}'
            with open(output_path, 'w') as f:
                f.write(svg_content)
            print(f"⚠️  {args.format.upper()} libs missing — saved SVG instead: {output_path}")
            print(f"   Install: python3 -m venv venv && venv/bin/pip install cairosvg Pillow")

if __name__ == '__main__':
    main()