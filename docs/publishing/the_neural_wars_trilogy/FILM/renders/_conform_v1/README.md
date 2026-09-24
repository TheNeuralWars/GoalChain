# _conform_v1 — Fractured Code (pass BARATO de conformado de audio)

Fecha: 2026-09-14 · Ejecutado en el VPS (ffmpeg 6.1.1, arm64) · **sin regenerar imagen ni video con IA**
(0 llamadas a APIs de imagen/video xAI; todo es ffmpeg local + síntesis determinista con numpy).

## Qué hay acá

| Archivo | Qué es |
|---|---|
| `FC-S01_cut_conform.mp4` … `FC-S08_cut_conform.mp4` | Los 8 cuts conformados (entrega pedida) |
| `FC_full_conform_v1.mp4` | **Extra**: el film completo (489.17 s) — cuts unidos con crossfade de 0.8 s y UNA sola cama musical continua |
| `_tools/` | Scripts de medición y de conformado (reproducibles) + JSON de evidencia |
| `_tools/stems/*.wav` | Programa ya normalizado, sin cama (insumo para v2 de música) |
| `_tools/tmp/` | Intermedios de los recortes (S03, S05) |

Entradas (no se tocaron): `../FC-S0N/FC-S0N_cut_v1.mp4`.
**No se publicó nada** a goalworld.fun ni a ningún gateway.

## Diagnóstico medido (por qué hacía falta el pass)

1. **Niveles**: el integrated (EBU R128) iba de **-24.11 LUFS** (S02) a **-17.94 LUFS** (S06)
   → **6.17 dB de salto entre escenas** (el umbral que había que evitar era >6 dB).
2. **"Beds musicales":** no son camas compuestas: el audio que generó el modelo es un **drone tonal
   bajo** (flatness espectral 0.010–0.044, >50 % de la energía por debajo de 120 Hz, centroide
   185–281 Hz). El problema es que **cada plano tiene su propio drone y su propia fundamental**:
   la mayoría en C1/D1 (28–38 Hz) pero otros saltan a C2/D2 (64–86 Hz) y algunos a A2/E3
   (100–197 Hz) — saltos de hasta 2 octavas entre planos contiguos
   (evidencia: `_tools/pitch.json`, `_tools/tonality.json`).
3. **Colas**: no hay silencio muerto (el ambience corre hasta el último sample en las 8 escenas).
   Lo único "quieto" real: una cabeza near-static de 0.54 s en el plano 4 de S03 y una cola
   near-static de ~0.9 s al final de S05 (`_tools/shot_spans.json`, `_tools/tails2.json`).

## Qué se hizo

### 1) Nivel común (punto 1 del pedido)
`loudnorm` en **2 pasadas, modo lineal** (`linear=true` con los valores medidos) → **-20 LUFS
integrated, -2 dBTP, LRA 11**. Modo lineal = **una sola ganancia constante**: no comprime, no bombea,
la dinámica interna de cada escena queda intacta. Después de la mezcla se midió la salida y se aplicó
una corrección fina (≤1 dB) con limitador sólo en S01 y S07.

Resultado: **-20.25 … -19.91 LUFS → 0.34 dB de dispersión** (antes 6.17 dB). True peak máx **-1.79 dBTP**.

| Escena | dur. in → out | Δ | I in → I out | TP out |
|---|---|---|---|---|
| FC-S01 | 62.356 → 62.333 | -0.023 | -20.08 → -20.07 | -1.90 |
| FC-S02 | 64.356 → 64.333 | -0.023 | -24.11 → -19.91 | -2.00 |
| FC-S03 | 64.356 → 63.792 | **-0.564** | -23.05 → -20.11 | -2.02 |
| FC-S04 | 64.356 → 64.333 | -0.023 | -22.95 → -20.12 | -1.81 |
| FC-S05 | 64.356 → 63.042 | **-1.314** | -20.66 → -19.98 | -2.03 |
| FC-S06 | 64.356 → 64.333 | -0.023 | -17.94 → -20.25 | -1.79 |
| FC-S07 | 64.356 → 64.333 | -0.023 | -22.26 → -20.04 | -1.97 |
| FC-S08 | 48.273 → 48.250 | -0.023 | -21.13 → -20.12 | -2.00 |

(El -0.023 s en las escenas sin recorte es el padding AAC del contenedor: se recorta para que la
duración de audio coincida con el cuadro exacto de video. No se pierde contenido.)

### 2) Música: continuidad percibida (punto 2 del pedido)
Se hicieron **las dos cosas** que pedía el enunciado, porque con drones distintos por plano el
fade solo no alcanza:

