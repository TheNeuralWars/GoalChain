# Fractured Code -- Continuity QC report

- Tool: `ContinuityGuard` v0.1.5 (local, zero-network)
- Generated: 2026-09-22T16:10:24Z  |  runtime 9.56s
- Film root: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM`
- Scenes: FC-S06A
- Raw ContinuityGuard JSON: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard_pulse_20260922_s06a/continuityguard_report.json`
- Machine-readable aggregate: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard_pulse_20260922_s06a/film_continuity_report.json`

## 1. Preflight (ffprobe)

| scene | status | cut_dur_s | res | fps | shots | shots_sum_s | cut-sum_delta_s |
|---|---|---|---|---|---|---|---|
| FC-S06A | OK | 24.187663 | 1280x720 | 24.0 | 4 | 24.17 | 0.02 |


## 2. PASS 1 -- physics on the concatenated cut (CG03)

A cut is a hard concatenation, so the frame-to-frame heuristic fires at shot boundaries by construction. Flags classified `likely_cut_boundary` are expected artefacts of the concat, not defects.

| scene | flags | on_cut_boundary | within_shot | max_ratio |
|---|---|---|---|---|
| FC-S06A | 0 | 0 | 0 | 0.0 |


## 3. PASS 2 -- physics per shot (CG03, no concat boundaries)

| scene | shots_scanned | flags | max_ratio |
|---|---|---|---|
| FC-S06A | 4 | 0 | 0.0 |


## 4. PASS 3 -- character consistency on face crops (CG02)

No consistency pass: no face clips staged

Scenes without a usable face clip:
| scene | reason | face_frames |
|---|---|---|
| FC-S06A | no_primary_character |  |


## 5. Known limits (read before acting on a flag)

- CG02/CG03 are heuristics, not detectors. Every flag is 'worth a human look', nothing more.
- CG02's bundled embedding is a generic ImageNet MobileNetV2 (no face-specific model); this pipeline works around that by feeding it face crops, but the embedding itself is not a face-recognition network.
- 'Primary character' is taken from each scene's `character_lock.primary`; the largest detected face per frame is assumed to be that character. In multi-character framing the assumption can be wrong.
- Nothing was regenerated; renders are read-only inputs. No network calls are made.

