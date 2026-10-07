# MUSIC_BED_SPEC — Fractured Code conform v3

**Status:** ElevenLabs bed generated **2026-09-16** — `FILM/audio/bed_v3_elevenlabs.mp3` (386.04s) + WAV 44.1k stereo (raw −13.1 LUFS → norm −23.0 LUFS) + master `renders/_conform_v3/FC_full_conform_v3_el.mp4` (~−20.2 LUFS). Procedural interim kept: `bed_v3_procedural.wav` + `FC_full_conform_v3_audio.mp4`.  
**Master reference duration:** FC_full_conform_v2.mp4 = **382.417 s** (~6:22). Target bed: **382–390 s**.  
**Authority:** docs/ops/FILM_DIGEST_AND_V3_PLAN.md P0; CANON indigo / Coil vibe.

---

## 1. Creative target

| Field | Spec |
|---|---|
| Duration | **386 s** preferred (covers 382.4 + ~3.5 s head/tail pad), acceptable band **382–390 s** |
| Genre | Dark techno / cyber thriller underscore |
| Mood | Indigo Coil — cold, oppressive, slow-burn tension; not EDM drop festival |
| Vocals | **None** (no lyrics, no vocal chops that read as speech) |
| Melody | Minimal; motif can nod to 528 Hz as color, not as the whole bed (v2 placeholder is pure 528 drone — replace) |
| Percussion | Sparse industrial pulse; duck under dialogue/SFX scenes |
| Ends | **Loopable / crossfadeable**: last 2–4 s should morph into first 2–4 s (equal power) for seam-free loops and scene boundary xfades |
| Loudness target (bed alone) | ~**−24 to −22 LUFS** integrated so mix under scene stems lands near master **−20 LUFS** (v2 loudnorm) |
| True peak | ≤ **−1.5 dBTP** |
| Format | 44.1 kHz stereo WAV 24-bit (or 16-bit if toolchain locks to int16) |

### Explicit non-goals
- Not a song with chorus.
- Not the current `_conform_v2/_tools/bed_full.wav` 528 Hz drone (keep only as silence-guide / fallback).
- No readable on-screen music branding; no licensed commercial stems without clearance.

---

## 2. What already exists on disk

| Asset | Path | Role |
|---|---|---|
| Placeholder bed generator | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/_tools/bed.py` | Deterministic 528 Hz partials |
| Placeholder bed WAV | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/_tools/bed_full.wav` (~76 MB) | Used in v2 mix |
| Per-scene norm stems | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v2/_tools/stems/FC-S0{1-8,6A}_norm.wav` | Scene ambience / AI audio after loudnorm |
| Mix temps | `.../_conform_v2/_tools/tmp/master_prog.wav`, `master_mix.wav` | Intermediate |
| Conform mixer | `.../_conform_v2/_tools/conform.py` | Assembly + bed duck |
| FILM/audio/ | present (`bed_v3_*.wav/mp3`, `mix/`) | v3 beds + mixes |
| ElevenLabs music export | `FILM/audio/bed_v3_elevenlabs.mp3` (+ `.wav`, `_norm.wav`) · master `FC_full_conform_v3_el.mp4` · pack `assets/film/improve_20260915/` | Generated 2026-09-16; procedural twin retained |

No dedicated FILM/audio directory yet. Proposed layout below.

---

## 3. Stems layout (v3)

```
/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/
  bed/
    FC_bed_v3_source.wav          # continuous score, 386s
    FC_bed_v3_loop_check.wav      # optional: last4s+first4s concat QC
    README.md                     # provenance (composer / EL job id / date)
  sfx/                            # optional designed hits (Architect sting, etc.)
  silence_guide/
    FC_silence_guide_v3.wav       # optional mute map / sidechain key
  mix/
    FC_master_prog_v3.wav
    FC_master_mix_v3.wav
