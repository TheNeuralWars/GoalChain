# QC Visual — The Neural Wars / Fractured Code (film draft)

**Fecha:** 2026-09-24 · **Reviewer:** hermes-ceo (visión frame-by-frame a resolución nativa)
**Método:** `ai-film-visual-qc`. Métricas objetivas (ffprobe / motion energy / audio) primero,
revisión de visión a **1280x720 nativo** después — nunca tiles reducidos (el modelo alucina
géneros enteros por debajo de ~500px).
**Material:** 616 videos únicos (855 con duplicados, 11 GB). QC profundo sobre el entregable
del film: **17 cortes armados** (8 escenas x v1/v2) + 88 shots en `FILM/renders/`.
**Autoridad:** `FILM/CANON.md` → `VISUAL_BIBLE.md` → `wardrobe.md` → `locks/` → `WORLD_TOKENS.json`.

---

## VEREDICTO

**Aprobable para mostrar como DRAFT con reservas.** Las tres reglas más importantes se sostienen
en todo el material revisado. Hay **4 violaciones de reglas duras** (todas del mismo clase: el
modelo inventa marcas/pseudo-letra en ropa y manos) y **un defecto de continuidad documentado**
que se repite. El film **NO está completo** y no debe presentarse como terminado.

---

## EL FILM ESTÁ INCOMPLETO — no presentarlo como acabado

`ledger.json` → `status: fc_s08_partial_blocked_api_403_cli_402`, `next_pending: FC-S08`

> `FC-S08-07/08 blocked: xAI API 403 + Grok CLI 402 balance exhausted; cut is 6/8`

Estados: **7 x `rendered_8_8`, 1 x `rendered_6_8_blocked`** — 8 escenas, FC-S08 con **6/8**.
Coincide con los créditos de xAI agotados que detectamos hoy.

Segundo blocker abierto:

> `FC-S01-08 native video is 736x400 (CLI fallback) vs 848x480 API shots; cut uses normalized copy`

---

## REGLAS DURAS — 3 se sostienen, 4 se rompen

### ✅ Se sostienen

| Regla | Evidencia |
|---|---|
| **Sin texto legible** | `NO TEXT VISIBLE` en los **6 frames** revisados a resolución nativa |
| **Una cámara, sin panel múltiple** | 6/6 "single camera shot", ningún composite |
| **i2v real (no still con ruido)** | motion energy media **7,4–17,4** (umbral de estático: 1,0). 0 frames estáticos en 7 de 9 cortes |
| **Audio presente** | `aac` en los 17 cortes |

### 🔴 Se rompen — con la causa raíz

**1. LOGOS EN ROPA** (FC-S03) — `wardrobe.md` dice `BLANK plates, zero lettering`, `no logos`.
> visión FC-S03 t24: *"a small, stylized logo on the upper right chest area... **it resembles a bird or wing**"* (mujer) y *"a small, **square logo** on the upper right chest"* (hombre).
> visión FC-S06 t22: *"A small, **triangular patch** is visible on her left shoulder"*

