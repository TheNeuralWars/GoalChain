#!/usr/bin/env node
/**
 * Assemble the Vercel output directory for the goal-chain project (root dir: docs/).
 *
 * The project serves the SAME source as goalworld.fun: goalworld_site/dist.
 * Because Vercel's root directory is docs/ and outputDirectory must live inside it,
 * the build copies the site into docs/.site_out/ (build-container only, gitignored),
 * and keeps the machine-readable docs/ data surface serving from the same host:
 *
 *   data/*            burn_tracker.json, tokenomics CSVs   (updated by pipelines)
 *   assets/data/*     players.json, wc2026_fixture.json    (fetched by the play pages)
 *   *.json (root)     ECONOMIC_CANONICAL_CONFIG.json etc.  (fetched by tokenomics pages)
 *
 * Those prefixes are also excluded from the host-conditional redirect in
 * docs/vercel.json, so https://docs.goalchain.fun/data/... URLs keep working.
 * Run (from docs/): node ../goalworld_site/tools/build_vercel_output.mjs
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DOCS = process.cwd();
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIST = join(ROOT, "goalworld_site", "dist");
const OUT = join(DOCS, ".site_out");

if (!existsSync(join(DIST, "index.html"))) {
  console.error(`missing build output at ${DIST} — run node goalworld_site/build.mjs first`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// 1. the site itself
cpSync(DIST, OUT, { recursive: true });

// 2. the data surface that pipelines write and pages/machines fetch
cpSync(join(DOCS, "data"), join(OUT, "data"), { recursive: true });
if (existsSync(join(DOCS, "assets/data"))) {
  mkdirSync(join(OUT, "assets"), { recursive: true });
  cpSync(join(DOCS, "assets/data"), join(OUT, "assets/data"), { recursive: true });
}
for (const f of readdirSync(DOCS)) {
  if (f.endsWith(".json") && !f.startsWith(".") && f !== "vercel.json") {
    cpSync(join(DOCS, f), join(OUT, f));
  }
}

console.log(`vercel output assembled: ${OUT}`);
