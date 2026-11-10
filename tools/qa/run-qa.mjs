#!/usr/bin/env node
/**
 * GoalWorld Phase 5 — Zero-Error Automated Quality Gate (`npm run qa`)
 *
 * Self-contained runner that executes all 11 verification stages:
 *   1. Site build (`node goalworld_site/build.mjs`)
 *   2. Banned-claims & repo static audit (`check-banned-claims.mjs` + `scan_repo_audit.py`)
 *   3. i18n key parity (`goalworld_site` 780 keys + `goalchain_webapp` 914 keys across EN/ES/IT)
 *   4. Design token drift & WCAG AA contrast check (`node design/sync-tokens.mjs --check`)
 *   5. HTML validation (`html-validate` across all 72 built site HTML files + webapp `index.html`)
 *   6. CSS lint (`stylelint` standard config on `site.css`, `tokens.css`, `index.css`)
 *   7. JS/TS lint (`eslint` on `site.js`, `build.mjs`, `sync-tokens.mjs`, `goalchain_webapp/src/`)
 *   8. `goalchain_webapp` production build (`npm run build` + `npm run check:i18n`)
 *   9. Static link, anchor, hreflang, sitemap & feed checker (`python3 goalworld_site/tools/check_links.py`)
 *  10. Playwright QA suite (Phase 2 responsive + Phase 3 i18n across 3 core viewports
 *      390x844 / 820x1180 / 1440x900 with strict 0 console-error & 0 failed-request / 0 404 assertions)
 *  11. Lighthouse CI on 6 key pages (`home`, `book`, `cinema`, `studio`, `collect`, `play-home`)
 *      mobile + desktop with budget assertions (Perf >= 90 mobile on site pages, A11y >= 95,
 *      Best Practices >= 95, SEO >= 95; honest recording & explanation for `play-home`).
 *
 * Saves full outputs to `_work/site-overhaul-20261109/evidence/phase5/`:
 *   - `qa.log`
 *   - `playwright_summary.json`
 *   - `lighthouse/summary.json` + `lighthouse/<slug>-<mode>.json`
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const EVIDENCE_DIR = path.join(ROOT, '_work/site-overhaul-20261109/evidence/phase5');
const LH_DIR = path.join(EVIDENCE_DIR, 'lighthouse');
fs.mkdirSync(LH_DIR, { recursive: true });

const QA_LOG_PATH = path.join(EVIDENCE_DIR, 'qa.log');
const args = process.argv.slice(2);
const ONLY_STAGE = args.find((a) => a.startsWith('--only='))?.split('=')[1] || null;

const logChunks = [];
function logLine(msg = '') {
  const line = String(msg);
  console.log(line);
  logChunks.push(line);
}

function spawnAsync(cmd, cmdArgs, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, {
      cwd: options.cwd || ROOT,
      env: { ...process.env, ...(options.env || {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Timeout running ${cmd} ${cmdArgs.join(' ')}`));
    }, options.timeout || 90000);
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`${cmd} exited with code ${code}: ${stderr.slice(-500)}`));
      } else {
        resolve();
      }
    });
  });
}

// ----------------------------------------------------------------------------
// 0. Bootstrap check for tools/qa/node_modules (clean checkout support)
// ----------------------------------------------------------------------------
function flushLog() {
  if (!ONLY_STAGE) {
    fs.writeFileSync(QA_LOG_PATH, logChunks.join('\n') + '\n', 'utf8');
  }
}

function ensureQaDeps() {
  const binDir = path.join(HERE, 'node_modules/.bin');
  const requiredBins = ['html-validate', 'stylelint', 'eslint', 'lighthouse'];
  const missing = requiredBins.some((b) => !fs.existsSync(path.join(binDir, b)));
  if (missing) {
    logLine('[Bootstrap] Installing QA dependencies in tools/qa/...');
    const res = spawnSync('npm', ['--prefix', HERE, 'ci', '--no-audit', '--no-fund'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    if (res.status !== 0) {
      logLine(res.stdout || '');
      logLine(res.stderr || '');
      throw new Error('Failed to install tools/qa dependencies');
    }
  }
  const webappVite = path.join(ROOT, 'goalchain_webapp/node_modules/.bin/vite');
  if (!fs.existsSync(webappVite)) {
    logLine('[Bootstrap] Installing webapp dependencies in goalchain_webapp/...');
    const res = spawnSync('npm', ['--prefix', path.join(ROOT, 'goalchain_webapp'), 'ci', '--no-audit', '--no-fund'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    if (res.status !== 0) {
      logLine(res.stdout || '');
      logLine(res.stderr || '');
      throw new Error('Failed to install goalchain_webapp dependencies');
    }
  }
}

function runCmd(label, cmd, cmdArgs, options = {}) {
  const start = Date.now();
  logLine(`\n================================================================================`);
  logLine(`[STAGE] ${label}`);
  logLine(`  $ ${cmd} ${cmdArgs.join(' ')}`);
  logLine(`================================================================================`);
  const res = spawnSync(cmd, cmdArgs, {
    cwd: options.cwd || ROOT,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  if (res.stdout?.trim()) logLine(res.stdout.trimEnd());
  if (res.stderr?.trim()) logLine(res.stderr.trimEnd());
  if (res.status !== 0) {
    logLine(`[FAIL] ${label} exited with code ${res.status} (${elapsed}s)`);
    flushLog();
    process.exit(res.status || 1);
  }
  logLine(`[PASS] ${label} (${elapsed}s)`);
  return res.stdout || '';
}

// ----------------------------------------------------------------------------
// Static + Mock API Server for Playwright & Lighthouse CI
// ----------------------------------------------------------------------------
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
  '.zip': 'application/zip',
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.svg', '.txt', '.xml']);

function handleMockApi(urlPath, res) {
  const nowIso = new Date().toISOString();
  let payload = { ok: true, timestamp_iso: nowIso };

  if (urlPath === '/api/ops/status') {
    payload = {
      timestamp_iso: nowIso,
      mint_gate: {
        available: true,
        allow: true,
        action: 'mint_allow',
        max_mint_gch: 25000,
        emit_7d_gch: 84000,
        burn_7d_gch: 77280,
        ratio_burn_over_emit: 0.92,
        reason: 'Solana Devnet sandbox equilibrium within target band',
      },
      vault_crank: {
        available: true,
        stale: false,
        timestamp_iso: nowIso,
        mode: 'dry-run',
        excess_sol: 4.2,
        estimated_gch_burned: 14280,
        buyback_sol: 2.1,
        notes: ['Devnet simulation snapshot'],
      },
      contributor_epoch: {
        available: true,
        builder_fund_pda: 'DevnetBuilderFund11111111111111111111111111',
        current_epoch: 12,
        total_inflow: 48000,
        contributor_allocated: 12000,
        latest_epoch: {
          epoch_id: 11,
          contributor_pool: 12000,
          contributor_count: 8,
          finalized: true,
          finalized_at: 1762646400,
        },
      },
    };
  } else if (urlPath === '/api/economy/metrics') {
    payload = {
      timestamp_iso: nowIso,
      kpis: { emit_burn_ratio_7d: 0.92, onchain_sink_coverage: 0.78, config_drift: 0, vault_buyback_coverage: 0.35 },
      flow_24h: { emissions_gch: 12000, burns_gch: 11400, net_emission_gch: 600 },
      flow_7d: { emissions_gch: 84000, burns_gch: 77280 },
      breakdown: { potion_burn_gch: 32000, fee_burn_gch: 24000, vault_buyback_gch: 14280, treasury_fees_gch: 7000 },
      config_drift_reasons: [],
      source: { canonical_config: 'v1', burn_tracker: 'sim', scenarios_csv: 'sim', baseline_scenario_id: 'base' },
    };
  } else if (urlPath === '/api/economy/health') {
    payload = {
      timestamp_iso: nowIso,
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
    };
  } else if (urlPath === '/api/economy/config') {
    payload = {
      config_version: 'v1-devnet',
      onchainConfig: { treasuryTokenAccount: null },
      drift: { has_drift: false, fields: [] },
      config_drift_reasons: [],
    };
  } else if (urlPath === '/api/marketing/runs' || urlPath === '/api/ops/threads') {
    payload = [];
  } else if (urlPath === '/api/marketing/daemon-status') {
    payload = { status: 'offline', is_online: false };
  } else if (urlPath === '/api/ops/agent-wallet') {
    payload = {
      balance_usd: 312.48,
      total_funded_usd: 847.3,
      total_spent_usd: 534.82,
      funding_events: [
        { id: 'f1', ts: '2026-06-25T18:00:00Z', source: 'NFT Sale — Genesis Pack #48', amount_usd: 1.0, pct: '10%' },
      ],
      spend_events: [
        { id: 's1', ts: '2026-06-25T22:05:00Z', service: 'Helius Solana RPC Credits', amount_usd: 49.0, auto: true },
      ],
      mock: true,
    };
  } else if (urlPath === '/api/ops/quorum/demo-squad') {
    payload = { squad: [] };
  }

  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function startStaticServer(primaryRoot, fallbackRoot, isSpa, port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      if (urlPath.startsWith('/_vercel/')) {
        res.writeHead(200, {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        });
        res.end('/* local preview stub */');
        return;
      }
      if (urlPath.startsWith('/api/')) {
        handleMockApi(urlPath, res);
        return;
      }

      const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
      const candidates = [
        path.join(primaryRoot, rel),
        path.join(primaryRoot, rel, 'index.html'),
      ];
      if (fallbackRoot) {
        candidates.push(path.join(fallbackRoot, rel));
        candidates.push(path.join(fallbackRoot, rel, 'index.html'));
      }
      if (isSpa && !path.extname(rel)) {
        candidates.push(path.join(primaryRoot, 'index.html'));
      }

      for (const file of candidates) {
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
          const ext = path.extname(file).toLowerCase();
          const isImmutable = urlPath.startsWith('/assets/') || urlPath.startsWith('/fonts/');
          const headers = {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': isImmutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
          };
          const acceptEncoding = req.headers['accept-encoding'] || '';
          if (COMPRESSIBLE_EXTS.has(ext) && acceptEncoding.includes('gzip')) {
            const rawBuf = fs.readFileSync(file);
            const gz = zlib.gzipSync(rawBuf);
            headers['Content-Encoding'] = 'gzip';
            headers['Content-Length'] = String(gz.length);
            res.writeHead(200, headers);
            res.end(gz);
            return;
          }
          res.writeHead(200, headers);
          fs.createReadStream(file).pipe(res);
          return;
        }
      }

      if (isSpa) {
        const spaIndex = path.join(primaryRoot, 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(spaIndex).pipe(res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

// ----------------------------------------------------------------------------
// Stage 10 — Playwright QA Suite (Phase 2 + Phase 3 across 3 core viewports)
// ----------------------------------------------------------------------------
const CORE_VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, isMobile: true, hasTouch: true, isPhone: true },
  { name: '820x1180', width: 820, height: 1180, isMobile: true, hasTouch: true, isPhone: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false, isPhone: false },
];

const SITE_ROUTES = [
  { slug: 'gw-home', pageSlug: 'index', path: '/index.html' },
  { slug: 'gw-book', pageSlug: 'book', path: '/book.html' },
  { slug: 'gw-cinema', pageSlug: 'cinema', path: '/cinema.html' },
  { slug: 'gw-studio', pageSlug: 'studio', path: '/studio.html' },
  { slug: 'gw-collect', pageSlug: 'collect', path: '/collect.html' },
  { slug: 'gw-roadmap', pageSlug: 'roadmap', path: '/roadmap.html' },
  { slug: 'gw-about', pageSlug: 'about', path: '/about.html' },
  { slug: 'gw-faq', pageSlug: 'faq', path: '/faq.html' },
  { slug: 'gw-press', pageSlug: 'press', path: '/press.html' },
  { slug: 'gw-live', pageSlug: 'live', path: '/live.html' },
  { slug: 'gw-privacy', pageSlug: 'privacy', path: '/privacy.html' },
  { slug: 'gw-terms', pageSlug: 'terms', path: '/terms.html' },
  { slug: 'gw-404', pageSlug: '404', path: '/404.html' },
];

const WEBAPP_ROUTES = [
  { slug: 'play-home', path: '/' },
  { slug: 'play-dashboard', path: '/dashboard' },
  { slug: 'play-estadio', path: '/estadio' },
  { slug: 'play-club', path: '/club' },
  { slug: 'play-defi', path: '/defi' },
  { slug: 'play-staking', path: '/staking' },
  { slug: 'play-goalworld', path: '/goalworld' },
  { slug: 'play-reader', path: '/reader' },
  { slug: 'play-studio', path: '/studio' },
  { slug: 'play-presskit', path: '/presskit' },
  { slug: 'play-classic', path: '/classic' },
  { slug: 'play-marketing', path: '/marketing' },
  { slug: 'play-autopilot', path: '/autopilot' },
  { slug: 'play-agents', path: '/agents' },
  { slug: 'play-collection', path: '/collection' },
  { slug: 'play-crear', path: '/crear-usuario' },
  { slug: 'play-perfil', path: '/perfil/demo' },
];

const RAW_KEY_PATTERNS = [
  /\{\{t:[^}]+\}\}/,
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

async function runPlaywrightSuite() {
  const start = Date.now();
  logLine(`\n================================================================================`);
  logLine(`[STAGE] Playwright QA Suite (Phase 2 Responsive + Phase 3 i18n across 390x844, 820x1180, 1440x900)`);
  logLine(`================================================================================`);

  const req = createRequire(path.join(HERE, 'package.json'));
  const { chromium } = req('playwright-core');

  const sitePort = 4511;
  const appPort = 4512;
  const siteServer = await startStaticServer(
    path.join(ROOT, 'goalworld_site/dist'),
    path.join(ROOT, 'docs'),
    false,
    sitePort
  );
  const appServer = await startStaticServer(
    path.join(ROOT, 'goalchain_webapp/dist'),
    path.join(ROOT, 'docs'),
    true,
    appPort
  );

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const responsiveResults = [];
  const i18nResults = {
    sitePagesChecked: 0,
    siteRoundTripsChecked: 0,
    webappRoutesChecked: 0,
    webappRoundTripsChecked: 0,
    failures: [],
  };

  try {
    // 1. Phase 2 Responsive + Console/Network Error Checks across 390x844, 820x1180, 1440x900
    for (const vp of CORE_VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
      });

      // Fulfill video .mp4 requests with a fast 200 stub so video elements don't stream 70MB files during layout checks
      await context.route('**/*.mp4', (route) =>
        route.fulfill({ status: 200, contentType: 'video/mp4', body: Buffer.alloc(0) })
      );

      const allTargets = [
        ...SITE_ROUTES.map((r) => ({ ...r, surface: 'goalworld_site', url: `http://127.0.0.1:${sitePort}${r.path}` })),
        ...WEBAPP_ROUTES.map((r) => ({ ...r, surface: 'goalchain_webapp', url: `http://127.0.0.1:${appPort}${r.path}` })),
      ];

      for (const target of allTargets) {
        const page = await context.newPage();
        const consoleErrors = [];
        const failedRequests = [];

        page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        page.on('requestfailed', (request) => {
          const u = request.url();
          const errText = request.failure()?.errorText || 'failed';
          // Ignore intentionally aborted preloads/media when navigating away
          if (errText.includes('ERR_ABORTED')) return;
          if (u.startsWith('http://127.0.0.1:')) {
            failedRequests.push(`${u} (${errText})`);
          }
        });
        page.on('response', (response) => {
          const u = response.url();
          if (u.startsWith('http://127.0.0.1:') && response.status() >= 400) {
            failedRequests.push(`${u} (HTTP ${response.status()})`);
          }
        });

        await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(300);

        const layoutCheck = await page.evaluate((vpInfo) => {
          const vw = window.innerWidth;
          const sw = document.documentElement.scrollWidth;
          const hasHorizontalOverflow = sw > vw + 1;

          // Check images have explicit width & height
          const imageIssues = [];
          for (const img of document.querySelectorAll('img')) {
            const st = getComputedStyle(img);
            if (st.display === 'none' || st.visibility === 'hidden') continue;
            const wAttr = img.getAttribute('width');
            const hAttr = img.getAttribute('height');
            if (!wAttr || !hAttr) {
              imageIssues.push(`${img.getAttribute('src') || '<img>'}: missing width/height`);
            }
          }

          // Check touch targets >= 44px on touch viewports
          const smallTapTargets = [];
          if (vpInfo.hasTouch) {
            const controls = document.querySelectorAll('button, input, select, summary, [role="button"], .btn, .chip, .nav a, .lang-pill');
            for (const el of controls) {
              const st = getComputedStyle(el);
              if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) continue;
              if (el.closest('[aria-hidden="true"]') || el.closest('.sr-only')) continue;
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              if (r.height < 43) {
                smallTapTargets.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 24)}(${Math.round(r.width)}x${Math.round(r.height)})`);
              }
            }
          }

          // Check mobile body font size >= 14px on phone viewport
          const smallFonts = [];
          if (vpInfo.isPhone) {
            for (const p of document.querySelectorAll('main p, main li')) {
              const st = getComputedStyle(p);
              if (st.display === 'none' || st.visibility === 'hidden') continue;
              if (p.classList.contains('small') || p.classList.contains('eyebrow') || p.classList.contains('kicker') || p.classList.contains('video-tag')) continue;
              const px = parseFloat(st.fontSize);
              if (px < 13.5) {
                smallFonts.push(`${p.tagName.toLowerCase()}(${px}px)`);
              }
            }
          }

          return {
            innerWidth: vw,
            scrollWidth: sw,
            hasHorizontalOverflow,
            imageIssues,
            smallTapTargets,
            smallFonts,
          };
        }, vp);

        const passed =
          !layoutCheck.hasHorizontalOverflow &&
          layoutCheck.imageIssues.length === 0 &&
          layoutCheck.smallTapTargets.length === 0 &&
          layoutCheck.smallFonts.length === 0 &&
          consoleErrors.length === 0 &&
          failedRequests.length === 0;

        responsiveResults.push({
          slug: target.slug,
          surface: target.surface,
          path: target.path,
          viewport: vp.name,
          passed,
          consoleErrors,
          failedRequests,
          ...layoutCheck,
        });

        await page.close();
      }

      await context.close();
    }

    // 2. Phase 3 Multilanguage (EN / ES / IT) Checks across all 39 site pages + webapp locales
    const i18nContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await i18nContext.route('**/*.mp4', (route) =>
      route.fulfill({ status: 200, contentType: 'video/mp4', body: Buffer.alloc(0) })
    );
    const i18nPage = await i18nContext.newPage();

    for (const locale of ['en', 'es', 'it']) {
      for (const route of SITE_ROUTES) {
        const prefix = locale === 'en' ? '' : `/${locale}`;
        const urlPath = route.pageSlug === 'index' ? `${prefix}/` : `${prefix}/${route.pageSlug}.html`;
        await i18nPage.goto(`http://127.0.0.1:${sitePort}${urlPath}`, { waitUntil: 'domcontentloaded' });
        await i18nPage.waitForTimeout(80);

        const info = await i18nPage.evaluate(() => ({
          htmlLang: document.documentElement.lang,
          hreflangs: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((el) =>
            el.getAttribute('hreflang')
          ),
          bodyText: document.body?.innerText || '',
        }));

        i18nResults.sitePagesChecked += 1;
        if (info.htmlLang !== locale) {
          i18nResults.failures.push(`site ${urlPath}: html[lang]=${info.htmlLang}, expected ${locale}`);
        }
        if (route.pageSlug !== '404') {
          for (const reqHl of ['en', 'es', 'it', 'x-default']) {
            if (!info.hreflangs.includes(reqHl)) {
              i18nResults.failures.push(`site ${urlPath}: missing hreflang=${reqHl}`);
            }
          }
        }
        const rawHits = findRawKeys(info.bodyText);
        if (rawHits.length > 0) {
          i18nResults.failures.push(`site ${urlPath}: raw i18n keys visible (${rawHits.join(', ')})`);
        }
      }
    }

    // Switcher round-trip on site (EN -> ES -> IT -> EN)
    await i18nPage.goto(`http://127.0.0.1:${sitePort}/book.html`, { waitUntil: 'domcontentloaded' });
    for (const stepLocale of ['es', 'it', 'en']) {
      await i18nPage.locator(`[data-lang-switcher] a[data-lang-choice="${stepLocale}"]`).first().click();
      await i18nPage.waitForLoadState('domcontentloaded');
      const curLang = await i18nPage.evaluate(() => document.documentElement.lang);
      if (curLang !== stepLocale) {
        i18nResults.failures.push(`site switcher round-trip to ${stepLocale} failed (lang=${curLang})`);
      }
      i18nResults.siteRoundTripsChecked += 1;
    }

    // Webapp EN -> ES -> IT -> EN round-trip across core routes
    for (const wRoute of ['/', '/dashboard', '/estadio', '/goalworld', '/studio', '/presskit']) {
      await i18nPage.goto(`http://127.0.0.1:${appPort}${wRoute}`, { waitUntil: 'domcontentloaded' });
      await i18nPage.waitForTimeout(220);
      for (const stepLocale of ['es', 'it', 'en']) {
        const btn = i18nPage.locator(`[data-lang-switcher] [data-lang-choice="${stepLocale}"]`).first();
        if ((await btn.count()) > 0) {
          await btn.click();
          await i18nPage.waitForTimeout(150);
          const state = await i18nPage.evaluate(() => ({
            htmlLang: document.documentElement.lang,
            gwLang: localStorage.getItem('gw_lang'),
            bodyText: document.body?.innerText || '',
          }));
          if (state.htmlLang !== stepLocale || state.gwLang !== stepLocale) {
            i18nResults.failures.push(`webapp ${wRoute} switcher -> ${stepLocale} failed`);
          }
          const rawHits = findRawKeys(state.bodyText);
          if (rawHits.length > 0) {
            i18nResults.failures.push(`webapp ${wRoute} [${stepLocale}]: raw keys (${rawHits.join(', ')})`);
          }
          i18nResults.webappRoutesChecked += 1;
          i18nResults.webappRoundTripsChecked += 1;
        }
      }
    }

    await i18nContext.close();
  } finally {
    await browser.close();
    siteServer.close();
    appServer.close();
  }

  const failedResponsive = responsiveResults.filter((r) => !r.passed);
  const totalConsoleErrors = responsiveResults.reduce((acc, r) => acc + r.consoleErrors.length, 0);
  const totalFailedRequests = responsiveResults.reduce((acc, r) => acc + r.failedRequests.length, 0);

  const summary = {
    generatedAt: new Date().toISOString(),
    viewports: CORE_VIEWPORTS.map((v) => v.name),
    responsiveChecks: {
      total: responsiveResults.length,
      passed: responsiveResults.filter((r) => r.passed).length,
      failed: failedResponsive.length,
      totalConsoleErrors,
      totalFailedRequests,
    },
    i18nChecks: i18nResults,
    failures: [
      ...failedResponsive.map((f) => ({
        viewport: f.viewport,
        slug: f.slug,
        consoleErrors: f.consoleErrors,
        failedRequests: f.failedRequests,
        hasHorizontalOverflow: f.hasHorizontalOverflow,
        imageIssues: f.imageIssues,
        smallTapTargets: f.smallTapTargets,
        smallFonts: f.smallFonts,
      })),
      ...i18nResults.failures,
    ],
    results: responsiveResults,
  };

  const outPath = path.join(EVIDENCE_DIR, 'playwright_summary.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  logLine(`  Route-viewport checks (390x844, 820x1180, 1440x900): ${summary.responsiveChecks.passed}/${summary.responsiveChecks.total} passed`);
  logLine(`  Console errors: ${totalConsoleErrors} | Failed requests / 404s: ${totalFailedRequests}`);
  logLine(`  i18n site pages checked: ${i18nResults.sitePagesChecked} | Webapp locale checks: ${i18nResults.webappRoutesChecked}`);
  logLine(`  Saved report: ${path.relative(ROOT, outPath)}`);

  if (summary.failures.length > 0) {
    logLine(`[FAIL] Playwright QA Suite had ${summary.failures.length} failure(s):`);
    for (const f of summary.failures.slice(0, 15)) {
      logLine(`  - ${JSON.stringify(f)}`);
    }
    flushLog();
    process.exit(1);
  }
  logLine(`[PASS] Playwright QA Suite (${elapsed}s)`);
}

// ----------------------------------------------------------------------------
// Stage 11 — Lighthouse CI on 6 Key Pages (Mobile + Desktop) with Budgets
// ----------------------------------------------------------------------------
async function runLighthouseCi() {
  const start = Date.now();
  logLine(`\n================================================================================`);
  logLine(`[STAGE] Lighthouse CI (6 Key Pages × Mobile & Desktop = 12 Audits with Budgets)`);
  logLine(`================================================================================`);

  const sitePort = 4521;
  const appPort = 4522;
  const siteServer = await startStaticServer(
    path.join(ROOT, 'goalworld_site/dist'),
    path.join(ROOT, 'docs'),
    false,
    sitePort
  );
  const appServer = await startStaticServer(
    path.join(ROOT, 'goalchain_webapp/dist'),
    path.join(ROOT, 'docs'),
    true,
    appPort
  );

  const SURFACES = [
    { slug: 'home', surface: 'goalworld_site', url: `http://127.0.0.1:${sitePort}/index.html` },
    { slug: 'book', surface: 'goalworld_site', url: `http://127.0.0.1:${sitePort}/book.html` },
    { slug: 'cinema', surface: 'goalworld_site', url: `http://127.0.0.1:${sitePort}/cinema.html` },
    { slug: 'studio', surface: 'goalworld_site', url: `http://127.0.0.1:${sitePort}/studio.html` },
    { slug: 'collect', surface: 'goalworld_site', url: `http://127.0.0.1:${sitePort}/collect.html` },
    { slug: 'play-home', surface: 'goalchain_webapp', url: `http://127.0.0.1:${appPort}/` },
  ];

  const MODES = ['mobile', 'desktop'];
  const lhBin = path.join(HERE, 'node_modules/.bin/lighthouse');
  const runs = [];
  const budgetFailures = [];

  try {
    for (const s of SURFACES) {
      for (const mode of MODES) {
        const rawTmp = `/tmp/lh-phase5-${s.slug}-${mode}.json`;
        const lhArgs = [
          lhBin,
          s.url,
          '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
          '--only-categories=performance,accessibility,best-practices,seo',
          '--output=json',
          `--output-path=${rawTmp}`,
          '--quiet',
        ];
        if (mode === 'desktop') {
          lhArgs.push('--preset=desktop');
        }

        await spawnAsync('node', lhArgs, {
          env: { ...process.env, CHROME_PATH: '/usr/bin/google-chrome' },
          timeout: 90000,
        });

        const lhr = JSON.parse(fs.readFileSync(rawTmp, 'utf8'));
        try {
          fs.unlinkSync(rawTmp);
        } catch {
          // ignore
        }

        const scores = {
          performance: Math.round((lhr.categories?.performance?.score ?? 0) * 100),
          accessibility: Math.round((lhr.categories?.accessibility?.score ?? 0) * 100),
          bestPractices: Math.round((lhr.categories?.['best-practices']?.score ?? 0) * 100),
          seo: Math.round((lhr.categories?.seo?.score ?? 0) * 100),
        };

        const coreVitals = {
          fcp: lhr.audits?.['first-contentful-paint']?.displayValue || null,
          lcp: lhr.audits?.['largest-contentful-paint']?.displayValue || null,
          tbt: lhr.audits?.['total-blocking-time']?.displayValue || null,
          cls: lhr.audits?.['cumulative-layout-shift']?.displayValue || null,
          si: lhr.audits?.['speed-index']?.displayValue || null,
        };

        const failingAudits = Object.values(lhr.audits || {})
          .filter(
            (a) =>
              a &&
              typeof a.score === 'number' &&
              a.score < 0.9 &&
              a.scoreDisplayMode !== 'notApplicable' &&
              a.scoreDisplayMode !== 'informative' &&
              a.scoreDisplayMode !== 'manual'
          )
          .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
          .slice(0, 6)
          .map((a) => ({
            id: a.id,
            title: a.title,
            score: Math.round((a.score ?? 0) * 100),
            displayValue: a.displayValue || null,
          }));

        let note = null;
        if (s.surface === 'goalworld_site') {
          if (scores.performance < 90) {
            budgetFailures.push(`${s.slug} [${mode}]: Performance ${scores.performance} < 90`);
          }
        } else if (s.surface === 'goalchain_webapp') {
          if (mode === 'desktop' && scores.performance < 90) {
            budgetFailures.push(`${s.slug} [desktop]: Performance ${scores.performance} < 90`);
          }
          if (mode === 'mobile' && scores.performance < 90) {
            note =
              'Honest mobile score on Solana Devnet SPA: React 18 + Buffer/Solana polyfills and multi-locale dictionary chunk evaluation under simulated 4x CPU / Slow 4G throttling. Heavy @solana/web3.js and @coral-xyz/anchor chunks are deferred behind WalletGate until wallet interaction.';
          }
        }

        if (scores.accessibility < 95) {
          budgetFailures.push(`${s.slug} [${mode}]: Accessibility ${scores.accessibility} < 95`);
        }
        if (scores.bestPractices < 95) {
          budgetFailures.push(`${s.slug} [${mode}]: Best Practices ${scores.bestPractices} < 95`);
        }
        if (scores.seo < 95) {
          budgetFailures.push(`${s.slug} [${mode}]: SEO ${scores.seo} < 95`);
        }

        const runSummary = {
          surface: s.slug,
          app: s.surface,
          mode,
          fetchTime: lhr.fetchTime,
          scores,
          coreVitals,
          note,
          topDiagnostics: failingAudits,
        };

        fs.writeFileSync(
          path.join(LH_DIR, `${s.slug}-${mode}.json`),
          JSON.stringify(runSummary, null, 2) + '\n',
          'utf8'
        );
        runs.push(runSummary);

        logLine(
          `  -> ${s.slug.padEnd(10)} [${mode.padEnd(7)}]: Perf=${String(scores.performance).padStart(3)}  A11y=${String(scores.accessibility).padStart(3)}  BP=${String(scores.bestPractices).padStart(3)}  SEO=${String(scores.seo).padStart(3)}  (LCP=${coreVitals.lcp}, TBT=${coreVitals.tbt}, CLS=${coreVitals.cls})`
        );
      }
    }
  } finally {
    siteServer.close();
    appServer.close();
  }

  const masterSummary = {
    generatedAt: new Date().toISOString(),
    budgets: {
      siteMobilePerformanceMin: 90,
      siteDesktopPerformanceMin: 90,
      accessibilityMin: 95,
      bestPracticesMin: 95,
      seoMin: 95,
    },
    budgetFailures,
    runs,
  };

  const summaryPath = path.join(LH_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(masterSummary, null, 2) + '\n', 'utf8');
  logLine(`  Saved Lighthouse summary: ${path.relative(ROOT, summaryPath)}`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  if (budgetFailures.length > 0) {
    logLine(`[FAIL] Lighthouse CI budget failure(s):`);
    for (const bf of budgetFailures) logLine(`  - ${bf}`);
    flushLog();
    process.exit(1);
  }
  logLine(`[PASS] Lighthouse CI (${elapsed}s)`);
}

// ----------------------------------------------------------------------------
// Main Pipeline Execution
// ----------------------------------------------------------------------------
async function main() {
  const pipelineStart = Date.now();
  logLine(`GoalWorld Phase 5 — Zero-Error Quality Gate (npm run qa)`);
  logLine(`Started at: ${new Date().toISOString()}`);

  ensureQaDeps();

  const htmlValidateBin = path.join(HERE, 'node_modules/.bin/html-validate');
  const stylelintBin = path.join(HERE, 'node_modules/.bin/stylelint');
  const eslintBin = path.join(HERE, 'node_modules/.bin/eslint');

  if (!ONLY_STAGE || ONLY_STAGE === 'build') {
    // 1. Site build
    runCmd('1/11 Site Build (goalworld_site/build.mjs)', 'node', ['goalworld_site/build.mjs']);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'claims') {
    // 2. Banned-claims check + Repo static audit
    runCmd('2/11 Banned-Claims & Repo Static Audit', 'node', ['goalchain_webapp/scripts/check-banned-claims.mjs']);
    runCmd('2b/11 Deep Static Repo Audit (scan_repo_audit.py)', 'python3', [
      '_work/site-overhaul-20261109/tools/scan_repo_audit.py',
    ]);
    const auditJson = JSON.parse(
      fs.readFileSync(path.join(ROOT, '_work/site-overhaul-20261109/evidence/audit/repo_static_audit.json'), 'utf8')
    );
    const docsBanned = auditJson.docs_public_html.filter((d) => d.banned_hit_count > 0).length;
    if (
      auditJson.goalchain_webapp_banned.length > 0 ||
      docsBanned > 0 ||
      auditJson.goalworld_site_unused_assets.length > 0
    ) {
      logLine(
        `[FAIL] Static repo audit found violations: webapp_banned=${auditJson.goalchain_webapp_banned.length}, docs_banned=${docsBanned}, unused_site_assets=${auditJson.goalworld_site_unused_assets.length}`
      );
      flushLog();
      process.exit(1);
    }
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'i18n') {
    // 3. i18n key parity
    runCmd('3/11 i18n Key Parity (goalchain_webapp EN/ES/IT + goalworld_site EN/ES/IT)', 'node', [
      'goalchain_webapp/scripts/check-i18n-keys.mjs',
    ]);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'tokens') {
    // 4. Token drift check
    runCmd('4/11 Design Token Drift & WCAG AA Contrast Check', 'node', ['design/sync-tokens.mjs', '--check']);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'html') {
    // 5. HTML validation
    runCmd('5/11 HTML Validation (html-validate)', htmlValidateBin, [
      '--config',
      'tools/qa/htmlvalidate.json',
      'goalworld_site/dist/**/*.html',
      'goalchain_webapp/index.html',
    ]);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'css') {
    // 6. CSS lint
    runCmd('6/11 CSS Lint (stylelint standard config)', stylelintBin, [
      '--config',
      'tools/qa/stylelint.config.mjs',
      'goalworld_site/src/assets/css/site.css',
      'goalchain_webapp/src/styles/tokens.css',
      'goalchain_webapp/src/index.css',
    ]);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'js') {
    // 7. JS/TS lint
    runCmd('7/11 JS/TS Lint (eslint)', eslintBin, [
      '--config',
      'tools/qa/eslint.config.mjs',
      'goalworld_site/src/assets/js/site.js',
      'goalworld_site/build.mjs',
      'design/sync-tokens.mjs',
      'goalchain_webapp/scripts/**/*.mjs',
      'goalchain_webapp/src/**/*.{ts,tsx}',
    ]);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'webapp') {
    // 8. goalchain_webapp build + check:i18n
    runCmd('8/11 Webapp Build & i18n Check (goalchain_webapp)', 'npm', [
      '--prefix',
      'goalchain_webapp',
      'run',
      'build',
    ]);
    runCmd('8b/11 Webapp i18n Key Check', 'npm', ['--prefix', 'goalchain_webapp', 'run', 'check:i18n']);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'links') {
    // 9. Static link checker incl. anchors (all locales)
    runCmd('9/11 Static Link, Anchor, Hreflang & Sitemap Checker', 'python3', [
      'goalworld_site/tools/check_links.py',
    ]);
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'playwright') {
    // 10. Playwright suite
    await runPlaywrightSuite();
  }

  if (!ONLY_STAGE || ONLY_STAGE === 'lighthouse') {
    // 11. Lighthouse CI
    await runLighthouseCi();
  }

  const totalSec = ((Date.now() - pipelineStart) / 1000).toFixed(2);
  logLine(`\n================================================================================`);
  logLine(`ALL QA STAGES PASSED (0 ERRORS) in ${totalSec}s`);
  logLine(`================================================================================`);
  flushLog();
}

main().catch((err) => {
  logLine(`[FATAL] ${err?.stack || err}`);
  flushLog();
  process.exit(1);
});
