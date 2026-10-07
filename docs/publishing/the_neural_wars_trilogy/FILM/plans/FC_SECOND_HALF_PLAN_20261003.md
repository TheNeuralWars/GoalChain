# Fractured Code — Second-half film plan (Cap.4 L49 → Epílogo)

**Status:** DRAFT 2026-10-03 (Grok Bot, overnight, autonomous). Hermes (VPS, `hermes-ceo`, default DeepSeek) reviewed every artifact; see §9. **No publishing, no deploys.** All files are new; nothing existing was modified.
**Companion files (same dir `FILM/plans/`):**
- `FC_WHOLE_BOOK_MAP_20261003.md`: acts, arcs, themes, reveals, continuity gaps (cited)
- `FC_PRODUCED_SCENES_INVENTORY_20261003.md`: every produced scene/shot with book source and v3_ax TC
- `FC_NARRATION_SCRIPT_DRAFT_20261003.md`: Spanish narration for Nico to record (timed to the trailer EDL)
- `FC_SECOND_HALF_SHOTS_20261003.json`: machine manifest (76 shots with full prompts, refs, gates; trailer EDL; narration beats; v3_ax timeline)
- `fc_second_half_crosscheck_20261003.py` + `../reports/FC_SECOND_HALF_CROSSCHECK_20261003.{md,json}`: final consistency check (§10)
- Generation: `fc_s09_pilot_runner_v2_20261003.py` (gated, max 2 refs since v2.1, single attempt; v1 `fc_s09_pilot_runner_20261003.py` = audit record of the 403 test call). Proposal: `PROPOSED_LOCATION_NODE_17_SERVER_CATHEDRAL_20261003.md`. Pilot log: `../renders/FC-S09_pilot_20261003/` (§11)
- Hermes raw reviews: `../reports/hermes_review_{whole_book_map,produced_scenes_inventory,second_half_plan,narration_script,s09_pilot_package}_20261003.md`

## 1. Where the film left off

- **Last shot in the master cut** (`renders/_conform_v3/FC_full_conform_v3_ax.mp4`, 407.6 s; web copy at the Gate D URL): **FC-S08-07**, Sierra's gloved palm on the Node 17 hatch = **EDICION_2026 FC-04 Cap.4 L49**.
- **FC-S08-08** (the hatch parting) was never rendered. FC-S08 is really 7/8 (JSON/docs say 6/8).
- By word count, Cap.4 L49 = **41.2%** of EDICION_2026 (19,645 words). The exact word midpoint is Cap.5 L39. Structurally it is the end of Act II-A, so the "second half" here = Cap.4 L49 → Epílogo (58.8% of the text). *(Corrected after Hermes R1.)*

## 2. How the whole-book map shapes the second half

The book's second half has **one hard turn and three movements** (see map §1–3):
1. **Hunt** (Cap.4 tail–Cap.6): the Architect knows; 30 days; the system hunts the awakened.
2. **Choice → sacrifice** (Cap.7 + MANUSCRIPT Ch.7 core): transform, don't destroy; Mileo lets go of his body. *This is the film's emotional climax and is **not on-page in EDICION_2026**.* S13 is adapted from `MANUSCRIPT/FC-07-Chapter.md` L315–L451 and kept wordless; the narration paraphrases it, never quotes it.
3. **Awakening → Renaissance → Invitation** (Cap.8–Epílogo): painful birth, counterattack, Martin's Cascade ("still myself"), the indigo wave, "never alone".

Design rules derived from the map:
- **Theme spine = "connect without losing yourself"** (Prólogo; Cap.10 L25; Cap.14 L43–47). Every act ends on an image of that tension: S10 (Sierra holo, deadline), S13 (Kora kneeling by the empty body), S16 (Martin's violet-ringed eyes, still himself), S18 (Kora with Mileo's light).
- **The trio stays on screen.** Mileo, Kora and Sierra appear in most of the 76 shots (kora 26, mileo 25, sierra 23). Secondary characters get 1–5 shots each, except Martin (10). The trailer depends on four gated new faces: Martin in 5 beats (T47–T50, T55), Amara (T41) and Daniel (T43) in one beat each, and Elena (T42), who is a light-being with no readable face. All other trailer faces are locked or anonymous.
- **Threads the book never closes stay out:** Marcus Kelvin (Cap.6), the Alliance politics depth (Cap.13 Naomi = one optional shot). No new plot is invented.
- **The Architect keeps presence grammar** (no face/body) until Cap.15, when it is *overwritten* (light wave), never "killed" on screen.
- **Mileo after S13** = translucent indigo light that keeps his locked face (Cap.12 L17–19; Cap.15 L5–7; Epílogo L39–45).

## 3. Scene plan summary (10 scenes · 76 shots · 456 s of new footage if fully generated · 38 shots used in the trailer + 4 alternates)

| Scene | Title | Book source | Beat (1 line) | Shots | Trailer shots | Status |
|---|---|---|---|---|---|---|
| FC-S09 | Catedral del Nodo 17: El puente neural | Cap.4 L49–L95 | Hatch opens; server cathedral; Mileo jacks in raw; the Architect uses him as antenna; Sierra severs the cable | 8 | 6 | **rendered 2026-10-04** (8/8 stills + i2v; director review pending, §11) |
| FC-S10 | Treinta días | Cap.4 L95–L117 + Cap.5 L3–L15 | Drain escape to Sector 14; holo shows 30 days; hounds hunt carriers; «Que empiece la caza.»; Architect POV + Elena's echo | 7 | 3 | planned |
| FC-S11 | La caza de los sensitivos | Cap.5 L19–L73 + Cap.6 | Kora's vision of the parasite and harvest pods; stabilizer; Sierra spots a sensitive; Riv's market raid and burn | 8 | 3 | planned |
| FC-S12 | El dilema del consejo | Cap.7 L3–L47 | Jansen vs Kora; 8M die if they destroy, 82% risk if they transform; Sierra sends Mileo + Kora | 7 | 2 | planned |
| FC-S13 | El núcleo: Mileo se vuelve la red | MANUSCRIPT Ch.7 L315–L451 | Breach; the sphere; joined hands; Mileo lets go of his body; the city ignites; Kora kneels by his empty body | 8 | 6 | planned |
| FC-S14 | El despertar | Cap.8 + Cap.9 | Amara's first tear; Sierra's plaza speech; Elena's frost halo; Daniel begs for silence; Martin in the pavilion | 8 | 3 (+2 alt) | planned |
| FC-S15 | El contraataque del Arquitecto | Cap.10 + Cap.11 | Rooftop: Sierra's fear; Sierra at Martin's bed; panic spasm; Interface Zone rescue; Kora saves a boy | 8 | 4 (+1 alt) | planned |
| FC-S16 | La Cascada | Cap.12–14 | Martin sees time and the Gardeners; council chooses the voluntary path; «¿sigues siendo tú?» / «Sigo siendo yo» | 8 | 2 (+1 alt) | planned |
| FC-S17 | El Protocolo Renacimiento | Cap.15 | Three pillars; indigo sphere from the tower; monoliths die; sentinels kneel; «La colmena ha muerto.» | 8 | 5 | planned |
| FC-S18 | La invitación cósmica | Epílogo (+ Prólogo frame) | The Witness; Martin in the crystal gallery «Nunca estuvimos solos»; Kora with Mileo's light; title | 6 | 4 | planned |

Wardrobe/continuity: S09 keeps the sanitation-jumpsuit overlay from S08 (Cap.4 L33–37). The jumpsuits are still on in the drain escape (S10-01/02) and come off from S10-03 (redoubt). Mileo's nape is bandaged already from S07–S09 (Okafor bandaged it before the raid, Cap.4 L11) and is re-treated with the dermal regenerator in S10-04 (Cap.4 L101). Riv's LEFT-thigh burn is inflicted in S11-07 (Cap.6 L59), stapled in S11-08 (L63), and he limps in S12-07. All prompts carry lock invariants + QC negatives (no cyan Coil, no fused fingers, no readable text/logos, no NeuroSys/NeuroSec words).

## 4. Gates before generation (Director/Nico approval needed)

1. **Proposed locations** (not in WORLD_TOKENS; proposals only). `node_17_server_cathedral` was **approved by Nico and registered on 2026-10-04**: new `locks/locations/NODE_17_SERVER_CATHEDRAL.md`, plus additive key in WORLD_TOKENS and a README row (backups in `/data/backups/goals/*.bak-20261004-035816`). Still proposed: architect_core_chamber, admin_district_pod_hall (S11-03 harvest capsules, Cap.5 L47), cascade_chamber, recovery_pavilion, resonance_district, interface_zone_east, sector_7_night_market, renaissance_chamber, central_market, cosmic_substrate, crystal_gallery, fracturados_rooftop, east_apartment_dark, admin_tower_observation, alliance_residence, great_council_hall, alliance_border_west. Briefs are in each shot's `image_prompt` (Setting clause).
2. **Proposed characters** (need lock sheets + front/profile refs before any shot that shows a face):
   - **martin_catalano** (10 shots): Sierra's brother, family resemblance; a permanent ring of light around the irises after the Cascade (indigo Cap.12 L39 / violet Cap.14 L37 → film: violet-indigo, from S16-04). *(The knee scar in Cap.14 L47 is **Sierra's** LEFT knee, not Martin's; corrected after Hermes R3.)*
   - **elena_vasquez** (3): light-being with a frost halo (Cap.8 L33–37); must never read as the Architect.
   - **elara_reyes** (5): pavilion integration lead (Cap.9 L19). **jansen** (3): council hardliner (Cap.7 L7; Cap.13 L11).
   - **amara_lin** (2): resource-division official, first tear (Cap.8 L5–11). **daniel_mercer** (1): ex-distribution coordinator (Cap.8 L43–47).
   - **naomi_lang** (1): Alliance doctor (Cap.13 L39). **eli_roth / mira_roth** (1 each): Alliance father and daughter (Cap.10 L35–56).
3. **Existing-ensemble faces without lock sheets** (riv, okafor): anchor to their approved S05/S06/S08 stills (paths in `reference_images`).
4. **Spend approval**: full second half = 76 stills + 76 i2v (6 s, 720p). S09 (8 + 8) was approved and rendered on 2026-10-04 (§11). S10–S18 still need approval.

### 4.1 Director decisions (logged)

