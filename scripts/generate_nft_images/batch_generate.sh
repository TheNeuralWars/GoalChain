#!/bin/bash
#===============================================================================
# GoalChain NFT Image Batch Generator
#===============================================================================
# Generates all 528 player card images from NFT metadata.
#
# Usage:
#   ./batch_generate.sh              # Generate all (interactive)
#   ./batch_generate.sh --start 1 --end 50 --batch-size 10
#
# Requirements:
#   pip install -r requirements.txt
#   playwright install chromium  # First time only
#===============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default values
START=1
END=528
BATCH_SIZE=50
FORMAT="webp"
VENV_PYTHON="$(cd "$(dirname "${BASH_SOURCE[0]}")" && [ -d venv/bin/python3 ] && echo venv/bin/python3 || echo python3)"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --start)
            START="$2"
            shift 2
            ;;
        --end)
            END="$2"
            shift 2
            ;;
        --batch-size)
            BATCH_SIZE="$2"
            shift 2
            ;;
        --format)
            FORMAT="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [--start N] [--end N] [--batch-size N] [--format svg|png|webp]"
            echo ""
            echo "Options:"
            echo "  --start N      Start player ID (default: 1)"
            echo "  --end N        End player ID (default: 528)"
            echo "  --batch-size N Process N players per batch (default: 50)"
            echo "  --format       Output format: svg, png, or webp (default: webp)"
            echo "  --help         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "=============================================="
echo "GoalChain NFT Image Batch Generator"
echo "=============================================="
echo "Range:      #$START - #$END"
echo "Batch size: $BATCH_SIZE"
echo "Format:     $FORMAT"
echo "Output:     ../docs/assets/img/nfts/"
echo "=============================================="

TOTAL=$((END - START + 1))
GENERATED=0
FAILED=0

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Check dependencies
if ! python3 -c "import json" 2>/dev/null; then
    echo "⚠️  Standard library OK"
fi

# Create output directory
OUTPUT_DIR="$(dirname "$SCRIPT_DIR")/../docs/assets/img/nfts"
mkdir -p "$OUTPUT_DIR"

# Process in batches
for ((i=START; i<=END; i++)); do
    PLAYER_ID=$i

    echo -n "[$PLAYER_ID/$END] Generating player #$PLAYER_ID... "

    # Run generator
    if "$VENV_PYTHON" generate_nft_card.py \
        --player-id "$PLAYER_ID" \
        --metadata-path "../../docs/assets/data/nft_metadata_index.json" \
        --output-dir "../../docs/assets/img/nfts" \
        --format "$FORMAT" 2>&1 | grep -q "saved"; then
        GENERATED=$((GENERATED + 1))
        echo "✅"
    else
        FAILED=$((FAILED + 1))
        echo "❌"
    fi

    # Progress report every batch
    if (( (i - START + 1) % BATCH_SIZE == 0 )); then
        PROGRESS=$(( (i - START + 1) * 100 / TOTAL ))
        echo "--- Progress: $PROGRESS% ($GENERATED generated, $FAILED failed) ---"
    fi
done

echo ""
echo "=============================================="
echo "Generation Complete"
echo "=============================================="
echo "Total players:  $TOTAL"
echo "Generated:      $GENERATED"
echo "Failed:         $FAILED"
echo "Output dir:     $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "  1. Review generated WebP images in $OUTPUT_DIR"
echo "  2. venv already has cairosvg + Pillow installed for WebP output"
echo "  3. To re-run: ./batch_generate.sh --start 45 --end 528 --format webp"
echo "  4. git add docs/assets/img/nfts/*.webp && git commit -m 'feat: generate remaining NFT player cards'"
echo "=============================================="