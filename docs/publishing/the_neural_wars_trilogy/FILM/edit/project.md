# FRACTURED CODE — Mini-Film · Base de producción

> **Este archivo es la memoria del montaje y la base para continuar.** Se apéndiza al final de
> cada sesión de edición (convención `video-use`). Si retomás el proyecto, leé esto primero.

**Proyecto:** The NeuralWars — Book 1 «Fractured Code»
**Entregable:** un mini-film unificado del libro ento — perfecto, coherente, emocionante.
**Raíz:** `docs/publishing/the_neural_wars_trilogy/FILM/`
**Canon (orden de autoridad):** `CANON.md` → `VISUAL_BIBLE.md` → `wardrobe.md` → `locks/` → `WORLD_TOKENS.json`
**QC:** `reports/VISUAL_QC_full_library_20260924.md`

---

## 1. Qué tenemos (inventario verificado, no asumido)

**El mini-film YA está armado.** No se reconstruye — se arregla y se eleva.

| Pieza | Dónde | Estado |
|---|---|---|
| **Montaje completo v3** | `renders/_conform_v3/FC_full_conform_v3_el.mp4` | 382,4 s · 1280×720 · AAC |
| Variantes del conform | `_conform_v3/FC_full_conform_v3{,_audio,_el,_el_audio}.mp4` | 382,4 s c/u |
| Variante extendida | `_conform_v3/FC_full_conform_v3{,_el}_ax.mp4` | **407,6 s** |
| Conform v2 / v1 | `renders/_conform_v2/`, `_conform_v1/` | 382,4 s / 489,2 s @848×480 |
| **9 segmentos de escena** | `renders/_conform_v3/FC-S0X_cut_conform.mp4` | 48,4·48,4·48,4·46,4·48,4·24,2·44,4·43,4·37,3 s |
| 86 shots fuente | `renders/FC-S01..S08/` | 658 MB |
| **Banda sonora ya puntuada** | `audio/mix/FC_master_mix_v3.wav` | **382,06 s** · 44100×2 |
| Beds alternativos | `audio/bed_v3_elevenlabs_norm.wav`, `bed_v3_procedural.wav` | 386 s c/u |
| **Script del mix** | `renders/_conform_v3/mix_conform_v3.sh` | bed @ **−13,26 dB**, fade 2,5 s al final |
| Remount del extended | `renders/_conform_v3/remount_ax_v3.py` | — |

**Encaje audio/video: 382,06 s vs 382,4 s → delta 0,34 s.** La banda sonora fue puntuada para
esta asamblea exacta. **No re-puntuar.**

**Orden canónico de montaje** (`WORLD_TOKENS.assembly_order_hint`):
```
FC-S01 → FC-S02 → FC-S03 → FC-S04 → FC-S05 → FC-S06 → FC-S06A → FC-S07 → FC-S08
```

**Aspecto:** `WORLD_TOKENS.aspect = {canon_feel: 2.39, interim_pipeline: 16:9}`.
O sea: 2.39 es el objetivo, 16:9 es deuda de pipeline. **La deuda se salda en esta pasada.**

---

## 2. Herramientas

| Herramienta | Uso | Estado |
|---|---|---|
| **`ffmpeg-skill`** (`skills/ffmpeg-skill/scripts/*.py`) | cadena de edición: `fit` `color` `redact` `cut` `join` `audio` `loudness` `look` `check` `probe` | 42 scripts, local, sin APIs |
| **`video-use`** (`/data/apps/tools/video-use`) | critic pass, reglas de music/SFX, per-section loudness | **actualizado a `b877063`** (2026-09-23) |
| `ai-film-visual-qc` | QC de visión a resolución nativa | aplicado |
| Visión (`vision_analyze`) | verificación de encuadre, texto, identidad | aplicado |

**Decisión sobre `browser-use/video-use`:** sí se usa, y **sí valía la pena actualizar** — estábamos
1 commit atrás y ese commit (`b877063`) trae *phrase-aware captions, music/SFX rules, per-section
loudness check y un **critic sub-agent en el self-eval***. Ese critic pass es la herramienta para
que el resultado salga «perfecto». Quedó en `0 commits atrás`.

**Regla dura del trabajo de video:** todo lo de video lo hace **MiMo** (no delegar).

---

## 3. Cadena de arreglo — principios

