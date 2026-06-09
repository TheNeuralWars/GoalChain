#!/usr/bin/env node
// Marketing i18n Sync: goalchain_webapp/src/i18n/locales/*.json -> docs/assets/js/i18n.js

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const LOCALES_DIR = path.join(REPO_ROOT, 'goalchain_webapp/src/i18n/locales');
const TARGET_FILE = path.join(REPO_ROOT, 'docs/assets/js/i18n.js');

function loadLocale(lang) {
  const file = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(file)) {
    console.error(`Missing locale: ${file}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function escapeJsString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function formatTranslations(obj, indent = 2) {
  const keys = Object.keys(obj).sort();
  const lines = keys.map(key => {
    const value = escapeJsString(obj[key]);
    return `${' '.repeat(indent)}${key}: "${value}"`;
  });
  return '{\n' + lines.join(',\n') + '\n' + ' '.repeat(indent - 2) + '}';
}

function generateI18nFile(en, es) {
  const now = new Date().toISOString();
  return `// ===== GoalChain i18n - Spanish / English =====
// Auto-generated from goalchain_webapp/src/i18n/locales/*.json
// DO NOT EDIT DIRECTLY - run: node scripts/sync-marketing-i18n.js --apply
// Generated: ${now}

const TRANSLATIONS = {
  es: ${formatTranslations(es)},
  en: ${formatTranslations(en)},
};`;
}

function main() {
  const apply = process.argv.includes('--apply');
  
  console.log('Loading webapp locales...');
  const en = loadLocale('en');
  const es = loadLocale('es');
  
  console.log(`EN keys: ${Object.keys(en).length}`);
  console.log(`ES keys: ${Object.keys(es).length}`);
  
  const newContent = generateI18nFile(en, es);
  
  if (!apply) {
    console.log('\n--- DRY RUN - Preview of docs/assets/js/i18n.js ---\n');
    console.log(newContent.slice(0, 500) + '...\n[truncated]');
    console.log('\nRun with --apply to write the file.');
    return;
  }
  
  const currentContent = fs.existsSync(TARGET_FILE) ? fs.readFileSync(TARGET_FILE, 'utf8') : '';
  
  if (currentContent === newContent) {
    console.log('No changes - i18n.js is already in sync.');
    return;
  }
  
  fs.writeFileSync(TARGET_FILE, newContent, 'utf8');
  console.log('✅ docs/assets/js/i18n.js updated successfully');
}

main();