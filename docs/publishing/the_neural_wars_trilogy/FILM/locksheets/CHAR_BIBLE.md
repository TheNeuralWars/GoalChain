# CHAR BIBLE — The Neural Wars · Fractured Code (FILM)
**Scope:** `FILM/locksheets/` — character lock images + deterministic generation prompts.
**Authority chain:** `wardrobe.md` (frozen) → `locks/LOCK_SHEET_*.md` (identity prose, frozen) → `VISUAL_BIBLE.md` (lighting/text rules) → **this file** (executable prompt templates).
**Generated:** 2026-09-14 (xAI `grok-imagine-image-quality`, anchored via `/v1/images/edits`, 2 reference stills per view).
**Renewal:** xAI OAuth grant must be refreshed (`auth.x.ai/oauth2/token`, refresh_token grant) before any new pass; the stored grant rotates on every refresh.

---

## 1. Files

| Character | Lock id | Views | Files |
|---|---|---|---|
| Mileo Chen | `LOCK_SHEET_MILEO_CHEN` | 3/4, profile, full | `LOCK_SHEET_MILEO_CHEN/{3q,profile,full}.jpg` |
| Kora Vega | `LOCK_SHEET_KORA_VEGA` | 3/4, profile, full | `LOCK_SHEET_KORA_VEGA/{3q,profile,full}.jpg` |
| Sierra Catalano | `LOCK_SHEET_SIERRA_CATALANO` | 3/4, profile, full | `LOCK_SHEET_SIERRA_CATALANO/{3q,profile,full}.jpg` |

9 stills, 3 characters, one panel each (never a contact sheet / multi-panel).

Passes: `p1` = first generation, `p2` = QC corrections, `p3` = hard negatives. The live file on disk is the last passing pass; job manifests are frozen in
`/data/apps/GoalChain/scripts/video_automation/nw_regen_20260914/jobs_locksheets.json` (p1), `jobs_pass2.json`, `jobs_pass3.json`.

---

## 2. Anchor stills (identity anchors — do not overpaint)

| Character | Anchors used | Note |
|---|---|---|
| Mileo Chen | `renders/FC-S01/FC-S01-02.png`, `FC-S01/FC-S01-04.png` | Best face lock in the film (QC ~9/10) |
| Kora Vega | `renders/FC-S03/FC-S03-05.png`, `FC-S03/FC-S03-02.png` | Least-degraded S03 tiles |
| Sierra Catalano | `renders/FC-S04/FC-S04-05.png`, `FC-S04/FC-S04-07.png` | S04 hero-intro tile |

Rule: anchors are **identity-only**. Wardrobe tokens in this file override whatever the anchor still shows.

---

## 3. Deterministic prompt template

Build every lock-sheet prompt as exactly these blocks, in this order:

```
Character reference still, <VIEW LINE>.
Characterization: <IDENTITY BLOCK>.
Wardrobe — <WARDROBE BLOCK>.
Continuity markers — <MARKERS BLOCK>.
Environment: plain industrial undercity concrete bay, sodium amber practical (#FF8C00) rim light,
deep shadow atmosphere (#000000 / #301934), volumetric haze.
Keep the same face, hair and wardrobe as the reference image(s); only change the camera view.
single camera, one view only, no multi-panel, no contact sheet collage, NO readable text,
NO letters, NO logos, NO signage, NO badges with lettering, no faction names on cloth, PG-13,
cinematic photoreal, anamorphic 2.39 feel, chiaroscuro, volumetric haze.
```

### VIEW LINE (per view)

| key | aspect | line |
|---|---|---|
| `3q` | `3:4` | three-quarter front medium close-up reference view, head-and-shoulders, camera at eye height, subject turned 30-45 degrees from camera, both eyes visible, neutral expression, subject seen from the side that shows the characteristic scar |
| `profile` | `3:4` | true profile medium close-up reference view showing the characteristic scar side in clear silhouette, head-and-shoulders, neutral expression, clean jawline and nasal bridge silhouette |
| `full` | `2:3` | full-body head-to-toe reference view, standing neutral, arms relaxed at sides, feet planted, camera eye-level mid-distance, whole figure in frame from hair to boots, slight anamorphic wide feel |

### IDENTITY / WARDROBE / MARKERS BLOCKS

