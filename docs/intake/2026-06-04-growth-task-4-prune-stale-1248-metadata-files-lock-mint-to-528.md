# Growth Task 4: Prune Stale 1248-Metadata Files & Lock Mint to 528

- **Status:** ready-for-hermes
- **Priority:** P1
- **Owner:** opencode
- **Created:** 2026-06-04
- **Source:** GitHub Issue #298 / Manager

## Objective

`docs/assets/data/metadata/` contains **1,248 JSON files numbered `1.json` through `1248.json`** plus a generator script (1,249 total entries), but the canonical roster per `ai_context/03_data/PLAYERS_LIST.md` is exactly **528 players**. The 720 stale files (`529.json` through `1248.json`) are inherited from a previous design that was already corrected in copy but not on disk. Any mint script, Metaplex upload tool, or off-chain indexer that iterates this folder will mint ghost players (IDs 529–1248) that have no entry in `players.json`, no image asset, and no rarity tier. `docs/assets/data/metadata/1248.json` even references an image URL (`1248_venezuela_pro_26_token.png`) that does not exist in `docs/assets/img/nfts/` (which only has 44 image files).

**Action:**
1. Snapshot the 528 real metadata files
2. Delete `529.json` through `1248.json` from `docs/assets/data/metadata/`
3. Add a CI check in `.github/workflows/` (or a simple `scripts/check_metadata_roster.sh`) that asserts `ls docs/assets/data/metadata/*.json | wc -l === 528` and fails the build on drift
4. Update `nft_metadata_index.json` to drop the 720 ghost entries

---

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor
- [ ] Auto-dispatch to FCC/OpenCode for code implementation
- [ ] Run typescript checks and auto-merge to main if clean

## Tags

#growth-task #metadata #pruning #mint-cap #nft #canonical-roster #ci-check #humans-0 #autonomous-push