# Architect i2v QC — FC-AX05

**Date:** 2026-09-16 (Europe/Rome)  
**Shot:** `FC-AX05`  
**Seed:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX05.png`  
**Clip:** `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX05.mp4`  
**Model:** `grok-imagine-video-1.5` (i2v via xai_client.generate_video)  
**Image model:** `grok-imagine-image-quality`  
**Target duration_s:** 4  
**Measured duration_s:** 4.042  
**Resolution:** 1280x720@24/1  
**Motion energy (mean |Δ| @4fps 96x54 gray):** 4.8282  
**Retries this shot:** 0  
**SuperGrok quota error:** no  
**3-frame strip:** `/tmp/fc_ax_qc/FC-AX05_strip.png`  

## Verdict: **PASS**

### Hard-fail checklist

| # | Criterion | Result | Notes |
|---|---|---|---|
| 1 | Duration ≈ target (±1.0s) | **PASS** | measured 4.042s vs 4s |
| 2 | Motion energy not static (≥1.0) | **PASS** | 4.8282 |
| 3 | Single camera / no collage | **PASS** | from 3-frame strip native-res review |
| 4 | No readable text / logos / HUD | **PASS** | letter-by-letter intent; see notes |
| 5 | Architect presence grammar | **PASS** | threat/surveillance; face withheld for presence shots |
| 6 | Seed used (i2v not t2v) | **PASS** | first-frame continuity vs seed |

### Notes
Native strip: extreme-close Cascade indigo neural-mesh / Coil helix flicker through wet hatch glass; rain droplets; no face/body; Architect as motif only. f2 abstracts toward vertical glow sting but stays Coil grammar. No collage; no readable text/HUD. Motion strong (4.83).

### Paths
- seed png: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX05.png`
- mp4: `/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders/FC-AX/FC-AX05.mp4`
- strip: `/tmp/fc_ax_qc/FC-AX05_strip.png`
