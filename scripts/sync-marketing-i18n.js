// ===== GoalChain Marketing i18n Sync =====
// Syncs FROM goalchain_webapp/src/i18n/locales/*.json TO docs/assets/js/i18n.js

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'goalchain_webapp', 'src', 'i18n', 'locales');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'assets', 'js', 'i18n.js');

const LANGS = ['es', 'en'];

function loadLocale(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing locale file: ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function escapeJsString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function generateTranslationsObject(translations) {
  const langs = {};
  for (const lang of LANGS) {
    const keys = Object.keys(translations[lang]).sort();
    let langStr = '';
    for (const key of keys) {
      const escaped = escapeJsString(translations[lang][key]);
      langStr += `    ${key}: '${escaped}',\n`;
    }
    langs[lang] = langStr.trimEnd();
  }
  return langs;
}

function readExistingI18n() {
  if (!fs.existsSync(OUTPUT_FILE)) return null;
  const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
  const startIdx = content.indexOf('const TRANSLATIONS = {');
  if (startIdx === -1) return null;
  return { content, startIdx };
}

function main() {
  const apply = process.argv.includes('--apply');
  const dryRun = !apply;

  console.log(`=== Marketing i18n Sync ${dryRun ? '(DRY RUN)' : '(APPLY)'} ===`);

  // Load source locales
  const translations = {};
  for (const lang of LANGS) {
    translations[lang] = loadLocale(lang);
    console.log(`Loaded ${lang}: ${Object.keys(translations[lang]).length} keys`);
  }

  // Generate new TRANSLATIONS object
  const langBlocks = generateTranslationsObject(translations);
  const newTranslations = `const TRANSLATIONS = {\n  es: {\n${langBlocks.es}\n  },\n  en: {\n${langBlocks.en}\n  }\n};`;

  // Read existing
  const existing = readExistingI18n();
  if (!existing) {
    console.error('Could not parse existing i18n.js');
    process.exit(1);
  }

  // Find end of TRANSLATIONS object (before "let currentLang")
  const endIdx = existing.content.indexOf('let currentLang', existing.startIdx);
  if (endIdx === -1) {
    console.error('Could not find end of TRANSLATIONS object');
    process.exit(1);
  }

  const prefix = existing.content.slice(0, existing.startIdx);
  const suffix = existing.content.slice(endIdx);
  const newContent = prefix + newTranslations + '\n\n' + suffix;

  if (dryRun) {
    console.log('\n--- Would write to docs/assets/js/i18n.js ---');
    console.log('First 200 chars of new TRANSLATIONS:');
    console.log(newTranslations.slice(0, 200) + '...');
    console.log('\nRun with --apply to write changes.');
    return;
  }

  // Write
  fs.writeFileSync(OUTPUT_FILE, newContent);
  console.log(`✓ Written to ${OUTPUT_FILE}`);
  console.log(`  Spanish keys: ${Object.keys(translations.es).length}`);
  console.log(`  English keys: ${Object.keys(translations.en).length}`);
}

main();