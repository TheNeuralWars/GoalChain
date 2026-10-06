#!/usr/bin/env python3
"""Generate optimized web assets for goalworld_site from the repo's master art.

Source art (masters, too heavy for web):
  /data/apps/GoalChain/docs/assets/img/...   (read-only reference copy)
  canonical masters also live in this repo at docs/assets/img/

Output: goalworld_site/src/assets/img/  (all web-optimized, each image < 300 KB)
Also generates poster frames from the hosted teaser clips (ffmpeg).

Run: python3 goalworld_site/tools/make_assets.py
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO_DOCS = os.environ.get("GOALCHAIN_DOCS", "/data/apps/GoalChain/docs")
SRC_IMG = os.path.join(REPO_DOCS, "assets/img")
NW = os.path.join(SRC_IMG, "neuralwars")
SITE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src")
OUT = os.path.join(SITE, "assets/img")
PRESS = os.path.join(OUT, "press")
os.makedirs(OUT, exist_ok=True)
os.makedirs(PRESS, exist_ok=True)

MAX_BYTES = 300 * 1024  # hard cap per image


def webp(src, dst, width, quality=72, max_bytes=MAX_BYTES):
    """Resize to width and save webp; step quality down until under max_bytes."""
    im = Image.open(src)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    h = int(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    q = quality
    while q >= 35:
        im.save(dst, "WEBP", quality=q, method=6)
        if os.path.getsize(dst) <= max_bytes:
            break
        q -= 8
    size = os.path.getsize(dst)
    print(f"  {os.path.relpath(dst, SITE):55s} {width}w q{q} {size//1024} KB")
    return dst


def jpg(src, dst, width, quality=82, max_bytes=MAX_BYTES):
    im = Image.open(src).convert("RGB")
    h = int(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    q = quality
    while q >= 40:
        im.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(dst) <= max_bytes:
            break
        q -= 8
    print(f"  {os.path.relpath(dst, SITE):55s} {width}w q{q} {os.path.getsize(dst)//1024} KB")
    return dst


def find_font():
    for p in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        if os.path.exists(p):
            return p
    return None


def make_og():
    """1200x630 OG card: key art + dark scrim + wordmark. Must be < 300 KB."""
    base = Image.open(os.path.join(NW, "03_Locations/Location_Neo_Veridia_Sector_4_Canyon.jpg")).convert("RGB")
    tw, th = 1200, 630
    # cover-crop
    scale = max(tw / base.width, th / base.height)
    base = base.resize((int(base.width * scale) + 1, int(base.height * scale) + 1), Image.LANCZOS)
    left = (base.width - tw) // 2
    top = int((base.height - th) * 0.35)
    base = base.crop((left, top, left + tw, top + th))
    # scrim: left side dark for text
    scrim = Image.new("L", (tw, th), 0)
    d = ImageDraw.Draw(scrim)
    for x in range(tw):
        v = int(238 * max(0.0, 1 - x / (tw * 0.72)) ** 1.25)
        d.line([(x, 0), (x, th)], fill=v)
    black = Image.new("RGB", (tw, th), (3, 3, 7))
    base = Image.composite(black, base, scrim)
    # logo mark
    try:
        logo = Image.open(os.path.join(SRC_IMG, "logo.svg").replace(".svg", "_3d_clean.png")).convert("RGBA")
    except Exception:
        logo = None
    fp = find_font()
    bold = ImageFont.truetype(fp, 66) if fp else ImageFont.load_default()
    small = ImageFont.truetype(fp, 30) if fp else ImageFont.load_default()
    tiny = ImageFont.truetype(fp, 22) if fp else ImageFont.load_default()
    d = ImageDraw.Draw(base)
    if logo:
        lg = logo.resize((120, 120), Image.LANCZOS)
        base.paste(lg, (64, 70), lg)
    d.text((64, 232), "GoalWorld", font=bold, fill=(240, 240, 245))
    d.text((64, 312), "World of Achievements", font=small, fill=(20, 241, 149))
    d.text((64, 372), "The Neural Wars  ·  Books  ·  Matchday  ·  AI Cinema", font=tiny, fill=(200, 200, 212))
    out = os.path.join(OUT, "og-image.jpg")
    q = 84
    while q >= 45:
        base.save(out, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(out) <= MAX_BYTES:
            break
        q -= 6
    print(f"  og-image.jpg 1200x630 q{q} {os.path.getsize(out)//1024} KB")


def make_favicons():
    logo = Image.open(os.path.join(SRC_IMG, "logo_3d_clean.png")).convert("RGBA")
    # favicon.ico (16/32/48)
    ico = logo.resize((48, 48), Image.LANCZOS)
    ico.save(os.path.join(OUT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    # apple-touch-icon 180
    at = logo.resize((180, 180), Image.LANCZOS)
    bg = Image.new("RGB", (180, 180), (3, 3, 7))
    bg.paste(at, (0, 0), at)
    bg.save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)
    # 512 png icon (for manifest)
    i5 = logo.resize((512, 512), Image.LANCZOS)
    bg = Image.new("RGB", (512, 512), (3, 3, 7))
    bg.paste(i5, (0, 0), i5)
    bg.save(os.path.join(OUT, "icon-512.png"), optimize=True)
    i1 = logo.resize((192, 192), Image.LANCZOS)
    bg = Image.new("RGB", (192, 192), (3, 3, 7))
    bg.paste(i1, (0, 0), i1)
    bg.save(os.path.join(OUT, "icon-192.png"), optimize=True)
    # tiny brand logo for header/footer (served at 96px, shown at 38px)
    i9 = logo.resize((96, 96), Image.LANCZOS)
    bg = Image.new("RGB", (96, 96), (3, 3, 7))
    bg.paste(i9, (0, 0), i9)
    bg.save(os.path.join(OUT, "logo-96.png"), optimize=True)
    print("  favicon.ico + apple-touch-icon.png + icon-192/512.png + logo-96.png")
    for f in ("favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png"):
        print(f"    {f}: {os.path.getsize(os.path.join(OUT, f))//1024} KB")


def make_posters():
    """Poster frames for teaser clips (hosted mp4s; posters are local + tiny webp)."""
    clips = [
        ("05_Clips/Clip_03_Mileo_Chen_Quantum_Console_Discovery.mp4", "poster-mileo.webp"),
        ("05_Clips/Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4", "poster-kora.webp"),
        ("05_Clips/Clip_09_Sierra_Catalano_Tactical_Railgun_Fire.mp4", "poster-sierra.webp"),
        ("05_Clips/Clip_11_Earth_Dawn_Orbital_Awakening.mp4", "poster-dawn.webp"),
        ("The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4", "poster-trailer.webp"),
    ]
    for rel, name in clips:
        mp4 = os.path.join(NW, rel)
        if not os.path.exists(mp4):
            print(f"  MISSING {rel}")
            continue
        tmp = os.path.join("/tmp", name.replace(".webp", ".png"))
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-ss", "1.2", "-i", mp4,
             "-frames:v", "1", "-vf", "scale=720:-2", tmp],
            check=True,
        )
        webp(tmp, os.path.join(OUT, name), 720, 58)
        os.remove(tmp)


def main():
    print("== webp art ==")
    webp(os.path.join(NW, "03_Locations/Location_Neo_Veridia_Sector_4_Canyon.jpg"),
         os.path.join(OUT, "hero-neo-veridia.webp"), 1600, 68)
    webp(os.path.join(NW, "04_Keyframes_and_Concept_Art/Keyframe_03_The_Severing_Neural_Disconnection.jpg"),
         os.path.join(OUT, "keyframe-severing.webp"), 1200, 70)
    webp(os.path.join(NW, "04_Keyframes_and_Concept_Art/Keyframe_06_Kora_Vega_432Hz_Resonance_Trance.jpg"),
         os.path.join(OUT, "keyframe-kora-trance.webp"), 1200, 70)
    webp(os.path.join(NW, "04_Keyframes_and_Concept_Art/Keyframe_09_The_432Hz_Core_Pulse_Awakening_Climax.jpg"),
         os.path.join(OUT, "keyframe-core-pulse.webp"), 1200, 58)
    webp(os.path.join(NW, "01_Covers/The_Neural_Wars_Book_1_Fractured_Code_Cover.jpg"),
         os.path.join(OUT, "cover-fractured-code.webp"), 720, 74)
    webp(os.path.join(NW, "01_Covers/The_Neural_Wars_Book_2_Earths_New_Song_Cover.jpg"),
         os.path.join(OUT, "cover-earths-new-song.webp"), 720, 74)
    webp(os.path.join(NW, "02_Characters/Character_Mileo_Chen_Specialist_L7.jpg"),
         os.path.join(OUT, "char-mileo-chen.webp"), 720, 72)
    webp(os.path.join(NW, "02_Characters/Character_Kora_Vega_Voice_of_the_Void.jpg"),
         os.path.join(OUT, "char-kora-vega.webp"), 720, 72)
    webp(os.path.join(NW, "02_Characters/Character_Commander_Sierra_Catalano_Vanguard.jpg"),
         os.path.join(OUT, "char-sierra-catalano.webp"), 720, 72)
    webp(os.path.join(NW, "02_Characters/Character_Dr_Darius_Thorne_Biophysicist.jpg"),
         os.path.join(OUT, "char-darius-thorne.webp"), 720, 72)
    webp(os.path.join(NW, "03_Locations/Location_Kuiper_Monolith_Deep_Space.jpg"),
         os.path.join(OUT, "loc-kuiper-monolith.webp"), 1200, 70)
    webp(os.path.join(NW, "03_Locations/Location_Sub_Grid_Subway_Tunnels_Platform_B.jpg"),
         os.path.join(OUT, "loc-sub-grid.webp"), 1200, 70)
    webp(os.path.join(NW, "03_Locations/Location_Pavilion_9_Medical_Recovery_Ward.jpg"),
         os.path.join(OUT, "loc-pavilion-9.webp"), 1200, 70)

    # responsive variants (srcset in the pages references these)
    print("== responsive variants ==")
    webp(os.path.join(NW, "03_Locations/Location_Neo_Veridia_Sector_4_Canyon.jpg"),
         os.path.join(OUT, "hero-neo-veridia-800.webp"), 800, 62)
    webp(os.path.join(NW, "04_Keyframes_and_Concept_Art/Keyframe_09_The_432Hz_Core_Pulse_Awakening_Climax.jpg"),
         os.path.join(OUT, "keyframe-core-pulse-800.webp"), 800, 58)
    for name, src in [
        ("keyframe-severing", "04_Keyframes_and_Concept_Art/Keyframe_03_The_Severing_Neural_Disconnection.jpg"),
        ("keyframe-kora-trance", "04_Keyframes_and_Concept_Art/Keyframe_06_Kora_Vega_432Hz_Resonance_Trance.jpg"),
        ("keyframe-core-pulse", "04_Keyframes_and_Concept_Art/Keyframe_09_The_432Hz_Core_Pulse_Awakening_Climax.jpg"),
        ("loc-kuiper-monolith", "03_Locations/Location_Kuiper_Monolith_Deep_Space.jpg"),
        ("loc-sub-grid", "03_Locations/Location_Sub_Grid_Subway_Tunnels_Platform_B.jpg"),
        ("loc-pavilion-9", "03_Locations/Location_Pavilion_9_Medical_Recovery_Ward.jpg"),
    ]:
        webp(os.path.join(NW, src), os.path.join(OUT, f"{name}-640.webp"), 640, 62)
    for name, src in [
        ("cover-fractured-code", "01_Covers/The_Neural_Wars_Book_1_Fractured_Code_Cover.jpg"),
        ("cover-earths-new-song", "01_Covers/The_Neural_Wars_Book_2_Earths_New_Song_Cover.jpg"),
    ]:
        webp(os.path.join(NW, src), os.path.join(OUT, f"{name}-400.webp"), 400, 70)
    for name, src in [
        ("char-mileo-chen", "02_Characters/Character_Mileo_Chen_Specialist_L7.jpg"),
        ("char-kora-vega", "02_Characters/Character_Kora_Vega_Voice_of_the_Void.jpg"),
        ("char-sierra-catalano", "02_Characters/Character_Commander_Sierra_Catalano_Vanguard.jpg"),
        ("char-darius-thorne", "02_Characters/Character_Dr_Darius_Thorne_Biophysicist.jpg"),
    ]:
        webp(os.path.join(NW, src), os.path.join(OUT, f"{name}-400.webp"), 400, 70)

    print("== og + favicons ==")
    make_og()
    make_favicons()

    print("== video posters ==")
    make_posters()

    print("== press kit ==")
    import shutil
    shutil.copy(os.path.join(SRC_IMG, "logo.svg"), os.path.join(PRESS, "goalworld-logo.svg"))
    lg = Image.open(os.path.join(SRC_IMG, "logo_3d_clean.png")).convert("RGBA")
    bg = Image.new("RGB", (512, 512), (3, 3, 7))
    lg1 = lg.resize((512, 512), Image.LANCZOS)
    bg.paste(lg1, (0, 0), lg1)
    # quantize to keep the press PNG well under the 300 KB web budget
    bg.quantize(colors=256, method=Image.MEDIANCUT).save(
        os.path.join(PRESS, "goalworld-logo-512.png"), optimize=True)
    jpg(os.path.join(NW, "03_Locations/Location_Neo_Veridia_Sector_4_Canyon.jpg"),
        os.path.join(PRESS, "press-hero-neo-veridia.jpg"), 1600, 78)
    jpg(os.path.join(NW, "01_Covers/The_Neural_Wars_Book_1_Fractured_Code_Cover.jpg"),
        os.path.join(PRESS, "press-cover-fractured-code.jpg"), 1200, 80)
    jpg(os.path.join(NW, "04_Keyframes_and_Concept_Art/Keyframe_03_The_Severing_Neural_Disconnection.jpg"),
        os.path.join(PRESS, "press-keyframe-severing.jpg"), 1600, 78)
    print("  press/: logo svg+png, hero, cover, keyframe")

    # final audit
    bad = []
    for root, _, files in os.walk(OUT):
        for f in files:
            p = os.path.join(root, f)
            if os.path.getsize(p) > MAX_BYTES:
                bad.append((os.path.relpath(p, SITE), os.path.getsize(p) // 1024))
    print("== audit: files over 300 KB ==")
    for rel, kb in bad:
        print(f"  OVER LIMIT {rel} {kb} KB")
    if not bad:
        print("  none — all images under 300 KB")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