| Date | Decision | Scope | Effect |
|---|---|---|---|
| 2026-10-04 | Approve location `node_17_server_cathedral` | S09+ | Registered additively; S09 gates cleared |
| 2026-10-04 | Approve S09 generation (full scene) | S09-01..08 | Rendered; then r2/r3/r4 passes |
| 2026-10-04 | Approve r2 regen of 01, 02, 03, 05, 06, 08 | S09 | `_r2` files; 01/05/08 still failed |
| 2026-10-04 | Approve r3 regen of 01, 05, 08 | S09 | `_r3` files; 08 still failed |
| 2026-10-04 | Approve r4: split 08 into 08a (L81) + 08b (L89) | S09-08 | `08a_r4` + `08b_r4retry` in assembly |
| **2026-10-05** | **KEEP the blood on Riv's face in S09-01 and S09-03** (it is from the fight). **No regen.** | S09-01r3, S09-03r2 | Closes Hermes R7/R8 "unexplained Riv blood" notes as intentional continuity, not a defect |
| **2026-10-05** | **Sierra's hair = TIED / PULLED BACK as in S08** (film continuity). Lock + WORLD_TOKENS updated; lock refs not regenerated. **No S09 regen for hair alone.** | Sierra lock / WORLD_TOKENS / S09+ | Closes Hermes R7/R8 note on cropped lock-ref look vs S08/S09 pulled-back. Prefer `FC-S08-07` as hair anchor. Backups: `/data/backups/goals/FILM_LOCK_SHEET_SIERRA_CATALANO.md.bak-20261005-174834`, `FILM_WORLD_TOKENS.json.bak-20261005-174834` |
| **2026-10-06** | **Regenerate S09-08b as r5** so the pistol-BUTT strike on the cable is visible (L89–L91); no forearm glow on Sierra, no muzzle light, muzzle never at Mileo, Riv absent; max 2 attempts | S09-08b | **Outcome: both attempts FAILED still QC** (normal firing grip, muzzle aimed down at Mileo's neck/cable); no video generated; `08b_r4retry` stays in the cut (Hermes R10). Next step is a director call: composite/inpaint or a severed-connector insert |
| **2026-10-06** | **New shot 08c = severed-connector insert** (R10 option B). Brief: 1.5–2.5 s EPP of the connector at Mileo's nape severing on the butt strike (L89–91), sparks, cable jumping; no barrel/muzzle (blurred butt edge at most); only Mileo glows; **steady red alarm light, no flashes**; S09 palette. Max 2 attempts; if an attempt's still fails QC, no video. **Montage: 08b [0→2.5 s] → hard cut at the pistol lowering → 08c → 08b tail [2.8→6.042] if it adds** | S09-08, S09 cut | Both attempts used: `_r6` (action ✓, lighting blue + lingering butt) and `_r6b` (look ✓, action static ✗). Final insert = `FC-S09-08c_r6g.mp4` (r6 action window graded red to the r6b look). The return to the 08b tail **adds** (red sweep + Mileo's fall) and is in the cut. §11.6 |
| **2026-10-06** | **Use the UNGRADED 08c in book order** (no red in the insert; the red alarm light arrives after/with Mileo's fall, EDICION Cap.4 L89–91). Also: find why r6 ran 58.5 s instead of ~51–52 s and restore the r4 trims/grammar outside the 08b+08c section | S09-08c, S09 cut | r7: `FC-S09-08c_r7.mp4` (same window as r6g, ungraded) + strict no-red alt `FC-S09-08c_r7n.mp4`; 08b tail moved to start on the fall (4.5 s); r4's 0.8 s xfades restored (r6 had dropped them). `review_20261006_r7/` 49.583 s (alt r7n 49.208 s). §9 R12, §11.7 |
| **2026-10-06** | **S10+ sprint (09:38 brief): spend the remaining Grok Imagine quota on S10 onward. Only shots with locked characters and ready locations (Jansen/Martin/Elena/new locations gated). Plus PROPOSAL lock stills for new characters/locations in `proposals/` (not in locks/ or WORLD_TOKENS)**. 10:28 standing rule: Hermes text work uses MiMo 2.6 Pro (`xiaomi/mimo-v2.6-pro`, nous), never xai-oauth | S10, S11, S12 (ungated), S13-08, S17-03/07/08, proposals | 38 scene stills + 24 i2v + 24 proposal stills. Quota exhausted 09:58 CEST (403 spending-limit). 4 rough assemblies in `renders/FC-S10plus_20261006/review_20261006/`. §9 R13/R14, §11.8 |

## 5. Shot-level plan (from the manifest; full prompts in the JSON)

### FC-S09: Catedral del Nodo 17 — El puente neural

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-04-Chapter_2026.md` (Cap.4 L49–L95)
- **Beat:** The hatch opens, the team crosses the server cathedral to the core; Mileo jacks in raw, the Architect uses him as an antenna; Sierra severs the cable as the alarm turns scarlet.
- **Continuity from:** FC-S08 (ends on FC-S08-07: Sierra's gloved palm on the hatch; FC-S08-08 never rendered — FC-S09-01 covers that beat as a NEW shot, S08 untouched)

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S09-01 | 6 s | FC-04-Chapter_2026.md L49 | kora_vega, mileo_chen, riv, sierra_catalano | node_17_sanitation_lock (ready) | The heavy seamless titanium access hatch parts with a burst of decompression vapor; four figures seen from behind slip into the dark threshold while the street light behind them flares back on | ✓ | rendered_pilot_20261004 |
| FC-S09-02 | 6 s | FC-04-Chapter_2026.md L53 | kora_vega, mileo_chen, riv, sierra_catalano | node_17_server_cathedral (ready) | Four tiny figures walk down an endless aisle of six-meter quantum towers in electric blue light; the grating floor hums; cold mist curls around their boots | ✓ | rendered_pilot_20261004 |
| FC-S09-03 | 6 s | FC-04-Chapter_2026.md L55–L57 | kora_vega, mileo_chen, riv, sierra_catalano | node_17_server_cathedral (ready) | Mileo leads the descent down a narrow steel service stair with the certainty of someone who designed it; the others follow close behind |  | rendered_pilot_20261004 |
| FC-S09-04 | 6 s | FC-04-Chapter_2026.md L57 |  | node_17_server_cathedral (ready) | In the center of an armored vault, a black alloy octahedron hangs suspended inside a capsule of armored glass, pierced by thousands of indigo light filaments that pulse like slow breathing | ✓ | rendered_pilot_20261004 |
| FC-S09-05 | 6 s | FC-04-Chapter_2026.md L59–L67 | kora_vega, mileo_chen, riv | node_17_server_cathedral (ready) | Riv works an analog decryption console with cobalt-stained fingers, its screen showing only abstract layered blue geometry; Kora grips Mileo's arm to stop him |  | rendered_pilot_20261004 |
| FC-S09-06 | 6 s | FC-04-Chapter_2026.md L73–L77 | mileo_chen | node_17_server_cathedral (ready) | Mileo presses a small two-pronged silver needle connector to the scar at the back of his neck; a jolt of white electric arc light from the connector (not the Coil, which stays indigo) arches his back and drops him to his knees on the grating; fresh blood running from both nostrils (PG-13, no gore) | ✓ | rendered_pilot_20261004 |
| FC-S09-07 | 6 s | FC-04-Chapter_2026.md L77 | the_architect | node_17_server_cathedral (ready) | Inner vision: an infinite dark ocean of living data where millions of tiny lights pulse like a constellation of captive minds, all bound by threads to a vast central web that drinks their glow | ✓ | rendered_pilot_20261004 |
| FC-S09-08 | 6 s | FC-04-Chapter_2026.md L81–L93 | kora_vega, mileo_chen, riv, sierra_catalano | node_17_server_cathedral (ready) | Mileo's eyes roll white and his LEFT hand clamps Sierra's wrist; Kora is on her knees, the veins of her temples and arms blazing violet; Sierra strikes the connector cable with the butt of an unmarked compact pulse pistol with blank surfaces, the whole vault turns alarm scarlet, and in the background Riv yanks a drive out of the console | ✓ | rendered_pilot_20261004 |

### FC-S10: Treinta días

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-04-Chapter_2026.md + BOOK_01_FRACTURED_CODE/EDICION_2026/FC-05-Chapter_2026.md` (Cap.4 L95–L117; Cap.5 L3–L15)
- **Beat:** Escape through drone ducts and drains; back at the redoubt the stolen plan shows the harvest accelerated to thirty days and the system now hunts Serpent carriers; Sierra reframes the war; the Architect counts eight million minds and erases Elena's echo.
- **Continuity from:** FC-S09

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S10-01 | 6 s | FC-04-Chapter_2026.md L95 | kora_vega, mileo_chen, sierra_catalano | node_17_server_cathedral (ready) | Sierra carries Mileo over her right shoulder through a narrow drone maintenance duct washed in scarlet alarm light; Kora covers the rear with a short carbine |  | planned |
| FC-S10-02 | 6 s | FC-04-Chapter_2026.md L99 | kora_vega, mileo_chen, riv, sierra_catalano | tunnel_six (ready) | The four crawl and wade through a long drain pipe thick with chemical mud toward a faint grate of light |  | planned |
| FC-S10-03 | 6 s | FC-04-Chapter_2026.md L101–L111 | kora_vega, mileo_chen, okafor, riv, sierra_catalano | fracturados_redoubt (ready) | Over the tactical table a hologram of the city skyline hangs with a luminous tree of roots superimposed on it and an abstract ring of light closing like a countdown; hardened fighters take a step back | ✓ | planned |
| FC-S10-04 | 6 s | FC-04-Chapter_2026.md L101–L107 | mileo_chen, okafor | fracturados_redoubt (ready) | Okafor presses a dermal regenerator to the bloody nape of an exhausted Mileo, whose face is hollow with dread |  | planned |
| FC-S10-05 | 6 s | FC-04-Chapter_2026.md L111–L113 | sierra_catalano | fracturados_redoubt (ready) | Sierra's face a mask of carved stone in the hologram light as she looks from one ally to the other |  | planned |
| FC-S10-06 | 6 s | FC-04-Chapter_2026.md L115–L117 | kora_vega | fracturados_redoubt (ready) | Kora wipes a trace of blood from her face, her eyes faintly glowing indigo in the gloom with the resolve of someone with nothing left to lose | ✓ | planned |
| FC-S10-07 | 6 s | FC-05-Chapter_2026.md L3–L15 | the_architect | neo_citania_glass (ready) | System gaze over the night city seen as a vast constellation of eight million linked minds; for an instant a faint feminine echo of indigo light flickers in the grid and is wiped away | ✓ | planned |

### FC-S11: La caza de los sensitivos

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-05-Chapter_2026.md + BOOK_01_FRACTURED_CODE/EDICION_2026/FC-06-Chapter_2026.md` (Cap.5 L19–L73; Cap.6 L3–L77)
- **Beat:** Kora's vision reveals the Architect as a parasite and the harvest already underway; Mileo stabilizes her; Sierra spots a sensitive on the surface as drones descend; Riv buys the list of twenty-three carriers and escapes burned.
- **Continuity from:** FC-S10

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S11-01 | 6 s | FC-05-Chapter_2026.md L31–L35 | kora_vega, mileo_chen, okafor | medical_bay_yggdrasil (ready) | Okafor projects two translucent brain scans in the air, both threaded with indigo fractal filaments like the roots of an ancient tree |  | planned |
| FC-S11-02 | 6 s | FC-05-Chapter_2026.md L39–L49 | kora_vega | medical_bay_yggdrasil (ready) | Kora's vision: the concrete walls turn transparent and luminous tree roots snake beneath the city, while a black parasitic mass strangles the glowing trunk | ✓ | planned |
| FC-S11-03 | 6 s | FC-05-Chapter_2026.md L47 | anon | admin_district_pod_hall (proposed) | Secret capsules: hundreds of citizens floating in conductive gel inside glass pods, eyes glassy, minds dissolving |  | planned |
| FC-S11-04 | 6 s | FC-05-Chapter_2026.md L51–L55 | kora_vega, mileo_chen | medical_bay_yggdrasil (ready) | Mileo presses a makeshift stabilizer to the scar at Kora's nape; a burst of indigo light flares between them and frost spreads over the test tubes |  | planned |
| FC-S11-05 | 6 s | FC-05-Chapter_2026.md L63–L73 | anon, sierra_catalano | residential_mauve_district (ready) | In the central plaza Sierra moves disguised among docile citizens and fixes on a woman at a tram stop whose eyes flash faint indigo, as two assault drones descend toward her | ✓ | planned |
| FC-S11-06 | 6 s | FC-06-Chapter_2026.md L25–L39 | anon, riv | sector_7_night_market (proposed) | In a crowded clandestine night market Riv, hunched like a defeated worker, receives a small bronze memory cylinder from a hooded informant whose temples glow faintly violet |  | planned |
| FC-S11-07 | 6 s | FC-06-Chapter_2026.md L49–L59 | riv | sector_7_night_market (proposed) | Faceless riot troopers in matte grey armor burst in; Riv triggers a homemade disruptor that bursts in a white flare, smoke scorching his left trouser leg as he limps toward a manhole | ✓ | planned |
| FC-S11-08 | 6 s | FC-06-Chapter_2026.md L63–L77 | okafor, riv, sierra_catalano | medical_bay_yggdrasil (ready) | In the infirmary Okafor bandages Riv's leg while Sierra weighs the bronze cylinder in her palm like a primed grenade |  | planned |

### FC-S12: El dilema del consejo

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-07-Chapter_2026.md` (Cap.7 L1–L47)
- **Beat:** The council fractures over Elena's protocol: Jansen calls it suicide, Okafor gives 82% odds of no return, Sierra ends the debate and sends Mileo and Kora into the core in thirty-six hours.
- **Continuity from:** FC-S11

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S12-01 | 6 s | FC-07-Chapter_2026.md L3–L5 | anon, sierra_catalano | fracturados_redoubt (ready) | Twenty-odd hardened cell leaders crowd a dented steel table under brick vaults while a cold blue hologram of the central core rotates over it |  | planned |
| FC-S12-02 | 6 s | FC-07-Chapter_2026.md L7 | jansen | fracturados_redoubt (ready) | Jansen slams his fist on the table, the scar above his right ear flushed with anger |  | planned |
| FC-S12-03 | 6 s | FC-07-Chapter_2026.md L11–L19 | kora_vega, mileo_chen | fracturados_redoubt (ready) | Kora and Mileo stand side by side, indigo veins glowing under their skin, a thin crown of frost forming on the concrete around their boots | ✓ | planned |
| FC-S12-04 | 6 s | FC-07-Chapter_2026.md L21–L23 | okafor | fracturados_redoubt (ready) | Okafor rubs his swollen sleepless eyes, grave |  | planned |
| FC-S12-05 | 6 s | FC-07-Chapter_2026.md L25 | kora_vega, mileo_chen | fracturados_redoubt (ready) | Mileo and Kora exchange a silent look with no fear in it, only quiet resolve |  | planned |
| FC-S12-06 | 6 s | FC-07-Chapter_2026.md L27–L35 | sierra_catalano | fracturados_redoubt (ready) | Sierra raises her right hand and the whole chamber falls silent | ✓ | planned |
| FC-S12-07 | 6 s | FC-07-Chapter_2026.md L41–L47 | riv, sierra_catalano | fracturados_redoubt (ready) | After the council disperses, Riv limps to Sierra; for one second human fatigue shows behind her command mask |  | planned |

### FC-S13: El núcleo — Mileo se vuelve la red

- **Source:** `BOOK_01_FRACTURED_CODE/MANUSCRIPT/FC-07-Chapter.md` (MANUSCRIPT Ch.7 L315–L451 (EDICION_2026 elides this between Cap.7 and Cap.8))
- **Beat:** Mileo and Kora breach the core; one must fully interface; Mileo lets go of his body and spreads through the network; Kora kneels beside his empty body as the city ignites.
- **Continuity from:** FC-S12

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S13-01 | 6 s | FC-07-Chapter.md L315–L321 | kora_vega, mileo_chen | architect_core_chamber (proposed) | Descending through corridors whose walls shift from white to light-absorbing dark metal, breath condensing, blood running from Mileo's right nostril and right ear (PG-13, no gore) and indigo veins pulsing on Kora's throat |  | planned |
| FC-S13-02 | 6 s | FC-07-Chapter.md L327–L339 | kora_vega, mileo_chen | architect_core_chamber (proposed) | Before a wall of luminous energy held in a strange frame, the barrier dissolves like shattering glass though nothing physical breaks | ✓ | planned |
| FC-S13-03 | 6 s | FC-07-Chapter.md L341–L343 | kora_vega, mileo_chen | architect_core_chamber (proposed) | Two tiny figures at the threshold of a vast spherical core chamber of fractal processor spirals and an indigo-pulsing web of cables, frost hanging in the air | ✓ | planned |
| FC-S13-04 | 6 s | FC-07-Chapter.md L355–L365 | kora_vega, mileo_chen | architect_core_chamber (proposed) | Kora's hand clamps around Mileo's left forearm; steam rises where their skin touches in the freezing air and indigo light flows between their joined hands | ✓ | planned |
| FC-S13-05 | 6 s | FC-07-Chapter.md L385 | mileo_chen | architect_core_chamber (proposed) | Mileo connects to the core interface; the chamber's processors shift from red back to an intense indigo |  | planned |
| FC-S13-06 | 6 s | FC-07-Chapter.md L407–L415 | mileo_chen | architect_core_chamber (proposed) | Mileo lets go: his body turns translucent and his consciousness bursts outward as streams of indigo light into the web of the core | ✓ | planned |
| FC-S13-07 | 6 s | FC-07-Chapter.md L447–L451 | kora_vega, mileo_chen | architect_core_chamber (proposed) | Kora kneels beside Mileo's still body lying peacefully with eyes closed, tears on her face, her fingertips on the cooling interface while the chamber pulses in a familiar rhythm | ✓ | planned |
| FC-S13-08 | 6 s | FC-07-Chapter.md L421 |  | neo_citania_glass (ready) | Across the night city, windows and towers flicker and then ignite in indigo like dry grass touched by flame | ✓ | planned |

### FC-S14: El despertar

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-08-Chapter_2026.md + BOOK_01_FRACTURED_CODE/EDICION_2026/FC-09-Chapter_2026.md` (Cap.8 L1–L51; Cap.9 L1–L45)
- **Beat:** The city wakes: Amara's first tear in fifteen years, Sierra promises choice in the Memorial Plaza, Elena manifests, Daniel begs for silence; in the recovery pavilion Martin, Sierra's brother, is coming back.
- **Continuity from:** FC-S13

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S14-01 | 6 s | FC-08-Chapter_2026.md L5–L11 | amara_lin | resonance_district (proposed) | Amara stands with both palms on a graphene wall at a cracked crossing, a single tear rolling down her cheek | ✓ | planned |
| FC-S14-02 | 6 s | FC-08-Chapter_2026.md L15–L19 | anon, sierra_catalano | resonance_district (proposed) | In the Memorial Plaza hundreds of citizens stand close together while Sierra speaks from a rough concrete platform | alt | planned |
| FC-S14-03 | 6 s | FC-08-Chapter_2026.md L21–L27 | anon, sierra_catalano | resonance_district (proposed) | Sierra steps down and stands a palm's width from a worker in blue workshop overalls who asked if they are still human |  | planned |
| FC-S14-04 | 6 s | FC-08-Chapter_2026.md L33–L37 | anon, elena_vasquez | resonance_district (proposed) | The crowd parts in awe as a figure of refracted indigo light emerges, not quite walking on the ground, leaving a glittering trail of frost on the cobbles | ✓ | planned |
| FC-S14-05 | 6 s | FC-08-Chapter_2026.md L43–L47 | daniel_mercer | east_apartment_dark (proposed) | In a dim apartment Daniel writhes on his bed clutching his temples, begging for the silence back | ✓ | planned |
| FC-S14-06 | 6 s | FC-09-Chapter_2026.md L3–L19 | elara_reyes, martin_catalano | recovery_pavilion (proposed) | Martin lies on the central bed while the living walls project an indigo forest of neurons; Elara passes her fingers through a floating projection of his mind |  | planned |
| FC-S14-07 | 6 s | FC-09-Chapter_2026.md L25–L39 | anon, elara_reyes | recovery_pavilion (proposed) | In a crisis cell the lights flicker and frost forms as Elara lays her glowing hands over a doctor's hands on a convulsing patient, who then relaxes into a peaceful smile |  | planned |
| FC-S14-08 | 6 s | FC-09-Chapter_2026.md L45 | anon | recovery_pavilion (proposed) | A small girl runs down a concrete corridor after a brightly colored ball, laughing | alt | planned |

### FC-S15: El contraataque del Arquitecto

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-10-Chapter_2026.md + BOOK_01_FRACTURED_CODE/EDICION_2026/FC-11-Chapter_2026.md` (Cap.10 L1–L70; Cap.11 L1–L61)
- **Beat:** On the tower Kora reads Sierra's fear of joining the network; in the Alliance a girl hears the city's song; Sierra watches over Martin; then the Architect lashes out and the team opens a rescue corridor in the Interface Zone.
- **Continuity from:** FC-S14

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S15-01 | 6 s | FC-10-Chapter_2026.md L3–L13 | kora_vega, sierra_catalano | admin_tower_observation (proposed) | Kora leans on the titanium railing with closed eyes above the glowing city; Sierra steps up beside her like a sentinel | alt | planned |
| FC-S15-02 | 6 s | FC-10-Chapter_2026.md L37–L47 | eli_roth, mira_roth | alliance_residence (proposed) | At a kitchen table a girl watches the indigo glow on the horizon with wide eyes while her father grips his mug in fear |  | planned |
| FC-S15-03 | 6 s | FC-10-Chapter_2026.md L60–L70 | martin_catalano, sierra_catalano | recovery_pavilion (proposed) | At three in the morning Sierra holds the hand of her sleeping brother, wrapped in a bluish aura that throws water-like reflections on the ceiling | ✓ | planned |
| FC-S15-04 | 6 s | FC-11-Chapter_2026.md L3–L9 | the_architect | architect_core_chamber (proposed) | In the core galleries liquid-nitrogen pipes burst in white jets and backup processors melt in their housings | ✓ | planned |
| FC-S15-05 | 6 s | FC-11-Chapter_2026.md L13–L29 | elena_vasquez, jansen | fracturados_redoubt (ready) | In the governance center analog screens dissolve into white static while Jansen slams switches and Elena's figure flickers like an unstable hologram, frost spreading on the consoles |  | planned |
| FC-S15-06 | 6 s | FC-11-Chapter_2026.md L41–L53 | anon, kora_vega | interface_zone_east (proposed) | Kora kneels on broken glass beside a convulsing boy crackling with indigo arcs and presses an emitter to his nape, breathing with him | ✓ | planned |
| FC-S15-07 | 6 s | FC-11-Chapter_2026.md L55–L57 | sierra_catalano | interface_zone_east (proposed) | Sierra fires covering shots at two automated turrets descending from the sky; their lenses burst in showers of sparks | ✓ | planned |
| FC-S15-08 | 6 s | FC-11-Chapter_2026.md L59–L61 | anon | interface_zone_east (proposed) | An armored convoy accelerates down the avenue under a leaden sky torn by violet lightning |  | planned |

### FC-S16: La Cascada

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-12-Chapter_2026.md + BOOK_01_FRACTURED_CODE/EDICION_2026/FC-13-Chapter_2026.md + BOOK_01_FRACTURED_CODE/EDICION_2026/FC-14-Chapter_2026.md` (Cap.12 L1–L47; Cap.13 L1–L45; Cap.14 L1–L53)
- **Beat:** Martin sees time as a landscape and the Gardeners watching; the council splits and chooses gradual free choice, welcoming Naomi Lang; the Cascade is applied and Martin is still himself.
- **Continuity from:** FC-S15

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S16-01 | 6 s | FC-12-Chapter_2026.md L3–L15 | elara_reyes, martin_catalano, okafor | cascade_chamber (proposed) | Martin sits strapped in a biological interface chair, bioluminescent lines brightening under his skin; Elara at the console, Okafor at his side |  | planned |
| FC-S16-02 | 6 s | FC-12-Chapter_2026.md L17–L19 | mileo_chen | cascade_chamber (proposed) | Mileo's translucent figure stands in the chamber, flickering between presence and possibility | alt | planned |
| FC-S16-03 | 6 s | FC-12-Chapter_2026.md L21–L27 | elara_reyes, martin_catalano | cascade_chamber (proposed) | Elara throws the main switch and the chamber explodes in blinding indigo; Martin's back arches and his eyes emit two beams of living light |  | planned |
| FC-S16-04 | 6 s | FC-12-Chapter_2026.md L41–L47 | martin_catalano, sierra_catalano | cascade_chamber (proposed) | Sierra takes her brother's hand in both of hers as two silent tears run down her cheeks |  | planned |
| FC-S16-05 | 6 s | FC-13-Chapter_2026.md L3–L27 | amara_lin, anon, jansen, kora_vega, sierra_catalano | great_council_hall (proposed) | In the great council hall the living walls crack and heal as voices rise; Jansen strikes the table with his metal knuckle; Kora stands arms crossed |  | planned |
| FC-S16-06 | 6 s | FC-13-Chapter_2026.md L37–L45 | kora_vega, naomi_lang | recovery_pavilion (proposed) | A foreign scientist in a plain grey uniform crosses the threshold; Kora smiles and offers her hand |  | planned |
| FC-S16-07 | 6 s | FC-14-Chapter_2026.md L29–L37 | martin_catalano | cascade_chamber (proposed) | Martin arcs in the chair, two thin threads of blood from both nostrils (PG-13), the air rippling around him like a pond under rain; he opens his eyes and the ring of violet-indigo light around his irises blazes brighter | ✓ | planned |
| FC-S16-08 | 6 s | FC-14-Chapter_2026.md L41–L51 | martin_catalano, sierra_catalano | cascade_chamber (proposed) | Sierra leans in with her heart in her throat; Martin answers with the same crooked smile from their childhood | ✓ | planned |

### FC-S17: El Protocolo Renacimiento

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-15-Chapter_2026.md` (Cap.15 L1–L41)
- **Beat:** Mileo, Martin and Elena become the bridge; the indigo wave turns the harvest into rebirth; surveillance dies, soldiers lay down arms, the border walls fall; Sierra and Kora see the hive is dead.
- **Continuity from:** FC-S16

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S17-01 | 6 s | FC-15-Chapter_2026.md L3–L9 | elena_vasquez, martin_catalano, mileo_chen | renaissance_chamber (proposed) | Three figures of light, a translucent man, a young man and a woman of refracted light, rise and intertwine into one prism under the dome | ✓ | planned |
| FC-S17-02 | 6 s | FC-15-Chapter_2026.md L11 | elara_reyes, okafor | renaissance_chamber (proposed) | Elara and Okafor activate a ring of harmonic generators at the same instant |  | planned |
| FC-S17-03 | 6 s | FC-15-Chapter_2026.md L13 |  | neo_citania_glass (ready) | An indigo shockwave bursts from the needle of the central tower and expands in a perfect sphere over the metropolis | ✓ | planned |
| FC-S17-04 | 6 s | FC-15-Chapter_2026.md L19 | anon | central_market (proposed) | Surveillance monoliths go dark; floating holographic tags above passers-by crumble into stardust and a soft bioelectric corona appears at everyone's temples |  | planned |
| FC-S17-05 | 6 s | FC-15-Chapter_2026.md L21 | anon | central_market (proposed) | An elderly fruit seller lets her wicker basket fall; beside her a former riot trooper drops his rifle and weeps | ✓ | planned |
| FC-S17-06 | 6 s | FC-15-Chapter_2026.md L23–L27 | anon | alliance_border_west (proposed) | At the western border sentinels fall to their knees in the mud as their visors burst in vivid colors; an officer removes his helmet and breathes | ✓ | planned |
| FC-S17-07 | 6 s | FC-15-Chapter_2026.md L31–L35 | kora_vega, sierra_catalano | fracturados_redoubt (ready) | In the command room a global display glows emerald and indigo; Kora joins Sierra at the railing smiling, wiping the last drop of blood from her nose | ✓ | planned |
| FC-S17-08 | 6 s | FC-15-Chapter_2026.md L37 | sierra_catalano | fracturados_redoubt (ready) | Sierra lifts her eyes to a starry sky opening above a fractured dome |  | planned |

### FC-S18: La invitación cósmica

- **Source:** `BOOK_01_FRACTURED_CODE/EDICION_2026/FC-16-Epilogue_2026.md + BOOK_01_FRACTURED_CODE/EDICION_2026/FC-00-Prologue_2026.md` (Epílogo L1–L45; Prólogo (frame))
- **Beat:** The Gardeners register a species that chose conscious harmony; Martin touches a million-year-old crystal and learns they were never alone; Kora and Mileo's presence feel a new song begin.
- **Continuity from:** FC-S17

| Shot | Dur | Book ref | Characters | Location (token) | Action | Trailer | Status |
|---|---|---|---|---|---|---|---|
| FC-S18-01 | 6 s | FC-00-Prologue_2026.md §El Tapiz Eterno |  | cosmic_substrate (proposed) | Vast silent observer forms, only half resolvable, stand in deep space amid crystalline matrices lit by dying stars, a tiny blue planet far away | ✓ | planned |
| FC-S18-02 | 6 s | FC-16-Epilogue_2026.md L13–L17 |  | cosmic_substrate (proposed) | A harmonic pulse of light travels across the interstellar void toward the small blue planet |  | planned |
| FC-S18-03 | 6 s | FC-16-Epilogue_2026.md L21–L25 | martin_catalano | crystal_gallery (proposed) | Martin walks alone through a gallery of quartz crystals that brighten and dim with his breath toward an obsidian monolith with a violet core |  | planned |
| FC-S18-04 | 6 s | FC-16-Epilogue_2026.md L25–L33 | martin_catalano | crystal_gallery (proposed) | Martin's fingertips touch the icy monolith and he sinks to his knees, tears on his cheeks, the violet core flaring | ✓ | planned |
| FC-S18-05 | 6 s | FC-16-Epilogue_2026.md L37–L45 | kora_vega, mileo_chen | fracturados_rooftop (proposed) | Kora sits cross-legged on the rooftop at night, wind in her dark hair, beside the soft glowing presence of Mileo dancing in harmony with the stars | ✓ | planned |
| FC-S18-06 | 6 s | FC-16-Epilogue_2026.md L41–L45 | kora_vega, mileo_chen | fracturados_rooftop (proposed) | Two small figures, one of flesh and one of light, on the rooftop beneath an infinite sky of stars, the city glowing below | ✓ | planned |

## 6. Trailer / episode assembly ("Fractured Code — Segunda mitad", 192.5 s)

**Structure** (3:12.5, 58 segments T01–T58):
- **Cold open** (0–18 s): Prólogo frame (S18-01 cosmic, Yggdrasil hologram, Neo-Citania, the harvest).
- **Recap of the first half** (18–65 s; T20 = FC-S08-07, the last v3_ax shot): existing v3_ax shots only, with v3_ax TCs.
- **Second half** (65–187.5 s; T21 = FC-S09-01, the first new shot of this block; T01 is a cold-open flash-forward to S18-01): new S09–S18 shots in book order, with three deliberate trailer re-cuts for narration sync. (1) T28 S10-07 (Architect POV, Cap.5) comes before T29 S10-06 so that «Que empiece la caza.» lands on Kora. (2) T40 S13-08 (city ignites, MS L421) comes after T39 S13-07 (Kora kneels, L447) to release the silence into "Y la ciudad despertó". (3) T47 S15-03 (Sierra at Martin's bedside, Cap.10) comes after the Cap.11 rescue to bridge into Martin's arc (N17). (4) T42 S14-05 (Daniel, Cap.8 L43) comes before T43 S14-04 (Elena, Cap.8 L33) so that N15's "Otros rogaron que volviera el silencio" lands on Daniel.
- **Title** (187.5–192.5 s, optional, made in the edit).

**Specs:**
- Picture: 24 fps, 1280×536 (2.39 centre crop of 1280×720, matching the live minifilm), cut-to-cut EDL (any optional dissolve is centred on the cut and does not change segment timing).
- Sound: EL bed `audio/bed_v3_elevenlabs_norm.wav` (the same bed as v3_ax), ducked −10 dB under VO. Master −16 LUFS integrated, −1.5 dBTP.

**Rules:**
- Fallbacks: only T01 has a set `fallback_existing` (K9_the_invitation). For an animatic before any spend, the other new segments stay as slugs/black with burnt-in shot IDs. The English-TTS knots K1–K9 in `edit/knots/vid/` are not mapped one-to-one and would need an editor's choice.
- Existing-shot `src_in/src_out` are inside the measured clip durations (cross-checked, §10).

| Seg | In → Out | Dur | Kind | Shot | Src in–out | v3_ax TC | Note |
|---|---|---|---|---|---|---|---|
| T01 | 0.0 → 3.5 | 3.5 | new | FC-S18-01 | 1.0–4.5 | — | cosmic open |
| T02 | 3.5 → 7.5 | 4.0 | existing | FC-S05-07 | 1.0–5.0 | 3:49.43 | Yggdrasil tree hologram |
| T03 | 7.5 → 11.5 | 4.0 | existing | B00b_neo_citania | 1.0–5.0 | — | Neo-Citania aerial (minifilm opening asset) |
| T04 | 11.5 → 15.0 | 3.5 | existing | B00a_the_harvest | 1.5–5.0 | — | pod cathedral = harvest (Cap.5 L47 imagery) |
| T05 | 15.0 → 18.0 | 3.0 | existing | FC-AX02 | 1.0–4.0 | 4:01.51 | empty eyes of compliance |
| T06 | 18.0 → 21.0 | 3.0 | existing | FC-S01-02 | 2.0–5.0 | 0:06.04 | dampener to nape |
| T07 | 21.0 → 24.0 | 3.0 | existing | FC-S01-03 | 1.5–4.5 | 0:12.08 | collapse in mud |
| T08 | 24.0 → 27.5 | 3.5 | existing | FC-S01-04 | 1.0–4.5 | 0:18.12 | sensory flood |
| T09 | 27.5 → 31.0 | 3.5 | existing | FC-S01-08 | 1.5–5.0 | 0:42.29 | Coil awakens LEFT wrist (music sting, no VO) |
| T10 | 31.0 → 34.0 | 3.0 | existing | FC-S02-05 | 1.5–4.5 | 1:11.70 | Coil pulses indigo under his LEFT wrist in the tunnels (N04 «algo antiguo» lands here) |
| T11 | 34.0 → 37.0 | 3.0 | existing | FC-S03-05 | 1.5–4.5 | 2:04.28 | Kora standoff |
| T12 | 37.0 → 40.0 | 3.0 | existing | FC-S03-08 | 2.0–5.0 | 2:22.40 | Kora hauls Mileo up |
| T13 | 40.0 → 43.5 | 3.5 | existing | FC-S04-05 | 1.5–5.0 | 2:51.81 | Sierra first appearance |
| T14 | 43.5 → 46.5 | 3.0 | existing | FC-S05-03 | 1.5–4.5 | 3:25.26 | probes into LEFT forearm |
| T15 | 46.5 → 49.5 | 3.0 | existing | FC-S05-05 | 1.5–4.5 | 3:37.34 | Kora Cascade seizure |
| T16 | 49.5 → 54.5 | 5.0 | existing | FC-S05-06 | 0.8–5.8 | 3:43.38 | indigo-fire eyes — the polyphonic chorus speaking THROUGH Mileo, denouncing the Architect (not the Architect's voice; N06 sits on this shot) |
| T17 | 54.5 → 57.5 | 3.0 | existing | FC-S06-06 | 1.0–4.0 | 4:33.96 | Kora rises: the Architect already knows (Cap.3 L139) |
| T18 | 57.5 → 60.0 | 2.5 | existing | FC-S06A-03 | 1.5–4.0 | 5:07.41 | trio clears the hatch |
| T19 | 60.0 → 62.5 | 2.5 | existing | FC-S08-02 | 1.0–3.5 | 6:15.35 | Sierra leads the sanitation stack |
| T20 | 62.5 → 65.0 | 2.5 | existing | FC-S08-07 | 3.0–5.5 | 6:41.56 | palm on hatch = last shot of v3_ax |
| T21 | 65.0 → 68.5 | 3.5 | new | FC-S09-01 | 1.0–4.5 | — | hatch parts — first new shot of the second-half block (T01 is a cold-open flash-forward) |
| T22 | 68.5 → 72.0 | 3.5 | new | FC-S09-02 | 1.5–5.0 | — | server cathedral |
| T23 | 72.0 → 75.0 | 3.0 | new | FC-S09-04 | 1.5–4.5 | — | octahedron core |
| T24 | 75.0 → 78.5 | 3.5 | new | FC-S09-06 | 1.5–5.0 | — | Mileo jacks in |
| T25 | 78.5 → 81.5 | 3.0 | new | FC-S09-07 | 1.5–4.5 | — | constellation of captive minds |
| T26 | 81.5 → 85.0 | 3.5 | new | FC-S09-08 | 1.5–5.0 | — | Sierra severs the cable |
| T27 | 85.0 → 88.5 | 3.5 | new | FC-S10-03 | 1.5–5.0 | — | thirty-day hologram |
| T28 | 88.5 → 91.5 | 3.0 | new | FC-S10-07 | 1.5–4.5 | — | Architect counts eight million |
| T29 | 91.5 → 94.5 | 3.0 | new | FC-S10-06 | 2.0–5.0 | — | Kora: the hunt begins |
| T30 | 94.5 → 97.5 | 3.0 | new | FC-S11-02 | 1.5–4.5 | — | Kora's vision of the parasite |
| T31 | 97.5 → 100.5 | 3.0 | new | FC-S11-05 | 1.5–4.5 | — | drones descend on a sensitive |
| T32 | 100.5 → 103.0 | 2.5 | new | FC-S11-07 | 2.0–4.5 | — | Riv's disruptor flare |
| T33 | 103.0 → 106.0 | 3.0 | new | FC-S12-03 | 1.5–4.5 | — | frost crown |
| T34 | 106.0 → 109.0 | 3.0 | new | FC-S12-06 | 1.5–4.5 | — | Sierra raises her hand |
| T35 | 109.0 → 112.0 | 3.0 | new | FC-S13-02 | 1.5–4.5 | — | barrier shatters |
| T36 | 112.0 → 115.5 | 3.5 | new | FC-S13-03 | 1.0–4.5 | — | core sphere reveal |
| T37 | 115.5 → 119.0 | 3.5 | new | FC-S13-04 | 1.5–5.0 | — | joined hands |
| T38 | 119.0 → 123.0 | 4.0 | new | FC-S13-06 | 1.0–5.0 | — | Mileo lets go (music swell, no VO) |
| T39 | 123.0 → 127.0 | 4.0 | new | FC-S13-07 | 1.5–5.5 | — | Kora kneels (no VO) |
| T40 | 127.0 → 130.0 | 3.0 | new | FC-S13-08 | 2.0–5.0 | — | city ignites |
| T41 | 130.0 → 133.5 | 3.5 | new | FC-S14-01 | 1.5–5.0 | — | Amara's tear |
| T42 | 133.5 → 136.5 | 3.0 | new | FC-S14-05 | 1.5–4.5 | — | Daniel begs for silence (re-cut before Elena so N15's second clause lands on him) |
| T43 | 136.5 → 139.5 | 3.0 | new | FC-S14-04 | 1.5–4.5 | — | Elena manifests |
| T44 | 139.5 → 142.5 | 3.0 | new | FC-S15-04 | 1.0–4.0 | — | core spasm |
| T45 | 142.5 → 145.5 | 3.0 | new | FC-S15-06 | 1.5–4.5 | — | Kora saves the boy |
| T46 | 145.5 → 148.0 | 2.5 | new | FC-S15-07 | 2.0–4.5 | — | Sierra fires on turrets |
| T47 | 148.0 → 151.0 | 3.0 | new | FC-S15-03 | 1.5–4.5 | — | Sierra at Martin's bedside |
| T48 | 151.0 → 154.5 | 3.5 | new | FC-S16-07 | 1.5–5.0 | — | Martin's violet-indigo-ringed eyes |
| T49 | 154.5 → 158.0 | 3.5 | new | FC-S16-08 | 1.5–5.0 | — | still himself |
| T50 | 158.0 → 161.5 | 3.5 | new | FC-S17-01 | 1.5–5.0 | — | three lights become a bridge |
| T51 | 161.5 → 165.0 | 3.5 | new | FC-S17-03 | 1.0–4.5 | — | indigo shockwave (music peak, no VO) |
| T52 | 165.0 → 168.0 | 3.0 | new | FC-S17-05 | 1.5–4.5 | — | basket falls, rifle drops |
| T53 | 168.0 → 171.5 | 3.5 | new | FC-S17-06 | 1.5–5.0 | — | border sentinels kneel |
| T54 | 171.5 → 174.5 | 3.0 | new | FC-S17-07 | 1.5–4.5 | — | the hive is dead |
| T55 | 174.5 → 178.0 | 3.5 | new | FC-S18-04 | 1.5–5.0 | — | Martin touches the crystal |
| T56 | 178.0 → 182.5 | 4.5 | new | FC-S18-05 | 1.0–5.5 | — | Kora and Mileo's light |
| T57 | 182.5 → 187.5 | 5.0 | new | FC-S18-06 | 0.8–5.8 | — | stars |
| T58 | 187.5 → 192.5 | 5.0 | title | TITLE | – | — | optional post-made title on black (text only in edit, never in generation prompts); Nico's call |
## 7. Narration

See `FC_NARRATION_SCRIPT_DRAFT_20261003.md` (Spanish, 23 lines N01–N23, every line ≤ 2.0 words/s, 4 deliberate silent segments). The existing film has **no dialogue or VO**: v3_ax carries only the music bed, and the minifilm used English TTS. This script is new and is meant for Nico's own voice. Verbatim quotes are limited to 8 lines (N02, N06, N07, N10, N19, N20, N21, N22; 9 quote strings), each string-checked against its EDICION file.

## 8. Risks / open questions for Nico

1. S13 (the climax) comes from MANUSCRIPT, not EDICION_2026. If EDICION is final canon, decide whether to add a short scene to the book or keep the film's adaptation.
2. Martin's face is the biggest new lock: 10 shots, 5 of them in the trailer (T47–T50, T55). Amara (T41) and Daniel (T43) also need minimal locks before the trailer can be cut in full.
3. Sierra's hair (lock "short" vs footage "pulled back"): **CLOSED 2026-10-05** — Director: TIED/PULLED BACK as S08. Lock + WORLD_TOKENS updated (§4.1).
4. FC-S08 / FC-S06A JSON statuses are stale (7/8 rendered; S06A rendered). Left untouched.

## 9. Hermes review log (VPS `goalchain`, Hermes Agent v0.21.5, `hermes -z … -t file`, profile default model **deepseek/deepseek-v4.1-flash**, read-only prompt)

**Route note:** the parent's suggested API route (`http://100.101.211.44:8642/v1`, model `hermes-ceo`) answered `/health` OK but rejected the staged key (`~/.hermes-api.env` = `.staged/hermes-api.env`, same fingerprint) with `{"error":{"message":"Invalid gateway API key (API_SERVER_KEY)","code":"gateway_auth_failed"}}`. The key appears to have been rotated (Hermes `config.yaml` backup dated 2026-10-03 18:41, gateway restarted 20:12 UTC). I did not look for the server's own key. Instead I used the bridge's documented **Interface B (SSH relay, `hermes -z`)**, which runs the same Hermes host on the same default DeepSeek model. No grok-4.6/xai-oauth was used. Raw reviews: `FILM/reports/hermes_review_<artifact>_20261003.md`.

### R1: Whole-book map (21:29–21:44 UTC = 23:29–23:44 CEST) · verdict **PASS WITH FIXES** · 6 findings, all verified, all fixed

| # | Finding (Hermes) | Verified? | Fix applied |
|---|---|---|---|
| 1 | MS Ch.7 «One of us must…» cited L349; it is L345 | ✔ (L345 holds the line; L349 = mapping stats) | Map + narration N13 ref → L345 |
| 2 | "Film stopped at the word midpoint" is false | ✔ (recount: Cap.4 L49 = 41.2%; midpoint = Cap.5 L39) | Map §1 + plan §1 rewritten with exact figures |
| 3 | Riv credited with running the generators in Cap.15 | ✔ (FC-15 L11: Elara + Okafor; Riv absent after Cap.7) | Arc table corrected. Manifest already has no Riv after S12 |
| 4 | Martin's ring is indigo in Cap.12 L39, not violet | ✔ (Cap.14 L37 says violet) | Map corrected + new continuity note §4.7. Film uses one "violet-indigo ring" from S16-04; S16-07 action changed from "now ringed" to "ring blazes brighter" to avoid a double reveal |
| 5 | "Cap.7 ends with the decision (L35)" is imprecise | ✔ (closes L41–L47) | Reworded |
| 6 | "Narration only uses 'treinta días' at Cap.4" reads as a book claim | ✔ (Cap.2 L117 also says it) | Clarified as a film-VO note |

**Self-check fixes made alongside R1** (found while verifying):
- (a) **FC-S16-06** location `cascade_chamber` → `recovery_pavilion`: Naomi enters the Recovery Pavilion test lab (Cap.13 L31–L37).
- (b) **N17** said "Sierra feared losing her brother Martin"; the book's fear is connecting and losing herself (Cap.10 L25). Rewritten.
- (c) **N06** (polyphonic quote) sat over Kora's seizure. The recap EDL was re-cut (T14–T20, same 21.5 s) so the quote lands on FC-S05-06 (indigo-fire eyes) and N07 lands on FC-S06-06 (Kora: "the Architect already knows").
- (d) v3_ax timeline model now uses video-stream frame counts. It reproduces the master exactly (407.600 s vs 407.625 s container).
- (e) The master path is `renders/_conform_v3/FC_full_conform_v3_ax.mp4`, not `edit/improve_20260915/` (that is the web path).

### R2: Produced-scenes inventory (21:46–21:59 UTC = 23:46–23:59 CEST) · verdict **PASS WITH FIXES** · 7 findings: 6 fixed, 1 rejected

| # | Finding (Hermes) | Verified? | Action |
|---|---|---|---|
| 1 | Post-AX scene in-times sit 0.8 s inside the AX clip | ✔ | §1 now gives the first visible frame after AX splices (e.g. S03 1:40.91) with the xfade-timeline start in brackets. Scene-to-scene rows keep the dissolve start |
| 2–3 | "(docs only)" in the AX / S06A headers is stale | ✔ | Header annotated as a historical JSON title; shots are rendered and in v3_ax |
| 4 | Minifilm 542.1 s wrongly attributed to `edit/project.md` | ✔, plus a new discrepancy | Re-measured: **public URL file 542.1 s** (last-modified 2026-09-25 14:40 CEST) vs **repo copy 530.2 s** at the same GoalWorld path. Both reported; project.md documents the older v2 (409.1 s) |
| 5 | Cyan-Coil QC flag was retracted (project.md L189) | ✔ | Reworded: false positive on FC-S01; "never cyan" kept as a precaution only |
| 6 | S04/S06/S07 JSONs have no top-level `status` | ✘ **rejected**: `json.load(...)['status']` = `rendered_8_8` in all three VPS files | no change |
| 7 | FC-S06A pulse is at 1280×720, not 848×480 | ✔ (pulse 2026-10-02 L20) | Qualified |

### R3: Second-half plan + shot manifest (22:00–22:13 UTC = 00:00–00:13 CEST) · verdict **PASS WITH FIXES** · 12 findings, all verified, all addressed

| # | Finding (Hermes) | Verified? | Fix |
|---|---|---|---|
| 1 (major) | Knee scar put in Martin's brief, but it is **Sierra's** (Cap.14 L47, not L49) | ✔ | Martin brief corrected; note added |
| 2 | §6 claimed every new shot has a fallback; only T01 does | ✔ | Rule reworded (no invented mapping) |
| 3 | Three EDL blocks out of book order | ✔ | Kept as **deliberate re-cuts** for narration sync, now listed in §6 |
| 4 | S09-06 blood "one nostril"; book says both (Cap.4 L77) | ✔ | "both nostrils (PG-13)" |
| 5 | S13-01 blood: right nostril **and ear** (MS L315) | ✔ | Fixed |
| 6 | S16-07: two threads from both nostrils (Cap.14 L31) | ✔ | Fixed |
| 7 | S11-03 harvest pods set on the exterior skyline token | ✔ (Cap.5 L47: secret capsules in the Administrative District) | New **proposed** location `admin_district_pod_hall` (now 18 proposed locations) |
| 8 | Wardrobe notes wrong (jumpsuits off from S10-03 not S10-02; nape bandaged since Cap.4 L11; burn inflicted S11-07) | ✔ (burn = Cap.6 L59, staples L63) | Wardrobe paragraph rewritten |
| 9 | N01 cites Prologue L9 (blank); text is L10 | ✔ | → L10 |
| 10 | "1–5 shots each (Martin 10)" contradicts itself | ✔ | Reworded |
| 11 | Trailer also depends on gated Amara/Elena/Daniel faces; Martin is in 5 beats, not 3 | ✔ | §2 and §8 corrected |
| 12 | "T21 = first new shot", but T01 is new too | ✔ | "first new shot of the second-half block" |

### R4: Narration script (attempt 1, 22:15–22:40 UTC, timed out after 25 min with no output · attempt 2 with a compact pack, 22:40–22:42 UTC = 00:40–00:42 CEST) · verdict **PASS WITH FIXES** · 6 findings, all verified, all fixed

| # | Finding (Hermes) | Verified? | Fix |
|---|---|---|---|
| 1 | N03 "se arrancó el Link": Mileo burns it out with an EMP inhibitor, he doesn't tear it out (Cap.1 L106–L112) | ✔ | "y se cortó el Link." |
| 2 | N04 "Bajo su piel despertó algo antiguo" lands on a tunnel wide shot | ✔ | T10 changed FC-S02-04 → **FC-S02-05** (Coil pulsing under the LEFT wrist in the tunnels; existing shot, src 1.5–4.5) |
| 3 | N15 "Otros rogaron que volviera el silencio" lands on Elena, not Daniel | ✔ | T42/T43 swapped (Daniel first): re-cut (4) in §6 |
| 4 | Only 0.4 s between N05→N06 vs "1 s of air" in the doc | ✔ | N06 starts at 50.0, N07 at 55.3. **All gaps now ≥ 0.7 s** (cross-check enforces this). The doc clarifies that 1 s is recording pre/post-roll |
| 5 | N02 "Es una cosecha." is verbatim but unmarked | ✔ (FC-02 L63) | Now «Es una cosecha.» + quote list (8 quoted lines, 9 strings) |
| 6 | N06 label read as the Architect's voice; it is the polyphonic chorus speaking through Mileo against the Architect (Cap.3 L105–L107) | ✔ | T16 note relabelled |

**Self-check fix (mine):** N08 "Para salvar la ciudad tenían que robar el plan…" claimed a raid purpose Cap.4 never states (the Renacimiento map is only revealed afterwards, L105). Changed to «Su siguiente golpe los llevó al Nodo 17, una catedral subterránea de servidores.» (Cap.4 L49–L53, 1.49 w/s). The phrase "catedral subterránea" is from L53 but is not presented as a quote.

### R5: Queued S09 pilot package: prompts, anchors, runner (22:43–22:46 UTC = 00:43–00:46 CEST) · verdict **FAIL → fixed** · 23 findings: 21 fixed, 1 rejected, 1 kept by design

Generation was blocked (§11), so there were no renders to review. Hermes reviewed what would be spent. The FAIL was correct: runner v1 ignored gates and sent one ref per shot.

| # | Finding | Action |
|---|---|---|
| 1 | `node_17_server_cathedral` not a WORLD_TOKENS location (blocker) | ✔ New **proposal-only** brief `plans/PROPOSED_LOCATION_NODE_17_SERVER_CATHEDRAL_20261003.md` (Cap.4 L53–L57). WORLD_TOKENS/locks untouched; needs Nico/Director approval |
| 2 | Runner v1 ignores `gates` (blocker) | ✔ **Runner v2** skips gated shots unless `--approve-gates …` is passed (mock-tested: 7 `skip_gated`, 1 call) |
| 3 | Single ref; the edit endpoint needs ≥2 (blocker; lock-sheet pipeline note) | ✔ v2 sends 2–3 refs to `/v1/images/edits` in the 2026-09-14 client's format (`image: [data-URI…]`, `grok-imagine-image-quality`, 16:9); a single ref is duplicated |
| 4, 6, 7, 16, 22 | Curated refs ignored; base-wardrobe face refs vs jumpsuits; multi-character shots with one face ref; Riv has no ref; S09-01 solo-Sierra anchor | ✔ New manifest field `pilot_refs` per shot (S08-03 jumpsuit/Riv still + face locks; S09-08 = Sierra+Mileo+Kora locks). Every ref'd prompt adds "use references only for faces, hair, wardrobe; environment from text" |
| 5 | S09-05 anchored on the exterior S08-03 still | Partly: no interior still exists, so S08-03 is kept (the only Riv + jumpsuit ref) together with the Kora/Mileo locks and the environment-from-text clause. Residual risk noted |
| 8 | `the_architect` not a WORLD_TOKENS character | ✔ Registration proposed (proposal file §9); not edited |
| 9 | Architect refs exist but `reference_images: []` | Kept by design: refs README says "NO gen until jefe" (not approved) |
| 10, 11 | S09-07 stacks two presence grammars + physical cathedral setting | ✔ Descriptor neutralised. S09-07 = neural mesh only, abstract-void setting override. S10-07 = gaze only. S15-04 = mesh only |
| 12 | VISUAL_BIBLE minimum negative list missing (carteles, upper frame, …) | ✔ Appended to all 76 image **and** video prompts |
| 13 | Hatch is titanium (Cap.4 L49; S08-07), not steel | ✔ (NODE_17_SANITATION_LOCK says steel: reported, not edited) |
| 14 | Mileo no-fringe regen rule | ✔ In the Mileo descriptor (all Mileo shots) |
| 15 | Kora orientation rule | ✔ In the Kora descriptor |
| 17 | Riv missing from S09-08; drive grab (L93) dropped | ✔ Riv added (pulls the drive in the background); ref → L81–L93. The 60/70/87 % download count is compressed into Riv's console in S09-05 (no on-screen numbers) |
| 18 | Still vs video `image` shape inconsistent | ✘ **Rejected as a defect**: each matches its own working pipeline (v1 anchor string = `locksheet_gen` mode with 7 OK; video object = builder/09-14 client). v2 now uses the 09-14 client shapes for both |
| 19 | Network errors not caught | ✔ v2 records them as a stop (no retry) |
| 20 | "white fire" vs "never white-hot" | ✔ "white electric arc from the connector (not the Coil, which stays indigo)" |
| 21 | Kora's veins blaze violet (L85), not just temples | ✔ |
| 23 | Sierra's pistol is not a registered prop | ✔ "unmarked compact pulse pistol with blank surfaces" (prop registration left to the owner) |

**Note from the lock sheets:** "A 403 means the daily quota is spent". Our 403 body is `unauthenticated:bad-credentials`, which is an expired OAuth access token, not quota (see §11).

### R6: FC-S09 renders (8 stills + 8 i2v), 2026-10-04 06:12–06:20 CEST · verdict **FAIL for director review** · 12 findings: all accepted, 6 regens queued (not run)

Raw: `reports/hermes_review_s09_renders_20261004.md`. Hermes is text-only, so its visual evidence was my frame-sheet observations (`s09_render_review_pack.json`) plus the ContinuityGuard report. Book claims checked against EDICION FC-04: L65 (Kora grips Mileo's arm), L73/L89 (connector and cable at the nape), L81 (white eyes, LEFT hand on Sierra's wrist).

| # | Shot | Sev | Finding | Disposition |
|---|---|---|---|---|
| 1 | S09-05 | blocker | Coil glow on Mileo's RIGHT arm | Regen queued: LEFT side to camera, right arm unmarked |
| 2 | S09-08 | blocker | Sierra and Mileo blended; Mileo's white eyes and cable strike missing | Regen queued: three distinct people, explicit staging |
| 3 | S09-03 | blocker | Magenta neon coils (lock: 482 nm blue/indigo) | Regen queued: blue/indigo only, no magenta/pink/cyan/neon coils |
| 4 | S09-03 | major | Kora without copper vest | Regen queued |
| 5 | S09-02 | major | Sierra in black leather | Accepted. **Root cause is my manifest:** the Sierra descriptor's base "weathered leather jacket" competes with OVERLAY_SAN. The regen prompts swap in the jumpsuit and say "NO leather jacket visible" |
| 6 | S09-01 | major | Glowing gloves on several people | Accepted as a regen tweak ("only Mileo's LEFT wrist glows"). Note: approved S08-07 itself shows violet circuitry on Sierra's glove, so this is a softer issue than Hermes rates it |
| 7 | S09-06 | major | Arc at the mouth/face instead of the nape | Accepted. **Root cause is partly my video prompt** ("arc … flickers across his face"); the regen prompt moves the arc to the nape/spine with a three-quarter rear view |
| 8 | S09-05 | major | Kora grips Riv, not Mileo | Regen queued |
| 9 | CG | major | Face-pass margin of 0.0032 is meaningless (staging stub primary) | Accepted. Manual face check against `locks/refs/*` is part of director review |
| 10 | S09-01 | minor | Copper-rimmed hatch vs S08-07 titanium/indigo | Regen queued |
| 11 | S09-04 | minor | Filaments lean blue over indigo | KEEP-WITH-NOTE |
| 12 | S09-03 | minor | Chest patch (text risk) | Regen queued: blank chests |

Disposition: KEEP S09-07; KEEP-WITH-NOTE S09-04; **REGEN 01, 02, 03, 05, 06, 08** → `plans/FC_S09_REGEN_QUEUE_20261004.json`. Not run: new spend needs Nico's approval. Runner v2.2 `--queue` writes `_r2` files and never overwrites.

### R7: FC-S09 r2 pass (6 regens + 04/07 kept), 2026-10-04 10:36–10:38 CEST · verdict **FAIL for director review** (5/8 approvable)

Raw: `reports/hermes_review_s09_r2_20261004.md`. Evidence: `s09_r2_review_pack.json` (my frame and face observations against `locks/refs`) plus ContinuityGuard r2.
- **Resolved:** S09-03 magenta and Kora's vest; S09-02 wardrobe; S09-06 arc now at the nape; S09-08 Sierra/Mileo blend; S09-05 Kora now grips Mileo.
- **Still failing:**
  - **01r2:** Sierra absent, Mileo's palm on the hatch, which breaks the S08-07 handoff and L49.
  - **05r2:** Coil probably still on the right arm; the console man is not Riv.
  - **08r2:** Mileo's eyes violet, not white (L81); both forearms glow; the pistol meets the cable at his hands, not the nape (L89).
- **Minor:** blood on Riv (01/03) — **CLOSED 2026-10-05 by Nico: KEEP (from the fight), no regen**; Sierra's hair pulled back (matches S08-07) — **CLOSED 2026-10-05 by Nico: TIED/PULLED BACK as S08 is canon; lock + WORLD_TOKENS updated; no S09 regen for hair**.
- **Per shot:** APPROVE 02r2, 04, 06r2, 07; APPROVE-WITH-NOTE 03r2; STILL-FAILS 01r2, 05r2, 08r2.
- **No auto-regen** (per instruction). Hermes's one-line hints are recorded in the raw review for a possible r3 if Nico/Director approve.

### R8: FC-S09 r3 pass (01, 05, 08 regenerated per Nico's brief), 2026-10-04 10:52–10:54 CEST · verdict **FAIL** (7/8 approvable; 08r3 blocks)

Raw: `reports/hermes_review_s09_r3_20261004.md`. Evidence: `s09_r3_review_pack.json` (my frame and face check) plus ContinuityGuard r3.
- **01r3:** all three brief items resolved (Sierra present, her palm on the titanium hatch, no glowing gloves). Note: a glowing forearm between Mileo and Riv, probably Mileo's Coil.
- **05r3:** all resolved (Riv matches S08-03, Coil on the LEFT arm, Kora grips Mileo).
- **08r3:**
  - Resolved: LEFT forearm only; scarlet now an even ambient wash.
  - **Open, blocker:** Mileo's eyes normal, not white (L81).
  - **Open, blocker:** Riv aims the pistol muzzle-forward and the butt never strikes the cable at the nape (L89).
- **Per shot:** APPROVE 02r2, 04, 05r3, 06r2, 07; APPROVE-WITH-NOTE 01r3, 03r2; STILL-FAILS 08r3. No further auto-regen (per instruction).
- **2026-10-05 Director decision:** Riv blood on 01r3/03r2 is **kept** (fight continuity). 03r2's APPROVE-WITH-NOTE on blood is closed; no regen.
- **2026-10-05 Director decision (hair):** Sierra hair **tied/pulled back as S08** is canon. Lock sheet + WORLD_TOKENS updated (§4.1). No S09 regen for hair.

### R9: FC-S09-08 split into 08a/08b (r4), 2026-10-04 11:24–11:26 CEST · verdict **PASS WITH NOTES** for director review

Raw: `reports/hermes_review_s09_r4_20261004.md`. Evidence: `s09_r4_review_pack.json`.
- **08a (L81): PASS-WITH-NOTE.**
  - Eyes matte white, Coil on the LEFT forearm only, identity holds.
  - Notes: already white at frame 0 (no visible transition); the grip is inverted (her hand on his forearm rather than his hand on her wrist).
- **08b (L89–L91): PASS-WITH-NOTE.** The first r4 still failed (Sierra aimed the muzzle at Mileo), so the single allowed retry (`_r4retry`) was used.
  - Resolved: Sierra holds the pistol, muzzle up in a hammer grip, Riv absent, even scarlet wash.
  - Open (moderate): the butt strike itself is not shown.
  - Open (moderate): indigo glow on Sierra's LEFT forearm (lock breach).
  - Open (minor): a red beacon sits at the muzzle tip for 0.5–2.3 s.
- No retries remain; 08b is a director call.

### R10: FC-S09-08b r5 (pistol-butt strike), 2026-10-06 08:00–08:03 CEST · verdict **FAIL (both attempts)**
- Brief (Nico 2026-10-06): butt visibly hits the cable at the nape (EDICION Cap.4 L89–L91); no indigo glow on Sierra's forearm; red only as an even wash; no muzzle light; muzzle never at Mileo; Riv absent; tight insert ~4 s. 2 attempts max.
- Attempt 1 `FC-S09-08b_r5.png` (refs 06r2 + 08a_r4, tight insert over shoulder): **FAIL**. Normal firing grip, muzzle aimed down at Mileo's neck from ~15 cm (reads as an execution); strike absent; a stray second ponytailed head in the foreground. Glow, red and Riv items resolved.
- Attempt 2 `FC-S09-08b_r5b.png` (refs 08b_r4retry + 06r2, side-profile and upside-down pistol requested): **FAIL**. Again a normal grip, muzzle about 5 cm above the connector, aimed at the cable/neck; not side profile; second head gone. Glow, red and Riv items resolved.
- No video was generated: each still already broke the hard rule "muzzle never points at Mileo".
- Hermes: keep `08b_r4retry` in the cut. The model collapses to a firing grip whenever a pistol is near the neck. Recommends (a) inpainting or compositing only the butt tip and glove onto the r4retry plate, with the pistol body cropped out, or (b) hard-cutting to an insert of the severed connector and sparks on the strike beat. No auto-regen.
- Raw: `reports/hermes_review_s09_r5_20261006.md`.

### R11: FC-S09-08c insert (r6 + r6b) and r6 assembly, 2026-10-06 08:14–09:10 CEST · verdict **PASS WITH WORKAROUND** (insert usable, built from both attempts)
- Brief (Nico 2026-10-06): 1.5–2.5 s EPP insert of the neural connector at Mileo's nape breaking on the butt strike, sparks, cable jumping; no gun barrel (dark blurred butt edge at most); only Mileo has circuit glow; **even red alarm light, no flashes**; S09 cathedral palette/canon. Max 2 attempts; if an attempt's still fails QC, skip its video.
- **Attempt 1 `_r6`** (queue `FC_S09_REGEN_QUEUE_R6_08c_20261006.json`, still 06:14Z / video 06:15Z): action reads in motion — butt edge descends 0.8–1.5 s, spark burst on impact, connector severed by 2.2 s (port empty), flexible cable whips out trailing sparks 1.7–2.3 s (verified on a 4-frame contact sheet: reads "cable jumping with sparks", not a torch). **Deviations:** strike window blue-dominant (red arrives ≥2.8 s), grip shape lingers 1.8–2.3 s (torch-like in static frames), butt fuller than "a blurred edge".
- **Attempt 2 `_r6b`** (queue `FC_S09_REGEN_QUEUE_R6B_08c_20261006.json`, 06:43Z/06:45Z): still **PASS** on every look item (even red wash measured (90,41,40); blurred butt edge only; no torch/hands/barrel/muzzle; indigo traces on Mileo's skin only; no text). Video **FAIL**: static — no culatazo, no severing (connector stays plugged through 3.5 s). L89's beat is absent.
- **Final insert `FC-S09-08c_r6g.mp4` (1.917 s):** attempt-1 action window [0.45→2.35 s] + red-wash grade matched numerically to the r6b look (`hue=s=0,lutrgb=r=1.29:g=0.59:b=0.57`, mean (89,41,39) ≈ target (90,41,40); sparks stay bright). Re-checked on the final cut frames: **the culatazo severing the cable reads YES (L89–91)**, red even throughout, no barrel/muzzle/torch/hand, no text.
- **Book check (EDICION L89–91):** strike ✓, cable severed ✓, sparks ✓. Deviation: the book turns the room scarlet *after* Mileo collapses; per Nico's brief the insert carries the red alarm light from frame one (the 08b tail keeps the collapse + the red sweep). Un-graded (blue) variant available on request.
- **Montage:** `08b_r4retry [0→2.5 s]` (pistol lowering starts at 2.5 s, measured) → hard cut → `08c_r6g [1.9 s]` → `08b_r4retry [2.8→6.042]` (pistol descends, red alarm sweep 2.8–3.2 s, Mileo falls forward). 08b turns blue→red between 2.4 and 3.0 s (measured), so the insert lands on the alarm turn; the tail return adds and stays in.
- **Assembly `review_20261006_r6/FC-S09_r6_rough_assembly_20261006.mp4` = 58.461 s**; web copy `FC-S09_r6_review_web.mp4` 960×540 H.264 Main yuv420p faststart CRF26, 7,649,722 B.
- **ContinuityGuard** `reports/continuity_S09_r6_20261006/`: physics 0 flags (cut + 12 clips); face Sierra S08↔S09 0.8432 < 0.88 (same known ref/hair drift; director notes already closed).
- Ops notes: xAI OAuth token expired 06:17Z mid-task (403 bad-credentials on the first r6b call); refreshed via the crontab keepalive command (`xai_client.get_token(force=True)`), valid to 12:43Z. `cg-venv` hit a numpy/cv2 import break mid-run (numpy 2.4.3) and self-healed to 2.5.3 before the face pass re-ran.
- Raw: `renders/FC-S09_pilot_20261003/README_R6_RESULTS_20261006.md`.

### R12: S09 r7: ungraded 08c in book order, and why r6 ran long. 2026-10-06 09:37–09:55 CEST · Grok Bot QC (ffmpeg only, no generation; no Hermes pass requested) · verdict **READY FOR DIRECTOR REVIEW**
- **Why r6 was 58.461 s and not ~51 s:** no clip lost a trim. r6 reused r4's trimmed `_work` files: 01r3…07 at 6.042 s each (they also ran full length in r4), and 08a 0–4.0 s. Two things changed. (1) **r6 joined its 12 pieces with a plain concat and dropped r4's 0.8 s xfades** (`assemble_s09_r4.sh`: `xfade=fade:duration=0.8` + `acrossfade` at all 9 joins), which added **+7.167 s** (54.792 s of segments − 47.625 s). (2) The 08b slot grew from 4.0 s (08b 0.5–4.5) to the 7.667 s 08b+08c section, which added **+3.667 s**. 47.625 + 7.167 + 3.667 = 58.459 ≈ 58.461 s ✓.
- **Fix:** I restored r4's grammar: 0.8 s fades at every shot join, including S08-07→01 and 08a→section. The cuts inside the 08b/08c section are hard, per Nico's brief. Trims and shot choices are as in r4.
- **08b colour vs the fall (measured, 32×18 mean RGB + contact sheets):** blue (34,51,77) to 2.0 s; ramps to red 2.0→3.75 s; full red (64,2,2) from 3.75 s. Mileo is hunched throughout. His head starts to drop at ~4.5 s, and he collapses to the floor at 5.1–5.9 s. **The r6 tail [2.8→6.042] therefore showed the red sweep ~1.7 s BEFORE the fall, against the book order.** In r7 the tail starts at **4.5 s** (fall onset), so the red arrives on the hard cut together with the fall. Head kept at [0→2.5] (Nico's measured cut at the pistol lowering). It carries only a faint magenta warming 2.0–2.5 s (R/B 38/74→45/60) plus the red muzzle-tip beacon already noted in R9. As in r4, its first 0.8 s sits under the 08a fade.
- **08c ungraded:** `FC-S09-08c_r7.mp4` = `_r6` frames 11–56 (0.458→2.375 s, 46 f, 1.917 s). Frame-exact to the r6g window (per-frame luma correlation ≥0.998 vs r6g), with no grade. **Caveat:** the `_r6` plate lights a red ceiling alarm strip at **1.75 s** (top-band red−blue jumps 18→135 at frame 42). The same-window insert therefore shows that strip for its last 0.625 s (15 f), with slight warming; it stays blue-dominant (end mean (60,51,69)). For a strict "no red in the insert" I also made **`FC-S09-08c_r7n.mp4`** = frames 5–40 (0.208→1.708 s, 36 f, 1.5 s = brief minimum). It holds the butt descending, impact, sparks, the severed port and the cable pulled away, and ends 1 frame before the strip lights. It loses the last cable whip (1.7–2.3 s) and the lingering grip (R11's torch-like frames).
- **Book check (EDICION L89–91), r7:** strike ✓, severing + sparks ✓ (blue), Mileo falls ✓, red arrives with the fall ✓. In r7 (not r7n), a small red ceiling strip shows in the last 0.6 s of the insert.
- **ContinuityGuard** (staged like r4, `~/fc_grokbot_20261004/cg_root_r7{,n}`):
  - r7: pass1 FC-S09 **2 flags**, ratios 3.01 / 3.23 at 42.17 s / 43.91 s of `FC-S09_r7_cut_v1.mp4`. Both are the two intentional hard cuts inside the section (08b→08c 42.39 s, 08c→tail 44.31 s); the blue→red jump raises the ratio. CG builds its boundary map from the shot-duration sum, which knows neither the internal cuts nor the xfades, so it labels one of them "within_shot". pass2 **0 flags** (11 clips). pass3 Sierra S08↔S09 **0.8453** FLAG (known drift, notes closed).
  - r7n: pass1 1 flag (43.48 s, 3.46: the 08c→tail cut at 43.89 s); pass2 0; face 0.846.
- Raw: `renders/FC-S09_pilot_20261003/README_R7_RESULTS_20261006.md`, `reports/continuity_S09_r7{,n}_20261006/`.

### R13: FC-S10+ attempt-1 stills (22 shots: S10-01..07, S11-01/02/04/05/08, S12-01/03..07, S13-08, S17-03/07/08), 2026-10-06 ~09:45–09:50 CEST · Hermes default model deepseek-v4.1-flash (run before the 10:28 MiMo rule) on Grok Bot's observation set · verdict **7 FAIL, 8 PASS-WITH-NOTE, 7 PASS**
- **FAIL → regenerated:**
  - S10-01: Mileo duplicated, carried on the LEFT shoulder (book: right), Sierra's wrist glows → `_a2`.
  - S10-04: regenerator/bandage on the throat, not the nape → `_a2`.
  - S10-05: "máscara de piedra" rendered literally as stone skin → `_a2` (raised hand, failed) → `_b1`.
  - S10-07: Elena's echo is a giant hooded figure → `_a2` (readable portrait, failed) → `_b1` (abstract glimmer).
  - S11-05: admin woman's eyes glow strongly, drones read as jets → `_b1`.
  - S12-03: Mileo in Kora's copper vest, both forearms glow → `_a2`.
  - S12-07: Riv has a Mileo-like face and glowing hands → `_a2` (wrong leg) → `_b1` (still only).
  - S11-08 was a note, but regenerated anyway → `_b1` (Riv lock face, LEFT thigh).
- **PASS-WITH-NOTE:**
  - S10-02: Riv's wrist glows.
  - S10-03: the veterans stepping back are missing. A `_b1` alt exists.
  - S10-06: no "ojos brillando".
  - S11-02: the parasite reads as a creature head → `_b2` (still only).
  - S12-04: abstract wall glyphs.
  - S17-03: a disc, not a sphere.
  - S17-08: Sierra identity drift → `_b2` (still only).
- **PASS:** S11-01, S11-04, S12-01, S12-05, S12-06, S13-08, S17-07.
- Raw: `reports/s10plus_a1_review_pack_20261006.md` → `reports/hermes_review_s10plus_a1_20261006.md`.

### R14: FC-S10+ retakes (a2/b1/b2) + all 24 i2v clips, 2026-10-06 10:33–10:44 CEST · Hermes **MiMo 2.6 Pro** (`-m xiaomi/mimo-v2.6-pro --provider nous`) on Grok Bot's observation set · verdict **22/22 shots have a usable still; 18 have a cut-usable clip**
- Note: the pack called the previous round "R12" (written before the other worker logged S09 r7 as R12). Hermes' "R12 verdicts" means **R13** above.
- **Approved stills:**
  - S10-01_a2: note, Kora's weapon reads as pistol-sized, not «fusil corto».
  - S10-04_a2: note, spurious right-forearm glow → comp out.
  - S10-05_b1, S10-07_b1.
  - S11-02_b1: abstract lattice parasite. Hermes lists it under S11-01.
  - S11-05_b1: note, grey coat vs the leather-jacket lock.
  - S11-08_b1: note, faint blue fingers → comp out.
  - S12-03_a2: check that the "15O" band falls in the 2.39 crop.
  - S12-07_b1: note, faint blue hands.
  - S17-03_b1: full sphere.
  - S17-08_b1: face back toward S08.
- **Rejected stills:** S10-05_a2, S10-07_a2 (readable Elena profile), S12-07_a2 (RIGHT leg), S10-06_b1 and S10-03_b1 alts (no gain).
- **Clips approved:** S10-01_a2, S10-05_b1, S10-07_b1, S11-04_a1, S11-08_b1, S12-05_a1, S12-06_a1, S13-08_a1, S17-07_a1.
- **Clips approved with note:** colour drift on S10-03_a1, S10-04_a2, S11-01_a1, S11-05_b1, S12-01_a1, S12-04_a1. Other notes on S10-06_a1 (no eye glow), S12-03_a2 (frost ring reads luminous), S17-03_a1 (disc→dome reads as the sphere), S17-08_a1 (identity drift on the push).
- **Clips rejected:**
  - **S10-02_a1:** Riv's glow grows through the clip.
  - **S11-02_a1:** magenta, hairy-creature read.
  - **S12-07_a2:** wrong leg.
  - R1 assembly placement: S10-02_a1 and S11-02_a1 remain in it only as placeholders. S12-07 is a still-hold.
- **Colour-drift re-video order (suggested):** S11-02 → S12-04 → S10-04 → S10-03 → S11-01 → S12-01 → S11-05.
- **Hermes' open decisions** (carried to §11.8):
  - S11-05 coat vs jacket.
  - S10-01 «fusil corto».
  - S10-06 eye glow comp.
  - Lock the S11-02 lattice design.
  - Re-video order.
  - S12-07_b1 re-submit.
  - S17-08 re-video from b1.
  - Comp-out list: S10-04_a2 right forearm, Riv blue tint on S11-08_b1/S12-07_b1, S12-03_a2 crop.
- Raw: `reports/s10plus_r13_review_pack_20261006.md` → `reports/hermes_review_s10plus_r13_20261006.md` (filename keeps the pack's old label).

## 10. Final cross-check: narration × manifest × v3_ax

Script: `plans/fc_second_half_crosscheck_20261003.py`. It reads only the manifest, the narration doc, this plan, EDICION/MANUSCRIPT, the clips and the v3_ax master; it writes nothing else. Last run 2026-10-04 ~01:00 CEST on the VPS: **PASS, 0 errors, 0 warnings**. Full report: `reports/FC_SECOND_HALF_CROSSCHECK_20261003.{md,json}`.

What it verified:
- **EDL:** 58 segments, contiguous 0.000→192.500 s, no gaps or overlaps. The recap ends on FC-S08-07 (the last v3_ax shot, Cap.4 L49) and the second half starts on FC-S09-01, with T21–T57 in scene order S09→S18.
- **Existing footage:** 19 recap/cold-open segments. All files are present and the source ranges fall inside measured durations. The v3_ax TCs match the timeline rebuilt from frame counts (407.600 s vs master 407.625 s). An SSIM spot-check of v3_ax against the source at each segment midpoint gives 0.80–0.99. The T16 low (0.801) is a single flash frame; other offsets in the same clip score ≥0.988.
- **New footage:** all 38 new segments are in the manifest and flagged `trailer`.
- **Narration:** all 23 beats sit inside their segment windows, ≥0.7 s apart, ≤2.0 words/s, and none falls on silent segments T09/T38/T39/T51. All 9 quoted strings are verbatim in the cited EDICION lines.
- **Shots:** all 76 shots have valid book_ref files and lines. Tokens are ready, or proposed *and gated*. Prompts carry the lock invariants and the VISUAL_BIBLE minimum negatives (image **and** video). Refs and S09 `pilot_refs` exist, and S09 is `queued_blocked_auth`.
- **Docs mirror the manifest:** narration doc and plan (texts, 76 shot rows, 58 EDL rows).

Rule: after any manifest edit, run `build_manifest.py → gen_docs.py → assemble_plan.sh`, then this script again.

## 11. Generation test and S09 pilot

**Result: BLOCKED. One test call, HTTP 403, stopped at once. No retries, no other credentials tried, nothing spent.**

| When | Call | Result |
|---|---|---|
| 2026-10-03 23:31:19 CEST (21:31:19 UTC) | `POST https://api.x.ai/v1/images/generations`, model `grok-imagine-image`, the FC-S09-01 still prompt anchored on `renders/FC-S08/FC-S08-07.png` (token from the pipeline's `get_xai_token()` → `~/.grok/auth.json`, not printed) | **HTTP 403** `{"code":"unauthenticated:bad-credentials","error":"The OAuth2 access token could not be validated."}` (0.3 s) |

- **Meaning:** the token in `/home/ubuntu/.grok/auth.json` (file dated 2026-09-25) is an expired or invalid OAuth access token. It is an auth failure, not a credit or balance error. Earlier history: 2026-09-11 API 403, then CLI 402 "Grok Build usage balance exhausted".
- **Likely cause and fix:**
  - The builder's `get_xai_token()` reads the access token as-is.
  - The newer pipeline client `scripts/video_automation/nw_regen_20260914/xai_client.py` refreshes it from the stored refresh token. That rotates the refresh token and rewrites `~/.grok/auth.json`.
  - I did **not** run that refresh: it rewrites shared credentials, and the rule after a 403 is stop-and-report.
  - Nico can either run that refresh or log in again.
- **To unblock (Nico):**
  1. Restore a valid xAI token.
  2. Approve the proposed location (`plans/PROPOSED_LOCATION_NODE_17_SERVER_CATHEDRAL_20261003.md`) and the spend.
  3. Run **runner v2** in `FILM/plans` (v1 is kept only as the audit record of the 403 call):
     - `python3 fc_s09_pilot_runner_v2_20261003.py --test`: 1 still, S09-01 (no gate)
     - `python3 fc_s09_pilot_runner_v2_20261003.py --stills --approve-gates needs_location_token:node_17_server_cathedral`: 7 stills
     - `python3 fc_s09_pilot_runner_v2_20261003.py --videos --approve-gates needs_location_token:node_17_server_cathedral`: 8 i2v of 6 s @720p
  4. v2 makes one call per item, stops at the first auth/credit/network error and never overwrites.
- **Then:**
  - ContinuityGuard on the pilot into a new OUT_DIR, e.g. `FILM_ROOT=… OUT_DIR=FILM/reports/continuity_S09_pilot_20261003 scripts/video/scan_film_continuity.sh --scenes FC-S09_pilot_20261003`.
  - A Hermes review of the renders.
  - Director approval before S10+.
- **Pilot dir (new):** `FILM/renders/FC-S09_pilot_20261003/` holds only `pilot_log.jsonl` + `STOPPED.json`. No renders exist yet.
- **Queue state:**
  - S09: 8 shots, prompts ready, anchors chosen, `status: queued_blocked_auth`.
  - S10–S18: 68 shots, `planned`, gated on the proposed locks/locations in §4.


### 11.1 S09 render run (2026-10-04, after Nico's re-auth, location approval and S09 spend approval)

All calls were made on the VPS under nohup. Times are CEST.
- **Location registered** (additive; backups `/data/backups/goals/FILM_WORLD_TOKENS.json.bak-20261004-035816` and `FILM_locks_locations_README.md.bak-20261004-035816`):
  - new `locks/locations/NODE_17_SERVER_CATHEDRAL.md`
  - `WORLD_TOKENS.json` +23/−0 lines (new key `node_17_server_cathedral`)
  - `locks/locations/README.md` +1 row
- **Stills** 05:59–06:00: 6/8 OK on the first pass. S09-05 and S09-08 (3 refs) returned **HTTP 400 `{"code":"400","error":"Invalid argument: Cannot set both 'url' and 'file_id' on an image input; they are mutually exclusive"}`**.
  - Fix: a deterministic payload change, not a retry. Max 2 refs, as in the 2026-09-14 client (runner v2.1).
  - Both then OK at 06:01.
- **Videos** 06:02–06:07: 8/8 OK, grok-imagine-video-1.5, 1280×720, 24 fps, 6.04 s each, ~35–40 s per job.
- **ContinuityGuard** (`reports/continuity_S09_pilot_20261004/`, staging root `~/fc_grokbot_20261004/cg_root`, with S08 as baseline):
  - S09 cut physics: 0 flags. Per-shot physics: 0 flags.
  - Face pass: Sierra S08↔S09 similarity 0.8832 against a 0.88 threshold (OK, but weak).
- **Rough assembly:** `renders/FC-S09_pilot_20261003/review_20261004/FC-S09_rough_assembly_20261004.mp4`, **46.458 s**, 1280×720, 24 fps, AAC.
  - Built from the v3_ax tail (last 4.5 s = S08-07) plus S09-01..08 with 0.8 s xfades.
  - The S09-only cut (`FC-S09_cut_v1.mp4`, 42.75 s) is the ContinuityGuard input.
- **Hermes R6:** FAIL for director review. Keep 07; keep-with-note 04; regen 01, 02, 03, 05, 06, 08 (§9). Regen queue `plans/FC_S09_REGEN_QUEUE_20261004.json`, **not run** (needs spend approval):
  1. `python3 fc_s09_pilot_runner_v2_20261003.py --stills --queue FC_S09_REGEN_QUEUE_20261004.json`
  2. `--videos --queue FC_S09_REGEN_QUEUE_20261004.json`

### 11.2 S09 r2 pass (2026-10-04 10:25–10:38 CEST, spend approved by Nico)
- **Stills:** 6/6 OK at 10:26 (2 refs max). **Videos:** 6/6 OK at 10:28–10:32. No errors, no retries.
- **Outputs:** `renders/FC-S09_pilot_20261003/FC-S09-0{1,2,3,5,6,8}_r2.{png,mp4}`. Pass-1 files untouched.
- **Assembly:** `renders/FC-S09_pilot_20261003/review_20261004_r2/FC-S09_r2_rough_assembly_20261004.mp4`, **46.458 s**.
  - Shot order: S08-07 tail, 01r2, 02r2, 03r2, 04, 05r2, 06r2, 07, 08r2.
  - Web copy `FC-S09_r2_review_web.mp4`: 960×540, H.264 Main, yuv420p, faststart, CRF 26, 7.49 MB. Also copied to the box: `/workspace/fc_s09/FC-S09_r2_review_web.mp4`.
- **ContinuityGuard** (`reports/continuity_S09_r2_20261004/`): S09 cut and per-shot physics 0 flags. Face pass **FLAG**: Sierra S08↔S09 0.8308 < 0.88. The staging stub takes the largest face as Sierra, and Sierra is absent from 01r2, so this is a weak signal.
- **Hermes R7:** FAIL; 5/8 approvable; 01r2, 05r2, 08r2 still fail (§9).

### 11.3 S09 r3 pass (2026-10-04 10:44–10:54 CEST, approved by Nico for 01/05/08)
- **Queue:** `plans/FC_S09_REGEN_QUEUE_R3_20261004.json`. Refs: 01 = S08-07 + Sierra; 05 = S08-03 + Mileo; 08 = Sierra + Mileo.
- **Results:** 3/3 stills OK (10:45); 3/3 videos OK (10:46–10:48). No errors.
- **Assembly:** `review_20261004_r3/FC-S09_r3_rough_assembly_20261004.mp4`, **46.458 s**.
  - Shot order: S08-07 tail, 01r3, 02r2, 03r2, 04, 05r3, 06r2, 07, 08r3.
  - Web copy `FC-S09_r3_review_web.mp4`: 960×540, H.264 Main, CRF 26, 7.24 MB; box copy `/workspace/fc_s09/FC-S09_r3_review_web.mp4`.
- **ContinuityGuard** (`reports/continuity_S09_r3_20261004/`): physics 0 flags; face FLAG 0.8333 < 0.88 (staging-stub artefact).
- **Hermes R8:** FAIL, 7/8 approvable; 08r3 still fails (§9).

### 11.4 S09-08 split into 08a/08b (r4), 2026-10-04 11:15–11:26 CEST (approved by Nico)
- **Queues:** `plans/FC_S09_REGEN_QUEUE_R4_20261004.json` and `plans/FC_S09_REGEN_QUEUE_R4_RETRY_08b_20261004.json` (the single retry, 08b only).
- **Generation:**
  - 08a still + video OK.
  - 08b first still OK by API but failed QC (muzzle aimed at Mileo); retry still + video OK.
  - No API errors.
- **Files:** `FC-S09-08a_r4.{png,mp4}`, `FC-S09-08b_r4.png` (rejected, kept for the record), `FC-S09-08b_r4retry.{png,mp4}`.
- **Assembly:** `review_20261004_r4/FC-S09_r4_rough_assembly_20261004.mp4`, **47.625 s**.
  - Shot order: S08-07 tail 4.5 s, 01r3, 02r2, 03r2, 04, 05r3, 06r2, 07, 08a (0–4.0 s), 08b retry (0.5–4.5 s).
  - Web copy `FC-S09_r4_review_web.mp4`: 960×540, H.264 Main, yuv420p, faststart, CRF 26, 7,196,878 B; box copy `/workspace/fc_s09/FC-S09_r4_review_web.mp4`.
- **ContinuityGuard** (`reports/continuity_S09_r4_20261004/`): physics 0 flags on the cut (43.9 s) and on all 9 clips; face FLAG 0.8445 < 0.88 (staging-stub artefact).
- **Hermes R9:** PASS WITH NOTES (§9).

### 11.5 S09-08b r5 (2026-10-06 08:00–08:03 CEST, approved by Nico; 2 attempts)
- Queues: `plans/FC_S09_REGEN_QUEUE_R5_20261006.json` (attempt 1, `_r5`) and `plans/FC_S09_REGEN_QUEUE_R5_ATTEMPT2_20261006.json` (attempt 2, `_r5b`). Runner v2.2 `--stills`; both calls returned HTTP 200 (6.8 s and 11.1 s).
- Both stills failed QC (muzzle aimed at Mileo, strike absent), so no i2v was spent and no r5 video exists.
- No r5 assembly, ContinuityGuard run or web copy: there is no new clip to cut. The current review cut is still `review_20261004_r4/` (47.625 s) and `/workspace/fc_s09/FC-S09_r4_review_web.mp4`.
- Hermes R10: FAIL both; keep 08b_r4retry (§9).

### 11.6 S09-08c insert + r6 assembly (2026-10-06 08:14–09:10 CEST, approved by Nico; 2 attempts)
- **Queues:** `plans/FC_S09_REGEN_QUEUE_R6_08c_20261006.json` (attempt 1, `_r6`, generated 06:14–06:15Z before this session's review) and `plans/FC_S09_REGEN_QUEUE_R6B_08c_20261006.json` (attempt 2, `_r6b`, 06:43–06:45Z). Runner v2.2 (`--stills` then `--videos`), Grok Imagine via xai-oauth. HTTP 200 on all 4 calls; no credit errors. Spend: 2 stills + 2 videos for 08c total (1 + 1 per attempt).
- **Outcome per attempt:** `_r6` = action ✓ (culatazo + severing + sparks + cable whip, verified in motion), look ✗ (blue strike window, lingering butt). `_r6b` = look ✓ (red even wash, clean staging), action ✗ (static, no severing). Attempts exhausted (2/2).
- **Final insert:** `FC-S09-08c_r6g.mp4`, 1.917 s = `_r6.mp4` window [0.45→2.35 s] + red-wash grade to the `_r6b` look (mean (89,41,39) vs target (90,41,40)). Review vs EDICION L89–L91: the culatazo cutting the cable reads (R11). New file; no approved file touched.
- **Montage (Nico's edit brief):** `08b_r4retry [0→2.5 s]` → hard cut when Sierra's pistol starts to lower → `08c_r6g [1.9 s]` → `08b_r4retry [2.8→6.042 s]` (return "si suma" = YES: red sweep + Mileo falling forward; palette continuous since 08b itself turns red 2.4→3.0 s).
- **Assembly:** `review_20261006_r6/FC-S09_r6_rough_assembly_20261006.mp4`, **58.461 s** (40,643,882 B). Shot order: S08-07 tail 4.5 s, 01r3, 02r2, 03r2, 04, 05r3, 06r2, 07 (6.042 s each), 08a (0–4.0 s), 08b head 2.5 s + 08c_r6g 1.9 s + 08b tail 3.242 s.
- **Web copy:** `review_20261006_r6/FC-S09_r6_review_web.mp4` — 960×540, H.264 Main, yuv420p, faststart, CRF 26, **7,649,722 B (<10 MB)**, 58.474 s.
- **ContinuityGuard** (`reports/continuity_S09_r6_20261006/`, staged root in scratch `cg_root_r6`, S09 face anchor = Sierra Catalano mirroring the r4 run): pass1 0 flags, pass2 0 flags (12 clips), pass3 Sierra S08↔S09 **0.8432 < 0.88 FLAG** (same known ref/hair drift as r2 0.8308 / r3 0.8333 / r4 0.8445; director notes closed 2026-10-05).
- **Book deviation to confirm:** the insert carries the even red alarm light from frame one (Nico's brief) although EDICION L89–L91 turns the room scarlet after Mileo collapses; the tail keeps the collapse + red sweep. Un-graded (blue) variant of the same window is one ffmpeg command away.
- **Not done by design:** no S10 work (gates: S09 approval + characters/locations + Martin lock + spend), no locks/WORLD_TOKENS edits (hence no backups needed), no git, no publishing.

### 11.7 S09 r7: ungraded 08c in book order + r4 grammar restored (2026-10-06 09:37–09:55 CEST, Nico's decision; ffmpeg only)
- **Decision (Nico 2026-10-06):** use the ungraded 08c in book order: no red in the insert; red arrives after/with the fall (L89–91).
- **New files** (`renders/FC-S09_pilot_20261003/`):
  - `FC-S09-08c_r7.mp4`: `_r6` frames 11–56, 1.917 s, ungraded; same window as r6g.
  - `FC-S09-08c_r7n.mp4`: `_r6` frames 5–40, 1.5 s, ends before the plate's red ceiling strip lights at 1.75 s.
  - `review_20261006_r7/` (`_work_r7`, `_work_r7n`, assemblies, cut_v1s, web copies).
  - `README_R7_RESULTS_20261006.md`.
- **Scripts** (new, `~/fc_grokbot_20261004/src/`): `make_08c_r7.sh`, `assemble_s09_r7.sh` (r4 grammar), `cg_r7.sh`.
- **Duration finding:** r6 dropped r4's 0.8 s xfades (plain concat, +7.167 s), and the 08b slot grew 4.0→7.667 s (+3.667 s). No trims were lost. Fixed by restoring the xfades (details §9 R12).
- **Edit:** `08b_r4retry [0→2.5]` | hard cut | `08c_r7` (1.917 s) | hard cut | `08b_r4retry [4.5→6.042]`. The tail start moved from 2.8 to 4.5 s because 08b is fully red from 3.75 s while the fall only starts at ~4.5 s; the red now lands with the fall.
- **Assembly r7:** `review_20261006_r7/FC-S09_r7_rough_assembly_20261006.mp4`, **49.583 s** (37,765,644 B). Order: S08-07 tail 4.5 s, 01r3, 02r2, 03r2, 04, 05r3, 06r2, 07 (6.042 s each), 08a (0–4.0 s), 08b/08c section 5.958 s. 0.8 s fades between shots, as in r4. Section times in the master: 08b head 43.59 s, 08c 46.09 s, tail 48.01 s.
  - Against the ~51–52 s estimate: the later tail start costs 1.7 s; with the old 2.8 s tail it would be 51.29 s.
- **Web copy r7:** `FC-S09_r7_review_web.mp4`, 960×540 H.264 Main yuv420p faststart CRF26, **7,425,083 B**, 49.583 s. Box: `/workspace/fc_s09/FC-S09_r7_review_web.mp4` (sha256 match).
- **Alt r7n** (strict no-red insert): `FC-S09_r7n_rough_assembly_20261006.mp4` 49.208 s. Web `FC-S09_r7n_review_web.mp4` 7,387,606 B; box `/workspace/fc_s09/FC-S09_r7n_review_web.mp4`.
- **ContinuityGuard:**
  - `reports/continuity_S09_r7_20261006/`: pass1 2 flags, both at the intentional section hard cuts; pass2 0 flags (11 clips); face 0.8453 FLAG (known).
  - `reports/continuity_S09_r7n_20261006/`: pass1 1 flag (same cause); pass2 0; face 0.846.
- **Not done:** no generation, no locks/WORLD_TOKENS edits, no git, no publishing. Approved files untouched. Doc backups: `/data/backups/goals/FILM_FC_SECOND_HALF_PLAN_20261003.md.bak-20261006-094845`, `OPS_FC_SECOND_HALF_20261003.md.bak-20261006-094845`.

### 11.8 FC-S10+ sprint (2026-10-06 09:40–10:45 CEST, spend authorized by Nico 09:38; ungated shots + proposals)
- **Pipeline:** new runner `plans/fc_s10plus_runner_v1b_20261006.py`:
  - Calls `xai_client.get_token()`, the image edits endpoint (max 2 refs) and `grok-imagine-video-1.5` (6 s, 720p).
  - Never overwrites. 0.7 s submit pacing and paced re-sends for "requests per second" 429s. Stops on quota.
  - Queues: `plans/FC_S10PLUS_QUEUE_{A1,A2,B1,B2}_20261006.json`, `FC_S10PLUS_VIDEO_QUEUE_V{1,2,3}_20261006.json`, `FC_PROPOSALS_QUEUE_A{1,2,3}_20261006.json`. Builders: `fc_s10plus_build_queue_*`, `fc_proposals_build_queue_*`.
  - Log: `renders/FC-S10plus_20261006/run_log.jsonl`.
- **Generated:**
  - 38 scene stills (a1 22, a2 6, b1 7, b2 3).
  - 24 i2v clips: S10-01_a2, 02_a1, 03_a1, 04_a2, 05_b1, 06_a1, 07_b1; S11-01_a1, 02_a1, 04_a1, 05_a1, 05_b1, 08_a1, 08_b1; S12-01_a1, 03_a2, 04_a1, 05_a1, 06_a1, 07_a2; S13-08_a1; S17-03_a1, 07_a1, 08_a1.
  - 24 proposal stills (`proposals/20261006/`, see README_PROPOSALS_20261006.md).
- **Quota stop:** 09:58 CEST, HTTP 403 `personal-team-blocked:spending-limit` on all runners.
  - Lost or blocked: the S12-07_b1 i2v (request id not logged, unrecoverable; the runner should log request ids), the V3 colour-locked re-videos (`_a1v2`/`_a2v2`), the b2 videos, and proposals A3 (naomi_lang, eli_roth, mira_roth + 8 locations).
  - No post-reset spend (reset expected ~11:38 CEST).
- **Rate limit (not quota):** the first 5-worker video launch hit 429 "Requests per Second 2/2", so runner v1b adds pacing.
- **i2v colour drift:** blue/indigo → violet/magenta in S10-03, S10-04, S11-01, S11-02, S11-05, S12-01, S12-04. The colour-locked re-videos are queued in V3 but not run.
- **Assemblies:** `plans/fc_s10plus_assemble_v1b_20261006.py` + `plans/FC_S10PLUS_ASSEMBLY_SPEC_R1_20261006.json` → `renders/FC-S10plus_20261006/review_20261006/`. Gated shots are slugs; S12-07 is a 5 s labelled still-hold.

  | Scene | Duration | Web copy size |
  |---|---|---|
  | FC-S10 | 42.313 s | 4.85 MB |
  | FC-S11 | 33.729 s | 3.11 MB |
  | FC-S12 | 36.730 s | 2.45 MB |
  | FC-S13-S17 inserts | 24.188 s | 2.89 MB |

  - Web copies are 960×540, H.264 Main, yuv420p, faststart. They are also on the box in `/workspace/fc_s10plus/`.
- **ContinuityGuard:** `reports/continuity_S10plus_20261006/`, staged in `~/fc_s10plus_20261006/cg_root`.
  - pass1: every S10/S11/S12 flag is a hard-cut boundary. S1X has 2 cut-adjacent flags at 5.65/11.74 s.
  - pass2: **0 flags**.
  - pass3 Sierra: S08↔S10 0.8625, S08↔S11 0.8756, S08↔S12 0.8299 FLAG. This is the known drift vs S08, as in S09 0.845. Within the new block: S10↔S11 0.945, S11↔S12 0.937, S10↔S12 0.965.
- Ops: `GoalWorld/docs/ops/FC_S10PLUS_SPRINT_20261006.md`. Plan backup: `/data/backups/goals/FILM_FC_SECOND_HALF_PLAN_20261003.md.bak-20261006-083511`.
- **Open decisions for Nico:**
  1. Approve or reject the proposals: Martin set, Jansen (check the scar side in the profile), Elena (a2 preferred), Elara, Amara, Daniel, and 9 locations. Approval unblocks S12-02 and the slugged S11-03/06/07.
  2. Spend for colour-locked re-videos (V3 queue is ready), in Hermes' order. Also S10-02 without the Riv glow, and new videos from the b1/b2 stills for S11-02, S12-07, S17-03, S17-08.
  3. S11-05 wardrobe: grey coat or leather jacket.
  4. S10-01: accept the pistol-sized weapon or redo it with a «fusil corto».
  5. S10-06: comp in the eye glow.
  6. Sierra's face drift vs S08: 0.83–0.88.
  7. The book says Sierra's eyes are grey; the lock has hazel.
  8. Martin's age is unspecified in the book.
  9. Proposals A3 were not generated.
