#!/usr/bin/env python3
"""
Builds docs/reader.html and docs/go/reader/index.html with embedded manuscripts of Book 1 & Book 2,
including AI HD Neural voices + Web Speech Synthesis fallback, 432 Hz Solfeggio generator, and polished UI.
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
  <title>GoalWorld Kindle E-Reader & Audiolibro HD • The Neural Wars Saga</title>
  <meta name="description" content="Lector inmersivo y audiolibro gratuito con voces IA HD de GoalWorld para The Neural Wars Trilogy." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script src="https://js.puter.com/v2/" async></script>
  <style>
    :root {
      --bg: #0a0a10;
      --text: #f1f5f9;
      --header-bg: rgba(15, 17, 26, 0.95);
      --border: rgba(255, 255, 255, 0.08);
      --accent: #a855f7;
      --accent-glow: rgba(168, 85, 247, 0.35);
      --muted: #94a3b8;
      --active-hl: rgba(168, 85, 247, 0.14);
      --font-family: 'Merriweather', Georgia, serif;
      --font-size: 18px;
      --max-width: 760px;
    }

    body.theme-sepia {
      --bg: #fbf0d9;
      --text: #3b2f20;
      --header-bg: rgba(246, 235, 210, 0.98);
      --border: rgba(150, 91, 37, 0.15);
      --accent: #965b25;
      --accent-glow: rgba(150, 91, 37, 0.3);
      --muted: #7a6552;
      --active-hl: rgba(150, 91, 37, 0.12);
    }

    body.theme-light {
      --bg: #f8fafc;
      --text: #0f172a;
      --header-bg: rgba(248, 250, 252, 0.98);
      --border: rgba(0, 0, 0, 0.08);
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.3);
      --muted: #64748b;
      --active-hl: rgba(99, 102, 241, 0.08);
    }

    body.theme-cosmic {
      --bg: #05060b;
      --text: #ede9fe;
      --header-bg: rgba(10, 11, 22, 0.98);
      --border: rgba(168, 85, 247, 0.25);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.4);
      --muted: #a78bfa;
      --active-hl: rgba(56, 189, 248, 0.15);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-family);
      line-height: 1.85;
      font-size: var(--font-size);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: background 0.3s ease, color 0.3s ease;
    }

    header {
      position: sticky;
      top: 0;
      z-index: 30;
      background: var(--header-bg);
      border-bottom: 1px solid var(--border);
      padding: 0.8rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(16px);
      font-family: 'Inter', sans-serif;
    }

    .audio-panel {
      background: var(--header-bg);
      border-bottom: 1px solid var(--border);
      padding: 0.85rem 1.5rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--accent);
    }
    .btn-primary {
      background: linear-gradient(135deg, #a855f7 0%, #38bdf8 100%);
      color: #fff;
      border: none;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
    }

    .vip-badge {
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2));
      border: 1px solid rgba(234, 179, 8, 0.4);
      color: #fbbf24;
      font-weight: 800;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .picker {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }

    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      width: 340px;
      background: var(--header-bg);
      border-right: 1px solid var(--border);
      z-index: 50;
      transform: translateX(-100%);
      transition: transform 0.25s ease-in-out;
      display: flex;
      flex-direction: column;
      box-shadow: 20px 0 50px rgba(0,0,0,0.6);
      backdrop-filter: blur(20px);
      font-family: 'Inter', sans-serif;
    }
    .sidebar.open { transform: translateX(0); }

    .toc-item {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      font-size: 0.88rem;
      color: var(--muted);
      transition: all 0.2s;
    }
    .toc-item:hover, .toc-item.active {
      background: var(--active-hl);
      color: var(--accent);
      font-weight: 700;
      border-left: 4px solid var(--accent);
    }

    main {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 2.5rem 1.5rem 5rem;
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
      color: var(--accent);
      font-size: 0.88rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 0.5rem;
    }

    .reader-body p {
      margin-bottom: 1.4em;
      text-align: justify;
      text-indent: 1.8em;
      transition: background 0.3s, border-left 0.3s;
    }
    .reader-body p.dialogue {
      text-indent: 0;
    }
    .reader-body p.spoken-active {
      background: var(--active-hl);
      border-left: 4px solid var(--accent);
      padding: 8px 12px;
      border-radius: 8px;
      box-shadow: 0 0 15px var(--accent-glow);
    }
    .reader-body h1, .reader-body h2, .reader-body h3 {
      font-family: 'Inter', sans-serif;
      margin-top: 2rem;
      margin-bottom: 0.8rem;
      color: var(--accent);
      text-align: left;
    }
    .reader-body hr {
      border: none;
      text-align: center;
      margin: 2.5rem 0;
    }
    .reader-body hr::after {
      content: '✦ ✦ ✦';
      color: var(--accent);
      opacity: 0.6;
      font-size: 0.9rem;
      letter-spacing: 8px;
    }

    footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 30;
      background: var(--header-bg);
      border-top: 1px solid var(--border);
      padding: 0.5rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--muted);
      backdrop-filter: blur(16px);
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
      <h3 style="font-size: 1rem; font-weight: 800; color: var(--accent);">Índice de Capítulos</h3>
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
      <div style="display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;">
        <button id="btn-lang-es" class="btn" style="border:none; border-radius:0; background:var(--accent); color:#fff;" onclick="changeLang('es')">🇪🇸 ES</button>
        <button id="btn-lang-en" class="btn" style="border:none; border-radius:0;" onclick="changeLang('en')">🇺🇸 EN</button>
      </div>
      <button class="btn" id="btn-audio-toggle" onclick="toggleAudioPanel()" style="color:var(--accent);">🎧 Audiolibro</button>
    </div>

    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <button class="btn" onclick="toggleTheme()">🎨 Tema</button>
      <button class="btn" onclick="changeFontSize(-1)">A-</button>
      <button class="btn" onclick="changeFontSize(1)">A+</button>
    </div>
  </header>

  <!-- AUDIOBOOK CONTROL BAR -->
  <div id="audio-bar" class="audio-panel" style="display: none;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <button id="btn-tts-play" class="btn btn-primary" onclick="toggleTtsPlay()">▶ Iniciar Narración</button>
      <button id="btn-tts-stop" class="btn" style="display:none; background:rgba(239,68,68,0.2); border-color:#ef4444; color:#ef4444;" onclick="stopTts()">⏹ Detener</button>
      <span id="tts-status" style="color: var(--muted); font-size: 0.8rem; font-weight:700;"></span>
    </div>

    <div style="display: flex; align-items: center; flex-wrap:wrap; gap: 10px;">
      <!-- Engine Selector -->
      <div style="display: flex; border: 1px solid var(--border); border-radius: 6px; overflow: hidden;">
        <button id="btn-engine-ai" class="btn" style="padding:3px 8px; font-size:0.75rem; border:none; border-radius:0; background:var(--accent); color:#fff;" onclick="setEngine('ai')">✨ Voces IA HD</button>
        <button id="btn-engine-browser" class="btn" style="padding:3px 8px; font-size:0.75rem; border:none; border-radius:0;" onclick="setEngine('browser')">💻 Navegador</button>
      </div>

      <div id="browser-voice-wrap" style="display:none;">
        <span style="color: var(--muted); font-size: 0.75rem;">Voz:</span>
        <select id="tts-voice-select" class="picker" style="padding: 4px 8px; font-size: 0.75rem;" onchange="onVoiceChange()"></select>
      </div>

      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="color: var(--muted); font-size: 0.75rem;">Velocidad:</span>
        <select id="tts-rate-select" class="picker" style="padding: 4px 6px; font-size: 0.75rem;" onchange="onRateChange(this.value)">
          <option value="0.8">0.8x</option>
          <option value="1.0" selected>1.0x</option>
          <option value="1.2">1.2x</option>
          <option value="1.5">1.5x</option>
        </select>
      </div>

      <button id="btn-solfeggio" class="btn" onclick="toggleSolfeggioAudio()" style="font-size: 0.75rem;">🌊 Solfeggio 432 Hz</button>
    </div>
  </div>

  <main>
    <article>
      <div class="chapter-header">
        <div id="chapter-meta-tag" class="chapter-tag"></div>
        <div id="chapter-meta-time" style="font-size: 0.85rem; color: var(--muted); margin-top: 0.4rem;"></div>
      </div>
      <div id="reader-body" class="reader-body"></div>

      <nav style="margin-top: 4.5rem; padding-top: 2rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-family: 'Inter', sans-serif;">
        <button id="btn-prev" class="btn" onclick="navigateChapter(-1)">◀ Anterior</button>
        <span id="chapter-page-num" style="font-size: 0.85rem; color: var(--muted);"></span>
        <button id="btn-next" class="btn btn-primary" onclick="navigateChapter(1)">Siguiente ▶</button>
      </nav>
    </article>
  </main>

  <footer>
    <div id="footer-chapter-title"></div>
    <div style="display: flex; align-items: center; gap: 0.8rem;">
      <div class="progress-bar-wrap">
        <div id="scroll-progress-fill" class="progress-bar-fill"></div>
      </div>
      <span id="scroll-progress-text">0%</span>
    </div>
  </footer>

  <script>
    const BOOKS_DATA = """ + json.dumps(books_payload, ensure_ascii=False) + """;

    let state = {
      bookId: 'the-neural-wars-book-1',
      lang: 'es',
      chapterIndex: 0,
      theme: 'dark',
      fontSize: 18,
      isTtsPlaying: false,
      isTtsPaused: false,
      speechRate: 1.0,
      activeParaIdx: 0,
      engine: 'ai',
      voices: [],
      solfeggioActive: false,
      isCanceled: false
    };

    let audioCtx = null;
    let solfeggioOsc = null;
    let solfeggioGain = null;
    let currentAiAudio = null;

    function init() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('book')) state.bookId = urlParams.get('book');
      if (urlParams.get('lang')) state.lang = urlParams.get('lang');
      if (urlParams.get('ch')) state.chapterIndex = parseInt(urlParams.get('ch')) || 0;

      populateBookSelect();
      loadVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      renderChapter();
      window.addEventListener('scroll', updateProgress);
    }

    function toggleAudioPanel() {
      const bar = document.getElementById('audio-bar');
      bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
    }

    function setEngine(eng) {
      stopTts();
      state.engine = eng;
      document.getElementById('btn-engine-ai').style.background = eng === 'ai' ? 'var(--accent)' : 'transparent';
      document.getElementById('btn-engine-ai').style.color = eng === 'ai' ? '#fff' : 'var(--muted)';
      document.getElementById('btn-engine-browser').style.background = eng === 'browser' ? 'var(--accent)' : 'transparent';
      document.getElementById('btn-engine-browser').style.color = eng === 'browser' ? '#fff' : 'var(--muted)';
      document.getElementById('browser-voice-wrap').style.display = eng === 'browser' ? 'block' : 'none';
    }

    function loadVoices() {
      if (!window.speechSynthesis) return;
      state.voices = window.speechSynthesis.getVoices();
      const select = document.getElementById('tts-voice-select');
      select.innerHTML = '';

      const filtered = state.voices.filter(v => v.lang.toLowerCase().startsWith(state.lang));
      filtered.forEach((v) => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI;
        opt.textContent = `${v.name} (${v.lang})`;
        select.appendChild(opt);
      });
    }

    function toggleTtsPlay() {
      const btn = document.getElementById('btn-tts-play');
      const stopBtn = document.getElementById('btn-tts-stop');
      const status = document.getElementById('tts-status');

      if (state.isTtsPlaying) {
        if (state.isTtsPaused) {
          if (currentAiAudio) {
            currentAiAudio.play();
          } else if (window.speechSynthesis) {
            window.speechSynthesis.resume();
          }
          state.isTtsPaused = false;
          btn.textContent = '⏸ Pausar';
          status.textContent = ' ▂▃▅';
        } else {
          if (currentAiAudio) {
            currentAiAudio.pause();
          } else if (window.speechSynthesis) {
            window.speechSynthesis.pause();
          }
          state.isTtsPaused = true;
          btn.textContent = '▶ Reanudar';
          status.textContent = '(Pausado)';
        }
        return;
      }

      // Start narration
      stopTts();
      state.isCanceled = false;
      const book = BOOKS_DATA.find(b => b.id === state.bookId);
      const ch = book.chapters[state.lang][state.chapterIndex];
      const paras = ch.content.split('\\n\\n').map(p => p.trim()).filter(p => p && !p.startsWith('#') && !p.startsWith('---'));

      state.isTtsPlaying = true;
      state.isTtsPaused = false;
      btn.textContent = '⏸ Pausar';
      stopBtn.style.display = 'inline-flex';
      status.textContent = ' ▂▃▅▆▇';

      if (state.engine === 'ai' && window.puter && window.puter.ai) {
        playNextAI(paras, 0);
      } else {
        playNextBrowser(paras, 0);
      }
    }

    async function playNextAI(paras, idx) {
      if (state.isCanceled || idx >= paras.length) {
        stopTts();
        return;
      }

      state.activeParaIdx = idx;
      highlightPara(idx);

      const clean = paras[idx].replace(/[#*`_>—]/g, '').trim();
      const status = document.getElementById('tts-status');

      try {
        status.textContent = '⏳ Cargando IA...';
        const audio = await window.puter.ai.txt2speech(clean, {
          provider: 'aws-polly',
          voice: state.lang === 'es' ? 'Lucia' : 'Joanna'
        });

        if (state.isCanceled) return;

        currentAiAudio = audio;
        audio.playbackRate = state.speechRate;
        status.textContent = ' ▂▃▅▆▇ (Voz HD)';

        audio.onended = () => {
          if (!state.isCanceled) playNextAI(paras, idx + 1);
        };
        audio.onerror = () => playNextBrowser(paras, idx);
        audio.play();
      } catch (e) {
        console.warn('AI TTS error, fallback to browser:', e);
        playNextBrowser(paras, idx);
      }
    }

    function playNextBrowser(paras, idx) {
      if (state.isCanceled || idx >= paras.length) {
        stopTts();
        return;
      }

      state.activeParaIdx = idx;
      highlightPara(idx);

      const clean = paras[idx].replace(/[#*`_>—]/g, '').trim();
      const utt = new SpeechSynthesisUtterance(clean);
      utt.rate = state.speechRate;

      const voiceUri = document.getElementById('tts-voice-select').value;
      const voice = state.voices.find(v => v.voiceURI === voiceUri);
      if (voice) utt.voice = voice;

      utt.onend = () => {
        if (!state.isCanceled) playNextBrowser(paras, idx + 1);
      };
      utt.onerror = () => stopTts();

      window.speechSynthesis.speak(utt);
    }

    function stopTts() {
      state.isCanceled = true;
      if (currentAiAudio) {
        currentAiAudio.pause();
        currentAiAudio.currentTime = 0;
        currentAiAudio = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      state.isTtsPlaying = false;
      state.isTtsPaused = false;
      document.getElementById('btn-tts-play').textContent = '▶ Iniciar Narración';
      document.getElementById('btn-tts-stop').style.display = 'none';
      document.getElementById('tts-status').textContent = '';
      highlightPara(-1);
    }

    function onVoiceChange() {
      if (state.isTtsPlaying) {
        stopTts();
        toggleTtsPlay();
      }
    }

    function onRateChange(val) {
      state.speechRate = parseFloat(val) || 1.0;
      if (currentAiAudio) {
        currentAiAudio.playbackRate = state.speechRate;
      }
    }

    function toggleSolfeggioAudio() {
      const btn = document.getElementById('btn-solfeggio');
      if (state.solfeggioActive) {
        if (solfeggioGain && audioCtx) {
          solfeggioGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
          setTimeout(() => {
            if (solfeggioOsc) solfeggioOsc.stop();
          }, 1000);
        }
        state.solfeggioActive = false;
        btn.textContent = '🌊 Solfeggio 432 Hz';
        btn.style.color = 'var(--text)';
      } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        solfeggioOsc = audioCtx.createOscillator();
        solfeggioGain = audioCtx.createGain();

        solfeggioOsc.type = 'sine';
        solfeggioOsc.frequency.setValueAtTime(432, audioCtx.currentTime);

        solfeggioGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        solfeggioGain.gain.exponentialRampToValueAtTime(0.03, audioCtx.currentTime + 2);

        solfeggioOsc.connect(solfeggioGain);
        solfeggioGain.connect(audioCtx.destination);
        solfeggioOsc.start();

        state.solfeggioActive = true;
        btn.textContent = '🌊 432 Hz Activo';
        btn.style.color = '#38bdf8';
      }
    }

    function highlightPara(targetIdx) {
      const paras = document.querySelectorAll('.reader-body p');
      paras.forEach((p, i) => {
        if (i === targetIdx) {
          p.classList.add('spoken-active');
          p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          p.classList.remove('spoken-active');
        }
      });
    }

    function populateBookSelect() {
      const select = document.getElementById('book-select');
      select.innerHTML = '';
      BOOKS_DATA.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.title[state.lang] || b.title.es;
        if (b.id === state.bookId) opt.selected = true;
        select.appendChild(opt);
      });
    }

    function changeBook(bookId) {
      stopTts();
      state.bookId = bookId;
      state.chapterIndex = 0;
      renderChapter();
    }

    function changeLang(lang) {
      stopTts();
      state.lang = lang;
      document.getElementById('btn-lang-es').style.background = lang === 'es' ? 'var(--accent)' : 'transparent';
      document.getElementById('btn-lang-es').style.color = lang === 'es' ? '#fff' : 'var(--text)';
      document.getElementById('btn-lang-en').style.background = lang === 'en' ? 'var(--accent)' : 'transparent';
      document.getElementById('btn-lang-en').style.color = lang === 'en' ? '#fff' : 'var(--text)';
      populateBookSelect();
      loadVoices();
      renderChapter();
    }

    function toggleToc() {
      document.getElementById('sidebar').classList.toggle('open');
    }

    function renderChapter() {
      const book = BOOKS_DATA.find(b => b.id === state.bookId) || BOOKS_DATA[0];
      const chapters = book.chapters[state.lang] || book.chapters.es;
      if (state.chapterIndex >= chapters.length) state.chapterIndex = 0;

      const ch = chapters[state.chapterIndex];

      document.getElementById('chapter-meta-tag').textContent = `${book.title[state.lang] || book.title.es} • ${ch.title}`;
      document.getElementById('chapter-meta-time').textContent = `${ch.readTime} de lectura • ${ch.wordCount} palabras`;
      document.getElementById('footer-chapter-title').textContent = ch.title;
      document.getElementById('chapter-page-num').textContent = `${state.chapterIndex + 1} / ${chapters.length}`;

      document.getElementById('btn-prev').disabled = state.chapterIndex === 0;
      document.getElementById('btn-next').disabled = state.chapterIndex === chapters.length - 1;

      // Render Markdown
      const body = document.getElementById('reader-body');
      const lines = ch.content.split('\\n\\n');
      let html = '';

      lines.forEach(l => {
        const trimmed = l.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('# ')) {
          html += `<h1>${trimmed.replace('# ', '')}</h1>`;
        } else if (trimmed.startsWith('## ')) {
          html += `<h2>${trimmed.replace('## ', '')}</h2>`;
        } else if (trimmed.startsWith('### ')) {
          html += `<h3>${trimmed.replace('### ', '')}</h3>`;
        } else if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
          html += `<hr />`;
        } else if (trimmed.startsWith('>')) {
          html += `<blockquote>${trimmed.replace(/^>\\s*/, '')}</blockquote>`;
        } else {
          const isDialogue = trimmed.startsWith('—') || trimmed.startsWith('-');
          html += `<p class="${isDialogue ? 'dialogue' : ''}">${trimmed}</p>`;
        }
      });

      body.innerHTML = html;

      // Render Sidebar TOC
      const tocList = document.getElementById('toc-list');
      tocList.innerHTML = '';
      chapters.forEach((c, idx) => {
        const item = document.createElement('div');
        item.className = `toc-item ${idx === state.chapterIndex ? 'active' : ''}`;
        item.innerHTML = `<div>${c.title}</div><div style="font-size:0.75rem; color:var(--muted);">${c.readTime} • ${c.wordCount} pal.</div>`;
        item.onclick = () => {
          stopTts();
          state.chapterIndex = idx;
          toggleToc();
          renderChapter();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        tocList.appendChild(item);
      });

      window.scrollTo({ top: 0 });
      updateProgress();
    }

    function navigateChapter(dir) {
      stopTts();
      const book = BOOKS_DATA.find(b => b.id === state.bookId);
      const chapters = book.chapters[state.lang] || book.chapters.es;
      const next = state.chapterIndex + dir;
      if (next >= 0 && next < chapters.length) {
        state.chapterIndex = next;
        renderChapter();
      }
    }

    function toggleTheme() {
      const themes = ['dark', 'sepia', 'light', 'cosmic'];
      const curIdx = themes.indexOf(state.theme);
      state.theme = themes[(curIdx + 1) % themes.length];
      document.body.className = `theme-${state.theme}`;
    }

    function changeFontSize(delta) {
      state.fontSize = Math.min(32, Math.max(14, state.fontSize + delta));
      document.documentElement.style.setProperty('--font-size', `${state.fontSize}px`);
    }

    function updateProgress() {
      const h = document.documentElement;
      const b = document.body;
      const st = 'scrollTop' in h ? h.scrollTop : b.scrollTop;
      const sh = 'scrollHeight' in h ? h.scrollHeight : b.scrollHeight;
      const percent = Math.min(100, Math.max(0, Math.round((st / (sh - h.clientHeight)) * 100))) || 0;
      document.getElementById('scroll-progress-fill').style.width = `${percent}%`;
      document.getElementById('scroll-progress-text').textContent = `${percent}%`;
    }

    window.onload = init;
  </script>
</body>
</html>
"""

# Write reader.html and go/reader/index.html
out_reader = r"c:\Users\NicoPez\goalchain\docs\reader.html"
with open(out_reader, "w", encoding="utf-8") as f:
    f.write(html_template)
print(f"[+] Wrote {out_reader}")

out_go_reader = r"c:\Users\NicoPez\goalchain\docs\go\reader\index.html"
os.makedirs(os.path.dirname(out_go_reader), exist_ok=True)
with open(out_go_reader, "w", encoding="utf-8") as f:
    f.write(html_template)
print(f"[+] Wrote {out_go_reader}")
