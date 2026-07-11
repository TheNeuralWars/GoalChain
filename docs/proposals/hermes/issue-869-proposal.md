# Proposal — Issue #869: Growth Agent Tasks

**Owner:** Hermes-CEO → FCC (Free Claude Code)
**Date:** 2026-06-04
**Priority:** P1
**Mode:** `cambio urgente` — direct main, no feature branch

---

## Status de las 5 tareas

| # | Task | Status | Owner |
|---|------|--------|-------|
| 1 | X/Twitter Media Attachments | ✅ DONE | x_budget_poster.py ya tiene `--image` flag |
| 2 | Player NFT Card Image Generation Pipeline | ❌ FALTA | necesita script + update marketplace |
| 3 | Zealy Quest Verification Webhook | ✅ DONE | endpoint en API (index.ts:1504-1605) |
| 4 | Launch First Paid Ad Campaign | ❌ MANUAL | necesita ADS_SETUP.md |
| 5 | Mobile PWA + Responsive Landing | ⚠️ PARCIAL | falta sw.js (manifest y registro existen) |

---

## Implementación propuesta

### Task 5 — Completar PWA: crear sw.js

**Archivo:** `goalchain_webapp/public/sw.js`

Service worker básico para:
- Cache de assets estáticos (CSS, JS, fonts, imágenes NFT)
- Estrategia cache-first para assets públicos
- Red de fallback para API calls
- No blocking, no crash si falla

### Task 2 — Pipeline de Generación de Imágenes NFT

**Archivos a crear:**
1. `scripts/generate_nft_images/generate.py` — genera SVG cards
2. `scripts/generate_nft_images/requirements.txt` — dependencias (cairosvg)

**Archivos a modificar:**
3. `goalchain_webapp/src/ui/NFTMarketplace.tsx` — mostrar imágenes en lugar de ⚽
4. `goalchain_webapp/src/ui/LayeredNftCard.tsx` — soporte para image prop

**Approach:** Generación SVG con Python (cairosvg), output a PNG/WebP en `goalchain_webapp/public/assets/img/nfts/`. Naming: `{id}_{slug}.png`. Script lee `docs/assets/data/nft_metadata_index.json` + `docs/assets/data/players.json`.

### Task 4 — Documentar Twitter Ads Setup

**Archivo a crear:** `docs/ADS_SETUP.md`

Guía paso a paso para activar primera campaña Twitter Ads de $1K.

---

## Riesgos y Regresiones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| sw.js rompe PWA en producción | BAJA | registro non-blocking en main.tsx; error logged no crash |
| generar 528 imágenes consume mucho tiempo | BAJA | batch con rate-limit; 44 ya existen, skip si ya existe |
| modificar NFTMarketplace rompe existing layout | MEDIA | cambios focalizados; verificar con `npm run build` |
| ADS_SETUP.md referencia features no implementadas | BAJA | solo documentar estado actual |

**Rollback:** `git checkout HEAD~1 -- goalchain_webapp/public/sw.js goalchain_webapp/src/ui/NFTMarketplace.tsx`

---

## Test Commands

```bash
# Webapp build (siempre ejecutar antes de finalizar)
cd goalchain_webapp && npm run build

# Verificar sw.js se sirve
curl -s http://localhost:4173/sw.js | head -20

# Verificar manifest.json se sirve
curl -s http://localhost:4173/manifest.json

# Generar imágenes NFT (dry-run primero)
cd scripts/generate_nft_images && python3 generate.py --dry-run
python3 generate.py --limit 10  # procesar 10 primero
```

---

## Task List (texto plano, no todowrite)

1. Crear sw.js en goalchain_webapp/public/
2. Crear scripts/generate_nft_images/generate.py
3. Crear scripts/generate_nft_images/requirements.txt
4. Modificar LayeredNftCard.tsx para soportar image prop
5. Modificar NFTMarketplace.tsx para usar imágenes
6. Crear docs/ADS_SETUP.md
7. npm run build en goalchain_webapp
8. Limpiar docs/intake/2026-06-04-growth-agent.md (marcar cerrado)