#!/usr/bin/env python3
"""Opening plot keyarts — make the book premise visible before the action.

Uses the same verified grok-imagine-image path as knot_keyart.py.
HARD RULE: no readable text/letters/numbers/logos in any frame.
"""
import json
import os
import sys
import time
import urllib.request

sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation")

AUTH = os.path.expanduser("~/.grok/auth.json")
OUT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/opening"
os.makedirs(OUT, exist_ok=True)

LOOK = ("cinematic science-fiction noir still, photoreal, burnt orange and amber key light "
        "with one cold neon accent, extreme chiaroscuro key to fill ratio 10 to 1, crushed "
        "blacks, fine film grain, sharp foreground and defocused background, anamorphic "
        "composition, shallow depth of field. Absolutely no text, no letters, no numbers, "
        "no logos, no signage, no captions, no watermarks, no subtitles, no readable writing anywhere.")

OPENINGS = [
    ("B00a_the_harvest",
     "Vast vertical cathedral of matte-black pod towers rising into darkness, thousands of "
     "glass pods in ordered rows, each pod holding a faint human silhouette with a small "
     "indigo light glowing in the chest, thin luminous threads of stolen memory streaming "
     "upward and converging into a single cold geometric core high above. Scale: one tiny "
     "maintenance catwalk in the lower foreground with a lone human figure seen from behind, "
     "dwarfed by the towers. Mood: sublime, predatory, sacred machine. ",
     "A vast cathedral of pod towers rises into darkness. Thousands of glass pods hold faint "
     "human silhouettes, each with a small indigo light in the chest. Thin luminous threads of "
     "stolen memory stream upward into a single cold geometric core. A tiny figure on a catwalk "
     "is dwarfed by the towers. Very slow push in. No cuts, no text, no letters, no logos."),

    ("B00b_neo_citania",
     "Aerial night establishing shot of Neo-Citania: a perfect geometric megalopolis of white "
     "alloy spires and graphene towers under a computed mauve dawn, avenues ruled into a "
     "flawless grid like circuit traces, tiny uniform pedestrians, a beautiful city that reads "
     "as a vast processor seen from above. One colder indigo anomaly pulses beneath the city "
     "in the lower third like a buried heart. ",
     "Aerial night over a perfect geometric megalopolis. Avenues form a flawless grid like "
     "circuit traces. Spires rise under a computed mauve dawn. A colder indigo pulse glows "
     "beneath the city like a buried heart. Slow aerial drift forward. No cuts, no text, "
     "no letters, no logos."),
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
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        f.write(r.read())
    return os.path.getsize(dest)


def gen_image(prompt, dest, tok, retries=4):
    body = {"model": "grok-imagine-image",
            "prompt": prompt + ", cinematic lighting, 8k detail"}
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
    tok = token()
    for kid, scene, motion in OPENINGS:
        dest = os.path.join(OUT, f"{kid}.png")
        if os.path.exists(dest) and os.path.getsize(dest) > 50000:
            print(f"  skip {kid} (existe)")
            continue
        print(f"  -> {kid} ...", flush=True)
        t0 = time.time()
        ok = gen_image(scene + LOOK, dest, tok)
        print(f"     {'OK' if ok else 'FALLÓ'} {dest} "
              f"{os.path.getsize(dest) if ok and os.path.exists(dest) else 0} bytes "
              f"({time.time()-t0:.0f}s)")
        if not ok:
            raise SystemExit(1)
    meta = os.path.join(OUT, "OPENING.json")
    json.dump(
        {k: {"prompt": s + LOOK, "motion": m} for k, s, m in OPENINGS},
        open(meta, "w"), indent=1, ensure_ascii=False)
    print("meta", meta)
    print("DONE keyarts")


if __name__ == "__main__":
    main()
