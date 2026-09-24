# LOCK SHEET — Mileo Chen
**id:** `LOCK_SHEET_MILEO_CHEN`  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN for identity (wardrobe states may switch per shot)  
**QC context:** Consistency **strong** (FC-S01 ~9/10). Best face lock in current stills; keep this sheet as the reference baseline for all future gens.

---

## 1. Identity lock

| Field | Value |
|---|---|
| Age | ~32 |
| Ethnicity | East Asian male |
| Face geometry invariants | Oval-to-rectangular jaw; medium cheekbones; straight nasal bridge; moderate brow; clean-shaven; no freckles; subtle under-eye fatigue OK but same face across shots |
| Hair | Black, regulation cut **3.2 cm** length (exact); neat NeuroSys trim; never longer, never undercut fade |
| Build | Lean-athletic analyst frame; not bodybuilder |

**Prompt constraint (EN):** `East Asian male ~32, same face lock as LOCK_SHEET_MILEO_CHEN, black regulation hair 3.2 cm, vivid green eyes`

---

## 2. Eyes (exact)

- **Color:** vivid green (iris saturated; not hazel, not brown-green)
- **Gaze:** analytical, then post-awakening unsettled focus
- **Never:** brown, blue, or mismatched pupils

---

## 3. Three required views (prose for future still generation)

All three views: **neutral expression**, same wardrobe state for a given generation pass, single camera, no multi-panel, no readable text.

### 3/4 front
Medium close-up, camera at eye height, subject turned ~30–45° from camera, both eyes visible, left ear lightly suggested, soft volumetric rim from behind-right. Head-and-shoulders crop. Neutral mouth. Hair clearly readable as 3.2 cm black regulation.

### Profile
True left or right profile (specify LEFT when showing Coil wrist later). Ear, jawline, and nasal bridge clean silhouette. Medium close. Neutral stance of head. Background deep Atmosphere (#000000 / #301934) with soft fog — no signage.

### Full-body
Full figure head-to-toe, standing neutral (arms relaxed at sides or one hand near belt pouch if pre-cut), feet planted, camera eye-level mid-distance, slight anamorphic wide feel. Same wardrobe state as the chosen pass. Environment: plain industrial/Underbelly concrete — no props that introduce logos.

---

## 4. Scars / tech / Coil invariants

| Marker | Side / location | When visible |
|---|---|---|
| Link nodule | Base of skull (nape), subtle under skin | Pre-cut ON wardrobe |
| Link-extraction bandage / scar | Nape | Post-cut |
| **Serpent’s Coil** | Deep indigo bioluminescent lines under skin of **LEFT wrist** (and optional LEFT forearm geometric dermal scar circuit) | **Post-cut only** |
| EMP dampener | Belt pouch prop (abstract shape) | Pre-cut |

**Never:** Coil on right wrist; Coil glowing while still in Level-7 tunic; readable HUD on skin.

Coil hex accents when glowing: Cascade `#4B0082` / `#3F00FF` / `#0080FF`.

---

## 5. Wardrobe states (hex only — no faction name labels on cloth)

### PRE Link cut (`wardrobe_ref`: Mileo Chen ON / pre-cut)
- NeuroSys Level-7 **gray** regulation tunic — cloth approx Neo-Citania `#708090` / `#C0C0C0` / `#F8F8FF`
- Belt pouch with EMP dampener (abstract; **no logos**)
- Optional hexagonal badge shape on chest as **blank abstract geometry only** — **NO readable text**, no “Nivel 7”, no letters
- Link nodule at nape implied under collar

### POST Link cut (`wardrobe_ref`: Mileo Chen AFTER cut + Coil)
- Gray tunic **torn off / discarded** (may appear in mud as discarded prop, blank fabric)
- Dark practical underlayer for tunnel escape — `#000000` / `#301934` / dark slate `#708090`
- LEFT wrist Coil indigo visible when sleeve pushed or wet
- Scuffed practical boots; no logos

---

## 6. Negative constraints (always append to prompts)

- NO readable text, letters, numbers, logos, badges with lettering
- NO faction name labels on clothing or props
- NO screenplay / storyboard cue language in the image (“Mark”, “upper frame”, “quad-split”, “panel”, “insert”)
- NO multi-panel / diptych / split-screen inside one frame
- NO printing “Resistencia”, “NeuroSys”, “Nivel”, or any word on cloth
- PG-13 only (no gore; medical scar detail OK)

---

## 7. Consistency score context

From FILM_QC_CEO: **Mileo strong** — FC-S01 stills hold face + wardrobe arc (gray tunic → torn → dark underlayer). Use this lock-sheet + `reference_images` on every shot that includes Mileo so later scenes do not drift.

## 8. LOCK REFS + VISION QC

**refs_dir:** `locks/refs/mileo_chen/` — `front.png` (3/4), `profile.png`, `fullbody.png`
**QC verdict:** PASS — checked 2026-09-14 against CANON + this sheet with real vision on every still.

**Verified pass:**
- Green eyes correct in all 3 views; identity reads as the same East Asian male ~32.
- Face verified clear of scars/marks in front, profile and full-body (an earlier pass invented a left-cheek scar and was rejected).
- Pre-cut grey tunic + blank abstract hexagonal patch, no readable text, no name plate, no logos.
- Full-body: whole figure hair-to-boots, black boots, belt pouch read as abstract geometry.

**Open deviations / rules for the next regen pass:**
- Model keeps adding a short fringe/bangs over the forehead instead of the exposed 3.2 cm regulation cut. Add `forehead fully exposed, NO fringe, NO bangs, NO bowl cut` to every future Mileo regen.

**Pipeline note:** the xAI image-edit endpoint rejects a single reference image (HTTP 422) — always pass 2 refs (duplicate the same anchor if only one is valid). A 403 means the daily quota is spent.
