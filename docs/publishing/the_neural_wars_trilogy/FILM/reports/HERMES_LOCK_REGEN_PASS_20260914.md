# LOCK SHEETS + FC-S06A ACTION + REGEN QUEUE — Hermes pass
**Date:** 2026-09-14 10:05–10:35 UTC · **Profile:** hermes-ceo · **Scope:** FILM only
**No gateways touched. No publication to goalworld.fun. No manuscript edits.**

FILM = `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM`

---

## 1. Lock-sheet stills (from the frozen lock sheets, not a new bible)

Sources used: `locks/LOCK_SHEET_MILEO_CHEN.md`, `locks/LOCK_SHEET_KORA_VEGA.md`,
`locks/LOCK_SHEET_SIERRA_CATALANO.md`, `VISUAL_BIBLE.md`, `locks/README.md`.

Generator: `scripts/video_automation/locksheet_gen.py` (xAI `grok-imagine-image`,
image-to-image anchoring on the best existing still, retry chain anchor → edits → text).

Output: `FILM/locksheets/` — **9 stills** (3 views × 3 principals) + `MANIFEST.json`
(prompt, anchor, mode, bytes per image) + `CONTACT_SHEET_<CHAR>.png` (3 views side by side).

| Principal | Anchored to | Files |
|---|---|---|
| Mileo Chen | `renders/FC-S01/FC-S01-04.png` (strong face lock) | `MILEO_CHEN_3Q/PROFILE/FULL.png` |
| Kora Vega | `renders/FC-S03/FC-S03-02.png` (full-body only; face views re-generated text-only because the S03 anchor carried blue eyes + ear hardware) | `KORA_VEGA_3Q/PROFILE/FULL.png` |
| Sierra Catalano | `renders/FC-S04/FC-S04-05.png` | `SIERRA_CATALANO_3Q/PROFILE/FULL.png` |

QC (vision-checked):
- **Mileo** — clean 3/4, vivid green eyes, 3.2 cm black hair, blank hexagonal badge. ✔
- **Sierra** — LEFT cheek temple→jaw scar only, hazel eyes, leather jacket + black pants,
  no readable text. ✔
- **Kora** — copper vest on the female lead, shoulder-length hair, no cheek scar, pale
  scar ridge behind the RIGHT ear, no readable text. Residual: eye colour still renders
  blue/teal instead of brown+indigo in some frames, and one small dark ear cuff shows in
  the profile. Needs a human/Director eyeball before it is treated as final. ⚠

A parallel hermes-ceo job also wrote its own lock stills to
`locksheets/LOCK_SHEET_<CHAR>/{3q,profile,full}.jpg` (9 files). Both sets are kept; the
`FILM/locksheets/*.png` set above is the one referenced by the storyboards.

---

## 2. FC-S06A — canonical action insert (Director Neural storyboard)

Storyboard: `scenes/FC-S06A_ACTION_INSERT.json` (4 shots, no FC-AX invention).
`reference_images` + `lock_sheet_ids` filled from `FILM/locksheets/`.

Command:
```
python3 scripts/video_automation/novel_film_builder.py \
  --storyboard FILM/scenes/FC-S06A_ACTION_INSERT.json --outdir FILM --max-shots 8
```

Result: **4/4 ok, 0 fail** (`reports/FC-S06A_run_20260914T101413Z.json`,
`reports/FC-S06A_status.json`).

| Shot | Still | Video | Res / dur |
|---|---|---|---|
| FC-S06A-01 | ✔ | ✔ | 1280x720 / 6.04 s |
| FC-S06A-02 | ✔ | ✔ | 1280x720 / 6.04 s |
| FC-S06A-03 | ✔ | ✔ | 1280x720 / 6.04 s |
| FC-S06A-04 | ✔ | ✔ | 1280x720 / 6.04 s |

