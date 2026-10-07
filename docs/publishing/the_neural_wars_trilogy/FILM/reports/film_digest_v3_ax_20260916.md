# Film Digest v3 AX — Fractured Code (FC_full_conform_v3_ax)

- Generated: 2026-09-16 07:39 UTC
- Master: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/FC_full_conform_v3_ax.mp4`
- Protocol: FILM_DIGEST_v1 (ops/FILM_DIGEST_AND_V3_PLAN.md)
- Objective methods: ai-film-visual-qc (ffprobe / volumedetect / motion MAD / silence)
- Vision pass: **TODO** (checklist + frame paths; no paid vision run)

## 1. Tech metrics

| Field | Value |
|---|---|
| Duration | 407.625 s (06:47.625) |
| Resolution | 1280x720 |
| FPS | 24.0 |
| Video codec | h264 |
| Audio | aac 44100 Hz / 2ch |
| Size | 237.5 MB |
| mean_volume | -22.8 dB |
| max_volume | -1.9 dB |
| Integrated LUFS | -20.0 |
| LRA | 18.5 LU |
| True peak | None dBFS |
| Motion MAD (4fps 96x54) | mean=8.90672492980957 median=6.743634223937988 static_flag=False |

## 2. Per-scene cuts (conform)

| Scene | Path | Dur (s) | mean dB | max dB | LUFS | Motion MAD |
|---|---|---|---|---|---|---|
| FC-S01 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S01_cut_conform.mp4` | 48.35 | -20.8 | -1.8 | -20.1 | 8.892027854919434 |
| FC-S02 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S02_cut_conform.mp4` | 48.35 | -20.4 | -1.9 | -19.9 | 9.228118896484375 |
| FC-AX01 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX01.mp4` | 5.04 | -34.3 | -19.1 | -34.0 | 6.028863906860352 |
| FC-S03 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S03_cut_conform.mp4` | 48.35 | -23.1 | -1.9 | -22.0 | 4.889585971832275 |
| FC-S04 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S04_cut_conform.mp4` | 46.35 | -21.7 | -2.0 | -20.0 | 8.107540130615234 |
| FC-S05 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S05_cut_conform.mp4` | 48.35 | -21.7 | -1.7 | -20.0 | 10.192005157470703 |
| FC-AX02 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX02.mp4` | 5.04 | -38.0 | -18.3 | -38.3 | 6.132147312164307 |
| FC-S06 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S06_cut_conform.mp4` | 44.35 | -21.8 | -3.7 | -20.1 | 10.22639274597168 |
| FC-AX03 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX03.mp4` | 6.04 | -22.4 | -9.0 | -23.0 | 2.990572690963745 |
| FC-S06A | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S06A_cut_conform.mp4` | 24.19 | -20.9 | -5.1 | -19.9 | 13.939675331115723 |
| FC-S07 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S07_cut_conform.mp4` | 43.35 | -20.4 | -2.0 | -20.5 | 6.763654708862305 |
| FC-AX04 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX04.mp4` | 5.04 | -34.0 | -18.9 | -34.2 | 1.0367324352264404 |
| FC-AX05 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX05.mp4` | 4.04 | -33.3 | -17.2 | -33.5 | 4.828150749206543 |
| FC-S08 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/FC-S08_cut_conform.mp4` | 37.31 | -21.2 | -1.9 | -19.9 | 11.468603134155273 |

## 3. Audio seams (adjacent mean-dB jumps)

Threshold: flag jumps **>6 dB** at scene boundaries.

| Boundary | mean_A -> mean_B | delta dB | Flag |
|---|---|---|---|
| FC-S01 -> FC-S02 @ ~00:48.353 | -20.8 -> -20.4 | +0.40 | ok |
| FC-S02 -> FC-AX01 @ ~01:36.707 | -20.4 -> -34.3 | -13.90 | **>6 dB** |
| FC-AX01 -> FC-S03 @ ~01:41.748 | -34.3 -> -23.1 | +11.20 | **>6 dB** |
| FC-S03 -> FC-S04 @ ~02:30.102 | -23.1 -> -21.7 | +1.40 | ok |
| FC-S04 -> FC-S05 @ ~03:16.455 | -21.7 -> -21.7 | +0.00 | ok |
| FC-S05 -> FC-AX02 @ ~04:04.808 | -21.7 -> -38.0 | -16.30 | **>6 dB** |
| FC-AX02 -> FC-S06 @ ~04:09.850 | -38.0 -> -21.8 | +16.20 | **>6 dB** |
| FC-S06 -> FC-AX03 @ ~04:54.203 | -21.8 -> -22.4 | -0.60 | ok |
| FC-AX03 -> FC-S06A @ ~05:00.245 | -22.4 -> -20.9 | +1.50 | ok |
| FC-S06A -> FC-S07 @ ~05:24.432 | -20.9 -> -20.4 | +0.50 | ok |
| FC-S07 -> FC-AX04 @ ~06:07.785 | -20.4 -> -34.0 | -13.60 | **>6 dB** |
| FC-AX04 -> FC-AX05 @ ~06:12.827 | -34.0 -> -33.3 | +0.70 | ok |
| FC-AX05 -> FC-S08 @ ~06:16.868 | -33.3 -> -21.2 | +12.10 | **>6 dB** |

### Silences (master, noise=-40 dB, min 0.4 s)

- Count: **2**
- 00:00.000 -> 00:00.791 (dur 0.790635 s)
- 06:46.396 -> 06:47.069 (dur 0.67263 s)

## 4. Architect presence (vision checklist — TODO)

Lock status at digest time: **NO** LOCK_SHEET_THE_ARCHITECT / no the_architect in WORLD_TOKENS characters / no locks/refs/architect*.

Manual / Hermes vision checklist:
- [ ] Screen time: is The Architect visible / implied?
- [ ] Coil / indigo motif without readable on-screen text
- [ ] Threat beat readable without dialogue
- [ ] Insert slots: between S02-S03, S05-S06, pre-S06A, pre-S08

### Midframe paths (per scene)

- FC-S01: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S01_mid.jpg`
- FC-S02: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S02_mid.jpg`
- FC-AX01: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-AX01_mid.jpg`
- FC-S03: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S03_mid.jpg`
- FC-S04: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S04_mid.jpg`
- FC-S05: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S05_mid.jpg`
- FC-AX02: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-AX02_mid.jpg`
- FC-S06: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S06_mid.jpg`
- FC-AX03: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-AX03_mid.jpg`
- FC-S06A: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S06A_mid.jpg`
- FC-S07: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S07_mid.jpg`
- FC-AX04: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-AX04_mid.jpg`
- FC-AX05: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-AX05_mid.jpg`
- FC-S08: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/reports/_digest_work_20260916/midframes/FC-S08_mid.jpg`

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
| FC-AX02 | 6.132147312164307 | 5.0s | high motion |
| FC-AX01 | 6.028863906860352 | 5.0s | high motion |
| FC-S03 | 4.889585971832275 | 48.4s | high motion |
| FC-AX05 | 4.828150749206543 | 4.0s | high motion |
| FC-AX03 | 2.990572690963745 | 6.0s | mid |
| FC-AX04 | 1.0367324352264404 | 5.0s | low/static-ish |

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
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v3_audio.mp4 (239.8 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v3_ax.mp4 (237.5 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v3_el.mp4 (240.0 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/README_v3_audio.md (0.0 MB)`
- `/data/apps/GoalChain/docs/assets/film/improve_20260915/index.html (0.0 MB)`

