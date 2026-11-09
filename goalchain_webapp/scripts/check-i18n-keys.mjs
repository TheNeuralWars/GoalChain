#!/usr/bin/env node
/**
 * CI check: verify that en.json, es.json, and it.json have identical key sets,
 * non-empty string values, and match TranslationKeys in src/i18n/translations.ts.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, '../src/i18n/locales');
const translationsTsPath = resolve(__dirname, '../src/i18n/translations.ts');

const en = JSON.parse(readFileSync(resolve(localesDir, 'en.json'), 'utf8'));
const es = JSON.parse(readFileSync(resolve(localesDir, 'es.json'), 'utf8'));
const it = JSON.parse(readFileSync(resolve(localesDir, 'it.json'), 'utf8'));
const translationsTs = readFileSync(translationsTsPath, 'utf8');

const enKeys = new Set(Object.keys(en));
const esKeys = new Set(Object.keys(es));
const itKeys = new Set(Object.keys(it));

const tsKeyMatches = [...translationsTs.matchAll(/^\s*"([^"]+)"\s*:\s*string;/gm)].map((m) => m[1]);
const tsKeys = new Set(tsKeyMatches);

const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
const extraInEs = [...esKeys].filter((k) => !enKeys.has(k));
const missingInIt = [...enKeys].filter((k) => !itKeys.has(k));
const extraInIt = [...itKeys].filter((k) => !enKeys.has(k));
const missingInTs = [...enKeys].filter((k) => !tsKeys.has(k));
const extraInTs = [...tsKeys].filter((k) => !enKeys.has(k));

const emptyValues = [];
for (const [locale, dict] of [['en', en], ['es', es], ['it', it]]) {
  for (const [k, v] of Object.entries(dict)) {
    if (typeof v !== 'string' || v.trim().length === 0) {
      emptyValues.push(`${locale}.${k}`);
    }
  }
}

let failed = false;

for (const [label, list] of [
  ['es.json missing keys present in en.json', missingInEs],
  ['es.json extra keys not in en.json', extraInEs],
  ['it.json missing keys present in en.json', missingInIt],
  ['it.json extra keys not in en.json', extraInIt],
  ['translations.ts missing keys present in en.json', missingInTs],
  ['translations.ts extra keys not in en.json', extraInTs],
  ['empty or non-string values', emptyValues],
]) {
  if (list.length > 0) {
    console.error(`❌ ${label} (${list.length}):`);
    for (const k of list) console.error(`   - ${k}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`✅ i18n key check passed (${enKeys.size} keys in sync across en.json, es.json, it.json, and translations.ts).`);
