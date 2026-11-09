import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const LH_DIR = path.join(ROOT, '_work/site-overhaul-20261109/evidence/audit/lighthouse');
fs.mkdirSync(LH_DIR, { recursive: true });

const SURFACES = [
  { slug: 'home', url: 'https://goalworld.fun/' },
  { slug: 'book', url: 'https://goalworld.fun/book.html' },
  { slug: 'cinema', url: 'https://goalworld.fun/cinema.html' },
  { slug: 'studio', url: 'https://goalworld.fun/studio.html' },
  { slug: 'play-home', url: 'https://play.goalworld.fun/' },
];

const MODES = ['mobile', 'desktop'];

const summaryIndex = [];

for (const surface of SURFACES) {
  for (const mode of MODES) {
    const rawTmp = `/tmp/lh-${surface.slug}-${mode}.json`;
    const args = [
      '/tmp/audit-tools/node_modules/.bin/lighthouse',
      surface.url,
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json',
      `--output-path=${rawTmp}`,
      '--quiet',
    ];
    if (mode === 'desktop') {
      args.push('--preset=desktop');
    }

    console.log(`Running Lighthouse [${mode}] on ${surface.slug} (${surface.url})...`);
    try {
      execFileSync('node', args, {
        env: { ...process.env, CHROME_PATH: '/usr/bin/google-chrome' },
        stdio: 'inherit',
        timeout: 90000,
      });

      const lhr = JSON.parse(fs.readFileSync(rawTmp, 'utf8'));
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

      // Top 5 opportunities / failing audits across categories
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
        .slice(0, 8)
        .map((a) => ({
          id: a.id,
          title: a.title,
          score: Math.round((a.score ?? 0) * 100),
          displayValue: a.displayValue || null,
          savingsMs: a.details?.overallSavingsMs || null,
          savingsBytes: a.details?.overallSavingsBytes || null,
        }));

      const summary = {
        surface: surface.slug,
        url: surface.url,
        mode,
        fetchTime: lhr.fetchTime,
        scores,
        coreVitals,
        topOpportunities: failingAudits.slice(0, 5),
        additionalDiagnostics: failingAudits.slice(5, 8),
      };

      const outFile = path.join(LH_DIR, `${surface.slug}-${mode}.json`);
      fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
      summaryIndex.push(summary);
      try {
        fs.unlinkSync(rawTmp);
      } catch {}
      console.log(
        `  -> ${surface.slug} [${mode}]: Perf=${scores.performance} A11y=${scores.accessibility} BP=${scores.bestPractices} SEO=${scores.seo}`
      );
    } catch (e) {
      console.error(`Failed Lighthouse for ${surface.slug} [${mode}]:`, e.message);
    }
  }
}

fs.writeFileSync(
  path.join(LH_DIR, 'summary.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), runs: summaryIndex }, null, 2)
);
console.log('Saved Lighthouse summary.json');
