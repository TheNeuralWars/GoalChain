# LOCK SHEET — Kora Vega
**id:** `LOCK_SHEET_KORA_VEGA`  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN for identity  
**QC context:** Consistency **weak** (FC-S03 ~4/10). Scar behind RIGHT ear often missing; copper vest worn by wrong gender in some tiles; hair length drifts; lead only in ~5/8 tiles. This sheet + reference stills are mandatory before any S03 redo.

---

## 1. Identity lock

| Field | Value |
|---|---|
| Age | ~24 |
| Ethnicity | Latina / mestiza features; sharp street-operative presence |
| Face geometry invariants | Angular cheekbones; defined jaw; slightly wide-set eyes; straight-to-soft nasal bridge; fullish lips; no freckle map; same face every shot |
| Hair | Dark; practical Underbelly cut; **shoulder-brushing ~28–35 cm** (nape to tip); slightly unkempt; never waist-length, never buzz |
| Build | Compact agile operative; not tall towering commander |

**Prompt constraint (EN):** `Latina mestiza woman ~24, same face lock as LOCK_SHEET_KORA_VEGA, dark practical shoulder-length hair, brown eyes with indigo flecks, fibrous scar ridge behind RIGHT ear`

---

## 2. Eyes (exact)

- **Color:** brown iris with **indigo flecks** (Cascade hint — flecks only, not full indigo iris)
- **Never:** solid green, solid blue, fully indigo iris, mismatched eyes

---

## 3. Three required views (prose for future still generation)

Neutral expression; same wardrobe state; one camera; no multi-panel; no readable text.

### 3/4 front
Medium close-up, ~35° turn, both eyes clear so indigo flecks read, RIGHT ear slightly toward camera so fibrous extraction ridge is visible. Soft practical rim. Head-and-shoulders.

### Profile
Prefer **RIGHT profile** so the ear scar reads in silhouette/half-light. Clean jawline. Medium close. Atmosphere fog behind (#000000 / #301934).

### Full-body
Head-to-toe neutral stance, shock pistol low-ready or holstered (abstract non-branded shape), scuffed boots planted. Copper-bronze vest readable. Mid-distance single camera; industrial tunnel or metro bay — no signage.

---

## 4. Scars / tech implants (invariants)

| Marker | Side / location | Notes |
|---|---|---|
| Clandestine Link extraction scar | Fibrous ridge **behind RIGHT ear** | Must appear whenever ear is visible |
| Bone-conduction analog shortwave | Embedded under scar tissue at **LEFT clavicle / collarbone** | Subtle subcutaneous ridge; may glow faint copper `#B87333` / `#FFBF00` when active — **never UI text** |

**Never:** scar on left ear; bone-conduction on right clavicle; readable markings on implant.

---

## 5. Wardrobe states (hex only)

### Street / copper tactical (default FC-S03+)
- Worn copper-bronze vest over dark underlayer  
  Accents: `#B87333` / `#FFD700` / `#FFBF00` / `#FF8C00`  
  Underlayer / pants: `#000000` / `#301934` / dark `#708090`
- Scuffed boots; no logos
- Prop: compact shock pistol — abstract non-branded shape; **NO logos, NO readable text**

### Optional muted under disguise (surface ops)
- Same face/scar locks; copper vest muted under utilitarian grey-steel workwear (`#708090` / `#C0C0C0`) — still **no lettering**

**CRITICAL:** Never print the word Resistencia (or any faction name) on clothes, plates, or patches. Use hex copper/gold accents only.

---

## 6. Negative constraints

- NO readable text, logos, badges with letters, faction name labels
- NO “Resistencia” / “Resistance” / “NeuroSys” as on-screen text
- NO script cues (“Mark”), NO panel language (“upper frame”, “quad-split”, “insert panel”)
- NO multi-panel composites; one shot = one camera
- Kora must remain the **female** lead in copper vest — never swap vest onto a male extra
- PG-13

---

## 7. Consistency score context

QC: **Kora weak**. Highest leverage = lock-sheet stills (3/4, profile, full-body) passed as `reference_images` on every Kora shot. Redo FC-S03 character shots after lock stills exist.

## 8. LOCK REFS + VISION QC

**refs_dir:** `locks/refs/kora_vega/` — `front.png` (3/4), `profile.png`, `fullbody.png`
**QC verdict:** PASS WITH DEVIATION — checked 2026-09-14 against CANON + this sheet with real vision on every still.

**Verified pass:**
- Face verified completely unscarred (both cheeks) in all 3 views; no earrings/jewellery; female lead in the copper vest; zero lettering on vest or pistol.
- Hair reads dark, unkempt, shoulder-length. Brown eyes.
- Deviations accepted: (a) the fibrous extraction ridge renders on/around the NEAR EAR instead of strictly behind the RIGHT ear; in the profile view the camera faces her LEFT side. (b) The front view had to be generated text-only — see root cause below.

**Open deviations / rules for the next regen pass:**
- ROOT CAUSE: the FC-S03 stills (used as refs) encode a left-cheek scar, and the model copies it — text instructions cannot override a contaminated reference. Never use FC-S03 character stills as Kora refs again; use locks/refs/kora_vega/front.png as the anchor and state the orientation explicitly (`nose toward the LEFT edge of frame, near ear is the RIGHT ear`).

**Pipeline note:** the xAI image-edit endpoint rejects a single reference image (HTTP 422) — always pass 2 refs (duplicate the same anchor if only one is valid). A 403 means the daily quota is spent.
