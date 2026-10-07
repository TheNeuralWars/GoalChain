# Music bed v3 — procedural interim (2026-09-15)

**Status:** procedural dark techno / cyber underscore bed rendered and mixed into conform v3 audio master.  
**APIs used:** none (no ElevenLabs, no SuperGrok Imagine). numpy + scipy + ffmpeg only.

## Deliverables (absolute paths)

| Asset | Path |
|---|---|
| Generator | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/bed_v3_procedural.py` |
| Bed WAV (canonical) | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/bed_v3_procedural.wav` |
| Bed (spec layout) | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/bed/FC_bed_v3_source.wav` |
| Mix script | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/mix_conform_v3.sh` |
| Mixed master audio WAV | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/mix/FC_master_mix_v3.wav` |
| Conform v3 MP4 | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/FC_full_conform_v3_audio.mp4` |
| Also copied as | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/FC_full_conform_v3.mp4` |

## Design (vs v2 pure 528 Hz drone)

Layers in `bed_v3_procedural.py`:
1. Low sub drone (≈41–110 Hz) with slow wobble
2. Sparse industrial pulse (~72 BPM: kick on 1 / alternate 3, metallic ticks, distant scrapes)
3. Filtered noise pads (brown/mid + air), L/R decorrelated
4. Indigo-cold harmonic color (132 / 198 / 264 / 396 / **soft 528** / 792) — 528 is one partial only
5. Loopable ends: equal-power crossfade last/first **3 s**; plus 2 s fade in/out for film edges

Format: stereo 44.1 kHz 16-bit PCM WAV, duration **386.000 s**.

## Loudness (ffmpeg loudnorm measure, 2026-09-15)

| Asset | Integrated LUFS (`input_i`) | True peak (`input_tp`) | LRA |
|---|---|---|---|
| Bed alone (`bed_v3_procedural.wav`) | **−23.14 LUFS** | −14.71 dBTP | 4.90 |
| Mixed master (`FC_full_conform_v3_audio.mp4`) | **−20.20 LUFS** | −0.81 dBTP | 18.50 |

Bed target band −24..−22 LUFS: **pass** (−23.14).  
Master publish target ≈ −20 LUFS: **pass** (−20.20).  
Master TP is hotter than bed-spec −1.5 dBTP (scene stems dominate peaks; same alimiter path as v2).

## Mix method

Reused v2 `master_prog.wav` (scene stems acrossfade) + v2 `master_av.mp4` (video), bed gain **−13.26 dB** (same as v2 `BED_GAIN_DB`), amix + alimiter, AAC 192k mux. Duration authority: **382.417 s**.

```bash
bash /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/mix_conform_v3.sh
```

## Next

- Pending: replace procedural interim with ElevenLabs Music (or composer stem) when key/budget OK — see `docs/ops/MUSIC_BED_SPEC_FC_v3.md`.
- Optional: re-run `film_digest.py` on v3 master for boundary dB QC.
- Optional: tighten master true peak with two-pass loudnorm if publish gate requires ≤ −1.5 dBTP.
