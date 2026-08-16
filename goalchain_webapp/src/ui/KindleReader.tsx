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
  const [lineHeight, setLineHeight] = useState<number>(1.85);
  const [maxWidth, setMaxWidth] = useState<string>('760px');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Audio / Text-To-Speech State
  const [isAudioOpen, setIsAudioOpen] = useState<boolean>(false);
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [ttsEngine, setTtsEngine] = useState<'browser' | 'ai'>('ai');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState<boolean>(false);

  // Solfeggio Web Audio Generator
  const [isSolfeggioActive, setIsSolfeggioActive] = useState<boolean>(false);
  const [solfeggioFreq, setSolfeggioFreq] = useState<number>(432);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Active audio elements for AI speech
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const isCanceledRef = useRef<boolean>(false);

  // Scroll and reading progress
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const chapters = selectedBook.chapters[currentLang] || selectedBook.chapters.es;
  const currentChapter: ChapterData = chapters[currentChapterIndex] || chapters[0];

  // Restore preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('gc_reader_theme') as ReaderTheme;
    if (savedTheme) setTheme(savedTheme);
    const savedFont = localStorage.getItem('gc_reader_font') as ReaderFont;
    if (savedFont) setFontFamily(savedFont);
    const savedSize = localStorage.getItem('gc_reader_size');
    if (savedSize) setFontSize(Number(savedSize));
  }, []);

  // Dynamically load Puter.js if available
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Populate SpeechSynthesis Voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices.length) return;
      setAvailableVoices(allVoices);

      const langPrefix = currentLang === 'es' ? 'es' : 'en';
      const naturalVoice = allVoices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) &&
          (v.name.includes('Natural') ||
            v.name.includes('Online') ||
            v.name.includes('Neural') ||
            v.name.includes('Google') ||
            v.name.includes('Microsoft') ||
            v.name.includes('Samantha') ||
            v.name.includes('Jorge') ||
            v.name.includes('Monica'))
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
      stopAudiobook();
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

  // Audiobook Playback Engine (AI HD Neural Voices or Browser Engine)
  const startAudiobook = () => {
    isCanceledRef.current = false;
    const rawText = currentChapter.content;
    const paragraphs = rawText
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith('#') && !p.startsWith('---'));

    if (!paragraphs.length) return;

    let pIdx = activeParagraphIndex ?? 0;
    if (pIdx >= paragraphs.length) pIdx = 0;

    // AI Neural Engine playback via Puter or high-grade fallback
    const playWithAI = async (index: number) => {
      if (isCanceledRef.current || index >= paragraphs.length) {
        setSpeechState('idle');
        setActiveParagraphIndex(null);
        setIsTtsLoading(false);
        return;
      }

      setActiveParagraphIndex(index);
      const cleanPara = paragraphs[index]
        .replace(/[#*`_>]/g, '')
        .replace(/—/g, ' ')
        .trim();

      const puterObj = (window as any).puter;
      if (puterObj && puterObj.ai && puterObj.ai.txt2speech && ttsEngine === 'ai') {
        try {
          setIsTtsLoading(true);
          const voiceModel = currentLang === 'es' ? 'es-ES-AlvaroNeural' : 'en-US-JennyNeural';
          const audio = await puterObj.ai.txt2speech(cleanPara, {
            provider: 'aws-polly',
            voice: currentLang === 'es' ? 'Lucia' : 'Joanna',
          });

          setIsTtsLoading(false);
          if (isCanceledRef.current) return;

          currentAudioElementRef.current = audio;
          audio.playbackRate = speechRate;
          audio.onended = () => {
            if (!isCanceledRef.current) {
              playWithAI(index + 1);
            }
          };
          audio.onerror = () => {
            // Fallback to browser TTS if cloud stream fails
            playWithBrowser(index);
          };
          audio.play();
          setSpeechState('playing');
          return;
        } catch (e) {
          console.warn('AI TTS failed, falling back to Browser Neural TTS:', e);
          setIsTtsLoading(false);
        }
      }

      // Browser Fallback
      playWithBrowser(index);
    };

    // Native Browser TTS fallback
    const playWithBrowser = (index: number) => {
      if (isCanceledRef.current || index >= paragraphs.length) {
        setSpeechState('idle');
        setActiveParagraphIndex(null);
        return;
      }

      setActiveParagraphIndex(index);
      const cleanPara = paragraphs[index]
        .replace(/[#*`_>]/g, '')
        .replace(/—/g, ' ')
        .trim();

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanPara);
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;

        if (selectedVoiceURI) {
          const v = availableVoices.find((x) => x.voiceURI === selectedVoiceURI);
          if (v) utterance.voice = v;
        }

        utterance.onend = () => {
          if (!isCanceledRef.current) {
            playWithBrowser(index + 1);
          }
        };

        utterance.onerror = () => {
          setSpeechState('idle');
        };

        window.speechSynthesis.speak(utterance);
        setSpeechState('playing');
      }
    };

    setSpeechState('playing');
    if (ttsEngine === 'ai') {
      playWithAI(pIdx);
    } else {
      playWithBrowser(pIdx);
    }

    if (isSolfeggioActive) {
      startSolfeggio();
    }
  };

  const pauseAudiobook = () => {
    if (currentAudioElementRef.current && !currentAudioElementRef.current.paused) {
      currentAudioElementRef.current.pause();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setSpeechState('paused');
  };

  const resumeAudiobook = () => {
    if (currentAudioElementRef.current && currentAudioElementRef.current.paused) {
      currentAudioElementRef.current.play();
    } else if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      startAudiobook();
    }
    setSpeechState('playing');
  };

  const stopAudiobook = () => {
    isCanceledRef.current = true;
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current.currentTime = 0;
      currentAudioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeechState('idle');
    setActiveParagraphIndex(null);
    setIsTtsLoading(false);
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
      bg: '#0a0a10',
      contentBg: '#0f111a',
      text: '#f1f5f9',
      muted: '#94a3b8',
      border: 'rgba(255, 255, 255, 0.08)',
      headerBg: 'rgba(15, 17, 26, 0.95)',
      accent: '#a855f7',
      accentGlow: 'rgba(168, 85, 247, 0.35)',
      activeHighlight: 'rgba(168, 85, 247, 0.14)',
      panelBg: 'rgba(15, 17, 26, 0.98)',
    },
    sepia: {
      bg: '#fbf0d9',
      contentBg: '#f6ebd2',
      text: '#3b2f20',
      muted: '#7a6552',
      border: 'rgba(150, 91, 37, 0.15)',
      headerBg: 'rgba(246, 235, 210, 0.98)',
      accent: '#965b25',
      accentGlow: 'rgba(150, 91, 37, 0.3)',
      activeHighlight: 'rgba(150, 91, 37, 0.12)',
      panelBg: 'rgba(246, 235, 210, 0.98)',
    },
    light: {
      bg: '#f8fafc',
      contentBg: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      border: 'rgba(0, 0, 0, 0.08)',
      headerBg: 'rgba(248, 250, 252, 0.98)',
      accent: '#6366f1',
      accentGlow: 'rgba(99, 102, 241, 0.3)',
      activeHighlight: 'rgba(99, 102, 241, 0.08)',
      panelBg: 'rgba(255, 255, 255, 0.98)',
    },
    cosmic: {
      bg: '#05060b',
      contentBg: '#090a14',
      text: '#ede9fe',
      muted: '#a78bfa',
      border: 'rgba(168, 85, 247, 0.25)',
      headerBg: 'rgba(10, 11, 22, 0.98)',
      accent: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.4)',
      activeHighlight: 'rgba(56, 189, 248, 0.15)',
      panelBg: 'rgba(10, 11, 22, 0.98)',
    },
  };

  const activeTheme = themeStyles[theme];

  const fontStyles = {
    serif: '"Merriweather", "Georgia", "Baskerville", serif',
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", monospace',
  };

  // Render Markdown Chapter Content with active paragraph highlighting
  const renderChapterContent = (markdownText: string) => {
    const rawParagraphs = markdownText.split('\n\n');
    let validParaCount = 0;

    return rawParagraphs.map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('# ')) {
        return (
          <h1
            key={idx}
            style={{
              fontSize: `${fontSize * 1.8}px`,
              fontWeight: 900,
              color: activeTheme.accent,
              marginTop: '1em',
              marginBottom: '0.4em',
              lineHeight: 1.25,
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
              marginTop: '1.4em',
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
              margin: '2.5rem 0',
              color: activeTheme.accent,
              opacity: 0.6,
              letterSpacing: '8px',
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
              paddingLeft: '1.25rem',
              margin: '1.4rem 0',
              fontStyle: 'italic',
              color: activeTheme.muted,
              background: theme === 'dark' || theme === 'cosmic' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              padding: '1rem 1.4rem',
              borderRadius: '0 10px 10px 0',
            }}
          >
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      const isDialogue = trimmed.startsWith('—') || trimmed.startsWith('-');
      const thisParaIdx = validParaCount++;
      const isCurrentSpoken = activeParagraphIndex === thisParaIdx;

      return (
        <p
          key={idx}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            marginBottom: '1.3em',
            textIndent: isDialogue ? '0' : '1.8em',
            color: activeTheme.text,
            textAlign: 'justify',
            hyphens: 'auto',
            background: isCurrentSpoken ? activeTheme.activeHighlight : 'transparent',
            borderRadius: '8px',
            padding: isCurrentSpoken ? '8px 12px' : '0',
            transition: 'background 0.3s ease, border-left 0.3s ease',
            borderLeft: isCurrentSpoken ? `4px solid ${activeTheme.accent}` : '4px solid transparent',
            boxShadow: isCurrentSpoken ? `0 0 20px ${activeTheme.accentGlow}` : 'none',
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
          zIndex: 45,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, ${activeTheme.accent}, #38bdf8)`,
            boxShadow: `0 0 10px ${activeTheme.accentGlow}`,
            transition: 'width 0.15s ease-out',
          }}
        />
      </div>

      {/* 2. REFINED HEADER TOOLBAR */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.8rem 1.5rem',
          background: activeTheme.headerBg,
          borderBottom: `1px solid ${activeTheme.border}`,
          backdropFilter: 'blur(16px)',
          zIndex: 40,
        }}
      >
        {/* Left: Navigation & Book Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${activeTheme.border}`,
                color: activeTheme.muted,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              title="Volver a GoalWorld Portal"
            >
              ◀ Portal
            </button>
          )}

          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            style={{
              background: isTocOpen ? activeTheme.accentGlow : 'rgba(255, 255, 255, 0.05)',
              border: isTocOpen ? `1px solid ${activeTheme.accent}` : `1px solid ${activeTheme.border}`,
              color: isTocOpen ? activeTheme.accent : activeTheme.text,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>📑 Capítulos</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>
              ({currentChapterIndex + 1}/{chapters.length})
            </span>
          </button>

          {/* Book Dropdown */}
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '240px',
            }}
          >
            {THE_NEURAL_WARS_BOOKS.map((b) => (
              <option key={b.id} value={b.id} style={{ background: '#0f172a', color: '#fff' }}>
                {b.title[currentLang] || b.title.es}
              </option>
            ))}
          </select>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* AUDIOBOOK TOGGLE */}
          <button
            onClick={() => setIsAudioOpen(!isAudioOpen)}
            style={{
              background: isAudioOpen || speechState === 'playing' ? activeTheme.accent : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isAudioOpen || speechState === 'playing' ? activeTheme.accent : activeTheme.border}`,
              color: isAudioOpen || speechState === 'playing' ? '#fff' : activeTheme.text,
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isAudioOpen || speechState === 'playing' ? `0 0 15px ${activeTheme.accentGlow}` : 'none',
              transition: 'all 0.2s',
            }}
            title="Escuchar Audiolibro / Solfeggio 432 Hz"
          >
            <span>🎧</span>
            <span>{speechState === 'playing' ? 'Narrando...' : 'Audiolibro'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => {
              setCurrentLang((prev) => (prev === 'es' ? 'en' : 'es'));
              stopAudiobook();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 800,
              transition: 'all 0.2s',
            }}
            title="Alternar Idioma (Español / English)"
          >
            {currentLang === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}
          </button>

          {/* Settings & Appearance */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? activeTheme.accentGlow : 'rgba(255, 255, 255, 0.05)',
              border: showSettings ? `1px solid ${activeTheme.accent}` : `1px solid ${activeTheme.border}`,
              color: showSettings ? activeTheme.accent : activeTheme.text,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 800,
              transition: 'all 0.2s',
            }}
            title="Tipografía, Tamaño y Temas"
          >
            Aa
          </button>

          {/* Zen Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeTheme.border}`,
              color: activeTheme.text,
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            title="Modo Lectura Zen"
          >
            {isFullscreen ? '⤦ Salir' : '⤢ Zen'}
          </button>
        </div>
      </header>

      {/* 3. PREMIUM AUDIOBOOK & SOLFEGGIO CONTROLS DOCK */}
      {isAudioOpen && (
        <div
          style={{
            background: activeTheme.panelBg,
            borderBottom: `1px solid ${activeTheme.border}`,
            padding: '0.85rem 1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 35,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Play, Pause, Resume, Stop Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {speechState === 'idle' && (
              <button
                onClick={startAudiobook}
                disabled={isTtsLoading}
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: '24px',
                  cursor: isTtsLoading ? 'wait' : 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {isTtsLoading ? '⏳ Sintetizando Voz...' : '▶ Iniciar Narración'}
              </button>
            )}

            {speechState === 'playing' && (
              <button
                onClick={pauseAudiobook}
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  color: '#f59e0b',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ⏸ Pausar
              </button>
            )}

            {speechState === 'paused' && (
              <button
                onClick={resumeAudiobook}
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                ▶ Reanudar
              </button>
            )}

            {/* Always visible Stop Button whenever not idle */}
            {speechState !== 'idle' && (
              <button
                onClick={stopAudiobook}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
                title="Detener Narración por Completo"
              >
                ⏹ Detener
              </button>
            )}

            {speechState === 'playing' && (
              <div style={{ color: activeTheme.accent, fontSize: '0.9rem', letterSpacing: '3px', marginLeft: '8px' }}>
                 ▂▃▅▆▇
              </div>
            )}
          </div>

          {/* Engine, Voice, Speed, and Solfeggio Controls */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Voice Engine Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', overflow: 'hidden', border: `1px solid ${activeTheme.border}` }}>
              <button
                onClick={() => {
                  stopAudiobook();
                  setTtsEngine('ai');
                }}
                style={{
                  background: ttsEngine === 'ai' ? activeTheme.accent : 'transparent',
                  color: ttsEngine === 'ai' ? '#fff' : activeTheme.muted,
                  border: 'none',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Voces Neuronales HD Realistas (ElevenLabs / AWS Cloud)"
              >
                ✨ Voces IA HD
              </button>
              <button
                onClick={() => {
                  stopAudiobook();
                  setTtsEngine('browser');
                }}
                style={{
                  background: ttsEngine === 'browser' ? activeTheme.accent : 'transparent',
                  color: ttsEngine === 'browser' ? '#fff' : activeTheme.muted,
                  border: 'none',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Voz Nativa de Navegador (Offline)"
              >
                💻 Navegador
              </button>
            </div>

            {/* Voice Dropdown for Browser Engine */}
            {ttsEngine === 'browser' && availableVoices.length > 0 && (
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
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${activeTheme.border}`,
                    color: activeTheme.text,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    maxWidth: '170px',
                  }}
                >
                  {availableVoices
                    .filter((v) => v.lang.toLowerCase().startsWith(currentLang === 'es' ? 'es' : 'en'))
                    .map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI} style={{ background: '#0f172a', color: '#fff' }}>
                        {v.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Speed Multiplier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: activeTheme.muted }}>Velocidad:</span>
              {[0.8, 1.0, 1.2, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setSpeechRate(rate);
                    if (currentAudioElementRef.current) {
                      currentAudioElementRef.current.playbackRate = rate;
                    }
                  }}
                  style={{
                    background: speechRate === rate ? activeTheme.accent : 'rgba(255, 255, 255, 0.05)',
                    color: speechRate === rate ? '#fff' : activeTheme.text,
                    border: `1px solid ${activeTheme.border}`,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* 432 Hz Solfeggio Meditation Drone */}
            <button
              onClick={toggleSolfeggio}
              style={{
                background: isSolfeggioActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isSolfeggioActive ? '1px solid #38bdf8' : `1px solid ${activeTheme.border}`,
                color: isSolfeggioActive ? '#38bdf8' : activeTheme.muted,
                padding: '4px 12px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isSolfeggioActive ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
              }}
              title="Activar Fondo Armónico Solfeggio 432 Hz (Ondas Theta)"
            >
              <span>🌊</span>
              <span>{isSolfeggioActive ? '432 Hz Drone Activo' : 'Solfeggio 432 Hz'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. SETTINGS MODAL / POPUP */}
      {showSettings && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            background: activeTheme.panelBg,
            border: `1px solid ${activeTheme.border}`,
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            zIndex: 50,
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Themes */}
          <div>
            <div style={{ fontSize: '0.75rem', color: activeTheme.muted, marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🎨 TEMA VISUAL
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'dark', label: 'Dark', bg: '#0a0a10', border: '#a855f7' },
                { id: 'sepia', label: 'Sepia', bg: '#fbf0d9', border: '#965b25' },
                { id: 'light', label: 'Claro', bg: '#ffffff', border: '#6366f1' },
                { id: 'cosmic', label: 'Cósmico', bg: '#090a14', border: '#38bdf8' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id as ReaderTheme)}
                  style={{
                    background: t.bg,
                    border: theme === t.id ? `2px solid ${t.border}` : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '10px 4px',
                    color: t.id === 'sepia' || t.id === 'light' ? '#000' : '#fff',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <div style={{ fontSize: '0.75rem', color: activeTheme.muted, marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🖋️ TIPOGRAFÍA
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
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: activeTheme.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TAMAÑO DE FUENTE
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => handleSizeChange(-1)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: activeTheme.text,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  A-
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, minWidth: '28px', textAlign: 'center' }}>
                  {fontSize}px
                </span>
                <button
                  onClick={() => handleSizeChange(1)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: activeTheme.text,
                    padding: '6px 12px',
                    borderRadius: '6px',
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
            top: '58px',
            left: 0,
            bottom: 0,
            width: '340px',
            background: activeTheme.panelBg,
            borderRight: `1px solid ${activeTheme.border}`,
            zIndex: 45,
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '15px 0 40px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: activeTheme.accent }}>
              Tabla de Contenidos
            </h3>
            <button
              onClick={() => setIsTocOpen(false)}
              style={{ background: 'none', border: 'none', color: activeTheme.muted, cursor: 'pointer', fontSize: '1.1rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {chapters.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => goToChapter(idx)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: currentChapterIndex === idx ? activeTheme.activeHighlight : 'transparent',
                  borderLeft: currentChapterIndex === idx ? `4px solid ${activeTheme.accent}` : '4px solid transparent',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: currentChapterIndex === idx ? 800 : 500, color: currentChapterIndex === idx ? activeTheme.accent : activeTheme.text }}>
                  {ch.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: activeTheme.muted, marginTop: '3px' }}>
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
          padding: '2.5rem 1.5rem 5rem',
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
          <div style={{ marginBottom: '2.5rem', textAlign: 'center', color: activeTheme.muted, fontSize: '0.88rem' }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: activeTheme.accent, marginBottom: '6px' }}>
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
              marginTop: '4.5rem',
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
                  padding: '12px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  transition: 'all 0.2s',
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
                  padding: '12px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                  transition: 'all 0.2s',
                }}
              >
                Siguiente Capítulo ▶
              </button>
            ) : (
              <div style={{ color: activeTheme.accent, fontWeight: 800, fontSize: '0.95rem' }}>
                🎉 ¡Fin de este Libro!
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
