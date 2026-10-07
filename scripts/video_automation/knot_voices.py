#!/usr/bin/env python3
"""Cast + synthesise the 22 conflict-knot dialogue lines with ElevenLabs.

Lines are VERBATIM from the manuscript (see KNOTS.json). Every character gets its own
voice -- this replaces the single-voice `edge` pass, which had to fake differentiation
in the mix. Mix treatment (pitch/EQ/space) is still applied on top, but identity now
comes from the read.

Budget: the account is tier=free with 10,000 characters; the script refuses to run if
the lines would exceed the remaining quota, and never prints the key.
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

ENV = "/data/apps/tools/video-use/.env"
OUT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/knots/vo2"
KNOTS_JSON = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/knots/KNOTS.json"

# character -> (voice_id, ElevenLabs voice name, delivery style, stability, similarity, style)
CAST = {
    "MILEO":     ("IKne3meq5aSn9XLyUdCD", "Charlie",  "exhausted young man, bitter deadpan contempt, dry and close",
                  0.45, 0.80, 0.35),
    "JANSEN":    ("N2lVS1w4EtoT3dr4eOWO", "Callum",   "scarred older man, hard and clipped, controlled fury, dangerous quiet",
                  0.40, 0.85, 0.45),
    "SIERRA":    ("pFZP5JQG7iQjIQuC4Bku", "Lily",     "woman soldier, low and intimate, grief held back by will, barely a whisper",
                  0.35, 0.85, 0.55),
    "MARTIN":    ("JBFqnCBsd6RMkjVDRZzb", "George",   "warm older-brother calm, then new resonant depth, wonder and certainty",
                  0.45, 0.85, 0.50),
    "DOCTOR":    ("cjVigY5qzO86Huf0OWal", "Eric",     "a doctor breaking down with guilt, voice cracking, confessional",
                  0.35, 0.80, 0.60),
    "ELARA":     ("XrExE9yKIg1WjnnlVkGX", "Matilda",  "clinical specialist, precise and professional, barely contained excitement",
                  0.55, 0.85, 0.35),
    "AGONY":     ("iP95p4xoKVk53GoZ742B", "Chris",    "a man overwhelmed by sensory flood, gasping, desperate, in pain",
                  0.30, 0.85, 0.75),
    "NARRATOR":  ("onwK4e9ZLuTAKqWW03F9", "Daniel",   "grave resonant narrator, measured and heavy, prophetic",
                  0.55, 0.85, 0.45),
    "GARDENERS": ("nPczCjzI2devNBz1zQrb", "Brian",    "vast ancient non-human intelligence, immense patient calm beyond human emotion",
                  0.65, 0.85, 0.40),
}

# line id -> (character, text, pacing)
LINES = {
    "K1_01": ("MILEO",    "Takes one to know one. You didn't sign up to build a soul-harvester.", 1.0),
    "K1_02": ("MILEO",    "I didn't ask for my family to get optimized into strangers. Different paths, same shit-pile.", 0.97),
    "K1_03": ("MILEO",    "This wasn't enhancement. This was obliteration.", 0.86),
    "K2_01": ("JANSEN",   "You realize you're arguing for exactly what the Architect wants.", 0.93),
    "K2_02": ("JANSEN",   "Connection instead of optimization. We fought against one system controlling our minds, now you want us to surrender to another?", 0.95),
    "K3_01": ("SIERRA",   "I'll find you. Whatever's left of you. I promise.", 0.85),
    "K3_02": ("MARTIN",   "I won't let you sink. I promise.", 0.88),
    "K4_01": ("SIERRA",   "Please don't make me forget the words.", 0.82),
    "K4_02": ("DOCTOR",   "That's all he said, over and over. The words. I took his words.", 0.85),
    "K5_01": ("MARTIN",   "Don't look down until you're ready.", 0.88),
    "K5_02": ("MARTIN",   "Focus on where you're going, not how far you've come.", 0.88),
    "K5_03": ("SIERRA",   "What if I'm not me afterward?", 0.85),
    "K6_01": ("JANSEN",   "All districts reporting escalation parameters.", 1.02),
    "K6_02": ("JANSEN",   "We're losing integration stability across thirty-seven percent of transformed architecture.", 0.98),
    "K7_01": ("ELARA",    "Implementation parameters calibrated to optimal configuration. Martin, confirm readiness protocol.", 1.03),
    "K7_02": ("MARTIN",   "I perceive everything.", 0.80),
    "K7_03": ("SIERRA",   "Martin, do you maintain identity cohesion? Are you still you?", 0.85),
    "K7_04": ("MARTIN",   "I know exactly who I am. More completely than optimization ever permitted.", 0.82),
    "K8_01": ("AGONY",    "Make it stop.", 1.08),
    "K8_02": ("NARRATOR", "It doesn't merely expand perception. It transforms existence.", 0.80),
    "K9_01": ("GARDENERS", "The invitation awaits. The choice remains.", 0.72),
    "K9_02": ("GARDENERS", "Will you join the conversation that has continued since stars first ignited?", 0.72),
}


def key():
    for line in open(ENV, encoding="utf-8-sig"):
        line = line.strip().lstrip("export ").strip()
        if line.startswith("ELEVENLABS_API_KEY"):
            return line.partition("=")[2].strip().strip('"').strip("'")
    raise SystemExit("sin ELEVENLABS_API_KEY en " + ENV)


def call(url, payload, k, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(),
                                 headers={"xi-api-key": k, "Content-Type": "application/json"})
    return urllib.request.urlopen(req, timeout=timeout)


def main():
    os.makedirs(OUT, exist_ok=True)
    k = key()
    want = sys.argv[1:] or list(LINES)

    # budget guard
    need = sum(len(LINES[i][1]) + 2 for i in want if i in LINES)
    u = json.load(urllib.request.urlopen(urllib.request.Request(
        "https://api.elevenlabs.io/v1/user", headers={"xi-api-key": k}), timeout=30))
    s = u.get("subscription", {})
    left = s.get("character_limit", 0) - s.get("character_count", 0)
    print(f"  presupuesto: {left} chars disponibles, {need} necesarios")
    if need > left:
        print("  !! no alcanza el cupo — abortado sin gastar nada")
        return 1

    manifest = {}
    if os.path.exists(KNOTS_JSON):
        src = json.load(open(KNOTS_JSON))
    else:
        src = {}
    ok = 0
    for lid in want:
        if lid not in LINES:
            continue
        char, text, pace = LINES[lid]
        vid, vname, style, stab, sim, sty = CAST[char]
        dst = os.path.join(OUT, f"{lid}.wav")
        if os.path.exists(dst) and os.path.getsize(dst) > 5000:
            print(f"  skip {lid} ({char})")
            ok += 1
            continue
        print(f"  -> {lid}  {char:<9} [{vname}]  {len(text)} chars", flush=True)
        t0 = time.time()
        for attempt in range(3):
            try:
                r = call(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}", {
                    "text": text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {"stability": stab, "similarity_boost": sim,
                                       "style": sty, "use_speaker_boost": True},
                }, k)
                open(dst, "wb").write(r.read())
                print(f"     OK {os.path.getsize(dst)} bytes ({time.time()-t0:.0f}s)")
                manifest[lid] = {"character": char, "voice": vname, "voice_id": vid,
                                 "text": text, "pacing": pace}
                ok += 1
                break
            except urllib.error.HTTPError as e:
                print(f"     intento {attempt+1}: HTTP {e.code} {e.read()[:160].decode(errors='replace')}")
                time.sleep(5 * (attempt + 1))
        time.sleep(0.4)
    json.dump(manifest, open(os.path.join(OUT, "CAST.json"), "w"), indent=1, ensure_ascii=False)
    print(f"\n  === {ok}/{len([i for i in want if i in LINES])} líneas con voz de personaje")
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
