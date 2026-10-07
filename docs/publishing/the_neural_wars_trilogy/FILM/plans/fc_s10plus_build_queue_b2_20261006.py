import json
exec(open("/workspace/fc_s10plus/build/build_queue_a1.py").read().split("q = {")[0])
a1 = {s["id"]: s for s in shots}
out = []
def b(id_, sfx, refs, img, vid=None, why=""):
    s = dict(a1[id_]); s.update(out_suffix=sfx, attempt="pass2", pilot_refs=refs, image_prompt=img, why=why)
    if vid: s["video_prompt"] = vid + " " + VNEG
    out.append(s)
b("FC-S11-02", "_b1", ["locks/refs/kora_vega/front.png", "renders/FC-S06/FC-S06-06.png"],
 P("Visionary wide shot: KORA stands small in the foreground, seen from behind and slightly to the side, while the concrete walls and floor of the lab turn transparent and luminous: beneath the foundations of the city vast glowing indigo-and-gold roots of a cosmic tree snake through the dark earth up into an immense glowing trunk; wrapped around the heart of the trunk is a black digital parasite - an abstract mass of black geometric data-tendrils, crystalline black lattice and cold dead code, like a tar-black circuit growth - draining the light, the roots turning grey and dead where it touches. The parasite is abstract and geometric: NO hair, NO head, NO face, NO creature, NO eyes, NO animal.",
   [KORA], "lab"),
 "The lab walls dissolve into transparency as the camera slowly rises behind Kora; the glowing roots pulse while the black geometric parasite lattice tightens around the trunk and spreads, greying the roots it touches.",
 why="Hermes R12: a1 parasite reads as a hairy head/creature")
b("FC-S17-03", "_b1", [],
 P("Extreme wide shot of the whole metropolis at dusk from far away: from the needle spire of the central tower a translucent indigo shockwave has burst outward and stands as a PERFECT FULL SPHERE of light - a giant glowing bubble centred on the needle tip, its curved shell rising high above the tallest towers and descending into the city on all sides, its edge rippling with indigo and violet light; city lights below catching the glow.",
   [], "city_night", refs=False),
 "The perfect indigo sphere expands smoothly from the needle tip, its curved glowing shell growing outward over the entire skyline and passing through the towers; slow wide drift.",
 why="Hermes R12: a1 reads as a flat disc, not 'esfera perfecta' (Cap.15 L13)")
b("FC-S17-08", "_b1", ["renders/FC-S08/FC-S08-07.png", R + "FC-S09-08b_r4retry.png"],
 P("Medium close shot from a low three-quarter angle: SIERRA, serene, lifts her eyes toward a starry night sky that opens through a great fractured dome overhead - broken ribs of the dome framing the stars; soft emerald and indigo light from below on her face. Her face exactly as in the reference images (same woman: European-descent, mid-30s, hazel eyes, pale scar on her LEFT cheek, dark hair pulled back tight and tied).",
   [SIERRA_B], "redoubt", "Through the broken dome: a real starry sky."),
 "Sierra slowly lifts her gaze to the stars visible through the fractured dome; a calm breath; the camera tilts up past her toward the stars.",
 why="Hermes R12: a1 Sierra identity drift vs S08")
q = {"queue": "FC_S10PLUS_QUEUE_B2_20261006", "out_dir": "renders/FC-S10plus_20261006",
     "status": "Pass 2 attempt 1 (_b1) for Hermes R12 'hold for cleanup' shots.", "shots": out}
json.dump(q, open("/workspace/fc_s10plus/build/FC_S10PLUS_QUEUE_B2_20261006.json", "w"), ensure_ascii=False, indent=1)
print(len(out))