* **Cama musical continua simple, generada (sin IA)**: drone determinista en la **cadena canónica
  528 Hz** del lore (33 / 66 / 132 / 264 / 528 Hz + quinta 792 Hz, con pares levemente desafinados
  para batido lento y un LFO de 27 s / 91 s), más aire de ruido filtrado a nivel muy bajo.
  Generada una sola vez para la línea de tiempo del film (`_tools/bed.py`) y **cortada por offset
  de escena** (columna `bed_offset` del report) → al reproducir en orden **la cama es el mismo
  archivo**: fase continua, mismos parciales, misma afinación en todas las escenas.
  Mezclada a **-13.26 dB (≈ -30 LUFS)**, o sea ~10 dB por debajo del programa = "suave", enmascara
  los saltos de drone sin tapar el ambience.
* **Fade cruzado 0.5 s in / 1.0 s out** en cada cut, sobre la mezcla completa: entrada limpia y
  aterrizaje suave en cada borde de escena (medido: rampa monótona de ≥19 dB en los primeros 0.6 s,
  y -12 a -20 dB en los últimos 200 ms).
* **En el master** (`FC_full_conform_v1.mp4`) hay además **acrossfade real de 0.8 s** entre escenas
  y una única cama continua, así que ahí no hay dips de escena: continuidad total.
* Subsonic: `highpass=30 Hz` al programa (limpia basura infrasónica; no quita contenido audible).

### 3) Ritmo (punto 3 del pedido)
Se midió freeze/near-static por plano (`freezedetect` a -45/-50 dB, 0.35 s) y energía por ventana de
0.5 s. **Lo recortado, y por qué:**

* **FC-S03: -0.542 s** — cabeza near-static del plano 4 (`24.125 → 24.667 s`, 13 cuadros): era el
  plano S03-04, que arranca congelado y después anima. Se quita el arranque muerto, no el contenido.
* **FC-S05: -1.306 s** — cola near-static del plano 8 (`freeze 63.148 → 64.065 s`): el plano termina
  congelado (grano sin movimiento). La escena ahora cierra en **63.05 s**, sobre movimiento real.

**Lo que NO se recortó (y por qué):** en los otros 6 cuts no hay cola muerta — el ambience corre
continuo hasta el final y hay movimiento real en el último cuadro. Además los planos son de
**8.042 s exactos**, pero **no se acortaron "por ritmo"**: dentro de cada plano hay movimiento
continuo, así que recortar sería borrar contenido, no quitar tiempo muerto. La variación de duración
que sí existe (S05 -1.31 s, S03 -0.56 s, S08 corto por material faltante) mueve el ritmo sin
destruir imagen.

### 4) Salidas (punto 4 del pedido)
`/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v1/FC-S0N_cut_conform.mp4`
— 848x480, h264, 24 fps, AAC 192k 44.1 kHz estéreo, +faststart. Video **copiado sin recodificar**
salvo S03/S05 (recorte → CRF 18). Master: 489.17 s, I=-20.22 LUFS, TP=-1.94 dBTP.

## Verificación (números reales, no estimaciones)
* `_tools/verify.py` → `_tools/verify.json`: dispersión de nivel 0.34 dB, fade-in/fade-out OK en las 8,
  sincronía audio/video a lag 0 (correlación cruzada contra el cut original), energía <120 Hz
  sube en todas (la cama está presente).
* QC independiente con el skill `ffmpeg-skill` (`check.py`, spec YouTube asumida): **0 FAIL en los 8**;
  los 3 WARN de cada archivo son las filas de juicio (duración/aspecto/fps/loudness/true peak) porque
  nuestra spec es la de Nico (-20 LUFS), no la de YouTube (-14 LUFS). No se persiguen.

## Reproducir
```bash
cd renders/_conform_v1/_tools
python3 bed.py /tmp/bed_full.wav 540     # cama 528 Hz continua (determinista)
python3 conform.py                       # las 8 escenas -> ../FC-S0N_cut_conform.mp4
python3 conform.py --scenes --master     # extra: film completo con acrossfade 0.8 s
python3 verify.py                        # verificación (fades, sync, dispersión de nivel)
# medición previa: analyze.py · tonality.py · pitch.py · shot_spans.py · tails2.py
```
Recortes y parámetros están en la cabecera de `conform.py` (`TRIMS`, `TARGET_I`, `FADE_IN/OUT`, `XFADE`).

## Pendientes / notas
* **FC-S08 es parcial** (6 planos, 48.25 s; falta el plano 07-08): no se inventó nada, se conformó
  el material existente. Cuando se genere el material faltante, re-correr `conform.py --scenes 8`
  (y `--master`).
* El arreglo "de fondo" para la música sería normalizar el drone por plano (pitch-shift de la banda
  30–200 Hz hacia la cadena 528), que es un pass más caro y con riesgo de artefactos. La cama
  continua + fades ya resuelve la continuidad percibida en este pass BARATO.
* Nada publicado. Nada tocado en gateways.