## 7. Priority fix list

### Red / P0-P1

1. Audio seam FC-S02->FC-AX01: delta -13.9 dB (>6). Unify with continuous music bed + crossfade 0.8-1.2 s.
2. Audio seam FC-AX01->FC-S03: delta +11.2 dB (>6). Unify with continuous music bed + crossfade 0.8-1.2 s.
3. Audio seam FC-S05->FC-AX02: delta -16.3 dB (>6). Unify with continuous music bed + crossfade 0.8-1.2 s.
4. Audio seam FC-AX02->FC-S06: delta +16.2 dB (>6). Unify with continuous music bed + crossfade 0.8-1.2 s.
5. Audio seam FC-S07->FC-AX04: delta -13.6 dB (>6). Unify with continuous music bed + crossfade 0.8-1.2 s.
6. Audio seam FC-AX05->FC-S08: delta +12.1 dB (>6). Unify with continuous music bed + crossfade 0.8-1.2 s.
7. P0 music: replace 528 Hz drone placeholder with continuous dark techno/cyber thriller bed (~382-390 s, indigo/Coil vibe, no vocals, loopable ends). See docs/ops/MUSIC_BED_SPEC_FC_v3.md.
8. P1 Architect: create lock sheet + WORLD_TOKENS entry + 3-5 insert shots (no SuperGrok Imagine in this digest pass).

### Soft / follow-ups

1. Vision pass: run Hermes ai-film-visual-qc on midframes/contact (Architect / text / climax).
2. Optional ContinuityGuard re-scan after Architect inserts.

---
*End of digest. Do not treat sampling-grid near-duplicates as defects.*

## Gate D remount notes (2026-09-16)

- ASSEMBLY_v3 order with FC-AX01…05 hard-spliced into v2 xfade master.
- Master: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/FC_full_conform_v3_ax.mp4`
- Publish: `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v3_ax.mp4`
- Live: https://goalworld.fun/assets/film/improve_20260915/FC_full_conform_v3_ax.mp4
- Duration 407.625 s · Integrated LUFS −20.0 · EL bed + scene stems.
- Architect inserts on timeline: AX01 after S02, AX02 after S05, AX03 after S06, AX04+AX05 after S07 (pre-S08).
- Vision screen-time pass: still optional (objective digest complete).
