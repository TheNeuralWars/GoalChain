#!/usr/bin/env node
/**
 * GoalWorld site build — zero dependencies.
 *
 * Assembles src/layout.html + src/pages/*.html into dist/:
 *   - dist/<slug>.html            canonical page (plus dist/index.html, dist/404.html)
 *   - dist/<slug>/index.html      extensionless mirror so /about and /about/ resolve
 *                                 on plain static file servers (Caddy) as well as Vercel
 *   - dist/sitemap.xml            stamped with the build date
 *   - dist/robots.txt, dist/site.webmanifest, dist/assets/** (copied as-is)
 *   - dist/press/press-kit.zip    best-effort (python3 zipfile), skip if unavailable
 *   - JSON-LD (schema.org) per page: WebPage everywhere, Organization + WebSite on
 *     the home page, FAQPage on /faq generated from the visible <details> Q&As
 *     (validated at build time — the build fails if the schema would drift)
 *
 * Page files start with a meta comment:
 *   <!-- meta {"slug":"about","title":"…","description":"…","nav":"ABOUT","preload":"…"} -->
 *
 * Run: node goalworld_site/build.mjs
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "src");
const DIST = join(HERE, "dist");
const ORIGIN = "https://goalworld.fun";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const NAV_KEYS = ["ABOUT", "ROADMAP", "FAQ", "PRESS"];

function parsePage(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^<!-- meta (\{.*?\}) -->\n?/s);
  if (!m) throw new Error(`missing meta header: ${file}`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length).trimEnd();
  return { meta, body };
}

function fill(tpl, vars) {
  return tpl.replace(/\{\{([A-Z_]+)\}\}/g, (all, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : all
  );
}

// ---- JSON-LD structured data (schema.org) ----
// Generated from the same page source as the visible HTML so the markup can never
// drift from what visitors read (search engines require FAQ answers to be visible).

const SITE_ID = `${ORIGIN}/#website`;
const ORG_ID = `${ORIGIN}/#organization`;

const ENTITY_MAP = {
  amp: "&", lt: "<", gt: ">", quot: '"', nbsp: "\u00a0",
  mdash: "\u2014", ndash: "\u2013", hellip: "\u2026",
  rarr: "\u2192", larr: "\u2190", middot: "\u00b7", copy: "\u00a9",
  ldquo: "\u201c", rdquo: "\u201d", lsquo: "\u2018", rsquo: "\u2019",
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (all, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (all, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (all, name) => ENTITY_MAP[name] ?? all);
}

function plainText(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function extractFaqs(body) {
  const faqs = [];
  const re = /<details[^>]*class="faq-item"[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;
  let m;
  while ((m = re.exec(body))) {
    const q = plainText(m[1]);
    const a = plainText(m[2]);
    if (q && a) faqs.push({ q, a });
  }
  return faqs;
}

function buildJsonLd(slug, canonical, meta, body) {
  if (slug === "404") return "";
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: "en",
      isPartOf: { "@id": SITE_ID },
    },
  ];
  if (slug === "index") {
    graph.push({
      "@type": "WebSite",
      "@id": SITE_ID,
      url: `${ORIGIN}/`,
      name: "GoalWorld",
      description: meta.description,
      inLanguage: "en",
      publisher: { "@id": ORG_ID },
    });
    graph.push({
      "@type": "Organization",
      "@id": ORG_ID,
      name: "GoalWorld",
      url: `${ORIGIN}/`,
      logo: { "@type": "ImageObject", url: `${ORIGIN}/assets/img/icon-512.png` },
      sameAs: ["https://x.com/nicopez", "https://github.com/TheNeuralWars/GoalChain"],
    });
  }
  if (slug === "faq") {
    const faqs = extractFaqs(body);
    if (!faqs.length) throw new Error("faq page: no faq-item blocks found for FAQPage schema");
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonical}#faqpage`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  // Escape "<" so the payload can never terminate the <script> block early.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function build() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  const layout = readFileSync(join(SRC, "layout.html"), "utf8");
  const pageFiles = readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html"));
  const pages = pageFiles.map((f) => parsePage(join(SRC, "pages", f)));

  const sitemap = [];
  for (const { meta, body } of pages) {
    const slug = meta.slug;
    const isHome = slug === "index";
    const canonical = isHome ? `${ORIGIN}/` : `${ORIGIN}/${slug}.html`;
    const nav = Object.fromEntries(NAV_KEYS.map((k) => [`NAV_${k}`, meta.nav === k ? ' aria-current="page"' : ""]));
    const jsonLd = buildJsonLd(slug, canonical, meta, body);
    const html = fill(layout, {
      TITLE: meta.title,
      DESC: meta.description,
      CANONICAL: canonical,
      PRELOAD: meta.preload || "",
      JSONLD: jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : "",
      BODY: body,
      ...nav,
    });

    const outFile = join(DIST, `${slug}.html`);
    writeFileSync(outFile, html);
    if (!isHome && slug !== "404") {
      mkdirSync(join(DIST, slug), { recursive: true });
      writeFileSync(join(DIST, slug, "index.html"), html);
    }
    if (slug !== "404") sitemap.push({ loc: canonical, priority: isHome ? "1.0" : "0.7" });
    console.log(`  page  ${slug}.html${!isHome && slug !== "404" ? ` + ${slug}/` : ""}  (${(html.length / 1024).toFixed(1)} KB)`);
  }

  // static files
  copyFileSync(join(SRC, "robots.txt"), join(DIST, "robots.txt"));
  copyFileSync(join(SRC, "site.webmanifest"), join(DIST, "site.webmanifest"));
  cpSync(join(SRC, "assets"), join(DIST, "assets"), { recursive: true });

  // sitemap
  const urls = sitemap
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join("\n");
  writeFileSync(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  console.log(`  sitemap.xml  (${sitemap.length} urls, lastmod ${BUILD_DATE})`);

  // best-effort press zip (not required for the site to work)
  try {
    const pressDir = join(DIST, "assets/img/press");
    execFileSync("python3", [join(HERE, "tools/make_press_zip.py"), pressDir], { stdio: "pipe" });
    const zSize = statSync(join(pressDir, "press-kit.zip")).size;
    console.log(`  press-kit.zip  (${(zSize / 1024).toFixed(0)} KB)`);
  } catch {
    console.log("  press-kit.zip  SKIPPED (python3 unavailable) — individual files still served");
  }

  // sanity: no unresolved placeholders
  for (const f of readdirSync(DIST)) {
    if (!f.endsWith(".html")) continue;
    const html = readFileSync(join(DIST, f), "utf8");
    const left = html.match(/\{\{[A-Z_]+\}\}/g);
    if (left) throw new Error(`unresolved placeholders in ${f}: ${left.join(", ")}`);
    if (!/<title>[^<]{10,}<\/title>/.test(html)) throw new Error(`missing/short title: ${f}`);
    if (!/rel="canonical"/.test(html)) throw new Error(`missing canonical: ${f}`);
    if (!/og:image/.test(html)) throw new Error(`missing og:image: ${f}`);
    if (!/<meta name="description"/.test(html)) throw new Error(`missing description: ${f}`);

    // JSON-LD sanity: parse back what actually landed in the page
    const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (f === "404.html") {
      if (ldBlocks.length) throw new Error(`404.html should carry no JSON-LD`);
      continue;
    }
    if (!ldBlocks.length) throw new Error(`missing JSON-LD: ${f}`);
    const graph = ldBlocks.flatMap((b) => {
      const parsed = JSON.parse(b[1]);
      return Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
    });
    const canonicalHref = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1];
    const webPage = graph.find((n) => n["@type"] === "WebPage");
    if (!webPage || webPage.url !== canonicalHref) {
      throw new Error(`WebPage url != canonical in ${f}: ${webPage && webPage.url} vs ${canonicalHref}`);
    }
    if (f === "index.html") {
      for (const t of ["Organization", "WebSite"]) {
        if (!graph.some((n) => n["@type"] === t)) throw new Error(`index.html missing ${t} node`);
      }
    }
    if (f === "faq.html") {
      const faqPage = graph.find((n) => n["@type"] === "FAQPage");
      const itemCount = (html.match(/class="faq-item"/g) || []).length;
      if (!faqPage || !Array.isArray(faqPage.mainEntity) || faqPage.mainEntity.length !== itemCount) {
        throw new Error(`FAQPage mainEntity (${faqPage && faqPage.mainEntity && faqPage.mainEntity.length}) != visible faq-item count (${itemCount})`);
      }
    }
  }
  console.log(`  sanity OK — ${pageFiles.length} pages built into ${DIST}`);
}

build();
