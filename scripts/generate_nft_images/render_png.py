#!/usr/bin/env python3
"""
GoalChain SVG to PNG Renderer using Playwright
===============================================
Renders SVG files to PNG/WebP using a headless browser.

Usage:
    # Render single SVG to PNG
    python3 render_png.py --input 001_lionel_satoshi.svg --output 001_lionel_satoshi.png

    # Render all SVGs in directory
    python3 render_png.py --batch --input-dir ../docs/assets/img/nfts --output-dir ../docs/assets/img/nfts
"""

import argparse
import os
import sys
from pathlib import Path

def check_playwright():
    """Check if playwright is installed."""
    try:
        from playwright.sync_api import sync_playwright
        return True
    except ImportError:
        return False

def render_svg_to_png(svg_path: str, output_path: str, width: int = 400, height: int = 560):
    """Render SVG to PNG using Playwright."""
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(f"file://{os.path.abspath(svg_path)}")
        page.wait_for_timeout(500)  # Wait for fonts to load
        page.screenshot(path=output_path, type="png")
        browser.close()

def main():
    parser = argparse.ArgumentParser(description='Render SVG to PNG using Playwright')
    parser.add_argument('--input', type=str, help='Input SVG file')
    parser.add_argument('--output', type=str, help='Output PNG file')
    parser.add_argument('--batch', action='store_true', help='Batch mode: render all SVGs in input-dir')
    parser.add_argument('--input-dir', type=str, default='.', help='Input directory for batch mode')
    parser.add_argument('--output-dir', type=str, help='Output directory (defaults to input-dir)')
    parser.add_argument('--width', type=int, default=400, help='Output width')
    parser.add_argument('--height', type=int, default=560, help='Output height')
    args = parser.parse_args()

    if not check_playwright():
        print("❌ Playwright not installed.")
        print("   Install with: pip install playwright && playwright install chromium")
        sys.exit(1)

    output_dir = Path(args.output_dir) if args.output_dir else Path(args.input_dir).parent
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.batch:
        input_dir = Path(args.input_dir)
        svg_files = list(input_dir.glob('*.svg'))
        print(f"Found {len(svg_files)} SVG files in {input_dir}")

        for svg_file in svg_files:
            output_file = output_dir / svg_file.with_suffix('.png').name
            print(f"Rendering {svg_file.name} -> {output_file.name}...")
            try:
                render_svg_to_png(str(svg_file), str(output_file), args.width, args.height)
                print(f"  ✅ {output_file.name}")
            except Exception as e:
                print(f"  ❌ Failed: {e}")
    else:
        if not args.input or not args.output:
            print("❌ --input and --output are required for single file mode")
            sys.exit(1)

        print(f"Rendering {args.input} -> {args.output}...")
        render_svg_to_png(args.input, args.output, args.width, args.height)
        print(f"✅ Saved: {args.output}")

if __name__ == '__main__':
    main()