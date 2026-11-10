import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('/tmp/audit-tools/package.json');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const SITE_DIST = path.join(ROOT, 'goalworld_site/dist');
const DOCS_DIR = path.join(ROOT, 'docs');
const WEBAPP_DIST = path.join(ROOT, 'goalchain_webapp/dist');
const OUT_DIR = path.join(ROOT, '_work/site-overhaul-20261109/evidence/phase1');
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

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, isMobile: true },
  { name: '820x1180', width: 820, height: 1180, isMobile: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
];

const SITE_PAGES = [
  { slug: 'gw-home', path: '/index.html', shot: true },
  { slug: 'gw-book', path: '/book.html', shot: true },
  { slug: 'gw-cinema', path: '/cinema.html', shot: true },
  { slug: 'gw-studio', path: '/studio.html', shot: true },
  { slug: 'gw-collect', path: '/collect.html', shot: true },
  { slug: 'gw-live', path: '/live.html', shot: true },
  { slug: 'gw-roadmap', path: '/roadmap.html', shot: true },
  { slug: 'gw-about', path: '/about.html', shot: true },
  { slug: 'gw-faq', path: '/faq.html', shot: true },
  { slug: 'gw-press', path: '/press.html', shot: true },
  { slug: 'gw-privacy', path: '/privacy.html', shot: false },
  { slug: 'gw-terms', path: '/terms.html', shot: false },
  { slug: 'gw-404', path: '/404.html', shot: false },
];

const WEBAPP_PAGES = [
  { slug: 'play-landing', path: '/', shot: true },
  { slug: 'play-dashboard', path: '/dashboard', shot: true },
  { slug: 'play-estadio', path: '/estadio', shot: true },
  { slug: 'play-club', path: '/club', shot: true },
  { slug: 'play-goalworld', path: '/goalworld', shot: true },
  { slug: 'play-hub', path: '/hub', shot: true },
];

async function run() {
  const siteServer = await startStaticServer(SITE_DIST, DOCS_DIR, false, 4181);
  const appServer = await startStaticServer(WEBAPP_DIST, DOCS_DIR, true, 4182);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const results = [];

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
      });

      const allTargets = [
        ...SITE_PAGES.map((p) => ({ ...p, surface: 'goalworld_site', url: `http://127.0.0.1:4181${p.path}` })),
        ...WEBAPP_PAGES.map((p) => ({ ...p, surface: 'goalchain_webapp', url: `http://127.0.0.1:4182${p.path}` })),
      ];

      for (const target of allTargets) {
        const page = await context.newPage();
        const consoleErrors = [];
        page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            // Ignore expected offline external API calls in local preview (e.g. Devnet RPC or live-feed remote fetch fallback)
            if (text.includes('ERR_CONNECTION_REFUSED') || text.includes('Failed to load resource')) return;
            consoleErrors.push(text);
          }
        });

        await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(450);

        const metrics = await page.evaluate(() => {
          const docEl = document.documentElement;
          const horizontalOverflow = docEl.scrollWidth > window.innerWidth + 1;
          const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => ({
            level: Number(h.tagName.slice(1)),
            text: (h.textContent || '').trim().slice(0, 60),
          }));
          const h1Count = headings.filter((h) => h.level === 1).length;
          const skips = [];
          for (let i = 1; i < headings.length; i++) {
            if (headings[i].level > headings[i - 1].level + 1) {
              skips.push(`H${headings[i - 1].level}->H${headings[i].level} (${headings[i].text})`);
            }
          }
          const mainCount = document.querySelectorAll('main').length;
          const footerCount = document.querySelectorAll('footer').length;
          const skipLinkPresent = Boolean(document.querySelector('.skip-link'));
          const navTapMinHeight = [...document.querySelectorAll('.header-links a')].reduce((min, el) => {
            const h = el.getBoundingClientRect().height;
            return h > 0 && h < min ? h : min;
          }, 999);
          const bentoEl = document.querySelector('.bento');
          const bentoCols = bentoEl ? getComputedStyle(bentoEl).gridTemplateColumns.split(' ').length : null;
          return {
            horizontalOverflow,
            scrollWidth: docEl.scrollWidth,
            innerWidth: window.innerWidth,
            h1Count,
            headingSkips: skips,
            mainCount,
            footerCount,
            skipLinkPresent,
            navTapMinHeight: navTapMinHeight === 999 ? null : Math.round(navTapMinHeight),
            bentoCols,
          };
        });

        let shotFile = null;
        let shotBytes = null;
        if (target.shot) {
          shotFile = `${target.slug}-${vp.name}.jpg`;
          const shotPath = path.join(SHOT_DIR, shotFile);
          await page.screenshot({ path: shotPath, type: 'jpeg', quality: 80, fullPage: false });
          shotBytes = fs.statSync(shotPath).size;
        }

        results.push({
          slug: target.slug,
          surface: target.surface,
          viewport: vp.name,
          consoleErrors,
          ...metrics,
          screenshot: shotFile,
          screenshotKB: shotBytes ? Number((shotBytes / 1024).toFixed(1)) : null,
        });

        await page.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
    siteServer.close();
    appServer.close();
  }

  const outJson = path.join(OUT_DIR, 'playwright_verification.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2) + '\n');

  const overflows = results.filter((r) => r.horizontalOverflow);
  const badH1 = results.filter((r) => r.h1Count !== 1);
  const badMain = results.filter((r) => r.mainCount !== 1);
  const badFooter = results.filter((r) => r.footerCount < 1);
  const errors = results.filter((r) => r.consoleErrors.length > 0);
  const oversizeShots = results.filter((r) => r.screenshotKB && r.screenshotKB > 400);

  console.log(`Playwright verification complete: ${results.length} page-viewport checks`);
  console.log(`  Console errors: ${errors.length}`);
  console.log(`  Horizontal overflows: ${overflows.length}`);
  console.log(`  Pages with h1 !== 1: ${badH1.length}`);
  console.log(`  Pages with main !== 1: ${badMain.length}`);
  console.log(`  Pages without footer: ${badFooter.length}`);
  console.log(`  Screenshots > 400 KB: ${oversizeShots.length}`);
  if (badH1.length) console.log('  badH1:', badH1.map((x) => `${x.slug}@${x.viewport}(h1=${x.h1Count})`));
  if (badMain.length) console.log('  badMain:', badMain.map((x) => `${x.slug}@${x.viewport}(main=${x.mainCount})`));
  if (errors.length) console.log('  consoleErrors:', errors.map((x) => `${x.slug}@${x.viewport}: ${x.consoleErrors.join('; ')}`));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
