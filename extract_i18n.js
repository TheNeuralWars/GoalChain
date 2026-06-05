const fs = require('fs');

const content = fs.readFileSync('docs/assets/js/i18n.js', 'utf8');

// Find the TRANSLATIONS object - it starts with "const TRANSLATIONS = {" and ends before "let currentLang"
const startIdx = content.indexOf('const TRANSLATIONS = {');
const endIdx = content.indexOf('let currentLang');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find TRANSLATIONS object boundaries');
  process.exit(1);
}

const translationsStr = content.slice(startIdx + 'const TRANSLATIONS = '.length, endIdx).trim();

// Use a more careful approach - evaluate in a sandbox with localStorage mock
const sandbox = {
  localStorage: {
    getItem: () => 'en',
    setItem: () => {},
  },
  document: {
    documentElement: { lang: 'en' },
    querySelectorAll: () => [],
    addEventListener: () => {},
    getElementById: () => null,
  },
  window: {},
  console: console,
};

try {
  // Execute just the TRANSLATIONS assignment
  const code = `const TRANSLATIONS = ${translationsStr}`;
  require('vm').runInNewContext(code, sandbox);
  
  if (sandbox.TRANSLATIONS && sandbox.TRANSLATIONS.en && sandbox.TRANSLATIONS.es) {
    fs.writeFileSync('goalchain_webapp/src/i18n/translations.json', JSON.stringify(sandbox.TRANSLATIONS, null, 2));
    console.log('translations.json created successfully');
    console.log('Keys in en:', Object.keys(sandbox.TRANSLATIONS.en).length);
    console.log('Keys in es:', Object.keys(sandbox.TRANSLATIONS.es).length);
  } else {
    console.error('TRANSLATIONS not properly extracted');
    process.exit(1);
  }
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}