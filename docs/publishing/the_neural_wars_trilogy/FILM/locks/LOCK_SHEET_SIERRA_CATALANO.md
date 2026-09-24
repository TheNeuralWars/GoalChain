# LOCK SHEET — Sierra Catalano
**id:** `LOCK_SHEET_SIERRA_CATALANO`  
**FILM:** The Neural Wars · Fractured Code  
**Status:** FROZEN for identity  
**QC context:** Consistency **weak** (FC-S04 ~4/10). Outfit changes 3–4×; LEFT cheek scar missing or wrong side; extra woman confusable with lead. Lock-sheet + refs mandatory before S04 redo.

---

## 1. Identity lock

| Field | Value |
|---|---|
| Age | Mid-30s field commander presence (visual ~33–38) |
| Ethnicity | European-descent features; resistance commander presence |
| Face geometry invariants | Strong angular jaw; high cheekbones; composed brow; cool closed-mouth default; no soft teen features; same face every shot |
| Hair | Dark; practical commander cut **~8–12 cm** (above collar, neat, not long); never flowing long hair |
| Build | Athletic tactical; upright command posture |

**Prompt constraint (EN):** `European-descent woman resistance commander, same face lock as LOCK_SHEET_SIERRA_CATALANO, hazel eyes, pale scar LEFT cheek temple to jaw, dark practical short commander hair`

---

## 2. Eyes (exact)

- **Color:** hazel (mixed brown-green; dark calculating chill)
- **Never:** vivid Mileo-green, solid blue, Kora brown+indigo flecks

---

## 3. Three required views (prose for future still generation)

Neutral / cool command expression; same wardrobe; one camera; no multi-panel; no readable text.

### 3/4 front
Medium close-up ~30–40°; **LEFT cheek** toward camera so pale scar (temple→jaw) is unmistakable. Hazel eyes catch practical light. Head-and-shoulders.

### Profile
Prefer **LEFT profile** to lock scar silhouette temple→jaw. Medium close. Dark Atmosphere backdrop with soft fog.

### Full-body
Head-to-toe, neutral standing command stance (hands at sides or one near jacket seam), black combat pants + weathered leather jacket readable. Mid-distance single camera; sealed metro redoubt / bunker — abstract holo glow OK, **no readable UI**.

---

## 4. Scars / tech invariants

| Marker | Side / location | Notes |
|---|---|---|
| Corporate-raid scar | Pale scar **LEFT cheek**, temple → jaw (brother Martin memento — lore only; never on-screen text) | Always present when face visible; **never right cheek** |

No Coil on Sierra. No bone-conduction ridge required on face.

---

## 5. Wardrobe states (hex only)

### Tactical commander (default FC-S04+)
- Black combat pants: `#000000`
- Weathered leather jacket: dark brown-black leather with optional copper seam accents `#B87333` / `#FF8C00` **at seams only**
- Undershirt dark `#301934` / `#708090`
- **NO logos, NO readable text, NO faction name plates**

### Optional surface disguise
- Utilitarian sanitation/work jumpsuit grey-steel `#708090` / `#C0C0C0` over frozen black combat layers — abstract workwear only, **blank** (no “SIERRA”, no ranks, no words)

Prop context: holographic tactical table = abstract electric-blue UI glow only (`#0080FF` / `#4682B4`) — **NO readable maps/labels**.

---

## 6. Negative constraints

- NO readable text, logos, badges with letters
- NO faction name labels; never paint “Resistencia” on jacket/plates
- NO cue words in prompts that models paint as titles (“Mark”, “SIERRA MARK”)
- NO panel language (“upper frame”, “quad-split”, “diptych”)
- NO multi-panel; one camera per shot
- Do not introduce a second similar woman in frame without clear differentiation
- PG-13

---

## 7. Consistency score context

QC: **Sierra weak**. Outfit and scar side drift are the main failures. Freeze leather+black pants + LEFT cheek scar via lock stills and `reference_images` on every Sierra shot. FC-S08-06 must never contain the word “Mark” in image/video prompts.

## 8. LOCK REFS + VISION QC

**refs_dir:** `locks/refs/sierra_catalano/` — `front.png` (3/4), `profile.png`, `fullbody.png`
**QC verdict:** PASS WITH MINOR DRIFT — checked 2026-09-14 against CANON + this sheet with real vision on every still.

**Verified pass:**
- Pale scar correctly on the LEFT cheek temple→jaw in front and profile views; serious commander presence; hazel reading.
- Dark leather jacket + black layers, copper seam accents, no readable lettering anywhere.
- Female, short dark commander hair, whole body in frame in the full-body view.

**Open deviations / rules for the next regen pass:**
- Minor drift: a second faint scar appears on the right cheek, and a BLANK rectangular shoulder patch persists. Add `no second scar, no shoulder patch, sleeves completely plain` to future Sierra regens.

**Pipeline note:** the xAI image-edit endpoint rejects a single reference image (HTTP 422) — always pass 2 refs (duplicate the same anchor if only one is valid). A 403 means the daily quota is spent.
