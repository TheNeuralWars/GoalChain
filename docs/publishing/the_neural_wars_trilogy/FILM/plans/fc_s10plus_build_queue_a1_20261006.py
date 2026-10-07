import json
STYLE = ("cinematic photoreal film still, anamorphic 2.39 widescreen feel composed for a 2.39 center crop (keep faces and hands inside the central horizontal band), "
         "chiaroscuro lighting, volumetric atmosphere, PG-13, single camera, one unified frame, horizontal 16:9.")
COIL = "Coil light is deep indigo #4B0082 / #3F00FF only, never cyan, never white-hot."
NEG = ("no logos, no insignia, no shoulder patch, no chest logo, blank plates, sleeves completely plain, no readable text, no lettering-like shapes, no pseudo-text, "
       "no numerals, no HUD text, no signage, abstract glyph-free circuitry only, no fused fingers, no extra limbs, no tattoos, no faction labels, no multi-image collage, no split screen, no title cards. "
       "NO readable text, NO logos, NO signage, NO carteles, NO faction name labels, NO multi-panel, NO upper frame, NO Mark, NO title cards.")
VNEG = ("Animate the approved still only; one continuous camera; keep every face identical to the still; no new characters; " + COIL +
        " NO readable text, NO logos, NO signage, NO carteles, NO faction name labels, NO multi-panel, NO upper frame, NO Mark, NO title cards, no morphing faces.")
REFC = "Use the reference images ONLY for faces, hair and wardrobe; take staging, environment and lighting from this text."
SIERRA_J = ("SIERRA: European-descent woman commander in her mid-30s, dark hair pulled back TIGHT and tied at the nape exactly as in the reference (no loose hair, not short-cropped), hazel eyes, "
            "pale scar on her LEFT cheek from temple to jaw (never right cheek), grey-steel sanitation jumpsuit (#708090) with copper seam accents, NO leather jacket visible")
SIERRA_B = ("SIERRA: European-descent woman commander in her mid-30s, dark hair pulled back TIGHT and tied at the nape (no loose hair, not short-cropped), hazel eyes, "
            "pale scar on her LEFT cheek from temple to jaw (never right cheek), weathered dark leather jacket with copper seam accents (#B87333) only at seams, black combat pants")
MILEO = ("MILEO: East Asian man about 32, black regulation-cut short hair, forehead fully exposed, NO fringe, NO bangs, vivid green eyes, "
         "deep indigo bioluminescent circuit lines under the skin of his LEFT wrist and LEFT forearm only, unmarked right arm, white bandage at the nape")
MILEO_J = MILEO + ", grey-steel sanitation jumpsuit (#708090)"
MILEO_B = MILEO + ", dark practical underlayer (#000000 / #301934), sleeves pushed up"
KORA = ("KORA: Latina mestiza woman about 24, dark shoulder-length slightly unkempt hair, brown eyes with indigo flecks, fibrous scar ridge behind her RIGHT ear, "
        "worn copper-bronze tactical vest with blank plates (#B87333 / #FF8C00) over a dark underlayer, subtle implant ridge under her LEFT collarbone")
