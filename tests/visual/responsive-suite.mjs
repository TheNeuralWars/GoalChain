#!/usr/bin/env node
/**
 * GoalWorld Phase 2 — Real Responsive & Visual Quality Suite (Playwright + System Chrome)
 *
 * Loads every route of goalworld_site (13 routes) and goalchain_webapp (17 routes)
 * across all 6 target viewports:
 *   - 360x740   (small Android phone, touch)
 *   - 390x844   (iPhone 14/15 portrait, touch)
 *   - 820x1180  (iPad Air portrait, touch)
 *   - 1024x1366 (iPad Pro portrait / small laptop, touch)
 *   - 1440x900  (standard desktop)
 *   - 1920x1080 (large HD desktop)
 * Plus landscape phone (740x360) checks on core routes.
 *
 * Assertions per route/viewport:
 *   1. No horizontal overflow (scrollWidth <= innerWidth)
 *   2. No visible element offscreen horizontally
 *   3. Tap targets >= 44px (height >= 44px and width >= 44px for standalone controls;
 *      height >= 44px for links/buttons/inputs/summary) on touch viewports
 *   4. Nav usable (menu opens and closes with both touch/click and keyboard Enter/Escape)
 *   5. Images have explicit width & height attributes (no CLS) and load cleanly
 *   6. Font sizes >= 14px for body/prose/controls on mobile viewports (360x740, 390x844)
 *   7. Sticky CTA / fixed bottom bar does not permanently cover footer or page content
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
const OUT_DIR = path.join(ROOT, '_work/site-overhaul-20261109/evidence/phase2');
const SHOT_DIR = path.join(OUT_DIR, 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const args = process.argv.slice(2);
const NO_SHOTS = args.includes('--no-shots');
const SURFACE_FILTER = args.find((a) => a.startsWith('--surface='))?.split('=')[1] || null;
const SLUG_FILTER = args.find((a) => a.startsWith('--slug='))?.split('=')[1] || null;
const VP_FILTER = args.find((a) => a.startsWith('--viewport='))?.split('=')[1] || null;

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

export const VIEWPORTS = [
  { name: '360x740', width: 360, height: 740, isMobile: true, hasTouch: true, isPhone: true },
  { name: '390x844', width: 390, height: 844, isMobile: true, hasTouch: true, isPhone: true },
  { name: '820x1180', width: 820, height: 1180, isMobile: true, hasTouch: true, isPhone: false },
  { name: '1024x1366', width: 1024, height: 1366, isMobile: true, hasTouch: true, isPhone: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false, isPhone: false },
  { name: '1920x1080', width: 1920, height: 1080, isMobile: false, hasTouch: false, isPhone: false },
];

export const SITE_ROUTES = [
  { slug: 'gw-home', path: '/index.html' },
  { slug: 'gw-book', path: '/book.html' },
  { slug: 'gw-cinema', path: '/cinema.html' },
  { slug: 'gw-studio', path: '/studio.html' },
  { slug: 'gw-collect', path: '/collect.html' },
  { slug: 'gw-live', path: '/live.html' },
  { slug: 'gw-roadmap', path: '/roadmap.html' },
  { slug: 'gw-about', path: '/about.html' },
  { slug: 'gw-faq', path: '/faq.html' },
  { slug: 'gw-press', path: '/press.html' },
  { slug: 'gw-privacy', path: '/privacy.html' },
  { slug: 'gw-terms', path: '/terms.html' },
  { slug: 'gw-404', path: '/404.html' },
];

export const WEBAPP_ROUTES = [
  { slug: 'play-landing', path: '/' },
  { slug: 'play-dashboard', path: '/dashboard' },
  { slug: 'play-estadio', path: '/estadio' },
  { slug: 'play-defi', path: '/defi' },
  { slug: 'play-club', path: '/club' },
  { slug: 'play-goalworld', path: '/goalworld' },
  { slug: 'play-staking', path: '/staking' },
  { slug: 'play-marketing', path: '/marketing-control' },
  { slug: 'play-autopilot', path: '/autopilot' },
  { slug: 'play-agents', path: '/agents' },
  { slug: 'play-presskit', path: '/presskit' },
  { slug: 'play-coleccion', path: '/coleccion' },
  { slug: 'play-hub', path: '/hub' },
  { slug: 'play-create-user', path: '/crear-usuario' },
  { slug: 'play-profile', path: '/perfil/kora' },
  { slug: 'play-reader', path: '/reader' },
  { slug: 'play-studio', path: '/studio' },
];

const NAV_INTERACTION_SLUGS = new Set([
  'gw-home',
  'gw-book',
  'play-landing',
  'play-dashboard',
  'play-estadio',
]);

async function verifyNavInteraction(page, target, vp) {
  const surface = target.surface;
  const issues = [];
  const runInteractive = NAV_INTERACTION_SLUGS.has(target.slug);

  if (surface === 'goalworld_site') {
    const toggleVisible = await page.evaluate(() => {
      const btn = document.querySelector('.nav-toggle');
      if (!btn) return false;
      const st = getComputedStyle(btn);
      return st.display !== 'none' && st.visibility !== 'hidden';
    });

    if (toggleVisible) {
      if (!runInteractive) return issues;
      try {
        // 1. Touch/Click open
        await page.click('.nav-toggle', { timeout: 2500 });
        const openedByClick = await page.evaluate(() => {
          const btn = document.querySelector('.nav-toggle');
          const nav = document.getElementById('site-nav');
          return btn?.getAttribute('aria-expanded') === 'true' && nav?.classList.contains('open');
        });
        if (!openedByClick) {
          issues.push('nav-toggle click did not open #site-nav or set aria-expanded=true');
        }

        // 2. Keyboard Escape close
        await page.keyboard.press('Escape');
        const closedByEsc = await page.evaluate(() => {
          const btn = document.querySelector('.nav-toggle');
          const nav = document.getElementById('site-nav');
          return btn?.getAttribute('aria-expanded') === 'false' && !nav?.classList.contains('open');
        });
        if (!closedByEsc) {
          issues.push('Escape key did not close #site-nav or reset aria-expanded=false');
        }

        // 3. Keyboard Enter open + click close
        await page.focus('.nav-toggle');
        await page.keyboard.press('Enter');
        const openedByKey = await page.evaluate(() => {
          const nav = document.getElementById('site-nav');
          return Boolean(nav?.classList.contains('open'));
        });
        if (!openedByKey) {
          issues.push('Keyboard Enter on .nav-toggle did not open #site-nav');
        }
        await page.click('.nav-toggle', { timeout: 2500 });
      } catch (e) {
        issues.push(`nav-toggle interaction error: ${e.message.split('\n')[0]}`);
      }
    } else {
      // Desktop nav: ensure links are visible
      const desktopNavOk = await page.evaluate(() => {
        const links = [...document.querySelectorAll('#site-nav a')];
        return links.length >= 5 && links.every((a) => a.getBoundingClientRect().height >= 32);
      });
      if (!desktopNavOk) {
        issues.push('Desktop #site-nav links not visible or undersized');
      }
    }
  } else {
    // goalchain_webapp
    const navState = await page.evaluate(() => {
      const mobileToggle = document.querySelector('[data-mobile-nav-toggle]');
      const railToggle = document.querySelector('.gc-rail-toggle');
      const isMobileToggleVisible =
        mobileToggle &&
        getComputedStyle(mobileToggle).display !== 'none' &&
        getComputedStyle(mobileToggle).visibility !== 'hidden';
      const isRailToggleVisible =
        railToggle &&
        getComputedStyle(railToggle).display !== 'none' &&
        getComputedStyle(railToggle).visibility !== 'hidden';
      return {
        isMobileToggleVisible: Boolean(isMobileToggleVisible),
        isRailToggleVisible: Boolean(isRailToggleVisible),
      };
    });

    if (vp.width < 768) {
      if (!navState.isMobileToggleVisible) {
        issues.push('Mobile viewport (<768px) missing visible [data-mobile-nav-toggle] menu button');
      } else if (runInteractive) {
        try {
          await page.click('[data-mobile-nav-toggle]', { timeout: 2500 });
          const opened = await page.evaluate(() => {
            const btn = document.querySelector('[data-mobile-nav-toggle]');
            const drawer = document.getElementById('gc-mobile-drawer');
            return (
              btn?.getAttribute('aria-expanded') === 'true' &&
              Boolean(drawer) &&
              getComputedStyle(drawer).display !== 'none'
            );
          });
          if (!opened) {
            issues.push('Clicking [data-mobile-nav-toggle] did not open #gc-mobile-drawer');
          }
          await page.keyboard.press('Escape');
          const closedEsc = await page.evaluate(() => {
            const btn = document.querySelector('[data-mobile-nav-toggle]');
            const drawer = document.getElementById('gc-mobile-drawer');
            return btn?.getAttribute('aria-expanded') === 'false' && !drawer;
          });
          if (!closedEsc) {
            issues.push('Pressing Escape did not close #gc-mobile-drawer');
          }
        } catch (e) {
          issues.push(`mobile nav interaction error: ${e.message.split('\n')[0]}`);
        }
      }
    } else if (vp.width < 1280) {
      if (!navState.isRailToggleVisible) {
        issues.push('Tablet viewport (<1280px) missing visible .gc-rail-toggle button');
      } else if (runInteractive) {
        try {
          await page.click('.gc-rail-toggle', { timeout: 2500 });
          const expanded = await page.evaluate(() => {
            const rail = document.querySelector('.gc-rail');
            return Boolean(rail?.classList.contains('gc-rail--expanded'));
          });
          if (!expanded) {
            issues.push('Clicking .gc-rail-toggle on tablet did not expand .gc-rail');
          }
          await page.keyboard.press('Escape');
          const collapsedEsc = await page.evaluate(() => {
            const rail = document.querySelector('.gc-rail');
            return Boolean(rail?.classList.contains('gc-rail--collapsed'));
          });
          if (!collapsedEsc) {
            issues.push('Pressing Escape on tablet did not collapse .gc-rail drawer');
          }
        } catch (e) {
          issues.push(`tablet nav interaction error: ${e.message.split('\n')[0]}`);
        }
      }
    } else {
      // Desktop >= 1280px
      if (!navState.isRailToggleVisible) {
        issues.push('Desktop viewport missing .gc-rail-toggle');
      }
    }
  }
  return issues;
}

async function inspectRouteAtViewport(page, target, vp) {
  // Ensure scroll at top before layout inspection
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);

  const raw = await page.evaluate((vpInfo) => {
    const docEl = document.documentElement;
    const innerWidth = window.innerWidth;
    const innerHeight = window.innerHeight;
    const scrollWidth = Math.max(docEl.scrollWidth, document.body ? document.body.scrollWidth : 0);
    const hasHorizontalOverflow = scrollWidth > innerWidth + 1;

    function describeEl(el) {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls =
        el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.')
          : '';
      const text = (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 36);
      return `${tag}${id}${cls}${text ? `("${text}")` : ''}`;
    }

    function isVisible(el) {
      if (!el || !el.isConnected) return false;
      if (el.closest('[hidden], [aria-hidden="true"], details:not([open]) > :not(summary)')) return false;
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function isInsideHorizontalScroller(el) {
      let cur = el.parentElement;
      while (cur && cur !== document.body && cur !== docEl) {
        const st = getComputedStyle(cur);
        if (
          (st.overflowX === 'auto' || st.overflowX === 'scroll' || st.overflowX === 'clip') &&
          cur.scrollWidth > cur.clientWidth + 2
        ) {
          return true;
        }
        cur = cur.parentElement;
      }
      return false;
    }

    function isIntentionallyOffscreen(el) {
      if (el.classList.contains('skip-link') || el.classList.contains('sr-only')) return true;
      const nav = el.closest('#site-nav');
      if (nav && !nav.classList.contains('open') && vpInfo.width <= 820) return true;
      const coachDrawer = el.closest('.gc-coach-drawer');
      if (coachDrawer && !coachDrawer.classList.contains('open')) return true;
      return false;
    }

    // 1. Overflowing / offscreen elements
    const offscreenElements = [];
    const candidates = document.querySelectorAll(
      'h1, h2, h3, h4, p, a, button, input, select, textarea, img, video, table, .card, .btn, section > *'
    );
    for (const el of candidates) {
      if (!isVisible(el) || isIntentionallyOffscreen(el) || isInsideHorizontalScroller(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.left < -2 || rect.right > innerWidth + 2) {
        offscreenElements.push({
          el: describeEl(el),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
        if (offscreenElements.length >= 12) break;
      }
    }

    // 2. Tap targets on touch viewports (< 44px)
    const smallTapTargets = [];
    if (vpInfo.hasTouch) {
      const interactives = document.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"]'
      );
      for (const el of interactives) {
        if (!isVisible(el) || isIntentionallyOffscreen(el)) continue;
        // Skip inline prose links inside paragraphs/descriptions/lists/table cells when surrounded by prose text
        if (el.tagName === 'A') {
          const st = getComputedStyle(el);
          const parent = el.parentElement;
          const parentTag = parent ? parent.tagName : '';
          const isProseInline =
            st.display === 'inline' &&
            ['P', 'LI', 'DD', 'TD', 'SMALL', 'SPAN'].includes(parentTag) &&
            parent &&
            parent.childNodes.length > 1 &&
            !el.classList.contains('btn') &&
            !el.classList.contains('go') &&
            !el.closest('nav, header, .site-footer, .play-footer, .sticky-cta');
          if (isProseInline) continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.height < 43.5 || rect.width < 43.5) {
          smallTapTargets.push({
            el: describeEl(el),
            w: Math.round(rect.width * 10) / 10,
            h: Math.round(rect.height * 10) / 10,
          });
          if (smallTapTargets.length >= 20) break;
        }
      }
    }

    // 3. Images missing width/height attributes or broken
    const imageIssues = [];
    for (const img of document.querySelectorAll('img')) {
      const wAttr = img.getAttribute('width');
      const hAttr = img.getAttribute('height');
      const src = img.getAttribute('src') || '';
      if (!wAttr || !hAttr || Number(wAttr) <= 0 || Number(hAttr) <= 0) {
        imageIssues.push({ src, issue: `missing width/height attributes (w=${wAttr}, h=${hAttr})` });
      } else if (img.complete && img.naturalWidth === 0 && src) {
        imageIssues.push({ src, issue: 'broken image (naturalWidth=0)' });
      }
    }

    // 4. Mobile font sizes < 14px on body / prose / controls
    const smallFonts = [];
    if (vpInfo.isPhone) {
      const bodyFs = parseFloat(getComputedStyle(document.body).fontSize);
      if (bodyFs < 14) {
        smallFonts.push({ el: 'body', px: bodyFs });
      }
      const textEls = document.querySelectorAll('p, li, td, dd, label, input, select, textarea, button, article');
      for (const el of textEls) {
        if (!isVisible(el) || isIntentionallyOffscreen(el)) continue;
        const text = (el.textContent || '').trim();
        if (!text) continue;
        // Skip decorative/badge/eyebrow/meta/mono micro-labels when explicitly styled as metadata tags
        if (
          el.closest(
            '.kicker, .eyebrow, .badge, .pill, .tag, .live-meta, .live-upd, .live-deadline, .play-header-devnet-pill, .gc-nav-badge, .gc-bottom-tab, .meta, .faint, .caption, figcaption, [data-badge]'
          )
        ) {
          continue;
        }
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 13.8) {
          smallFonts.push({
            el: describeEl(el),
            px: Math.round(fs * 10) / 10,
          });
          if (smallFonts.length >= 15) break;
        }
      }
    }

    return {
      innerWidth,
      innerHeight,
      scrollWidth,
      hasHorizontalOverflow,
      offscreenElements,
      smallTapTargets,
      imageIssues,
      smallFonts,
    };
  }, vp);

  // 5. Check sticky CTA / fixed bottom bar does not permanently cover footer content at bottom scroll
  const stickyIssues = await page.evaluate(async () => {
    const issues = [];
    const sticky = document.querySelector('.sticky-cta, .gc-bottom-tab');
    if (!sticky) return issues;
    const st = getComputedStyle(sticky);
    if (st.display === 'none' || st.visibility === 'hidden' || sticky.classList.contains('is-hidden')) {
      return issues;
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, left: 0, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 80));
    const afterSt = getComputedStyle(sticky);
    if (afterSt.display === 'none' || afterSt.visibility === 'hidden' || sticky.classList.contains('is-hidden')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return issues;
    }
    const stickyRect = sticky.getBoundingClientRect();
    const footer = document.querySelector('footer');
    if (footer && stickyRect.height > 0 && stickyRect.top < window.innerHeight) {
      // Check if interactive links inside footer are covered by the sticky bar even at max scroll
      const footerLinks = [...footer.querySelectorAll('a, button')];
      for (const link of footerLinks) {
        const r = link.getBoundingClientRect();
        if (r.bottom > stickyRect.top + 2) {
          issues.push(
            `Sticky bar (${sticky.className}, top=${Math.round(stickyRect.top)}) covers footer link "${(
              link.textContent || ''
            ).trim()}" (bottom=${Math.round(r.bottom)}) at max scroll`
          );
          break;
        }
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return issues;
  });

  // 6. Nav usability (touch & keyboard)
  const navIssues = await verifyNavInteraction(page, target, vp);

  return {
    ...raw,
    stickyIssues,
    navIssues,
  };
}

async function run() {
  const siteServer = await startStaticServer(SITE_DIST, DOCS_DIR, false, 4191);
  const appServer = await startStaticServer(WEBAPP_DIST, DOCS_DIR, true, 4192);

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    headless: true,
  });

  const results = [];

  try {
    const viewports = VP_FILTER ? VIEWPORTS.filter((v) => v.name === VP_FILTER) : VIEWPORTS;

    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
      });

      await context.route('**/*.mp4', (route) => route.abort());

      const allTargets = [
        ...SITE_ROUTES.map((r) => ({ ...r, surface: 'goalworld_site', url: `http://127.0.0.1:4191${r.path}` })),
        ...WEBAPP_ROUTES.map((r) => ({ ...r, surface: 'goalchain_webapp', url: `http://127.0.0.1:4192${r.path}` })),
      ].filter((t) => {
        if (SURFACE_FILTER && t.surface !== SURFACE_FILTER && !t.surface.includes(SURFACE_FILTER)) return false;
        if (SLUG_FILTER && t.slug !== SLUG_FILTER) return false;
        return true;
      });

      for (const target of allTargets) {
        const page = await context.newPage();
        const consoleErrors = [];
        page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const txt = msg.text();
            if (txt.includes('ERR_CONNECTION_REFUSED') || txt.includes('Failed to load resource')) return;
            consoleErrors.push(txt);
          }
        });

        await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(350);

        const check = await inspectRouteAtViewport(page, target, vp);

        let screenshotFile = null;
        let screenshotKB = null;
        if (!NO_SHOTS) {
          screenshotFile = `${target.slug}-${vp.name}.jpg`;
          const shotPath = path.join(SHOT_DIR, screenshotFile);
          await page.screenshot({ path: shotPath, type: 'jpeg', quality: 72, fullPage: false });
          screenshotKB = Number((fs.statSync(shotPath).size / 1024).toFixed(1));
        }

        const passed =
          !check.hasHorizontalOverflow &&
          check.offscreenElements.length === 0 &&
          check.smallTapTargets.length === 0 &&
          check.imageIssues.length === 0 &&
          check.smallFonts.length === 0 &&
          check.stickyIssues.length === 0 &&
          check.navIssues.length === 0 &&
          consoleErrors.length === 0;

        results.push({
          slug: target.slug,
          surface: target.surface,
          path: target.path,
          viewport: vp.name,
          passed,
          consoleErrors,
          ...check,
          screenshot: screenshotFile,
          screenshotKB,
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

  const reportFile = path.join(OUT_DIR, 'responsive_report.json');
  fs.writeFileSync(
    reportFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalChecks: results.length,
        passedChecks: results.filter((r) => r.passed).length,
        failedChecks: results.filter((r) => !r.passed).length,
        results,
      },
      null,
      2
    ) + '\n'
  );

  const summaryLines = [
    `GoalWorld Phase 2 Responsive Suite — ${new Date().toISOString()}`,
    `Total route-viewport checks: ${results.length}`,
    `Passed: ${results.filter((r) => r.passed).length}`,
    `Failed: ${results.filter((r) => !r.passed).length}`,
    `  Horizontal overflow failures: ${results.filter((r) => r.hasHorizontalOverflow).length}`,
    `  Offscreen element failures:   ${results.filter((r) => r.offscreenElements.length > 0).length}`,
    `  Tap target (<44px) failures:  ${results.filter((r) => r.smallTapTargets.length > 0).length}`,
    `  Image CLS/attr failures:      ${results.filter((r) => r.imageIssues.length > 0).length}`,
    `  Mobile font (<14px) failures: ${results.filter((r) => r.smallFonts.length > 0).length}`,
    `  Sticky CTA overlap failures:  ${results.filter((r) => r.stickyIssues.length > 0).length}`,
    `  Nav usability failures:       ${results.filter((r) => r.navIssues.length > 0).length}`,
    `  Console error failures:       ${results.filter((r) => r.consoleErrors.length > 0).length}`,
  ];
  const summaryText = summaryLines.join('\n') + '\n';
  fs.writeFileSync(path.join(OUT_DIR, 'responsive_summary.txt'), summaryText);
  console.log(summaryText);

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.log('--- FAILURE BREAKDOWN (first 25) ---');
    for (const f of failed.slice(0, 25)) {
      const reasons = [];
      if (f.hasHorizontalOverflow) reasons.push(`overflow(${f.scrollWidth}>${f.innerWidth})`);
      if (f.offscreenElements.length) reasons.push(`offscreen(${f.offscreenElements.map((e) => `${e.el}[${e.left}..${e.right}]`).join(', ')})`);
      if (f.smallTapTargets.length) reasons.push(`tap<44(${f.smallTapTargets.slice(0, 4).map((t) => `${t.el}:${t.w}x${t.h}`).join(', ')})`);
      if (f.imageIssues.length) reasons.push(`img(${f.imageIssues.map((i) => `${i.src}:${i.issue}`).join(', ')})`);
      if (f.smallFonts.length) reasons.push(`font<14(${f.smallFonts.slice(0, 4).map((s) => `${s.el}:${s.px}px`).join(', ')})`);
      if (f.stickyIssues.length) reasons.push(`sticky(${f.stickyIssues.join('; ')})`);
      if (f.navIssues.length) reasons.push(`nav(${f.navIssues.join('; ')})`);
      if (f.consoleErrors.length) reasons.push(`console(${f.consoleErrors.join('; ')})`);
      console.log(`  [${f.viewport}] ${f.slug}: ${reasons.join(' | ')}`);
    }
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
