# Fractured Code — Produced-scenes inventory (as of 2026-10-03)

**Status:** DRAFT 2026-10-03 (Grok Bot) · Hermes-reviewed (see plan §9). Read-only audit; nothing existing was modified.
**Master cut:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/FC_full_conform_v3_ax.mp4`: 407.625 s (stream 407.600 s), 1280×720, 24 fps, −20 LUFS, EL bed `audio/bed_v3_elevenlabs_norm.wav`. Gate D preview: https://goalworld.fun/assets/film/improve_20260915/FC_full_conform_v3_ax.mp4
**Timeline model (reproduced exactly):** scene conforms (frame counts from VISUAL_QC 2026-09-24) chained with 0.8 s xfades = v2 (382.392 s); AX01–05 hard-spliced at the v2 scene boundaries → v3_ax 407.600 s. Note: the first 0.8 s of a scene that follows an AX insert sits inside the pre-splice xfade, so its *visible* start = AX end.
**Other existing deliverables:** live 2.39 minifilm https://goalworld.fun/assets/img/neuralwars/FC_minifilm_239_v3.mp4 (public file: 542.1 s, 1280×536, 63.9 MB, last-modified 2026-09-25 14:40 CEST, measured with ffprobe 2026-10-03). The repo copy `GoalWorld/docs/assets/img/neuralwars/FC_minifilm_239_v3.mp4` is **530.2 s** (82.3 MB, 2026-09-25 11:05 CEST): the two differ. `edit/project.md` still documents the older v2 (409.1 s). Also knots K1–K9 (`edit/knots/`), bridges B1–B6, opening B00a/B00b (`edit/opening/`).

## 1. Scene order in v3_ax

| # | Scene | Book source (EDICION_2026) | Beat | v3_ax in → out (scene-to-scene = start of the 0.8 s dissolve; after an AX hard splice = first visible frame) | Dur |
|---|---|---|---|---|---|
| 1 | FC-S01 | FC-01 Cap.1 L78–L135 | Seven-minute blackout in Sector 17, EMP cut of the Link, sensory flood, tunic in the mud, drones, grate; Coil awakens on LEFT wrist | 0:00.00 → 0:48.33 | 48.33 s |
| 2 | FC-S02 | FC-01 Cap.1 L133–L137 | Descent down the service ladder into the forgotten tunnel labyrinth; the Coil pulses like a compass | 0:47.53 → 1:35.87 | 48.33 s |
| 3 | FC-AX01 | motivated by Cap.3 L139, Cap.4 L81–85, Cap.5 L3 (presence grammar) | Architect insert | 1:35.87 → 1:40.91 | 5.04 s |
| 4 | FC-S03 | FC-02 Cap.2 L27–L77 | Kora gets Keystone's red-priority call, Tunnel Six, standoff, neutralizer patch on the nape, «Es una cosecha» (L63, Mileo), flight from the hounds | 1:40.91 (xfade-timeline start 1:40.11) → 2:28.44 | 47.53 s |
| 5 | FC-S04 | FC-02 Cap.2 L79–L131 | The Fracturados redoubt (~300), Sierra at the map table, scanner confirms the fracture, order to the medical bay, Coil flare | 2:27.64 → 3:13.97 | 46.33 s |
| 6 | FC-S05 | FC-03 Cap.3 L77–L125 | Medical bay: forearm data extraction, Kora's Cascade, indigo-fire eyes / polyphonic voice, Yggdrasil hologram with parasitic core | 3:13.18 → 4:01.51 | 48.33 s |
| 7 | FC-AX02 | motivated by Cap.3 L139, Cap.4 L81–85, Cap.5 L3 (presence grammar) | Architect insert | 4:01.51 → 4:06.55 | 5.04 s |
| 8 | FC-S06 | FC-03 Cap.3 L127–L141 | Eastern breach, Protocol Delta, burning the rigs, Kora: «El Arquitecto ya sabe lo que hemos visto» (L139), Sierra at the parapet | 4:06.55 (xfade-timeline start 4:05.75) → 4:50.08 | 43.53 s |
| 9 | FC-AX03 | motivated by Cap.3 L139, Cap.4 L81–85, Cap.5 L3 (presence grammar) | Architect insert | 4:50.08 → 4:56.12 | 6.04 s |
| 10 | FC-S06A | FC-03 Cap.3 L131–L141 (expanded) | Action insert: corridor evacuation, Sierra holds the blast threshold, hatch seals (film expansion of Protocol Delta; no new book event) | 4:56.12 (xfade-timeline start 4:55.32) → 5:19.49 | 23.37 s |
| 11 | FC-S07 | FC-04 Cap.4 L3–L31 | Vent vigil (dermal scars, vertigo), Kora at the hatch, «jump point», resonance between them | 5:18.69 → 6:02.02 | 43.33 s |
| 12 | FC-AX04 | motivated by Cap.3 L139, Cap.4 L81–85, Cap.5 L3 (presence grammar) | Architect insert | 6:02.02 → 6:07.07 | 5.04 s |
| 13 | FC-AX05 | motivated by Cap.3 L139, Cap.4 L81–85, Cap.5 L3 (presence grammar) | Architect insert | 6:07.07 → 6:11.11 | 4.04 s |
| 14 | FC-S08 | FC-04 Cap.4 L33–L49 | Surface in sanitation jumpsuits, compliant gait, tool cart, drone diamond, 18-second shadow, palm on the Node 17 hatch | 6:11.11 (xfade-timeline start 6:10.31) → 6:47.60 | 36.49 s |

## 2. Shot-level inventory

### FC-AX: The Architect Presence — Insert Shots *(JSON title still says "docs only"; historical, the shots are rendered and cut into v3_ax)*

- **Book:** motivated by Cap.3 L139, Cap.4 L81–85, Cap.5 L3 (presence grammar). **Beat:** Architect presence inserts: system gaze, linked crowd, drone gathering, veiled silhouette, mesh on hatch glass.
- **Look:** system-gaze POV, fog, steel + indigo residual, no face/body. **JSON status:** `rendered_qc_pass`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-AX01 | 1:35.87 | 5.04 | The Architect | After Forgotten Labyrinth descent: cold system-gaze POV peers down the vent shaft; indigo residual flickers in the metal throat; fog swallows depth… |
| FC-AX02 | 4:01.51 | 5.04 | The Architect | Bridge from Yggdrasil fracture to Protocol Delta pressure: mid-distance anonymous linked figures with empty compliant eyes; neural mesh indigo flic… |
| FC-AX03 | 4:50.08 | 6.04 | The Architect | Pre-action insert before Protocol Delta sprint: corridor holds empty; abstract drone silhouettes gather at far junction; indigo Coil residual crawl… |
| FC-AX04 | 6:02.02 | 5.04 | The Architect | Pre-S08: distant veiled Architect silhouette at the far end of a residential canyon; face unreadable in fog; indigo Coil glow at chest height only … |
| FC-AX05 | 6:07.07 | 4.04 | The Architect | Second pre-S08 beat: extreme close indigo neural-mesh flicker on sanitation hatch glass — Architect as symbol/system before surface breach; bridge … |

### FC-S01: Sector 17 Link Cut

- **Book:** FC-01 Cap.1 L78–L135. **Beat:** Seven-minute blackout in Sector 17, EMP cut of the Link, sensory flood, tunic in the mud, drones, grate; Coil awakens on LEFT wrist.
- **Look:** night alley, rust vapor, rain, crimson/white scans, indigo Coil. **JSON status:** `rendered_8_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S01-01 | 0:00.00 | 6.04 | — | Establish cracked concrete alley with rust vapor and sparse rain under reduced neural coverage night sky |
| FC-S01-02 | 0:06.04 | 6.04 | Mileo Chen | Mileo arrives, kneels, presses EMP dampener toward nape Link nodule; countdown tension |
| FC-S01-03 | 0:12.08 | 6.04 | Mileo Chen | Silent thunder inside skull; collapses to knees in mud; mute scream; burnt-circuits feel without gore |
| FC-S01-04 | 0:18.12 | 6.04 | Mileo Chen | Sensory flood money-shot: world explodes in stimuli; orange rust, oil/sweat atmosphere; triumphant heartbeat vibe |
| FC-S01-05 | 0:24.17 | 6.04 | Mileo Chen | Crimson/white scan light washes alley (no readable text); Mileo reacts as hunted |
| FC-S01-06 | 0:30.21 | 6.04 | Mileo Chen | Rips off gray tunic into mud; dark underlayer revealed; starts run toward ventilation grate |
| FC-S01-07 | 0:36.25 | 6.04 | Mileo Chen | Distant NeuroSec drone approach (cold white/crimson lights ~3 blocks); chase tension; Mileo reaches grate |
| FC-S01-08 | 0:42.29 | 6.04 | Mileo Chen | Close LEFT wrist: deep indigo bioluminescent Serpent Coil lines awaken under skin; descent into tunnels; point of no return |

