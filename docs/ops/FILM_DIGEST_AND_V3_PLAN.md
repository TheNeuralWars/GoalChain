# Fractured Code — digest de vídeo + plan v3 (2026-09-15)

> **STATUS 2026-09-16:** **P0 EL bed DONE** · **Gate B stills COMPLETE** · **Gate C i2v AX COMPLETE** · **Gate D remount COMPLETE** (live `FC_full_conform_v3_ax.mp4` · ~407.6 s · −20 LUFS · digest `FILM/reports/film_digest_v3_ax_20260916.md`). **Next:** Gate E Obra/YouTube (Nico OAuth). NO YouTube/Obra this pass. Queue: `docs/ops/FC_V3_GEN_QUEUE_20260916.md`.


## Qué pidió Nico
1. Unificar sonido (que no se sienta collage de clips).
2. Más presencia del antagonista **The Architect**.
3. Entender qué puede **ver/oír** el vídeo entero para delegar con precisión.

---

## Realidad: quién puede “tragar” un vídeo

Nadie en nuestro stack reproduce el mp4 como un humano (timeline continuo + música + cara a la vez) en un solo forward pass barato de 6+ minutos. Lo serio es un **harness de digestión** en capas:

| Capa | Qué hace | Qué tenemos | Límite |
|---|---|---|---|
| A. Contenedor | duración, fps, loudness, saltos dB, silences | `ffmpeg` / `ffprobe` / conform scripts | No entiende historia |
| B. Continuidad cara/motion | embeddings + motion flags | **ContinuityGuard** + `scan_film_continuity.sh` | No narrativa / no música |
| C. Frames + visión | extrae N frames o tiras 3-frame; LLM vision describe | Hermes **`ai-film-visual-qc`** + `vision_analyze` + ffmpeg | Samplea, no “cada frame” nativo; audio aparte |
| D. Audio | waveform, LUFS, detección de cortes musicales | ffmpeg loudnorm / silencedetect | No “entiende” leitmotif |
| E. Multimodal cloud | algunos modelos aceptan video corto o muchos frames | Grok vision (frames), Gemini-class video APIs, ElevenLabs solo audio | Cuota/coste; ventana corta |
| F. Grok Bot | subagentes `watchVideo` / `videoReview` sobre adjuntos | Disponible en gabinete | Mejor para clips cortos; no sustituye harness A–D en VPS |

### Respuesta directa
- **Para delegar con precisión hoy:** Hermes en VPS con skill **`ai-film-visual-qc`** + ContinuityGuard + ffmpeg audio report = el harness operativo.
- **“Frame por frame” literal:** no es viable ni útil a 24fps×382s; el estándar es **keyframe / 1 fps / tiras de beat** + checklist narrativo.
- **Música + imagen juntos:** hay que forzar el digest a devolver un informe unificado (timecode → imagen + audio). Ningún “programa mágico” lo hace solo sin ese prompt/protocolo.

### Protocolo propuesto: `FILM_DIGEST_v1` (delegable)
1. `ffprobe` + loudness timeline (por escena y master).
2. ContinuityGuard face/motion.
3. Extracción 1 frame/s (o por plano) + vision pass con checklist fijo.
4. Informe markdown con: Architect presence, threat beats, audio seams, action density, recomendaciones shot-level.
5. Solo entonces regenerar (Imagine) lo marcado.

Checklist fijo del digest:
- ¿Se siente The Architect? (screen time, símbolos Coil/indigo, amenaza)
- ¿Climax claro?
- ¿Costuras de audio >6 dB o cambio de bed?
- ¿Drift de leads vs lock refs?
- ¿Texto ilegítimo en pantalla?

---

## Plan v3 (sin abrir frentes)

### P0 — Sonido unificado (poco/no Imagine) — **DONE 2026-09-16 (ElevenLabs bed live)**
1. Una **cama musical continua** de ~6,5 min (mismo leitmotif) bajo todo el master — ElevenLabs Music / bed local / compositor; el conform actual (drone 528 Hz) es placeholder.
2. Crossfade 0,8–1,2 s entre escenas + duck de ambience por plano.
3. Stems: music bed / SFX / silence guide — mezclar a master `_conform_v3`.
4. Medir: cero saltos >6 dB en boundaries salvo corte dramático intencional.

### P1 — Presencia de The Architect — **DONE through Gate D** (stills+i2v+remount)
1. Director Neural: 3–5 shots **Architect-insert** (amenaza / vigilancia / símbolo) insertables sin tirar S01–S08 — p.ej. entre S02–S03, S05–S06, pre-S06A, pre-S08.
2. Lock token Architect en WORLD_TOKENS + lock sheet (indigo Coil, no texto legible).
3. Hermes i2v anclado a stills Architect.
4. ✅ Re-montaje ASSEMBLY_v3 → `FC_full_conform_v3_ax.mp4` (Gate D 2026-09-16).

### P2 — Digest completo + QC
1. Implementar `scripts/video/film_digest.py` (o Hermes skill wrapper) según protocolo arriba.
2. Correr digest sobre `FC_full_conform_v2.mp4` → informe en `FILM/reports/`.
3. Solo regenerar lo que el digest marque en rojo.

### P3 — Publicación
- Web ya apunta a improve_20260915 (borrador).
- YouTube solo tras OAuth Postiz + Obra.
- Teaser 20–30s vertical desde master v3 cuando sonido+Architect existan.

---

## Orden de ejecución recomendado
1. **Ahora:** definir Architect lock + brief inserts (Director Neural) + especificar bed musical (Investigación/Jefe; ElevenLabs si auth).
2. **En paralelo:** film_digest harness (Hermes, sin Imagine).
3. **Luego:** gen Architect shots + remix audio → conform v3.
4. **Después:** digest otra vez → publish web / Obra.

## Dueños
| Pieza | Dueño |
|---|---|
| Digest harness | Hermes-ceo |
| Architect canon/shots | Director Neural |
| Gen i2v | Hermes (cuota SuperGrok) |
| Audio bed | ElevenLabs o bed encargado; mezclar Hermes ffmpeg |
| Prioridad / Nico | Jefe |
| YouTube | Obra + Nico OAuth |

