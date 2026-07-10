import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface CommentaryItem {
    id: number;
    text: string;
    time: string;
}


export const AICommentator: React.FC = () => {
    const { t } = useTranslation();
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
    const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [wsError, setWsError] = useState<string | null>(null);
    const [broadcastCount, setBroadcastCount] = useState<number>(0);
    const wsRef = useRef<WebSocket | null>(null);

    // NoahAI integration state
    const [noahQuery, setNoahQuery] = useState('');
    const [isQueryingNoah, setIsQueryingNoah] = useState(false);

    const queryNoahAi = async () => {
        if (!noahQuery.trim()) return;
        setIsQueryingNoah(true);
        try {
            const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';
            const res = await fetch(`${apiBaseUrl}/api/noahai/commentary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: noahQuery, player_id: 'LIONEL_SATOSHI' })
            });
            const data = await res.json();
            if (data.success) {
                speak(data.text);
                setCommentaryHistory(prev => [
                    {
                        id: Date.now(),
                        text: t('ai_commentator.noah_ai_response', { text: data.text }),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    },
                    ...prev
                ]);
                setNoahQuery('');
            }
        } catch (err) {
            console.warn(t('ai_commentator.noah_ai_error'), err);
            const mockResponses = [
                t('ai_commentator.mock_response_1'),
                t('ai_commentator.mock_response_2'),
                t('ai_commentator.mock_response_3'),
                t('ai_commentator.mock_response_4')
            ];
            const fallbackText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            speak(fallbackText);
            setCommentaryHistory(prev => [
                {
                    id: Date.now(),
                    text: t('ai_commentator.noah_ai_simulated_response', { text: fallbackText }),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                },
                ...prev
            ]);
            setNoahQuery('');
        } finally {
            setIsQueryingNoah(false);
        }
    };

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
                console.log(t('ai_commentator.ws_connected', { url: wsUrl }));
                setWsStatus('connected');
                setWsError(null);
            };

            socket.onclose = () => {
                console.log(t('ai_commentator.ws_disconnected', { url: wsUrl }));
                setWsStatus('disconnected');
                setWsError(null);
                reconnectTimeout = setTimeout(connect, 5000);
            };

            socket.onerror = (err) => {
                // Downgraded from console.error — WS errors are expected when bridge is offline
                console.warn(t('ai_commentator.ws_error'), err);
                setWsStatus('error');
                setWsError(t('ai_commentator.ws_retry'));
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'commentary') {
                        speak(data.text);
                        setCommentaryHistory(prev => [
                            {
                                id: Date.now(),
                                text: data.text,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            },
                            ...prev
                        ]);
                        setBroadcastCount(prev => prev + 1);
                    }
                } catch (e) {
                    console.error(t('ai_commentator.ws_parse_error'), e);
                }
            };
        };

        connect();

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (socket) socket.close();
        };
    }, [loadingPhase, wsEnabled, wsUrl]);

    // Voice synthesis
    const speak = (text: string) => {
        if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.2;

        if (selectedVoice) {
            utterance.voice = voices.find(v => v.name === selectedVoice) || null;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    // Load available voices
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                setSelectedVoice(availableVoices[0].name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    return (
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>{t('ai_commentator.title')}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>{t('ai_commentator.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: !wsEnabled
                                ? '#94a3b8'
                                : (wsStatus === 'connected' ? 'var(--primary-neon)' : (wsStatus === 'connecting' ? '#eab308' : 'var(--accent-red)')),
                            boxShadow: wsStatus === 'connected' ? '0 0 8px var(--primary-neon-glow)' : 'none',
                            display: 'inline-block'
                        }}></span>
                        {!wsEnabled
                            ? t('ai_commentator.bridge_disabled')
                            : wsStatus === 'connected'
                            ? t('ai_commentator.live_cast', { count: broadcastCount })
                            : wsStatus === 'connecting'
                            ? t('ai_commentator.connecting')
                            : wsStatus === 'error'
                            ? t('ai_commentator.bridge_error')
                            : t('ai_commentator.bridge_offline')}
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
                        {isMuted ? t('ai_commentator.mute') : t('ai_commentator.speak')}
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
                        <rect x="35" y="40" width="30" height="40" fill="#1e293b" rx="2" />
                        <rect x="35" y="40" width="30" height="8" fill="#f1f5f9" />
                        <rect x="35" y="52" width="30" height="8" fill="#f1f5f9" />
                        <rect x="35" y="64" width="30" height="8" fill="#f1f5f9" />

                        {/* Head */}
                        <circle cx="50" cy="30" r="18" fill="#1e293b" />
                        <circle cx="50" cy="30" r="16" fill="#f1f5f9" />

                        {/* Eyes */}
                        <circle cx="45" cy="28" r="3" fill="#1e293b" />
                        <circle cx="55" cy="28" r="3" fill="#1e293b" />

                        {/* Mouth */}
                        <path d="M40 35 L60 35" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

                        {/* Whistle */}
                        <path d="M65 20 L75 30 L65 40" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Commentary Bubble */}
                <div style={{ flex: 1, background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '1.25rem', position: 'relative' }}>
                    {loadingPhase === 'downloading' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t('ai_commentator.downloading')}</div>
                            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${downloadProgress}%`, height: '100%', background: 'var(--primary-neon)', transition: 'width 0.3s ease' }}></div>
                            </div>
                        </div>
                    ) : loadingPhase === 'compiling' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{t('ai_commentator.compiling')}</div>
                            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: '100%', height: '100%', background: 'var(--secondary-neon)', transition: 'width 0.3s ease' }}></div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Current Commentary */}
                            <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#f1f5f9' }}>
                                {commentaryHistory.length > 0 ? commentaryHistory[0].text : t('ai_commentator.initial_commentary')}
                            </div>

                            {/* NoahAI Query Form */}
                            <form onSubmit={(e) => { e.preventDefault(); queryNoahAi(); }} style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={noahQuery}
                                    onChange={(e) => setNoahQuery(e.target.value)}
                                    placeholder={t('ai_commentator.query_placeholder')}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.3)', color: '#fff' }}
                                    disabled={isQueryingNoah}
                                />
                                <button
                                    type="submit"
                                    className="btn-neon-green"
                                    style={{ padding: '0 16px', borderRadius: '8px', cursor: 'pointer' }}
                                    disabled={isQueryingNoah}
                                >
                                    {isQueryingNoah ? '...' : t('ai_commentator.query_button')}
                                </button>
                            </form>

                            {/* Commentary History */}
                            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px 0' }}>
                                {commentaryHistory.slice(1).map((item) => (
                                    <div key={item.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>{item.time}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{item.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}