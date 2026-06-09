#!/usr/bin/env python3
"""
Update GoalChain players.json with enhanced physical details.
Adds structured biometric fields and rebuilds the 't' description for richer prompts.
"""

import json
import sys
from pathlib import Path

# Import the enhanced data
sys.path.insert(0, str(Path(__file__).parent))
from enhanced_physical_data import ENHANCED_PHYSICAL_DATA, get_enhanced_physical, build_enhanced_description


def load_players(json_path):
    """Load players from JSON file."""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_players(players, json_path):
    """Save players to JSON file."""
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)


def enhance_player_physical(player):
    """Enhance a single player's physical data."""
    player_id = player['id']
    base_physical = player.get('physical', {})
    real_name = player.get('real_name', '')
    country = player.get('country', '')
    position = player.get('position', '')
    
    # Get enhanced physical data
    enhanced = get_enhanced_physical(player_id, base_physical, real_name, country, position)
    
    # Update the player
    player['physical'] = enhanced
    
    return player


def main():
    base_dir = Path(__file__).resolve().parent.parent
    players_json_path = base_dir / "docs" / "assets" / "data" / "players.json"
    
    print(f"Loading players from {players_json_path}...")
    players = load_players(players_json_path)
    print(f"Loaded {len(players)} players.")
    
    # Backup original
    backup_path = players_json_path.with_suffix('.json.backup')
    print(f"Creating backup at {backup_path}...")
    save_players(players, backup_path)
    
    # Enhance players
    print("Enhancing physical details...")
    enhanced_count = 0
    for player in players:
        enhanced = enhance_player_physical(player)
        if enhanced['physical'].get('tattoos') or enhanced['physical'].get('distinctive_features'):
            enhanced_count += 1
    
    # Save enhanced data
    print(f"Saving {len(players)} enhanced players ({enhanced_count} with custom data)...")
    save_players(players, players_json_path)
    
    print("Done!")
    
    # Show sample
    print("\n--- Sample Enhanced Players ---")
    for player in players[:5]:
        p = player['physical']
        print(f"\n{player['name']} (ID: {player['id']})")
        print(f"  Hair: {p.get('hair_color')} - {p.get('hairstyle')}")
        print(f"  Facial Hair: {p.get('facial_hair')}")
        print(f"  Face: {p.get('face_structure')}")
        print(f"  Skin: {p.get('skin_tone')}")
        print(f"  Eyes: {p.get('eye_color')}")
        print(f"  Tattoos: {p.get('tattoos')}")
        print(f"  Distinctive: {p.get('distinctive_features')}")
        print(f"  Build: {p.get('build_type')}")
        print(f"  Description (t): {p.get('t')}")


if __name__ == "__main__":
    main()