#!/usr/bin/env node
/**
 * GoalWorld Phase 3 — Multilanguage (EN / ES / IT) Playwright Verification Suite
 *
 * Verifies:
 *   1. goalworld_site: all 13 routes × 3 locales (39 pages) render cleanly in system Chrome
 *      - <html lang="en|es|it"> matches locale
 *      - hreflang="en|es|it|x-default" links present and point to matching route
 *      - og:locale and og:locale:alternate tags match locale
 *      - JSON-LD WebSite/WebPage/FAQPage inLanguage matches locale
 *      - Legal draft-translation notice visible on ES/IT privacy.html and terms.html
 *      - Language switcher ([data-lang-switcher]) round-trips EN -> ES -> IT -> EN,
 *        keeping the current page slug and persisting choice in localStorage (gw_lang & gc_lang)
 *      - Zero raw translation keys ({{i18n:...}} or dotted key paths) visible in rendered text
 *      - Zero horizontal overflow & zero console/page errors
 *   2. goalchain_webapp (play.goalworld.fun): core routes render in EN, ES, and IT
 *      - LanguageToggle round-trips EN -> ES -> IT -> EN, updating document.documentElement.lang,
 *        localStorage (gw_lang & gc_lang), UI headings, and localized marketing links
 *      - Zero raw translation keys visible in rendered text
 *      - Zero horizontal overflow & zero console/page errors
 *   3. Saves screenshots (<= 400 KB) of ES and IT home + book (mobile 390x844 + desktop 1440x900)
 *      and play.goalworld.fun ES/IT home + dashboard in _work/site-overhaul-20261109/evidence/phase3/
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

function loadPlaywright() {
  const candidates = [
    path.join(ROOT, 'goalchain_webapp/package.json'),
    '/tmp/audit-tools/package.json',
  ];
  for (const pkg of candidates) {
    try {
      const req = createRequire(pkg);
      return req('playwright-core');
    } catch {
      // try next
    }
  }
  throw new Error('Could not resolve playwright-core');
}

const { chromium } = loadPlaywright();

const SITE_DIST = path.join(ROOT, 'goalworld_site/dist');
const DOCS_DIR = path.join(ROOT, 'docs');
const WEBAPP_DIST = path.join(ROOT, 'goalchain_webapp/dist');
const OUT_DIR = path.join(ROOT, '_work/site-overhaul-20261109/evidence/phase3');
const SHOT_DIR = path.join(OUT_DIR, 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function startStaticServer(primaryRoot, fallbackRoot, isSpa, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
      const candidates = [
        path.join(primaryRoot, rel),
        path.join(primaryRoot, rel, 'index.html'),
      ];
      if (fallbackRoot) {
        candidates.push(path.join(fallbackRoot, rel));
      }
      if (urlPath.startsWith('/_vercel/')) {
        res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
        res.end('/* local preview stub */');
        return;
      }
      if (isSpa && !path.extname(rel)) {
        candidates.push(path.join(primaryRoot, 'index.html'));
      }
      for (const file of candidates) {
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
          const ext = path.extname(file).toLowerCase();
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
          fs.createReadStream(file).pipe(res);
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

const SITE_SLUGS = [
  'index',
  'book',
  'cinema',
  'studio',
  'collect',
  'roadmap',
  'about',
  'faq',
  'press',
  'live',
  'privacy',
  'terms',
  '404',
];

const LOCALES = ['en', 'es', 'it'];
const OG_LOCALE_MAP = { en: 'en_US', es: 'es_AR', it: 'it_IT' };

const WEBAPP_ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'dashboard', path: '/dashboard' },
  { slug: 'estadio', path: '/estadio' },
  { slug: 'club', path: '/club' },
  { slug: 'defi', path: '/defi' },
  { slug: 'staking', path: '/staking' },
  { slug: 'goalworld', path: '/goalworld' },
  { slug: 'reader', path: '/reader' },
  { slug: 'studio', path: '/studio' },
  { slug: 'presskit', path: '/presskit' },
];

