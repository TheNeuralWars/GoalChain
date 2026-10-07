#!/usr/bin/env python3
"""Generate the 9 CONFLICT-KNOT key arts for the Fractured Code mini-film.

Each knot stages the dramatic turning point of one or more book chapters with the
book's OWN dialogue. Everything runs through grok-imagine-image (now authenticated),
so the look matches the material the film was already built from.

HARD RULE (non-negotiable, verified to matter): NO readable text/letters/numbers/logos
in any frame. Past failures came from prompt words that the model turned into on-image
brand text ("QUANTUM", "D-WAVE", "SIERRA MARK", "Resistencia" burned into wardrobe).
Every prompt below therefore bans text explicitly AND avoids words the renderer tends
to letter.

LOOK SPEC (from a real FC frame, reverse-engineered): burnt orange/amber key light with
a neon accent, extreme key/fill contrast around 10:1, crushed blacks, fine grain,
sharp foreground with defocused background.
"""
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error

AUTH = os.path.expanduser("~/.grok/auth.json")
OUT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/knots"

LOOK = ("cinematic science-fiction noir still, photoreal, burnt orange and amber key light "
        "with one cold neon accent, extreme chiaroscuro key to fill ratio 10 to 1, crushed "
        "blacks, fine film grain, sharp foreground and defocused background, anamorphic "
        "composition, shallow depth of field. Absolutely no text, no letters, no numbers, "
        "no logos, no signage, no captions, no watermarks, no subtitles, no readable writing anywhere.")

# id -> (chapter, beat, prompt, dialogue_lines)
KNOTS = [
    ("K1_soul_harvester", "FC-04",
     "A gaunt young man in a dark workshop stares at his own reflection in a black monitor, "
     "face lit from below by a failing screen, realization and disgust on his face. Behind him, "
     "rows of human silhouettes stand in pods, faint indigo light in their chests. Cold and warm "
     "light meeting on his face. " ,
     ["Takes one to know one. You didn't sign up to build a soul-harvester.",
      "I didn't ask for my family to get optimized into strangers. Different paths, same shit-pile."]),

    ("K2_the_fracture", "FC-06",
     "A tense war room around a scratched metal table lit by a single hanging lamp. Eight people "
     "split into two spatial camps at opposite ends of the table, body language in open opposition. "
     "A scarred man with a shaved head stands, one fist on the table, mid-argument. Holographic map "
     "light spills upward across their faces. " ,
     ["You realize you're arguing for exactly what the Architect wants.",
      "Connection instead of optimization. We fought against one system controlling our minds, "
      "now you want us to surrender to another?"]),

    ("K3_the_vow", "FC-07",
     "A woman soldier alone in dim emergency lighting, holding a small worn photograph in her palm, "
     "head bowed, lips barely parted. The photograph is face-down toward the camera and blank, no image "
     "visible on it. Tears catching amber light. Extreme close, intimate. " ,
     ["I'll find you. Whatever's left of you. I promise.",
      "I won't let you sink. I promise."]),

    ("K4_the_words", "FC-09",
     "A doctor in a stained coat sits on the floor of a dim clinic, hands over his face, shoulders "
     "shaking. A small empty chair opposite him. Cold light through slatted blinds makes bars across "
     "the floor. Grief and guilt. " ,
     ["Please don't make me forget the words.",
      "That's all he said, over and over. The words. I took his words."]),

    ("K5_not_me_afterward", "FC-10",
     "Two children seen from behind, climbing high branches of an enormous tree at dusk, silhouetted "
     "against a burning orange sky. The older child reaches back a steady hand to the younger one. "
     "Vertigo, height, tenderness. Nostalgic and warm against cold memory. " ,
     ["Don't look down until you're ready.",
      "Focus on where you're going, not how far you've come.",
      "What if I'm not me afterward?"]),

    ("K6_the_counterattack", "FC-11",
     "A vast server chamber rupturing: crystalline columns cracking with hairline fractures of white "
     "light, an emergency lamp torn half from the ceiling trailing sparks, every screen blown to blank "
     "white glare. A woman stands braced against the blast, hair and coat driven back. Catastrophic "
     "system failure. " ,
     ["All districts reporting escalation parameters.",
      "We're losing integration stability across thirty-seven percent of transformed architecture."]),

    ("K7_the_chair", "FC-14",
     "THE CLIMAX. A man sits in an activation chair at the center of a dark spherical chamber, cables "
     "rising from his shoulders to the ceiling, eyes open and luminous with calm wonder. A woman leans "
     "toward him, hand half-raised, torn between protocol and love. Behind glass, a doctor and a "
     "specialist watch instruments. Energy blooming upward like a slow sunrise. " ,
     ["Implementation parameters calibrated to optimal configuration. Martin, confirm readiness protocol.",
      "I perceive everything.",
      "Martin, do you maintain identity cohesion? Are you still you?",
      "I know exactly who I am. More completely than optimization ever permitted."]),

    ("K8_make_it_stop", "FC-15",
     "A middle-aged man on his knees on a wet plaza at night, both hands pressed to his temples, face "
     "contorted, mouth open in a gasp. Around him, other people are doubled over or frozen mid-step. "
     "Rain and light refracting off the ground. Overwhelming sensory flood. " ,
     ["Make it stop.",
      "It doesn't merely expand perception. It transforms existence."]),

    ("K9_the_invitation", "FC-16",
     "Enormous silent cosmic observers, forms only half-resolvable, standing in deep space before a "
     "luminous threshold of light. Vast scale, tiny distant Earth reflected in the light. Patient, "
     "ancient, waiting. Awe and stillness. " ,
     ["The invitation awaits. The choice remains.",
      "Will you join the conversation that has continued since stars first ignited?"]),
]


