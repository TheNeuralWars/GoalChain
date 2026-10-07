import json
exec(open("/workspace/fc_s10plus/build/build_queue_a1.py").read().split("q = {")[0])
a1 = {s["id"]: s for s in shots}
RIVX = "RIV: wiry white European man in his 30s, short light-brown hair, stubble, sleep-deprived red-rimmed eyes, small plain silver compass pendant, grease-stained dark tech layers, fingers with a DULL matte cobalt-blue stain (not glowing); he is NOT East Asian (same face as the man at the console in the reference)"
out = []
def b1(id_, refs, img, vid=None, why=""):
    s = dict(a1[id_]); s.update(out_suffix="_b1", attempt="pass2-1", pilot_refs=refs, image_prompt=img, why=why)
    if vid: s["video_prompt"] = vid + " " + VNEG
    out.append(s)
b1("FC-S10-05", ["renders/FC-S08/FC-S08-07.png", "renders/FC-S06/FC-S06-06.png"],
 P("Tight close-up portrait of SIERRA's face only (head and top of shoulders, both hands OUT of frame, no raised hand, no gesture), three-quarter view, her expression cold, hard and unreadable - natural human skin, NO stone texture, NO cracks. Lit from below by cold blue hologram light, deep shadows; faint reflections of glowing hologram roots in her eyes; eyes turned toward off-screen left. Her pale scar is on her LEFT cheek. Warm amber brick-vault bokeh.",
   [SIERRA_B], "redoubt"),
 "Very slow push in on Sierra's still face; her eyes move from off-screen left to off-screen right without turning her head; the blue hologram light ripples softly over her skin; her jaw tightens. Hands stay out of frame.",
 why="a1 literal stone skin; a2 raised hand (not in L111)")
b1("FC-S10-07", [],
 P("Extreme wide aerial abstraction at night: the dark city of Neo-Citania seen as the cold gaze of a machine - millions of tiny white-blue points of light, one for every mind, scattered across the skyline and linked by hair-thin threads into one perfect mathematical web converging on the central tower needle. In one small district in the middle distance, a soft, faint patch of deep-indigo light glimmers among the white points like a warm ember in cold ash - tiny, abstract, formless. NO face, NO profile, NO head, NO human figure, NO body, no people anywhere.",
   [], "city_night", "Architect presence grammar: system gaze only; no beams.", refs=False),
 "Slow drift high over the glowing web of linked minds; the small indigo glimmer in one district pulses warmly twice, then a cold white ripple runs along the threads and extinguishes it, leaving only the cold white pattern.",
 why="a1 giant humanoid; a2 giant readable woman's profile (must be abstract, never a portrait)")
b1("FC-S10-03", ["renders/FC-S05/FC-S05-01.png", "renders/FC-S06/FC-S06-06.png"],
 P("Wide shot from behind a line of hardened resistance fighters in worn dark combat gear (backs and shoulders in the foreground, three of them visibly recoiling a step back from the table, one raising a hand in shock): above the steel tactical table floats a large translucent blue hologram of the Neo-Citania skyline with an immense luminous tree superimposed on it - glowing indigo-and-blue roots spreading beneath the towers and branches rising above them - and a thin abstract ring of light segments closing around it like a countdown (no digits). On the far side of the table, lit from below: SIERRA, stone-faced; MILEO (bandage at his nape) pointing at the closing ring; KORA; OKAFOR; RIV at a small console.",
   [SIERRA_B, MILEO_B, KORA, OKAFOR, RIVX], "redoubt", "Nobody's skin or wrists glow except Mileo's LEFT forearm."),
 "Slow push in over the shoulders of the recoiling fighters; the countdown ring of light tightens a notch; the tree hologram pulses through its roots; the foreground fighters step back from the table.",
 why="alt: a1 lacks the fighters stepping back (L103) and Riv")
