import React, { useState, useEffect, useRef } from 'react';
export function AICoach() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'system', text: '🤖 GoalChain Tactical IA Coach Eliza v2.0 initialized.' },
        { id: 2, sender: 'coach', text: '⚽ ¡Hola Manager! Soy Eliza, tu asesora táctica de GoalChain. Estoy lista para optimizar el rendimiento y maximizar el yield de tu plantilla. ¿En qué puedo ayudarte hoy?' }
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
    const chatEndRef = useRef(null);
    // Load API key on mount
    useEffect(() => {
        const saved = localStorage.getItem('goalchain_gemini_api_key');
        if (saved)
            setApiKey(saved);
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
            alert('🔑 API Key guardada localmente.');
        }
        else {
            localStorage.removeItem('goalchain_gemini_api_key');
            alert('🔑 API Key eliminada.');
        }
        setShowSettings(false);
    };
    // Generate Advisories based on tacticalState
    const advisories = [];
    if (tacticalState.stamina < 80) {
        advisories.push({
            type: 'warning',
            icon: '⚡',
            title: 'Penalización por fatiga',
            desc: `Estamina al ${tacticalState.stamina}%. Tu yield diario de $GCH sufre una penalización del ${Math.round((1 - (tacticalState.stamina / 100)) * 100)}%. Te sugiero usar una poción por 10 $GCH.`
        });
    }
    else {
        advisories.push({
            type: 'success',
            icon: '🔋',
            title: 'Estamina excelente',
            desc: `Estamina al ${tacticalState.stamina}%. Coeficiente de rendimiento al 100% de efectividad.`
        });
    }
    if (tacticalState.sameCountryCount < 11) {
        advisories.push({
            type: 'info',
            icon: '🇺🇳',
            title: 'Sinergia de País Incompleta',
            desc: `Tienes ${tacticalState.sameCountryCount}/11 jugadores de la misma nacionalidad. Alinea más para escalar el multiplicador de estadísticas hasta +25%.`
        });
    }
    if (tacticalState.sameClubCount < 11) {
        advisories.push({
            type: 'info',
            icon: '🛡️',
            title: 'Sinergia de Club Incompleta',
            desc: `Tienes ${tacticalState.sameClubCount}/11 jugadores del mismo club. Añade 11 del mismo club para desbloquear el +15% de yield de $GCH diario.`
        });
    }
    // Handle Chat Submit
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!inputVal.trim())
            return;
        const userText = inputVal.trim();
        setInputVal('');
        const newId = Date.now();
        setMessages(prev => [...prev, { id: newId, sender: 'user', text: userText }]);
        setLoading(true);
        const systemPrompt = `Eres Eliza, la Coach Táctica de Inteligencia Artificial de GoalChain. Analizas la alineación y das consejos para maximizar yield y stats.
Datos actuales del manager:
- Jugador: ${tacticalState.player} (${tacticalState.stats})
- Stamina: ${tacticalState.stamina}%
- Liga activa: ${tacticalState.league}
- Camiseta: ${tacticalState.jersey}
- Sinergia País: ${tacticalState.sameCountryCount}/11, Sinergia Club: ${tacticalState.sameClubCount}/11
- Estadio: ${tacticalState.stadium}
- Balance: ${tacticalState.balance} $GCH
Responde en español de forma extremadamente concisa (1-3 oraciones), con emojis de fútbol, motivadora y ofreciendo soluciones numéricas claras de mejora táctica.`;
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
                    reply = data.candidates[0].content.parts[0].text.trim();
                }
            }
            catch (e) {
                console.error("Local Gemini Pro error, falling back:", e);
            }
        }
        // 2. Try Local API backend proxy
        if (!reply) {
            try {
                const backendRes = await fetch('http://localhost:3001/api/coach/chat', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        context: {
                            pName: tacticalState.player,
                            pStats: tacticalState.stats,
                            activeLeague: tacticalState.league,
                            stamina: tacticalState.stamina,
                            jersey: tacticalState.jersey,
                            sameCountry: tacticalState.sameCountryCount,
                            sameClub: tacticalState.sameClubCount,
                            stadium: tacticalState.stadium,
                            balance: tacticalState.balance
                        },
                        userText
                    })
                });
                if (backendRes.ok) {
                    const data = await backendRes.json();
                    if (data.reply)
                        reply = data.reply;
                }
            }
            catch (e) {
                console.error("Backend Chat proxy error, falling back to heuristics:", e);
            }
        }
        // 3. Fallback Heuristics
        if (!reply) {
            const q = userText.toLowerCase();
            if (q.includes('stamina') || q.includes('energia') || q.includes('cansado') || q.includes('fatiga')) {
                reply = `🏃‍♂️ ¡Tu jugador ${tacticalState.player} está fatigado al ${tacticalState.stamina}%! Compra una poción restauradora en el vestuario por 10 $GCH para eliminar la penalización del yield.`;
            }
            else if (q.includes('sinergia') || q.includes('club') || q.includes('pais') || q.includes('quimica')) {
                reply = `🏆 Sinergia de Club al ${tacticalState.sameClubCount}/11 y País al ${tacticalState.sameCountryCount}/11. ¡Alinea 11 del mismo club para conseguir +15% de yield y 11 del mismo país para +25% de stats!`;
            }
            else if (q.includes('yield') || q.includes('sueldo') || q.includes('ganar') || q.includes('gch')) {
                reply = `📈 Para maximizar tu yield: 1) Mantén estamina > 90%, 2) Equipa camiseta de selección, 3) Busca Sinergia de Club completa (11 del mismo club para +15%). ¡La stamina actual de ${tacticalState.stamina}% te está costando ganancias!`;
            }
            else {
                reply = `🏟️ Analizando tu plantilla de GoalChain... Te sugiero mantener la estamina al máximo y alinear jugadores del mismo Club para activar los multiplicadores de sueldo (+15% $GCH/día). ¿Tienes alguna pregunta táctica en mente?`;
            }
        }
        setMessages(prev => [...prev, { id: Date.now(), sender: 'coach', text: reply }]);
        setLoading(false);
    };
    const handleBetbotToggle = () => {
        const next = !betbotActive;
        setBetbotActive(next);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: 'system',
                text: next ? '🟢 Rainmaker Betbot ACTIVADO. Analizando mercados WC2026...' : '🔴 Rainmaker Betbot DESACTIVADO.'
            }
        ]);
    };
    const handleOptimizerToggle = () => {
        const next = !optimizerActive;
        setOptimizerActive(next);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                sender: 'system',
                text: next ? '🟢 Auto-Manager Optimizer ACTIVADO. Monitoreando roster y stamina...' : '🔴 Auto-Manager Optimizer DESACTIVADO.'
            }
        ]);
    };
    return (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
      
      {/* Columna Izquierda: IA Coach Chat */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 800 }}>🤖 IA Coach Chat (Eliza)</h3>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Asistencia Táctica & Optimización en vivo</span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '6px', fontSize: '0.7rem', color: '#fff', cursor: 'pointer' }}>
            ⚙️ API Key
          </button>
        </div>

        {showSettings && (<div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', display: 'block', marginBottom: '6px' }}>Configure su Gemini API Key (Opcional)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIzaSy..." style={{ flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '0.75rem', outline: 'none' }}/>
              <button onClick={saveApiKey} style={{ background: 'var(--primary-neon)', border: 'none', color: '#000', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}>
                Guardar
              </button>
            </div>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', display: 'block', marginTop: '6px' }}>
              Los datos se guardan estrictamente en tu localStorage. Si no configuras una key, se utilizará el proxy del servidor o el asesor offline.
            </span>
          </div>)}

        {/* Chat Window */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          {messages.map(msg => (<div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.sender === 'user' ? 'var(--primary-neon)' : msg.sender === 'coach' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                color: msg.sender === 'user' ? '#000' : '#e2e8f0',
                border: msg.sender === 'coach' ? '1px solid rgba(153,69,255,0.2)' : msg.sender === 'system' ? '1px solid rgba(255,255,255,0.03)' : 'none',
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '0.8rem',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap'
            }}>
              {msg.sender === 'coach' && <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--secondary-neon)', marginBottom: '3px' }}>ELIZA</div>}
              {msg.sender === 'system' && <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', marginBottom: '3px' }}>SISTEMA</div>}
              {msg.text}
            </div>))}
          {loading && (<div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(153,69,255,0.1)', padding: '10px 14px', borderRadius: '16px 16px 16px 2px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Eliza está pensando... 💡
            </div>)}
          <div ref={chatEndRef}/>
        </div>

        {/* Input Form */}
        <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="Pregúntale algo a tu Coach táctico..." style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}/>
          <button type="submit" className="btn-neon-green" style={{ padding: '0 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>
            Enviar
          </button>
        </form>
      </div>

      {/* Columna Derecha: Advisories & Rainmaker AI Match Predictor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Advisories Tácticos */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '0.92rem', fontWeight: 800 }}>⚡ Sugerencias Tácticas del Asesor</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {advisories.map((adv, idx) => {
            const borderCol = adv.type === 'success' ? 'rgba(20,241,149,0.3)' : adv.type === 'warning' ? 'rgba(255,77,106,0.3)' : 'rgba(153,69,255,0.3)';
            const badgeBg = adv.type === 'success' ? 'rgba(20,241,149,0.03)' : adv.type === 'warning' ? 'rgba(255,77,106,0.03)' : 'rgba(153,69,255,0.03)';
            const titleCol = adv.type === 'success' ? 'var(--primary-neon)' : adv.type === 'warning' ? '#ff4d6a' : 'var(--secondary-neon)';
            return (<div key={idx} style={{ background: badgeBg, border: `1px solid ${borderCol}`, borderRadius: '10px', padding: '10px', fontSize: '0.75rem', lineHeight: '1.3' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: titleCol, marginBottom: '4px' }}>
                    <span>{adv.icon}</span>
                    <span>{adv.title}</span>
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{adv.desc}</div>
                </div>);
        })}
          </div>
        </div>

        {/* Rainmaker AI Predictor */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '0.92rem', fontWeight: 800 }}>🔮 Rainmaker AI WC2026</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Predictor de partidos & Apuestas en vivo</span>
            </div>
            <span className="simulation-badge">PYTH LIVE</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', display: 'block', marginBottom: '8px' }}>PROBABILIDADES IMPLÍCITAS DE GANAR</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
              <span>Argentina 🇦🇷</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>vs</span>
              <span>Francia 🇫🇷</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="stacked-bar-container" style={{ height: '14px', borderRadius: '7px', marginBottom: '10px' }}>
              <div style={{ width: `${matchProb.home}%`, backgroundColor: 'var(--primary-neon)', height: '100%' }}/>
              <div style={{ width: `${matchProb.draw}%`, backgroundColor: '#ffcc00', height: '100%' }}/>
              <div style={{ width: `${matchProb.away}%`, backgroundColor: '#f97316', height: '100%' }}/>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <span style={{ color: 'var(--primary-neon)', fontWeight: 'bold' }}>LOCAL: {matchProb.home}%</span>
              <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>EMPATE: {matchProb.draw}%</span>
              <span style={{ color: '#f97316', fontWeight: 'bold' }}>VISITANTE: {matchProb.away}%</span>
            </div>
          </div>

          {/* Predictor Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={handleBetbotToggle} className={betbotActive ? 'btn-neon-green' : 'btn-outline-green'} style={{ padding: '10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
              {betbotActive ? '🤖 BETBOT ACTIVO' : '🤖 INICIAR BETBOT'}
            </button>
            <button onClick={handleOptimizerToggle} className={optimizerActive ? 'btn-neon-green' : 'btn-outline-green'} style={{ padding: '10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>
              {optimizerActive ? '⚙️ AUTO-MANAGER ON' : '⚙️ INICIAR AUTO-MANAGER'}
            </button>
          </div>
        </div>

      </div>

    </div>);
}
