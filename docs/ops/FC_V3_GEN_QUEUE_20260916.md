# Fractured Code v3 — Gen Queue (2026-09-16)

**Scope:** inventory + ordered gates only. **NO** SuperGrok Imagine video. **NO** mass image gen in this pass.  
**Film root:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/`  
**Authority:** CANON → WORLD_TOKENS → `locks/LOCK_SHEET_THE_ARCHITECT.md` → `locks/refs/the_architect/REF_GEN_SPEC.json`  
**QC skill:** Hermes `ai-film-visual-qc` (`/data/hermes-home/skills/devops/ai-film-visual-qc/SKILL.md`)  
**Status line:** P0 EL bed **DONE** 2026-09-16 · Gate B **COMPLETE** 2026-09-16 (front_34 + profile + bust APPROVED) · Gate C i2v **COMPLETE** 2026-09-16 (AX01…05 PASS) · Gate D remount **COMPLETE** 2026-09-16 · next=Gate E (Obra/YouTube · Nico OAuth)

---

## Gate A — Inventory (this run) ✅ DONE 2026-09-16 ~08:45 Europe/Rome

| # | Path | Exists | Notes |
|---|---|---|---|
| 1 | `FILM/ASSEMBLY_v3.md` | **YES** | docs-only; inserts AX01–05; master vigente aun sin AX media |
| 2 | `FILM/scenes/FC-AX_ARCHITECT_INSERTS.json` | **YES** | 5 shots `ready_for_render`; `reference_images: []` |
| 3 | `FILM/locks/LOCK_SHEET_THE_ARCHITECT.md` | **YES** | FROZEN presence grammar; threat/surveillance; no full face reveal |
| 4 | `FILM/locks/refs/the_architect/REF_GEN_SPEC.json` | **YES** | 3 still prompts ready; `status: prompts_ready_awaiting_jefe_image_quota` |
| 5 | `FILM/WORLD_TOKENS.json` → `characters.the_architect` | **YES** | `refs_status: pending`; `reference_images: []` |
| 6a | `FILM/audio/bed_v3_elevenlabs.mp3` | **YES** | ~9.3 MB · 2026-09-16 06:30 UTC |
| 6b | `FILM/audio/bed_v3_elevenlabs.wav` | **YES** | + `bed_v3_elevenlabs_norm.wav` |
| 6c | `docs/assets/film/improve_20260915/FC_full_conform_v3_el.mp4` | **YES** | live master EL · ~229 MB · twin en `renders/_conform_v3/` |
| 7 | `FILM/reports/film_digest_v2_20260915.md` | **YES** | Architect section = checklist TODO (locks OK; vision screen-time TODO) |
| 8 | `docs/ops/FILM_DIGEST_AND_V3_PLAN.md` | **YES** | status updated: P0 EL DONE; P1 stills next |

### Shot IDs + insert slots (FC-AX)

| shot_id | duration_s | insert_slot | after → before |
|---|---|---|---|
| **FC-AX01** | 5 | `between_S02_S03` | FC-S02 → FC-S03 |
| **FC-AX02** | 5 | `between_S05_S06` | FC-S05 → FC-S06 |
| **FC-AX03** | 6 | `pre_S06A` | FC-S06 → FC-S06A |
| **FC-AX04** | 5 | `pre_S08` | FC-S07 → FC-S08 |
| **FC-AX05** | 4 | `pre_S08` | FC-AX04 → FC-S08 |

≈ **+25 s** editorial sobre ~382 s (conform AX TBD).

### Still destinations (Gate B targets) — front_34 ✅ · profile ✅ · bust ✅ **ALL APPROVED**

| still_id | view | dest_absolute | exists |
|---|---|---|---|
| `front_34` | three_quarter_front | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/locks/refs/the_architect/front_34.png` | **YES · QC PASS** (see `FILM/reports/architect_still_qc_front_34_20260916.md`) |
| `profile` | profile | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/locks/refs/the_architect/profile.png` | **YES · QC PASS** (see `FILM/reports/architect_still_qc_profile_20260916.md`) |
| `bust` | full_or_bust | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/locks/refs/the_architect/bust.png` | **YES · QC PASS** (see `FILM/reports/architect_still_qc_bust_20260916.md`) |

