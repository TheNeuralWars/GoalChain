#!/usr/bin/env python3
"""
GoalChain Grok Helper Skill
This script runs inside Grok's python code interpreter environment.
It validates image aspect ratios, checks background colors, and compresses/saves the image.
"""
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("[WARN] Pillow library not found. Installing...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "Pillow"], check=True)
    from PIL import Image

def validate_and_optimize_image(image_path: str, output_path: str) -> bool:
    """
    Checks if the generated image matches the required criteria:
    - Vertical aspect ratio 2:3 (ideally 1024x1536)
    - Validates that the background is solid/light enough
    - Compresses the image to save git space
    """
    path = Path(image_path)
    if not path.exists():
        print(f"[ERROR] Source image not found at: {image_path}")
        return False
        
    try:
        with Image.open(path) as img:
            width, height = img.size
            print(f"[INFO] Loaded image: {width}x{height} (format: {img.format})")
            
            # 1. Aspect Ratio Verification (ideal ratio is 2:3 = 0.666)
            ratio = width / height
            target_ratio = 2 / 3
            if abs(ratio - target_ratio) > 0.05:
                print(f"[WARN] Aspect ratio is {ratio:.3f}, target is 2:3 ({target_ratio:.3f}). Resizing...")
                # Crop to 2:3 aspect ratio centering the image
                new_width = int(height * target_ratio)
                if new_width <= width:
                    left = (width - new_width) // 2
                    img = img.crop((left, 0, left + new_width, height))
                else:
                    new_height = int(width / target_ratio)
                    top = (height - new_height) // 2
                    img = img.crop((0, top, width, top + new_height))
                    
            # 2. Check Background (White verification on corner pixels)
            # Sample 4 corners
            corners = [
                img.getpixel((5, 5)),
                img.getpixel((img.width - 5, 5)),
                img.getpixel((5, img.height - 5)),
                img.getpixel((img.width - 5, img.height - 5))
            ]
            
            # Calculate average color value of corners (RGB)
            for i, pixel in enumerate(corners):
                # Handle RGBA/RGB
                val = sum(pixel[:3]) / 3
                if val < 240:  # Not white/light gray
                    print(f"[WARN] Corner {i} color is {pixel}, which is not pure white/light gray.")
            
            # 3. Optimize and Save
            out_p = Path(output_path)
            out_p.parent.mkdir(parents=True, exist_ok=True)
            
            # Save as optimized PNG
            img.save(out_p, format="PNG", optimize=True)
            print(f"[SUCCESS] Optimized player image saved to: {out_p} ({out_p.stat().st_size / 1024:.2f} KB)")
            return True
            
    except Exception as e:
        print(f"[ERROR] Failed to process image: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python grok_helper_skill.py <input_path> <output_path>")
        sys.exit(1)
    
    success = validate_and_optimize_image(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
