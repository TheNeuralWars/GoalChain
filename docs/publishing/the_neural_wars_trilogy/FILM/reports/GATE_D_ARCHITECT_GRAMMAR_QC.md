# Gate D — QC gramática Architect (vs lock)

**Fecha:** 2026-09-16 ~09:45 Europe/Rome  
**Gate:** D — review only (**NO regenerar**)  
**Master:** `FC_full_conform_v3_ax` bajo `improve_20260915`  
**Lock:** `FILM/locks/LOCK_SHEET_THE_ARCHITECT.md`  
**Assembly:** `FILM/ASSEMBLY_v3.md` · inserts `FILM/scenes/FC-AX_ARCHITECT_INSERTS.json`  
**Remount:** `renders/_conform_v3/_tools/remount_ax_report.json`  
**Frames QC:** `FILM/reports/qc_frames/` (+ midframes digest)

---

## Verdict global

# **PASS** (gramática Architect respetada en montaje)

El montage **no rompe** la gramática del lock: presencia = amenaza/vigilancia/símbolo Coil índigo; sin reveal facial glamuroso del Architect; sin texto/logos/Mark; PG-13. Inserts AX01–05 aterrizan en slots ASSEMBLY_v3.

**Blockers duros:** ninguno.

**Notas blandas (no FAIL):** AX04 más cercano que el “extreme distant” ideal; AX02 muestra caras de extras (permitido por grammar *empty eyes*) con cadenas literales.

---

## Paths

| Asset | Path |
|---|---|
| Master (site) | `/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v3_ax.mp4` |
| Master (render) | `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/_conform_v3/FC_full_conform_v3_ax.mp4` |
| Twin EL | `…/_conform_v3/FC_full_conform_v3_el_ax.mp4` |
| Clips AX | `FILM/renders/FC-AX/FC-AX0{1..5}.mp4` (+ seeds `.png`) |
| Lock stills | `FILM/locks/refs/the_architect/{front_34,profile,bust}.png` |
| QC frames | `FILM/reports/qc_frames/FC-AX##_t25/t75.jpg` · `master_AX##_mid.jpg` |
| Hermes i2v QC | `FILM/reports/architect_i2v_qc_FC-AX0{1..5}_20260916.md` (todos PASS previos) |

---

## ffprobe — master + AX

| Id | Duración | Res | Video | Audio |
|---|---:|---|---|---|
| **FC_full_conform_v3_ax** | **407.625 s** | 1280×720@24 | h264 | aac 44.1k stereo |
| FC-AX01 | 5.042 s | 1280×720@24 | h264 | aac 48k |
| FC-AX02 | 5.042 s | 1280×720@24 | h264 | aac 48k |
| FC-AX03 | 6.042 s | 1280×720@24 | h264 | aac 48k |
| FC-AX04 | 5.042 s | 1280×720@24 | h264 | aac 48k |
| FC-AX05 | 4.042 s | 1280×720@24 | h264 | aac 48k |

**Suma inserts:** ≈25.21 s · v2 xfade master ≈382.39 s + AX ≈ **407.60 s** (coincide con master 407.625). Loudness remount: I=−20.0 LUFS · TP=−0.82.

**Slots en master (splice hard sobre timeline xfade v2):**

| Shot | start≈ | mid≈ | end≈ | Slot docs |
|---|---:|---:|---:|---|
| AX01 | 95.87 | 98.39 | 100.91 | entre S02→S03 |
| AX02 | 241.51 | 244.03 | 246.55 | entre S05→S06 |
| AX03 | 290.08 | 293.10 | 296.13 | pre-S06A |
| AX04 | 362.03 | 364.55 | 367.07 | pre-S08 |
| AX05 | 367.07 | 369.09 | 371.11 | pre-S08 (tras AX04) |

Frames `master_AX##_mid.jpg` coinciden visualmente con clips AX (slots OK).

---

## Tabla PASS/FAIL vs lock

| Shot | Grammar esperada | Presencia (no face reveal Architect) | Coil índigo | Sin texto/logos/Mark | PG-13 | Continuidad lock stills | Slot | **Verdict** |
|---|---|---|---|---|---|---|---|---|
| **AX01** | System gaze / ventilación | PASS — POV por apertura circular; sin cuerpo/cara | PASS — glow índigo en pozo | PASS | PASS | OK temática (vigilancia) | PASS | **PASS** |
| **AX02** | Empty eyes of compliance | PASS — extras anónimos hooded; Architect off-screen | PASS — backlight índigo + cristal | PASS | PASS | OK (presión off-screen) | PASS | **PASS** |
| **AX03** | Drones + Coil residual | PASS — solo drones; sin cuerpo humano | PASS — coils índigo en malla cobre + luces drones | PASS | PASS | OK (swarm/system) | PASS | **PASS** |
| **AX04** | Silueta lejana velada | PASS — espalda/hood; cara withheld | PASS — Coil glow espalda/pecho | PASS | PASS | Soft: escala más cercana que ideal extremo; silueta+void face alineada con refs | PASS | **PASS** |
| **AX05** | Neural mesh / Coil motif | PASS — abstracción mesh; sin cara/cuerpo | PASS — helix/coil índigo tras cristal húmedo | PASS | PASS | OK (motivo sistema) | PASS | **PASS** |
| **Master** | ASSEMBLY_v3 + bed | PASS — inserts en orden; S01–S08 intactos | — | — | PASS | Lock refs Gate B APPROVED | PASS | **PASS** |

---

## Notas por shot (visión frames)

1. **AX01** — Mirada-sistema por lente/porthole hacia shaft metálico + escalera; niebla índigo. Amenaza sin reveal.
2. **AX02** — Civiles linked hooded, miradas bajas/vacías, niebla, cristal médico; Architect como presión off-screen. Soft: cadenas muy literales; caras de extras legibles (no Architect).
3. **AX03** — Corredor servicio, drones abstractos, sweep beams, Coil índigo en mesh cobre. Gramática drone-swarm limpia.
4. **AX04** — Silueta hooded de espalda en cañón residencial Neo-Citania; Coil índigo en espalda; sin cara. Soft: no tan “extreme distant” como lock ideal.
5. **AX05** — Close mesh/Coil índigo a través de cristal con lluvia; sting simbólico. Sin cuerpo.

**Lock stills presentes:** `front_34.png`, `profile.png`, `bust.png` (Gate B APPROVED) — cara void bajo hood + rim Coil índigo; inserts FC-AX usan grammars de presencia (no retrato héroe), coherente con rule v3.

---

## ¿El montage rompe la gramática Architect?

**No.** El remount `splice_AX_into_v2_xfade_master_av` inserta AX01–05 en los slots documentados sin sustituir S01–S08; duración y midframes de master confirman aterrizaje. Gramática amenaza/vigilancia/Coil se sostiene clip a clip y en el cut completo.

---

## Blockers

- **Ninguno** para Gate D grammar.
- Opcional post-Gate (no bloquea): valorar reframe AX04 más lejos en un futuro pase; AX02 podría suavizar cadenas literales — **fuera de scope** de este review (NO regenerar).

## Firma

Gate D Architect grammar QC — **PASS** · 2026-09-16 Europe/Rome · review-only
