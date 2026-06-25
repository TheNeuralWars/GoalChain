#!/usr/bin/env bash
# Build layered NFT gallery assets + sync data for webapp
set -euo pipefail
REPO="${GOALCHAIN_REPO_PATH:-/data/apps/GoalChain}"
cd "$REPO"

mkdir -p goalchain_webapp/public/assets/data
cp -f docs/assets/data/players.json goalchain_webapp/public/assets/data/players.json

python3 ops/hermes/build_nft_gallery_v71.py "$@"

# Optional: rsync composed to API static if Caddy mount exists
if [[ -d /home/ubuntu/scratch/goalchain-pilot/v71_grok ]]; then
  mkdir -p /home/ubuntu/scratch/goalchain-pilot/nft_gallery/composed
  rsync -a docs/assets/img/nfts/composed/ /home/ubuntu/scratch/goalchain-pilot/nft_gallery/composed/ 2>/dev/null || true
  rsync -a docs/assets/img/nfts/transparent/ /home/ubuntu/scratch/goalchain-pilot/nft_gallery/transparent/ 2>/dev/null || true
  cp -f docs/assets/data/nft_gallery_manifest.json /home/ubuntu/scratch/goalchain-pilot/nft_gallery/manifest.json
fi

echo "NFT gallery build complete."