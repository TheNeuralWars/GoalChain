# Fractured Code -- Continuity QC report

- Tool: `ContinuityGuard` v0.1.5 (local, zero-network)
- Generated: 2026-10-06T07:05:54Z  |  runtime 15.66s
- Film root: `/home/ubuntu/.hermes/profiles/hermes-ceo/cache/scratch/cg_root_r6`
- Scenes: FC-S08, FC-S09
- Raw ContinuityGuard JSON: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/continuity_S09_r6_20261006/continuityguard_report.json`
- Machine-readable aggregate: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/continuity_S09_r6_20261006/film_continuity_report.json`

## 1. Preflight (ffprobe)

| scene | status | cut_dur_s | res | fps | shots | shots_sum_s | cut-sum_delta_s |
|---|---|---|---|---|---|---|---|
| FC-S08 | OK | 48.273031 | 848x480 | 24.0 | 7 | 37.29 | 10.98 |
| FC-S09 | OK | 58.461 | 1280x720 | 24.0 | 12 | 58.46 | 0.0 |


## 2. PASS 1 -- physics on the concatenated cut (CG03)

A cut is a hard concatenation, so the frame-to-frame heuristic fires at shot boundaries by construction. Flags classified `likely_cut_boundary` are expected artefacts of the concat, not defects.

| scene | flags | on_cut_boundary | within_shot | max_ratio |
|---|---|---|---|---|
| FC-S08 | 0 | 0 | 0 | 0.0 |
| FC-S09 | 0 | 0 | 0 | 0.0 |


## 3. PASS 2 -- physics per shot (CG03, no concat boundaries)

| scene | shots_scanned | flags | max_ratio |
|---|---|---|---|
| FC-S08 | 0 | 0 | 0.0 |
| FC-S09 | 0 | 0 | 0.0 |


## 4. PASS 3 -- character consistency on face crops (CG02)

- Face clips staged: sierracatalano_FC-S08.mp4, sierracatalano_FC-S09.mp4
- Characters tracked: 1  |  threshold: 0.88  |  flags: 1

| clip | character | reference | similarity |
|---|---|---|---|
| sierracatalano_FC-S09.mp4 | sierracatalano | sierracatalano_FC-S08.mp4 | 0.8432 |


Unflagged (at/above threshold): sierracatalano_FC-S08.mp4

All pairwise face-similarity scores (CLI only prints flagged ones, so these are computed directly from the same bundled model):
| character | clip_a | clip_b | similarity | verdict |
|---|---|---|---|---|
| sierracatalano | sierracatalano_FC-S08.mp4 | sierracatalano_FC-S09.mp4 | 0.8399 | FLAG |


## 5. Known limits (read before acting on a flag)

- CG02/CG03 are heuristics, not detectors. Every flag is 'worth a human look', nothing more.
- CG02's bundled embedding is a generic ImageNet MobileNetV2 (no face-specific model); this pipeline works around that by feeding it face crops, but the embedding itself is not a face-recognition network.
- 'Primary character' is taken from each scene's `character_lock.primary`; the largest detected face per frame is assumed to be that character. In multi-character framing the assumption can be wrong.
- Nothing was regenerated; renders are read-only inputs. No network calls are made.

