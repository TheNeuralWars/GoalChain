import React, { useState, useEffect, useRef } from 'react';
import { THE_NEURAL_WARS_BOOKS, BookData, ChapterData } from './booksData';

export type ReaderTheme = 'dark' | 'sepia' | 'light' | 'cosmic';
export type ReaderFont = 'serif' | 'sans' | 'mono';

interface KindleReaderProps {
  initialBookId?: string;
  initialChapterIndex?: number;
  onBackToPortal?: () => void;
}

export function KindleReader({
  initialBookId = 'the-neural-wars-book-1',
  initialChapterIndex = 0,
  onBackToPortal,
}: KindleReaderProps) {
  // Book and Chapter State
  const [selectedBook, setSelectedBook] = useState<BookData>(
    THE_NEURAL_WARS_BOOKS.find((b) => b.id === initialBookId) || THE_NEURAL_WARS_BOOKS[0]
  );
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(initialChapterIndex);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Reader Customization Preferences
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [fontFamily, setFontFamily] = useState<ReaderFont>('serif');
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [maxWidth, setMaxWidth] = useState<string>('760px');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Audio / Text-To-Speech & Solfeggio 432Hz State
  const [isAudioOpen, setIsAudioOpen] = useState<boolean>(false);
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);

  // Solfeggio Web Audio Generator
  const [isSolfeggioActive, setIsSolfeggioActive] = useState<boolean>(false);
  const [solfeggioFreq, setSolfeggioFreq] = useState<number>(432);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Scroll and reading progress
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const chapters = selectedBook.chapters[currentLang] || selectedBook.chapters.es;
  const currentChapter: ChapterData = chapters[currentChapterIndex] || chapters[0];

  // Restore preferences from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('gc_reader_theme') as ReaderTheme;
    if (savedTheme) setTheme(savedTheme);
    const savedFont = localStorage.getItem('gc_reader_font') as ReaderFont;
    if (savedFont) setFontFamily(savedFont);
    const savedSize = localStorage.getItem('gc_reader_size');
    if (savedSize) setFontSize(Number(savedSize));
  }, []);

  // Populate SpeechSynthesis Voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices.length) return;
      setAvailableVoices(allVoices);

      // Auto-select best matching voice for current language
      const langPrefix = currentLang === 'es' ? 'es' : 'en';
      const naturalVoice = allVoices.find(
        (v) => v.lang.toLowerCase().startsWith(langPrefix) && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha') || v.name.includes('Jorge'))
      ) || allVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

      if (naturalVoice) {
        setSelectedVoiceURI(naturalVoice.voiceURI);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [currentLang]);

  // Clean up speech and solfeggio on unmount or chapter change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopSolfeggio();
    };
  }, [currentChapterIndex, selectedBook, currentLang]);

  // Web Audio 432 Hz Solfeggio Generator
  const startSolfeggio = (freq = solfeggioFreq) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Gentle soothing master volume
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
      setIsSolfeggioActive(true);
    } catch (e) {
      console.warn('Web Audio Solfeggio not supported or user gesture required', e);
    }
  };

  const stopSolfeggio = () => {
    if (gainRef.current && audioCtxRef.current) {
      try {
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1);
        setTimeout(() => {
          if (oscRef.current) {
            oscRef.current.stop();
            oscRef.current.disconnect();
            oscRef.current = null;
          }
        }, 1000);
      } catch (e) {
        if (oscRef.current) oscRef.current.stop();
      }
    }
    setIsSolfeggioActive(false);
  };

  const toggleSolfeggio = () => {
    if (isSolfeggioActive) {
      stopSolfeggio();
    } else {
      startSolfeggio(solfeggioFreq);
    }
  };

  // Text-To-Speech Playback Engine
  const startAudiobook = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Tu navegador no soporta Web Speech API para audiolibros.');
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    const rawText = currentChapter.content;
    const paragraphs = rawText
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith('#') && !p.startsWith('---'));

    if (!paragraphs.length) return;

    let pIdx = activeParagraphIndex ?? 0;
    if (pIdx >= paragraphs.length) pIdx = 0;

    const playNextParagraph = (index: number) => {
      if (index >= paragraphs.length) {
        setSpeechState('idle');
        setActiveParagraphIndex(null);
        return;
      }

      setActiveParagraphIndex(index);

      // Clean markdown tags for natural spoken voice
      const cleanPara = paragraphs[index]
        .replace(/[#*`_>]/g, '')
        .replace(/—/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanPara);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;

      if (selectedVoiceURI) {
        const v = availableVoices.find((x) => x.voiceURI === selectedVoiceURI);
        if (v) utterance.voice = v;
      }

      utterance.onend = () => {
        playNextParagraph(index + 1);
      };

      utterance.onerror = (err) => {
        console.warn('TTS Utterance Error:', err);
        setSpeechState('idle');
      };

      window.speechSynthesis.speak(utterance);
    };

    setSpeechState('playing');
    playNextParagraph(pIdx);

    // Also start gentle Solfeggio if enabled
    if (isSolfeggioActive) {
      startSolfeggio();
    }
  };

  const pauseAudiobook = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setSpeechState('paused');
    }
  };

  const resumeAudiobook = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setSpeechState('playing');
    }
  };

  const stopAudiobook = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeechState('idle');
      setActiveParagraphIndex(null);
    }
  };

  // Update theme in localStorage
  const handleThemeChange = (newTheme: ReaderTheme) => {
    setTheme(newTheme);
    localStorage.setItem('gc_reader_theme', newTheme);
  };

  const handleFontChange = (newFont: ReaderFont) => {
    setFontFamily(newFont);
    localStorage.setItem('gc_reader_font', newFont);
  };

  const handleSizeChange = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(32, Math.max(14, prev + delta));
      localStorage.setItem('gc_reader_size', String(next));
      return next;
    });
  };

  // Handle Scroll Progress
  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollHeight <= clientHeight) {
      setScrollProgress(100);
      return;
    }
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(Math.min(100, Math.max(0, Math.round(progress))));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentChapterIndex < chapters.length - 1) {
        goToChapter(currentChapterIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
        goToChapter(currentChapterIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, chapters.length]);

  // Chapter switch helper
  const goToChapter = (index: number) => {
    stopAudiobook();
    setCurrentChapterIndex(index);
    setIsTocOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Theme Styles Configuration
  const themeStyles = {
    dark: {
      bg: '#0f111a',
      contentBg: '#131622',
      text: '#e2e8f0',
      muted: '#8b9bb4',
      border: 'rgba(255, 255, 255, 0.08)',
      headerBg: '#090a10',
      accent: '#c084fc',
      activeHighlight: 'rgba(192, 132, 252, 0.12)',
    },
    sepia: {
      bg: '#f4ecd8',
      contentBg: '#fbf0d9',
      text: '#433422',
      muted: '#7d6b53',
      border: '#e3d4b6',
      headerBg: '#ebdcc0',
      accent: '#965b25',
      activeHighlight: 'rgba(150, 91, 37, 0.15)',
    },
    light: {
      bg: '#f8fafc',
      contentBg: '#ffffff',
      text: '#1e293b',
      muted: '#64748b',
      border: '#e2e8f0',
      headerBg: '#f1f5f9',
      accent: '#7c3aed',
      activeHighlight: 'rgba(124, 58, 237, 0.10)',
    },
    cosmic: {
      bg: '#05060b',
      contentBg: '#080a14',
      text: '#e0e7ff',
      muted: '#7986ac',
      border: 'rgba(99, 102, 241, 0.2)',
      headerBg: '#030407',
      accent: '#38bdf8',
      activeHighlight: 'rgba(56, 189, 248, 0.15)',
    },
  };

  const activeTheme = themeStyles[theme];

  // Font family mappings
  const fontStyles = {
    serif: '"Merriweather", "Georgia", "Baskerville", "Palatino", serif',
    sans: '"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
  };

  // Render Markdown Chapter Content with active paragraph highlighting
  const renderChapterContent = (markdownText: string) => {
    const rawParagraphs = markdownText.split('\n\n');
    let validParaCount = 0;

    return rawParagraphs.map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Handle Titles and Headings
      if (trimmed.startsWith('# ')) {
        return (
          <h1
            key={idx}
            style={{
              fontSize: `${fontSize * 1.8}px`,
              fontWeight: 900,
              color: activeTheme.accent,
              marginTop: '0.8em',
              marginBottom: '0.4em',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              borderBottom: `1px solid ${activeTheme.border}`,
              paddingBottom: '0.4em',
            }}
          >
            {trimmed.replace('# ', '')}
          </h1>
        );
      }

      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            style={{
              fontSize: `${fontSize * 1.35}px`,
              fontWeight: 700,
              color: activeTheme.text,
              marginTop: '1.2em',
              marginBottom: '0.5em',
            }}
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '2rem 0',
              color: activeTheme.accent,
              opacity: 0.6,
            }}
          >
            ✦ ✦ ✦
          </div>
        );
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            style={{
              fontSize: `${fontSize * 1.15}px`,
              fontWeight: 600,
              color: activeTheme.muted,
              marginTop: '1em',
              marginBottom: '0.4em',
            }}
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('>')) {
        return (
          <blockquote
            key={idx}
            style={{
              borderLeft: `4px solid ${activeTheme.accent}`,
              paddingLeft: '1.2rem',
              margin: '1.2rem 0',
              fontStyle: 'italic',
              color: activeTheme.muted,
              background: theme === 'dark' || theme === 'cosmic' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              padding: '0.8rem 1.2rem',
              borderRadius: '0 8px 8px 0',
            }}
          >
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      // Dialogues with em-dashes
      const isDialogue = trimmed.startsWith('—') || trimmed.startsWith('-');
      const thisParaIdx = validParaCount++;
      const isCurrentSpoken = activeParagraphIndex === thisParaIdx;

      return (
        <p
          key={idx}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            marginBottom: '1.2em',
            textIndent: isDialogue ? '0' : '1.5em',
            color: activeTheme.text,
            textAlign: 'justify',
            hyphens: 'auto',
            background: isCurrentSpoken ? activeTheme.activeHighlight : 'transparent',
            borderRadius: '6px',
            padding: isCurrentSpoken ? '4px 8px' : '0',
            transition: 'background 0.3s ease',
            borderLeft: isCurrentSpoken ? `3px solid ${activeTheme.accent}` : 'none',
          }}
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '100vh' : '88vh',
        background: activeTheme.bg,
        color: activeTheme.text,
        fontFamily: fontStyles[fontFamily],
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* 1. TOP PROGRESS BAR */}
      <div
        style={{
          height: '3px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, ${activeTheme.accent}, #38bdf8)`,
            transition: 'width 0.15s ease-out',
          }}
        />
      </div>

      {/* 2. READER NAVIGATION TOOLBAR */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.5rem',
          background: activeTheme.headerBg,
          borderBottom: `1px solid ${activeTheme.border}`,
          zIndex: 40,
        }}
      >
        {/* Left: Back & Book Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              style={{
                background: 'none',
                border: 'none',
                color: activeTheme.muted,
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Volver a GoalWorld Portal"
            >
              ◀ Portal
            </button>
          )}

          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>📑 Índice</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
              ({currentChapterIndex + 1}/{chapters.length})
            </span>
          </button>

          {/* Book Switcher */}
          <select
            value={selectedBook.id}
            onChange={(e) => {
              const b = THE_NEURAL_WARS_BOOKS.find((x) => x.id === e.target.value);
              if (b) {
                setSelectedBook(b);
                setCurrentChapterIndex(0);
                stopAudiobook();
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '220px',
            }}
          >
            {THE_NEURAL_WARS_BOOKS.map((b) => (
              <option key={b.id} value={b.id} style={{ background: '#1e293b', color: '#fff' }}>
                {b.title[currentLang] || b.title.es}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Audiobook, Language, Typography, Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* AUDIOBOOK BUTTON */}
          <button
            onClick={() => setIsAudioOpen(!isAudioOpen)}
            style={{
              background: isAudioOpen || speechState === 'playing' ? 'rgba(192, 132, 252, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: isAudioOpen || speechState === 'playing' ? `1px solid ${activeTheme.accent}` : `1px solid ${activeTheme.border}`,
              color: isAudioOpen || speechState === 'playing' ? activeTheme.accent : activeTheme.text,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Escuchar Audiolibro / Solfeggio 432 Hz"
          >
            <span>🎧</span>
            <span>{speechState === 'playing' ? 'Narrando...' : 'Audiolibro'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => {
              setCurrentLang((prev) => (prev === 'es' ? 'en' : 'es'));
              stopAudiobook();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}
            title="Alternar Idioma (Español / English)"
          >
            {currentLang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
          </button>

          {/* Font & Appearance Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
            title="Ajustes de Tipografía y Tema"
          >
            Aa
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
            }}
            title="Pantalla Completa"
          >
            {isFullscreen ? '⤦ Salir' : '⤢ Zen'}
          </button>
        </div>
      </header>

      {/* 3. AUDIOBOOK & SOLFEGGIO DOCK PANEL */}
      {isAudioOpen && (
        <div
          style={{
            background: activeTheme.headerBg,
            borderBottom: `1px solid ${activeTheme.border}`,
            padding: '0.75rem 1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 35,
          }}
        >
          {/* Controls: Play, Pause, Resume, Stop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {speechState === 'idle' && (
              <button
                onClick={startAudiobook}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
                }}
              >
                ▶ Iniciar Narración
              </button>
            )}

            {speechState === 'playing' && (
              <button
                onClick={pauseAudiobook}
                style={{
                  background: 'rgba(245, 158, 11, 0.25)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                ⏸ Pausar
              </button>
            )}

            {speechState === 'paused' && (
              <button
                onClick={resumeAudiobook}
                style={{
                  background: 'rgba(34, 197, 94, 0.25)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                ▶ Reanudar
              </button>
            )}

            {speechState !== 'idle' && (
              <button
                onClick={stopAudiobook}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                ⏹ Detener
              </button>
            )}

            {/* Equalizer Visualizer */}
            {speechState === 'playing' && (
              <div style={{ color: activeTheme.accent, fontSize: '0.85rem', letterSpacing: '2px', marginLeft: '6px' }}>
                 ▂▃▅▆▇
              </div>
            )}
          </div>

          {/* Voice & Speed Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Voice Dropdown */}
            {availableVoices.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: activeTheme.muted }}>Voz:</span>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => {
                    setSelectedVoiceURI(e.target.value);
                    if (speechState === 'playing') {
                      stopAudiobook();
                      setTimeout(startAudiobook, 200);
                    }
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${activeTheme.border}`,
                    color: activeTheme.text,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    maxWidth: '180px',
                  }}
                >
                  {availableVoices
                    .filter((v) => v.lang.toLowerCase().startsWith(currentLang === 'es' ? 'es' : 'en'))
                    .map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} style={{ background: '#0f172a', color: '#fff' }}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Speed Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: activeTheme.muted }}>Velocidad:</span>
              {[0.8, 1.0, 1.2, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setSpeechRate(rate);
                    if (speechState === 'playing') {
                      stopAudiobook();
                      setTimeout(startAudiobook, 200);
                    }
                  }}
                  style={{
                    background: speechRate === rate ? activeTheme.accent : 'rgba(255, 255, 255, 0.06)',
                    color: speechRate === rate ? '#fff' : activeTheme.text,
                    border: `1px solid ${activeTheme.border}`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* 432 Hz Solfeggio Meditation Drone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: `1px solid ${activeTheme.border}`, paddingLeft: '12px' }}>
              <button
                onClick={toggleSolfeggio}
                style={{
                  background: isSolfeggioActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  border: isSolfeggioActive ? '1px solid #38bdf8' : `1px solid ${activeTheme.border}`,
                  color: isSolfeggioActive ? '#38bdf8' : activeTheme.muted,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
                title="Generador de Frecuencia Solfeggio 432 Hz / 528 Hz"
              >
                🌊 {isSolfeggioActive ? '432 Hz Drone Activo' : 'Frecuencia 432 Hz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SETTINGS MODAL / POPUP */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            top: '55px',
            right: '20px',
            background: activeTheme.headerBg,
            border: `1px solid ${activeTheme.border}`,
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 50,
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Themes */}
          <div>
            <div style={{ fontSize: '0.75rem', color: activeTheme.muted, marginBottom: '6px', fontWeight: 700 }}>
              TEMA VISUAL
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'dark', label: 'Dark', bg: '#0f111a', border: '#fff' },
                { id: 'sepia', label: 'Sepia', bg: '#fbf0d9', border: '#965b25' },
                { id: 'light', label: 'Claro', bg: '#ffffff', border: '#7c3aed' },
                { id: 'cosmic', label: 'Cósmico', bg: '#080a14', border: '#38bdf8' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id as ReaderTheme)}
                  style={{
                    background: t.bg,
                    border: theme === t.id ? `2px solid ${t.border}` : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    padding: '8px 4px',
                    color: t.id === 'sepia' || t.id === 'light' ? '#000' : '#fff',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <div style={{ fontSize: '0.75rem', color: activeTheme.muted, marginBottom: '6px', fontWeight: 700 }}>
              TIPOGRAFÍA
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { id: 'serif', label: 'Serif' },
                { id: 'sans', label: 'Sans' },
                { id: 'mono', label: 'Mono' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFontChange(f.id as ReaderFont)}
                  style={{
                    background: fontFamily === f.id ? activeTheme.accent : 'rgba(255,255,255,0.06)',
                    color: fontFamily === f.id ? '#fff' : activeTheme.text,
                    border: `1px solid ${activeTheme.border}`,
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Line Height */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: activeTheme.muted, fontWeight: 700 }}>TAMAÑO</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleSizeChange(-1)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: activeTheme.text,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  A-
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                  {fontSize}
                </span>
                <button
                  onClick={() => handleSizeChange(1)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: activeTheme.text,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TABLE OF CONTENTS DRAWER */}
      {isTocOpen && (
        <div
          style={{
            position: 'absolute',
            top: '55px',
            left: 0,
            bottom: 0,
            width: '320px',
            background: activeTheme.headerBg,
            borderRight: `1px solid ${activeTheme.border}`,
            zIndex: 45,
            overflowY: 'auto',
            padding: '1.25rem',
            boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: activeTheme.accent }}>
              Tabla de Contenidos
            </h3>
            <button
              onClick={() => setIsTocOpen(false)}
              style={{ background: 'none', border: 'none', color: activeTheme.muted, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {chapters.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => goToChapter(idx)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: currentChapterIndex === idx ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
                  borderLeft: currentChapterIndex === idx ? `3px solid ${activeTheme.accent}` : '3px solid transparent',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: currentChapterIndex === idx ? 700 : 500 }}>
                  {ch.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: activeTheme.muted, marginTop: '2px' }}>
                  {ch.readTime} • {ch.wordCount} palabras
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MAIN READING CONTAINER */}
      <main
        ref={contentRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem 1.5rem 4rem',
          display: 'flex',
          justifyContent: 'center',
          background: activeTheme.contentBg,
        }}
      >
        <article
          style={{
            width: '100%',
            maxWidth: maxWidth,
            padding: '0 0.5rem',
          }}
        >
          {/* Chapter Metadata Header */}
          <div style={{ marginBottom: '2rem', textAlign: 'center', color: activeTheme.muted, fontSize: '0.85rem' }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: activeTheme.accent, marginBottom: '4px' }}>
              {selectedBook.title[currentLang] || selectedBook.title.es}
            </div>
            <div>
              {currentChapter.readTime} de lectura • {currentChapter.wordCount} palabras
            </div>
          </div>

          {/* Render Chapter Body */}
          {renderChapterContent(currentChapter.content)}

          {/* Chapter End Navigation Buttons */}
          <div
            style={{
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: `1px solid ${activeTheme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            {currentChapterIndex > 0 ? (
              <button
                onClick={() => goToChapter(currentChapterIndex - 1)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${activeTheme.border}`,
                  color: activeTheme.text,
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                ◀ Capítulo Anterior
              </button>
            ) : <div />}

            {currentChapterIndex < chapters.length - 1 ? (
              <button
                onClick={() => goToChapter(currentChapterIndex + 1)}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                }}
              >
                Siguiente Capítulo ▶
              </button>
            ) : (
              <div style={{ color: activeTheme.accent, fontWeight: 700, fontSize: '0.9rem' }}>
                🎉 ¡Fin de este Libro!
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
