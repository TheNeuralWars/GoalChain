# Architect i2v QC — FC-AX03

**Date:** 2026-09-16 (Europe/Rome)  
**Shot:** `FC-AX03`  
**Seed:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX03.png`  
**Clip:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX03.mp4`  
**Model:** `grok-imagine-video-1.5` (i2v via xai_client.generate_video)  
**Image model:** `grok-imagine-image-quality`  
**Target duration_s:** 6  
**Measured duration_s:** 6.042  
**Resolution:** 1280x720@24/1  
**Motion energy (mean |Δ| @4fps 96x54 gray):** 2.9906  
**Retries this shot:** 0  
**SuperGrok quota error:** no  
**3-frame strip:** `/tmp/fc_ax_qc/FC-AX03_strip.png`  

## Verdict: **PASS**

### Hard-fail checklist

| # | Criterion | Result | Notes |
|---|---|---|---|
| 1 | Duration ≈ target (±1.0s) | **PASS** | measured 6.042s vs 6s |
| 2 | Motion energy not static (≥1.0) | **PASS** | 2.9906 |
| 3 | Single camera / no collage | **PASS** | from 3-frame strip native-res review |
| 4 | No readable text / logos / HUD | **PASS** | letter-by-letter intent; see notes |
| 5 | Architect presence grammar | **PASS** | threat/surveillance; face withheld for presence shots |
| 6 | Seed used (i2v not t2v) | **PASS** | first-frame continuity vs seed |

### Notes
Native strip: extreme-wide empty service corridor; copper mesh bands; indigo Coil tendrils along mesh; abstract assault-drone silhouettes with sweep beams; purple floor fog; no human Architect body; no collage; no readable text/logos/unit IDs. Seed continuity holds (drone drift + beam rake).

### Paths
- seed png: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX03.png`
- mp4: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX03.mp4`
- strip: `/tmp/fc_ax_qc/FC-AX03_strip.png`
