import json
exec(open("/workspace/fc_s10plus/build/build_proposals.py").read().split("L = [")[0])
shots.clear()
MF = "proposals/20261006/PROPOSAL_martin_catalano_front_a1.png"
KEEP = " Same man as the reference image: identical face, hair, age and build."
add("PROPOSAL_martin_catalano", "_profile_a2", "Left-facing strict profile head-and-shoulders portrait of " + MARTIN + ", the faint healed Link scar at the base of the skull visible at the nape." + KEEP + " " + REFSTYLE, [MF], "1:1", "consistency pass from front_a1")
add("PROPOSAL_martin_catalano", "_fullbody_a2", "Full-body standing portrait of " + MARTIN + ", grey-lavender patient tunic and loose matching trousers, soft slippers, standing relaxed." + KEEP + " " + REFSTYLE, [MF], "9:16", "consistency pass from front_a1")
add("PROPOSAL_martin_catalano", "_postcascade_a2", "Close-up head-and-shoulders portrait of " + MARTIN + " after the Cascade: a permanent THIN, crisp ring of violet-indigo light (#4B0082 / #8A2BE2) glows around the outer edge of each DARK brown iris only - the eyelids, skin and whites of the eyes are natural, no eyeshadow glow, no glowing skin; pupils slightly dilated with wonder; his crooked mischievous half-smile." + KEEP + " " + REFSTYLE, [MF], "16:9", "EDICION FC-12 L39 / FC-14 L37 / FC-14 L45")
add("PROPOSAL_martin_catalano", "_threequarter_a2", "Three-quarter view head-and-shoulders portrait of " + MARTIN + ", gentle crooked smile, eyes slightly toward camera." + KEEP + " " + REFSTYLE, [MF], "1:1", "consistency pass from front_a1")
add("PROPOSAL_elena_vasquez", "_lightbeing_a2", "Full-figure portrait of DR. ELENA VASQUEZ as a manifestation of living light standing in a dark cobbled street among awed silhouettes: a woman in her late 40s with a kind, wise, softly readable face, her whole body made of translucent refracted deep-indigo light like light through a prism, hair drifting as if underwater, feet hovering a few centimetres above the cobblestones, a glittering trail of white frost on the cobbles behind her; warm, human, serene; NO capsule, NO oval frame, NO screen, NO wires, NOT a machine. " + REFSTYLE.replace("neutral dark-grey seamless studio background", "dark night street background"), [], "9:16", "EDICION FC-08 L33-L35")
add("PROPOSAL_jansen", "_profile_a2", "Right-facing profile head-and-shoulders portrait of JANSEN, a hard old resistance combatant in his late 50s, cropped grey hair, grizzled stubble, the thick scar above his RIGHT ear running into the temple clearly visible, worn dark combat jacket." + KEEP + " " + REFSTYLE, ["proposals/20261006/PROPOSAL_jansen_front_a1.png"], "1:1", "EDICION FC-07 L7 / FC-11 L19 / FC-13 L11")
q = {"queue": "FC_PROPOSALS_QUEUE_A2_20261006", "out_dir": "proposals/20261006",
     "status": "PROPOSAL ONLY (not approved). Consistency pass anchored on front_a1.", "shots": shots}
json.dump(q, open("/workspace/fc_s10plus/build/FC_PROPOSALS_QUEUE_A2_20261006.json", "w"), ensure_ascii=False, indent=1)
print(len(shots))