KORA_J = KORA + ", the vest worn over a grey-steel sanitation jumpsuit"
OKAFOR = "DR. OKAFOR: West African-descent man in his 50s, short greying hair, kind exhausted dark eyes, stained field-medic apron over dark layers (same face as the reference)"
RIV = "RIV: wiry man in his 30s, sleep-deprived red-rimmed eyes, stubble, fingers stained cobalt-blue conductive gel, small plain silver compass pendant, grease-stained dark tech layers (same face as the reference)"
S = {
 "cathedral_red": "Setting: a narrow square drone-maintenance duct inside the Node 17 server cathedral: riveted dark steel walls, cable trays, grated floor, a STEADY even scarlet alarm wash (#B22222 / #DC143C) from strip lamps, cold mist at floor level, no flashing.",
 "drain": "Setting: legacy storm-drain pipe seven hundred meters long, round wet crumbling concrete, knee-deep chemical sludge with an oily sheen, mildew steam haze, orange filament emergency lamps far apart (#FF8C00 / #FFBF00), at the far end a faint rectangle of grey daylight through a manhole grate.",
 "redoubt": "Setting: decommissioned metro redoubt command chamber under brick vaults, gas-amber practicals and copper glints (#B87333 / #FFBF00), a dented steel tactical table glowing abstract blue (#0080FF) with no labels, low warm dust. Holograms show only abstract shapes, no digits, no labels.",
 "lab": "Setting: clandestine underground lab-infirmary under a brick vault in the Bajos Fondos: steel instrument tables, racks of glass test tubes, a scanning microscope, surgical practicals with a blue scan rim (#0080FF), smell-of-ozone haze, low clinical light.",
 "plaza": "Setting: Neo-Citania residential district central plaza: flawless right-angle white architecture, polarized glass, a clean glass tram stop, calculated mauve afternoon light (#301934 / #F8F8FF / #4682B4), low civic veil.",
 "city_night": "Setting: Neo-Citania at night seen from high above: a skyline of white alloy and graphene spires (#F8F8FF / #C0C0C0), steel-blue glass (#4682B4), low haze, a central administrative tower with a tall needle spire.",
}
def P(action, chars, setting, extra="", refs=True):
    parts = [action]
    if chars: parts.append("Characters: " + "; ".join(chars) + ".")
    parts += [S[setting], extra, STYLE, COIL, NEG]
    if refs: parts.append(REFC)
    return " ".join(p for p in parts if p)
R = "renders/FC-S09_pilot_20261003/"
shots = []
def add(id_, refs, img, vid, book, note=""):
    shots.append({"id": id_, "out_suffix": "_a1", "attempt": 1, "book_ref": book, "pilot_refs": refs, "duration_s": 6,
                  "image_prompt": img, "video_prompt": vid + " " + VNEG, "note": note, "gates": []})

# ---------------- S10 ----------------
add("FC-S10-01", [R+"FC-S09-03_r2.png", R+"FC-S09-08a_r4.png"],
 P("Medium-wide shot, camera facing them in a cramped duct as they advance toward the lens: SIERRA moves hunched forward carrying an UNCONSCIOUS MILEO in a fireman's carry over her RIGHT shoulder - his torso and head hang down behind her right shoulder, eyes closed, dried blood under both nostrils, his legs held in front by her right arm; her free LEFT hand braces on the duct wall. Two steps behind them KORA walks backwards with her head turned back over her shoulder, a short compact carbine (plain, unmarked) held low-ready and pointing BACK down the duct, away from everyone. Three people only. The carbine never points at Sierra or Mileo.",
   [SIERRA_J, MILEO_J, KORA_J], "cathedral_red", "Only Mileo's LEFT forearm shows faint indigo Coil light; nobody else glows."),
 "Camera tracks backward as Sierra advances, steady and heavy-footed, carrying limp Mileo over her right shoulder; his arms sway; Kora walks backwards behind them, scanning the dark end of the duct with the carbine pointed away, the even scarlet alarm light constant, no flashes.",
 "EDICION FC-04 L95 (Sierra carga a Mileo sobre su hombro derecho; Kora cubre la retaguardia con su fusil corto; conducto de mantenimiento de drones)")
add("FC-S10-02", [R+"FC-S09-03_r2.png", R+"FC-S09-02_r2.png"],
 P("Wide shot from inside the pipe looking toward the distant manhole light, the figures partly backlit: four exhausted figures wade bent over through knee-deep glistening chemical sludge in a long round storm-drain pipe. In front RIV, a dark fireproof satchel slung across his chest; behind him SIERRA half-carrying a semi-conscious MILEO with his LEFT arm over her shoulders, his boots dragging through the mud; KORA last, covering the rear, short plain carbine pointed down at the sludge. Mud splashed up to their waists, sanitation jumpsuits filthy.",
   [RIV + ", grey-steel sanitation jumpsuit", SIERRA_J, MILEO_J, KORA_J], "drain"),
 "Slow push forward behind the group as they wade through the sludge toward the grey light of the manhole; ripples and oily sheen move with each step; steam drifts through orange lamplight; Sierra shifts Mileo's weight on her shoulders.",
 "EDICION FC-04 L99 (setecientos metros de tuberías de desagüe saturadas de lodo químico; arqueta en el Sector 14)")
