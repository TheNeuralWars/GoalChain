# Regen priority — post ContinuityGuard pulse (2026-09-14 ~18:05 Europe/Rome)

Source: `film_continuity_report` generated 2026-09-14T16:04:38Z (runtime ~197s).
SuperGrok: exhausted until ~2026-09-15 12:15 Europe/Rome — **no Imagine until reset**.

## Face (PASS 3, threshold 0.88)
- **0 flags below 0.88.**
- Lowest: Sierra FC-S06↔FC-S08 **0.8947** (watch on re-i2v).
- Mileo weakest pairs involve **FC-S07** (~0.90–0.90 vs S01/S02) — finish S07 i2v with lock refs.
- **Kora not tracked** (no primary face clip) — Director Neural / character_lock gap for FC-S03.

## Structural (blocks meaningful CG on new work)
1. **FC-S06A** — `MISSING_CUT` (4 shots present, no cut file) → build cut before CG/conform.
2. **FC-S07 / FC-S08** — cut exists but **0 shot mp4s** found by scanner → finish i2v then rebuild cuts.
3. **FC-S06** — cut 64s vs **1** shot scanned; PASS2 flags `S06-01` motion @3.48–4.35s (ratios 5.36/4.55/3.81).
4. **FC-S04** — only 5 shots vs 8-slot cut (stale cut vs partial i2v).
5. Large cut−shots deltas on S01–S05 → rebuild `_cut_v2` after remaining i2v.

## Ordered next after SuperGrok reset
1. Build `FC-S06A_cut_v1.mp4` from existing 4 shots (local ffmpeg, no Imagine).
2. Re-i2v / finish shots: S06 remainder, S07, S08 (lock `reference_images`); watch Sierra + Mileo↔S07.
3. Optional: S06-01 motion look + Kora primary lock for S03 face tracking.
4. Rebuild all `_cut_v2` including S06A → re-run ContinuityGuard → conform v2.
5. Draft page refresh; YouTube still Obra-gated (Postiz OAuth may need Nico reconnect).