### FC-S02: Forgotten Labyrinth Descent

- **Book:** FC-01 Cap.1 L133–L137. **Beat:** Descent down the service ladder into the forgotten tunnel labyrinth; the Coil pulses like a compass.
- **Look:** wet shafts, darkness, indigo Coil as the only light, distant searchlights. **JSON status:** `rendered_8_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S02-01 | 0:47.53 | 6.04 | Mileo Chen | Looking down the wet maintenance shaft: Mileo begins scrambling down the iron ladder into Neo-Citania forgotten tunnels |
| FC-S02-02 | 0:53.58 | 6.04 | Mileo Chen | Mileo climbs down urgently; Coil on LEFT wrist flares with each heartbeat; muddied boots on rungs |
| FC-S02-03 | 0:59.62 | 6.04 | Mileo Chen | Boots splash into stagnant runoff; Mileo drops into the forgotten labyrinth threshold |
| FC-S02-04 | 1:05.66 | 6.04 | Mileo Chen | Establish the forgotten subterranean labyrinth: Mileo a small figure swallowed by branching wet tunnels |
| FC-S02-05 | 1:11.70 | 6.04 | Mileo Chen | Serpent Coil pulses deep indigo in lockstep with blood/heartbeat; Mileo reads it as living compass in the dark |
| FC-S02-06 | 1:17.74 | 6.04 | Mileo Chen | Distant cold white/crimson NeuroSec searchlights sweep through a street grate above; Mileo freezes hunted in the dark |
| FC-S02-07 | 1:23.78 | 6.04 | Mileo Chen | Mileo staggers/runs deeper through branching tunnels; sensory rawness; Coil lights the path ahead |
| FC-S02-08 | 1:29.83 | 6.04 | Mileo Chen | Point of no return underground: Mileo silhouette enters a deeper storm-drain confluence; Coil pulse final; no turning back |

### FC-S03: Tunnel Six First Contact

- **Book:** FC-02 Cap.2 L27–L77. **Beat:** Kora gets Keystone's red-priority call, Tunnel Six, standoff, neutralizer patch on the nape, «Es una cosecha» (L63, Mileo), flight from the hounds.
- **Look:** orange filament lamps, mildew, telephoto; Kora copper vest. **JSON status:** `rendered_8_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S03-01 | 1:40.11 | 6.04 | — | Establish Tunnel Six: mildew air, stagnant runoff, orange filament emergency lamps flickering on crumbling concrete ribs |
| FC-S03-02 | 1:46.15 | 6.04 | Kora Vega | Kora advances into Tunnel Six with shock pistol drawn in right hand; feline caution; copper-gold tactical vest |
| FC-S03-03 | 1:52.19 | 6.04 | Kora Vega | Bone-conduction under collarbone scar activates with Keystone red-priority urgency; Kora eyes harden — high-value defector in Tunnel Six |
| FC-S03-04 | 1:58.23 | 6.04 | Mileo Chen, Kora Vega | Telephoto: slumped Mileo against rusted steam main fifty meters ahead; Kora soft silhouette at frame edge |
| FC-S03-05 | 2:04.28 | 6.04 | Kora Vega, Mileo Chen | Kora closes with feline caution; muzzle trained on Mileo chest; first Resistance contact standoff |
| FC-S03-06 | 2:10.32 | 6.04 | Mileo Chen | Mileo head jerks up; pupils dilated nearly swallowing vivid green irises; neural withdrawal rawness |
| FC-S03-07 | 2:16.36 | 6.04 | Kora Vega, Mileo Chen | Kora holsters pistol, kneels, slaps crude neural shock-dampener patch on Mileo nape; brief arch then breath steadies |
| FC-S03-08 | 2:22.40 | 6.04 | Kora Vega, Mileo Chen | Kora hauls Mileo to his feet; Coil indigo brightens; urgency — NeuroSec thermal hounds north; point of alliance |

