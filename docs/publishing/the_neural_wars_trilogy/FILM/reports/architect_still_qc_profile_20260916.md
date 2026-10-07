# Architect still QC — profile

**Date:** 2026-09-16 (Europe/Rome)  
**Still id:** `profile`  
**View:** profile (true side)  
**Dest:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/locks/refs/the_architect/profile.png`  
**Bytes:** 448964  
**Native res:** 1280x720 (real PNG; API returned JPEG, rewritten via PIL)  
**Model:** `grok-imagine-image-quality` via `nw_regen_20260914/xai_client.generate_image`  
**SuperGrok quota error:** no  

## Attempts
1. **FAIL** — embossed shoulder logo/emblem (stylized eye + vertical bars). Backed to `profile_attempt1_fail.png` then removed from lock dest after retry.  
2. **PASS** (final) — blank monolithic cloak; no emblems.

## Verdict: **PASS**

Native-resolution vision review (box Read on full 1280x720 frame + shoulder/mid crops). Hermes `chat --image` attempted but provider returned HTTP 401 / model unavailable; QC completed with native-res vision path per ai-film-visual-qc skill (do not trust downscaled tiles alone — full frame + shoulder/mid crops inspected).

### Hard-fail checklist

| # | Criterion | Result | Notes |
|---|---|---|---|
| 1 | Single camera / no collage / no multi-panel | **PASS** | One continuous cinematic frame; no diptych, quad-split, storyboard tiles |
| 2 | True side profile; face unreadable / veiled | **PASS** | Clean side silhouette facing right; hood interior featureless black; no eyes/mouth/skin/celebrity |
| 3 | Indigo Coil residual OK | **PASS** | Thin indigo/violet rim along hood/shoulder + faint neural-mesh nodes/lines; environmental system motif |
| 4 | No readable text / logos / HUD | **PASS** | Letter-by-letter + emblem scan on cloth/walls/air: no glyphs, no shoulder badge, no HUD, no faction labels, no watermarks. **TEXT_TRANSCRIPT:** none |
| 5 | View / presence grammar / PG-13 | **PASS** | Medium-close side presence; void/steel wardrobe; Atmosphere fog + Neo-Citania steel bounce; cold surveillance; no gore |

### Reasons (summary)
- Presence lock matches LOCK_SHEET_THE_ARCHITECT / REF_GEN_SPEC profile prompt intent after one retry.
- Attempt 1 hard-failed on logos; attempt 2 clears all hard-fail items — approve this still only.
- `bust` remains **pending** — do not generate in this pass. No i2v.

### Next gate recommendation
Proceed Gate B item 3: generate **`bust.png` only** (same one-still + vision QC loop). Hold Gate C i2v until 3/3 stills approved.
