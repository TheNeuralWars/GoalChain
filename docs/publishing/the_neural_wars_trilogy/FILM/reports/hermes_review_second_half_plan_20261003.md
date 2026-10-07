<!-- hermes -z (default profile model) 2026-10-03T22:00:41+00:00 -->
## Verdict
PASS WITH FIXES

## Findings

1. [major] [canon] plan §4, `martin_catalano` brief ("…violet ring around the pupils after the Cascade (Cap.14 L37); knee scar (Cap.14 L49)") -> the knee scar is **Sierra's**, not Martin's, and the line is L47, not L49. Evidence: `FC-14-Chapter_2026.md` L47, Martin speaking: "Me acuerdo de la cicatriz de tu rodilla izquierda cuando te caíste de la antena a los catorce años." -> fix: delete "knee scar" from Martin's brief (or move it to a Sierra note as LEFT knee) and correct the ref to L47; otherwise a Martin lock sheet will be generated carrying Sierra's scar.

2. [minor] [continuity] plan §6 rule ("Every new shot has an existing fallback … `fallback_existing` in the JSON") vs manifest -> all 37 new second-half trailer shots have `"fallback_existing": null`. Evidence: JSON L3045–L3477 (`"fallback_existing": null` for T21–T57); only T01 has a value (L2786, `…/knots/vid/K9_the_invitation.mp4`). -> fix: either populate the K1–K9 fallbacks for T21–T57 or reword the rule to "only T01 has a fallback; the rest have none yet".

3. [minor] [timing] plan §6 ("new S09–S18 shots in book order") vs EDL order -> three blocks run out of book order: T28 = FC-S10-07 (Cap.5 L3–15) precedes T29 = FC-S10-06 (Cap.4 L115–117); T40 = FC-S13-08 (MANUSCRIPT L421) follows T39 = FC-S13-07 (MANUSCRIPT L447–451); T47 = FC-S15-03 (Cap.10 L60–70) follows T44–T46 (Cap.11). Evidence: EDL rows T27–T29, T39–T40, T44–T47 vs chapter order. -> fix: either reorder (S10-06 before S10-07; S15-03 before S15-04) or drop the "book order" claim and label these deliberate trailer re-cuts.

4. [minor] [book-fidelity] JSON FC-S09-06 action ("…a thin trace of blood at one nostril") -> book has blood from **both** nostrils. Evidence: `FC-04-Chapter_2026.md` L77 "un chorro de sangre fresca que manó de ambas fosas nasales". -> fix: "blood from both nostrils".

5. [minor] [book-fidelity] JSON FC-S13-01 action ("…a thin trace of blood under Mileo's nose") -> source has heavy bleeding from nostril **and ear**. Evidence: `MANUSCRIPT/FC-07-Chapter.md` L315 "Blood now flows freely from his right nostril and ear". -> fix: "blood flowing from his right nostril and ear".

6. [minor] [book-fidelity] JSON FC-S16-07 action ("…a thin trace of blood at his nose") -> source has two threads from both nostrils. Evidence: `FC-14-Chapter_2026.md` L31 "dos finos hilos de sangre brotaron de sus fosas nasales". -> fix: "two thin threads of blood from both nostrils".

7. [minor] [continuity] JSON FC-S11-03: `location_id` = `neo_citania_glass` (ready) but the beat is the interior harvest pods. Evidence: action vs Setting clause (the token prose is the "Neo-Citania skyline of white alloy and graphene spires"); book `FC-05-Chapter_2026.md` L47 "las cápsulas secretas del Distrito Administrativo… flotando en gel conductivo". -> fix: add an administrative-district interior token (or set the setting clause to an interior pod cathedral) so the image prompt doesn't render exterior spires.

8. [minor] [continuity] plan line 47, three wrong continuity notes -> (a) "Jumpsuits come off in the redoubt from S10-02": S10-02 is `tunnel_six` and its prompt still lists the jumpsuits (JSON L944); the jumpsuit clause is absent from S10-03 onward. (b) "Riv's thigh burn appears from S11-08 on (Cap.6 L59)": the burn is inflicted in S11-07; `FC-06-Chapter_2026.md` L57 (L59 is only the limp). (c) "Mileo keeps the bandaged nape from S10 on (Cap.4 L101)": the nape is already bandaged from S07/S09 (`FC-04-Chapter_2026.md` L11, Okafor bandaged him pre-raid) and L101 is the dermal-regenerator re-treatment. -> fix: S10-03 / S11-07 / "from S07–S09".

