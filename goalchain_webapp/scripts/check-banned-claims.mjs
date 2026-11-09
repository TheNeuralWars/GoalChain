#!/usr/bin/env node
/**
 * GoalWorld · Matchday Lab — Banned-Claims Contract Check (A-014)
 * Scans goalchain_webapp/src, goalchain_webapp/public, and goalchain_webapp/index.html
 * (excluding src/analytics/** owned by draft PR #923) for retired/unverified claims.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

const BANNED_CLAIMS = [
  { label: "pre-order", re: /\bpre-?order\b/i },
  { label: "prerreserva", re: /\bprerreserva\b/i },
  { label: "available on Kindle", re: /available\s+on\s+kindle/i },
  { label: "Amazon Kindle", re: /Amazon\s+Kindle/i },
  { label: "KDP", re: /\bKDP\b/ },
  { label: "USDC royalties", re: /USDC\s+royalties/i },
  { label: "Zero Value Loss", re: /zero\s+value\s+loss/i },
  { label: "Infinity Burn", re: /infinity\s+burn/i },
  { label: "audited facial likeness", re: /audited\s+facial\s+likeness/i },
  { label: "C2PA-verified", re: /C2PA-verified/i },
  { label: "Kora Chen", re: /\bKora\s+Chen\b/i },
  { label: "Neo-Veridia", re: /\bNeo-Veridia\b/i },
  { label: "432 Hz", re: /\b432\s*Hz\b/i },
  { label: "Solfeggio", re: /\bSolfeggio\b/i },
  { label: "Convergence Protocol", re: /Convergence\s+Protocol/i },
  { label: "Football Meets DeFi", re: /Football\s+Meets\s+DeFi/i },
  { label: "Stake, Play, Earn", re: /Stake,\s*Play,\s*Earn/i },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "analytics" || entry.name === "node_modules" || entry.name === "dist") continue;
      walk(full, out);
    } else if (/\.(ts|tsx|html|json|md|txt|webmanifest)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const files = [
  join(ROOT, "index.html"),
  ...walk(join(ROOT, "src")),
  ...walk(join(ROOT, "public")),
];

const violations = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const { label, re } of BANNED_CLAIMS) {
    const m = text.match(re);
    if (m) {
      violations.push(`${relative(ROOT, file)}: banned claim "${label}" (${m[0]})`);
    }
  }
}

if (violations.length > 0) {
  console.error("check-banned-claims FAILED:");
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log(`check-banned-claims: OK — 0 violations across ${files.length} files`);
