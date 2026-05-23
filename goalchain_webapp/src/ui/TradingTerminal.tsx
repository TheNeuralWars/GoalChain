import React, { useState, useEffect, useMemo } from 'react';

interface BotState {
    isEnabled: boolean;
    balance: number;
    totalProfit: number;
    activePosition: {
        type: 'Long' | 'Short';
        entryPrice: number;
        leverage: number;
        size: number;
    } | null;
}

interface BotLog {
    id: number;
    botName: string;
    type: 'LONG' | 'SHORT' | 'CLOSE';
    pair: string;
    price: number;
    leverage: number;
    pnl?: number;
    sentiment: number;
    timestamp: string;
}

export const TradingTerminal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'manual' | 'vibe'>('manual');
    const [selectedPair, setSelectedPair] = useState<string>('Argentina (ARG-PERP)');
    const [position, setPosition] = useState<'Long' | 'Short'>('Long');
    const [leverage, setLeverage] = useState(1);
    
    // Real-time simulated price history for the oracle chart
    const [priceHistory, setPriceHistory] = useState<number[]>([100, 101.5, 99.8, 102.3, 101.0, 103.5, 102.8, 105.4, 104.2, 106.5]);

    // Vibe Bots States
    const [sentiment, setSentiment] = useState<number>(50);
    const [botLogs, setBotLogs] = useState<BotLog[]>([]);
    
    const [toroState, setToroState] = useState<BotState>({
        isEnabled: false,
        balance: 1000,
        totalProfit: 0,
        activePosition: null
    });
    
    const [osoState, setOsoState] = useState<BotState>({
        isEnabled: false,
        balance: 1000,
        totalProfit: 0,
        activePosition: null
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setPriceHistory(prev => {
                const lastPrice = prev[prev.length - 1];
                // Random walk: slightly upward or downward movement
                const change = (Math.random() - 0.46) * 3; 
                const nextPrice = Number((lastPrice + change).toFixed(1));
                return [...prev.slice(1), nextPrice];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Check if the current price is higher or equal to the starting point in the visible history
    const isTrendingUp = useMemo(() => {
        if (priceHistory.length < 2) return true;
        return priceHistory[priceHistory.length - 1] >= priceHistory[0];
    }, [priceHistory]);

    const latestPriceChange = useMemo(() => {
        const start = priceHistory[0];
        const current = priceHistory[priceHistory.length - 1];
        const percent = ((current - start) / start) * 100;
        return Number(percent.toFixed(2));
    }, [priceHistory]);

    // Map price history to SVG coordinates (Width: 300, Height: 120)
    const points = useMemo(() => {
        const minPrice = Math.min(...priceHistory);
        const maxPrice = Math.max(...priceHistory);
        const range = maxPrice - minPrice || 1;
        
        return priceHistory.map((val, idx) => {
            const x = (idx / (priceHistory.length - 1)) * 300;
            // Map value to y coordinate [15, 105] to keep padding
            const y = 105 - ((val - minPrice) / range) * 90;
            return { x, y, val };
        });
    }, [priceHistory]);

    // Path definitions for stroke and filled area
    const pathD = useMemo(() => {
        return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [points]);

    const areaD = useMemo(() => {
        return `${pathD} L 300 120 L 0 120 Z`;
    }, [pathD]);

    const activeColor = isTrendingUp ? 'var(--primary-neon)' : 'var(--accent-red)';
    const activeGlow = isTrendingUp ? 'rgba(20, 241, 149, 0.25)' : 'rgba(255, 75, 75, 0.25)';

    // Listen to global feed events to adjust market sentiment score
    useEffect(() => {
        const handleEvent = (e: any) => {
            const eventData = e.detail;
            if (!eventData || !eventData.message) return;

            // Loop prevention: ignore any event that comes from Vibe-Bots themselves
            if (eventData.message.includes('🤖') || eventData.message.includes('Vibe-Bot') || eventData.message.includes('Vibe')) {
                return;
            }

            // Adjust sentiment score based on event type and content
            setSentiment(prev => {
                let change = 0;
                const messageLower = eventData.message.toLowerCase();
                
                if (eventData.type === 'GOAL') {
                    change = 18;
                    if (messageLower.includes('tarjeta roja') || messageLower.includes('expulsado') || messageLower.includes('penal') || messageLower.includes('lesion')) {
                        change = -22;
                    }
                } else if (eventData.type === 'BET') {
                    change = 6;
                    if (messageLower.includes('alto') || messageLower.includes('stake alto')) {
                        change = 12;
                    }
                } else if (eventData.type === 'RESOLVE') {
                    if (messageLower.includes('+') || messageLower.includes('gana')) {
                        change = 10;
                    } else if (messageLower.includes('-') || messageLower.includes('pierde')) {
                        change = -12;
                    } else {
                        change = -4;
                    }
                }

                // Random noise factor +/- 3
                const noise = Math.floor(Math.random() * 7) - 3;
                const newSentiment = Math.max(5, Math.min(95, prev + change + noise));
                return newSentiment;
            });
        };

        window.addEventListener('goalchain-event', handleEvent);
        return () => window.removeEventListener('goalchain-event', handleEvent);
    }, []);

    // Bots Execution & Close logic loop
    useEffect(() => {
        const currentPrice = priceHistory[priceHistory.length - 1];
        if (!currentPrice) return;
        
        // Toro Bot Logic
        if (toroState.activePosition) {
            // Check close conditions
            const entry = toroState.activePosition.entryPrice;
            const size = toroState.activePosition.size;
            const lev = toroState.activePosition.leverage;
            const pnlPercent = ((currentPrice - entry) / entry) * lev;
            const pnlValue = pnlPercent * size;
            
            let shouldClose = false;
            let reason = '';
            if (pnlPercent >= 0.25) {
                shouldClose = true;
                reason = 'Take Profit (+25%)';
            } else if (pnlPercent <= -0.15) {
                shouldClose = true;
                reason = 'Stop Loss (-15%)';
            } else if (sentiment < 45) {
                shouldClose = true;
                reason = 'Cambio de Sentimiento (Bajo)';
            }
            
            if (shouldClose) {
                const finalPnl = Number(pnlValue.toFixed(2));
                setToroState(prev => ({
                    ...prev,
                    balance: Number((prev.balance + finalPnl).toFixed(2)),
                    totalProfit: Number((prev.totalProfit + finalPnl).toFixed(2)),
                    activePosition: null
                }));
                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setBotLogs(prev => [
                    {
                        id: Date.now(),
                        botName: 'El Toro Sentimental',
                        type: 'CLOSE',
                        pair: selectedPair,
                        price: currentPrice,
                        leverage: lev,
                        pnl: finalPnl,
                        sentiment,
                        timestamp
                    },
                    ...prev
                ]);
                
                // Adjust sentiment down slightly because Toro takes profit
                setSentiment(s => Math.max(5, s - 8));
                
                window.dispatchEvent(new CustomEvent('goalchain-event', {
                    detail: {
                        id: Date.now(),
                        type: 'RESOLVE',
                        message: `🤖 Vibe-Bot [El Toro Sentimental] cerró LONG en ${selectedPair} con PnL: ${finalPnl >= 0 ? '+' : ''}$${finalPnl} (${reason})`,
                        time: 'Justo ahora'
                    }
                }));
            }
        } else if (toroState.isEnabled && sentiment > 65) {
            // Open Long
            setToroState(prev => ({
                ...prev,
                activePosition: {
                    type: 'Long',
                    entryPrice: currentPrice,
                    leverage: 5,
                    size: 100
                }
            }));
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setBotLogs(prev => [
                {
                    id: Date.now(),
                    botName: 'El Toro Sentimental',
                    type: 'LONG',
                    pair: selectedPair,
                    price: currentPrice,
                    leverage: 5,
                    sentiment,
                    timestamp
                },
                ...prev
            ]);
            window.dispatchEvent(new CustomEvent('goalchain-event', {
                detail: {
                    id: Date.now(),
                    type: 'BET',
                    message: `🤖 Vibe-Bot [El Toro Sentimental] ejecutó LONG x5 en ${selectedPair} @ $${currentPrice} (Sentimiento: ${sentiment}% Hype)`,
                    time: 'Justo ahora'
                }
            }));
        }
        
        // Oso Bot Logic
        if (osoState.activePosition) {
            // Check close conditions
            const entry = osoState.activePosition.entryPrice;
            const size = osoState.activePosition.size;
            const lev = osoState.activePosition.leverage;
            const pnlPercent = ((entry - currentPrice) / entry) * lev;
            const pnlValue = pnlPercent * size;
            
            let shouldClose = false;
            let reason = '';
            if (pnlPercent >= 0.25) {
                shouldClose = true;
                reason = 'Take Profit (+25%)';
            } else if (pnlPercent <= -0.15) {
                shouldClose = true;
                reason = 'Stop Loss (-15%)';
            } else if (sentiment > 55) {
                shouldClose = true;
                reason = 'Cambio de Sentimiento (Alto)';
            }
            
            if (shouldClose) {
                const finalPnl = Number(pnlValue.toFixed(2));
                setOsoState(prev => ({
                    ...prev,
                    balance: Number((prev.balance + finalPnl).toFixed(2)),
                    totalProfit: Number((prev.totalProfit + finalPnl).toFixed(2)),
                    activePosition: null
                }));
                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setBotLogs(prev => [
                    {
                        id: Date.now(),
                        botName: 'El Oso Analítico',
                        type: 'CLOSE',
                        pair: selectedPair,
                        price: currentPrice,
                        leverage: lev,
                        pnl: finalPnl,
                        sentiment,
                        timestamp
                    },
                    ...prev
                ]);
                
                // Adjust sentiment up slightly because Oso covers short
                setSentiment(s => Math.min(95, s + 8));
                
                window.dispatchEvent(new CustomEvent('goalchain-event', {
                    detail: {
                        id: Date.now(),
                        type: 'RESOLVE',
                        message: `🤖 Vibe-Bot [El Oso Analítico] cerró SHORT en ${selectedPair} con PnL: ${finalPnl >= 0 ? '+' : ''}$${finalPnl} (${reason})`,
                        time: 'Justo ahora'
                    }
                }));
            }
        } else if (osoState.isEnabled && sentiment < 35) {
            // Open Short
            setOsoState(prev => ({
                ...prev,
                activePosition: {
                    type: 'Short',
                    entryPrice: currentPrice,
                    leverage: 5,
                    size: 100
                }
            }));
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setBotLogs(prev => [
                {
                    id: Date.now(),
                    botName: 'El Oso Analítico',
                    type: 'SHORT',
                    pair: selectedPair,
                    price: currentPrice,
                    leverage: 5,
                    sentiment,
                    timestamp
                },
                ...prev
            ]);
            window.dispatchEvent(new CustomEvent('goalchain-event', {
                detail: {
                    id: Date.now(),
                    type: 'BET',
                    message: `🤖 Vibe-Bot [El Oso Analítico] ejecutó SHORT x5 en ${selectedPair} @ $${currentPrice} (Sentimiento: ${sentiment}% Pánico)`,
                    time: 'Justo ahora'
                }
            }));
        }
    }, [priceHistory, sentiment, toroState.isEnabled, osoState.isEnabled, toroState.activePosition, osoState.activePosition, selectedPair]);

    // Calculate real-time unrealized PnL based on current price
    const currentPrice = priceHistory[priceHistory.length - 1];

    const toroUnrealizedPnl = useMemo(() => {
        if (!toroState.activePosition || !currentPrice) return 0;
        const entry = toroState.activePosition.entryPrice;
        const size = toroState.activePosition.size;
        const lev = toroState.activePosition.leverage;
        const pnl = ((currentPrice - entry) / entry) * lev * size;
        return Number(pnl.toFixed(2));
    }, [toroState.activePosition, currentPrice]);

    const osoUnrealizedPnl = useMemo(() => {
        if (!osoState.activePosition || !currentPrice) return 0;
        const entry = osoState.activePosition.entryPrice;
        const size = osoState.activePosition.size;
        const lev = osoState.activePosition.leverage;
        const pnl = ((entry - currentPrice) / entry) * lev * size;
        return Number(pnl.toFixed(2));
    }, [osoState.activePosition, currentPrice]);

    const handleExecute = () => {
        alert(`Posición ${position} x${leverage} ejecutada con éxito en el par ${selectedPair} en el Oracle de GoalChain.`);
    };

    // Render Chart function to avoid code duplication
    const renderChart = () => (
        <div style={{ 
            background: 'rgba(5, 5, 10, 0.6)', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            flex: 1
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Rendimiento Real-Time
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: activeColor, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {latestPriceChange >= 0 ? `+${latestPriceChange}` : latestPriceChange}%
                        <span style={{ fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px', background: activeGlow, color: activeColor }}>
                            {latestPriceChange >= 0 ? '▲ UP' : '▼ DOWN'}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                    <div>ORACLE INDICE</div>
                    <div style={{ fontFamily: 'monospace', color: '#cbd5e1', fontWeight: 700, marginTop: '2px' }}>
                        ${priceHistory[priceHistory.length - 1].toFixed(2)}
                    </div>
                </div>
            </div>

            {/* SVG Chart Graphic */}
            <div style={{ position: 'relative', height: '110px', marginTop: '1rem', marginBottom: '0.5rem' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={activeColor} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={activeColor} stopOpacity="0.0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Gridlines */}
                    <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Filled Area */}
                    <path d={areaD} fill="url(#chartAreaGrad)" style={{ transition: 'all 0.3s ease' }} />
                    
                    {/* Stroke Line */}
                    <path d={pathD} fill="none" stroke={activeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.3s ease' }} />
                    
                    {/* Glowing Active Dot */}
                    {points.length > 0 && (
                        <>
                            <circle 
                                cx={points[points.length - 1].x} 
                                cy={points[points.length - 1].y} 
                                r="4.5" 
                                fill={activeColor} 
                                style={{ filter: `drop-shadow(0 0 5px ${activeColor})` }}
                            />
                            <circle 
                                cx={points[points.length - 1].x} 
                                cy={points[points.length - 1].y} 
                                r="9" 
                                fill="none" 
                                stroke={activeColor} 
                                strokeWidth="1.5" 
                                opacity="0.6"
                            >
                                <animate attributeName="r" values="4.5;13;4.5" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                            </circle>
                        </>
                    )}
                </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#475569', fontWeight: 600 }}>
                <span>LIVELINK</span>
                <span>MOCK FEED (SECURE DRIFT PIPELINE)</span>
            </div>
        </div>
    );

    return (
        <div className="glass-card trading-terminal" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                <h2 className="text-neon-purple" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                    <span role="img" aria-label="chart">📈</span> Drift Derivatives Terminal
                </h2>
                {/* Tab selector */}
                <div className="terminal-tabs" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                    <button 
                        onClick={() => setActiveTab('manual')} 
                        className={`terminal-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                    >
                        🎮 Manual
                    </button>
                    <button 
                        onClick={() => setActiveTab('vibe')} 
                        className={`terminal-tab-btn ${activeTab === 'vibe' ? 'active' : ''}`}
                    >
                        🤖 Vibe Bots
                    </button>
                </div>
            </div>

            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '-4px', marginBottom: '1.5rem' }}>
                Especula sobre el rendimiento de las selecciones con apalancamiento usando oráculos de Drift y AI Vibe trading.
            </p>

            {activeTab === 'manual' ? (
                /* Manual Trading layout */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {/* Control Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Seleccionar Par
                            </label>
                            <select 
                                value={selectedPair} 
                                onChange={(e) => setSelectedPair(e.target.value)}
                                className="form-select" 
                                style={{ marginTop: '0.5rem' }}
                            >
                                <option value="Argentina (ARG-PERP)">Argentina (ARG-PERP)</option>
                                <option value="Francia (FRA-PERP)">Francia (FRA-PERP)</option>
                                <option value="España (ESP-PERP)">España (ESP-PERP)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                                Dirección de Posición
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setPosition('Long')}
                                    className={position === 'Long' ? 'btn-neon-green' : 'btn-outline-green'}
                                    style={{ flex: 1, padding: '0.5rem 1rem' }}
                                >
                                    Long (Comprar)
                                </button>
                                <button 
                                    onClick={() => setPosition('Short')}
                                    className={position === 'Short' ? 'btn-neon-red' : 'btn-outline-red'}
                                    style={{ flex: 1, padding: '0.5rem 1rem' }}
                                >
                                    Short (Vender)
                                </button>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                                <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Apalancamiento</span>
                                <span style={{ color: 'var(--secondary-neon)' }}>{leverage}x</span>
                            </div>
                            <input 
                                type="range" min="1" max="10" step="1" 
                                value={leverage} 
                                onChange={(e) => setLeverage(parseInt(e.target.value))}
                                className="premium-slider"
                            />
                        </div>

                        <button 
                            onClick={handleExecute} 
                            className={position === 'Long' ? 'btn-neon-green' : 'btn-neon-red'}
                            style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', marginTop: 'auto' }}
                        >
                            Ejecutar Posición {position}
                        </button>
                    </div>

                    {/* Chart */}
                    {renderChart()}
                </div>
            ) : (
                /* Vibe Trading layout */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {/* Left Panel: Gauge & Toggles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Sentiment Gauge */}
                        <div style={{ 
                            background: 'rgba(5, 5, 10, 0.4)', 
                            borderRadius: '16px', 
                            padding: '1rem 1.25rem',
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', textAlign: 'left' }}>
                                Sentimiento del Mercado (Helius Feed)
                            </div>
                            
                            <svg width="200" height="110" viewBox="0 0 200 110" style={{ overflow: 'visible', margin: '0 auto', display: 'block' }}>
                                <defs>
                                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--accent-red)" />
                                        <stop offset="35%" stopColor="var(--accent-red)" />
                                        <stop offset="50%" stopColor="#eab308" />
                                        <stop offset="65%" stopColor="var(--primary-neon)" />
                                        <stop offset="100%" stopColor="var(--primary-neon)" />
                                    </linearGradient>
                                </defs>
                                <path d="M 30 95 A 70 70 0 0 1 170 95" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="12" strokeLinecap="round" />
                                <path d="M 30 95 A 70 70 0 0 1 170 95" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
                                
                                <g transform={`rotate(${180 + (sentiment * 1.8)}, 100, 95)`} style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                    <line x1="100" y1="95" x2="45" y2="95" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))' }} />
                                    <circle cx="100" cy="95" r="6" fill="#ffffff" />
                                </g>
                                
                                <text x="100" y="110" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800" letterSpacing="0.5">
                                    {sentiment}% - {sentiment > 65 ? '⚡ HYPE' : (sentiment < 35 ? '⚠️ PÁNICO' : '⚖️ NEUTRAL')}
                                </text>
                            </svg>
                        </div>

                        {/* Bot Switches */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Toro */}
                            <div className={`bot-switch-container ${toroState.isEnabled ? 'active-toro' : ''}`}>
                                <div className="switch-label">
                                    <span className="switch-title">🐂 El Toro Sentimental</span>
                                    <span className="switch-desc">Opera LONG con Hype (&gt;65%)</span>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                                        <div>Bal: <span style={{ color: '#ffffff' }}>${toroState.balance.toFixed(2)}</span></div>
                                        <div>Profit: <span style={{ color: toroState.totalProfit >= 0 ? 'var(--primary-neon)' : 'var(--accent-red)' }}>
                                            {toroState.totalProfit >= 0 ? '+' : ''}${toroState.totalProfit.toFixed(2)}
                                        </span></div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                                        {toroState.activePosition ? (
                                            <span style={{ color: 'var(--primary-neon)', fontWeight: 700 }}>
                                                🟢 LONG Activo @ ${toroState.activePosition.entryPrice.toFixed(2)} ({toroUnrealizedPnl >= 0 ? '+' : ''}${toroUnrealizedPnl.toFixed(2)})
                                            </span>
                                        ) : (
                                            <span style={{ color: '#64748b' }}>⚪ Idle</span>
                                        )}
                                    </div>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={toroState.isEnabled}
                                        onChange={(e) => setToroState(prev => ({
                                            ...prev,
                                            isEnabled: e.target.checked,
                                            activePosition: e.target.checked ? prev.activePosition : null
                                        }))}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            {/* Oso */}
                            <div className={`bot-switch-container ${osoState.isEnabled ? 'active-oso' : ''}`}>
                                <div className="switch-label">
                                    <span className="switch-title">🐻 El Oso Analítico</span>
                                    <span className="switch-desc">Opera SHORT con Pánico (&lt;35%)</span>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                                        <div>Bal: <span style={{ color: '#ffffff' }}>${osoState.balance.toFixed(2)}</span></div>
                                        <div>Profit: <span style={{ color: osoState.totalProfit >= 0 ? 'var(--primary-neon)' : 'var(--accent-red)' }}>
                                            {osoState.totalProfit >= 0 ? '+' : ''}${osoState.totalProfit.toFixed(2)}
                                        </span></div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>
                                        {osoState.activePosition ? (
                                            <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
                                                🔴 SHORT Activo @ ${osoState.activePosition.entryPrice.toFixed(2)} ({osoUnrealizedPnl >= 0 ? '+' : ''}${osoUnrealizedPnl.toFixed(2)})
                                            </span>
                                        ) : (
                                            <span style={{ color: '#64748b' }}>⚪ Idle</span>
                                        )}
                                    </div>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={osoState.isEnabled}
                                        onChange={(e) => setOsoState(prev => ({
                                            ...prev,
                                            isEnabled: e.target.checked,
                                            activePosition: e.target.checked ? prev.activePosition : null
                                        }))}
                                    />
                                    <span className="slider slider-red"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Chart + Ledger */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {renderChart()}
                        
                        {/* Bot Ledger */}
                        <div style={{ 
                            padding: '1rem 1.25rem', 
                            background: 'rgba(5, 5, 10, 0.6)', 
                            borderRadius: '16px', 
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🤖 Ledger de Transacciones (Vibe-Bots)
                            </div>
                            <div className="vibe-ledger">
                                {botLogs.length > 0 ? (
                                    botLogs.map(log => (
                                        <div key={log.id} className="vibe-ledger-row">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>[{log.timestamp}]</span>
                                                <span style={{ fontWeight: 700, color: log.botName.includes('Toro') ? 'var(--primary-neon)' : 'var(--accent-red)' }}>
                                                    {log.botName.includes('Toro') ? '🐂 Toro' : '🐻 Oso'}
                                                </span>
                                                <span className={`ledger-badge ${log.type === 'LONG' ? 'badge-long' : (log.type === 'SHORT' ? 'badge-short' : 'badge-close')}`}>
                                                    {log.type}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ color: '#94a3b8' }}>{log.pair.split(' ')[0]} @ ${log.price.toFixed(2)}</span>
                                                {log.pnl !== undefined && (
                                                    <span style={{ fontWeight: 800, color: log.pnl >= 0 ? 'var(--primary-neon)' : 'var(--accent-red)' }}>
                                                        {log.pnl >= 0 ? '+' : ''}${log.pnl}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#475569', textAlign: 'center', padding: '2rem 0', fontSize: '0.72rem', fontStyle: 'italic' }}>
                                        Esperando señales de sentimiento en el mercado...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
