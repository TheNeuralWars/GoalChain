# Hermes review R6: FC-S09 renders (raw, hermes -z, deepseek/deepseek-v4.1-flash)
Prompt: ~/fc_grokbot_20261004/hermes/prompt_s09_render.txt · Evidence pack: ~/fc_grokbot_20261004/review/s09_render_review_pack.json · Dispositions: plans/FC_SECOND_HALF_PLAN_20261003.md §9 R6

# Hermes review: s09_render (started 2026-10-04T04:12:49Z)
## Verdict
**FAIL** for director review. Canon blockers: RIGHT-arm Coil glow (S09-05), Sierra/Mileo character blend with Coil on the gun hand (S09-08), magenta palette drift (S09-03), Kora vest missing (S09-03). S09-07 is clean; S09-04 near-clean. ContinuityGuard S09 = 0 flags, but its face pass is meaningless here (margin 0.8832 vs 0.88 = 0.0032; primary = staging stub).

| # | Shot | Sev | Issue | Fix |
|---|------|-----|-------|-----|
| 1 | S09-05 | blocker | Coil glows on Mileo's RIGHT arm (frame-left while facing cam). Lock: LEFT wrist/forearm only | Regen: turn Mileo so LEFT forearm faces camera; "Coil indigo LEFT wrist/forearm only, right arm unmarked" |
| 2 | S09-08 | blocker | Pistol-holder blends Sierra+Mileo, carries glowing LEFT wrist; Mileo unreadable; white eyes + cable strike absent | Regen: separate — Sierra (no Coil, LEFT-cheek scar, pistol) strikes cable; Mileo distinct, white eyes, LEFT hand clamps Sierra wrist |
| 3 | S09-03 | blocker | Vertical MAGENTA/pink neon coils from 3 s — lock = 482 nm blue/indigo, never magenta/cyan | Regen: "coil lights electric blue #0080FF / indigo #4B0082, no magenta, no pink, no cyan" |
| 4 | S09-03 | major | Kora lacks copper vest (reads brown leather jacket) — vest is her identity lock | Regen: "female Kora in worn copper-bronze vest #B87333 over dark underlayer" |
| 5 | S09-02 | major | Sierra in black leather/black pants (base) — 3rd outfit across 01–03; breaks S08 jumpsuit continuity | Regen: hold S08 grey-steel sanitation jumpsuit #708090, copper seam accents |
| 6 | S09-01 | major | Several violet-glowing gloves; lock = NO Coil on Sierra | Regen: "only Mileo's LEFT wrist glows; all other gloves plain, no glow" |
| 7 | S09-06 | major | Arc strikes face/mouth; reads as mouth electrocution. Book L73–77 = nape scar | Regen: "connector pressed to nape scar, white arc at nape, spine arches, knees drop" |
| 8 | S09-05 | major | Kora grips Riv's arm; book L65 = Mileo's arm | Regen: "Kora grips Mileo's LEFT arm" |
| 9 | CG | major | Face pass margin 0.0032; primary face is staging stub → Sierra lock unverified | Manual face re-QC vs locks/refs/sierra_catalano before approval |
| 10 | S09-01 | minor | Hatch disc copper-rimmed vs S08-07 brushed steel/titanium, indigo inner ring | Regen: "brushed titanium disc, indigo inner ring, no copper rim" |
| 11 | S09-04 | minor | Core filaments read electric blue > indigo | Note/optional: "filaments indigo #4B0082/#3F00FF" |
| 12 | S09-03 | minor | Chest patch present on jumpsuit (text/logo risk) | "blank plates, no patch, no readable text" |

## Per-shot disposition
- **FC-S09-01 — REGEN.** Beat/L49 ok, but see #6,#10. Change: "only Mileo's LEFT wrist glows indigo; all others plain gloves; hatch brushed titanium disc, indigo inner ring, no copper; Sierra holds S08 grey-steel sanitation jumpsuit."
- **FC-S09-02 — REGEN.** God-scale aisle/blue ok (#5). Change: "Sierra in grey-steel sanitation jumpsuit #708090, copper seam accents, matching S08 — no black leather."
- **FC-S09-03 — REGEN.** (#3,#4,#12). Change: "coil lights electric blue #0080FF/indigo #4B0082 only — no magenta/pink/cyan; Kora in copper-bronze vest #B87333; jumpsuit chest blank, no patch."
- **FC-S09-04 — KEEP-WITH-NOTE.** Clean, no text; push filament hue to indigo (#4B0082/#3F00FF) on next pass.
- **FC-S09-05 — REGEN.** (#1,#8). Change: "Mileo's LEFT forearm toward camera, Coil indigo LEFT wrist only, right arm unmarked; Kora grips Mileo's LEFT arm."
- **FC-S09-06 — REGEN.** (#7). Change: "connector pressed to nape scar; white arc at nape; back arches; knees hit grating; blood from both nostrils."
- **FC-S09-07 — KEEP.** Abstract indigo mesh, neutral Architect grammar, no faces/text.
- **FC-S09-08 — REGEN.** (#2). Change: "Sierra (no Coil, pale LEFT-cheek scar, plain pistol) strikes connector cable; Mileo separate, eyes white, LEFT hand clamps Sierra's wrist; Kora kneeling, violet veins; scarlet alarm; Riv pulls drive."

Note: S08→S09-01 join (0.8 s xfade) reads smooth; fix the wardrobe drift (#5) so the cut holds.

exit=0