Note: the parallel i2v job swept every per-shot `*.mp4` (including these four) into
`renders/_backup_20260914/mp4/`; they were **restored** into `renders/FC-S06A/` from that
backup, verified with ffprobe. Vision QC: no readable text, no title cards, no multi-panel.

---

## 3. REGEN_QUEUE_v1 — 17 items

| Item | Owner | Status |
|---|---|---|
| FC-S03-02 … FC-S03-08 (7) | this pass | ✔ replaced |
| FC-S04-02 … FC-S04-08 (7) | this pass | ✔ replaced |
| FC-S07-07, FC-S07-08, FC-S08-06 | parallel i2v job | ✔ replaced by that job, **vision-verified text-free** |

Method (`scripts/video_automation/regen_stills.py`):
`SCENE_COMMON` + lock-sheet **face block** (identity/scars/eyes only — wardrobe comes from
the shot's own `wardrobe_ref`, so Mileo is not pushed back into his pre-cut grey tunic) +
the shot's scene content + the bible negative block. v1 → v2 → targeted v3 passes; every
replaced still is backed up under `renders/_pre_regen_bak_<tag>/`.

Also done, to stop the text-breach recurring in future renders: **all scene storyboards
(FC-S02…FC-S08) had `image_prompt`/`video_prompt` sanitized** — removed `Resistencia` /
`Resistance` / `resistance` / `Fracturados` as cloth or colour labels, the cue word `Mark`,
and the `upper frame` panel language. Originals preserved in
`scenes/.sanitize_backup_20260914/`.

### Still → video sync
Six shots had videos rendered *before* their replacement still landed (S03-02/03/04/05,
S04-02/03). The i2v re-render from the new stills was attempted with `--skip-existing`
(after moving the old mp4s to `renders/_backup_20260914/mp4_stale_pre_v2/`) and **failed**:

```
Direct xAI API video failed (HTTP Error 403: Forbidden)
Grok CLI fallback -> 402 Payment Required
```

Direct probe of the image endpoint at 10:31 UTC:

```
HTTP 403 {"code":"personal-team-blocked:spending-limit",
          "error":"You have run out of credits or need a Grok subscription."}
```

**The xAI generation credit is exhausted (as of ~10:30 UTC).** Consequences:

- The 6 shots above were **restored** from the backup mp4s so every shot still has a video
  for assembly, but their frame-0 no longer matches the new still (mean-abs-diff 15–26/255
  vs ~2/255 for a true i2v match) → **re-render these 6 when credit returns**.
- The parallel i2v job's remaining video work (S06/S07/S08) is blocked by the same limit.

### i2v verification (patched builder confirmed working)
Frame-0 of every new FC-S06A clip matches its storyboard still at mean-abs-diff ≈ 2/255
(FC-S06A-01 2.44, -02 2.43, -03 1.98, -04 2.17) — the 2026-09-11 i2v patch
(`grok-imagine-video-1.5` + base64 `image`) is therefore **verified live**, not just assumed.

### Residual QC (carry forward)
1. Kora eye colour still renders blue/teal in FC-S03-03 / FC-S03-05 despite three passes
   (brown + indigo flecks is what the lock sheet demands).
2. Sierra's eyes read light/blue in some S04 frames instead of hazel.
3. `FC-S03_cut_v1.mp4` / `FC-S04_cut_v1.mp4` are now stale — the cuts must be re-concatenated
   after the i2v pass settles.

---

## Artifacts
- Locksheets: `FILM/locksheets/` (9 png + 3 contact sheets + MANIFEST.json)
- FC-S06A: `FILM/renders/FC-S06A/` (4 png + 4 mp4 + meta), `FILM/reports/FC-S06A_*`
- Regen: `FILM/reports/REGEN_QUEUE_v1_run_*.json`, `REGEN_QUEUE_v1_gen_*.log`
- Scripts: `scripts/video_automation/locksheet_gen.py`, `scripts/video_automation/regen_stills.py`
