# Prompt negatives — from Visual QC 2026-09-24

**Source:** `reports/VISUAL_QC_full_library_20260924.md`  
**Policy:** docs/prompt hygiene only. No Imagine / i2v until SuperGrok or xAI balance is back.  
**Apply** these strings into `image_prompt` / `video_prompt` negatives (and lock sheets) before any regen.

## Global (every character shot)

```
no logos, no insignia, no shoulder patch, no chest logo, blank plates,
sleeves completely plain, no readable text, no lettering-like shapes,
no pseudo-text, no numerals on skin, unmarked forearm, no tattoos,
abstract glyph-free circuitry only
```

## Sierra Catalano (scar / outfit)

```
pale scar LEFT cheek temple to jaw always when face visible,
never right cheek, never missing scar, leather + black pants locked,
no lookalike second woman, blank rectangular shoulder patch forbidden
```

## Kora Vega

```
copper vest on female Kora only, never on male, RIGHT ear scar visible when applicable,
LEFT clavicle ridge, no UI text, blank plates
```

## Glove / Coil glow (FC-S08 especially)

```
abstract glyph-free circuitry, no lettering-like shapes, no pseudo-text,
Coil residual glow without symbols that resemble writing
```

## Hard queue when credits return (from QC + ledger)

1. FC-S08-07 / FC-S08-08 — blocked today (`api_403` / `cli_402`); finish 8/8 then rebuild cut.
2. FC-S01-08 — native 736x400 CLI fallback vs 848x480; prefer API size when spendable.
3. Optional CG motion flags (human look): FC-S06-01, FC-S06-05, FC-S08-06.

## Do not

- Present the film as finished (S08 still 6/8).
- Pure t2v; overwrite `_cut_v1`; spend Imagine while balance exhausted.
