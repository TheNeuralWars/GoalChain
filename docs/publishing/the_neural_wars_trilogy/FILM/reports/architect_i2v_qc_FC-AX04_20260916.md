# Architect i2v QC — FC-AX04

**Date:** 2026-09-16 (Europe/Rome)  
**Shot:** `FC-AX04`  
**Seed:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX04.png`  
**Clip:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX04.mp4`  
**Model:** `grok-imagine-video-1.5` (i2v via xai_client.generate_video)  
**Image model:** `grok-imagine-image-quality`  
**Target duration_s:** 5  
**Measured duration_s:** 5.042  
**Resolution:** 1280x720@24/1  
**Motion energy (mean |Δ| @4fps 96x54 gray):** 1.0367  
**Retries this shot:** 0  
**SuperGrok quota error:** no  
**3-frame strip:** `/tmp/fc_ax_qc/FC-AX04_strip.png`  

## Verdict: **PASS**

### Hard-fail checklist

| # | Criterion | Result | Notes |
|---|---|---|---|
| 1 | Duration ≈ target (±1.0s) | **PASS** | measured 5.042s vs 5s |
| 2 | Motion energy not static (≥1.0) | **PASS** | 1.0367 |
| 3 | Single camera / no collage | **PASS** | from 3-frame strip native-res review |
| 4 | No readable text / logos / HUD | **PASS** | letter-by-letter intent; see notes |
| 5 | Architect presence grammar | **PASS** | threat/surveillance; face withheld for presence shots |
| 6 | Seed used (i2v not t2v) | **PASS** | first-frame continuity vs seed |

### Notes
Native strip: hooded Architect silhouette from behind in Neo-Citania residential canyon; face fully withheld; indigo Coil glow at back/chest; fog breath; building grids stable. Framing closer than extreme-distant ideal but presence grammar OK. Motion energy borderline (1.04) but above static floor — fog/glow pulse visible across f0-f2. No collage; no readable text.

### Paths
- seed png: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX04.png`
- mp4: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX04.mp4`
- strip: `/tmp/fc_ax_qc/FC-AX04_strip.png`