Mandato del usuario: **«tirando el menos posible y usando inteligentemente las herramientas
disponibles para maximizar sus potenciales de uso»**. O sea: **post-producción primero,
regeneración nunca como primera opción.**

Orden de cadena (regla `ffmpeg-skill`): **colour → cut → join → audio → loudness → export.**

| # | Defecto (del QC) | Arreglo | Herramienta | Costo |
|---|---|---|---|---|
| 1 | Aspecto 16:9, deuda vs canon 2.39 | **crop 239:100** por segmento | `fit.py --aspect 239:100 --fit crop` | ~0 |
| 2 | **Manos con dedos fusionados** (3/3 frames) | **el propio crop los saca** (quedaban al borde inferior) | idem #1 | **gratis** |
| 3 | Bombeo de loudness >12 dB en 11/17 cortes (peor: 27,6 dB) | bed ya puntuado + `--compress --limit` + `loudness.py` | `audio.py`, `loudness.py` | ~0 |
| 4 | Pseudo-letra: guante (S08), tatuaje (S03) | redacto puntual de la marca | `redact.py --mode blur` | ~0 |
| 5 | Logos/insignias: chalecos (S03), parche de hombro (S06) | redacto puntual | idem #4 | ~0 |
| 6 | Serpent Coil en cian en vez de índigo (`#4B0082`) | corrección de tono selectiva sobre el rango cian | `color.py --filter` | ~0 |
| 7 | Sierra: coleta vs «short commander hair»; cicatriz que cambia de lado | **no regenerar**. Ver §5 | — | — |

### La decisión sobre Sierra (no regenerar)

El lock sheet pide `dark practical short commander hair`; el material muestra coleta. Pero el
problema real del QC no era *qué* pelo, sino **inconsistencia** («extra woman confusable with lead»,
«LEFT cheek scar missing or wrong side»). Para un mini-film manda **coherencia interna**.

Regla adoptada: **si Sierra se ve igual en todas sus apariciones → se conserva tal cual y se
documenta como divergencia deliberada.** Solo se interviene si hay drift *entre* escenas.
Eso descarta regeneración y preserva todo el material («tirando el menos posible»).

---

## 4. Lo que NO se toca (para no romper lo que ya funciona)

- **La banda sonora.** Ya está puntuada a 382,06 s para esta asamblea. Re-puntuar rompería el encaje.
- **Las decisiones de montaje de los 9 cortes.** FC-S01 está puntuado 9/10; el corte ya está tomado.
- **Los 86 shots fuente** en `renders/FC-S0X/` — son el material de oro para regeneraciones futuras.
- **`mix_conform_v3.sh` y `remount_ax_v3.py`** — son el registro de cómo se armó. Preservarlos.
- **No generar escenas nuevas.** Mandato explícito: *«no generes más capítulos, enfócate más bien
  en arreglar los que ya tenemos»*. FC-S08 queda en 6/8 y el montaje se arma para que funcione así.

---

## 5. Elementos de film potente — dónde vive cada uno

El pedido fue: **drama, tensión, acción, imagen, y un sentido general coherente y completo.**

| Elemento | De dónde sale | Cómo se protege |
|---|---|---|
| **Imagen** | 86 shots AI, 2.39 tras el crop, grade unificado | crop verificado con `look.py` por segmento («no kill shots») |
| **Drama** | el bed de ElevenLabs (`bed_v3_elevenlabs_norm.wav`) | no aplastar con compresión agresiva |
| **Tensión** | el bed procedural (`bed_v3_procedural.wav`) + ritmo de los cortes | respetar los silencios del bed en los cortes |
| **Acción** | FC-S05 (6,5/10), FC-S02/FC-S07 (7/10), FC-S01 (9/10) | no acelerar lo que ya tiene energía |
| **Coherencia** | `assembly_order_hint` + lock sheets + grade único | revisión de continuidad en el critic pass |
| **Completitud** | el bed encaja a 0,34 s → el film tiene final | fade de 2,5 s ya en `mix_conform_v3.sh` |

**Estructura narrativa implícita en el orden canónico** (no reordenar):
`S01 Sector 17 Link Cut` (gancho) → `S02..S05` (escalada / acción) → `S06 + S06A` (punto medio) →
`S07` (clímax de conjunto) → `S08` (cierre, 6/8 — cierra sobre la mujer del aire, que es como
abre; puerta simétrica).

