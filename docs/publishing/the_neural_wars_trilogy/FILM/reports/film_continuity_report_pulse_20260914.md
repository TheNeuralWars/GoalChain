# Fractured Code -- Continuity QC report

- Tool: `ContinuityGuard` v0.1.5 (local, zero-network)
- Generated: 2026-09-14T16:04:38Z  |  runtime 197.01s
- Film root: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM`
- Scenes: FC-S01, FC-S02, FC-S03, FC-S04, FC-S05, FC-S06, FC-S06A, FC-S07, FC-S08
- Raw ContinuityGuard JSON: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard/continuityguard_report.json`
- Machine-readable aggregate: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard/film_continuity_report.json`

## 1. Preflight (ffprobe)

| scene | status | cut_dur_s | res | fps | shots | shots_sum_s | cut-sum_delta_s |
|---|---|---|---|---|---|---|---|
| FC-S01 | OK | 62.356364 | 848x480 | 24.0 | 8 | 48.33 | 14.03 |
| FC-S02 | OK | 64.356364 | 848x480 | 24.0 | 8 | 48.33 | 16.03 |
| FC-S03 | OK | 64.356364 | 848x480 | 24.0 | 8 | 48.33 | 16.03 |
| FC-S04 | OK | 64.356364 | 848x480 | 24.0 | 5 | 30.21 | 34.15 |
| FC-S05 | OK | 64.356364 | 848x480 | 24.0 | 8 | 48.33 | 16.03 |
| FC-S06 | OK | 64.356364 | 848x480 | 24.0 | 1 | 6.04 | 58.32 |
| FC-S06A | MISSING_CUT | None | NonexNone | None | 0 | None | None |
| FC-S07 | OK | 64.356364 | 848x480 | 24.0 | 0 | 0 | 64.36 |
| FC-S08 | OK | 48.273031 | 848x480 | 24.0 | 0 | 0 | 48.27 |


## 2. PASS 1 -- physics on the concatenated cut (CG03)

A cut is a hard concatenation, so the frame-to-frame heuristic fires at shot boundaries by construction. Flags classified `likely_cut_boundary` are expected artefacts of the concat, not defects.

| scene | flags | on_cut_boundary | within_shot | max_ratio |
|---|---|---|---|---|
| FC-S01 | 7 | 1 | 6 | 6.84 |
| FC-S02 | 8 | 2 | 6 | 6.1 |
| FC-S03 | 6 | 2 | 4 | 6.09 |
| FC-S04 | 7 | 1 | 6 | 5.3 |
| FC-S05 | 3 | 1 | 2 | 3.53 |
| FC-S06 | 9 | 0 | 9 | 5.77 |
| FC-S07 | 7 | 0 | 7 | 7.05 |
| FC-S08 | 5 | 0 | 5 | 5.17 |


Within-shot flags on the cut:
| scene | t_s | frame | ratio |
|---|---|---|---|
| FC-S01 | 7.83 | 18 | 5.07 |
| FC-S01 | 15.65 | 36 | 6.84 |
| FC-S01 | 17.39 | 40 | 3.08 |
| FC-S01 | 31.74 | 73 | 4.49 |
| FC-S01 | 40.0 | 92 | 4.93 |
| FC-S01 | 56.09 | 129 | 4.38 |
| FC-S02 | 7.83 | 18 | 3.49 |
| FC-S02 | 15.65 | 36 | 4.07 |
| FC-S02 | 31.74 | 73 | 4.78 |
| FC-S02 | 40.0 | 92 | 5.28 |
| FC-S02 | 53.91 | 124 | 3.15 |
| FC-S02 | 56.09 | 129 | 6.1 |
| FC-S03 | 15.65 | 36 | 4.54 |
| FC-S03 | 31.74 | 73 | 6.09 |
| FC-S03 | 40.0 | 92 | 4.33 |
| FC-S03 | 56.09 | 129 | 4.31 |
| FC-S04 | 7.83 | 18 | 3.59 |
| FC-S04 | 15.65 | 36 | 5.3 |
| FC-S04 | 31.74 | 73 | 3.43 |
| FC-S04 | 40.0 | 92 | 3.14 |
| FC-S04 | 47.83 | 110 | 3.37 |
| FC-S04 | 56.09 | 129 | 4.54 |
| FC-S05 | 31.74 | 73 | 3.53 |
| FC-S05 | 56.09 | 129 | 3.4 |
| FC-S06 | 7.83 | 18 | 3.28 |
| FC-S06 | 15.65 | 36 | 4.22 |
| FC-S06 | 23.91 | 55 | 3.57 |
| FC-S06 | 33.48 | 77 | 4.86 |
| FC-S06 | 40.0 | 92 | 3.56 |
| FC-S06 | 47.83 | 110 | 3.16 |
| FC-S06 | 56.09 | 129 | 5.77 |
| FC-S06 | 59.57 | 137 | 4.17 |
| FC-S06 | 61.74 | 142 | 4.09 |
| FC-S07 | 7.83 | 18 | 4.31 |
| FC-S07 | 15.65 | 36 | 4.62 |
| FC-S07 | 23.91 | 55 | 4.25 |
| FC-S07 | 31.74 | 73 | 4.21 |
| FC-S07 | 40.0 | 92 | 7.05 |
| FC-S07 | 47.83 | 110 | 4.73 |
| FC-S07 | 56.09 | 129 | 4.74 |
| FC-S08 | 7.83 | 18 | 4.05 |
| FC-S08 | 15.65 | 36 | 5.17 |
| FC-S08 | 23.91 | 55 | 3.32 |
| FC-S08 | 31.74 | 73 | 3.83 |
| FC-S08 | 40.0 | 92 | 3.38 |


## 3. PASS 2 -- physics per shot (CG03, no concat boundaries)

| scene | shots_scanned | flags | max_ratio |
|---|---|---|---|
| FC-S01 | 8 | 0 | 0.0 |
| FC-S02 | 8 | 0 | 0.0 |
| FC-S03 | 8 | 0 | 0.0 |
| FC-S04 | 5 | 0 | 0.0 |
| FC-S05 | 8 | 0 | 0.0 |
| FC-S06 | 1 | 3 | 5.36 |


Shot-level flags (real within-shot motion discontinuities):
| scene | clip | t_s | ratio |
|---|---|---|---|
| FC-S06 | shot-S06-01.mp4 | 3.48 | 5.36 |
| FC-S06 | shot-S06-01.mp4 | 3.91 | 4.55 |
| FC-S06 | shot-S06-01.mp4 | 4.35 | 3.81 |


## 4. PASS 3 -- character consistency on face crops (CG02)

- Face clips staged: mileochen_FC-S01.mp4, mileochen_FC-S02.mp4, mileochen_FC-S03.mp4, mileochen_FC-S04.mp4, mileochen_FC-S05.mp4, mileochen_FC-S07.mp4, sierracatalano_FC-S06.mp4, sierracatalano_FC-S08.mp4
- Characters tracked: 2  |  threshold: 0.88  |  flags: 0

Unflagged (at/above threshold): mileochen_FC-S01.mp4, mileochen_FC-S02.mp4, mileochen_FC-S03.mp4, mileochen_FC-S04.mp4, mileochen_FC-S05.mp4, mileochen_FC-S07.mp4, sierracatalano_FC-S06.mp4, sierracatalano_FC-S08.mp4

All pairwise face-similarity scores (CLI only prints flagged ones, so these are computed directly from the same bundled model):
| character | clip_a | clip_b | similarity | verdict |
|---|---|---|---|---|
| mileochen | mileochen_FC-S01.mp4 | mileochen_FC-S02.mp4 | 0.9565 | ok |
| mileochen | mileochen_FC-S01.mp4 | mileochen_FC-S03.mp4 | 0.95 | ok |
| mileochen | mileochen_FC-S01.mp4 | mileochen_FC-S04.mp4 | 0.9623 | ok |
| mileochen | mileochen_FC-S01.mp4 | mileochen_FC-S05.mp4 | 0.9169 | ok |
| mileochen | mileochen_FC-S01.mp4 | mileochen_FC-S07.mp4 | 0.9041 | ok |
| mileochen | mileochen_FC-S02.mp4 | mileochen_FC-S03.mp4 | 0.9366 | ok |
| mileochen | mileochen_FC-S02.mp4 | mileochen_FC-S04.mp4 | 0.9595 | ok |
| mileochen | mileochen_FC-S02.mp4 | mileochen_FC-S05.mp4 | 0.9338 | ok |
| mileochen | mileochen_FC-S02.mp4 | mileochen_FC-S07.mp4 | 0.9028 | ok |
| mileochen | mileochen_FC-S03.mp4 | mileochen_FC-S04.mp4 | 0.9565 | ok |
| mileochen | mileochen_FC-S03.mp4 | mileochen_FC-S05.mp4 | 0.9151 | ok |
| mileochen | mileochen_FC-S03.mp4 | mileochen_FC-S07.mp4 | 0.9439 | ok |
| mileochen | mileochen_FC-S04.mp4 | mileochen_FC-S05.mp4 | 0.9352 | ok |
| mileochen | mileochen_FC-S04.mp4 | mileochen_FC-S07.mp4 | 0.9235 | ok |
| mileochen | mileochen_FC-S05.mp4 | mileochen_FC-S07.mp4 | 0.9232 | ok |
| sierracatalano | sierracatalano_FC-S06.mp4 | sierracatalano_FC-S08.mp4 | 0.8947 | ok |


Scenes without a usable face clip:
| scene | reason | face_frames |
|---|---|---|
| FC-S06A | no_cut_file |  |


## 5. Known limits (read before acting on a flag)

- CG02/CG03 are heuristics, not detectors. Every flag is 'worth a human look', nothing more.
- CG02's bundled embedding is a generic ImageNet MobileNetV2 (no face-specific model); this pipeline works around that by feeding it face crops, but the embedding itself is not a face-recognition network.
- 'Primary character' is taken from each scene's `character_lock.primary`; the largest detected face per frame is assumed to be that character. In multi-character framing the assumption can be wrong.
- Nothing was regenerated; renders are read-only inputs. No network calls are made.