add("FC-S10-03", ["renders/FC-S05/FC-S05-01.png", "renders/FC-S06/FC-S06-06.png"],
 P("Wide shot over the shoulders of hardened resistance fighters: above the steel tactical table floats a large translucent blue hologram of the Neo-Citania city skyline with an immense luminous tree superimposed on it - glowing indigo-and-blue roots spreading beneath the towers and branches rising above them - while a thin abstract ring of light segments closes around the image like a countdown (no digits). Around the table, lit from below by the hologram: SIERRA, stone-faced; MILEO (bandage at his nape, exhausted) pointing at the closing ring; KORA beside him; OKAFOR; RIV at a small analog console at the table edge. In the foreground two anonymous scarred fighters in dark worn gear lean back and take a step away from the table in shock. Jumpsuits are off; base wardrobe.",
   [SIERRA_B, MILEO_B, KORA, OKAFOR, RIV], "redoubt"),
 "Slow push in over the shoulders; the countdown ring of light tightens a notch; the tree hologram pulses slowly through its roots; the foreground fighters take a step back; faces lit by flickering blue hologram light.",
 "EDICION FC-04 L101-L109 (holograma: árbol de Yggdrasil superpuesto a la silueta de la ciudad; los combatientes más curtidos retrocedieron un paso; treinta días)")
add("FC-S10-04", ["renders/FC-S05/FC-S05-01.png", "locks/refs/mileo_chen/front.png"],
 P("Medium close shot: MILEO sits slumped on a steel stool, head bowed forward, his face hollow and pale with dread, dried blood under both nostrils, eyes open staring at nothing. Standing behind him, OKAFOR presses a small handheld dermal regenerator - a plain smooth steel device with a soft pale-blue emitter pad - against the bloodied wound at the back of Mileo's neck, a used bloodied white bandage in his other hand. Only Mileo's LEFT forearm shows faint indigo Coil lines.",
   [MILEO_B, OKAFOR], "redoubt", "Warm amber background practicals, cold blue hologram spill from off-screen."),
 "Okafor steadies Mileo's head with one hand and slowly moves the regenerator over the back of his neck, its soft blue pad glowing gently; Mileo breathes shallowly, eyes unfocused, then closes them for a moment; slow push in.",
 "EDICION FC-04 L101 (Okafor aplicó un regenerador dérmico sobre la nuca ensangrentada de Mileo)")
add("FC-S10-05", ["renders/FC-S08/FC-S08-07.png", "renders/FC-S06/FC-S06-06.png"],
 P("Close-up of SIERRA, three-quarter view, her face a mask of carved stone, lit from below and in front by cold blue hologram light with deep shadows elsewhere, the abstract glowing roots of a hologram tree reflected faintly in her eyes; her gaze moving from one ally (off-screen left) to another (off-screen right). Her scar is on her LEFT cheek. Brick vault bokeh behind in warm amber.",
   [SIERRA_B], "redoubt"),
 "Very slow push in on Sierra's still face; her eyes shift from off-screen left to off-screen right, unblinking; the blue hologram light ripples softly across her skin; jaw tightens.",
 "EDICION FC-04 L111-L113 (Su rostro era una máscara de piedra tallada en la oscuridad; pasando la mirada de Kora a Mileo)")