### FC-S04: Fracturados Redoubt — Sierra Keystone

- **Book:** FC-02 Cap.2 L79–L131. **Beat:** The Fracturados redoubt (~300), Sierra at the map table, scanner confirms the fracture, order to the medical bay, Coil flare.
- **Look:** gas lamps, copper mesh, holo table; Sierra leather jacket + LEFT scar. **JSON status:** `rendered_8_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S04-01 | 2:27.64 | 6.04 | — | Establish The Fractured subterranean redoubt: heavy lead blast doors, braided copper mesh scattering radar; warm practical glow leaking from seams |
| FC-S04-02 | 2:33.68 | 6.04 | Kora Vega, Mileo Chen | Kora hauls Mileo past checkpoint into the vault; Mileo wide-eyed shock at free human life under gas lamps |
| FC-S04-03 | 2:39.72 | 6.04 | Kora Vega, Mileo Chen | Kora steers Mileo toward command post; chaotic life: laughter, broth steam, children chasing rag ball near ammo crates (soft, PG-13) |
| FC-S04-04 | 2:45.77 | 6.04 | Kora Vega, Mileo Chen | Push through heavy rubber blast drapes into fortified command chamber; holographic tactical table glow ahead |
| FC-S04-05 | 2:51.81 | 6.04 | Sierra Catalano | Sierra Catalano first appearance: leaning over holographic tactical table; pale LEFT cheek scar; calculating dark eyes; Keystone commander |
| FC-S04-06 | 2:57.85 | 5.04 | Sierra Catalano, Mileo Chen, Kora Vega | Sierra confronts Specialist Chen without preamble; Mileo meets her gaze despite finger tremors; Kora flanks soft |
| FC-S04-07 | 3:02.89 | 5.04 | Sierra Catalano, Mileo Chen | Sierra scans Mileo bowed head; handheld neural scanner projects fractured electric-blue micro-fissure web — genuine synaptic rebellion |
| FC-S04-08 | 3:07.93 | 6.04 | Sierra Catalano, Kora Vega, Mileo Chen | Sierra orders medical bay / Link extraction; Kora grips Mileo shoulder; indigo Serpent Coil flares brilliant in underground gloom — war for the sou… |

### FC-S05: Medical Bay — Yggdrasil Fracture

- **Book:** FC-03 Cap.3 L77–L125. **Beat:** Medical bay: forearm data extraction, Kora's Cascade, indigo-fire eyes / polyphonic voice, Yggdrasil hologram with parasitic core.
- **Look:** cold surgical practicals, violet EM, frost breath, Yggdrasil hologram. **JSON status:** `rendered_8_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S05-01 | 3:13.18 | 6.04 | Dr. Marcus Okafor | Establish cold clinical bay under brick vault: surgical gurney, fiber-optic rig, analog monitors dark; Okafor preps probes under harsh practicals |
| FC-S05-02 | 3:19.22 | 6.04 | Mileo Chen, Dr. Marcus Okafor, Kora Vega, Sierra Catalano | Mileo strapped in canvas restraints; Okafor leans in; Kora and Sierra flank — resolve before jack-in |
| FC-S05-03 | 3:25.26 | 6.04 | Mileo Chen, Dr. Marcus Okafor | Okafor plugs three fiber-optic probes into subdermal geometric scar-circuit on Mileo LEFT forearm; dermal Renaissance cache jack-in |
| FC-S05-04 | 3:31.30 | 6.04 | Mileo Chen, Riv, Dr. Marcus Okafor | Extraction surge PG-13: Mileo spine arches against canvas; Riv analog screens bloom living fractal geometries (not binary); breath turns to frost p… |
| FC-S05-05 | 3:37.34 | 6.04 | Kora Vega, Sierra Catalano | Kora Cascade seizure: drops to knees clutching temples; indigo bioluminescent veins flare temples/forearms; subtle violet nosebleed; senses cosmic … |
| FC-S05-06 | 3:43.38 | 6.04 | Mileo Chen, Sierra Catalano | Mileo eyes snap open as twin discs of blinding indigo fire; jaw parts — polyphonic Architect-Usurper voice (visual energy only); violet radiance; g… |
| FC-S05-07 | 3:49.43 | 6.04 | — | Crystal hologram: immense bioluminescent Yggdrasil tree — roots in mantle, canopy into stars; dark parasitic NeuroSys tumor strangling trunk sap — … |
| FC-S05-08 | 3:55.47 | 6.04 | Mileo Chen, Kora Vega, Sierra Catalano, Dr. Marcus Okafor, Riv | Gurney crashed; Mileo unconscious but breathing; Kora rises violet-smeared; Sierra racks pulse rifle glacial calm; red emergency beacons begin to s… |

