#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔍 Running Roster Metadata Verification..."

# 1. Check docs metadata count
DOCS_META_DIR="$PROJECT_ROOT/docs/assets/data/metadata"
if [ ! -d "$DOCS_META_DIR" ]; then
    echo "❌ docs/assets/data/metadata directory does not exist!"
    exit 1
fi
# Count only numeric json files like 1.json, 2.json
DOCS_COUNT=$(find "$DOCS_META_DIR" -maxdepth 1 -name "[0-9]*.json" | wc -l | xargs)
if [ "$DOCS_COUNT" -ne 528 ]; then
    echo "❌ Error: Expected exactly 528 JSON metadata files in docs/assets/data/metadata, found $DOCS_COUNT!"
    exit 1
fi
echo "✅ docs/assets/data/metadata has exactly 528 player metadata JSON files."

# 2. Check Sugar assets count
SUGAR_DIR="$PROJECT_ROOT/mint_setup/assets"
if [ ! -d "$SUGAR_DIR" ]; then
    echo "❌ mint_setup/assets directory does not exist!"
    exit 1
fi
SUGAR_JSON_COUNT=$(find "$SUGAR_DIR" -maxdepth 1 -name "[0-9]*.json" | wc -l | xargs)
SUGAR_PNG_COUNT=$(find "$SUGAR_DIR" -maxdepth 1 -name "[0-9]*.png" | wc -l | xargs)

if [ "$SUGAR_JSON_COUNT" -ne 528 ]; then
    echo "❌ Error: Expected exactly 528 JSON files in mint_setup/assets, found $SUGAR_JSON_COUNT!"
    exit 1
fi
if [ "$SUGAR_PNG_COUNT" -ne 528 ]; then
    echo "❌ Error: Expected exactly 528 PNG files in mint_setup/assets, found $SUGAR_PNG_COUNT!"
    exit 1
fi
echo "✅ mint_setup/assets has exactly 528 JSON and 528 PNG files."

# 3. Check Candy Machine config.json count
CONFIG_FILE="$PROJECT_ROOT/mint_setup/config.json"
if [ -f "$CONFIG_FILE" ]; then
    CONFIG_COUNT=$(node -e "const fs = require('fs'); console.log(JSON.parse(fs.readFileSync(process.argv[1], 'utf8')).number);" "$CONFIG_FILE")
    if [ "$CONFIG_COUNT" -ne 528 ]; then
        echo "❌ Error: config.json 'number' field is $CONFIG_COUNT, expected 528!"
        exit 1
    fi
    echo "✅ mint_setup/config.json has 'number' field set to 528."
fi

echo "🎉 All verification checks passed!"
exit 0
