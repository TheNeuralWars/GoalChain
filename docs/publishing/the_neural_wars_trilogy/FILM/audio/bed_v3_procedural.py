#!/usr/bin/env python3
"""Procedural dark techno / cyber underscore bed for Fractured Code conform v3.

numpy-only (no scipy, no paid APIs). Layers:
  - low sub drone
  - sparse industrial pulse
  - filtered noise pads
  - indigo-cold harmonic color (soft 528 as one partial, not the whole bed)

Usage:
  python3 bed_v3_procedural.py [OUT.wav] [SECONDS]
Default OUT: same dir / bed_v3_procedural.wav ; default SECONDS=386
"""
from __future__ import annotations

import os
import sys
import wave

import numpy as np

SR = 44100
XFADE_S = 3.0  # loopable ends


def _one_pole_lp(x: np.ndarray, a: float) -> np.ndarray:
    """Causal one-pole lowpass via scipy; a closer to 1 = darker."""
    from scipy.signal import lfilter
    bcoef = np.array([1.0 - a])
    acoef = np.array([1.0, -a])
    return lfilter(bcoef, acoef, x)


def _one_pole_hp(x: np.ndarray, a: float) -> np.ndarray:
    """Simple HP via LP subtraction."""
    return x - _one_pole_lp(x, a)


def _soft_clip(x: np.ndarray, drive: float = 1.2) -> np.ndarray:
    return np.tanh(x * drive) / np.tanh(drive)


def _env_exp(n: int, attack: int, decay: int) -> np.ndarray:
    e = np.zeros(n, dtype=np.float64)
    a = max(1, attack)
    d = max(1, decay)
    e[:a] = np.linspace(0.0, 1.0, a)
    if a + d <= n:
        e[a : a + d] = np.exp(-np.linspace(0.0, 6.0, d))
    else:
        e[a:] = np.exp(-np.linspace(0.0, 6.0, n - a))
    return e


