#!/usr/bin/env node
/**
 * GoalWorld site build — zero dependencies.
 *
 * Assembles src/layout.html + src/partials/*.html + src/pages/*.html into dist/:
 *   - Verifies design token synchronization via `design/sync-tokens.mjs --check`
 *   - Expands component library macros (`<!-- @component <type> <json> -->`)
 *   - Emits dist/<slug>.html + dist/<slug>/index.html extensionless mirrors
 *   - Generates JSON-LD (schema.org) per page: WebPage everywhere, Organization +
 *     WebSite on index, FAQPage on /faq validated against visible <details class="faq-item">
 *   - Runs build-time banned-claims contract across all output files
 *
 * Run: node goalworld_site/build.mjs
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const SRC = join(HERE, "src");
const PARTIALS = join(SRC, "partials");
const DIST = join(HERE, "dist");
const ORIGIN = "https://goalworld.fun";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const NAV_KEYS = ["BOOK", "CINEMA", "STUDIO", "LIVE", "ROADMAP", "ABOUT", "FAQ", "PRESS", "COLLECT"];
const ACTIVE_LOCALES = ["en"]; // Phase 4 expands to ["en", "es", "it"]

const CHROME_I18N = {
  en: {
    I18N_SKIP: "Skip to content",
    I18N_MENU: "Menu",
    I18N_MAIN_NAV: "Main",
    I18N_NAV_BOOK: "Book",
    I18N_NAV_CINEMA: "Cinema",
    I18N_NAV_STUDIO: "Studio",
    I18N_NAV_LIVE: "Live",
    I18N_NAV_ROADMAP: "Roadmap",
    I18N_NAV_CTA: "Read free",
    I18N_STICKY_READ: "Read Book 1 free",
    I18N_STICKY_PLAY: "Play",
    I18N_FOOTER_BLURB:
      "An independent story studio. Books first, then the screen. Home of The Neural Wars &mdash; built in the open by Nico Pez and an AI crew.",
    I18N_FOOTER_EXPLORE: "Explore",
    I18N_FOOTER_CINEMA: "AI Cinema",
    I18N_FOOTER_STUDIO: "Studio &amp; authors",
    I18N_FOOTER_COLLECT: "Collectors &amp; creators",
    I18N_FOOTER_ABOUT: "About &amp; Lore",
    I18N_FOOTER_COMMUNITY: "Community &amp; Legal",
    I18N_FOOTER_PRESS: "Press kit",
    I18N_FOOTER_PRIVACY: "Privacy",
    I18N_FOOTER_TERMS: "Terms",
    I18N_LANG_LABEL: "Language",
  },
  es: {
    I18N_SKIP: "Saltar al contenido",
    I18N_MENU: "Menú",
    I18N_MAIN_NAV: "Principal",
    I18N_NAV_BOOK: "Libro",
    I18N_NAV_CINEMA: "Cine IA",
    I18N_NAV_STUDIO: "Estudio",
    I18N_NAV_LIVE: "En vivo",
    I18N_NAV_ROADMAP: "Hoja de ruta",
    I18N_NAV_CTA: "Leer gratis",
    I18N_STICKY_READ: "Leer Libro 1 gratis",
    I18N_STICKY_PLAY: "Jugar",
    I18N_FOOTER_BLURB:
      "Un estudio narrativo independiente. Primero los libros, luego la pantalla. Hogar de The Neural Wars &mdash; creado en abierto por Nico Pez y un equipo de agentes IA.",
    I18N_FOOTER_EXPLORE: "Explorar",
    I18N_FOOTER_CINEMA: "Cine IA",
    I18N_FOOTER_STUDIO: "Estudio y autores",
    I18N_FOOTER_COLLECT: "Coleccionistas y creadores",
    I18N_FOOTER_ABOUT: "Lore y universo",
    I18N_FOOTER_COMMUNITY: "Comunidad y legal",
    I18N_FOOTER_PRESS: "Kit de prensa",
    I18N_FOOTER_PRIVACY: "Privacidad",
    I18N_FOOTER_TERMS: "Términos",
    I18N_LANG_LABEL: "Idioma",
  },
  it: {
    I18N_SKIP: "Vai al contenuto",
    I18N_MENU: "Menu",
    I18N_MAIN_NAV: "Principale",
    I18N_NAV_BOOK: "Libro",
    I18N_NAV_CINEMA: "Cinema IA",
    I18N_NAV_STUDIO: "Studio",
    I18N_NAV_LIVE: "Live",
    I18N_NAV_ROADMAP: "Roadmap",
    I18N_NAV_CTA: "Leggi gratis",
    I18N_STICKY_READ: "Leggi Libro 1 gratis",
    I18N_STICKY_PLAY: "Gioca",
    I18N_FOOTER_BLURB:
      "Uno studio narrativo indipendente. Prima i libri, poi lo schermo. Casa di The Neural Wars &mdash; costruito in pubblico da Nico Pez e una crew di agenti IA.",
    I18N_FOOTER_EXPLORE: "Esplora",
    I18N_FOOTER_CINEMA: "Cinema IA",
    I18N_FOOTER_STUDIO: "Studio e autori",
    I18N_FOOTER_COLLECT: "Collezionisti e autori",
    I18N_FOOTER_ABOUT: "Lore e universo",
    I18N_FOOTER_COMMUNITY: "Community e note legali",
    I18N_FOOTER_PRESS: "Press kit",
    I18N_FOOTER_PRIVACY: "Privacy",
    I18N_FOOTER_TERMS: "Termini",
    I18N_LANG_LABEL: "Lingua",
  },
};

function escAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parsePage(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^<!-- meta (\{.*?\}) -->\n?/s);
  if (!m) throw new Error(`missing meta header: ${file}`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length).trimEnd();
  return { meta, body };
}

function fill(tpl, vars) {
  return tpl.replace(/\{\{([A-Z0-9_]+)\}\}/g, (all, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : all
  );
}

// ============================================================================
// Component Library Macros (`<!-- @component <type> <jsonProps> -->`)
// Documented in goalworld_site/COMPONENTS.md
// ============================================================================

function renderStatusPill(props) {
  const state = props.state || "live";
  const label = props.label || state;
  return `<span class="status-pill status-pill--${escAttr(state)}"><span class="status-dot" aria-hidden="true"></span>${label}</span>`;
}

function renderCtaButton(item) {
  const v = item.variant || "primary";
  const cls = v === "link" ? "btn-link" : `btn btn-${escAttr(v)}`;
  const badge = item.badge ? ` <span class="tag-mono">${item.badge}</span>` : "";
  const rel = item.external ? ' rel="noopener"' : "";
  return `<a class="${cls}" href="${escAttr(item.href)}"${rel}>${item.label}${badge}</a>`;
}

function renderCtaSet(props) {
  const items = Array.isArray(props.items) ? props.items : [];
  if (!items.length) return "";
  const classes = ["btn-row"];
  if (props.align === "center") classes.push("btn-row--center");
  if (props.rise) classes.push("rise-2");
  if (props.className) classes.push(props.className);
  const style = props.style ? ` style="${escAttr(props.style)}"` : "";
  return `<div class="${classes.join(" ")}"${style}>${items.map(renderCtaButton).join("")}</div>`;
}

function renderHero(props) {
  const variant = props.variant || "banner";
  const cls = ["hero"];
  if (variant === "studio") cls.push("hero-studio");
  if (variant === "compact") cls.push("hero-compact");
  if (props.className) cls.push(props.className);
  const style = props.style ? ` style="${escAttr(props.style)}"` : "";

  const bgHtml = props.bgImg
    ? `<div class="hero-bg" aria-hidden="true"><img src="${escAttr(props.bgImg)}" alt="" width="${escAttr(props.bgWidth || 1600)}" height="${escAttr(props.bgHeight || 900)}" fetchpriority="high"${props.bgSrcset ? ` srcset="${escAttr(props.bgSrcset)}"` : ""}${props.bgSizes ? ` sizes="${escAttr(props.bgSizes)}"` : ""} /></div>`
    : "";

  const eyebrowHtml = props.eyebrow
    ? `<p class="${props.kicker ? "kicker" : "eyebrow"} ${variant === "studio" ? "rise" : ""}">${props.eyebrow}</p>`
    : "";

  const titleCls = variant === "studio" ? ' class="rise"' : "";
  const leadCls = variant === "studio" ? ' class="lead rise-2"' : ' class="lead"';
  const leadHtml = props.lead ? `<p${leadCls}>${props.lead}</p>` : "";
  const bodyHtml = props.body ? props.body : "";

  const ctasHtml = props.ctas
    ? renderCtaSet({ items: props.ctas, rise: variant === "studio", align: props.align })
    : "";

  let notifyHtml = "";
  if (props.notify) {
    const n = props.notify;
    const secondaryLink = n.secondaryHref
      ? ` &middot; <a href="${escAttr(n.secondaryHref)}">${n.secondaryLabel}</a>`
      : "";
    notifyHtml = `<p class="notify-pill rise-2"><strong>${n.prefix || "Update:"}</strong> ${n.text} <a href="${escAttr(n.href)}">${n.linkLabel}</a>${secondaryLink}</p>`;
  }

  const noteHtml = props.note ? `<p class="hero-note">${props.note}</p>` : "";

  return `<section class="${cls.join(" ")}"${style}>${bgHtml}<div class="wrap">${eyebrowHtml}<h1${titleCls}>${props.title}</h1>${leadHtml}${bodyHtml}${ctasHtml}${notifyHtml}${noteHtml}</div></section>`;
}

function renderSectionHeader(props) {
  if (props.srOnly) {
    return `<h2 class="sr-only">${props.title}</h2>`;
  }
  const alignCenter = props.align === "center";
  const wrapStyle = alignCenter ? ' style="text-align:center"' : "";
  const kickerStyle = alignCenter ? ' style="justify-content:center"' : "";
  const leadStyle = alignCenter ? ' style="margin-inline:auto"' : "";
  const kickerHtml = props.kicker
    ? `<p class="${props.eyebrow ? "eyebrow" : "kicker"}"${kickerStyle}>${props.kicker}</p>`
    : "";
  const leadHtml = props.lead ? `<p class="lead"${leadStyle}>${props.lead}</p>` : "";
  return `<header class="section-head"${wrapStyle}>${kickerHtml}<h2>${props.title}</h2>${leadHtml}</header>`;
}

function renderCard(props) {
  const isLink = Boolean(props.href);
  const tag = isLink ? "a" : props.tag || "div";
  const classes = ["card"];
  if (props.pillar) classes.push("pillar");
  if (props.variant === "code") classes.push("code");
  if (props.variant === "purple") classes.push("card-glow-purple");
  if (props.variant === "cyan") classes.push("card-glow-cyan");
  if (props.span === 2) classes.push("span-2");
  if (props.reveal !== false) classes.push("reveal");
  if (props.className) classes.push(props.className);

  const hrefAttr = isLink ? ` href="${escAttr(props.href)}"` : "";
  const styleAttr = props.style ? ` style="${escAttr(props.style)}"` : "";

  let imgHtml = "";
  if (props.img) {
    const im = props.img;
    const imStyle = im.style ? ` style="${escAttr(im.style)}"` : "";
    imgHtml = `<div class="card-img"><img src="${escAttr(im.src)}" alt="${escAttr(im.alt || "")}" width="${escAttr(im.width || 1200)}" height="${escAttr(im.height || 750)}" loading="${escAttr(im.loading || "lazy")}"${im.srcset ? ` srcset="${escAttr(im.srcset)}"` : ""}${im.sizes ? ` sizes="${escAttr(im.sizes)}"` : ""}${imStyle} /></div>`;
  }

  const labelHtml = props.label ? `<span class="label">${props.label}</span>` : "";
  const badgeHtml = props.badge
    ? `<span class="video-tag"${props.badgeColor ? ` style="color:${escAttr(props.badgeColor)}"` : ""}>${props.badge}</span>`
    : "";
  const pillHtml = props.statusPill ? renderStatusPill(props.statusPill) : "";
  const headingTag = props.headingTag || "h3";
  const titleHtml = props.title ? `<${headingTag}>${props.title}</${headingTag}>` : "";
  const bodyHtml = props.body ? `<p>${props.body}</p>` : "";
  const listHtml = Array.isArray(props.list)
    ? `<ul class="roadmap-list">${props.list.map((li) => `<li>${li}</li>`).join("")}</ul>`
    : "";

  let ctaHtml = "";
  if (props.cta) {
    ctaHtml = isLink
      ? `<span class="go">${props.cta}</span>`
      : props.ctaHref
        ? `<a class="go" href="${escAttr(props.ctaHref)}">${props.cta}</a>`
        : `<span class="go">${props.cta}</span>`;
  }

  return `<${tag} class="${classes.join(" ")}"${hrefAttr}${styleAttr}>${imgHtml}${labelHtml}${badgeHtml}${pillHtml}${titleHtml}${bodyHtml}${listHtml}${ctaHtml}</${tag}>`;
}

function renderMediaCard(props) {
  const kind = props.kind || "video";
  const aiTag = props.aiTag || "AI-generated &middot; Film draft";
  const title = props.title || "";
  const caption = props.caption ? ` ${props.caption}` : "";
  const cls = ["video-card"];
  if (props.reveal) cls.push("reveal");
  if (props.className) cls.push(props.className);

  if (kind === "image") {
    const style = props.imgStyle ? ` style="${escAttr(props.imgStyle)}"` : "";
    return `<figure class="${cls.join(" ")}" style="margin:0"><img src="${escAttr(props.src)}" alt="${escAttr(props.alt || title)}" width="${escAttr(props.width || 1200)}" height="${escAttr(props.height || 750)}" loading="${escAttr(props.loading || "lazy")}"${props.srcset ? ` srcset="${escAttr(props.srcset)}"` : ""}${props.sizes ? ` sizes="${escAttr(props.sizes)}"` : ""}${style} /><figcaption><span class="video-tag">${aiTag}</span><strong>${title}</strong>${caption}</figcaption></figure>`;
  }

  const sources = Array.isArray(props.sources)
    ? props.sources
    : props.src
      ? [{ src: props.src, type: "video/mp4" }]
      : [];
  const sourceTags = sources
    .map((s) => `<source src="${escAttr(typeof s === "string" ? s : s.src)}" type="${escAttr((s && s.type) || "video/mp4")}" />`)
    .join("");

  return `<figure class="${cls.join(" ")}" style="margin:0"><video controls preload="none" poster="${escAttr(props.poster || "")}" width="${escAttr(props.width || 960)}" height="${escAttr(props.height || 540)}" aria-label="${escAttr(props.ariaLabel || props.alt || title)}">${sourceTags}Your browser does not support HTML video.</video><figcaption><span class="video-tag">${aiTag}</span><strong>${title}</strong>${caption}</figcaption></figure>`;
}

function renderTimeline(props) {
  const cols = props.columns || 3;
  const items = Array.isArray(props.items) ? props.items : [];
  if (props.numbered) {
    return `<div class="grid grid-${cols} steps" style="margin-top:1.5rem">${items
      .map(
        (it) => `<div class="step reveal"><h3>${it.title}</h3><p>${it.body}</p></div>`
      )
      .join("")}</div>`;
  }
  return `<div class="grid grid-${cols} timeline-grid" style="margin-top:1.75rem">${items
    .map((it) => renderCard(it))
    .join("")}</div>`;
}

function renderFaqAccordion(props) {
  const items = Array.isArray(props.items) ? props.items : [];
  const renderItem = (it) => {
    const idAttr = it.id ? ` id="${escAttr(it.id)}"` : "";
    const openAttr = it.open ? " open" : "";
    return `<details class="faq-item"${idAttr}${openAttr}><summary>${it.q}</summary><p>${it.a}</p></details>`;
  };
  if (!props.searchable) {
    return `<div class="accordion"${props.style ? ` style="${escAttr(props.style)}"` : ""}>${items.map(renderItem).join("\n")}</div>`;
  }
  const [first, ...rest] = items;
  const searchBar = `<div class="filter-bar faq-tools"><input type="search" class="faq-search" data-faq-search placeholder="${escAttr(props.searchPlaceholder || "Search questions…")}" aria-label="${escAttr(props.searchLabel || "Search FAQ")}" /><button class="chip" type="button" data-faq-all>${props.expandLabel || "Expand all"}</button></div><p class="small faint" data-faq-count aria-live="polite"></p>`;
  return `${first ? renderItem(first) : ""}\n${searchBar}\n${rest.map(renderItem).join("\n")}`;
}

function renderLangSwitcher(slug, locale = "en", variant = "header") {
  const langs = [
    { code: "en", label: "EN", title: "English" },
    { code: "es", label: "ES", title: "Español" },
    { code: "it", label: "IT", title: "Italiano" },
  ];
  const filePart = slug === "index" ? "" : `${slug}.html`;
  const pills = langs
    .map((l) => {
      const isCurrent = l.code === locale;
      const isAvailable = ACTIVE_LOCALES.includes(l.code);
      const href = l.code === "en" ? `/${filePart}` : `/${l.code}/${filePart}`;
      if (isCurrent) {
        return `<a class="lang-pill active" href="${href}" lang="${l.code}" aria-current="true" title="${l.title}">${l.label}</a>`;
      }
      if (isAvailable) {
        return `<a class="lang-pill" href="${href}" lang="${l.code}" hreflang="${l.code}" title="${l.title}">${l.label}</a>`;
      }
      return `<span class="lang-pill lang-pill--soon" lang="${l.code}" aria-disabled="true" title="${l.title} (coming soon)">${l.label}</span>`;
    })
    .join("");
  const label = (CHROME_I18N[locale] || CHROME_I18N.en).I18N_LANG_LABEL;
  return `<div class="lang-switch lang-switch--${variant}" role="group" aria-label="${escAttr(label)}" data-lang-switcher>${pills}</div>`;
}

const COMPONENT_RENDERERS = {
  "status-pill": renderStatusPill,
  "cta-set": renderCtaSet,
  hero: renderHero,
  "section-header": renderSectionHeader,
  card: renderCard,
  "media-card": renderMediaCard,
  timeline: renderTimeline,
  "faq-accordion": renderFaqAccordion,
};

function expandComponents(html, fileLabel) {
  return html.replace(/<!--\s*@component\s+([a-z0-9-]+)\s+([\s\S]*?)-->/g, (all, type, rawJson) => {
    const renderer = COMPONENT_RENDERERS[type];
    if (!renderer) {
      throw new Error(`unknown @component "${type}" in ${fileLabel}`);
    }
    let props;
    try {
      props = JSON.parse(rawJson.trim());
    } catch (err) {
      throw new Error(`invalid JSON in @component "${type}" (${fileLabel}): ${err.message}`);
    }
    return renderer(props);
  });
}

// ---- JSON-LD structured data (schema.org) ----
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

function buildJsonLd(slug, canonical, meta, body, locale = "en") {
  if (slug === "404") return "";
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: meta.title,
      description: meta.description,
      inLanguage: locale,
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
      inLanguage: locale,
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
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function buildHreflangs(slug) {
  if (slug === "404" || ACTIVE_LOCALES.length <= 1) return "";
  const filePart = slug === "index" ? "" : `${slug}.html`;
  const tags = ACTIVE_LOCALES.map((loc) => {
    const url = loc === "en" ? `${ORIGIN}/${filePart}` : `${ORIGIN}/${loc}/${filePart}`;
    return `<link rel="alternate" hreflang="${loc}" href="${url}" />`;
  });
  tags.push(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}/${filePart}" />`);
  return tags.join("\n    ");
}

function build() {
  // 0. Verify design tokens have zero drift between design/tokens.json, goalworld_site, and goalchain_webapp
  const tokenSyncScript = join(ROOT, "design/sync-tokens.mjs");
  if (existsSync(tokenSyncScript)) {
    execFileSync(process.execPath, [tokenSyncScript, "--check"], { stdio: "inherit" });
  }

  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  const layout = readFileSync(join(SRC, "layout.html"), "utf8");
  const partialHeader = readFileSync(join(PARTIALS, "_header.html"), "utf8");
  const partialSticky = readFileSync(join(PARTIALS, "_sticky_cta.html"), "utf8");
  const partialFooter = readFileSync(join(PARTIALS, "_footer.html"), "utf8");

  const pageFiles = readdirSync(join(SRC, "pages")).filter((f) => f.endsWith(".html")).sort();
  const pages = pageFiles.map((f) => ({ file: f, ...parsePage(join(SRC, "pages", f)) }));

  const sitemap = [];
  for (const { file, meta, body: rawBody } of pages) {
    const slug = meta.slug;
    const locale = meta.lang || "en";
    const prefix = locale === "en" ? "" : `/${locale}`;
    const homeHref = locale === "en" ? "/" : `/${locale}/`;
    const isHome = slug === "index";
    const canonical = isHome ? `${ORIGIN}${homeHref}` : `${ORIGIN}${prefix}/${slug}.html`;
    const nav = Object.fromEntries(NAV_KEYS.map((k) => [`NAV_${k}`, meta.nav === k ? ' aria-current="page"' : ""]));

    const expandedBody = expandComponents(rawBody, file);
    const jsonLd = buildJsonLd(slug, canonical, meta, expandedBody, locale);
    const chromeVars = {
      ...(CHROME_I18N[locale] || CHROME_I18N.en),
      LANG: locale,
      PREFIX: prefix,
      HOME_HREF: homeHref,
      LANG_SWITCHER: renderLangSwitcher(slug, locale, "header"),
      LANG_SWITCHER_FOOTER: renderLangSwitcher(slug, locale, "footer"),
      ...nav,
    };

    const assembledLayout = fill(layout, {
      PARTIAL_HEADER: fill(partialHeader, chromeVars),
      PARTIAL_STICKY_CTA: fill(partialSticky, chromeVars),
      PARTIAL_FOOTER: fill(partialFooter, chromeVars),
    });

    const html = fill(assembledLayout, {
      ...chromeVars,
      TITLE: meta.title,
      DESC: meta.description,
      CANONICAL: canonical,
      HREFLANGS: buildHreflangs(slug),
      PRELOAD: meta.preload || "",
      JSONLD: jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : "",
      BODY: expandedLayoutBody(expandedBody, chromeVars),
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
  copyFileSync(join(SRC, "llms.txt"), join(DIST, "llms.txt"));
  cpSync(join(SRC, ".well-known"), join(DIST, ".well-known"), { recursive: true });
  cpSync(join(SRC, "assets"), join(DIST, "assets"), { recursive: true });
  if (existsSync(join(SRC, "data"))) cpSync(join(SRC, "data"), join(DIST, "data"), { recursive: true });

  // sitemap
  const urls = sitemap
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join("\n");
  writeFileSync(
    join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
  console.log(`  sitemap.xml  (${sitemap.length} urls, lastmod ${BUILD_DATE})`);

  // best-effort press zip
  try {
    const pressDir = join(DIST, "assets/img/press");
    execFileSync("python3", [join(HERE, "tools/make_press_zip.py"), pressDir], { stdio: "pipe" });
    const zSize = statSync(join(pressDir, "press-kit.zip")).size;
    console.log(`  press-kit.zip  (${(zSize / 1024).toFixed(0)} KB)`);
  } catch {
    console.log("  press-kit.zip  SKIPPED (python3 unavailable) — individual files still served");
  }

  // sanity: no unresolved placeholders or unexpanded @component tags
  for (const f of readdirSync(DIST)) {
    if (!f.endsWith(".html")) continue;
    const html = readFileSync(join(DIST, f), "utf8");
    const left = html.match(/\{\{[A-Z0-9_]+\}\}/g);
    if (left) throw new Error(`unresolved placeholders in ${f}: ${left.join(", ")}`);
    if (/<!--\s*@component\b/.test(html)) throw new Error(`unexpanded @component macro in ${f}`);
    if (!/<title>[^<]{10,}<\/title>/.test(html)) throw new Error(`missing/short title: ${f}`);
    if (!/rel="canonical"/.test(html)) throw new Error(`missing canonical: ${f}`);
    if (!/og:image/.test(html)) throw new Error(`missing og:image: ${f}`);
    if (!/<meta name="description"/.test(html)) throw new Error(`missing description: ${f}`);

    // JSON-LD sanity
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

  // banned-claims contract: fail build if output contains unverified/banned claims (A-014)
  const BANNED_ALLOWLIST = [/\bno\s+yield\b/gi];
  const BANNED_CLAIMS = [
    { label: "pre-order", re: /\bpre-order\b/i },
    { label: "preorder", re: /\bpreorder\b/i },
    { label: "prerreserva", re: /\bprerreserva\b/i },
    { label: "available on Kindle", re: /available\s+on\s+kindle/i },
    { label: "KDP", re: /\bKDP\b/i },
    { label: "yield", re: /\byield\b/i },
    { label: "staking", re: /\bstaking\b/i },
    { label: "NFT market", re: /NFT\s+market/i },
    { label: "definitive English edition is complete", re: /definitive\s+english\s+edition\s+is\s+complete/i },
    { label: "game you own", re: /game\s+you\s+own/i },
    { label: "USDC royalties", re: /USDC\s+royalties/i },
    { label: "Zero Value Loss", re: /zero\s+value\s+loss/i },
    { label: "Infinity Burn", re: /infinity\s+burn/i },
    { label: "audited facial likeness", re: /audited\s+facial\s+likeness/i },
    { label: "C2PA-verified", re: /C2PA-verified/i },
    { label: "Kora Chen", re: /\bKora\s+Chen\b/i },
    { label: "Neo-Veridia", re: /\bNeo-Veridia\b/i },
    { label: "seven days", re: /\bseven\s+days\b/i },
    { label: "432 Hz", re: /\b432\s+Hz\b/i },
    { label: "$1M", re: /\$1M\b/i },
    { label: "Convergence Protocol", re: /Convergence\s+Protocol/i },
  ];
  function walkTextFiles(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walkTextFiles(full, out);
      else if (/\.(html|txt|json|md|webmanifest)$/i.test(entry.name)) out.push(full);
    }
    return out;
  }
  const checkedFiles = walkTextFiles(DIST);
  for (const file of checkedFiles) {
    let text = readFileSync(file, "utf8");
    for (const allowRe of BANNED_ALLOWLIST) {
      text = text.replace(allowRe, "");
    }
    for (const { label, re } of BANNED_CLAIMS) {
      const m = text.match(re);
      if (m) {
        throw new Error(`banned claim "${label}" (${m[0]}) found in dist/${relative(DIST, file)}`);
      }
    }
  }
  console.log(`  banned-claims check OK — 0 violations across ${checkedFiles.length} output files`);
  console.log(`  sanity OK — ${pageFiles.length} pages built into ${DIST}`);
}

function expandedLayoutBody(body, vars) {
  return fill(body, vars);
}

build();