Prompts: extract verbatim from `REF_GEN_SPEC.json` → `stills[].image_prompt`. Negatives: same file `negatives[]`.

### Audio / master paths (absolute)

- Bed MP3: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/bed_v3_elevenlabs.mp3`
- Bed WAV: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/bed_v3_elevenlabs.wav`
- Mix EL: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/audio/mix/FC_master_mix_v3_el.wav`
- Live master EL: `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v3_el.mp4`
- Render twin: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/FC_full_conform_v3_el.mp4`
- Nota: beds **no** viven bajo `improve_20260915/` (solo masters + README_v3_audio.md).

### Missing / blocked for later gates

- PNG lock stills: `front_34` + `profile` + `bust` — **all approved** 2026-09-16
- AX media / i2v — **no empezar** hasta Gate C
- ASSEMBLY remount con AX — Gate D
- Obra / YouTube — Gate E (Nico OAuth)

---

## Gate B — Generate stills 1-by-1 (P1) ✅ **COMPLETE** 2026-09-16 — front_34 ✅ · profile ✅ · bust ✅

**Rule:** one still at a time. Approve with vision QC before next. **No collage batch.** **No SuperGrok Imagine video.**

### Order
1. `front_34.png` — **DONE / APPROVED** 2026-09-16 (QC PASS; model `grok-imagine-image-quality`; no quota error)
2. `profile.png` — **DONE / APPROVED** 2026-09-16 (QC PASS after 1 retry; shoulder-logo fail cleared)
3. `bust.png` — **DONE / APPROVED** 2026-09-16 (QC PASS attempt1; model `grok-imagine-image-quality`; JPEG→PNG; no quota error)

### How
- Model hint: `grok-imagine-image` (per REF_GEN_SPEC)
- Prompt: exact `image_prompt` from REF_GEN_SPEC for that `id`
- Negatives: full `negatives[]` from REF_GEN_SPEC
- Write to `dest_absolute` only after QC pass
- Update `WORLD_TOKENS.json` `characters.the_architect.reference_images` + `refs_status` when all 3 approved
- Flip REF_GEN_SPEC `status` when complete

### Vision QC criteria (ai-film-visual-qc + lock sheet) — HARD FAIL if any breach

Review **native-res** still (not contact-sheet tiles). Checklist per still:

1. **Single camera / no collage** — one shot one frame; NO multi-panel, diptych, quad-split, storyboard tiles, upper/lower frame language
2. **Indigo Coil only** — Cascade hex residual `#4B0082` / `#3F00FF` / `#0080FF` as rim/biolume/mesh; environmental system motif (NOT Mileo wrist-scar copy)
3. **No readable text** — no letters on cloth/walls/HUD/logos/faction labels (Architect, NeuroSys, Resistencia, Mark, unit IDs, watermarks, carteles)
4. **Face unreadable** — veiled/hooded/fogged; no clear hero portrait; no celebrity likeness; no Mileo/Kora/Sierra eye locks on Architect
5. **Presence grammar** — threat/surveillance; almost-null body; steel/void wardrobe hex `#708090` / `#C0C0C0` / `#000000` / `#301934`; Atmosphere `#000000` / `#301934`
6. **PG-13** — no gore / torture spectacle
7. **View match** — front_34 ≈ 3/4; profile = true side; bust = chest-up or distant silhouette (no full-body fashion reveal)

On FAIL: regenerate that still only; do not advance queue.

---

## Gate C — i2v FC-AX01…05 ✅ **COMPLETE** 2026-09-16 (ALL AX01…05 PASS; remount = Gate D)

- **Ordered:** Nico authorized ALL FC-AX01…AX05 i2v with QC 1×1 (2026-09-16).
- Hermes i2v anclado a stills Architect (`reference_images` populated) — **never pure t2v**
- Order: FC-AX01 → AX02 → AX03 → AX04 → AX05 (one shot at a time; QC midframe strip per ai-film-visual-qc)
- Durations: 5 / 5 / 6 / 5 / 4 s
- Same hard rules: no collage, indigo Coil, no readable text, face withheld
- Wire paths into `scenes/FC-AX_ARCHITECT_INSERTS.json` `reference_images` / render ledger

