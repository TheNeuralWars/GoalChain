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
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Reader Customization Preferences
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [fontFamily, setFontFamily] = useState<ReaderFont>('serif');
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [maxWidth, setMaxWidth] = useState<string>('760px');
  const [showSettings, setShowSettings] = useState<boolean>(false);

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
        setCurrentChapterIndex((prev) => prev + 1);
        if (contentRef.current) contentRef.current.scrollTop = 0;
      } else if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
        setCurrentChapterIndex((prev) => prev - 1);
        if (contentRef.current) contentRef.current.scrollTop = 0;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChapterIndex, chapters.length]);

  // Chapter switch helper
  const goToChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setIsTocOpen(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  // Theme Styling definitions
  const themeStyles: Record<
    ReaderTheme,
    { bg: string; text: string; headerBg: string; border: string; accent: string; muted: string }
  > = {
    dark: {
      bg: '#0a0a0f',
      text: '#e2e8f0',
      headerBg: 'rgba(15, 15, 25, 0.95)',
      border: 'rgba(255, 255, 255, 0.08)',
      accent: '#818cf8',
      muted: '#94a3b8',
    },
    sepia: {
      bg: '#fbf0d9',
      text: '#3b2f20',
      headerBg: 'rgba(244, 230, 203, 0.98)',
      border: 'rgba(80, 60, 40, 0.12)',
      accent: '#9a5824',
      muted: '#7a6552',
    },
    light: {
      bg: '#ffffff',
      text: '#1e293b',
      headerBg: 'rgba(248, 250, 252, 0.98)',
      border: 'rgba(0, 0, 0, 0.08)',
      accent: '#4f46e5',
      muted: '#64748b',
    },
    cosmic: {
      bg: '#0d0b1a',
      text: '#ede9fe',
      headerBg: 'rgba(22, 18, 42, 0.98)',
      border: 'rgba(168, 85, 247, 0.2)',
      accent: '#c084fc',
      muted: '#a78bfa',
    },
  };

  const activeTheme = themeStyles[theme];

  const getFontFamilyCss = () => {
    switch (fontFamily) {
      case 'serif':
        return '"Merriweather", "Georgia", "Cambria", serif';
      case 'mono':
        return '"JetBrains Mono", "Fira Code", "Consolas", monospace';
      case 'sans':
      default:
        return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
  };

  // Format markdown content into clean HTML paragraphs
  const renderFormattedContent = (rawMarkdown: string) => {
    const lines = rawMarkdown.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: '1.2em' }} />;

      if (trimmed.startsWith('# ')) {
        return (
          <h1
            key={idx}
            style={{
              fontSize: `${fontSize * 1.6}px`,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: activeTheme.accent,
              marginTop: '1.5em',
              marginBottom: '0.8em',
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
              fontSize: `${fontSize * 1.3}px`,
              fontWeight: 700,
              color: activeTheme.text,
              marginTop: '1.2em',
              marginBottom: '0.6em',
            }}
          >
            {trimmed.replace('## ', '')}
          </h2>
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

      if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
        return (
          <div
            key={idx}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: `${fontSize * 0.9}px`,
              background: 'rgba(0,0,0,0.25)',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.accent,
              margin: '0.8rem 0',
              letterSpacing: '0.05em',
            }}
          >
            {trimmed.replace(/`/g, '')}
          </div>
        );
      }

      // Dialogues with em-dashes
      const isDialogue = trimmed.startsWith('—') || trimmed.startsWith('-');

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
        background: activeTheme.bg,
        color: activeTheme.text,
        minHeight: '100vh',
        fontFamily: getFontFamilyCss(),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: activeTheme.headerBg,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${activeTheme.border}`,
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Left: Back button & Book Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              style={{
                background: 'transparent',
                border: `1px solid ${activeTheme.border}`,
                color: activeTheme.text,
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
              title="Volver a GoalWorld"
            >
              ← Portal
            </button>
          )}

          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            style={{
              background: 'transparent',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.accent,
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            ☰ {currentLang === 'es' ? 'Capítulos' : 'Contents'} ({currentChapterIndex + 1}/{chapters.length})
          </button>

          {/* Book Switcher Dropdown */}
          <select
            value={selectedBook.id}
            onChange={(e) => {
              const book = THE_NEURAL_WARS_BOOKS.find((b) => b.id === e.target.value);
              if (book) {
                setSelectedBook(book);
                setCurrentChapterIndex(0);
                if (contentRef.current) contentRef.current.scrollTop = 0;
              }
            }}
            style={{
              background: 'transparent',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              maxWidth: '220px',
            }}
          >
            {THE_NEURAL_WARS_BOOKS.map((b) => (
              <option key={b.id} value={b.id} style={{ background: activeTheme.bg, color: activeTheme.text }}>
                {b.title[currentLang]}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Title and VIP Pass Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
            title="Suscripción Premium GoalWorld Activa — Todos los libros desbloqueados"
          >
            <span>★ VIP PASS ACTIVO</span>
          </div>

          {/* Language Switcher */}
          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${activeTheme.border}` }}>
            <button
              onClick={() => setCurrentLang('es')}
              style={{
                background: currentLang === 'es' ? activeTheme.accent : 'transparent',
                color: currentLang === 'es' ? '#ffffff' : activeTheme.muted,
                border: 'none',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🇪🇸 ES
            </button>
            <button
              onClick={() => setCurrentLang('en')}
              style={{
                background: currentLang === 'en' ? activeTheme.accent : 'transparent',
                color: currentLang === 'en' ? '#ffffff' : activeTheme.muted,
                border: 'none',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🇺🇸 EN
            </button>
          </div>
        </div>

        {/* Right: Controls & Settings Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Ambient 432 Hz Sound Toggle */}
          <button
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            style={{
              background: isPlayingAudio ? activeTheme.accent : 'transparent',
              color: isPlayingAudio ? '#ffffff' : activeTheme.text,
              border: `1px solid ${activeTheme.border}`,
              padding: '0.4rem 0.7rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            title="Sintonizar frecuencia armónica 432 Hz"
          >
            {isPlayingAudio ? '🔊 432 Hz' : '🔇 Audio'}
          </button>

          {/* Font Resizer Quick Buttons */}
          <button
            onClick={() => handleSizeChange(-1)}
            style={{
              background: 'transparent',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
            title="Reducir fuente"
          >
            A-
          </button>
          <button
            onClick={() => handleSizeChange(1)}
            style={{
              background: 'transparent',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
            title="Aumentar fuente"
          >
            A+
          </button>

          {/* Settings Menu Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? activeTheme.accent : 'transparent',
              color: showSettings ? '#ffffff' : activeTheme.text,
              border: `1px solid ${activeTheme.border}`,
              padding: '0.4rem 0.7rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            title="Ajustes de Lectura Kindle"
          >
            ⚙ Aa
          </button>
        </div>
      </header>

      {/* Settings Drawer Modal */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            right: '20px',
            zIndex: 50,
            background: activeTheme.headerBg,
            border: `1px solid ${activeTheme.border}`,
            borderRadius: '12px',
            padding: '1.2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            width: '320px',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: activeTheme.accent }}>Ajustes de Lectura</h4>
            <button
              onClick={() => setShowSettings(false)}
              style={{ background: 'transparent', border: 'none', color: activeTheme.muted, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Theme Palette */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: activeTheme.muted, display: 'block', marginBottom: '0.4rem' }}>
              Tema Visual
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {(['dark', 'sepia', 'light', 'cosmic'] as ReaderTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  style={{
                    background: themeStyles[t].bg,
                    color: themeStyles[t].text,
                    border: theme === t ? `2px solid ${activeTheme.accent}` : `1px solid ${themeStyles[t].border}`,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: activeTheme.muted, display: 'block', marginBottom: '0.4rem' }}>
              Tipografía
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['serif', 'sans', 'mono'] as ReaderFont[]).map((f) => (
                <button
                  key={f}
                  onClick={() => handleFontChange(f)}
                  style={{
                    background: 'transparent',
                    color: fontFamily === f ? activeTheme.accent : activeTheme.text,
                    border: fontFamily === f ? `2px solid ${activeTheme.accent}` : `1px solid ${activeTheme.border}`,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Page Width */}
          <div>
            <label style={{ fontSize: '0.8rem', color: activeTheme.muted, display: 'block', marginBottom: '0.4rem' }}>
              Ancho del Margen
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { label: 'Estrecho', val: '640px' },
                { label: 'Normal', val: '760px' },
                { label: 'Amplio', val: '920px' },
              ].map((m) => (
                <button
                  key={m.val}
                  onClick={() => setMaxWidth(m.val)}
                  style={{
                    background: 'transparent',
                    color: maxWidth === m.val ? activeTheme.accent : activeTheme.text,
                    border: maxWidth === m.val ? `2px solid ${activeTheme.accent}` : `1px solid ${activeTheme.border}`,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table of Contents (TOC) Sidebar Drawer */}
      {isTocOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '340px',
            maxWidth: '85vw',
            background: activeTheme.headerBg,
            zIndex: 60,
            borderRight: `1px solid ${activeTheme.border}`,
            boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              padding: '1.2rem',
              borderBottom: `1px solid ${activeTheme.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: activeTheme.accent }}>Índice de Capítulos</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: activeTheme.muted }}>
                {selectedBook.title[currentLang]}
              </p>
            </div>
            <button
              onClick={() => setIsTocOpen(false)}
              style={{ background: 'transparent', border: 'none', color: activeTheme.muted, cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => goToChapter(idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: currentChapterIndex === idx ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                  border: currentChapterIndex === idx ? `1px solid ${activeTheme.accent}` : 'none',
                  borderBottom: `1px solid ${activeTheme.border}`,
                  color: currentChapterIndex === idx ? activeTheme.accent : activeTheme.text,
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '0.3rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: currentChapterIndex === idx ? 700 : 500 }}>
                    {ch.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: activeTheme.muted, marginTop: '0.2rem' }}>
                    {ch.wordCount} palabras • {ch.readTime}
                  </div>
                </div>
                {currentChapterIndex === idx && <span style={{ color: activeTheme.accent }}>●</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Reading Container */}
      <main
        ref={contentRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem 1.5rem 5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <article style={{ width: '100%', maxWidth: maxWidth }}>
          {/* Chapter Meta Header */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2.5rem',
              paddingBottom: '1.5rem',
              borderBottom: `1px solid ${activeTheme.border}`,
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: activeTheme.accent,
                fontWeight: 700,
              }}
            >
              {selectedBook.title[currentLang]} • {currentLang === 'es' ? 'Capítulo' : 'Chapter'} {currentChapterIndex + 1} de {chapters.length}
            </span>
            <div style={{ fontSize: '0.85rem', color: activeTheme.muted, marginTop: '0.4rem' }}>
              ⏱ {currentChapter.readTime} de lectura • {currentChapter.wordCount} palabras
            </div>
          </div>

          {/* Formatted Chapter Body */}
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {renderFormattedContent(currentChapter.content)}
          </div>

          {/* Chapter Navigation Footer */}
          <nav
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
            <button
              onClick={() => goToChapter(currentChapterIndex - 1)}
              disabled={currentChapterIndex === 0}
              style={{
                background: 'transparent',
                border: `1px solid ${activeTheme.border}`,
                color: currentChapterIndex === 0 ? activeTheme.muted : activeTheme.text,
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                cursor: currentChapterIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentChapterIndex === 0 ? 0.4 : 1,
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              ← {currentLang === 'es' ? 'Capítulo Anterior' : 'Previous Chapter'}
            </button>

            <span style={{ fontSize: '0.85rem', color: activeTheme.muted }}>
              {currentChapterIndex + 1} / {chapters.length}
            </span>

            <button
              onClick={() => goToChapter(currentChapterIndex + 1)}
              disabled={currentChapterIndex >= chapters.length - 1}
              style={{
                background: currentChapterIndex >= chapters.length - 1 ? 'transparent' : activeTheme.accent,
                border: 'none',
                color: currentChapterIndex >= chapters.length - 1 ? activeTheme.muted : '#ffffff',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                cursor: currentChapterIndex >= chapters.length - 1 ? 'not-allowed' : 'pointer',
                opacity: currentChapterIndex >= chapters.length - 1 ? 0.4 : 1,
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {currentLang === 'es' ? 'Siguiente Capítulo' : 'Next Chapter'} →
            </button>
          </nav>
        </article>
      </main>

      {/* Bottom Fixed Reading Progress Bar */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: activeTheme.headerBg,
          borderTop: `1px solid ${activeTheme.border}`,
          padding: '0.4rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: activeTheme.muted,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div>
          <span>{currentChapter.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '200px' }}>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${scrollProgress}%`,
                height: '100%',
                background: activeTheme.accent,
                transition: 'width 0.1s linear',
              }}
            />
          </div>
          <span style={{ minWidth: '35px', textAlign: 'right' }}>{scrollProgress}%</span>
        </div>
      </footer>
    </div>
  );
}
