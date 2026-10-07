# Fractured Code -- Continuity QC report

- Tool: `ContinuityGuard` v0.1.5 (local, zero-network)
- Generated: 2026-09-15T10:45:28Z  |  runtime 107.21s
- Film root: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM`
- Scenes: FC-S03, FC-S04, FC-S06, FC-S06A, FC-S07, FC-S08
- Raw ContinuityGuard JSON: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard/continuityguard_report.json`
- Machine-readable aggregate: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard/film_continuity_report.json`

## 1. Preflight (ffprobe)

| scene | status | cut_dur_s | res | fps | shots | shots_sum_s | cut-sum_delta_s |
|---|---|---|---|---|---|---|---|
| FC-S03 | OK | 48.354329 | 1280x720 | 24.0 | 8 | 48.33 | 0.02 |
| FC-S04 | OK | 46.354329 | 1280x720 | 24.0 | 8 | 46.33 | 0.02 |
| FC-S06 | OK | 44.354329 | 1280x720 | 24.0 | 8 | 44.33 | 0.02 |
| FC-S06A | OK | 24.187663 | 1280x720 | 24.0 | 4 | 24.17 | 0.02 |
| FC-S07 | OK | 43.354329 | 1280x720 | 24.0 | 8 | 43.33 | 0.02 |
| FC-S08 | OK | 37.312663 | 1280x720 | 24.0 | 7 | 37.29 | 0.02 |


## 2. PASS 1 -- physics on the concatenated cut (CG03)

A cut is a hard concatenation, so the frame-to-frame heuristic fires at shot boundaries by construction. Flags classified `likely_cut_boundary` are expected artefacts of the concat, not defects.

| scene | flags | on_cut_boundary | within_shot | max_ratio |
|---|---|---|---|---|
| FC-S03 | 0 | 0 | 0 | 0.0 |
| FC-S04 | 0 | 0 | 0 | 0.0 |
| FC-S06 | 0 | 0 | 0 | 0.0 |
| FC-S06A | 0 | 0 | 0 | 0.0 |
| FC-S07 | 0 | 0 | 0 | 0.0 |
| FC-S08 | 0 | 0 | 0 | 0.0 |


## 3. PASS 2 -- physics per shot (CG03, no concat boundaries)

| scene | shots_scanned | flags | max_ratio |
|---|---|---|---|
| FC-S03 | 8 | 0 | 0.0 |
| FC-S04 | 8 | 0 | 0.0 |
| FC-S06 | 8 | 4 | 5.36 |
| FC-S06A | 4 | 0 | 0.0 |
| FC-S07 | 8 | 0 | 0.0 |
| FC-S08 | 7 | 1 | 6.4 |


Shot-level flags (real within-shot motion discontinuities):
| scene | clip | t_s | ratio |
|---|---|---|---|
| FC-S06 | shot-S06-01.mp4 | 3.48 | 5.36 |
| FC-S06 | shot-S06-01.mp4 | 3.91 | 4.55 |
| FC-S06 | shot-S06-01.mp4 | 4.35 | 3.81 |
| FC-S06 | shot-S06-05.mp4 | 0.0 | 3.18 |
| FC-S08 | shot-S08-06.mp4 | 2.61 | 6.4 |


## 4. PASS 3 -- character consistency on face crops (CG02)

- Face clips staged: mileochen_FC-S03.mp4, mileochen_FC-S04.mp4, mileochen_FC-S07.mp4, sierracatalano_FC-S06.mp4, sierracatalano_FC-S08.mp4
- Characters tracked: 2  |  threshold: 0.88  |  flags: 0

Unflagged (at/above threshold): mileochen_FC-S03.mp4, mileochen_FC-S04.mp4, mileochen_FC-S07.mp4, sierracatalano_FC-S06.mp4, sierracatalano_FC-S08.mp4

All pairwise face-similarity scores (CLI only prints flagged ones, so these are computed directly from the same bundled model):
| character | clip_a | clip_b | similarity | verdict |
|---|---|---|---|---|
| mileochen | mileochen_FC-S03.mp4 | mileochen_FC-S04.mp4 | 0.9762 | ok |
| mileochen | mileochen_FC-S03.mp4 | mileochen_FC-S07.mp4 | 0.9394 | ok |
| mileochen | mileochen_FC-S04.mp4 | mileochen_FC-S07.mp4 | 0.9148 | ok |
| sierracatalano | sierracatalano_FC-S06.mp4 | sierracatalano_FC-S08.mp4 | 0.9236 | ok |


Scenes without a usable face clip:
| scene | reason | face_frames |
|---|---|---|
| FC-S06A | no_primary_character |  |


## 5. Known limits (read before acting on a flag)

- CG02/CG03 are heuristics, not detectors. Every flag is 'worth a human look', nothing more.
- CG02's bundled embedding is a generic ImageNet MobileNetV2 (no face-specific model); this pipeline works around that by feeding it face crops, but the embedding itself is not a face-recognition network.
- 'Primary character' is taken from each scene's `character_lock.primary`; the largest detected face per frame is assumed to be that character. In multi-character framing the assumption can be wrong.
- Nothing was regenerated; renders are read-only inputs. No network calls are made.

