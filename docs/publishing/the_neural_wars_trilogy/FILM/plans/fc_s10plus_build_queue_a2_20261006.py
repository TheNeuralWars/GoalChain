import json, sys
sys.path.insert(0, "/workspace/fc_s10plus/build")
exec(open("/workspace/fc_s10plus/build/build_queue_a1.py").read().split("q = {")[0])  # reuse blocks + a1 shots
a1 = {s["id"]: s for s in shots}
RIVX = "RIV: wiry white European man in his 30s, short light-brown hair, stubble, sleep-deprived red-rimmed eyes, small plain silver compass pendant, grease-stained dark tech layers, fingers with a DULL matte cobalt-blue stain (not glowing); he is NOT East Asian and does not look like Mileo (same face as the man at the console in the reference)"
out = []
def a2(id_, refs, img, vid=None, why=""):
    s = dict(a1[id_]); s.update(out_suffix="_a2", attempt=2, pilot_refs=refs, image_prompt=img, a1_fail=why)
    if vid: s["video_prompt"] = vid + " " + VNEG
    out.append(s)
a2("FC-S10-01", ["renders/FC-S08/FC-S08-07.png", R+"FC-S09-08a_r4.png"],
 P("EXACTLY THREE PEOPLE in a cramped duct, camera facing them as they come toward the lens: SIERRA in front, hunched, carrying the UNCONSCIOUS MILEO in a fireman's carry over her RIGHT shoulder - Mileo is NOT walking: his limp torso, head and arms hang down behind her RIGHT shoulder, which is on the LEFT side of the image; his eyes closed, dried blood under both nostrils; her right arm wraps his legs in front of her chest; her free LEFT hand braces on the duct wall. Behind them KORA walks backwards, head turned to look back over her shoulder, a short plain compact carbine held low and pointing BACK down the duct away from everyone. Only ONE Mileo exists in the frame and he is being carried.",
   [SIERRA_J + ", plain dark gloves, nothing glowing on her hands or wrists", MILEO_J, KORA_J], "cathedral_red", "Only Mileo's LEFT forearm shows faint indigo Coil light; Sierra and Kora have NO glow on wrists, hands or gloves."),
 why="a1: Mileo duplicated (one walking + one carried), carried over LEFT shoulder, Sierra wrist glow")
a2("FC-S10-04", ["renders/FC-S05/FC-S05-01.png", "locks/refs/mileo_chen/front.png"],
 P("Medium close shot from a three-quarter REAR angle: MILEO sits slumped on a steel stool, head bowed forward exposing the BACK of his neck, his face visible in three-quarter profile, hollow and pale with dread, dried blood under both nostrils. Standing behind him, OKAFOR presses a small handheld dermal regenerator - a plain smooth steel device with a soft pale-blue emitter pad - onto the bloodied wound at the back of Mileo's neck, the NAPE just below the hairline (not the throat, not the side); a used bloodied white bandage in Okafor's other hand. Mileo's throat and collar are clean.",
   [MILEO_B, OKAFOR], "redoubt", "Warm amber background practicals, cold blue hologram spill from off-screen."),
 why="a1: device at side of neck, bandage on throat instead of the nape (L101 'nuca')")
a2("FC-S10-05", ["renders/FC-S08/FC-S08-07.png", "renders/FC-S06/FC-S06-06.png"],
 P("Close-up of SIERRA, three-quarter view, her expression cold, hard and unreadable as if carved from stone - this is only her expression: natural human skin, NO stone texture, NO cracks, NO statue, NO paint. Lit from below and in front by cold blue hologram light with deep shadows elsewhere, faint reflections of glowing hologram roots in her eyes; her gaze moving from one ally off-screen left to another off-screen right. Her pale scar is on her LEFT cheek. Brick vault bokeh behind in warm amber.",
   [SIERRA_B], "redoubt"),
 why="a1: 'máscara de piedra' rendered literally as cracked stone skin")
a2("FC-S10-07", [],
 P("Extreme wide aerial abstraction at night: the city of Neo-Citania seen as the cold machine gaze of a system - millions of tiny white-blue points of light, one for every mind, spread over the dark skyline and linked by hair-thin threads into one perfect mathematical web converging on the central tower needle. In the mid-distance, within the web, a faint translucent wisp of deep-indigo light, no bigger than a single city block, briefly suggests the soft outline of a woman's profile made only of light threads - subtle, ghostly, almost not there; NO giant figure, NO body standing in the city, NO hood, NO face details, no people anywhere.",
   [], "city_night", "Architect presence grammar: system gaze only; no beams.", refs=False),
 "Slow drift high over the glowing web of linked minds; the faint indigo wisp flickers for a moment in the grid, then a cold white ripple runs along the threads and erases it, leaving the perfect cold pattern.",
 why="a1: the echo rendered as a giant hooded humanoid of lights standing in the city")
a2("FC-S12-03", ["locks/refs/kora_vega/front.png", "locks/refs/mileo_chen/front.png"],
 P("Medium-wide shot, slightly low angle: KORA (left) and MILEO (right) stand side by side in the council chamber in a nearly synchronized stance, calm and immovable. Kora wears her copper-bronze vest; MILEO wears a plain dark long-sleeved tunic with sleeves pushed up - NO vest, NO armor, NO copper on Mileo. A web of deep-indigo veins glows under the skin of Kora's forearms and neck; Mileo's indigo Coil lines glow on his LEFT forearm only, his RIGHT forearm is plain unmarked skin. A thin crown of white frost crystals forms on the cement floor in a ring around their boots, breath faintly visible. Out-of-focus council members at the frame edges.",
   [KORA, MILEO_B.replace("dark practical underlayer (#000000 / #301934), sleeves pushed up", "plain dark long-sleeved tunic, sleeves pushed up, no vest")], "redoubt"),
 why="a1: Mileo wears Kora's copper vest; glow on both of Mileo's forearms")
a2("FC-S12-07", [R+"FC-S09-05_r3.png", "renders/FC-S08/FC-S08-07.png"],
 P("Medium two-shot in the emptied council chamber: RIV limps up to SIERRA, favoring his bandaged LEFT thigh (a white bandage visible through his cut-open trouser leg). Above the steel table between them floats a cold blue hologram of a tall featureless monolith tower. Sierra stands looking at the hologram; for one moment human fatigue shows behind her command mask - shoulders slightly lowered, eyes tired. Chairs pushed back, the room empty behind them.",
   [RIVX, SIERRA_B], "redoubt", "The monolith hologram is blank and featureless, no logo, no text. Nobody's hands glow."),
 why="a1: Riv rendered East-Asian/Mileo-like (wrong face), glowing hands")
q = {"queue": "FC_S10PLUS_QUEUE_A2_20261006", "out_dir": "renders/FC-S10plus_20261006",
     "status": "Attempt 2 (_a2) for a1 still failures (Grok Bot visual QC; Hermes R12 confirmation pending).", "shots": out}
json.dump(q, open("/workspace/fc_s10plus/build/FC_S10PLUS_QUEUE_A2_20261006.json", "w"), ensure_ascii=False, indent=1)
print(len(out))