9. [minor] [narration-sync] JSON N01 `book_refs` ("FC-00-Prologue_2026.md §El Tapiz Eterno (L9)") -> L9 of that file is blank; the quoted line is L10. Evidence: `FC-00-Prologue_2026.md` L8 = heading, L9 = blank, L10 = "Antes de que la primera estrella…". -> fix: cite L10.

10. [minor] [canon] plan §2 ("secondary characters get 1–5 shots each (Martin 10)") -> self-contradictory. Evidence: plan §2 and §4 both give Martin 10 shots. -> fix: "secondary characters get 1–5 shots each, except Martin (10)".

11. [minor] [continuity] plan §2/§8 ("the trailer avoids depending on unlocked faces (Martin is the one exception and is gated)"; "…plus 3 trailer beats") -> the trailer also depends on gated new faces Amara (T41), Elena (T42) and Daniel (T43), and Martin is in five trailer beats (T47, T48, T49, T50, T55), not three. Evidence: EDL T41/T42/T43 and T47–T50/T55; JSON `gates` `needs_character_lock:amara_lin / elena_vasquez / daniel_mercer / martin_catalano`. -> fix: correct the claim/count (Elena is a light-being with no readable face; Amara/Daniel are single beats).

12. [minor] [timing] plan §6 ("T21 = FC-S09-01, the first new shot") -> T01 (FC-S18-01) is also flagged `"kind": "new"` in the EDL. Evidence: JSON EDL T01 `"kind": "new"` (L2781) vs T21 note "first NEW shot" (L3044). -> fix: "first new shot of the second-half block".

## Checked OK
- All 76 shots' `book_ref` ranges resolve to the cited EDICION/MANUSCRIPT lines and the actions match the source beats (S09-01→Cap.4 L49, S09-08→L81–91, S10-07→Cap.5 L3–15, S11-07→Cap.6 L57, S12-03→Cap.7 L11, S13-05/06/07→MS L385/L407–415/L447–451, S14-06→Cap.9 L3–19, S15-06→Cap.11 L51, S16-07→Cap.14 L31, S17-06→Cap.15 L23–27, S18-04→Epilogue L25–33, etc.).
- Wardrobe continuity: S09 prompts carry the grey-steel sanitation-jumpsuit overlay; Mileo's bandaged nape is present from S09; Riv's LEFT-thigh burn (S11-07) and bandage (S11-08) plus limp (S12-07) are consistent; Mileo is absent from S14–S15 and appears only as light from S16-02/S17-01/S18-05/06; Martin first appears in S14-06 (Cap.9) and gets the violet-indigo iris ring only from S16-04.
- Canon locks in every prompt: Mileo Coil "LEFT wrist and LEFT forearm only, unmarked right arm"; Sierra "LEFT cheek … never right cheek"; Kora "fibrous scar ridge behind her RIGHT ear" + female copper-bronze vest; Architect "no body, no face" in all three of its shots; global "NO readable text, NO logos" negatives present.
- Zero occurrences of `NeuroSys`, `NeuroSec`, `Resistencia`, `Nivel 7`, `Mark`, or panel-language ("upper frame/quad-split/diptych") anywhere in the 76 prompts.
- Trailer EDL: 58 segments, contiguous 0.0→192.5 s, durations sum exactly to 192.5; every existing `src_in/src_out` lies inside the measured clip length; all 17 existing `v3ax_tc` values match the `v3ax_timeline` starts; act structure (cold open 0–18 / recap 18–65 / second half 65–187.5 / title 187.5–192.5) matches plan §6.
- Trailer contents: 38 new shots used + 4 alternates; existing-shot content notes verified against `FC_PRODUCED_SCENES_INVENTORY_20261003.md` (T02 Yggdrasil hologram, T05 empty compliant eyes, T09 Coil LEFT wrist, T14 LEFT-forearm probes, T16 indigo-fire/polyphonic, T18 trio clears hatch, T20 palm on hatch).
- Narration: 23 lines N01–N23, every window sits inside its segments and is contiguous with the next, all ≤2.0 w/s, 4 silent segments (T09, T38, T39, T51); the 7 verbatim quotes check out (N06 FC-03 L107/L111, N07 L139, N10 FC-04 L117, N19 FC-15 L27, N20 L35, N21 FC-16 L33, N22 FC-16 L45).
- Plan §3 character counts verified: kora 26, mileo 25, sierra 23, martin 10 (84 `character_ids` entries + Martin in `proposed_tokens`).
- S16-06 location correctly moved to `recovery_pavilion` (Cap.13 L31); S13 correctly sourced from MANUSCRIPT with the EDICION elision noted; proposed locations (17) and characters (9) counts match `proposed_tokens`.

<!-- exit=0 end 2026-10-03T22:13:24+00:00 -->
