import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('/tmp/audit-tools/package.json');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const OUT_DIR = path.join(ROOT, '_work/site-overhaul-20261109/evidence/audit');
const SHOT_DIR = path.join(OUT_DIR, 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, isMobile: true },
  { name: '820x1180', width: 820, height: 1180, isMobile: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
];

const TARGETS = [
  { slug: 'gw-home', url: 'https://goalworld.fun/', takeShot: true },
  { slug: 'gw-book', url: 'https://goalworld.fun/book.html', takeShot: true },
  { slug: 'gw-cinema', url: 'https://goalworld.fun/cinema.html', takeShot: true },
  { slug: 'gw-studio', url: 'https://goalworld.fun/studio.html', takeShot: true },
  { slug: 'gw-collect', url: 'https://goalworld.fun/collect.html', takeShot: false },
  { slug: 'gw-live', url: 'https://goalworld.fun/live.html', takeShot: true },
  { slug: 'gw-roadmap', url: 'https://goalworld.fun/roadmap.html', takeShot: false },
  { slug: 'gw-about', url: 'https://goalworld.fun/about.html', takeShot: false },
  { slug: 'gw-faq', url: 'https://goalworld.fun/faq.html', takeShot: false },
  { slug: 'gw-press', url: 'https://goalworld.fun/press.html', takeShot: false },
  { slug: 'sub-blast-radius', url: 'https://goalworld.fun/blast-radius/', takeShot: true },
  { slug: 'sub-hermes-demo', url: 'https://goalworld.fun/hermes-demo/', takeShot: true },
  { slug: 'sub-go-reader', url: 'https://goalworld.fun/go/reader/', takeShot: true },
  { slug: 'legacy-goalworld', url: 'https://goalworld.fun/goalworld.html', takeShot: true },
  { slug: 'play-home', url: 'https://play.goalworld.fun/', takeShot: true },
  { slug: 'play-dashboard', url: 'https://play.goalworld.fun/dashboard', takeShot: true },
  { slug: 'play-estadio', url: 'https://play.goalworld.fun/estadio', takeShot: true },
  { slug: 'play-club', url: 'https://play.goalworld.fun/club', takeShot: false },
  { slug: 'play-goalworld', url: 'https://play.goalworld.fun/goalworld', takeShot: true },
  { slug: 'play-reader', url: 'https://play.goalworld.fun/reader', takeShot: true },
];

async function launchBrowser() {
  return chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--js-flags=--max-old-space-size=512',
    ],
    headless: true,
  });
}

