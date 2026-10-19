#!/usr/bin/env node
/**
 * i18n key checker — run via `npm run check:i18n`.
 *
 * Guards against the two bugs that shipped before (2026-10-07 auto-improve run):
 *   1. t('some.dotted.key') call sites whose key does not exist in the flat
 *      snake_case dictionaries — t() silently falls back to the raw key string,
 *      so users see "create_user_step1.title" in the UI.
 *   2. en.json / es.json / TranslationKeys drift (keys added to one side only).
 *
 * Rules:
 *   - every literal key used in src/ must exist in BOTH locales/en.json and locales/es.json
 *   - no used key may contain a dot (dictionaries are flat snake_case)
 *   - en.json and es.json must have identical key sets
 *   - the TranslationKeys type in i18n/translations.ts must match en.json exactly
 *
 * Usage: node scripts/check-i18n-keys.mjs   (from goalchain_webapp/)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEBAPP_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(WEBAPP_ROOT, 'src');

const en = JSON.parse(readFileSync(join(SRC, 'i18n/locales/en.json'), 'utf8'));
const es = JSON.parse(readFileSync(join(SRC, 'i18n/locales/es.json'), 'utf8'));
const translationsTs = readFileSync(join(SRC, 'i18n/translations.ts'), 'utf8');

const problems = [];

// ---- 1. collect used keys from source ---------------------------------------
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(entry)) yield p;
  }
}

const used = new Map(); // key -> Set(files)
const add = (key, file) => {
  if (!used.has(key)) used.set(key, new Set());
  used.get(key).add(relative(WEBAPP_ROOT, file));
};

for (const file of walk(SRC)) {
  const text = readFileSync(file, 'utf8');
  // t('key') / t('key', {...}) / tHtml('key')
  for (const m of text.matchAll(/\bt(?:Html)?\(\s*'([^']+)'/g)) add(m[1], file);
  // titleKey="key" / titleKey: 'key'
  for (const m of text.matchAll(/titleKey[=:]\s*['"]([^'"]+)['"]/g)) add(m[1], file);
  // i18n: 'key' (nav/config items)
  for (const m of text.matchAll(/\bi18n:\s*'([^']+)'/g)) add(m[1], file);
  // nameKey / descriptionKey (SwarmVaults-style data records)
  for (const m of text.matchAll(/\b(?:nameKey|descriptionKey):\s*'([^']+)'/g)) add(m[1], file);
  // logKeys: ['a', 'b', ...]
  for (const m of text.matchAll(/logKeys:\s*\[([^\]]*)\]/g)) {
    for (const s of m[1].matchAll(/'([^']+)'/g)) add(s[1], file);
  }
}

// ---- 2. rules --------------------------------------------------------------
for (const [key, files] of used) {
  if (key.includes('.')) {
    problems.push(
      `dotted key '${key}' (${[...files].join(', ')}): dictionaries are flat snake_case — ` +
        `t() would render the raw key to users. Rename the call site or the dictionary key.`,
    );
    continue;
  }
  if (!(key in en)) problems.push(`missing from en.json: '${key}' (${[...files].join(', ')})`);
  if (!(key in es)) problems.push(`missing from es.json: '${key}' (${[...files].join(', ')})`);
}

const enKeys = Object.keys(en);
const esKeys = Object.keys(es);
for (const k of enKeys) if (!(k in es)) problems.push(`en.json key '${k}' missing from es.json`);
for (const k of esKeys) if (!(k in en)) problems.push(`es.json key '${k}' missing from en.json`);

for (const [k, v] of Object.entries(en)) {
  if (typeof v !== 'string') problems.push(`en.json '${k}' is ${typeof v}, expected flat string`);
}
for (const [k, v] of Object.entries(es)) {
  if (typeof v !== 'string') problems.push(`es.json '${k}' is ${typeof v}, expected flat string`);
}

const typeKeys = new Set(
  [...translationsTs.matchAll(/^\s{2}([a-z0-9_]+): string;/gm)].map((m) => m[1]),
);
for (const k of enKeys) if (!typeKeys.has(k)) problems.push(`key '${k}' missing from TranslationKeys (i18n/translations.ts)`);
for (const k of typeKeys) if (!(k in en)) problems.push(`TranslationKeys '${k}' missing from en.json`);

// ---- 3. report -------------------------------------------------------------
const usedCount = used.size;
if (problems.length) {
  console.error(`check-i18n-keys: FAIL — ${problems.length} problem(s)`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(
  `check-i18n-keys: OK — ${usedCount} used keys all present in en+es, ` +
    `${enKeys.length} dictionary keys, en/es/type in sync`,
);
