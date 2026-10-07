# Fractured Code -- Continuity QC report (FC-AX inserts)

- Tool: `ContinuityGuard` v0.1.5 (local, zero-network)
- Generated: 2026-09-23T16:18:44.613Z  |  runtime 7.519s
- Film root: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM`
- Scenes: FC-AX (AX01…AX05)
- Raw ContinuityGuard JSON: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard_pulse_20260923_ax/continuityguard_report.json`
- Machine-readable aggregate: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard_pulse_20260923_ax/film_continuity_report.json`

## 1. Preflight (ffprobe)

| shot | dur_s | res | fps | size_mb |
|---|---|---|---|---|
| FC-AX01 | 5.04 | 1280x720 | 24.0 | 2.46 |
| FC-AX02 | 5.04 | 1280x720 | 24.0 | 2.70 |
| FC-AX03 | 6.04 | 1280x720 | 24.0 | 3.99 |
| FC-AX04 | 5.04 | 1280x720 | 24.0 | 1.35 |
| FC-AX05 | 4.04 | 1280x720 | 24.0 | 2.98 |

Sum duration: **25.21 s**

## 2. Physics plausibility

- Flagged shots: **0**
- Discontinuity multiplier: 3

## 3. Character consistency

- Characters tracked: 0
- Flagged shots: **0** (threshold 0.88)

Architect inserts are silhouette / system-gaze / Coil motif by design — no primary face lock expected.

## 4. Verdict

**PASS** for ContinuityGuard heuristics on FC-AX01…05. No regen queued. No Imagine.

## 5. Limits

- CG heuristics only; flags need a human look.
- Nothing regenerated; renders read-only. Zero network calls.