```

Scene stems stay under `renders/_conform_v3/_tools/stems/` (mirror v2).

---

## 4. Acquisition options (cheap to paid)

1. **Local / free:** extend bed.py into multi-layer techno (kick + noise bed + indigo pad) — no API. Good for temp; weak vs real score.
2. **Existing unpaid stems:** drop WAV into FILM/audio/bed/ manually (Nico / composer).
3. **ElevenLabs Music (stub only until key):**

```bash
# STUB — do not run without confirmed ELEVENLABS_API_KEY + budget OK
# export ELEVENLABS_API_KEY=...
# curl -X POST https://api.elevenlabs.io/v1/music/compose \
#   -H "xi-api-key: $ELEVENLABS_API_KEY" -H "Content-Type: application/json" \
#   -d '{"prompt":"dark techno cyber thriller underscore, indigo cold Coil vibe, no vocals, loopable ends, sparse industrial pulse, ~386 seconds","music_length_ms":386000}' \
#   --output /tmp/FC_bed_v3_el.mp3
# ffmpeg -y -i /tmp/FC_bed_v3_el.mp3 -ar 44100 -ac 2 \
#   /data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/bed/FC_bed_v3_source.wav
```

4. Reject SuperGrok Imagine / video gen for music (out of scope).

---

## 5. ffmpeg mix plan to FC_full_conform_v3.mp4

Assumptions: scene video+ambience already conformed like v2, continuous bed under everything, crossfade **0.8–1.2 s** at scene joins, bed ducked ~−8 to −12 dB under dense SFX.

### 5.1 Prepare bed (trim/pad + fade ends)

```bash
FILM=/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM
BED_SRC=$FILM/audio/bed/FC_bed_v3_source.wav
BED=$FILM/audio/bed/FC_bed_v3_386.wav
TARGET=386

ffmpeg -y -i "$BED_SRC" \
  -af "apad=whole_dur=${TARGET},atrim=0:${TARGET},afade=t=in:st=0:d=2,afade=t=out:st=$((TARGET-2)):d=2,loudnorm=I=-23:TP=-1.5:LRA=11" \
  -ar 44100 -ac 2 "$BED"
```

### 5.2 Concat / mix (prefer porting conform.py)

Prefer extending `_conform_v2/_tools/conform.py` to `_conform_v3` rather than a one-off shell. Logic:

1. For each scene stem: keep video; mix scene_norm.wav + sliced bed segment [t0,t1) with bed gain ~−10 dB (adjust).
2. Between scenes: acrossfade=d=1.0:c1=tri:c2=tri on audio; video hard cut or 2–4 frame dissolve only if intentional.
3. Final: loudnorm=I=-20:TP=-1.5:LRA=12 (match v2 publish target).
4. Mux:

```bash
OUT=$FILM/renders/_conform_v3/FC_full_conform_v3.mp4
ffmpeg -y -i master_video_v3.mp4 -i "$FILM/audio/mix/FC_master_mix_v3.wav" \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  "$OUT"
```

### 5.3 QC gates (must pass before publish)

- film_digest.py on v3: **zero** adjacent mean-dB jumps **>6 dB** at scene boundaries (except documented dramatic cuts).
- Integrated loudness ≈ **−20 LUFS** ±1.
- Bed continuous: listen 2 s either side of each scene boundary.
- No vocals / no music-bed clipping.

```bash
python3 /data/apps/GoalChain/scripts/video/film_digest.py \
  --master $FILM/renders/_conform_v3/FC_full_conform_v3.mp4 \
  --scenes-dir $FILM/renders/_conform_v3
```

---

## 6. Scene time map (v2 conform, for bed slices)

| Scene | Dur (s) | Cumulative end (s) |
|---|---|---|
| FC-S01 | 48.353 | 48.353 |
| FC-S02 | 48.353 | 96.707 |
| FC-S03 | 48.353 | 145.060 |
| FC-S04 | 46.353 | 191.413 |
| FC-S05 | 48.353 | 239.767 |
| FC-S06 | 44.353 | 284.120 |
| FC-S06A | 24.187 | 308.307 |
| FC-S07 | 43.353 | 351.660 |
| FC-S08 | 37.312 | 382.972 (probe master 382.417 — slight rounding / encode) |

Use master **382.417 s** as mux shortest authority; generate bed ≥386 s and trim.

---

## 7. Owner / next

| Step | Owner |
|---|---|
| Approve paid EL vs local bed | Nico / Jefe |
| Drop or generate FC_bed_v3_source.wav | Audio / Hermes |
| Port conform.py to v3 with xfade + new bed | Hermes |
| Re-run film_digest.py | Hermes |
| Architect inserts (separate P1) | Director Neural — **no Imagine in this music prep** |