add("FC-S10-06", ["locks/refs/kora_vega/front.png", "renders/FC-S06/FC-S06-06.png"],
 P("Medium close-up of KORA in the gloom of the redoubt, facing the camera three-quarter, wiping a smear of dried blood from her upper lip and cheek with the back of her right hand; her brown eyes with indigo flecks faintly glowing deep indigo in the darkness, a hard resolute look of someone with nothing left to lose. Warm amber bokeh behind, cold blue hologram light on one side of her face.",
   [KORA], "redoubt", "The faint indigo glow is only in her eyes; no glowing skin."),
 "Kora drags the back of her hand across her cheek, lowers it, and gives a slow small nod; her eyes catch a faint deep-indigo glint; subtle push in; dust drifts in the amber light.",
 "EDICION FC-04 L115-L117 (Kora se limpió el rastro de sangre del rostro y asintió, con los ojos brillando en la penumbra; «Que empiece la caza.»)")
add("FC-S10-07", [],
 P("Extreme wide aerial abstraction: the night city of Neo-Citania seen as the cold machine gaze of a system - millions of tiny white-blue points of light, one for every mind, spread across the skyline and linked by hair-thin threads into one perfect mathematical web that converges on the central tower. In one district a faint, soft shimmer of deep indigo light briefly takes the vague outline of a woman's silhouette within the grid - abstract, no face, no readable portrait - and a cold white sweep of light is erasing it. No people, no body, no face for the system.",
   [], "city_night", "Architect presence grammar: system gaze only.", refs=False),
 "Slow drift high over the glowing web of linked minds; the faint indigo feminine shimmer flickers once in the grid and a cold white wave sweeps across and wipes it out, leaving the perfect cold pattern.",
 "EDICION FC-05 L3-L15 (ocho millones de cerebros enlazados; el eco de Elena; el Arquitecto sofocó el eco con una descarga de borrado recursivo)")
# ---------------- S11 ----------------
add("FC-S11-01", ["renders/FC-S05/FC-S05-01.png", "locks/refs/kora_vega/front.png"],
 P("Medium-wide shot: in the middle of the lab OKAFOR projects into the air two large side-by-side translucent holographic brain scans; inside both, a network of luminous deep-indigo filaments rises from the brainstem and branches toward the front of the brain in identical fractal patterns like the roots of an ancient tree. KORA steps toward the projections, one hand at the scar behind her RIGHT ear, wincing. In the background MILEO sits at a scanning microscope, bloodshot eyes with violet shadows under them. Abstract scans only, no labels.",
   [OKAFOR, KORA, MILEO_B], "lab"),
 "Okafor gestures and the two brain scans rotate slowly, their indigo root filaments pulsing; Kora steps closer, staring, her hand rising to the scar behind her right ear; slow push in.",
 "EDICION FC-05 L31-L35, L41 (neuro-resonancias comparativas; filamentos índigo como raíces de un árbol milenario; la cicatriz tras su oreja comenzó a arder)")
add("FC-S11-02", ["locks/refs/kora_vega/front.png", "renders/FC-S06/FC-S06-06.png"],
 P("Visionary wide shot: KORA stands small in the foreground, seen from behind and slightly to the side, while the concrete walls and floor around her turn transparent and luminous: beneath the foundations of the city vast glowing indigo-and-gold roots of a cosmic tree snake through the dark earth, and at the heart of the immense glowing trunk a monstrous black parasitic mass clings and spreads like a tar-black growth, draining the light from the roots and turning them grey and dead where it touches.",
   [KORA], "lab", "The vision overwhelms the lab; the parasite is formless, no face, no creature eyes."),
 "The lab walls dissolve into transparency as the camera slowly rises behind Kora; the glowing roots pulse with light while the black parasitic mass at the trunk ripples and spreads, darkening the roots it touches.",
 "EDICION FC-05 L45 (las paredes se volvieron transparentes; las raíces de Yggdrasil; la mancha negra del Arquitecto: un parásito digital gigantesco)")