---


## Gate C — progress log (live)

**Status:** COMPLETE 2026-09-16 — 5/5 PASS · next=Gate D remount

- **FC-AX01**: PASS · `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX01.mp4` · retries=1 · 2026-09-16 07:14 UTC · motion=6.03 dur=5.042

- **FC-AX02**: PASS · `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX02.mp4` · retries=0 · 2026-09-16 07:14 UTC · motion=6.13 dur=5.042
- **FC-AX03**: PASS · `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX03.mp4` · retries=0 · 2026-09-16 07:16 UTC · motion=2.99 dur=6.042
- **FC-AX04**: PASS · `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX04.mp4` · retries=0 · 2026-09-16 07:18 UTC · motion=1.04 dur=5.042 borderline-ok
- **FC-AX05**: PASS · `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX05.mp4` · retries=0 · 2026-09-16 07:20 UTC · motion=4.83 dur=4.042

## Gate C — final delivery table

| shot | path | duration_s | PASS/FAIL | retries |
|---|---|---|---|---|
| FC-AX01 | `FILM/renders/FC-AX/FC-AX01.mp4` | 5.042 | **PASS** | 1 |
| FC-AX02 | `FILM/renders/FC-AX/FC-AX02.mp4` | 5.042 | **PASS** | 0 |
| FC-AX03 | `FILM/renders/FC-AX/FC-AX03.mp4` | 6.042 | **PASS** | 0 |
| FC-AX04 | `FILM/renders/FC-AX/FC-AX04.mp4` | 5.042 | **PASS** | 0 |
| FC-AX05 | `FILM/renders/FC-AX/FC-AX05.mp4` | 4.042 | **PASS** | 0 |

**Quota:** no SuperGrok quota hit. Gate D remount **not** started.

## Gate D — Remount ASSEMBLY_v3 + conform v3 AX + re-digest ✅ **COMPLETE** 2026-09-16 ~09:40 Europe/Rome

1. ✅ Remount per `ASSEMBLY_v3.md` (S01…S02, AX01, S03…S05, AX02, S06, AX03, S06A, S07, AX04, AX05, S08)
2. ✅ Remix: EL bed (`bed_v3_elevenlabs_norm.wav` loop-ext) + scene stems + AX stems → `FILM/renders/_conform_v3/FC_full_conform_v3_ax.mp4` (twin `_el_ax`)
3. ✅ Publish `docs/assets/film/improve_20260915/FC_full_conform_v3_ax.mp4` + index/README (priors kept)
4. ✅ Digest → `FILM/reports/film_digest_v3_ax_20260916.md` (+ `.json`)
5. ⏭ Optional ContinuityGuard — deferred

**Metrics:** duration **407.625 s** · LUFS **−20.0** · live https://goalworld.fun/assets/film/improve_20260915/FC_full_conform_v3_ax.mp4
**Tooling:** `FILM/renders/_conform_v3/remount_ax_v3.py` · report `FILM/renders/_conform_v3/_tools/remount_ax_report.json`

---

## Gate E — Obra / YouTube 🔒 only after Nico OAuth

- Web improve_20260915 puede seguir en borrador
- YouTube / Obra publish **solo** tras Nico OAuth Postiz + aprobación Jefe
- Teaser 20–30s vertical desde master v3 **después** de sonido+Architect (Gates B–D)

---

## Explicit non-goals (this doc / this day)

- ❌ SuperGrok Imagine **video** mass run
- ❌ Mass image gen (solo cola ordenada Gate B, 1-by-1)
- ❌ Regenerar S01–S08 en bloque por inserts AX
- ❌ Pure t2v para FC-AX
- ❌ Publish YouTube sin OAuth Nico

---

## Pointers

- Plan: `docs/ops/FILM_DIGEST_AND_V3_PLAN.md`
- Music bed spec: `docs/ops/MUSIC_BED_SPEC_FC_v3.md`
- Digest: `FILM/reports/film_digest_v2_20260915.md`
- Breakdown AX: `FILM/reports/FC-AX_ARCHITECT_BREAKDOWN.md`
