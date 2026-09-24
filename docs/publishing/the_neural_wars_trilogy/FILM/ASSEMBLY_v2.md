# ASSEMBLY v2 — Fractured Code (film package)

**Status:** conform v2 published (2026-09-15) — `_conform_v2/` + improve_20260915 live  
**Authority:** [CANON.md](./CANON.md) → [WORLD_TOKENS.json](./WORLD_TOKENS.json) → lock refs  
**Updated:** 2026-09-15 13:11 Europe/Rome

## Playback order (editorial)

| # | Id | Notes |
|---|---|---|
| 1 | FC-S01 | `_cut_v2` rebuilt from existing shot mp4s |
| 2 | FC-S02 | `_cut_v2` rebuilt |
| 3 | FC-S03 | `_cut_v2` rebuilt; CG face Mileo OK |
| 4 | FC-S04 | i2v completed shots 06–08; `_cut_v2` (8/8) |
| 5 | FC-S05 | `_cut_v2` rebuilt |
| 6 | FC-S06 | i2v completed shots 02–08; `_cut_v2` (8/8) |
| 7 | **FC-S06A** | Action insert — first cut: `FC-S06A_cut_v2.mp4` (4/4) |
| 8 | FC-S07 | i2v completed shots 01–08; `_cut_v2` (8/8) |
| 9 | FC-S08 | i2v completed shots 01–07; `_cut_v2` (7/7) |

## 2026-09-15 i2v resume (SuperGrok)

- Token refresh via `nw_regen_20260914/xai_client.get_token(force=True)` → **ok** (no spending-limit).
- Jobs: `scripts/video_automation/nw_regen_20260914/jobs_i2v_resume_20260915.json` (25 video jobs).
- Runner: `python3 runner.py … --kind video --workers 3` → **ok=25 failed=0**.
- Regenerated mp4s: FC-S04-06..08, FC-S06-02..08, FC-S07-01..08, FC-S08-01..07.
- No S01–S05 png≫mp4 mtime mismatches; no still regen; no pure t2v.
- Cuts: `build_cuts.py` → **9× `*_cut_v2.mp4`** (never overwrote `_cut_v1`). Total ~388.95s (~6.5 min).
- ContinuityGuard (S03/S04/S06/S06A/S07/S08 on v2 cuts, then cut_v1 restored): **0 face pairs <0.88**. Worst: Mileo S04↔S07 **0.9148**; Sierra S06↔S08 **0.9236**. Motion heuristics: S06-01, S06-05, S08-06 (within-shot).
- Reports: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard/film_continuity_report.{md,json}`
- Conform v2: **done** — `renders/_conform_v2/_tools/conform.py` (sources `_cut_v2`, TRIMS vacío, orden ASSEMBLY con S06A). Outputs: 9× `FC-S0N_cut_conform.mp4` + `FC-S06A_cut_conform.mp4` + `FC_full_conform_v2.mp4` (~382.4 s, loudnorm ~−20 LUFS + cama 528 Hz). Publicado en `docs/assets/film/improve_20260915/`.

## Media locations

- Shot renders: `renders/FC-S0N/`, `renders/FC-S06A/`
- Scene cuts v2: `renders/FC-S0N/FC-S0N_cut_v2.mp4` (+ `FC-S06A_cut_v2.mp4`)
- Scene cuts v1 (legacy, preserved): `renders/FC-S0N/FC-S0N_cut_v1.mp4`
- Audio conform v1 (legacy): `renders/_conform_v1/`
- Audio conform v2 (current): `renders/_conform_v2/` + public `docs/assets/film/improve_20260915/`
- Lock refs: `locks/refs/{mileo_chen,kora_vega,sierra_catalano,riv,okafor}/`
- ContinuityGuard: `/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard/`

## Remaining / next

1. ~~Conform refresh on `_cut_v2`~~ **DONE** → `_conform_v2/` + `improve_20260915/`
2. Optional human look at CG motion flags: FC-S06-01, FC-S06-05, FC-S08-06
3. Kora face track still thin (S03 lock gap) — not a regen blocker today
4. Draft page / Obra YouTube gate when ready

## Do not

- Pure text-to-video (must animate approved still)
- Faction names / readable text in image prompts
- Multi-panel storyboard language in a single frame
- Overwrite `_cut_v1` or Discord/Telegram gateways
