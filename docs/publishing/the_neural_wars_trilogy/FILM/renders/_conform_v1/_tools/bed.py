#!/usr/bin/env python3
"""Cama musical continua 'Neural Wars' — canon 528 Hz (determinista, sin IA).
Genera un WAV estereo de fase continua para todo el film: al reproducir las
escenas en orden, la cama es literalmente el mismo archivo, recortado.

Uso: python3 bed.py OUT.wav SECONDS
"""
import sys, wave, numpy as np

SR = 44100


def build(seconds, sr=SR):
    n = int(seconds * sr)
    t = np.arange(n) / sr
    # Cadena canonica 528 Hz (el libro fija 528 Hz como frecuencia unificada):
    # 33 / 66 / 132 / 264 / 528 Hz + quinta 792 Hz, con pares desafinados leves
    # para batido lento (continuidad, respiracion).
    partials = [
        (33.0, 0.34, 0.00), (33.15, 0.20, 0.40),
        (66.0, 0.50, 0.15), (66.06, 0.26, -0.35),
        (132.0, 0.34, 0.55), (132.09, 0.17, -0.55),
        (264.0, 0.16, 0.90), (264.16, 0.08, -0.90),
        (528.0, 0.075, 1.30),
        (792.0, 0.030, -1.10),
    ]
    L = np.zeros(n)
    R = np.zeros(n)
    for f, a, ph in partials:
        L += a * np.sin(2 * np.pi * f * t + ph)
        R += a * np.sin(2 * np.pi * f * t + ph * 0.7)
    # LFO lento de amplitud (0.037 Hz y 0.011 Hz) -> respiracion de 27s y 91s
    lfo = 1.0 + 0.22 * np.sin(2 * np.pi * 0.037 * t) + 0.10 * np.sin(2 * np.pi * 0.011 * t + 1.0)
    L *= lfo
    R *= lfo
    # Aire: ruido rosa filtrado (un polo) muy bajo, estereo decorrelacionado
    rng = np.random.default_rng(528)
    for ch, arr in ((0, L), (1, R)):
        nz = rng.standard_normal(n)
        a = 0.985
        nz = np.convolve(nz, [1 - a], mode="same")  # pre-enfatiza; integrado abajo
        acc = np.zeros(n)
        v = 0.0
        for i in range(0, n, 4096):  # un-pole lowpass por bloques (rapido)
            b = nz[i:i + 4096]
            out = np.empty_like(b)
            for j, x in enumerate(b):
                v = a * v + (1 - a) * x
                out[j] = v
            acc[i:i + 4096] = out
        arr += 0.05 * acc
    # Suavizado de extremos del WAV maestro (la cama se recorta por escena,
    # asi que el fade solo aplica al arranque y al cierre del film completo)
    fade = int(2.0 * sr)
    env = np.ones(n)
    env[:fade] = np.linspace(0, 1, fade)
    env[-fade:] = np.linspace(1, 0, fade)
    L *= env
    R *= env
    peak = max(np.abs(L).max(), np.abs(R).max())
    scale = 0.5 / peak  # pico -6 dBFS; la ganancia final se aplica en el mix
    st = np.stack([L * scale, R * scale], axis=1)
    return (st * 32767).astype(np.int16)


def write_wav(path, st, sr=SR):
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(st.tobytes())


if __name__ == "__main__":
    out = sys.argv[1]
    secs = float(sys.argv[2])
    write_wav(out, build(secs))
    print("wrote", out, secs, "s")