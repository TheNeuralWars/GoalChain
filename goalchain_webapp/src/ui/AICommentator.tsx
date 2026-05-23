import React, { useState, useEffect, useRef } from 'react';

interface CommentaryItem {
    id: number;
    text: string;
    time: string;
}

export const AICommentator: React.FC = () => {
    const wsUrl = (import.meta as any).env?.VITE_STREAMING_WS_URL as string | undefined;
    const wsEnabled = Boolean(wsUrl);
    const [loadingPhase, setLoadingPhase] = useState<'downloading' | 'compiling' | 'active'>('downloading');
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [commentaryHistory, setCommentaryHistory] = useState<CommentaryItem[]>([]);
    
    // WebSocket Streaming Bridge state
    const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [broadcastCount, setBroadcastCount] = useState<number>(0);
    const wsRef = useRef<WebSocket | null>(null);

    // Simular el proceso de descarga y compilación
    useEffect(() => {
        if (loadingPhase === 'downloading') {
            const interval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setLoadingPhase('compiling');
                        return 100;
                    }
                    const next = prev + Math.floor(Math.random() * 8) + 8;
                    return next > 100 ? 100 : next;
                });
            }, 120);
            return () => clearInterval(interval);
        } else if (loadingPhase === 'compiling') {
            const timeout = setTimeout(() => {
                setLoadingPhase('active');
            }, 1800);
            return () => clearTimeout(timeout);
        }
    }, [loadingPhase]);

    // WebSocket connection hook
    useEffect(() => {
        if (loadingPhase !== 'active') return;
        if (!wsEnabled || !wsUrl) {
            setWsStatus('disconnected');
            return;
        }

        let socket: WebSocket | null = null;
        let reconnectTimeout: any = null;

        const connect = () => {
            setWsStatus('connecting');
            socket = new WebSocket(wsUrl);
            wsRef.current = socket;

            socket.onopen = () => {
                console.log(`[Streaming Bridge] Connected to ${wsUrl}`);
                setWsStatus('connected');
            };

            socket.onclose = () => {
                console.log(`[Streaming Bridge] Disconnected from ${wsUrl}`);
                setWsStatus('disconnected');
                reconnectTimeout = setTimeout(connect, 5000);
            };

            socket.onerror = (err) => {
                console.error('[Streaming Bridge] WebSocket error:', err);
                socket?.close();
            };
        };

        connect();

        return () => {
            if (socket) {
                socket.onclose = null;
                socket.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [loadingPhase, wsEnabled, wsUrl]);

    // Broadcast message function
    const broadcastCommentary = (text: string, eventType: string, emotion: string, duration: number) => {
        if (!wsEnabled) return;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const payload = {
                type: 'commentary',
                timestamp: new Date().toISOString(),
                data: {
                    text,
                    event_type: eventType,
                    emotion,
                    mouth_intensity: eventType === 'GOAL' ? 1.0 : (eventType === 'BET' ? 0.75 : 0.5),
                    duration,
                    is_simulated: false
                }
            };
            wsRef.current.send(JSON.stringify(payload));
            setBroadcastCount(prev => prev + 1);
        }
    };

    // Cargar voces del SpeechSynthesis
    useEffect(() => {
        if (loadingPhase !== 'active') return;

        const updateVoices = () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
                
                const defaultVoice = availableVoices.find(voice => 
                    voice.lang.startsWith('es') || voice.lang.includes('ES')
                ) || availableVoices.find(voice =>
                    voice.lang.startsWith('en') || voice.lang.includes('EN')
                ) || availableVoices[0];

                if (defaultVoice && !selectedVoice) {
                    setSelectedVoice(defaultVoice.name);
                }
            }
        };

        updateVoices();
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }
    }, [loadingPhase, selectedVoice]);

    // Función para hablar
    const speak = (text: string) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        if (isMuted) return;

        const cleanText = text.replace(/🎙️|⚽|🔥|⚡|🎉|💸|📈|🔋|💼|⚖️|💎|🧩|🔔/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        if (selectedVoice) {
            const voiceObj = voices.find(v => v.name === selectedVoice);
            if (voiceObj) {
                utterance.voice = voiceObj;
            }
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // Mensaje de bienvenida al estar activo
    useEffect(() => {
        if (loadingPhase === 'active') {
            const welcomeMsg = "🎙️ ¡Enzo Bit conectado! Listo para narrar la acción de GoalChain World Cup 2026 en tiempo real.";
            speak(welcomeMsg);
            setCommentaryHistory([
                { id: Date.now(), text: welcomeMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
            ]);
            
            // Broadcast welcome message after socket establishes connection
            setTimeout(() => {
                broadcastCommentary(welcomeMsg, 'RESOLVE', 'analytical', 5.0);
            }, 1000);
        }
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [loadingPhase]);

    // Escuchar eventos globales del feed
    useEffect(() => {
        if (loadingPhase !== 'active') return;

        const handleEvent = (e: any) => {
            const eventData = e.detail;
            if (!eventData) return;

            const goalPhrases = [
                `⚽ ¡GOL! ¡GOL! ¡GOLAZO! Enzo Bit reporta: ${eventData.message}. ¡Los mercados predictivos están que arden!`,
                `🔥 ¡Se mueve el marcador! ${eventData.message}. ¡Los traders de GoalChain están enloqueciendo!`,
                `⚡ ¡Increíble definición! ${eventData.message}. ¡Los coeficientes de apuesta acaban de recalcularse al instante!`,
                `🎉 ¡GOL! ${eventData.message}. ¡El oráculo de Chainlink ya está validando la transacción en Solana!`
            ];
            
            const betPhrases = [
                `💸 ¡Apuesta detectada en el feed! ${eventData.message}. ¡La liquidez de este pool está creciendo exponencialmente!`,
                `📈 ¡Movimiento estratégico! ${eventData.message}. ¿Quién se llevará la victoria de yield?`,
                `🔋 ¡Nuevo stake en juego! ${eventData.message}. La tensión sube en la terminal transaccional.`,
                `💼 ¡Inyección de capital! ${eventData.message}. ¡El mercado de derivados perpetuos se está calentando!`
            ];
            
            const resolvePhrases = [
                `⚖️ ¡Oráculo ha resuelto! ${eventData.message}. ¡Se están liberando los fondos depositados!`,
                `💎 ¡Atención! ${eventData.message}. Los smart contracts distribuyen dividendos. ¡Felicitaciones a los ganadores!`,
                `🧩 ¡Resolución confirmada en la blockchain! ${eventData.message}. ¡Los spreads se han ajustado!`,
                `🔔 ¡Última hora! ${eventData.message}. ¡Todos los contratos perpetuos liquidados con éxito!`
            ];

            let pool = goalPhrases;
            let emotion = 'neutral';
            if (eventData.type === 'BET') {
                pool = betPhrases;
                emotion = 'happy';
            } else if (eventData.type === 'RESOLVE') {
                pool = resolvePhrases;
                emotion = 'analytical';
            } else if (eventData.type === 'GOAL') {
                pool = goalPhrases;
                emotion = 'excited';
            }

            const commentaryText = pool[Math.floor(Math.random() * pool.length)];
            
            speak(commentaryText);
            setCommentaryHistory(prev => [
                {
                    id: Date.now(),
                    text: commentaryText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                },
                ...prev.slice(0, 4)
            ]);

            // Broadcast to streaming bridge
            const duration = Math.max(3.5, commentaryText.length / 14);
            broadcastCommentary(commentaryText, eventData.type, emotion, duration);
        };

        window.addEventListener('goalchain-event', handleEvent);
        return () => {
            window.removeEventListener('goalchain-event', handleEvent);
        };
    }, [loadingPhase, isMuted, selectedVoice, voices]);


    if (loadingPhase === 'downloading') {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="pulse-dot" style={{ backgroundColor: 'var(--secondary-neon)', boxShadow: '0 0 10px var(--secondary-neon-glow)' }}></span>
                    Inicializando Comentarista AI
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                    Verificando caché local en IndexedDB y cargando pesos...
                </p>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '6px', fontFamily: 'monospace' }}>
                        <span>enzo-bit-v2.bin</span>
                        <span>{downloadProgress}% ({(downloadProgress * 0.482).toFixed(1)}MB / 48.2MB)</span>
                    </div>
                    <div className="progress-container">
                        <div className="progress-bar-fill" style={{ width: `${downloadProgress}%` }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (loadingPhase === 'compiling') {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '135px' }}>
                <div className="pulse-dot" style={{ width: '12px', height: '12px', backgroundColor: 'var(--primary-neon)', boxShadow: '0 0 15px var(--primary-neon-glow)', marginBottom: '8px' }}></div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>
                    Compilando red neuronal en WebGPU...
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textAlign: 'center', fontFamily: 'monospace' }}>
                    Asignando ejecución de tensores locales en Web Worker
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card AICommentator" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header / Config controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#ffffff'
                }}>
                    <span className="pulse-dot" style={{ backgroundColor: isSpeaking ? 'var(--primary-neon)' : 'var(--secondary-neon)', boxShadow: isSpeaking ? '0 0 10px var(--primary-neon-glow)' : '0 0 10px var(--secondary-neon-glow)' }}></span>
                    Enzo Bit (Comentarista AI)
                </h3>
                
                {/* Voice Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Streaming Bridge Badge */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: !wsEnabled
                            ? 'rgba(100, 116, 139, 0.12)'
                            : (wsStatus === 'connected' ? 'rgba(20, 241, 149, 0.1)' : (wsStatus === 'connecting' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(255, 75, 75, 0.1)')),
                        border: !wsEnabled
                            ? '1px solid rgba(100, 116, 139, 0.35)'
                            : (wsStatus === 'connected' ? '1px solid rgba(20, 241, 149, 0.3)' : (wsStatus === 'connecting' ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(255, 75, 75, 0.3)')),
                        color: !wsEnabled
                            ? '#94a3b8'
                            : (wsStatus === 'connected' ? 'var(--primary-neon)' : (wsStatus === 'connecting' ? '#eab308' : 'var(--accent-red)')),
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        <span className="pulse-dot" style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: !wsEnabled
                                ? '#94a3b8'
                                : (wsStatus === 'connected' ? 'var(--primary-neon)' : (wsStatus === 'connecting' ? '#eab308' : 'var(--accent-red)')),
                            boxShadow: wsStatus === 'connected' ? '0 0 8px var(--primary-neon-glow)' : 'none',
                            display: 'inline-block'
                        }}></span>
                        {!wsEnabled
                            ? 'BRIDGE DISABLED'
                            : (wsStatus === 'connected'
                                ? `🔴 LIVE CAST (${broadcastCount})`
                                : (wsStatus === 'connecting' ? 'CONNECTING...' : 'BRIDGE OFFLINE'))}
                    </div>

                    {voices.length > 0 && (
                        <select 
                            value={selectedVoice} 
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="form-select"
                            style={{ 
                                padding: '4px 8px', 
                                fontSize: '0.75rem', 
                                background: 'rgba(0, 0, 0, 0.4)', 
                                border: '1px solid rgba(255, 255, 255, 0.1)', 
                                color: '#f1f5f9',
                                borderRadius: '6px',
                                maxWidth: '140px',
                                outline: 'none'
                            }}
                        >
                            {voices.map(voice => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))}
                        </select>
                    )}

                    <button 
                        onClick={() => {
                            const newMute = !isMuted;
                            setIsMuted(newMute);
                            if (newMute) {
                                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                    window.speechSynthesis.cancel();
                                }
                                setIsSpeaking(false);
                            }
                        }}
                        style={{
                            background: isMuted ? 'rgba(255, 75, 75, 0.15)' : 'rgba(20, 241, 149, 0.15)',
                            border: isMuted ? '1px solid rgba(255, 75, 75, 0.3)' : '1px solid rgba(20, 241, 149, 0.3)',
                            color: isMuted ? 'var(--accent-red)' : 'var(--primary-neon)',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isMuted ? '🔇 Mutear' : '🔊 Hablar'}
                    </button>
                </div>
            </div>

            {/* Avatar & Main bubble */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* Robot Referee SVG Avatar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <svg width="75" height="75" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                        <defs>
                            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="var(--primary-neon)" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="var(--primary-neon)" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        
                        {/* Outer Glow behind the head when speaking */}
                        {isSpeaking && (
                            <circle cx="50" cy="50" r="40" fill="url(#glow)" />
                        )}

                        {/* Body (Striped Referee Collar/Jersey) */}
                        <path d="M 35 80 L 65 80 L 60 95 L 40 95 Z" fill="#1e1e2e" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                        
                        {/* Collar */}
                        <path d="M 30 80 Q 50 90 70 80 L 68 95 L 32 95 Z" fill="#0f0f16" />
                        
                        {/* Referee stripes */}
                        <rect x="42" y="83" width="4" height="12" fill="#ffffff" />
                        <rect x="54" y="83" width="4" height="12" fill="#ffffff" />
                        <rect x="36" y="85" width="2" height="10" fill="#ffffff" />
                        <rect x="62" y="85" width="2" height="10" fill="#ffffff" />
                        
                        {/* Whistle (hanging) */}
                        <path d="M 47 90 L 53 90 L 53 97 L 47 97 Z" fill="var(--secondary-neon)" />
                        <line x1="50" y1="80" x2="50" y2="90" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />

                        {/* Head Chassis */}
                        <rect x="25" y="25" width="50" height="45" rx="15" fill="#141424" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />
                        
                        {/* Ears/Bolts */}
                        <rect x="18" y="38" width="7" height="18" rx="2" fill="var(--secondary-neon)" />
                        <rect x="75" y="38" width="7" height="18" rx="2" fill="var(--secondary-neon)" />
                        
                        {/* Antenna */}
                        <line x1="50" y1="25" x2="50" y2="12" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="3" />
                        <circle 
                            cx="50" 
                            cy="10" 
                            r="6" 
                            fill={isSpeaking ? "var(--primary-neon)" : "var(--secondary-neon)"}
                            style={{
                                filter: isSpeaking ? 'drop-shadow(0 0 8px var(--primary-neon-glow))' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />

                        {/* Visor Panel */}
                        <rect x="32" y="34" width="36" height="18" rx="9" fill="#07070f" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                        {/* Glowing Eyes/LED bar */}
                        <rect 
                            x="38" 
                            y="40" 
                            width="24" 
                            height="6" 
                            rx="3" 
                            fill={isSpeaking ? "var(--primary-neon)" : "var(--secondary-neon)"}
                            style={{
                                filter: isSpeaking 
                                    ? 'drop-shadow(0 0 6px var(--primary-neon-glow))' 
                                    : 'drop-shadow(0 0 3px var(--secondary-neon-glow))',
                                transition: 'all 0.2s ease',
                            }}
                        />

                        {/* Smiling mouth / audio light */}
                        <path 
                            d="M 44 58 Q 50 63 56 58" 
                            fill="none" 
                            stroke={isSpeaking ? "var(--primary-neon)" : "rgba(255, 255, 255, 0.3)"} 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                            style={{
                                filter: isSpeaking ? 'drop-shadow(0 0 4px var(--primary-neon-glow))' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </svg>

                    {/* Soundwave lines underneath avatar */}
                    <div className="soundwave-container" style={{ marginTop: '8px' }}>
                        <div className={`soundwave-line ${isSpeaking ? 'active' : ''}`} />
                        <div className={`soundwave-line ${isSpeaking ? 'active' : ''}`} />
                        <div className={`soundwave-line ${isSpeaking ? 'active' : ''}`} />
                        <div className={`soundwave-line ${isSpeaking ? 'active' : ''}`} />
                        <div className={`soundwave-line ${isSpeaking ? 'active' : ''}`} />
                    </div>
                </div>

                {/* Primary speech bubble */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="commentary-bubble" style={{ 
                        border: isSpeaking ? '1px solid rgba(20, 241, 149, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: isSpeaking ? '0 0 15px rgba(20, 241, 149, 0.08)' : 'none'
                    }}>
                        {commentaryHistory.length > 0 ? (
                            <p style={{ margin: 0, fontStyle: isSpeaking ? 'normal' : 'italic' }}>
                                {commentaryHistory[0].text}
                            </p>
                        ) : (
                            <p style={{ margin: 0, color: '#64748b' }}>Esperando eventos en vivo de Solana (Helius)...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Commentary History */}
            {commentaryHistory.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Historial de Comentarios
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                        {commentaryHistory.slice(1).map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', gap: '12px', background: 'rgba(255, 255, 255, 0.015)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.02)' }}>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</span>
                                <span style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.7rem', flexShrink: 0 }}>{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
