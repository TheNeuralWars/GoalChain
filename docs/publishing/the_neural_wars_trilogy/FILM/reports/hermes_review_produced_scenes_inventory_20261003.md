<!-- hermes -z (default profile model) 2026-10-03T21:46:30+00:00 -->
I've completed the read-only audit. Below is the review.

## Verdict
PASS WITH FIXES

The artifact's substantive claims are accurate: scene order, the v3_ax timecode model, durations, shot counts, the FC‑S08 7/8 correction, and the FC‑S06A stale-status note all check out against the scene JSONs, the remount script/report, Gate D, the edit log and the EDICION line ranges. Only minor description/sourcing defects remain.

## Findings

1. [severity: minor] [category: timing] §1 table, "v3_ax in → out" for the four scenes that immediately follow an AX insert (FC‑S03 1:40.11, FC‑S06 4:05.75, FC‑S06A 4:55.32, FC‑S08 6:10.31) -> these in‑times are the xfade‑timeline start shifted by the inserted AX durations, i.e. they land 0.8 s *before* the real v3_ax boundary (they fall inside the preceding AX clip), contradicting the artifact's own note in line 5 ("its *visible* start = AX end"). Evidence: `renders/_conform_v3/remount_ax_v3.py` splits at `t1=ends["FC-S02"]`… (lines 170‑173, `XFADE = 0.8` line 50); `remount_ax_report.json` `scene_ends_xfade` gives FC‑S02 end 95.866666, so AX01 occupies 95.87–100.91 and v3_ax 100.11 is inside AX01, not the start of FC‑S03. Proposed fix: for post‑AX scenes list the AX end as the in‑time (FC‑S03 1:40.91, FC‑S06 4:06.55, FC‑S06A 4:56.12, FC‑S08 6:11.11), or relabel the column "xfade‑timeline start (pre‑splice)".

2. [severity: minor] [category: continuity] §2 header "### FC-AX: The Architect Presence — Insert Shots (docs only)" -> stale "(docs only)"; the five AX clips are rendered and cut into v3_ax. Evidence: `scenes/FC-AX_ARCHITECT_INSERTS.json` line 30 `"status": "rendered_qc_pass"`; `reports/GATE_D_ARCHITECT_GRAMMAR_QC.md` line 15 "# **PASS**"; the artifact itself states "JSON status: rendered_qc_pass" two lines below. Proposed fix: drop "(docs only)" (e.g. "Rendered inserts") or annotate that the JSON title is historical.

3. [severity: minor] [category: continuity] §2 header "### FC-S06A: Protocol Delta Breach — Action Insert (docs only)" -> same stale "(docs only)"; the 4 shots were rendered and cut. Evidence: `scenes/FC-S06A_ACTION_INSERT.json` line 26 `"status": "ready_for_render"` (title line 3 "... (docs only)") vs `renders/FC-S06A/FC-S06A-01.meta.json` `"status": "rendered", "rendered_at": "2026-09-14T10:10:29Z"` and `renders/FC-S06A/FC-S06A_cut_v2.mp4`; the artifact's own §3 item 2 says exactly this. Proposed fix: drop "(docs only)".

4. [severity: minor] [category: book-fidelity] line 6, minifilm figure attributed to `edit/project.md` -> project.md does not state 542.1 s (it documents the live minifilm as 409.1 s, and a different filename). Evidence: `edit/project.md` line 358‑359 "v7 publicado y vivo: .../FC_minifilm_239_v2.mp4 (409,1 s …)"; the 542.1 s figure instead matches the v8 timeline 530.0 s + the ~12 s opening. Evidence: `edit/v8/audio/VIDEO_TIMELINE.json` last row (K9 start 521.0 + dur 9.0 = 530.0) and `docs/assets/film/improve_20260915/index.html` line 22 "(book adaptation · ~530 s)". Proposed fix: cite the actual source of 542.1 s (or state "v8 timeline 530.0 s + B00a/B00b opening ≈ 542.1 s"), and note project.md is stale.

5. [severity: minor] [category: canon] §3 item 5 -> presents "Coil colour drift to cyan" as an established drift requiring "no cyan Coil" negatives, but the edit log retracted that QC claim the same day as a false positive. Evidence: `edit/project.md` line 189 "FC‑S01: «el Coil salió cian, no índigo» ❌ **Ya es índigo/violeta** … **No necesita corrección**." Proposed fix: state the flag was raised in VISUAL_QC 2026‑09‑24 and subsequently retracted (negatives kept only as precaution), so no one "fixes" canon colour.