**MILEO_CHEN**
- IDENTITY: `East Asian male ~32, oval-to-rectangular jaw, medium cheekbones, straight nasal bridge, moderate brow, clean-shaven, vivid green eyes, black regulation hair 3.2 cm, lean-athletic analyst build`
- WARDROBE (pre-cut state): `plain dark grey-steel Level-7 utility tunic (#708090 / #C0C0C0) over dark underlay (#000000 / #301934), abstract blank hexagonal badge geometry with no letters, belt with abstract EMP dampener pouch`
- MARKERS: `link nodule subtle under skin at base of skull (nape), hidden by the collar in front views; NO facial scar of any kind; no wrist glow in this state`
- Eyes: vivid green. Never brown/blue.

**KORA_VEGA**
- IDENTITY: `Latina mestiza woman ~24, angular cheekbones, defined jaw, slightly wide-set brown eyes with faint indigo flecks (#4B0082 flecks only, never a solid indigo iris), fullish lips, dark practical Underbelly hair shoulder-brushing 28-35 cm, compact agile street-operative build — FEMALE lead, never a male figure in this vest`
- WARDROBE: `worn copper-bronze tactical vest (#B87333 / #FFBF00 / #FF8C00) with BLANK unmarked plates (zero lettering, zero patches, zero glowing emblem) over dark underlayer (#000000 / #301934), dark pants (#301934), scuffed boots, compact abstract non-branded shock pistol shape only in the full-body view`
- MARKERS: `fibrous raised extraction scar ridge BEHIND THE RIGHT EAR (never on the cheek, never from temple to jaw); subtle subcutaneous bone-conduction ridge at LEFT clavicle with faint copper #B87333 glow, no UI text; cheeks, jaw and forehead completely clean`
- Eyes: brown with indigo flecks.

**SIERRA_CATALANO**
- IDENTITY: `European-descent woman ~38 commander, hazel calculating eyes, dark practical short commander bob (chin-length), weathered angular face, pale scar from LEFT cheek temple to jaw — which reads on the VIEWER'S RIGHT side of the frame — upright composed posture`
- WARDROBE: `weathered dark leather jacket with copper seam accents (#B87333 / #FF8C00) over black combat pants (#000000), no insignia, no lettering, no patches, no rank plates`
- MARKERS: `single pale faded scar LEFT cheek temple to jaw; no fresh scratches, no cuts, no bruising; no Coil, no bio-luminescent lines`
- Eyes: hazel.

---

## 4. Prohibited in every prompt (they get painted literally)

| Forbidden | Why |
|---|---|
| `Resistencia`, `Resistance`, any faction name | Burned onto wardrobe in FC-S07-07/08 |
| `Mark`, `SIERRA MARK`, any named hand-cue | Rendered as a title card in FC-S08-06 |
| `upper frame`, `lower frame`, `quad-split`, `diptych`, `panel`, `storyboard tiles` | Produces multi-panel composites inside one frame |
| Any readable lettering on cloth, props, HUD, signage, badges | Wardrobe + visual bible rule |
| `tattoo`, `cybernetic lines on the face/neck` | Model paints face/neck tattoos onto principals |
| Editor cues (`cut to`, beat sheets) | Bleed into the render |
| Prompts already containing a cheek scar for Kora or Mileo | Continuity break (see §5) |

Hex tokens are allowed and encouraged; **faction words are not**.

---

## 5. Accepted deviations (documented, not fixed)

1. **Kora 3/4 and profile:** the ridge behind the right ear is not legible at head-and-shoulders scale; the renders read as a clean, unscarred face. Continuity is carried by hair length + copper vest + brown/indigo eyes. Deliberately preferred over the earlier cheek-scar drift, which broke the identity lock.
2. **Abstract geometry:** some wardrobe surfaces keep faint abstract etching (non-textual). Allowed by the visual bible (“abstract glow / blank geometry instead of lettering”); no readable text is present.
3. **Anchored editing preserves composition** — refs are 16:9 film stills while lock views are 3:4 / 2:3; the model re-frames rather than crops, so lock views are new compositions, not crops of existing stills.

---

## 6. Reusing the locks on shot generation

For any future shot that includes a principal:
1. set `lock_sheet_id` (+ `reference_images[]` → the `locksheets/LOCK_SHEET_*/*.jpg` paths) in the storyboard shot object (`schemas/shot_schema_v2.json`);
2. paste the IDENTITY + WARDROBE + MARKERS block for that character into `image_prompt`;
3. pass the matching lock stills as reference images (max 2 per request — the xAI edits endpoint rejects 3 data-URI sources with a confusing `url`/`file_id` error);
4. end `image_prompt` **and** `video_prompt` with `NO readable text, NO logos`.

Generation helpers: `/data/apps/GoalChain/scripts/video_automation/nw_regen_20260914/xai_client.py` (`generate_image`, `generate_video`) and `runner.py` (parallel job runner, `results.jsonl` audit trail).