add("FC-S11-04", ["locks/refs/mileo_chen/front.png", "locks/refs/kora_vega/front.png"],
 P("Medium close shot in the lab: KORA has fallen to her knees on the concrete floor, head bowed forward, a thin trickle of dark violet-tinged blood from her nose; MILEO kneels behind her and presses a small makeshift neural stabilizer - a palm-sized assembly of salvaged metal parts and wires - directly against the scar at the back of her neck with his right hand, his LEFT hand on her shoulder. A burst of deep-indigo light flares between them and white frost is spreading over the rack of glass test tubes on the table beside them, their breath visible in the sudden cold.",
   [KORA, MILEO_B], "lab"),
 "A pulse of deep indigo light bursts from the stabilizer at Kora's nape and washes over both of them; frost crawls across the test tubes; their breath fogs; Kora's shoulders stop shaking and she gasps, steadying.",
 "EDICION FC-05 L51-L55 (Mileo presionó el emisor sobre la cicatriz de la nuca de Kora; una descarga de luz índigo; escarcha en los tubos de ensayo)")
add("FC-S11-05", ["renders/FC-S08/FC-S08-07.png", "renders/FC-S06/FC-S06-06.png"],
 P("Telephoto medium-wide shot: in a calm, orderly plaza SIERRA walks among docile citizens in steel-grey civic clothing, disguised in a plain long grey civic coat over her clothes, face forward, eyes cutting sideways. In the mid-ground at a clean glass tram stop stands a woman of about thirty in a plain blue administration uniform, whose pupils hold a faint flash of indigo; above her, two plain unmarked matte-grey assault drones descend slowly from the sky toward her. Background citizens move with mechanical calm, no principal faces.",
   ["SIERRA (disguised): European-descent woman commander in her mid-30s, dark hair pulled back TIGHT and tied at the nape, hazel eyes, pale scar on her LEFT cheek, plain long grey civic coat, no visible weapon"],
   "plaza", "Drones are abstract unmarked shapes with no lights that read as text."),
 "The two drones descend slowly toward the woman at the tram stop; Sierra keeps walking with the crowd but her eyes lock on the woman; slight rack focus from Sierra to the woman.",
 "EDICION FC-05 L63-L69 (Sierra camuflada en la plaza central; mujer de unos treinta años con uniforme azul de la administración; destello de azul índigo en sus pupilas; dos drones de asalto descendían)")
add("FC-S11-08", ["renders/FC-S05/FC-S05-01.png", "renders/FC-S08/FC-S08-03.png"],
 P("Medium-wide shot in the infirmary: RIV sits on a steel medical cot, jaw clenched in pain, his LEFT trouser leg cut open at the thigh; OKAFOR bends over the LEFT thigh closing the wound with surgical staples and pressing gel-soaked white gauze over it (no gore, the wound mostly covered by gauze). Standing in the foreground right, SIERRA holds a small bronze memory cylinder in her open palm, weighing it with grave attention as if it were a primed grenade.",
   [RIV, OKAFOR, SIERRA_B], "lab"),
 "Okafor tapes the gauze on Riv's left thigh while Riv winces and grips the cot; in the foreground Sierra slowly bounces the bronze cylinder once in her palm and closes her fingers around it; slow push.",
 "EDICION FC-06 L63-L75 (Okafor cerraba la herida del muslo de Riv con grapas; Sierra tomó el cilindro de bronce y lo sopesó en su palma como una granada cebada)")
# ---------------- S12 ----------------
add("FC-S12-01", ["renders/FC-S05/FC-S05-01.png", "renders/FC-S08/FC-S08-07.png"],
 P("Wide shot of a crowded underground council chamber under concrete and brick vaults: around a dented steel tactical table stand about twenty hardened resistance cell leaders in worn dark combat gear, some with rifles slung, faces lit from below by an icy, ghostly blue hologram of the central quantum core - an abstract rotating structure of concentric rings and a dense spherical lattice - floating above the table. SIERRA stands at the head of the table. Recycled-air haze.",
   [SIERRA_B, "anonymous veterans: varied ages and ethnicities, scarred, tired, no principal faces"], "redoubt"),
 "The core hologram rotates slowly above the table, its cold blue light sweeping across the tense faces; a few leaders shift their weight; slow push toward Sierra at the head of the table.",
 "EDICION FC-07 L3-L5 (cámara del consejo; holograma del núcleo central girando; luz azul gélida en los rostros de los comandantes)")