---

## 6. Verificación obligatoria antes de entregar (no negociable)

Reglas de `ffmpeg-skill` + `video-use`:

1. **`look.py` sobre la SALIDA** (no sobre las fuentes) — contact sheet por cada límite de corte
   (±1,5 s) y muestras de los primeros 2 s, los últimos 2 s y 2–3 puntos medios.
2. **`check.py` con `--platform`** del destino.
3. **`ffprobe` de la salida** — duración, resolución, fps, audio deben coincidir con lo pedido.
4. **Critic pass** (`video-use`, `b877063`): sub-agente crítico en el self-eval.
5. **Loudness por sección** — verificar que ningún salto entre secciones supere el umbral.
6. **Si algo falla: arreglar → re-render → re-evaluar.** Tope de 3 pasadas de auto-eval; si persiste,
   se señala al usuario en vez de loopear.

> Regla aprendida en este proyecto: **un `--json-brief` que muestra `"commands": []` NO es éxito.**
> Verificar siempre el archivo de salida con `ffprobe`. Un error silencioso se disfrazó de éxito.

---

## 7. Sesión 1 — 2026-09-24

**Estrategia:** aprovechar que el mini-film ya estaba armado (`FC_full_conform_v3_el.mp4`,
382,4 s) y que la banda sonora ya estaba puntuada para esa asamblea (delta 0,34 s). En vez de
reconstruir o regenerar, aplicar una cadena de post-producción sobre los 9 segmentos canónicos
que salde la deuda de aspecto (2.39) y **que de paso elimine el defecto de manos**, y luego
normalizar el audio para matar el bombeo de loudness.

**Decisiones:**
- **Crop 239:100 en vez de blur-fill o letterbox.** Verificado con contact sheets y visión:
  el crop es *«highly cinematic and intentional»*, *«no kill shots»* (no corta nariz/ojos/mentón),
  y **el único elemento perdido son las manos al borde inferior — que es exactamente el defecto
  de dedos fusionados**. Doble victoria con una sola pasada. El blur-fill se descartó porque
  *«immediately signals 16:9 source material to discerning viewers»*.
- **No regenerar Sierra.** Se prioriza coherencia interna sobre fidelidad al lock sheet; solo se
  interviene si hay drift *entre* escenas.
- **No completar FC-S08-07/08.** Mandato: no generar capítulos nuevos. El montaje se cierra sobre
  los 6/8 disponibles.
- **Actualizar `video-use`** por el critic pass y las reglas de music/SFX.

**Registro de razonamiento:**
- Geometría verificada, no deducida: 2.39 desde 16:9 **siempre** exige crop (pierde 26% de alto)
  o barras laterales. No hay tercera opción sin degradar. Se eligió crop tras mirar.
- `fit.py --aspect` exige formato `W:H` (`239:100`), no `2.39`.
- El `--fit pad` hacia 2.39 da **pillarbox** (barras laterales) porque 2.39 es más ancho que 16:9 —
  NO es el look cinematográfico. Error geométrico fácil de cometer.

**Pendiente (siguiente sesión):**
- [x] ~~Redacto puntual de pseudo-letra~~ → **hecho solo en S08**; S03 y S06 descartados (ver §8)
- [x] ~~Corrección de tono Serpent Coil~~ → **NO hacía falta** (ya era índigo)
- [x] ~~Verificar coherencia de Sierra~~ → sin drift reportado en la revisión de los 9 segmentos
- [x] Join de los 9 segmentos en orden canónico (`--transition none`)
- [ ] bed + loudness sobre el join
- [ ] Critic pass + `look.py` sobre la salida + `check.py`
- [ ] Entregar `final.mp4` y cerrar esta base

---

## 8. Sesión 2 — 2026-09-24 (continuación): correcciones al QC y un self-eval fallido

### Correcciones al QC del día anterior (importante: casi se "arregla" material correcto)

Tras revisar a resolución nativa sobre los segmentos ya recortados, **3 de los 6 defectos del QC
no existían o eran canon**:

| Afirmación del QC | Veredicto corregido |
|---|---|
| FC-S03: «tatuaje que lee `33`/`EE`» | ❌ **Es el Serpent Coil** (`Serpent Coil LEFT wrist indigo bioluminescence`). **Canon, no tocar.** |
| FC-S01: «el Coil salió cian, no índigo» | ❌ **Ya es índigo/violeta** — *«the dominant emission is indigo/violet — not cyan or white-hot»*. **No necesita corrección.** |
| FC-S03: «logos de pájaro/cuadrado en chalecos» | ❌ *«too small... not clearly readable»* — no se notan en reproducción. |
| FC-S06: «marcas de frente» | ❌ *«abstract geometric war paint, **not text**»* — aceptable. |
| FC-S08: pseudo-letra en el guante | ✅ **REAL** — *«reads as broken AI gibberish»*, alto impacto. |
| FC-S06: parche triangular de hombro | ✅ **REAL** — *«reads as logo/emblem»*, pero diminuto (0,23% del frame). |

**Lección:** verificar cada hallazgo del QC contra el canon **antes** de intervenir. Aquí se
evitó «arreglar» el Serpent Coil (que es canon) y una corrección de color que no hacía falta.

### Self-eval pasada 1 — FALLÓ (y así debía ser)

El primer redact usó el `boxblur` por defecto (`20:20:10:20`) y **no era shippable**:
- S08: *«an obvious redaction patch... looks like a censorship bar or a failed inpainting attempt»*
- S06: *«solid, opaque black rectangle... hard seam... does not blend»*

**Y un fallo estructural:** el box es **fijo** sobre 27 s de material con **varios shots y varios
personajes** — el mismo box terminó cubriendo otras personas (*«all three have black rectangular
redaction boxes on their left shoulders»*).

### Self-eval pasada 2 — PASÓ

**S08 con blur SUAVO (`--blur-strength 3` → `boxblur=3:3:1:3`)** → `YES, SHIPPABLE`:
> *«reads as intentional illuminated technology — like bioluminescent circuitry»* ·
> *«no visible hard edges, seams»* · *«undetectable at normal playback»* ·
> *«The 3px box-blur radius was appropriate — strong enough to destroy text legibility but
> gentle enough to preserve the luminous quality»*

La clave: la pseudo-letra **era glow**. Difuminar poco la destruye como letra y la conserva como
glow abstracto. Difuminar mucho la convierte en censura.

**S06 — REVERTIDO, se documenta como breach conocido.** Un box fijo no puede funcionar sobre
material multi-shot con varios personajes. Arreglarlo exigiría boxes por shot (o regeneración),
y el parche mide **0,23% del frame**. Se deja tal cual y se señala. Cumple «tirando el menos
posible».

### Reglas aprendidas (no repetir)

**Causa mecánica del identity drift (para regeneraciones futuras):** el schema del shot **no
tiene campo `reference_images`**, y el face-lock se intenta solo con texto de prompt. Mientras
eso no cambie, toda regeneración vuelve a derivar. Los lock sheets (`locks/LOCK_SHEET_*.md` +
`locksheets/*_3Q|FULL|PROFILE.png`) existen precisamente para inyectarse como referencia.

1. **Los timestamps de los contact sheets de `look.py` son RELATIVOS al punto de seek**, no
   absolutos (`-ss` + `gte(t-prev_selected_t, step)`). Sumar el seek. Confiarlos causó extraer
   frames en segundos equivocados y «no encontrar» las marcas.
2. **`redact.py` exige `--width`/`--height` PARES** (croma 4:2:0).
3. **`redact.py` aplica el box todo el clip** — sin ventana de tiempo. Para una ventana:
   `cut.py` → `redact.py` → `join.py` (es lo que indica la propia herramienta).
4. **Un box fijo NO sirve** sobre material multi-shot / multi-personaje. Solo sobre un shot
   con sujeto quieto.
5. **Blur fuerte = censura. Blur suave = glow abstracto.** Para pseudo-texto, `--blur-strength 3`.
6. **`join.py` aplica `fade` por defecto** — para cortes duros entre escenas usar
   **`--transition none`**.
7. **`fit.py --aspect` exige `W:H`** (`239:100`). Y `--fit pad` hacia 2.39 da **pillarbox**
   (barras laterales), NO el look cinematográfico.
8. **Ningún script de `ffmpeg-skill` crea directorios** (`«this tool never creates directories»`).
   Hacer `mkdir -p` antes. Ojo con `$E/edit/…` cuando `$E` ya termina en `/edit` — anida solo.

---