6. [severity: minor] [category: continuity] §2 headers "JSON status: `rendered_8_8`" for FC‑S04, FC‑S06 and FC‑S07 -> those scene JSONs have no top‑level `status` field; the value comes from `ledger.json`. Evidence: `scenes/FC-S04.json` ends at `"cut": { … }` with no `status`; `scenes/FC-S06.json` ends at `"cut": "renders/FC-S06/FC-S06_cut_v1.mp4"`; `scenes/FC-S07.json` ends at the `shots` array; `ledger.json` line 386/517/627 `"status": "rendered_8_8"`. Proposed fix: label the source as "ledger status" for these three scenes (S01/S02/S03/S05/S08 do carry it in JSON).

7. [severity: minor] [category: continuity] §3 item 3 "still scan the old `_cut_v1` 848×480 cuts" -> true for FC‑S01–S08 but not for FC‑S06A, which the same pulse scans at 1280×720. Evidence: `reports/film_continuity_report_pulse_20261002.md` line 20 "FC‑S06A | OK | 24.187663 | 1280x720". Proposed fix: qualify ("FC‑S01–S08 are scanned from the old 848×480 `_cut_v1` cuts; FC‑S06A is scanned at 1280×720").

## Checked OK

- Scene order in v3_ax = S01, S02, AX01, S03, S04, S05, AX02, S06, AX03, S06A, S07, AX04, AX05, S08 — matches `remount_ax_v3.py` `ASSEMBLY_V3` and `remount_ax_report.json`.
- Master duration 407.625 s / 1280×720 / 24 fps / −20 LUFS / `bed_v3_elevenlabs_norm.wav` — matches `remount_ax_report.json` (duration_s 407.625, I −20.0) and Gate D.
- v2 = 382.392 s from 0.8 s xfades over the nine scene conforms — `remount_ax_report.json` `scene_ends_xfade` ends 382.391665; `conform.py` `XFADE = 0.8`.
- AX durations 5.04/5.04/6.04/5.04/4.04 and AX TCs 1:35.87, 4:01.51, 4:50.08, 6:02.02, 6:07.07 — match Gate D slots (95.87/241.51/290.08/362.03/367.07).
- §1/§2 timecodes for S01–S08, S06A (incl. S06A 4:55.32–5:19.49) and S08 (6:10.31–6:47.60) — recomputed from `scene_ends_xfade` + cumulative AX; all consistent.
- Shot counts: S01–S07 = 8, S06A = 4, AX = 5 — match the scene JSONs.
- FC‑S08 discrepancy (7/8, not 6/8) — `renders/FC-S08/FC-S08-07.mp4` exists; `scenes/FC-S08.json` says `rendered_6_8`; `plans/FC_SECOND_HALF_SHOTS_20261003.json` line 15 "FC-S08_cut_v2 (37.31 s) contains S08-01..07"; S08 conform 37.292 s confirms 07 is in v3_ax; last master shot = FC‑S08‑07.
- FC‑S06A discrepancy (stale `ready_for_render`) — renders + `FC-S06A_cut_v2.mp4` exist and S06A is in the assembly.
- Book line ranges all verified against EDICION: S01 FC‑01 L78–135, S02 L133–137, S03 FC‑02 L27–77, S04 L79–131, S05 FC‑03 L77–125, S06 L127–141, S06A L131–141, S07 FC‑04 L3–31, S08 L33–49.
- «Es una cosecha» attributed to Mileo at FC‑02 L63 — correct (`FC-02-Chapter_2026.md` L63).
- AX "presence grammar" motivations: Cap.3 L139 (Kora: «El Arquitecto ya sabe lo que hemos visto»), Cap.4 L81–85 (Architect antenna), Cap.5 L3 (Architect POV) — all present in EDICION.
- ContinuityGuard 2026‑10‑02: scans the 848×480 `_cut_v1` cuts; face flags 0; per‑shot physics only S06 (4)/S08 (1) — matches `film_continuity_report_pulse_20261002.md`; AX 2026‑09‑23 = PASS.
- Sierra hair lock ("~8–12 cm, above collar, neat") vs footage pulled back — lock sheet line 16; `VISUAL_QC_full_library_20260924.md` line 95 (ponytail); `edit/project.md` §3 decision.
- Coil-cyan flag exists in VISUAL_QC 2026‑09‑24 (line 101) — correctly attributed to that report.
- Deliverables listed (knots K1–K9, bridges B1–B6, opening B00a/B00b) exist under `edit/knots/`, `edit/bridge/`, `edit/opening/`; live minifilm v3 URL confirmed in ASSEMBLY_v3/PRODUCT_PULSE.

<!-- exit=0 end 2026-10-03T21:59:03+00:00 -->