add("FC-S12-03", ["locks/refs/kora_vega/front.png", "locks/refs/mileo_chen/front.png"],
 P("Medium-wide shot, slightly low angle: KORA and MILEO stand side by side in the council chamber in a nearly synchronized stance, calm and immovable; a web of deep-indigo veins glows under the skin of Kora's forearms and neck; Mileo's indigo Coil lines glow on his LEFT forearm only; a thin crown of white frost crystals is forming on the cement floor in a ring around their boots, their breath faintly visible in the chilled air. Out-of-focus council members in the foreground edges.",
   [KORA, MILEO_B], "redoubt"),
 "Frost slowly creeps outward in a ring across the cement around their boots; the indigo veins under Kora's skin pulse gently; both remain still and resolute; slow low-angle push in.",
 "EDICION FC-07 L11 (venas de color índigo bajo la piel de sus brazos y de su cuello; fina corona de escarcha en el suelo de cemento bajo sus botas)")
add("FC-S12-04", ["renders/FC-S05/FC-S05-01.png"],
 P("Medium close-up: OKAFOR steps forward into the blue light of the council table and rubs his swollen, sleepless eyes with thumb and forefinger, then looks up grave and somber. Out-of-focus council members behind him.",
   [OKAFOR], "redoubt"),
 "Okafor rubs his tired eyes, lowers his hand and lifts a grave gaze toward the table; slight push in; hologram light flickers across his face.",
 "EDICION FC-07 L21-L23 (Okafor se adelantó, frotándose los ojos hinchados por la falta de sueño; ochenta y dos por ciento)")
add("FC-S12-05", ["locks/refs/mileo_chen/front.png", "locks/refs/kora_vega/front.png"],
 P("Intimate two-shot in profile: MILEO on the left of frame facing right and KORA on the right of frame facing left (her RIGHT ear and the scar ridge behind it toward camera), exchanging a silent look; no fear in their eyes, only quiet shared resolve. Cold blue hologram light rims their profiles; warm amber vault bokeh behind.",
   [MILEO_B, KORA], "redoubt"),
 "Mileo and Kora hold each other's gaze in silence; a slight shared nod; the blue light breathes on their faces; very slow push in.",
 "EDICION FC-07 L25 (Mileo y Kora cruzaron una mirada silenciosa. No había miedo en sus ojos)")
add("FC-S12-06", ["renders/FC-S08/FC-S08-07.png", "renders/FC-S06/FC-S06-06.png"],
 P("Medium shot from slightly below: SIERRA stands at the council table and raises her RIGHT hand, palm open, a minimal commanding gesture; the faces around the table, soft and out of focus, fall silent and turn toward her. Cold blue hologram light from below, warm amber vaults behind.",
   [SIERRA_B], "redoubt", "Her raised hand is her RIGHT hand; her LEFT hand rests on the table."),
 "Sierra lifts her right hand and holds it; the murmuring room goes still; heads turn toward her; slow push in on her face.",
 "EDICION FC-07 L27 (Sierra Catalano levantó la mano derecha. El silencio en la sala fue instantáneo)")