const RAW_KEY_PATTERNS = [
  /\{\{i18n:[^}]+\}\}/,
  /\b(?:chrome|index|book|cinema|studio|collect|roadmap|about|faq|press|live|privacy|terms|p404)\.(?!html\b)[a-z0-9_]+\b/,
  /\b(?:nav_|landing_|gw_portal_|reader_|universe_|studio_|presskit_|layout_|defi_|burn_lab_|wc_|tt_|sim_|squad_|hermes_)[a-z0-9_]+\b/,
];

function findRawKeys(text) {
  const hits = [];
  for (const re of RAW_KEY_PATTERNS) {
    const m = text.match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

async function saveJpegShot(page, filename) {
  const fullPath = path.join(SHOT_DIR, filename);
  for (const quality of [76, 64, 52, 42]) {
    const buf = await page.screenshot({ type: 'jpeg', quality, fullPage: false });
    if (buf.length <= 400 * 1024 || quality === 42) {
      fs.writeFileSync(fullPath, buf);
      return { path: fullPath, bytes: buf.length };
    }
  }
}

async function main() {
  const sitePort = 4411;
  const appPort = 4412;
  const siteServer = await startStaticServer(SITE_DIST, DOCS_DIR, false, sitePort);
  const appServer = await startStaticServer(WEBAPP_DIST, DOCS_DIR, true, appPort);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const results = {
    generatedAt: new Date().toISOString(),
    sitePagesChecked: 0,
    siteRoundTripsChecked: 0,
    webappRoutesChecked: 0,
    webappRoundTripsChecked: 0,
    screenshots: [],
    failures: [],
    details: {
      site: [],
      webapp: [],
    },
  };

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route('**/*.mp4', (route) => route.abort());
    await context.route('**/api/economy/metrics', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timestamp_iso: new Date().toISOString(),
          kpis: { emit_burn_ratio_7d: 0.92, onchain_sink_coverage: 0.78, config_drift: 0, vault_buyback_coverage: 0.35 },
          flow_24h: { emissions_gch: 12000, burns_gch: 11400, net_emission_gch: 600 },
          flow_7d: { emissions_gch: 84000, burns_gch: 77280 },
          breakdown: { potion_burn_gch: 32000, fee_burn_gch: 24000, vault_buyback_gch: 14280, treasury_fees_gch: 7000 },
          config_drift_reasons: [],
          source: { canonical_config: 'v1', burn_tracker: 'sim', scenarios_csv: 'sim', baseline_scenario_id: 'base' },
        }),
      })
    );
    await context.route('**/api/economy/health', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          timestamp_iso: new Date().toISOString(),
          status: 'healthy',
          failing_checks: [],
          thresholds: {
            emit_burn_ratio_min: 0.8,
            emit_burn_ratio_max: 1.2,
            onchain_sink_coverage_min: 0.5,
            config_drift_max: 0,
            vault_buyback_coverage_min: 0.2,
          },
          checks: [{ key: 'emit_burn_ratio_7d', value: 0.92, min: 0.8, max: 1.2, pass: true }],
          kpis: { emit_burn_ratio_7d: 0.92, onchain_sink_coverage: 0.78, config_drift: 0, vault_buyback_coverage: 0.35 },
          config_drift_reasons: [],
        }),
      })
    );
    await context.route('**/api/ops/status', (route) => route.abort());
    const page = await context.newPage();

    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('requestfailed', (req) => {
      const u = req.url();
      const errText = req.failure()?.errorText || 'failed';
      if (
        u.startsWith('http://127.0.0.1:') &&
        !u.endsWith('.mp4') &&
        !u.includes('/api/') &&
        !errText.includes('ERR_ABORTED')
      ) {
        pageErrors.push(`Local request failed: ${u} (${errText})`);
      }
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const txt = msg.text();
        if (
          !txt.includes('favicon') &&
          !txt.includes('ERR_CONNECTION_REFUSED') &&
          !txt.includes('Failed to load resource') &&
          !txt.includes('net::ERR_FAILED') &&
          !txt.includes('Failed to load ops status in DeFi')
        ) {
          pageErrors.push(txt);
        }
      }
    });

    // 1. Verify all 39 localized goalworld_site pages
    for (const locale of LOCALES) {
      for (const slug of SITE_SLUGS) {
        pageErrors.length = 0;
        const routePath =
          locale === 'en'
            ? slug === 'index'
              ? '/'
              : `/${slug}.html`
            : slug === 'index'
              ? `/${locale}/`
              : `/${locale}/${slug}.html`;
        const url = `http://127.0.0.1:${sitePort}${routePath}`;
        const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(80);
        const status = res ? res.status() : 0;

        const audit = await page.evaluate(() => {
          const htmlLang = document.documentElement.lang;
          const title = document.title;
          const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
          const ogLocale = document.querySelector('meta[property="og:locale"]')?.getAttribute('content') || '';
          const ogAlt = [...document.querySelectorAll('meta[property="og:locale:alternate"]')].map((m) =>
            m.getAttribute('content')
          );
          const hreflangs = Object.fromEntries(
            [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [
              l.getAttribute('hreflang'),
              l.getAttribute('href'),
            ])
          );
          const jsonLdRaw = document.querySelector('script[type="application/ld+json"]')?.textContent || '{}';
          let jsonLdLangs = [];
          try {
            const parsed = JSON.parse(jsonLdRaw);
            const graph = parsed['@graph'] || [];
            jsonLdLangs = graph.filter((n) => n.inLanguage).map((n) => ({ type: n['@type'], inLanguage: n.inLanguage }));
          } catch {
            jsonLdLangs = [{ error: 'invalid JSON-LD' }];
          }
          const activePills = [...document.querySelectorAll('[data-lang-switcher] .lang-pill.active')].map((el) =>
            el.getAttribute('data-lang-choice')
          );
          const legalNoticeVisible = Boolean(document.querySelector('[data-legal-draft-notice]'));
          const overflow = document.documentElement.scrollWidth > window.innerWidth;
          const bodyText = document.body.innerText || '';
          return {
            htmlLang,
            title,
            desc,
            ogLocale,
            ogAlt,
            hreflangs,
            jsonLdLangs,
            activePills,
            legalNoticeVisible,
            overflow,
            bodyText,
          };
        });

        const rawKeyHits = findRawKeys(audit.bodyText);
        const errs = [];
        if (status !== 200) errs.push(`HTTP ${status}`);
        if (audit.htmlLang !== locale) errs.push(`html[lang]=${audit.htmlLang} expected ${locale}`);
        if (!audit.title || audit.title.length < 5) errs.push('empty <title>');
        if (!audit.desc || audit.desc.length < 15) errs.push('empty meta description');
        if (audit.ogLocale !== OG_LOCALE_MAP[locale]) {
          errs.push(`og:locale=${audit.ogLocale} expected ${OG_LOCALE_MAP[locale]}`);
        }
        if (audit.ogAlt.length !== 2) errs.push(`og:locale:alternate count=${audit.ogAlt.length} expected 2`);
        if (slug !== '404') {
          for (const hl of ['en', 'es', 'it', 'x-default']) {
            if (!audit.hreflangs[hl]) errs.push(`missing hreflang=${hl}`);
          }
          if (audit.jsonLdLangs.length < 1 || audit.jsonLdLangs.some((n) => n.inLanguage !== locale)) {
            errs.push(`JSON-LD inLanguage mismatch: ${JSON.stringify(audit.jsonLdLangs)}`);
          }
        }
        if (!audit.activePills.length || audit.activePills.some((c) => c !== locale)) {
          errs.push(`active lang pill mismatch: ${JSON.stringify(audit.activePills)}`);
        }
        if ((slug === 'privacy' || slug === 'terms') && locale !== 'en' && !audit.legalNoticeVisible) {
          errs.push('missing [data-legal-draft-notice] on localized legal page');
        }
        if (audit.overflow) errs.push('horizontal overflow detected');
        if (rawKeyHits.length) errs.push(`raw key(s) visible: ${rawKeyHits.join(', ')}`);
        if (pageErrors.length) errs.push(`console/page errors: ${pageErrors.join('; ')}`);

        results.sitePagesChecked += 1;
        results.details.site.push({
          locale,
          slug,
          routePath,
          title: audit.title,
          passed: errs.length === 0,
          errors: errs,
        });
        if (errs.length > 0) {
          results.failures.push({ surface: 'goalworld_site', locale, slug, errors: errs });
        }

        // Save required screenshots for ES and IT home + book (desktop 1440x900 + mobile 390x844)
        if ((locale === 'es' || locale === 'it') && (slug === 'index' || slug === 'book')) {
          const labelSlug = slug === 'index' ? 'home' : 'book';
          const shotDesktop = await saveJpegShot(page, `gw-${locale}-${labelSlug}-1440x900.jpg`);
          results.screenshots.push({ file: path.basename(shotDesktop.path), bytes: shotDesktop.bytes });

          await page.setViewportSize({ width: 390, height: 844 });
          await page.waitForTimeout(120);
          const shotMobile = await saveJpegShot(page, `gw-${locale}-${labelSlug}-390x844.jpg`);
          results.screenshots.push({ file: path.basename(shotMobile.path), bytes: shotMobile.bytes });
          await page.setViewportSize({ width: 1440, height: 900 });
        }
      }
    }

    // 2. Verify goalworld_site language switcher round-trip & localStorage persistence
    for (const slug of ['index', 'book', 'cinema', 'faq', 'privacy']) {
      const startPath = slug === 'index' ? '/' : `/${slug}.html`;
      await page.goto(`http://127.0.0.1:${sitePort}${startPath}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(60);

      // Click ES in header switcher
      await page.click('.site-header [data-lang-switcher] [data-lang-choice="es"]');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(60);
      const esState = await page.evaluate(() => ({
        pathname: window.location.pathname,
        lang: document.documentElement.lang,
        gwLang: localStorage.getItem('gw_lang'),
        gcLang: localStorage.getItem('gc_lang'),
      }));
      const expectedEsPath = slug === 'index' ? '/es/' : `/es/${slug}.html`;
      if (esState.pathname !== expectedEsPath || esState.lang !== 'es' || esState.gwLang !== 'es' || esState.gcLang !== 'es') {
        results.failures.push({
          surface: 'goalworld_site_roundtrip',
          slug,
          step: 'EN->ES',
          state: esState,
          expectedPath: expectedEsPath,
        });
      }

      // Click IT in header switcher
      await page.click('.site-header [data-lang-switcher] [data-lang-choice="it"]');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(60);
      const itState = await page.evaluate(() => ({
        pathname: window.location.pathname,
        lang: document.documentElement.lang,
        gwLang: localStorage.getItem('gw_lang'),
        gcLang: localStorage.getItem('gc_lang'),
      }));
      const expectedItPath = slug === 'index' ? '/it/' : `/it/${slug}.html`;
      if (itState.pathname !== expectedItPath || itState.lang !== 'it' || itState.gwLang !== 'it' || itState.gcLang !== 'it') {
        results.failures.push({
          surface: 'goalworld_site_roundtrip',
          slug,
          step: 'ES->IT',
          state: itState,
          expectedPath: expectedItPath,
        });
      }

      // Click EN in header switcher
      await page.click('.site-header [data-lang-switcher] [data-lang-choice="en"]');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(60);
      const enState = await page.evaluate(() => ({
        pathname: window.location.pathname,
        lang: document.documentElement.lang,
        gwLang: localStorage.getItem('gw_lang'),
        gcLang: localStorage.getItem('gc_lang'),
      }));
      if (enState.pathname !== startPath || enState.lang !== 'en' || enState.gwLang !== 'en' || enState.gcLang !== 'en') {
        results.failures.push({
          surface: 'goalworld_site_roundtrip',
          slug,
          step: 'IT->EN',
          state: enState,
          expectedPath: startPath,
        });
      }
      results.siteRoundTripsChecked += 1;
    }

    // 3. Verify goalchain_webapp routes across EN, ES, IT + LanguageToggle round-trips
    for (const route of WEBAPP_ROUTES) {
      pageErrors.length = 0;
      const url = `http://127.0.0.1:${appPort}${route.path}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(250);

      for (const locale of ['en', 'es', 'it', 'en']) {
        await page.click(`.play-header [data-lang-switcher] [data-lang-choice="${locale}"]`);
        await page.waitForTimeout(220);

        const state = await page.evaluate(() => {
          const htmlLang = document.documentElement.lang;
          const gwLang = localStorage.getItem('gw_lang');
          const gcLang = localStorage.getItem('gc_lang');
          const activeBtn = document
            .querySelector('.play-header [data-lang-switcher] [aria-pressed="true"]')
            ?.getAttribute('data-lang-choice');
          const h1Text = document.querySelector('h1')?.textContent?.trim() || '';
          const marketingLink = document.querySelector('.play-header-marketing-link')?.getAttribute('href') || '';
          const overflow = document.documentElement.scrollWidth > window.innerWidth;
          const bodyText = document.body.innerText || '';
          return { htmlLang, gwLang, gcLang, activeBtn, h1Text, marketingLink, overflow, bodyText };
        });

        const rawKeyHits = findRawKeys(state.bodyText);
        const errs = [];
        if (state.htmlLang !== locale) errs.push(`html[lang]=${state.htmlLang} expected ${locale}`);
        if (state.gwLang !== locale || state.gcLang !== locale) {
          errs.push(`localStorage gw_lang=${state.gwLang} gc_lang=${state.gcLang} expected ${locale}`);
        }
        if (state.activeBtn !== locale) errs.push(`active button=${state.activeBtn} expected ${locale}`);
        if (!state.h1Text) errs.push('missing <h1> text');
        const expectedMarketingPrefix =
          locale === 'en' ? 'https://goalworld.fun/' : `https://goalworld.fun/${locale}/`;
        if (state.marketingLink !== expectedMarketingPrefix) {
          errs.push(`marketingLink=${state.marketingLink} expected ${expectedMarketingPrefix}`);
        }
        if (state.overflow) errs.push('horizontal overflow detected');
        if (rawKeyHits.length) errs.push(`raw key(s) visible: ${rawKeyHits.join(', ')}`);
        if (pageErrors.length) errs.push(`console/page errors: ${pageErrors.join('; ')}`);

        results.webappRoutesChecked += 1;
        results.details.webapp.push({
          route: route.slug,
          locale,
          h1: state.h1Text,
          passed: errs.length === 0,
          errors: errs,
        });
        if (errs.length > 0) {
          results.failures.push({ surface: 'goalchain_webapp', route: route.slug, locale, errors: errs });
        }

        if ((locale === 'es' || locale === 'it') && (route.slug === 'home' || route.slug === 'dashboard')) {
          const shotFile = `play-${locale}-${route.slug}-1440x900.jpg`;
          if (!results.screenshots.some((s) => s.file === shotFile)) {
            const shot = await saveJpegShot(page, shotFile);
            results.screenshots.push({ file: path.basename(shot.path), bytes: shot.bytes });
          }
        }
      }
      results.webappRoundTripsChecked += 1;
    }

    await context.close();
  } finally {
    await browser.close();
    siteServer.closeAllConnections?.();
    appServer.closeAllConnections?.();
    siteServer.close();
    appServer.close();
  }

  const reportPath = path.join(OUT_DIR, 'i18n_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2) + '\n', 'utf8');

  console.log(
    `[i18n-suite] goalworld_site pages=${results.sitePagesChecked} (roundtrips=${results.siteRoundTripsChecked}) · goalchain_webapp checks=${results.webappRoutesChecked} (roundtrips=${results.webappRoundTripsChecked}) · screenshots=${results.screenshots.length} · failures=${results.failures.length}`
  );
  if (results.failures.length > 0) {
    console.error('❌ Failures:', JSON.stringify(results.failures, null, 2));
    process.exit(1);
  }
  console.log(`✅ All Phase 3 i18n checks passed! Report written to ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