### FC-S06: Protocol Delta — Eastern Breach

- **Book:** FC-03 Cap.3 L127–L141. **Beat:** Eastern breach, Protocol Delta, burning the rigs, Kora: «El Arquitecto ya sabe lo que hemos visto» (L139), Sierra at the parapet.
- **Look:** red beacons, dust, thermite sparks, pulse rifles. **JSON status:** `rendered_8_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S06-01 | 4:05.75 | 6.04 | — | Perimeter sirens shatter post-Yggdrasil silence; red emergency beacons spin across brick vault corners; dust vibrates; breach imminent |
| FC-S06-02 | 4:11.79 | 5.04 | Riv | Riv bellows into analog shortwave: eastern breach — multiple heavy NeuroSec squads in assault armor with thermal cannons (visual urgency only; NO o… |
| FC-S06-03 | 4:16.83 | 6.04 | — | Heavy NeuroSec assault silhouettes advance in formation; abstract thermal-cannon glow at weapon muzzles; braided copper mesh and brick vault — face… |
| FC-S06-04 | 4:22.88 | 5.04 | Sierra Catalano | Sierra racks pulse-rifle bolt with glacial calm; pulse held at sixty-two; pale LEFT cheek scar lit by red strobe — commander resolve |
| FC-S06-05 | 4:27.92 | 6.04 | Sierra Catalano, Dr. Marcus Okafor, Riv | Protocol Delta: fighters load Mileo data-core canisters; thermite charges spark on stationary extraction rigs; Okafor moves wounded toward deep-con… |
| FC-S06-06 | 4:33.96 | 5.04 | Kora Vega, Sierra Catalano | Kora rises — face smeared with subtle luminous violet Cascade residue (PG-13); eerie calm knowing: Architect saw what they saw; Sierra meets her eyes |
| FC-S06-07 | 4:39.00 | 5.04 | Mileo Chen | Mileo eyes flutter open with terrifying new lucidity (vivid green, not indigo-fire); LEFT wrist Coil pulses once; he is conscious cargo for the dee… |
| FC-S06-08 | 4:44.04 | 6.04 | Sierra Catalano, Kora Vega, Mileo Chen | Sierra takes position behind reinforced parapet of main blast door — let him come; truth will not die; Kora supports Mileo toward deep conduits beh… |

### FC-S06A: Protocol Delta Breach — Action Insert *(JSON title still says "docs only"; historical, the shots are rendered and cut into v3_ax)*

- **Book:** FC-03 Cap.3 L131–L141 (expanded). **Beat:** Action insert: corridor evacuation, Sierra holds the blast threshold, hatch seals (film expansion of Protocol Delta; no new book event).
- **Look:** collapsing corridor, amber, decompression vapor, sweep beams. **JSON status:** `ready_for_render`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S06A-01 | 4:55.32 | 6.04 | Kora Vega, Mileo Chen | Kora hauls Mileo through collapsing corridor as sweep drones silhouette at far junction; dust and sparks; urgency toward sealed hatch. |
| FC-S06A-02 | 5:01.37 | 6.04 | Sierra Catalano | Sierra holds the blast threshold, waving survivors through; pale LEFT cheek scar catching amber; sealed door beginning to close. |
| FC-S06A-03 | 5:07.41 | 6.04 | Kora Vega, Mileo Chen, Sierra Catalano | Trio clears the hatch lip as decompression vapor bursts; Sierra shoves hatch wheel; Kora covers rear with abstract shock pistol; Mileo Coil flares. |
| FC-S06A-04 | 5:13.45 | 6.04 | — | Hatch seals; corridor beyond fills with cold sweep beams and abstract drone shapes; sanctuary side goes quiet — bridge into FC-S07 quiet aftermath. |

### FC-S07: Vent Shaft Vigil — Jump Point

- **Book:** FC-04 Cap.4 L3–L31. **Beat:** Vent vigil (dermal scars, vertigo), Kora at the hatch, «jump point», resonance between them.
- **Look:** amber sodium lamps in vent shaft, chiaroscuro. **JSON status:** `rendered_8_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S07-01 | 5:18.69 | 5.04 | — | Post-Delta quiet: dry biting air in unused vent shaft; amber sodium lamps; brick and steel; sanctuary after eastern breach evacuation |
| FC-S07-02 | 5:23.73 | 5.04 | Mileo Chen | Mileo thumb-traces geometric dermal scars on LEFT forearm; indigo bioluminescent Coil pulses under skin like living neural data refusing to go dark |
| FC-S07-03 | 5:28.77 | 6.04 | Mileo Chen | Mileo sits in shaft penumbra; vivid green eyes; bandaged nape Link scar; post-amputation spatial vertigo — body not yet trusted |
| FC-S07-04 | 5:34.82 | 5.04 | — | Sanctuary air: smell of pulse propellant and scorched boards; cold-sweat of statistical survivors; trust still withheld |
| FC-S07-05 | 5:39.86 | 5.04 | Kora Vega | Shadow cuts across shaft entrance; Kora leans on blast hatch frame arms crossed; copper tactical vest; stubby carbine slung; sodium glow |
| FC-S07-06 | 5:44.90 | 6.04 | Kora Vega, Mileo Chen | It's time, specialist — Sierra wants jump point in five; Mileo stands; body lags will; boots skid on damp concrete before inner ear recalibrates |
| FC-S07-07 | 5:50.94 | 5.04 | Kora Vega, Mileo Chen | Kora locks eyes; pupils constrict; temples faint violet Cascade shimmer resonating with Mileo forearm bio-data — hatred has a scent; different road… |
| FC-S07-08 | 5:55.98 | 6.04 | Kora Vega, Mileo Chen | Let's move — Kora leads; Mileo follows still recalibrating; corridor toward Sierra jump point; surface raid unspoken ahead |