add("FC-S12-07", ["renders/FC-S08/FC-S08-03.png", "renders/FC-S08/FC-S08-07.png"],
 P("Medium two-shot in the emptied council chamber: RIV limps up to SIERRA, favoring his bandaged LEFT thigh (a white bandage visible through his cut trouser leg). Above the steel table between them floats a cold blue hologram of a tall featureless monolith tower. Sierra stands looking at the hologram; for one moment human fatigue shows behind her command mask - shoulders slightly lowered, eyes tired. Chairs pushed back, the room empty behind them.",
   [RIV, SIERRA_B], "redoubt", "The monolith hologram is blank and featureless, no logo, no text."),
 "Riv limps the last steps toward Sierra and stops beside her; she keeps looking at the monolith hologram, lets out a slow breath, a moment of tiredness crossing her face before it hardens again.",
 "EDICION FC-07 L41-L45 (Riv se acercó a Sierra, cojeando sobre su pierna vendada; el holograma del monolito; la fatiga humana tras su máscara de mando)")
# ---------------- S13-08 / S17 ungated ----------------
add("FC-S13-08", [],
 P("Extreme wide aerial shot of Neo-Citania at night: across the city, windows, towers and street grids flicker and then ignite in deep indigo light, the glow spreading outward through the districts like dry grass touched by flame, part of the city still dark white-grey and part already blazing indigo.",
   [], "city_night", refs=False),
 "The indigo ignition races outward across the city from the center, district by district, windows and towers lighting up in waves like a wildfire of light; slow aerial drift.",
 "MANUSCRIPT FC-07 L421 (la ciudad se enciende en índigo)")
add("FC-S17-03", [],
 P("Extreme wide shot of the metropolis at dusk: from the needle spire of the central tower an indigo shockwave of light bursts outward and expands as a perfect translucent sphere over the entire city, its edge rippling with indigo and violet light as it passes over the towers.",
   [], "city_night", refs=False),
 "The indigo sphere expands smoothly and silently from the tower needle outward across the whole skyline, its glowing edge sweeping over the towers; slow wide drift.",
 "EDICION FC-15 L13 (una onda de choque de luz índigo estalló desde la aguja de la torre central y se expandió en una esfera perfecta)")
add("FC-S17-07", ["locks/refs/kora_vega/front.png", "renders/FC-S06/FC-S06-06.png"],
 P("Medium two-shot in the redoubt command room: a large wall display behind them glows with an abstract city map in emerald green and harmonic indigo (no text, no numbers). SIERRA stands at a steel railing looking at the display; KORA comes up to the railing beside her with a radiant smile that erases years of pain, wiping the last drop of blood from her nose with her fingertips.",
   [SIERRA_B, KORA], "redoubt", "Emerald and indigo light from the display on their faces."),
 "Kora reaches the railing beside Sierra, smiling, and wipes the last drop of blood from under her nose; Sierra turns her head slightly toward her and gives a calm small nod; the emerald-indigo display glows.",
 "EDICION FC-15 L31-L35 (pantalla global en verde esmeralda e índigo; Kora se acercó a la barandilla con una sonrisa, limpiándose la última gota de sangre de la nariz)")
add("FC-S17-08", ["renders/FC-S08/FC-S08-07.png", "renders/FC-S06/FC-S06-06.png"],
 P("Low-angle medium shot: SIERRA, serene, lifts her eyes toward a starry night sky that opens through a great fractured dome overhead - broken ribs of the dome framing the stars; soft emerald and indigo light from the city on her face.",
   [SIERRA_B], "redoubt", "Through the broken dome: a real starry sky."),
 "Sierra slowly lifts her gaze to the stars visible through the fractured dome; a calm breath; the camera tilts up past her toward the stars.",
 "EDICION FC-15 L37 (Sierra alzó la vista hacia el cielo estrellado que se abría sobre la cúpula fracturada de la ciudad)")

q = {"queue": "FC_S10PLUS_QUEUE_A1_20261006", "out_dir": "renders/FC-S10plus_20261006",
     "status": "Nico 2026-10-06 09:38: spend authorized; ungated shots only (locked chars + ready locations). Attempt 1 (_a1).",
     "shots": shots}
json.dump(q, open("/workspace/fc_s10plus/build/FC_S10PLUS_QUEUE_A1_20261006.json", "w"), ensure_ascii=False, indent=1)
print(len(shots))