b1("FC-S11-05", ["renders/FC-S08/FC-S08-07.png", "renders/FC-S06/FC-S06-06.png"],
 P("Telephoto medium shot: in a calm orderly plaza SIERRA walks among docile citizens in steel-grey civic clothing, disguised in a plain long grey civic coat, face forward, eyes cutting sideways. In the mid-ground at a clean glass tram stop stands a woman of about thirty in a plain blue administration uniform; in her pupils only an almost imperceptible glint of indigo (her eyes look normal at first glance, no glowing eyes). Above her, two compact matte-grey quadrotor assault drones with four ducted rotors and a dark sensor dome - not airplanes, not jets - descend slowly toward her. Background citizens move with mechanical calm, no principal faces.",
   ["SIERRA (disguised): European-descent woman commander in her mid-30s, dark hair pulled back TIGHT and tied at the nape, hazel eyes, pale scar on her LEFT cheek, plain long grey civic coat, no visible weapon"],
   "plaza", "Drones are unmarked; no text."),
 "The two quadrotor drones descend slowly toward the woman at the tram stop, a faint scanning shimmer from their sensor domes; Sierra keeps walking with the crowd but her eyes lock on the woman; slight rack focus to the woman, whose eyes catch a fleeting indigo glint.",
 why="alt: a1 eyes glow too strongly (book: casi imperceptible), drones read as jets")
b1("FC-S11-08", ["renders/FC-S05/FC-S05-01.png", R+"FC-S09-05_r3.png"],
 P("Medium-wide shot in the infirmary: RIV sits upright on the edge of a steel medical cot facing the camera, jaw clenched in pain, his LEFT leg (on the RIGHT side of the image) extended with the trouser cut open at the thigh; OKAFOR crouches beside that LEFT thigh closing the wound with surgical staples and pressing gel-soaked white gauze over it (no gore, the wound covered by gauze). Standing in the foreground right, SIERRA holds a small bronze memory cylinder in her open palm, weighing it with grave attention as if it were a primed grenade.",
   [RIVX, OKAFOR, SIERRA_B], "lab", "Nobody's hands or skin glow."),
 "Okafor tapes the gauze on Riv's left thigh while Riv winces and grips the cot edge; in the foreground Sierra weighs the bronze cylinder in her palm and closes her fingers around it; slow push.",
 why="alt: a1 leg side ambiguous, Riv's hands glow")
b1("FC-S12-07", [R+"FC-S09-05_r3.png", "renders/FC-S08/FC-S08-07.png"],
 P("Medium two-shot in the emptied council chamber: RIV (on the left of the image, facing the camera) limps toward SIERRA (on the right), favoring his LEFT leg - the white bandage is wrapped around his LEFT thigh, which is on the RIGHT side of the image, through his cut-open trouser leg; his right leg is uninjured. Above the steel table behind them floats a cold blue hologram of a tall featureless monolith tower. Sierra looks at the hologram; for one moment human fatigue shows behind her command mask - shoulders slightly lowered, eyes tired. Chairs pushed back, room empty.",
   [RIVX, SIERRA_B], "redoubt", "The monolith hologram is blank, no text. Nobody's hands glow."),
 why="a1 wrong Riv face; a2 bandage on the RIGHT thigh (book: LEFT, Cap.6 L59)")
b1("FC-S10-06", ["locks/refs/kora_vega/front.png", "renders/FC-S06/FC-S06-06.png"],
 P("Medium close-up of KORA in the deep gloom of the redoubt, facing the camera three-quarter, having just wiped a trace of blood from her face with the back of her right hand (a faint smear left on her cheek, hand lowering at the bottom of frame); her brown eyes with indigo flecks shine with a clear faint deep-indigo glow in the darkness - the fire of someone with nothing left to lose; hard resolute look, a small nod. Warm amber bokeh behind, cold blue hologram light on one side of her face.",
   [KORA], "redoubt", "The indigo glow is only in her eyes; no glowing skin."),
 "Kora lowers her hand from her cheek and gives a slow small nod; her eyes glow faintly deep indigo in the gloom; subtle push in; dust drifts in the amber light.",
 why="alt: a1 eye glow (L115 'ojos brillando en la penumbra') not visible; trailer T29")
q = {"queue": "FC_S10PLUS_QUEUE_B1_20261006", "out_dir": "renders/FC-S10plus_20261006",
     "status": "Pass 2, attempt 1 (_b1): remaining failures + book-fidelity alternates for trailer shots.", "shots": out}
json.dump(q, open("/workspace/fc_s10plus/build/FC_S10PLUS_QUEUE_B1_20261006.json", "w"), ensure_ascii=False, indent=1)
print(len(out))
