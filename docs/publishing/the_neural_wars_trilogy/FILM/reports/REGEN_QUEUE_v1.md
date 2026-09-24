# REGEN QUEUE v1 — The Neural Wars FILM
**Created:** 2026-09-14 (docs only — NO generation this pass)  
**Source:** FILM_QC_CEO.md + scene prompts  
**Policy:** Reuse good stills elsewhere. Regenerate **only** listed shots. Rewrite `image_prompt` / `video_prompt` before gen: no readable text, no script cues, no panel language. Attach lock-sheets + `reference_images` when Hermes has lock stills.

**Base stills root:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/`

---

## Keep (do not regenerate stills)

| Shot | Still path | Note |
|---|---|---|
| FC-S03-01 | `renders/FC-S03/FC-S03-01.png` | Empty establishing — reuse |
| FC-S04-01 | `renders/FC-S04/FC-S04-01.png` | Empty establishing — reuse |
| FC-S01-* | `renders/FC-S01/` | Mileo strong — reuse unless Director overrides |
| FC-S07-01…06 | `renders/FC-S07/FC-S07-0N.png` | Not in text-breach set — reuse stills (clips may need i2v later) |
| FC-S08-01…05, 07 | as present | 05 has multi-panel defect in QC — **optional** later; not in this v1 hard list |

---

## Queue — REPLACE still + rewrite prompts

### A. FC-S03 character drift (QC ~4/10)

| Shot id | Reason | Still to **replace** | Lock sheets | Prompt rewrite notes |
|---|---|---|---|---|
| FC-S03-02 | Kora first entry; face/hair/scar drift risk | `renders/FC-S03/FC-S03-02.png` | `LOCK_SHEET_KORA_VEGA` | RIGHT ear scar visible; copper vest on **female** Kora; hex accents only |
| FC-S03-03 | Bone-conduction beat; scar/implant often missing | `renders/FC-S03/FC-S03-03.png` | `LOCK_SHEET_KORA_VEGA` | LEFT clavicle ridge; faint copper glow OK; no UI text |
| FC-S03-04 | Dual lock telephoto; identity soft | `renders/FC-S03/FC-S03-04.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | One camera; Mileo post-cut + Coil LEFT wrist |
| FC-S03-05 | Contact standoff; Kora focal inconsistent | `renders/FC-S03/FC-S03-05.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | Kora must be copper-vest female lead |
| FC-S03-06 | Mileo ECU; OK-ish but scene package redo | `renders/FC-S03/FC-S03-06.png` | `LOCK_SHEET_MILEO_CHEN` | Vivid green eyes; no text |
| FC-S03-07 | QC: copper vest on **male** in tiles 07–08 | `renders/FC-S03/FC-S03-07.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | **Hard fix:** vest only on Kora; Mileo dark underlayer |
| FC-S03-08 | Same vest/gender / haul-up drift | `renders/FC-S03/FC-S03-08.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | Coil indigo LEFT wrist; no faction word on cloth |

### B. FC-S04 character drift (QC ~4/10)

| Shot id | Reason | Still to **replace** | Lock sheets | Prompt rewrite notes |
|---|---|---|---|---|
| FC-S04-02 | Outfit/face drift on entry | `renders/FC-S04/FC-S04-02.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | Freeze wardrobe states |
| FC-S04-03 | Drift through vault crowd | `renders/FC-S04/FC-S04-03.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | Principals locked; extras undifferentiated OK if not confusable with Sierra |
| FC-S04-04 | Blast drapes → command; continuity soft | `renders/FC-S04/FC-S04-04.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | Holo = abstract glow only |
| FC-S04-05 | Sierra first appearance; scar/outfit unreliable | `renders/FC-S04/FC-S04-05.png` | `LOCK_SHEET_SIERRA_CATALANO` | Pale scar **LEFT** cheek temple→jaw; leather + black pants |
| FC-S04-06 | Extra woman confusable with lead (QC) | `renders/FC-S04/FC-S04-06.png` | `LOCK_SHEET_SIERRA_CATALANO`, `LOCK_SHEET_MILEO_CHEN`, `LOCK_SHEET_KORA_VEGA` | Single clear Sierra; no lookalike second woman |
| FC-S04-07 | Scanner beat; Sierra identity soft | `renders/FC-S04/FC-S04-07.png` | `LOCK_SHEET_SIERRA_CATALANO`, `LOCK_SHEET_MILEO_CHEN` | Abstract blue scan glow; no HUD text |
| FC-S04-08 | Order to medical; outfit/scar drift | `renders/FC-S04/FC-S04-08.png` | `LOCK_SHEET_SIERRA_CATALANO`, `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | All three locks; no readable text |

### C. Hard rule — readable text / cue paint

| Shot id | Reason | Still to **replace** | Lock sheets | Prompt rewrite notes |
|---|---|---|---|---|
| FC-S07-07 | “Resist” / “istencia” burned on plates | `renders/FC-S07/FC-S07-07.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | Strip word Resistencia from prompts; copper hex only; NO lettering |
| FC-S07-08 | “Resistencia” / partial “LIZ” on wardrobe | `renders/FC-S07/FC-S07-08.png` | `LOCK_SHEET_KORA_VEGA`, `LOCK_SHEET_MILEO_CHEN` | Same; blank plates only |
| FC-S08-06 | Title-card “SIERRA MARK” from cue word Mark | `renders/FC-S08/FC-S08-06.png` | `LOCK_SHEET_SIERRA_CATALANO` | Remove “Mark” from image+video prompts; put hand-signal in `cues[]` / `action` only; one camera (no diptych) |

---

## Pre-gen checklist (Hermes)

1. Lock stills exist for Kora + Sierra (Mileo optional but recommended).
2. Each queued shot: `reference_images` filled; `lock_sheet_id(s)` set per `schemas/shot_schema_v2.json`.
3. Prompts end with `NO readable text, NO logos`.
4. No generation in this docs pass — queue only.

**Count this v1:** 7 (S03) + 7 (S04) + 3 (text/cue) = **17 shots** marked replace.