### FC-S08: Sanitation Stack — Node 17 Breach

- **Book:** FC-04 Cap.4 L33–L49. **Beat:** Surface in sanitation jumpsuits, compliant gait, tool cart, drone diamond, 18-second shadow, palm on the Node 17 hatch.
- **Look:** calculated mauve 15:00 surface light, white geometry, sanitation jumpsuits. **JSON status:** `rendered_6_8`.

| Shot | v3_ax TC (clip start on the timeline; the first shot after an AX insert becomes visible 0.8 s later) | Dur (s) | Characters | Action (from scene JSON) |
|---|---|---|---|---|
| FC-S08-01 | 6:10.31 | 5.04 | — | Calculated mauve 15:00 surface light; flawless right angles; desalted fountains; polarized glass facades revealing nothing; sterile compliant silence |
| FC-S08-02 | 6:15.35 | 5.04 | Sierra Catalano | Sierra leads stack in utilitarian sanitation jumpsuit; precise 1.3 paces/sec compliant citizen gait; pale LEFT cheek scar; hazel calculating eyes; … |
| FC-S08-03 | 6:20.39 | 6.04 | Mileo Chen, Riv | Mileo and Riv 1.5m behind Sierra push maintenance tool cart concealing pulse carbines and quantum extraction drives as blocked shapes only no logos… |
| FC-S08-04 | 6:26.43 | 5.04 | Kora Vega | Kora brings up rear; hood drawn low to hide residual indigo eye glimmer; sanitation jumpsuit over copper vest; RIGHT ear ridge glimpsed; bone-condu… |
| FC-S08-05 | 6:31.48 | 5.04 | Kora Vega | Four assault drones in tight diamond; Kora senses Architect pulse — copper wire and burnt sugar; faint violet temple shimmer; cold sweat bead |
| FC-S08-06 | 6:36.52 | 5.04 | Sierra Catalano | Mark — drone thrusters whine; optical pods lock freeze three exact seconds; eighteen-second electronic shadow begins; Sierra subtle bone-conduction… |
| FC-S08-07 | 6:41.56 | 6.04 | Sierra Catalano | Sierra presses gloved palm to titanium access hatch; cloned auth chip in leather cuff fools biometric abstract glow only NO UI text; hatch seam reacts |
| FC-S08-08 | not rendered | — | Sierra Catalano, Mileo Chen, Riv, Kora Vega | Titanium blast hatch parts with decompress hiss; four slip inside before streetlights flare back; stack vanishes into dark threshold — cathedral de… |

