# Fractured Code -- Continuity QC report

- Tool: `ContinuityGuard` v0.1.5 (local, zero-network)
- Generated: 2026-10-04T09:23:02Z  |  runtime 35.25s
- Film root: `/home/ubuntu/fc_grokbot_20261004/cg_root_r4`
- Scenes: FC-S08, FC-S09
- Raw ContinuityGuard JSON: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/continuity_S09_r4_20261004/continuityguard_report.json`
- Machine-readable aggregate: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/continuity_S09_r4_20261004/film_continuity_report.json`

## 1. Preflight (ffprobe)

| scene | status | cut_dur_s | res | fps | shots | shots_sum_s | cut-sum_delta_s |
|---|---|---|---|---|---|---|---|
| FC-S08 | OK | 48.273031 | 848x480 | 24.0 | 7 | 37.29 | 10.98 |
| FC-S09 | OK | 43.916667 | 1280x720 | 24.0 | 9 | 50.29 | -6.37 |


## 2. PASS 1 -- physics on the concatenated cut (CG03)

A cut is a hard concatenation, so the frame-to-frame heuristic fires at shot boundaries by construction. Flags classified `likely_cut_boundary` are expected artefacts of the concat, not defects.

| scene | flags | on_cut_boundary | within_shot | max_ratio |
|---|---|---|---|---|
| FC-S08 | 5 | 2 | 3 | 5.17 |
| FC-S09 | 0 | 0 | 0 | 0.0 |


Within-shot flags on the cut:
| scene | t_s | frame | ratio |
|---|---|---|---|
| FC-S08 | 7.83 | 18 | 4.05 |
| FC-S08 | 23.91 | 55 | 3.32 |
| FC-S08 | 40.0 | 92 | 3.38 |


## 3. PASS 2 -- physics per shot (CG03, no concat boundaries)

| scene | shots_scanned | flags | max_ratio |
|---|---|---|---|
| FC-S08 | 7 | 1 | 6.4 |
| FC-S09 | 9 | 0 | 0.0 |


Shot-level flags (real within-shot motion discontinuities):
| scene | clip | t_s | ratio |
|---|---|---|---|
| FC-S08 | shot-S08-06.mp4 | 2.61 | 6.4 |


## 4. PASS 3 -- character consistency on face crops (CG02)

- Face clips staged: sierracatalano_FC-S08.mp4, sierracatalano_FC-S09.mp4
- Characters tracked: 1  |  threshold: 0.88  |  flags: 1

| clip | character | reference | similarity |
|---|---|---|---|
| sierracatalano_FC-S09.mp4 | sierracatalano | sierracatalano_FC-S08.mp4 | 0.8405 |


Unflagged (at/above threshold): sierracatalano_FC-S08.mp4

All pairwise face-similarity scores (CLI only prints flagged ones, so these are computed directly from the same bundled model):
| character | clip_a | clip_b | similarity | verdict |
|---|---|---|---|---|
| sierracatalano | sierracatalano_FC-S08.mp4 | sierracatalano_FC-S09.mp4 | 0.8445 | FLAG |


## 5. Known limits (read before acting on a flag)

- CG02/CG03 are heuristics, not detectors. Every flag is 'worth a human look', nothing more.
- CG02's bundled embedding is a generic ImageNet MobileNetV2 (no face-specific model); this pipeline works around that by feeding it face crops, but the embedding itself is not a face-recognition network.
- 'Primary character' is taken from each scene's `character_lock.primary`; the largest detected face per frame is assumed to be that character. In multi-character framing the assumption can be wrong.
- Nothing was regenerated; renders are read-only inputs. No network calls are made.