## Sesión 8 — 2026-09-24 · REESTRUCTURA: nudos de conflicto + diálogos + colchón sonoro

**Encargo:** *"descomponer cada parte para darle fuerza a la acción incluyendo el nudo del
conflicto en cada capítulo · más pedazos nuevos que conecten con la trama del libro · que haya
diálogos y se ponga en escena la trama · que el fondo de cada escena, vieja y nueva, se funda en
un colchón sonoro unificado."*

**Diagnóstico.** v7 tenía escenas-puente pero **cero diálogos** y seguía sin escenificar el nudo
de cada capítulo. El ledger prueba que las 8 escenas cubren solo FC-01→FC-04 de 17 capítulos.

### Columna dramática extraída del manuscrito (verbatim, nada parafraseado)

| ch | el nudo | la línea que lo escena |
|----|---------|------------------------|
| FC-04 | Mileo descubre qué es el Link | *"You didn't sign up to build a soul-harvester."* |
| FC-06 | la resistencia se fractura | *"You're arguing for exactly what the Architect wants."* |
| FC-07 | el voto de Sierra a su hermano | *"I'll find you. Whatever's left of you. I promise."* |
| FC-09 | el costo humano | *"Please don't make me forget the words."* |
| FC-10 | el miedo a perderse | *"What if I'm not me afterward?"* |
| FC-11 | el Arquitecto contraataca | *"losing integration stability across 37%"* |
| FC-14 | **CLÍMAX** — Martin en la silla | *"Are you still you?" / "I know exactly who I am."* |
| FC-15 | el costo de recordar | *"Make it stop."* |
| FC-16 | la invitación | *"The invitation awaits. The choice remains."* |

### Estructura v8 — 19 unidades en orden de historia

```
 1 B1_harvest_city     FC-00  marco cósmico: 8M mentes como constelación
 2 K1_soul_harvester   FC-04  NUDO  "You didn't sign up to build a soul-harvester."
 3 BLOCK_A S01-S04     FC-01→4 acción: el link cut
 4 B2_coil_awakening   FC-05  el Serpent's Coil despierta bajo la piel
 5 K2_the_fracture     FC-06  NUDO  Jansen contra la sala
 6 K3_the_vow          FC-07  NUDO  el voto de Sierra
 7 BLOCK_B S05+S06     FC-05/6 acción
 8 B3_harvest_begins   FC-05  "Harvesting begins."
 9 K4_the_words        FC-09  NUDO  "Please don't make me forget the words."
10 K5_not_me_afterward FC-10  NUDO  "What if I'm not me afterward?"
11 S06A                —      respiro
12 K6_the_counterattack FC-11 NUDO  contraataque del Arquitecto
13 B4_counterattack    FC-11  la fractura
14 BLOCK_C S07-S08     FC-03/4 acción
15 K7_the_chair        FC-14  CLÍMAX — la silla, 4 líneas de diálogo
16 B5_renaissance      FC-15  el Renaissance Protocol
17 K8_make_it_stop     FC-15  NUDO  "Make it stop."
18 B6_gardeners        FC-16  los Gardeners
19 K9_the_invitation   FC-16  CIERRE "The invitation awaits."
```

Bloques de acción con **corte duro** (la tensión no se suaviza). **Disolvencia de 0,7 s en cada
umbral de trama** — y como `join.py` crossfadea video **y** audio a la vez, cada umbral lleva su
transición de sonido.

### Diálogo — 22 líneas, 120,67 s, verbatim del libro

`edit/knots/vo/K*_*` + `edit/knots/KNOTS.json` (línea, capítulo, personaje).

**Realidad de voces (importante para continuar):** no hay TTS multi-voz disponible. `edge`
funciona pero responde `voice_compatible: false` (una sola voz, ignora el diseño de voz);
`gemini` da **403** (*Agent Platform API has not been used in project 968826351885*);
las keys de `elevenlabs`/`openai` son **stubs vacíos de 20 bytes** en
`/data/apps/tools/video-use/.env`; `neutts` no está instalado. Entonces la diferenciación por
personaje es de MEZCLA, no de lectura: `speed` por línea al sintetizar + corrimiento de tono
(`asetrate`), EQ y reverb/anchura en el armado. Si algún día entra una key multi-voz, solo se
regenera `vo/` — el EDL no cambia.

