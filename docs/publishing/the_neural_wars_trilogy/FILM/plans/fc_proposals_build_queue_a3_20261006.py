import json
exec(open("/workspace/fc_s10plus/build/build_proposals.py").read().split("L = [")[0])
shots.clear()
add("PROPOSAL_naomi_lang", "_front_a1", "Front-facing head-and-shoulders portrait of DR. NAOMI LANG, a foreign Alliance scientist: woman in her early 40s, composed and dignified, short practical dark hair, plain grey uniform with a high collar and no insignia, steady intelligent eyes, quiet indomitable dignity. " + REFSTYLE, [], "1:1", "EDICION FC-13 L37-L41 (científica extranjera, dignidad indomable; uniforme gris — plan brief)")
add("PROPOSAL_eli_roth", "_front_a1", "Front-facing head-and-shoulders portrait of ELI ROTH, an ordinary Alliance father in his early 40s: tired kind face, short brown hair, plain knit sweater, holding a mug with both hands, fear in his eyes. Morning grey kitchen light. " + REFSTYLE, [], "1:1", "EDICION FC-10 L35-L56 (padre en la Alianza, aferrado a su taza con miedo)")
add("PROPOSAL_mira_roth", "_front_a1", "Front-facing head-and-shoulders portrait of MIRA ROTH, his daughter, a girl of about eight: wide wondering eyes, tousled hair, simple pajamas, a faint indigo glow reflected in her eyes from a distant horizon, listening to a song only she can hear. " + REFSTYLE, [], "1:1", "EDICION FC-10 L37-L47 (la niña escucha la canción de la ciudad)")
L = [
 ("admin_tower_observation", "observation platform atop the old administration tower at night: titanium railing, the city below a fractal mosaic of gold and indigo lights (#FFD700 / #4B0082), a warm static-charged breeze stirring dust", "EDICION FC-10 L3-L13"),
 ("alliance_residence", "a modest kitchen in a neighbouring Alliance city, early morning grey light, a simple table with two mugs, a window framing a distant indigo glow on the horizon (#4B0082)", "EDICION FC-10 L35-L47"),
 ("east_apartment_dark", "a small dim apartment in the eastern district, blinds drawn, an unmade bed, cold grey light (#708090 / #301934), sweat-damp sheets, oppressive silence", "EDICION FC-08 L43-L47"),
 ("great_council_hall", "great council hall of the new city: living concrete walls with micro-fissures that crack and heal, a long table, lighting shifting between warm amber and indigo (#FFBF00 / #4B0082), bluish haze", "EDICION FC-13 L3-L27"),
 ("renaissance_chamber", "deployment chamber at the top of the central tower: a domed ceiling, a ring of ten harmonic generators around a central dais, space seeming to fold into spirals of indigo and gold light (#4B0082 / #FFD700)", "EDICION FC-15 L3-L11"),
 ("central_market", "the Central Market street at midday: fruit stalls, wicker baskets, citizens as anonymous figures, warm sunlight cutting through steel-grey architecture (#708090), dark surveillance monoliths standing between the stalls", "EDICION FC-15 L19-L21"),
 ("alliance_border_west", "the western border at dawn: an electrified fence line across mud, watchtowers, sentinels in plain dark armour with blank visors as distant anonymous figures, cold dawn light", "EDICION FC-15 L23-L27"),
 ("cosmic_substrate", "deep space quantum substrate: vast crystalline matrices fed by the light of dying stars, immense half-resolved silent observer forms like towering translucent shapes, a tiny blue planet far away", "EDICION FC-00 Prólogo §El Tapiz Eterno; FC-16 L1-L17"),
]
for loc, desc, b in L:
    add("PROPOSAL_LOC_" + loc, "_a1", "Establishing shot: " + desc + ". " + LOCSTYLE, [], "16:9", b)
q = {"queue": "FC_PROPOSALS_QUEUE_A3_20261006", "out_dir": "proposals/20261006",
     "status": "PROPOSAL ONLY (not approved). Completes the proposal set for the remaining gated characters/locations.", "shots": shots}
json.dump(q, open("/workspace/fc_s10plus/build/FC_PROPOSALS_QUEUE_A3_20261006.json", "w"), ensure_ascii=False, indent=1)
print(len(shots))
