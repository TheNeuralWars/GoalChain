#!/usr/bin/env python3
"""
Builds docs/reader.html and docs/go/reader/index.html with embedded manuscripts of Book 1 & Book 2.
"""
import os
import glob
import json

base_trilogy = r"c:\Users\NicoPez\the-neural-wars-trilogy"

def load_book_chapters(book_folder_name, edition_subfolder):
    folder = os.path.join(base_trilogy, book_folder_name, edition_subfolder)
    files = sorted([
        f for f in glob.glob(os.path.join(folder, "*.md"))
        if not os.path.basename(f).startswith("README") and not os.path.basename(f).startswith("MANUSCRIPT")
    ])
    chapters = []
    for idx, f in enumerate(files):
        with open(f, "r", encoding="utf-8") as fh:
            content = fh.read()
        lines = [l.strip() for l in content.split("\n") if l.strip()]
        title = lines[0].replace("# ", "") if lines else f"Chapter {idx}"
        words = len(content.split())
        read_time = f"{max(1, round(words / 200))} min"
        chapters.append({
            "id": f"ch-{idx}",
            "index": idx,
            "title": title,
            "readTime": read_time,
            "wordCount": words,
            "content": content
        })
    return chapters

b1_es = load_book_chapters("BOOK_01_FRACTURED_CODE", "EDICION_2026")
b1_en = load_book_chapters("BOOK_01_FRACTURED_CODE", "ENGLISH_EDITION_2026")
b2_es = load_book_chapters("BOOK_02_EARTHS_NEW_SONG", "EDICION_2026")
b2_en = load_book_chapters("BOOK_02_EARTHS_NEW_SONG", "ENGLISH_EDITION_2026")

books_payload = [
    {
        "id": "the-neural-wars-book-1",
        "title": {"es": "The Neural Wars: Código Fracturado (Libro 1)", "en": "The Neural Wars: Fractured Code (Book 1)"},
        "subtitle": {"es": "Edición Definitiva de Autor 2026", "en": "2026 Definitive Author Edition"},
        "genre": "Hard Sci-Fi / Cyberpunk",
        "chapters": {"es": b1_es, "en": b1_en}
    },
    {
        "id": "the-neural-wars-book-2",
        "title": {"es": "The Neural Wars: La Nueva Canción de la Tierra (Libro 2)", "en": "The Neural Wars: Earth's New Song (Book 2)"},
        "subtitle": {"es": "Convergence Protocol — Edición 2026", "en": "Convergence Protocol — 2026 Edition"},
        "genre": "Hard Sci-Fi / Space Opera / First Contact",
        "chapters": {"es": b2_es, "en": b2_en}
    }
]

html_template = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GoalWorld Kindle E-Reader • The Neural Wars Saga</title>
  <meta name="description" content="Lector inmersivo oficial de GoalWorld para The Neural Wars Trilogy." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0f;
      --text: #e2e8f0;
      --header-bg: rgba(15, 15, 25, 0.95);
      --border: rgba(255, 255, 255, 0.08);
      --accent: #818cf8;
      --muted: #94a3b8;
      --font-family: 'Merriweather', Georgia, serif;
      --font-size: 18px;
      --max-width: 760px;
    }

    body.theme-sepia {
      --bg: #fbf0d9;
      --text: #3b2f20;
      --header-bg: rgba(244, 230, 203, 0.98);
      --border: rgba(80, 60, 40, 0.12);
      --accent: #9a5824;
      --muted: #7a6552;
    }

    body.theme-light {
      --bg: #ffffff;
      --text: #1e293b;
      --header-bg: rgba(248, 250, 252, 0.98);
      --border: rgba(0, 0, 0, 0.08);
      --accent: #4f46e5;
      --muted: #64748b;
    }

    body.theme-cosmic {
      --bg: #0d0b1a;
      --text: #ede9fe;
      --header-bg: rgba(22, 18, 42, 0.98);
      --border: rgba(168, 85, 247, 0.2);
      --accent: #c084fc;
      --muted: #a78bfa;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-family);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background 0.3s ease, color 0.3s ease;
      overflow-x: hidden;
    }

    header {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--header-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 0.75rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      font-family: 'Inter', sans-serif;
    }

    .btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn:hover { border-color: var(--accent); color: var(--accent); }
    .btn-primary { background: var(--accent); color: #fff; border: none; }
    .btn-primary:hover { opacity: 0.9; }

    .vip-badge {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    select.picker {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
    }
    select.picker option { background: var(--bg); color: var(--text); }

    .sidebar {
      position: fixed;
      top: 0; left: -360px; bottom: 0;
      width: 340px;
      background: var(--header-bg);
      z-index: 60;
      border-right: 1px solid var(--border);
      box-shadow: 10px 0 30px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(16px);
      transition: left 0.3s ease;
      font-family: 'Inter', sans-serif;
    }
    .sidebar.open { left: 0; }

    .toc-item {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 0.2s;
    }
    .toc-item:hover { background: rgba(129, 140, 248, 0.1); }
    .toc-item.active { background: rgba(129, 140, 248, 0.2); border-left: 4px solid var(--accent); color: var(--accent); }

    main {
      flex: 1;
      padding: 2.5rem 1.5rem 6rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    article {
      width: 100%;
      max-width: var(--max-width);
    }

    .chapter-header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
      font-family: 'Inter', sans-serif;
    }

    .chapter-tag {
      font-size: 0.8rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 700;
    }

    .reader-body h1 {
      font-size: 1.8em;
      font-weight: 800;
      color: var(--accent);
      margin: 1.5em 0 0.8em 0;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.4em;
    }
    .reader-body p {
      font-size: var(--font-size);
      line-height: 1.85;
      margin-bottom: 1.2em;
      text-align: justify;
      hyphens: auto;
    }
    .reader-body p:not(.dialogue) {
      text-indent: 1.5em;
    }
    .reader-body blockquote {
      border-left: 4px solid var(--accent);
      padding: 0.8rem 1.2rem;
      margin: 1.2rem 0;
      font-style: italic;
      color: var(--muted);
      background: rgba(128, 128, 128, 0.05);
      border-radius: 0 8px 8px 0;
    }
    .reader-body .code-box {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
      background: rgba(0, 0, 0, 0.25);
      padding: 0.6rem 1rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      color: var(--accent);
      margin: 0.8rem 0;
      letter-spacing: 0.05em;
    }

    footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 30;
      background: var(--header-bg);
      border-top: 1px solid var(--border);
      padding: 0.4rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--muted);
      backdrop-filter: blur(10px);
      font-family: 'Inter', sans-serif;
    }

    .progress-bar-wrap {
      width: 200px;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: var(--accent);
      width: 0%;
      transition: width 0.1s linear;
    }
  </style>
