# Film continuity QC — Fractured Code (GoalChain)

Local, zero-network QA for the rendered scene cuts of *The Neural Wars: Fractured Code*.
Nothing here regenerates or re-encodes the renders; they are read-only inputs.

## Tool

**ContinuityGuard CLI v0.1.5** (Apache-2.0, npm `continuityguard-cli`)
scores already-generated clips for (a) cross-shot visual/character drift and
(b) frame-to-frame motion discontinuity.

    install path : /data/apps/tools/node_modules/continuityguard-cli
    binary       : /data/apps/tools/node_modules/.bin/continuityguard
    invoke       : /data/apps/tools/node_modules/.bin/continuityguard scan <dir> --json --fps 2.3

Supporting local deps installed alongside it:

    /data/apps/tools/cg-venv                    python venv, opencv-python-headless 4.14 + numpy
    /data/apps/tools/models/face_detection_yunet_2023mar.onnx
                                                OpenCV Zoo YuNet face detector (232,589 B,
                                                sha256 8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4)

## Runner

    /data/apps/GoalChain/scripts/video/scan_film_continuity.sh

    ./scan_film_continuity.sh                          # every scene that has a cut
    ./scan_film_continuity.sh --scenes FC-S01 FC-S03   # subset
    ./scan_film_continuity.sh --skip-face              # physics passes only (fast)

Overridable env vars: `FILM_ROOT`, `OUT_DIR`, `CG_BIN`, `CG_PY`, `CG_FPS`, `FACE_FPS`.

Helper modules in the same directory:

| file | role |
|---|---|
| `cg_continuity_core.py` | orchestrates the three passes, aggregates JSON + Markdown |
| `cg_face_stage.py` | face-detects each scene's primary character and writes `\<slug\>_\<SCENE\>.mp4` clips |
| `cg_pairwise_similarity.mjs` | prints the *unflagged* similarity scores too (the CLI only prints flagged ones) |

## Why the pipeline exists

ContinuityGuard's CG02 embeds the **whole decoded frame** (224×224, aspect-distorted)
with a generic ImageNet MobileNetV2 — there is no face crop inside the tool. On a
cinematic wide shot that mostly measures scene similarity, and it only groups clips
that follow the `<character>_<shot-id>.mp4` filename convention. So the runner:

1. **PASS 1 — physics on each scene cut.** Useful, but a cut is a hard concatenation:
   the frame-to-frame heuristic fires at every shot boundary by construction. The
   report classifies each flag `likely_cut_boundary` vs `within_shot` using the
   per-shot durations from ffprobe.
2. **PASS 2 — physics per individual shot.** No concat boundaries, so any flag here
   is a real within-shot motion discontinuity. This is the pass that carries signal.
3. **PASS 3 — character consistency on face crops.** Frames are sampled from each
   cut, the largest face per frame is detected (YuNet, Haar fallback), cropped with a
   45 % margin, and encoded as one clip per `(primary character, scene)`. That makes
   CG02 an actual cross-scene face-drift check for the scene's
   `character_lock.primary`. Pairwise cosine scores are reported for every pair, not
   just the flagged ones.

Cut files are staged with a `scene-` prefix rather than `FC-S01_...` on purpose: the
`<alpha>_` pattern is what CG02 uses to bucket clips as one "character", and letting
all eight cuts land in one bucket would emit meaningless cross-scene flags.

## Outputs

Default `OUT_DIR=/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard`:

    film_continuity_report.json     aggregated: preflight, 3 passes, raw scans
    film_continuity_report.md       human-readable summary
    continuityguard_report.json     raw ContinuityGuard scan JSON, one entry per pass
    runs/                           archived point-in-time reports
    .stage/                         disposable hardlink/face-crop staging (safe to delete)

## Reading the numbers

- Every flag is *worth a human look*, not a confirmed defect. CG02/CG03 are heuristics.
- Face similarity is cosine over a generic MobileNetV2 embedding of a face crop — a
  real drift signal, but **not** a face-recognition network.
- "Primary character" comes from each scene's `character_lock.primary`; the largest
  face in frame is assumed to be that character. In two-handers (e.g. FC-S03, Mileo +
  Kora) that assumption can pick the wrong person — read flagged scenes by eye.
- Archived reference run: `runs/film_continuity_report_S01_S03.*`