def build(seconds: float, sr: int = SR, seed: int = 20260915) -> np.ndarray:
    """Return float64 stereo (n, 2) in ~[-1, 1] before final peak scale."""
    # Extra head for loop crossfade construction
    xf = int(XFADE_S * sr)
    n_core = int(round(seconds * sr))
    n = n_core + xf  # synthesize a bit long, then stitch
    t = np.arange(n, dtype=np.float64) / sr
    rng = np.random.default_rng(seed)

    L = np.zeros(n, dtype=np.float64)
    R = np.zeros(n, dtype=np.float64)

    # --- 1) Low drone (sub + mid-sub) ---
    drone = [
        (41.2, 0.55, 0.00),
        (55.0, 0.38, 0.35),
        (66.0, 0.42, 0.10),
        (82.4, 0.22, -0.40),
        (110.0, 0.10, 0.80),
    ]
    for f, a, ph in drone:
        wob = 1.0 + 0.004 * np.sin(2 * np.pi * 0.07 * t + ph)
        sig = a * np.sin(2 * np.pi * f * wob * t + ph)
        L += sig
        R += a * np.sin(2 * np.pi * f * wob * t + ph * 0.65)

    # --- 2) Indigo-cold harmonic color (528 as soft partial only) ---
    indigo = [
        (132.0, 0.09, 0.2),
        (198.0, 0.05, 1.1),
        (264.0, 0.045, -0.5),
        (396.0, 0.025, 0.9),
        (528.0, 0.018, 1.4),  # soft color, not the bed
        (792.0, 0.010, -1.0),
    ]
    for f, a, ph in indigo:
        det = 1.0 + 0.0015 * np.sin(2 * np.pi * 0.023 * t + ph)
        L += a * np.sin(2 * np.pi * f * det * t + ph)
        R += a * np.sin(2 * np.pi * f * det * t + ph * 0.72)

    # Slow amplitude breathing on harmonic bed
    lfo = (
        1.0
        + 0.18 * np.sin(2 * np.pi * 0.031 * t)
        + 0.09 * np.sin(2 * np.pi * 0.009 * t + 1.2)
    )
    L *= lfo
    R *= lfo

    # --- 3) Filtered noise pads (decorrelated L/R) ---
    for ch, arr in ((0, L), (1, R)):
        nz = rng.standard_normal(n)
        # brown-ish
        brown = _one_pole_lp(nz, 0.992)
        # mid pad: band around ~200-800 via cascade
        mid = _one_pole_hp(brown, 0.97)
        mid = _one_pole_lp(mid, 0.985)
        # slow gate / swell
        pad_lfo = 0.55 + 0.45 * (
            0.5 + 0.5 * np.sin(2 * np.pi * 0.019 * t + ch * 0.7)
        )
        arr += 0.11 * mid * pad_lfo
        # hiss air very low
        air = _one_pole_hp(nz, 0.90)
        air = _one_pole_lp(air, 0.999)
        arr += 0.025 * air

    # --- 4) Sparse industrial pulse (~72 BPM, every 2 or 4 beats) ---
    bpm = 72.0
    beat = 60.0 / bpm
    # pattern: kick on 1, occasional on 3; metallic tick every 8
    kick_times = []
    tick_times = []
    bar = 0
    tt = 0.0
    while tt < seconds + XFADE_S:
        # kick on beat 1 of each bar; every other bar also beat 3
        kick_times.append(tt)
        if bar % 2 == 1:
            kick_times.append(tt + 2 * beat)
        if bar % 4 == 0:
            tick_times.append(tt + 1.5 * beat)
        if bar % 8 == 3:
            tick_times.append(tt + 3 * beat)
        tt += 4 * beat
        bar += 1

    for kt in kick_times:
        i0 = int(kt * sr)
        if i0 >= n:
            continue
        length = int(0.28 * sr)
        i1 = min(n, i0 + length)
        nn = i1 - i0
        te = np.arange(nn) / sr
        # pitched thud ~48 Hz decaying + click transient
        body = np.sin(2 * np.pi * 48.0 * te * (1.0 - 0.35 * te / 0.28))
        body *= np.exp(-te * 14.0)
        click = rng.standard_normal(nn) * np.exp(-te * 80.0) * 0.35
        click = _one_pole_lp(click, 0.85)
        hit = 0.55 * (body + click)
        # stereo slight bias
        L[i0:i1] += hit
        R[i0:i1] += hit * 0.92

    for kt in tick_times:
        i0 = int(kt * sr)
        if i0 >= n:
            continue
        length = int(0.06 * sr)
        i1 = min(n, i0 + length)
        nn = i1 - i0
        te = np.arange(nn) / sr
        tick = rng.standard_normal(nn) * np.exp(-te * 55.0)
        tick = _one_pole_hp(tick, 0.88)
        tick *= 0.12
        # pan slightly
        L[i0:i1] += tick * 0.7
        R[i0:i1] += tick * 1.1

    # Occasional distant industrial scrape (every ~22s)
    scrape_t = 8.0
    while scrape_t < seconds + XFADE_S:
        i0 = int(scrape_t * sr)
        length = int(1.4 * sr)
        i1 = min(n, i0 + length)
        if i1 <= i0:
            break
        nn = i1 - i0
        te = np.arange(nn) / sr
        scrape = rng.standard_normal(nn)
        scrape = _one_pole_lp(scrape, 0.96)
        scrape = _one_pole_hp(scrape, 0.94)
        env = np.sin(np.pi * te / (nn / sr)) ** 2
        scrape *= 0.06 * env
        # slow FM-ish chirp overlay
        chirp = 0.03 * np.sin(2 * np.pi * (180 + 40 * te) * te) * env
        L[i0:i1] += scrape + chirp
        R[i0:i1] += scrape * 0.85 + chirp * 1.05
        scrape_t += 22.0 + float(rng.uniform(-2.0, 3.0))

    # Soft clip + gentle HP rumble control
    L = _soft_clip(L, 1.15)
    R = _soft_clip(R, 1.15)
    L = _one_pole_hp(L, 0.995) + 0.85 * _one_pole_lp(L, 0.995)
    R = _one_pole_hp(R, 0.995) + 0.85 * _one_pole_lp(R, 0.995)

    # --- Loopable ends: equal-power crossfade last xf with first xf ---
    # Take first n_core samples after crossfading the wrap region into the start
    head = np.stack([L[:xf], R[:xf]], axis=1)
    tail = np.stack([L[n_core : n_core + xf], R[n_core : n_core + xf]], axis=1)
    # If we synthesized n = n_core + xf, the tail slice is the "extra" that
    # continues the phase; blend into the beginning for seam-free loop.
    fade_out = np.cos(0.5 * np.pi * np.linspace(0.0, 1.0, xf))[:, None]
    fade_in = np.sin(0.5 * np.pi * np.linspace(0.0, 1.0, xf))[:, None]
    # Rebuild core: samples [0, n_core)
    core_L = L[:n_core].copy()
    core_R = R[:n_core].copy()
    # Crossfade region at the *end* of the core: morph last xf toward first xf
    # so when looping end->start the seam is continuous.
    # Also apply same blend at start for symmetry when file is played once.
    blend = fade_out * tail + fade_in * head
    # Put blended material at the end of the core
    core_L[-xf:] = blend[:, 0]
    core_R[-xf:] = blend[:, 1]
    # Soft in/out 2s for film start/end (in addition to loopability)
    fade2 = int(2.0 * sr)
    env = np.ones(n_core)
    env[:fade2] = np.linspace(0.0, 1.0, fade2)
    env[-fade2:] = np.linspace(1.0, 0.0, fade2)
    core_L *= env
    core_R *= env

    st = np.stack([core_L, core_R], axis=1)
    peak = float(np.max(np.abs(st))) or 1.0
    # Aim ~-6 dBFS peak before loudnorm; room for dynamics
    st *= 0.45 / peak
    return st


def write_wav(path: str, st: np.ndarray, sr: int = SR) -> None:
    pcm = np.clip(st, -1.0, 1.0)
    pcm16 = (pcm * 32767.0).astype(np.int16)
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm16.tobytes())


def main() -> None:
    here = os.path.dirname(os.path.abspath(__file__))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "bed_v3_procedural.wav")
    secs = float(sys.argv[2]) if len(sys.argv) > 2 else 386.0
    print("synthesizing %.1fs -> %s" % (secs, out), flush=True)
    st = build(secs)
    write_wav(out, st)
    print("wrote %s  samples=%d  dur=%.3fs" % (out, len(st), len(st) / SR), flush=True)


if __name__ == "__main__":
    main()
