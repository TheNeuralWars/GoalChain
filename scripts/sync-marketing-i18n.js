#!/usr/bin/env node
/**
 * sync-marketing-i18n.js
 * Syncs i18n from goalchain_webapp/src/i18n/locales/*.json → docs/assets/js/i18n.js
 * Run from repo root: node scripts/sync-marketing-i18n.js [--apply]
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(REPO_ROOT, 'goalchain_webapp', 'src', 'i18n', 'locales');
const OUTPUT_FILE = path.join(REPO_ROOT, 'docs', 'assets', 'js', 'i18n.js');

function escapeForJS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function generateTranslationsObject(en, es) {
  const allKeys = new Set([...Object.keys(en), ...Object.keys(es)]);
  const sortedKeys = Array.from(allKeys).sort();

  let output = 'const TRANSLATIONS = {\n  es: {\n';
  
  for (const key of sortedKeys) {
    const enVal = en[key] ?? '';
    const esVal = es[key] ?? enVal;
    
    // Find the Spanish value for this key, fallback to English
    const val = es[key] ?? en[key] ?? '';
    output += `    ${key}: '${escapeForJS(val)}',\n`;
  }
  
  output = output.slice(0, -2) + '\n'; // Remove last comma
  output += '  },\n  en: {\n';
  
  for (const key of sortedKeys) {
    const val = en[key] ?? es[key] ?? '';
    output += `    ${key}: '${escapeForJS(val)}',\n`;
  }
  
  output = output.slice(0, -2) + '\n';
  output += '  }\n};\n\n';
  
  return output;
}

function generateFooter() {
  return `let currentLang = 'en';

function applyTranslations() {
  const t = TRANSLATIONS[currentLang];
  if (!t) return;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.innerHTML = t[key];
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.setAttribute('placeholder', t[key]);
  });
  
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key]) el.setAttribute('title', t[key]);
  });
  
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    if (t[key]) el.setAttribute('alt', t[key]);
  });
}

function setLang(lang) {
  if (!TRANSLATIONS[lang]) lang = 'en';
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
  updateLangButtons(lang);
  
  // Dispatch custom event for other scripts
  window.dispatchEvent(new CustomEvent('langchanged', { detail: { lang } }));
}

function updateLangButtons(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

function initI18n() {
  const saved = localStorage.getItem('lang');
  const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
  const initialLang = (saved && TRANSLATIONS[saved]) ? saved : browserLang;
  setLang(initialLang);
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
  });
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// Expose for manual use
window.GoalChainI18n = { setLang, getLang: () => currentLang, TRANSLATIONS };
`;
}

function main() {
  const apply = process.argv.includes('--apply');
  
  console.log('=== GoalChain Marketing i18n Sync ===\n');
  
  // Read locale files
  const enPath = path.join(LOCALES_DIR, 'en.json');
  const esPath = path.join(LOCALES_DIR, 'es.json');
  
  if (!fs.existsSync(enPath) || !fs.existsSync(esPath)) {
    console.error('ERROR: Locale files not found at:', LOCALES_DIR);
    process.exit(1);
  }
  
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));
  
  console.log(`Loaded ${Object.keys(en).length} EN keys, ${Object.keys(es).length} ES keys`);
  
  // Read current i18n.js to preserve header/footer
  let currentContent = '';
  if (fs.existsSync(OUTPUT_FILE)) {
    currentContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
  }
  
  // Extract header comment (everything before TRANSLATIONS)
  let header = '';
  const translationsStart = currentContent.indexOf('const TRANSLATIONS =');
  if (translationsStart > 0) {
    header = currentContent.slice(0, translationsStart).trim() + '\n\n';
  } else {
    header = '// ===== GoalChain i18n - Spanish / English =====\n\n';
  }
  
  // Generate new content
  const translationsObj = generateTranslationsObject(en, es);
  const footer = generateFooter();
  const newContent = header + translationsObj + footer;
  
  if (!apply) {
    console.log('\n--- DRY RUN: Would write to', OUTPUT_FILE);
    console.log('First 200 chars of new TRANSLATIONS:');
    console.log(translationsObj.slice(0, 200) + '...');
    console.log('\nUse --apply to write changes.');
    return;
  }
  
  // Write
  fs.writeFileSync(OUTPUT_FILE, newContent, 'utf8');
  console.log('\n✅ Written to', OUTPUT_FILE);
  console.log(`   EN keys: ${Object.keys(en).length}`);
  console.log(`   ES keys: ${Object.keys(es).length}`);
}

main();