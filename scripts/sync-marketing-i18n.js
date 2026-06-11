#!/usr/bin/env node
/**
 * Sync marketing i18n from Play app (goalchain_webapp) to marketing site (docs/assets/js/i18n.js)
 * Usage: node scripts/sync-marketing-i18n.js [--apply]
 */

const fs = require('fs');
const path = require('path');

const PLAY_APP_I18N_DIR = path.join(__dirname, '../goalchain_webapp/src/i18n/locales');
const MARKETING_I18N_FILE = path.join(__dirname, '../docs/assets/js/i18n.js');

const LOCALES = ['en', 'es'];

function readPlayAppTranslations() {
  const translations = {};
  for (const locale of LOCALES) {
    const filePath = path.join(PLAY_APP_I18N_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing translation file: ${filePath}`);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    translations[locale] = JSON.parse(content);
  }
  return translations;
}

function generateMarketingI18nJS(translations) {
  const es = translations.es;
  const en = translations.en;

  const lines = [
    '// ===== GoalChain i18n - Spanish / English =====',
    'const TRANSLATIONS = {',
    '  es: {',
  ];

  for (const key of Object.keys(es).sort()) {
    const value = es[key];
    const escaped = JSON.stringify(value).slice(1, -1); // Remove surrounding quotes
    lines.push(`    ${key}: ${JSON.stringify(value)},`);
  }

  lines.push('  },');
  lines.push('  en: {');

  for (const key of Object.keys(en).sort()) {
    const value = en[key];
    lines.push(`    ${key}: ${JSON.stringify(value)},`);
  }

  lines.push('  }');
  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

function main() {
  const apply = process.argv.includes('--apply');

  console.log('🔄 Reading Play app translations...');
  const translations = readPlayAppTranslations();

  console.log('📝 Generating marketing i18n.js...');
  const newContent = generateMarketingI18nJS(translations);

  if (apply) {
    const currentContent = fs.readFileSync(MARKETING_I18N_FILE, 'utf8');
    if (currentContent === newContent) {
      console.log('✅ No changes needed - already in sync');
      process.exit(0);
    }
    fs.writeFileSync(MARKETING_I18N_FILE, newContent, 'utf8');
    console.log('✅ Marketing i18n.js updated successfully');
  } else {
    console.log('📋 Dry run - would update:');
    console.log(newContent);
  }
}

main();