→ **Causa:** el modelo pinta insignia donde el prompt pide chapa lisa. Ya está documentado en
`LOCK_SHEET_SIERRA_CATALANO.md` como defecto persistente: *"a BLANK rectangular shoulder patch
persists"*. **Fix:** añadir al negativo `no shoulder patch, no chest logo, no insignia, sleeves
completely plain, blank plates`.

**2. PSEUDO-LETRA EN EL GUANTE** (FC-S08) — viola "no readable text" en espíritu.
> visión FC-S08 t36: *"glowing purple, **illegible symbols or circuitry** on the back"* y, en la
> verificación de artefactos: *"The purple symbols on the glove are typical **'AI gibberish'** —
> shapes that resemble writing but have no semantic meaning."*

→ **Causa:** el prompt pide "neural-mesh / Coil residual glow" y el modelo lo materializa como
escritura falsa. **Fix:** `abstract glyph-free circuitry, no lettering-like shapes, no pseudo-text`.

**3. TATTOO QUE LEE COMO TEXTO** (FC-S03) — *"A tattoo on his left forearm that appears to read
**'33' or 'EE'**"*. El CANON prohíbe texto legible; esto es letra inventada. **Fix:** `unmarked
forearm, no tattoos, no numerals`.

**4. LA CICATRIZ SE INVENTA / CAMBIA DE LADO** (FC-S08) — el defecto más caro del film.
`WORLD_TOKENS.json` → `sierra_catalano.scars: ['pale scar LEFT cheek temple to jaw']`, y el lock
sheet es explícito:

> `Corporate-raid scar | Pale scar LEFT cheek, temple → jaw | Always present when face visible;
> **never right cheek**`
> `**QC: Sierra weak.** Outfit and scar side drift are the main failures.`
> `Consistency weak (FC-S04 ~4/10). Outfit changes 3–4×; LEFT cheek scar missing or wrong side;
> **extra woman confusable with lead**.`

→ **Causa (según el skill):** *"A contaminated reference beats any text instruction"* + el prior
del modelo *"facial scars invented on an unscarred character"*. Las refs en `locks/refs/` son la
única cura real. **Fix:** regenerar Sierra **text-only**, QC la still limpia, y encadenarla como
ancla; pasar `reference_images` en **cada** shot de Sierra.

---

## CONTINUIDAD POR PERSONAJE (visión a resolución nativa)

| Escena | Personaje en pantalla | ¿Canon? | Detalle |
|---|---|---|---|
| **FC-S01** t47 | 1 hombre: *"Asian male, early 30s, short black crew cut, green eyes"* | ✅ **Mileo Chen** | Ojos `vivid green` ✅, crew cut ✅ |
| **FC-S03** t24 | 2: mujer de pelo oscuro al hombro + hombre, **uniforme a juego** | ⚠️ | Chaleco marrón con franjas naranjas = las `copper seam accents (#FF8C00)` de wardrobe, pero *"bright orange reflective stripes on the sides"* es **más que "at seams only"** |
| **FC-S06** t22 | 1 mujer: pelo recogido, **barra roja de luz sobre los ojos**, marcas geométricas en la frente, rifle | ⚠️ | Las *"dark geometric markings... look slightly 'painted on'"* no están en ningún lock sheet |
| **FC-S08** t36 | 1 mujer: *"dark brown hair in a low ponytail", "thin scar... left cheekbone", navy + cuero* | ⚠️ **Sierra con pelo MALO** | Sierra canon = *"dark practical **short commander hair**"*, **no coleta** |

### 🔴 COLOR DEL SERPENT COIL — drift medible
`mileo_chen.scars`: *"`Serpent Coil LEFT wrist` **indigo** bioluminescence (post-cut only)"* —
paleta `#4B0082 / #3F00FF / #0080FF` (índigo/azul).

> visión FC-S01 t47: *"A distinct, bright **cyan/white glow** emanates from the man's left
> forearm... a complex, glowing cybernetic tattoo or interface that wraps around his forearm and
> wrist."*

✅ **El LADO es correcto** (LEFT wrist/forearm).
🔴 **El COLOR se fue a cian/blanco** en vez del índigo canónico. **Fix:** `indigo bioluminescence
#4B0082, never cyan, never white-hot`.

---

## ARTEFACTOS DE IA — el defecto consistente del material

**MANOS** en todos los frames con manos visibles (el defecto #1, 3/3):
- FC-S01: *"fingers appear **fused and blurry**, lacking distinct knuckles and separation... the
  right hand also looks somewhat stiff and **claw-like**"*
- FC-S06: *"fingers on her left hand... appear somewhat **fused and indistinct**. The thumb is not
  clearly defined"*
- FC-S03: *"hands holding the guns... look **slightly stiff and lack realistic knuckle definition**"*

Recurrentes además: piel *"uncanny smoothness / waxy"*, pelo *"painted, unnaturally uniform"*,
texturas *"painterly"*, y el rifle de FC-S06 *"magazine and handguard details... appearing slightly
**melted**"*.

→ **Fix:** encuadres que eviten manos cerradas en primer plano, o regen de esos shots con
`hands in pocket / hands out of frame / weapon held loosely` + negativo `no fused fingers`.

---

## ENTREGA — tabla medida (ffprobe, 17 cortes)

| Corte | v1 | v2 |
|---|---|---|
| FC-S01 | 848x480 · 62,4 s · 1496 fr | **1280x720** · 48,4 s · 1160 fr |
| FC-S02 | 848x480 · 64,4 s | 1280x720 · 48,4 s · **1160 fr** |
| FC-S03 | 848x480 · 64,4 s | 1280x720 · 48,4 s · **1160 fr** |
| FC-S04 | 848x480 · 64,4 s | 1280x720 · 46,4 s · 1112 fr |
| FC-S05 | 848x480 · 64,4 s | 1280x720 · 48,4 s · **1160 fr** |
| FC-S06 | 848x480 · 64,4 s | 1280x720 · 44,4 s · 1064 fr |
| FC-S06A | — | 1280x720 · 24,2 s · 580 fr |
| FC-S07 | 848x480 · 64,4 s | 1280x720 · 43,4 s · 1040 fr |
| FC-S08 | 848x480 · 48,3 s | 1280x720 · 37,3 s · 895 fr |

- **v2 sube la resolución** (848x480 → 1280x720) pero **recorta duración** (64 s → 48 s).
- 🔴 **Sospecha de plantilla:** FC-S02, S03 y S05 tienen **exactamente 1160 frames** (48,35 s) e
  idéntico `r_frame_rate` y duración que FC-S01. Tres escenas distintas con duración bit a bit
  igual no es montaje real. **Revisar si v2 aplica un pad/recorte fijo por plantilla.**
- **Aspecto 16:9 (1,78), no el 2.39 del CANON.** El propio CANON lo declara deuda conocida:
  *"interim 16:9 SD is pipeline debt, not bible"*.

---

## FIX LIST POR PRIORIDAD

1. **🔴 Sierra: pelo y cicatriz.** Regenerar text-only → QC la still limpia → encadenarla como ancla
   → pasar `reference_images` en cada shot. Negativo: `no ponytail, no second scar, no shoulder
   patch`. Es el defecto documentado más caro (`FC-S04 ~4/10`).
2. **🔴 Completar FC-S08-07/08** — o declarar el film incompleto en el empaquetado. Necesita
   crédito de xAI / Grok CLI.
3. **🔴 Pseudo-letra: guante (S08), tatuaje (S03), logos/patches (S03, S06).** Un solo negativo
   nuevo ataca los cuatro: `no lettering-like shapes, no pseudo-text, no numerals, no logos, no
   insignia, no shoulder patch, blank plates only`.
4. **🟠 Serpent Coil: índigo, no cian.** `#4B0082`, nunca cyan ni blanco caliente.
5. **🟠 Manos.** 3/3 frames con manos tienen dedos fusionados. Reencuadrar o regen.
6. **🟠 Verificar el recorte a 1160 frames** en S02/S03/S05 (¿plantilla?).
7. **🟡 2.39** — deuda conocida, no bloquea un draft.

---

## LO QUE NO ES DEFECTO (para no perseguir fantasmas)

- **Los entornos distintos entre escenas son CANON.** `WORLD_TOKENS.locations` incluye tanto
  `sector_17_link` / `underbelly_alley` (el callejón ruin y lluvioso de FC-S01) como
  `neo_citania_glass` (la plaza limpia de vidrio de FC-S08). Neo-Citania es una megalópolis
  con núcleo administrativo pulido y periferia en ruinas. **No reportar como drift de mundo.**
- **Los frames de apertura vacíos** (FC-S01 y FC-S08 en t=1) son establishing shots.
- **2 frames estáticos en FC-S02 y FC-S03** (2/96 c/u) son holds de montaje, no stills falsos:
  el motion energy medio es 12,6 y 7,4.

---

## EVIDENCIA

Frames a resolución nativa (1280x720) en
`/data/hermes-home/cache/scratch/qc_frames/` (27 frames, 8 escenas).
Métricas: `/data/hermes-home/cache/scratch/qc_metrics.json`.
