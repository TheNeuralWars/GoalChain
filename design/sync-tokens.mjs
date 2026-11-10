#!/usr/bin/env node
/**
 * GoalWorld Design Tokens Generator & Drift Verifier
 * --------------------------------------------------
 * Single source of truth: design/tokens.json
 * Targets:
 *   1. goalworld_site/src/assets/css/site.css (token block)
 *   2. goalchain_webapp/src/styles/tokens.css (full file)
 *
 * Usage:
 *   node design/sync-tokens.mjs          # syncs both CSS files + verifies WCAG AA
 *   node design/sync-tokens.mjs --check  # verifies zero drift + WCAG AA (exits 1 on drift)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const TOKENS_PATH = join(HERE, "tokens.json");
const SITE_CSS_PATH = join(ROOT, "goalworld_site/src/assets/css/site.css");
const WEBAPP_TOKENS_PATH = join(ROOT, "goalchain_webapp/src/styles/tokens.css");

const BEGIN_MARKER = "/* === BEGIN GENERATED TOKENS (design/tokens.json) === */";
const END_MARKER = "/* === END GENERATED TOKENS (design/tokens.json) === */";

function hexToRgb(hex) {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]) {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(hexA, hexB) {
  const l1 = relativeLuminance(hexToRgb(hexA));
  const l2 = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function verifyWcag(tokens) {
  const results = [];
  for (const pair of tokens.wcagPairs || []) {
    const ratio = contrastRatio(pair.fg, pair.bg);
    const min = Math.max(4.5, pair.minRatio || 4.5);
    if (ratio < min) {
      throw new Error(
        `WCAG contrast check failed for "${pair.label}" (${pair.fg} on ${pair.bg}): ${ratio.toFixed(2)}:1 < ${min}:1`
      );
    }
    results.push({ ...pair, ratio: Number(ratio.toFixed(2)) });
  }
  return results;
}

function buildCanonicalVars(t) {
  const c = t.color;
  const ty = t.typography;
  const sp = t.spacing;
  const r = t.radii;
  const el = t.elevation;
  const m = t.motion;
  const bp = t.breakpoints;

  return [
    "  /* --- Canonical Studio Palette (Obsidian & Warm Amber) --- */",
    `  --gw-bg: ${c.bg};`,
    `  --gw-bg-elev: ${c.bgElev};`,
    `  --gw-bg-hover: ${c.bgHover};`,
    `  --gw-bg-deep: ${c.bgDeep};`,
    `  --gw-bg-card: ${c.bgCard};`,
    `  --gw-bg-glass: ${c.bgGlass};`,
    `  --gw-bg-glass-strong: ${c.bgGlassStrong};`,
    `  --gw-bg-glass-frost: ${c.bgGlassFrost};`,
    `  --gw-ink: ${c.ink};`,
    `  --gw-muted: ${c.muted};`,
    `  --gw-faint: ${c.faint};`,
    `  --gw-ink-inverse: ${c.inkInverse};`,
    `  --gw-amber: ${c.amberPrimary};`,
    `  --gw-amber-light: ${c.amberLight};`,
    `  --gw-amber-deep: ${c.amberDeep};`,
    `  --gw-amber-grad: ${c.amberGrad};`,
    `  --gw-cobalt: ${c.cobaltCode};`,
    `  --gw-cobalt-text: ${c.cobaltText};`,
    `  --gw-crimson: ${c.crimsonCinema};`,
    `  --gw-crimson-text: ${c.crimsonText};`,
    `  --gw-violet: ${c.violetStudio};`,
    `  --gw-violet-text: ${c.violetText};`,
    `  --gw-success: ${c.success};`,
    `  --gw-success-text: ${c.successText};`,
    `  --gw-warning: ${c.warning};`,
    `  --gw-warning-text: ${c.warningText};`,
    `  --gw-danger: ${c.danger};`,
    `  --gw-danger-text: ${c.dangerText};`,
    `  --gw-info: ${c.info};`,
    `  --gw-line: ${c.line};`,
    `  --gw-line-strong: ${c.lineStrong};`,
    `  --gw-line-amber: ${c.lineAmber};`,
    `  --gw-line-cobalt: ${c.lineCobalt};`,
    "",
    "  /* --- Typography & Fluid Type Scale --- */",
    `  --gw-font-sans: ${ty.fontSans};`,
    `  --gw-font-serif: ${ty.fontSerif};`,
    `  --gw-font-mono: ${ty.fontMono};`,
    `  --gw-fs-xs: ${ty.scale.xs};`,
    `  --gw-fs-sm: ${ty.scale.sm};`,
    `  --gw-fs-base: ${ty.scale.base};`,
    `  --gw-fs-lead: ${ty.scale.lead};`,
    `  --gw-fs-h3: ${ty.scale.h3};`,
    `  --gw-fs-h2: ${ty.scale.h2};`,
    `  --gw-fs-h1: ${ty.scale.h1};`,
    `  --gw-fs-display: ${ty.scale.display};`,
    `  --gw-fw-regular: ${ty.weights.regular};`,
    `  --gw-fw-medium: ${ty.weights.medium};`,
    `  --gw-fw-semibold: ${ty.weights.semibold};`,
    `  --gw-fw-bold: ${ty.weights.bold};`,
    `  --gw-fw-black: ${ty.weights.black};`,
    "",
    "  /* --- Spacing, Radii, Elevation & Motion --- */",
    `  --gw-space-1: ${sp.space1};`,
    `  --gw-space-2: ${sp.space2};`,
    `  --gw-space-3: ${sp.space3};`,
    `  --gw-space-4: ${sp.space4};`,
    `  --gw-space-5: ${sp.space5};`,
    `  --gw-space-6: ${sp.space6};`,
    `  --gw-space-7: ${sp.space7};`,
    `  --gw-space-8: ${sp.space8};`,
    `  --gw-radius-xs: ${r.xs};`,
    `  --gw-radius-sm: ${r.sm};`,
    `  --gw-radius-md: ${r.md};`,
    `  --gw-radius-lg: ${r.lg};`,
    `  --gw-radius-xl: ${r.xl};`,
    `  --gw-radius-pill: ${r.pill};`,
    `  --gw-shadow-card: ${el.card};`,
    `  --gw-shadow-elev: ${el.elevated};`,
    `  --gw-shadow-amber: ${el.amberGlow};`,
    `  --gw-shadow-amber-hover: ${el.amberGlowHover};`,
    `  --gw-shadow-cobalt: ${el.cobaltGlow};`,
    `  --gw-focus-ring: ${el.focusRing};`,
    `  --gw-inset-highlight: ${el.insetHighlight};`,
    `  --gw-ease: ${m.ease};`,
    `  --gw-ease-out: ${m.easeOut};`,
    `  --gw-dur-fast: ${m.durFast};`,
    `  --gw-dur-base: ${m.durBase};`,
    `  --gw-dur-slow: ${m.durSlow};`,
    `  --gw-dur-reveal: ${m.durReveal};`,
    `  --gw-maxw: ${bp.maxw};`,
  ].join("\n");
}

function buildSiteTokenBlock(t) {
  const canonical = buildCanonicalVars(t);
  return [
    BEGIN_MARKER,
    ":root {",
    canonical,
    "",
    "  /* --- goalworld_site short aliases --- */",
    "  --bg: var(--gw-bg);",
    "  --bg-elev: var(--gw-bg-elev);",
    "  --bg-hover: var(--gw-bg-hover);",
    "  --bg-card: var(--gw-bg-card);",
    "  --ink: var(--gw-ink);",
    "  --muted: var(--gw-muted);",
    "  --faint: var(--gw-faint);",
    "  --line: var(--gw-line);",
    "  --line-strong: var(--gw-line-strong);",
    "  --amber-primary: var(--gw-amber);",
    "  --green: var(--gw-amber);",
    "  --amber: var(--gw-warning);",
    "  --grad: var(--gw-amber-grad);",
    "  --code: var(--gw-cobalt);",
    "  --code-text: var(--gw-cobalt-text);",
    "  --cinema: var(--gw-crimson);",
    "  --cinema-text: var(--gw-crimson-text);",
    "  --purple: var(--gw-violet);",
    "  --purple-text: var(--gw-violet-text);",
    "  --cyan: var(--gw-info);",
    "  --success: var(--gw-success-text);",
    "  --danger: var(--gw-danger-text);",
    "  --sans: var(--gw-font-sans);",
    "  --serif: var(--gw-font-serif);",
    "  --mono: var(--gw-font-mono);",
    "  --radius: var(--gw-radius-lg);",
    "  --radius-sm: var(--gw-radius-sm);",
    "  --maxw: var(--gw-maxw);",
    "  --ease: var(--gw-ease);",
    "  color-scheme: dark;",
    "}",
    END_MARKER,
  ].join("\n");
}

function buildWebappTokensFile(t) {
  const canonical = buildCanonicalVars(t);
  return [
    "/**",
    " * GoalWorld / Matchday Lab — Unified Design System Tokens",
    " * -------------------------------------------------------",
    " * AUTO-GENERATED by `node design/sync-tokens.mjs` from `design/tokens.json`.",
    " * Do not hand-edit without running `node design/sync-tokens.mjs`.",
    " */",
    BEGIN_MARKER,
    ":root {",
    canonical,
    "",
    "  /* --- Matchday Lab (--gc-*) Studio Mapping --- */",
    "  --gc-bg: var(--gw-bg);",
    "  --gc-bg-elev: var(--gw-bg-elev);",
    "  --gc-bg-deep: var(--gw-bg-deep);",
    "  --gc-grid-line: rgba(255, 255, 255, 0.018);",
    "  --gc-radial-purple: rgba(59, 130, 246, 0.09);",
    "  --gc-radial-green: rgba(229, 169, 60, 0.09);",
    "",
    "  /* Primary Studio Accents (Warm Amber + Cobalt Code) */",
    "  --gc-green: var(--gw-amber);",
    "  --gc-amber: var(--gw-amber);",
    "  --gc-code: var(--gw-cobalt);",
    "  --gc-code-text: var(--gw-cobalt-text);",
    "  --gc-purple: var(--gw-cobalt);",
    "  --gc-violet: var(--gw-violet);",
    "  --gc-red: var(--gw-danger);",
    "  --gc-emerald: var(--gw-success);",
    "",
    "  /* Alpha Variants (Warm Amber & Cobalt) */",
    "  --gc-green-a08: rgba(229, 169, 60, 0.08);",
    "  --gc-green-a12: rgba(229, 169, 60, 0.14);",
    "  --gc-green-a20: rgba(229, 169, 60, 0.22);",
    "  --gc-green-a45: rgba(229, 169, 60, 0.45);",
    "  --gc-purple-a08: rgba(59, 130, 246, 0.08);",
    "  --gc-purple-a12: rgba(59, 130, 246, 0.14);",
    "  --gc-purple-a20: rgba(59, 130, 246, 0.22);",
    "  --gc-purple-a45: rgba(59, 130, 246, 0.45);",
    "  --gc-red-a08: rgba(239, 68, 68, 0.08);",
    "  --gc-red-a12: rgba(239, 68, 68, 0.14);",
    "  --gc-red-a25: rgba(239, 68, 68, 0.25);",
    "",
    "  /* Text & Ink (WCAG AA Verified) */",
    "  --gc-text: var(--gw-ink);",
    "  --gc-text-dim: var(--gw-muted);",
    "  --gc-text-faint: var(--gw-faint);",
    "  --gc-text-inverse: var(--gw-ink-inverse);",
    "",
    "  /* Borders & Surfaces */",
    "  --gc-border: var(--gw-line);",
    "  --gc-border-strong: var(--gw-line-strong);",
    "  --gc-border-hover: var(--gw-line-amber);",
    "  --gc-border-purple: var(--gw-line-cobalt);",
    "  --gc-glass-bg: rgba(18, 20, 28, 0.65);",
    "  --gc-glass-blur: blur(10px) saturate(150%);",
    "  --gc-glass-strong-bg: var(--gw-bg-glass-strong);",
    "  --gc-glass-strong-blur: blur(16px) saturate(170%);",
    "  --gc-glass-frost-bg: var(--gw-bg-glass-frost);",
    "  --gc-glass-frost-blur: blur(22px) saturate(180%);",
    "  --gc-glass-highlight: var(--gw-inset-highlight);",
    "",
    "  /* Elevation & Focus */",
    "  --gc-shadow-card: var(--gw-shadow-card);",
    "  --gc-shadow-elev: var(--gw-shadow-elev);",
    "  --gc-glow-green: var(--gw-shadow-amber);",
    "  --gc-glow-green-soft: 0 8px 24px rgba(229, 169, 60, 0.16);",
    "  --gc-glow-purple: var(--gw-shadow-cobalt);",
    "  --gc-glow-purple-soft: 0 8px 24px rgba(59, 130, 246, 0.18);",
    "  --gc-glow-red: 0 8px 22px rgba(239, 68, 68, 0.22);",
    "  --gc-focus-ring: var(--gw-focus-ring);",
    "",
    "  /* Typography */",
    "  --gc-font: var(--gw-font-sans);",
    "  --gc-font-serif: var(--gw-font-serif);",
    "  --gc-font-mono: var(--gw-font-mono);",
    "  --gc-fs-xs: var(--gw-fs-xs);",
    "  --gc-fs-sm: var(--gw-fs-sm);",
    "  --gc-fs-base: 1rem;",
    "  --gc-fs-lg: 1.25rem;",
    "  --gc-fs-xl: 1.75rem;",
    "  --gc-fs-2xl: 2.4rem;",
    "  --gc-fs-3xl: 3.25rem;",
    "  --gc-fw-regular: var(--gw-fw-regular);",
    "  --gc-fw-semibold: var(--gw-fw-semibold);",
    "  --gc-fw-bold: var(--gw-fw-bold);",
    "  --gc-fw-black: var(--gw-fw-black);",
    "",
    "  /* Spacing & Radii */",
    "  --gc-space-1: var(--gw-space-1);",
    "  --gc-space-2: var(--gw-space-2);",
    "  --gc-space-3: var(--gw-space-3);",
    "  --gc-space-4: var(--gw-space-4);",
    "  --gc-space-5: var(--gw-space-5);",
    "  --gc-space-6: var(--gw-space-6);",
    "  --gc-space-7: var(--gw-space-7);",
    "  --gc-radius-sm: 8px;",
    "  --gc-radius-md: var(--gw-radius-sm);",
    "  --gc-radius-lg: var(--gw-radius-md);",
    "  --gc-radius-xl: var(--gw-radius-lg);",
    "  --gc-radius-pill: var(--gw-radius-pill);",
    "",
    "  /* Shell Chassis */",
    "  --gc-header-h: 68px;",
    "  --gc-rail-collapsed: 72px;",
    "  --gc-rail-expanded: 260px;",
    "  --gc-bottom-tab-h: 64px;",
    "  --gc-shell-cols: var(--gc-rail-expanded) 1fr;",
    "",
    "  /* Motion */",
    "  --gc-ease: var(--gw-ease);",
    "  --gc-ease-out: var(--gw-ease-out);",
    "  --gc-dur-fast: var(--gw-dur-fast);",
    "  --gc-dur-base: var(--gw-dur-base);",
    "  --gc-dur-slow: var(--gw-dur-slow);",
    "",
    "  /* Legacy Component Compatibility Aliases */",
    "  --primary-neon: var(--gw-amber);",
    "  --primary-neon-glow: var(--gc-green-a45);",
    "  --secondary-neon: var(--gw-cobalt);",
    "  --secondary-neon-glow: var(--gc-purple-a45);",
    "  --accent-red: var(--gw-danger);",
    "  --accent-red-glow: var(--gc-red-a25);",
    "  --bg-dark: var(--gw-bg);",
    "  --card-bg: var(--gw-bg-card);",
    "  --card-border: var(--gw-line);",
    "  --card-border-hover: var(--gw-line-amber);",
    "  --glow-shadow-primary: var(--gc-glow-green-soft);",
    "  --glow-shadow-secondary: var(--gc-glow-purple-soft);",
    "}",
    "",
    "@media (prefers-reduced-motion: reduce) {",
    "  :root {",
    "    --gw-dur-fast: 0ms;",
    "    --gw-dur-base: 0ms;",
    "    --gw-dur-slow: 0ms;",
    "    --gw-dur-reveal: 0ms;",
    "    --gc-dur-fast: 0ms;",
    "    --gc-dur-base: 0ms;",
    "    --gc-dur-slow: 0ms;",
    "    --gc-ease: linear;",
    "    --gc-ease-out: linear;",
    "  }",
    "}",
    END_MARKER,
    "",
  ].join("\n");
}

function updateSiteCssContent(currentCss, tokenBlock) {
  if (currentCss.includes(BEGIN_MARKER) && currentCss.includes(END_MARKER)) {
    const startIdx = currentCss.indexOf(BEGIN_MARKER);
    const endIdx = currentCss.indexOf(END_MARKER) + END_MARKER.length;
    return currentCss.slice(0, startIdx) + tokenBlock + currentCss.slice(endIdx);
  }
  // Replace initial :root { ... } block in site.css
  const rootMatch = currentCss.match(/:root\s*\{[\s\S]*?\}/);
  if (!rootMatch) {
    throw new Error("Could not find :root block in goalworld_site/src/assets/css/site.css");
  }
  return currentCss.replace(rootMatch[0], tokenBlock);
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf8"));
  const wcagResults = verifyWcag(tokens);

  const siteTokenBlock = buildSiteTokenBlock(tokens);
  const currentSiteCss = readFileSync(SITE_CSS_PATH, "utf8");
  const expectedSiteCss = updateSiteCssContent(currentSiteCss, siteTokenBlock);

  const expectedWebappCss = buildWebappTokensFile(tokens);
  const currentWebappCss = readFileSync(WEBAPP_TOKENS_PATH, "utf8");

  if (checkOnly) {
    const drifts = [];
    if (currentSiteCss !== expectedSiteCss) {
      drifts.push("goalworld_site/src/assets/css/site.css has drifted from design/tokens.json");
    }
    if (currentWebappCss !== expectedWebappCss) {
      drifts.push("goalchain_webapp/src/styles/tokens.css has drifted from design/tokens.json");
    }
    if (drifts.length) {
      console.error("Design token drift detected:\n  - " + drifts.join("\n  - "));
      console.error("Run `node design/sync-tokens.mjs` to synchronize.");
      process.exit(1);
    }
    console.log(
      `  tokens check OK — 0 drift across goalworld_site + goalchain_webapp (${wcagResults.length} WCAG AA pairs verified)`
    );
    return;
  }

  writeFileSync(SITE_CSS_PATH, expectedSiteCss, "utf8");
  writeFileSync(WEBAPP_TOKENS_PATH, expectedWebappCss, "utf8");
  console.log(`Synced design/tokens.json ->`);
  console.log(`  1. goalworld_site/src/assets/css/site.css`);
  console.log(`  2. goalchain_webapp/src/styles/tokens.css`);
  console.log(`Verified ${wcagResults.length} WCAG AA contrast pairs:`);
  for (const r of wcagResults) {
    console.log(`  - ${r.label}: ${r.ratio}:1 (min ${r.minRatio}:1)`);
  }
}

main();
