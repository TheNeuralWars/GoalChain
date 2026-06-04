# OA Proposal — Issue #298

## Title
[OPENCODE] Task 4 - Prune Stale 1248-Metadata Files & Lock Mint to 528

## Source
GitHub issue #298

## Objective
## Objective
`docs/assets/data/metadata/` contains **1,248 JSON files numbered `1.json` through `1248.json`** plus a generator script (1,249 total entries), but the canonical roster per `ai_context/03_data/PLAYERS_LIST.md` is exactly **528 players**. The 720 stale files (`529.json` through `1248.json`) are inherited from a previous design that was already corrected in copy but not on disk. Any mint script, Metaplex upload tool, or off-chain indexer that iterates this folder will mint ghost players (IDs 529–1248) that have no entry in `players.json`, no image asset, and no rarity tier. `docs/assets/data/metadata/1248.json` even references an image URL (`1248_venezuela_pro_26_token.png`) that does not exist in `docs/assets/img/nfts/` (which only has 44 image files). Action: (1) snapshot the 528 real metadata files, (2) delete `529.json` through `1248.json` from `docs/assets/data/metadata/`, (3) add a CI check in `.github/workflows/` (or a simple `scripts/check_metadata_roster.sh`) that asserts `ls docs/assets/data/metadata/*.json | wc -l === 528` and fails the build on drift, (4) update `nft_metadata_index.json` to drop the 720 ghost entries.

---
**Canonical specification file:** [2026-06-04-growth-task-4-prune-stale-1248-metadata-files-lock-mint-to-528.md](file:///home/ubuntu/hermes/workspace/GoalChain/docs/intake/2026-06-04-growth-task-4-prune-stale-1248-metadata-files-lock-mint-to-528.md)
Please execute the implementation following the steps outlined in this intake brief.

## Owner
opencode

## Priority
P1

## Context
Requested by Nico via Manager (hermes-ceo profile). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: `feat/*` or `fix/*`
  - antigravity: `exp/antigravity-*`
  - opencode: `exp/opencode-*`
  - grok: `exp/grok-*`
- Draft PR for Antigravity/Nico review — no direct merge to `main` unless `cambio urgente`

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #298