def token():
    d = json.load(open(AUTH))
    for k, v in d.items():
        if isinstance(v, dict):
            for kk, vv in v.items():
                if kk == "key" and isinstance(vv, str) and len(vv) > 40:
                    return vv
    raise SystemExit("no key in ~/.grok/auth.json")


def download(url, dest):
    """Cloudflare error 1010 blocks urllib's default User-Agent on imgen.x.ai, so
    urlretrieve() fails even when the generation succeeded. novel_film_builder.py
    sends a Mozilla UA for downloads -- do the same."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())
    return os.path.getsize(dest)


def gen_image(prompt, dest, tok, retries=4):
    body = {"model": "grok-imagine-image",
            "prompt": prompt + ", cinematic lighting, 8k detail"}
    # 403 here is a TRANSIENT rate limit (verified: the same prompt returns 200
    # seconds later), not a content refusal. Back off hard instead of burning retries.
    backoff = [10, 25, 50, 90]
    for a in range(retries + 1):
        try:
            req = urllib.request.Request(
                "https://api.x.ai/v1/images/generations",
                data=json.dumps(body).encode(),
                headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
            j = json.load(urllib.request.urlopen(req, timeout=240))
            u = (j.get("data") or [{}])[0].get("url")
            if not u:
                raise RuntimeError(f"no url in {list(j)}")
            download(u, dest)
            return True
        except Exception as e:
            print(f"     intento {a+1} falló: {type(e).__name__}: {str(e)[:160]}")
            if a < retries:
                w = backoff[min(a, len(backoff) - 1)]
                print(f"     backoff {w}s")
                time.sleep(w)
    return False


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = os.path.join(OUT, "KNOTS.json")
    tok = token()
    only = set(sys.argv[1:]) or {k[0] for k in KNOTS}
    for kid, ch, scene, lines in KNOTS:
        if kid not in only:
            continue
        dest = os.path.join(OUT, f"{kid}.png")
        if os.path.exists(dest) and os.path.getsize(dest) > 50000:
            print(f"  skip {kid} (existe)")
            continue
        print(f"  -> {kid}  [{ch}] ...", flush=True)
        t0 = time.time()
        ok = gen_image(scene + LOOK, dest, tok)
        print(f"     {'OK' if ok else 'FALLÓ'} {dest}  "
              f"{os.path.getsize(dest) if ok and os.path.exists(dest) else 0} bytes  ({time.time()-t0:.0f}s)")
    # always rewrite the meta so dialogue is never lost
    allmeta = {k[0]: {"chapter": k[1], "prompt": k[2] + LOOK, "dialogue": k[3]} for k in KNOTS}
    json.dump(allmeta, open(meta, "w"), indent=1, ensure_ascii=False)
    print(f"\n  meta de diálogos: {meta}")


if __name__ == "__main__":
    main()