async function auditOne(vp, target) {
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'GoalWorldSiteOverhaulPlaywrightAudit/1.0',
    });

    // Prevent multi-MB video streams from exhausting headless Chrome memory
    await context.route('**/*.mp4', (route) => route.abort());

    const page = await context.newPage();
    const consoleErrors = [];
    const consoleWarnings = [];
    const pageErrors = [];
    const failedRequests = [];
    const badResponses = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
      if (msg.type() === 'warning') consoleWarnings.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(String(err));
    });
    page.on('requestfailed', (req) => {
      if (req.url().endsWith('.mp4')) return;
      failedRequests.push({
        url: req.url(),
        failure: req.failure()?.errorText || 'unknown',
      });
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        badResponses.push({ url: res.url(), status: res.status() });
      }
    });

    let status = null;
    let navError = null;
    try {
      const resp = await page.goto(target.url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      status = resp ? resp.status() : null;
      await page.waitForTimeout(800);
    } catch (e) {
      navError = String(e);
    }

    let metrics = null;
    try {
      metrics = await page.evaluate((vpWidth) => {
        const docEl = document.documentElement;
        const scrollWidth = docEl.scrollWidth;
        const clientWidth = docEl.clientWidth;
        const innerWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > innerWidth + 1;

        const overflowingElements = [];
        if (hasHorizontalOverflow) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > innerWidth + 2 || rect.left < -2) {
              const tag = el.tagName.toLowerCase();
              const id = el.id ? `#${el.id}` : '';
              const cls =
                el.className && typeof el.className === 'string'
                  ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
                  : '';
              overflowingElements.push({
                selector: `${tag}${id}${cls}`,
                right: Math.round(rect.right),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
              });
              if (overflowingElements.length >= 8) break;
            }
          }
        }

        const brokenImages = [];
        for (const img of document.querySelectorAll('img')) {
          const src = img.getAttribute('src') || '';
          if (img.complete && img.naturalWidth === 0 && src) {
            brokenImages.push(src);
          }
        }

        const smallTapTargets = [];
        if (vpWidth <= 480) {
          for (const el of document.querySelectorAll('a, button, input, select, [role="button"]')) {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            if (
              rect.width > 0 &&
              rect.height > 0 &&
              style.visibility !== 'hidden' &&
              style.display !== 'none' &&
              (rect.height < 36 || rect.width < 36)
            ) {
              smallTapTargets.push({
                tag: el.tagName.toLowerCase(),
                text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
                w: Math.round(rect.width),
                h: Math.round(rect.height),
              });
              if (smallTapTargets.length >= 10) break;
            }
          }
        }

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => ({
          level: h.tagName.toLowerCase(),
          text: (h.textContent || '').trim().slice(0, 60),
        }));

        const landmarks = {
          header: document.querySelectorAll('header').length,
          nav: document.querySelectorAll('nav').length,
          main: document.querySelectorAll('main').length,
          footer: document.querySelectorAll('footer').length,
        };

        const computedBody = window.getComputedStyle(document.body);

        return {
          title: document.title,
          scrollWidth,
          clientWidth,
          innerWidth,
          hasHorizontalOverflow,
          overflowingElements,
          brokenImages,
          smallTapTargets,
          headingsCount: headings.length,
          h1Count: headings.filter((h) => h.level === 'h1').length,
          firstThreeHeadings: headings.slice(0, 3),
          landmarks,
          bodyBg: computedBody.backgroundColor,
          bodyFont: computedBody.fontFamily,
        };
      }, vp.width);
    } catch (e) {
      metrics = { evalError: String(e) };
    }

    let screenshotPath = null;
    let screenshotBytes = 0;
    if (target.takeShot && !navError) {
      const relShot = `screenshots/${target.slug}-${vp.name}.jpg`;
      const absShot = path.join(OUT_DIR, relShot);
      await page.screenshot({
        path: absShot,
        type: 'jpeg',
        quality: 75,
        fullPage: false,
      });
      screenshotBytes = fs.statSync(absShot).size;
      screenshotPath = `_work/site-overhaul-20261109/evidence/audit/${relShot}`;
    }

    console.log(
      `[${vp.name}] ${target.slug} -> status=${status} overflow=${metrics?.hasHorizontalOverflow} errs=${consoleErrors.length} shot=${screenshotBytes}B`
    );

    return {
      slug: target.slug,
      url: target.url,
      viewport: vp.name,
      status,
      navError,
      consoleErrors,
      consoleWarnings: consoleWarnings.slice(0, 5),
      pageErrors,
      failedRequests,
      badResponses,
      metrics,
      screenshotPath,
      screenshotBytes,
    };
  } finally {
    await browser.close().catch(() => {});
  }
}

async function run() {
  const results = [];
  const reportPath = path.join(OUT_DIR, 'playwright_audit.json');

  for (const vp of VIEWPORTS) {
    for (const target of TARGETS) {
      try {
        const res = await auditOne(vp, target);
        results.push(res);
      } catch (e) {
        console.error(`[${vp.name}] ${target.slug} ERROR:`, e.message);
        results.push({
          slug: target.slug,
          url: target.url,
          viewport: vp.name,
          status: null,
          navError: String(e),
        });
      }
      fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
    }
  }
  console.log(`Saved Playwright audit report (${results.length} records) to ${reportPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