### El colchón sonoro unificado

El encargo pide que el fondo **se funda en cada límite, viejo y nuevo**. Un corte duro de imagen
no puede ser corte duro de ambiente. Tres capas, mezcladas una sola vez:

1. **Cadena de ambience** — el ambiente propio de cada unidad se extrae y se `acrossfade`a con el
   siguiente en **todos** los empalmes (también los de corte duro). Un solo tallo continuo de
   ambiente; ningún seam queda seco. Esto es lo que hace que el material viejo y el nuevo
   compartan el mismo aire.
2. **Bed musical** — `audio/bed_v3_procedural.wav` (386 s) bajo toda la línea de tiempo, él
   mismo crossfadeado en su loop. Duck −10 dB bajo diálogo.
3. **Diálogo** — 22 líneas sobre la línea de tiempo de su nudo, seco y al frente.

Máster: `loudness.py -I -16 --tp -1.5`. La métrica de bombeo es la prueba objetiva de que el
colchón es realmente continuo: ventanas de 6 s, saltos adyacentes >12 dB. **Línea base: 13 saltos
/ peor 31,0 dB** antes de tocar nada.

### Reglas aprendidas HOY (llevarlas adelante)

- `ffmpeg-skill` **nunca crea directorios** (regla 8) → `mkdir -p` antes. Caí **3 veces** hoy.
- **Cloudflare error 1010** bloquea `urllib.request.urlretrieve` en `imgen.x.ai`: las descargas
  necesitan `User-Agent: Mozilla/5.0` (lo hace `novel_film_builder.py`; una copia ingenua no).
  Por eso `knot_keyart.py` escribía archivos de 0 bytes mientras reportaba 403 en generación.
- `grok-imagine-image` **403 es rate limit transitorio**, NO rechazo de contenido (el mismo
  prompt devuelve 200 segundos después). Backoff 10/25/50/90 s; no quemar reintentos a 4 s.
- `grok-imagine-video-1.5` sale **1280x720 16:9 con aac** → necesita el crop 2.39 a 1280x536.
- Una hoja de contacto 4x3 con tiles de ~420 px hace alucinar al modelo de visión. Todo defecto
  reportado desde una hoja se **confirma a resolución nativa** antes de actuar (así se encontró el
  quad-split oculto de FC-S05 — y así se descartó un falso positivo de «split-screen»).
- `deploy_origin.sh` comparaba `HEAD` vs `origin/main` y salteaba deploys locales en silencio.
  Arreglado en `a89e3bd6` (compara `.deploy-last.head`). `_site_public` es un **bind mount read-only**
  de `twenty-caddy`: si cambia su inodo, `goalworld.fun` entero da 404 hasta
  `docker restart twenty-caddy`. **Nunca borrar/recrear ese directorio.**
- Cloudflare cachea los 404. Verificar siempre una publicación nueva con `?cb=$(date +%s%N)`.
- `probe.py` sobre un archivo recién escrito da `moov atom not found`: está a medio escribir, no
  corrupto (el átomo se escribe al final). Esperar al proceso.
- `bc` no está instalado en los shells de job → hacer aritmética con `python3`.

### Estado al entregar

- 9 key arts de nudos: **9/9 PASS** en la regla dura (cero texto legible, sin defectos anatómicos,
  brief cumplido, look consistente) — `edit/knots/K*.png`
- 22 líneas de diálogo generadas — `edit/knots/vo/`
- 20 renders i2v (9 maestras + 11 de cobertura; `K7_the_chair` tiene 4 por ser el clímax)
- v7 publicado y vivo: `https://goalworld.fun/assets/img/neuralwars/FC_minifilm_239_v2.mp4`
  (409,1 s · 2.39 · 24 fps CFR · −16,0 LUFS · TP −1,4 · critic 9/10 SHIPPABLE)
- `grok-imagine-image` + `grok-imagine-video-1.5` autenticados vía `grok login --device-auth`
  → `~/.grok/auth.json`. **NO correr `sync-xai-oauth-fleet.py`** (copia el refresh token a 9
  archivos y es lo que revocó el login de Nico la vez pasada).
- Bloqueo vivo: `gemini` TTS 403 (API deshabilitada en el proyecto de Google) y sin keys de
  ElevenLabs/OpenAI → voces diferenciadas por mezcla hasta que haya una key real.
