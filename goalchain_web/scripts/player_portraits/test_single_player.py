#!/usr/bin/env python3
"""
Quick test script for the Player Portrait Pipeline.
Tests with a single player (Lionel Satoshi).
"""

import sys
sys.path.append("/home/goalchain/hermes/workspace/GoalChain/goalchain_web/scripts/player_portraits")

from player_portrait_pipeline import (
    load_players,
    build_prompt,
    generate_image_with_grok,
    process_image,
    enforce_aspect_ratio
)
from PIL import Image
import os

OUTPUT_DIR = "/home/goalchain/hermes/workspace/GoalChain/goalchain_web/scripts/player_portraits/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def test_single_player(player_id: int = 1):
    players = load_players()
    player = next((p for p in players if p["id"] == player_id), None)

    if not player:
        print(f"Player {player_id} not found")
        return

    print(f"Testing with: {player['name']}")
    prompt = build_prompt(player)
    print(f"Prompt: {prompt[:150]}...")

    # Generate
    raw_bytes = generate_image_with_grok(prompt)
    if not raw_bytes:
        print("Generation failed")
        return

    # Process
    final_img = process_image(raw_bytes)
    if not final_img:
        print("Post-processing failed")
        return

    # Save test output
    test_path = os.path.join(OUTPUT_DIR, f"test_{player_id}_portrait.png")
    final_img.save(test_path, "PNG")
    print(f"Test image saved to: {test_path}")
    print(f"Final size: {final_img.size}")

if __name__ == "__main__":
    test_single_player(1)
