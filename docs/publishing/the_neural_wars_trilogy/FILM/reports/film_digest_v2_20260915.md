# Film Digest v2 — Fractured Code (FC_full_conform_v2)

- Generated: 2026-09-15 11:40 UTC
- Master: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC_full_conform_v2.mp4`
- Protocol: FILM_DIGEST_v1 (ops/FILM_DIGEST_AND_V3_PLAN.md)
- Objective methods: ai-film-visual-qc (ffprobe / volumedetect / motion MAD / silence)
- Vision pass: **TODO** (checklist + frame paths; no paid vision run)

## 1. Tech metrics

| Field | Value |
|---|---|
| Duration | 382.417 s (06:22.417) |
| Resolution | 1280x720 |
| FPS | 24.0 |
| Video codec | h264 |
| Audio | aac 44100 Hz / 2ch |
| Size | 239.8 MB |
| mean_volume | -22.2 dB |
| max_volume | -1.8 dB |
| Integrated LUFS | -21.2 |
| LRA | 13.2 LU |
| True peak | None dBFS |
| Motion MAD (4fps 96x54) | mean=9.074584007263184 median=7.00694465637207 static_flag=False |

## 2. Per-scene cuts (conform)

| Scene | Path | Dur (s) | mean dB | max dB | LUFS | Motion MAD |
|---|---|---|---|---|---|---|
| FC-S01 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S01_cut_conform.mp4` | 48.35 | -20.8 | -1.8 | -20.1 | 8.892027854919434 |
| FC-S02 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S02_cut_conform.mp4` | 48.35 | -20.4 | -1.9 | -19.9 | 9.228118896484375 |
| FC-S03 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S03_cut_conform.mp4` | 48.35 | -23.1 | -1.9 | -22.0 | 4.889585971832275 |
| FC-S04 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S04_cut_conform.mp4` | 46.35 | -21.7 | -2.0 | -20.0 | 8.107540130615234 |
| FC-S05 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S05_cut_conform.mp4` | 48.35 | -21.7 | -1.7 | -20.0 | 10.192005157470703 |
| FC-S06 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S06_cut_conform.mp4` | 44.35 | -21.8 | -3.7 | -20.1 | 10.22639274597168 |
| FC-S06A | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S06A_cut_conform.mp4` | 24.19 | -20.9 | -5.1 | -19.9 | 13.939675331115723 |
| FC-S07 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S07_cut_conform.mp4` | 43.35 | -20.4 | -2.0 | -20.5 | 6.763654708862305 |
| FC-S08 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S08_cut_conform.mp4` | 37.31 | -21.2 | -1.9 | -19.9 | 11.468603134155273 |

## 3. Audio seams (adjacent mean-dB jumps)

Threshold: flag jumps **>6 dB** at scene boundaries.

| Boundary | mean_A -> mean_B | delta dB | Flag |
|---|---|---|---|
| FC-S01 -> FC-S02 @ ~00:48.353 | -20.8 -> -20.4 | +0.40 | ok |
| FC-S02 -> FC-S03 @ ~01:36.707 | -20.4 -> -23.1 | -2.70 | ok |
| FC-S03 -> FC-S04 @ ~02:25.060 | -23.1 -> -21.7 | +1.40 | ok |
| FC-S04 -> FC-S05 @ ~03:11.413 | -21.7 -> -21.7 | +0.00 | ok |
| FC-S05 -> FC-S06 @ ~03:59.767 | -21.7 -> -21.8 | -0.10 | ok |
| FC-S06 -> FC-S06A @ ~04:44.120 | -21.8 -> -20.9 | +0.90 | ok |
| FC-S06A -> FC-S07 @ ~05:08.307 | -20.9 -> -20.4 | +0.50 | ok |
| FC-S07 -> FC-S08 @ ~05:51.660 | -20.4 -> -21.2 | -0.80 | ok |

### Silences (master, noise=-40 dB, min 0.4 s)

- None detected at this threshold.

## 4. Architect presence (vision checklist — TODO)

Lock status (post-digest check 2026-09-15): **YES** — `FILM/locks/LOCK_SHEET_THE_ARCHITECT.md`, `FILM/locks/refs/the_architect/`, `WORLD_TOKENS.json` characters.the_architect, plus `scenes/FC-AX_ARCHITECT_INSERTS.json` / `reports/FC-AX_ARCHITECT_BREAKDOWN.md`. Vision screen-time checklist still TODO.

Manual / Hermes vision checklist:
- [ ] Screen time: is The Architect visible / implied?
- [ ] Coil / indigo motif without readable on-screen text
- [ ] Threat beat readable without dialogue
- [ ] Insert slots: between S02-S03, S05-S06, pre-S06A, pre-S08

### Midframe paths (per scene)

- FC-S01: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S01_mid.jpg`
- FC-S02: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S02_mid.jpg`
- FC-S03: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S03_mid.jpg`
- FC-S04: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S04_mid.jpg`
- FC-S05: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S05_mid.jpg`
- FC-S06: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S06_mid.jpg`
- FC-S06A: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S06A_mid.jpg`
- FC-S07: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S07_mid.jpg`
- FC-S08: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/midframes/FC-S08_mid.jpg`

### 1 fps contact frames

- Directory: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260915/contact_1fps`
- Frame count: 382
- Vision TODO: sample every ~8-12 s (avoid near-duplicate pairs as defects).

## 5. Action density notes

| Scene | Motion MAD | Dur | Note |
|---|---|---|---|
| FC-S06A | 13.939675331115723 | 24.2s | high motion |
| FC-S08 | 11.468603134155273 | 37.3s | high motion |
| FC-S06 | 10.22639274597168 | 44.4s | high motion |
| FC-S05 | 10.192005157470703 | 48.4s | high motion |
| FC-S02 | 9.228118896484375 | 48.4s | high motion |
| FC-S01 | 8.892027854919434 | 48.4s | high motion |
| FC-S04 | 8.107540130615234 | 46.4s | high motion |
| FC-S07 | 6.763654708862305 | 43.4s | high motion |
| FC-S03 | 4.889585971832275 | 48.4s | high motion |

Known CG motion flags (prior ContinuityGuard): FC-S06-01, FC-S06-05, FC-S08-06.

## 6. improve_20260915 assets

- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S01_cut_conform.mp4 (35.9 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S01_cut_v2.mp4 (35.7 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S02_cut_conform.mp4 (33.2 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S03_cut_conform.mp4 (18.9 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S04_cut_conform.mp4 (24.1 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S05_cut_conform.mp4 (35.9 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S06A_cut_conform.mp4 (18.8 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S06A_cut_v2.mp4 (18.7 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S06_cut_conform.mp4 (30.1 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S07_cut_conform.mp4 (29.6 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC-S08_cut_conform.mp4 (20.5 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v2.mp4 (239.8 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/index.html (0.0 MB)`

## 7. Priority fix list

### Red / P0-P1

1. P0 music: replace 528 Hz drone placeholder with continuous dark techno/cyber thriller bed (~382-390 s, indigo/Coil vibe, no vocals, loopable ends). See docs/ops/MUSIC_BED_SPEC_FC_v3.md.
2. P1 Architect: create lock sheet + WORLD_TOKENS entry + 3-5 insert shots (no SuperGrok Imagine in this digest pass).

### Soft / follow-ups

1. Vision pass: run Hermes ai-film-visual-qc on midframes/contact (Architect / text / climax).
2. Optional ContinuityGuard re-scan after Architect inserts.

---
*End of digest. Do not treat sampling-grid near-duplicates as defects.*