## 3. Discrepancies found (report only, nothing changed)

1. **FC-S08:** `scenes/FC-S08.json` status `rendered_6_8` and docs say 6/8, but `renders/FC-S08/FC-S08-07.mp4` exists (2026-09-15) and is in `FC-S08_cut_v2` + v3_ax. Real state: **7/8**; only FC-S08-08 (hatch parts, L49 tail) was never rendered. FC-S09-01 covers that beat as a new shot.
2. **FC-S06A:** JSON status `ready_for_render`, yet its 4 shots are rendered and cut into v3_ax (295.3–319.5 s).
3. **ContinuityGuard pulses** (latest 2026-10-02) scan the old `_cut_v1` 848×480 cuts for FC-S01–S08 (FC-S06A at 1280×720), not v3_ax. Face flags 0; within-shot physics flags mostly on S06/S08. AX pulse 2026-09-23 PASS.
4. **Sierra hair:** lock says short; footage S04–S08 shows dark hair pulled back. New prompts follow the footage ("dark practical commander hair pulled back tight").
5. **Coil colour:** VISUAL_QC 2026-09-24 (L101–L107) flagged FC-S01 as cyan/white, but `edit/project.md` L189 rejected it as a false positive ("Ya es índigo/violeta… No necesita corrección"). Existing footage needs no fix. New prompts keep "indigo, never cyan" only as a precaution.
6. **The film has no dialogue/VO:** v3_ax carries only the EL music bed. The minifilm used English TTS from MANUSCRIPT. The Spanish narration draft (see plan) is new.
7. **Live minifilm vs repo copy:** the public file is 542.1 s; the repo copy at the same path is 530.2 s (see header).
