import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/index';

interface Advisory {
  type: 'success' | 'warning' | 'info';
  icon: string;
  title: string;
  desc: string;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'coach' | 'system';
  text: string;
}

export function AICoach() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'system', text: t('ai_coach_initialized') },
    { id: 2, sender: 'coach', text: t('ai_coach_welcome') }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  // Gemini API Key
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Agent states
  const [betbotActive, setBetbotActive] = useState(false);
  const [optimizerActive, setOptimizerActive] = useState(false);

  // Rainmaker AI Match Predictor states
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [matchProb, setMatchProb] = useState({ home: 74, draw: 12, away: 14 });

  // Mock tactical state from stadium/locker
  const [tacticalState, setTacticalState] = useState({
    player: 'Lionel Satoshi (Genesis #001)',
    stats: 'ATK: 95 | DEF: 48 | SPD: 92 | HYP: 99',
    stamina: 74,
    league: 'world_cup',
    jersey: 'Ninguna',
    sameCountryCount: 5,
    sameClubCount: 4,
    stadium: 'Desert Oasis',
    balance: 2340.50
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load API key on mount
  useEffect(() => {
    const saved = localStorage.getItem('goalchain_gemini_api_key');
    if (saved) setApiKey(saved);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate Pyth/Drift feed drift for Rainmaker AI WC2026
  useEffect(() => {
    const interval = setInterval(() => {
      if (betbotActive) {
        const drift = Math.floor(Math.random() * 5) - 2;
        setMatchProb(prev => {
          const newHome = Math.min(90, Math.max(30, prev.home + drift));
          const newAway = Math.max(5, 100 - newHome - prev.draw);
          return { ...prev, home: newHome, away: newAway };
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [betbotActive]);

  // Save API Key
  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('goalchain_gemini_api_key', apiKey.trim());
      alert(t('ai_coach_api_key_saved'));
    } else {
      localStorage.removeItem('goalchain_gemini_api_key');
      alert(t('ai_coach_api_key_removed'));
    }
    setShowSettings(false);
  };

  // Generate Advisories based on tacticalState
  const advisories: Advisory[] = [];
  if (tacticalState.stamina < 80) {
    advisories.push({
      type: 'warning',
      icon: '⚡',
      title: t('ai_coach_fatigue_penalty_title'),
      desc: t('ai_coach_fatigue_penalty_desc', { stamina: tacticalState.stamina, penalty: Math.round((1 - (tacticalState.stamina / 100)) * 100) })
    });
  } else {
    advisories.push({
      type: 'success',
      icon: '🔋',
      title: t('ai_coach_excellent_stamina_title'),
      desc: t('ai_coach_excellent_stamina_desc', { stamina: tacticalState.stamina })
    });
  }

  if (tacticalState.sameCountryCount < 11) {
    advisories.push({
      type: 'info',
      icon: '🇺🇳',
      title: t('ai_coach_incomplete_country_synergy_title'),
      desc: t('ai_coach_incomplete_country_synergy_desc', { count: tacticalState.sameCountryCount })
    });
  }

  if (tacticalState.sameClubCount < 11) {
    advisories.push({
      type: 'info',
      icon: '🛡️',
      title: t('ai_coach_incomplete_club_synergy_title'),
      desc: t('ai_coach_incomplete_club_synergy_desc', { count: tacticalState.sameClubCount })
    });
  }

  // Handle Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');
    const newId = Date.now();

    setMessages(prev => [...prev, { id: newId, sender: 'user', text: userText }]);
    setLoading(true);

    const systemPrompt = t('ai_coach_system_prompt', {
      player: tacticalState.player,
      stats: tacticalState.stats,
      stamina: tacticalState.stamina,
      league: tacticalState.league,
      jersey: tacticalState.jersey,
      sameCountryCount: tacticalState.sameCountryCount,
      sameClubCount: tacticalState.sameClubCount,
      stadium: tacticalState.stadium,
      balance: tacticalState.balance
    });

    let reply = '';

    // 1. Try saved local Gemini API Key
    const localKey = localStorage.getItem('goalchain_gemini_api_key');
    if (localKey) {
      try {
        const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${localKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + `\nPregunta del manager: "${userText}"` }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 150 }
          })
        });
        const data = await apiRes.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = data.candidates[0].content.parts[0].text;
        } else {
          reply = t('ai_coach_error_response');
        }
      } catch {
        reply = t('ai_coach_error_response');
      }
    } else {
      // Fallback to mock response
      reply = t('ai_coach_mock_response', { userText });
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'coach', text: reply }]);
    setLoading(false);
  };

  // Toggle Betbot
  const handleBetbotToggle = () => {
    setBetbotActive(!betbotActive);
    if (!betbotActive) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: t('ai_coach_betbot_activated') }]);
    } else {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: t('ai_coach_betbot_deactivated') }]);
    }
  };

  // Toggle Optimizer
  const handleOptimizerToggle = () => {
    setOptimizerActive(!optimizerActive);
    if (!optimizerActive) {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: t('ai_coach_optimizer_activated') }]);
    } else {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: t('ai_coach_optimizer_deactivated') }]);
    }
  };

  return (
    <div className="ai-coach-container">
      {/* Chat Interface */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{t('ai_coach_title')}</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            {showSettings ? '✕' : '⚙️'}
          </button>
        </div>

        {/* API Key Settings */}
        {showSettings && (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem' }}>{t('ai_coach_api_settings')}</h4>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('ai_coach_api_key_placeholder')}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', marginBottom: '8px' }}
            />
            <button
              onClick={saveApiKey}
              className="btn-neon-green"
              style={{ padding: '6px 12px', fontSize: '0.7rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              {t('ai_coach_save_api_key')}
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', marginBottom: '10px', maxHeight: '400px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '10px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              <div style={{ display: 'inline-block', padding: '8px 12px', borderRadius: '12px', background: msg.sender === 'user' ? 'var(--primary-neon)' : msg.sender === 'coach' ? 'rgba(153,69,255,0.2)' : 'rgba(20,241,149,0.2)', color: msg.sender === 'user' ? '#000' : '#fff', maxWidth: '80%', fontSize: '0.8rem' }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t('ai_coach_chat_placeholder')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff' }}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-neon-green"
            style={{ padding: '0 16px', borderRadius: '8px', cursor: 'pointer' }}
            disabled={loading}
          >
            {loading ? '...' : t('ai_coach_send')}
          </button>
        </form>
      </div>

      {/* Tactical Advisories and Rainmaker AI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Advisories Tácticos */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '0.92rem', fontWeight: 800 }}>{t('ai_coach_tactical_advisories')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {advisories.map((adv, idx) => {
              const borderCol = adv.type === 'success' ? 'rgba(20,241,149,0.3)' : adv.type === 'warning' ? 'rgba(255,77,106,0.3)' : 'rgba(153,69,255,0.3)';
              const badgeBg = adv.type === 'success' ? 'rgba(20,241,149,0.03)' : adv.type === 'warning' ? 'rgba(255,77,106,0.03)' : 'rgba(153,69,255,0.03)';
              const titleCol = adv.type === 'success' ? 'var(--primary-neon)' : adv.type === 'warning' ? '#ff4d6a' : 'var(--secondary-neon)';
              
              return (
                <div key={idx} style={{ background: badgeBg, border: `1px solid ${borderCol}`, borderRadius: '10px', padding: '10px', fontSize: '0.75rem', lineHeight: '1.3' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: titleCol, marginBottom: '4px' }}>
                    <span>{adv.icon}</span>
                    <span>{adv.title}</span>
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{adv.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rainmaker AI Predictor */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '0.92rem', fontWeight: 800 }}>{t('ai_coach_rainmaker_title')}</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{t('ai_coach_rainmaker_subtitle')}</span>
            </div>
            <span className="simulation-badge">PYTH LIVE</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>{t('ai_coach_implied_probabilities')}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
              <span>Argentina 🇦🇷</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>vs</span>
              <span>Francia 🇫🇷</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="stacked-bar-container" style={{ height: '14px', borderRadius: '7px', marginBottom: '10px' }}>
              <div style={{ width: `${matchProb.home}%`, backgroundColor: 'var(--primary-neon)', height: '100%' }} />
              <div style={{ width: `${matchProb.draw}%`, backgroundColor: '#ffcc00', height: '100%' }} />
              <div style={{ width: `${matchProb.away}%`, backgroundColor: '#f97316', height: '100%' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>{t('ai_coach_home_prob', { prob: matchProb.home })}</span>
              <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{t('ai_coach_draw_prob', { prob: matchProb.draw })}</span>
              <span style={{ color: '#f97316', fontWeight: 'bold' }}>{t('ai_coach_away_prob', { prob: matchProb.away })}</span>
            </div>
          </div>

          {/* Predictor Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              onClick={handleBetbotToggle} 
              className={betbotActive ? 'btn-neon-green' : 'btn-outline-green'}
              style={{ padding: '10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
            >
              {betbotActive ? t('ai_coach_betbot_active') : t('ai_coach_start_betbot')}
            </button>
            <button 
              onClick={handleOptimizerToggle} 
              className={optimizerActive ? 'btn-neon-green' : 'btn-outline-green'}
              style={{ padding: '10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
            >
              {optimizerActive ? t('ai_coach_auto_manager_on') : t('ai_coach_start_auto_manager')}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}