</head>
<body>
  <div id="sidebar" class="sidebar">
    <div style="padding: 1.2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1rem; color: var(--accent);">Índice de Capítulos</h3>
      <button class="btn" onclick="toggleToc()">✕</button>
    </div>
    <div id="toc-list" style="flex: 1; overflow-y: auto;"></div>
  </div>

  <header>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <a href="/goalworld.html" class="btn">← GoalWorld</a>
      <button class="btn" onclick="toggleToc()">☰ Capítulos</button>
      <select id="book-select" class="picker" onchange="changeBook(this.value)"></select>
    </div>

    <div style="display: flex; align-items: center; gap: 0.8rem;">
      <div class="vip-badge">★ VIP PASS ACTIVO</div>
      <div style="display: flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden;">
        <button id="btn-lang-es" class="btn" style="border:none; border-radius:0; background:var(--accent); color:#fff;" onclick="changeLang('es')">🇪🇸 ES</button>
        <button id="btn-lang-en" class="btn" style="border:none; border-radius:0;" onclick="changeLang('en')">🇺🇸 EN</button>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <button class="btn" onclick="toggleTheme()">🎨 Tema</button>
      <button class="btn" onclick="changeFontSize(-1)">A-</button>
      <button class="btn" onclick="changeFontSize(1)">A+</button>
    </div>
  </header>

  <main>
    <article>
      <div class="chapter-header">
        <div id="chapter-meta-tag" class="chapter-tag"></div>
        <div id="chapter-meta-time" style="font-size: 0.85rem; color: var(--muted); margin-top: 0.4rem;"></div>
      </div>
      <div id="reader-body" class="reader-body"></div>

      <nav style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif;">
        <button id="btn-prev" class="btn" onclick="navigateChapter(-1)">← Anterior</button>
        <span id="chapter-page-num" style="font-size: 0.85rem; color: var(--muted);"></span>
        <button id="btn-next" class="btn btn-primary" onclick="navigateChapter(1)">Siguiente →</button>
      </nav>
    </article>
  </main>

  <footer>
    <div id="footer-chapter-title"></div>
    <div style="display: flex; align-items: center; gap: 0.8rem;">
      <div class="progress-bar-wrap">
        <div id="progress-fill" class="progress-bar-fill"></div>
      </div>
      <span id="progress-text">0%</span>
    </div>
  </footer>

  <script>
    const BOOKS_DATA = """ + json.dumps(books_payload, ensure_ascii=False) + """;

    let currentBookIndex = 0;
    let currentLang = 'es';
    let currentChapterIndex = 0;
    const themes = ['dark', 'sepia', 'light', 'cosmic'];
    let themeIndex = 0;
    let fontSize = 18;

    function init() {
      const select = document.getElementById('book-select');
      select.innerHTML = BOOKS_DATA.map((b, idx) => `<option value="${idx}">${b.title[currentLang]}</option>`).join('');
      renderBook();
    }

    function changeBook(idx) {
      currentBookIndex = parseInt(idx);
      currentChapterIndex = 0;
      renderBook();
    }

    function changeLang(lang) {
      currentLang = lang;
      document.getElementById('btn-lang-es').style.background = lang === 'es' ? 'var(--accent)' : 'transparent';
      document.getElementById('btn-lang-es').style.color = lang === 'es' ? '#fff' : 'var(--muted)';
      document.getElementById('btn-lang-en').style.background = lang === 'en' ? 'var(--accent)' : 'transparent';
      document.getElementById('btn-lang-en').style.color = lang === 'en' ? '#fff' : 'var(--muted)';
      
      const select = document.getElementById('book-select');
      select.innerHTML = BOOKS_DATA.map((b, idx) => `<option value="${idx}" ${idx === currentBookIndex ? 'selected' : ''}>${b.title[currentLang]}</option>`).join('');
      renderBook();
    }

    function renderBook() {
      const book = BOOKS_DATA[currentBookIndex];
      const chapters = book.chapters[currentLang] || book.chapters.es;
      const chapter = chapters[currentChapterIndex] || chapters[0];

      const tocList = document.getElementById('toc-list');
      tocList.innerHTML = chapters.map((ch, idx) => `
        <div class="toc-item ${idx === currentChapterIndex ? 'active' : ''}" onclick="goToChapter(${idx})">
          <div style="font-size: 0.85rem; font-weight: ${idx === currentChapterIndex ? '700' : '500'}">${ch.title}</div>
          <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem;">${ch.wordCount} palabras • ${ch.readTime}</div>
        </div>
      `).join('');

      document.getElementById('chapter-meta-tag').innerText = `${book.title[currentLang]} • Capítulo ${currentChapterIndex + 1} de ${chapters.length}`;
      document.getElementById('chapter-meta-time').innerText = `⏱ ${chapter.readTime} de lectura • ${chapter.wordCount} palabras`;
      document.getElementById('footer-chapter-title').innerText = chapter.title;
      document.getElementById('chapter-page-num').innerText = `${currentChapterIndex + 1} / ${chapters.length}`;

      document.getElementById('btn-prev').disabled = currentChapterIndex === 0;
      document.getElementById('btn-prev').style.opacity = currentChapterIndex === 0 ? '0.4' : '1';
      document.getElementById('btn-next').disabled = currentChapterIndex >= chapters.length - 1;
      document.getElementById('btn-next').style.opacity = currentChapterIndex >= chapters.length - 1 ? '0.4' : '1';

      const bodyEl = document.getElementById('reader-body');
      bodyEl.innerHTML = formatMarkdown(chapter.content);

      window.scrollTo(0, 0);
      updateProgress();
    }

    function formatMarkdown(md) {
      const lines = md.split('\\n');
      return lines.map(line => {
        const t = line.trim();
        if (!t) return '<div style="height: 1.2em;"></div>';
        if (t.startsWith('# ')) return `<h1>${t.replace('# ', '')}</h1>`;
        if (t.startsWith('## ')) return `<h2>${t.replace('## ', '')}</h2>`;
        if (t.startsWith('### ')) return `<h3>${t.replace('### ', '')}</h3>`;
        if (t.startsWith('>')) return `<blockquote>${t.replace(/^>\\s*/, '')}</blockquote>`;
        if (t.startsWith('`') && t.endsWith('`')) return `<div class="code-box">${t.replace(/`/g, '')}</div>`;
        const isDialogue = t.startsWith('—') || t.startsWith('-');
        return `<p class="${isDialogue ? 'dialogue' : ''}">${t}</p>`;
      }).join('');
    }

    function toggleToc() {
      document.getElementById('sidebar').classList.toggle('open');
    }

    function goToChapter(idx) {
      currentChapterIndex = idx;
      toggleToc();
      renderBook();
    }

    function navigateChapter(delta) {
      const book = BOOKS_DATA[currentBookIndex];
      const chapters = book.chapters[currentLang];
      const next = currentChapterIndex + delta;
      if (next >= 0 && next < chapters.length) {
        currentChapterIndex = next;
        renderBook();
      }
    }

    function toggleTheme() {
      themeIndex = (themeIndex + 1) % themes.length;
      document.body.className = `theme-${themes[themeIndex]}`;
    }

    function changeFontSize(delta) {
      fontSize = Math.min(32, Math.max(14, fontSize + delta));
      document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    }

    function updateProgress() {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalH <= 0 ? 100 : Math.round((window.scrollY / totalH) * 100);
      document.getElementById('progress-fill').style.width = `${progress}%`;
      document.getElementById('progress-text').innerText = `${progress}%`;
    }

    window.addEventListener('scroll', updateProgress);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') navigateChapter(1);
      if (e.key === 'ArrowLeft') navigateChapter(-1);
    });

    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>"""

# Write to docs/reader.html
docs_reader = r"c:\Users\NicoPez\goalchain\docs\reader.html"
with open(docs_reader, "w", encoding="utf-8") as f:
    f.write(html_template)
print(f"[+] Wrote {docs_reader}")

# Write to docs/go/reader/index.html
go_reader_dir = r"c:\Users\NicoPez\goalchain\docs\go\reader"
os.makedirs(go_reader_dir, exist_ok=True)
go_reader = os.path.join(go_reader_dir, "index.html")
with open(go_reader, "w", encoding="utf-8") as f:
    f.write(html_template)
print(f"[+] Wrote {go_reader}")
