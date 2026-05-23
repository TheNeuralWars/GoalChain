import React, { useState, useEffect, useRef } from 'react';

interface Allocation {
    name: string;
    share: number;
    color: string;
}

interface VaultStrategy {
    id: 'sentinel' | 'arbitrageur' | 'orchestrator';
    name: string;
    description: string;
    apy: string;
    color: string;
    allocations: Allocation[];
    mockLogs: string[];
}

const VAULT_STRATEGIES: VaultStrategy[] = [
    {
        id: 'sentinel',
        name: 'Sentinel Vault',
        description: 'Cobertura delta-neutra automatizada en Drift y preservación estricta de colateral.',
        apy: '7.5%',
        color: 'var(--primary-neon)',
        allocations: [
            { name: 'Drift Hedging', share: 40, color: 'var(--primary-neon)' },
            { name: 'Treasury Yield', share: 50, color: 'var(--secondary-neon)' },
            { name: 'Efectivo', share: 10, color: '#64748b' }
        ],
        mockLogs: [
            'Verificando estabilidad del colateral depositado en Drift.',
            'Rebalanceando posiciones de cobertura en el par de derivados de Argentina.',
            'Margen de liquidación seguro al 145%. Operación estable.',
            'Cosechando yield pasivo del fondo de estabilidad de Solana.',
            'Alineando colateral con oráculo de Chainlink. Desviación 0.02%.'
        ]
    },
    {
        id: 'arbitrageur',
        name: 'Arbitrageur Vault',
        description: 'Búsqueda de spreads entre pools concentrados de Jupiter y provisión de liquidez CLMM.',
        apy: '9.5%',
        color: 'var(--secondary-neon)',
        allocations: [
            { name: 'Jupiter LP Pools', share: 60, color: 'var(--secondary-neon)' },
            { name: 'Drift Hedging', share: 20, color: 'var(--primary-neon)' },
            { name: 'Treasury Yield', share: 15, color: '#f59e0b' },
            { name: 'Efectivo', share: 5, color: '#64748b' }
        ],
        mockLogs: [
            'Escaneando diferenciales de spread en pools concentrados de Orca y Raydium.',
            'Proveyendo liquidez CLMM en rango estrecho en los pares de selecciones.',
            'Arbitraje ejecutado exitosamente a través del ruteador de Jup.ag.',
            'Captando tarifas de transacción del alto volumen del partido en vivo.',
            'Balanceando pools tras resolución de mercado por el oráculo GoalChain.'
        ]
    },
    {
        id: 'orchestrator',
        name: 'Orchestrator Vault',
        description: 'Especulación apalancada y de alto rendimiento basada en tendencias de oráculos deportivos.',
        apy: '14.5%',
        color: 'var(--accent-red)',
        allocations: [
            { name: 'Drift Speculation', share: 75, color: 'var(--accent-red)' },
            { name: 'Jupiter LP Pools', share: 15, color: 'var(--secondary-neon)' },
            { name: 'Efectivo', share: 10, color: '#64748b' }
        ],
        mockLogs: [
            'Analizando oráculo de partidos. Tendencia alcista detectada para España.',
            'Posición Long apalancada x5 abierta en par ESP-PERP en Drift.',
            'Ajustando circuit-breaker por volatilidad extrema en el marcador.',
            '¡Mercado resuelto! Liquidando contratos predictivos con +18.4% de ganancia.',
            'Calculando probabilidad implícita según volumen de apuestas on-chain.'
        ]
    }
];

export const SwarmVaults: React.FC = () => {
    const [activeVaultId, setActiveVaultId] = useState<'sentinel' | 'arbitrageur' | 'orchestrator'>('sentinel');
    const [walletGch, setWalletGch] = useState<number>(2500);
    const [vaultBalances, setVaultBalances] = useState<Record<string, number>>({
        sentinel: 0,
        arbitrageur: 0,
        orchestrator: 0
    });
    const [inputValue, setInputValue] = useState<string>('');
    const [consoleLogs, setConsoleLogs] = useState<string[]>([
        '[System] Inicializando enjambre de agentes multi-estrategia...',
        '[System] Conexión establecida con Drift SDK y Jupiter Aggregator.',
        '[System] Listo para la asignación de capital del usuario.'
    ]);

    const activeVault = VAULT_STRATEGIES.find(v => v.id === activeVaultId) || VAULT_STRATEGIES[0];
    const consoleEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll para la consola
    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [consoleLogs]);

    // Simular logs en segundo plano de forma periódica
    useEffect(() => {
        const interval = setInterval(() => {
            const currentVault = VAULT_STRATEGIES.find(v => v.id === activeVaultId) || VAULT_STRATEGIES[0];
            const randomIndex = Math.floor(Math.random() * currentVault.mockLogs.length);
            const randomLog = currentVault.mockLogs[randomIndex];
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            const prefix = currentVault.id === 'sentinel' 
                ? '[🛡️ Sentinel]' 
                : currentVault.id === 'arbitrageur' 
                    ? '[⚖️ Arbitrageur]' 
                    : '[🔥 Orchestrator]';

            setConsoleLogs(prev => [
                ...prev,
                `[${timestamp}] ${prefix} ${randomLog}`
            ]);
        }, 6000);

        return () => clearInterval(interval);
    }, [activeVaultId]);

    // Manejar depósito (delegación)
    const handleDeposit = () => {
        const amount = parseFloat(inputValue);
        if (isNaN(amount) || amount <= 0) {
            alert('Por favor introduce una cantidad válida mayor que cero.');
            return;
        }

        if (amount > walletGch) {
            alert('Saldo insuficiente en tu wallet para delegar esta cantidad.');
            return;
        }

        // Ejecutar transaccion simulada
        setWalletGch(prev => Number((prev - amount).toFixed(2)));
        setVaultBalances(prev => ({
            ...prev,
            [activeVaultId]: Number((prev[activeVaultId] + amount).toFixed(2))
        }));
        setInputValue('');

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setConsoleLogs(prev => [
            ...prev,
            `[${timestamp}] 📥 [DEPOSIT] Delegados +${amount} $GCH con éxito en ${activeVault.name}.`
        ]);

        // Disparar evento global para que Enzo Bit comente
        window.dispatchEvent(new CustomEvent('goalchain-event', {
            detail: {
                type: 'BET',
                message: `Delegación de ${amount} $GCH en ${activeVault.name}. ¡El enjambre de agentes ya está optimizando el rendimiento!`
            }
        }));
    };

    // Manejar retiro (desdelegación)
    const handleWithdraw = () => {
        const currentBalance = vaultBalances[activeVaultId];
        if (currentBalance <= 0) {
            alert('No tienes fondos delegados en esta bóveda para retirar.');
            return;
        }

        setWalletGch(prev => Number((prev + currentBalance).toFixed(2)));
        setVaultBalances(prev => ({
            ...prev,
            [activeVaultId]: 0
        }));

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setConsoleLogs(prev => [
            ...prev,
            `[${timestamp}] 📤 [WITHDRAW] Retirados ${currentBalance} $GCH de ${activeVault.name} hacia tu wallet.`
        ]);

        // Disparar evento global para que Enzo Bit comente
        window.dispatchEvent(new CustomEvent('goalchain-event', {
            detail: {
                type: 'BET',
                message: `Retiro de fondos: Se devolvieron ${currentBalance} $GCH desde la bóveda ${activeVault.name} a la wallet.`
            }
        }));
    };

    // Atajos de porcentaje
    const handlePercentShortcut = (pct: number) => {
        const amount = Number((walletGch * pct).toFixed(2));
        setInputValue(amount.toString());
    };

    return (
        <div className="glass-card swarm-vaults-panel" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <h2 className="text-neon-purple" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
                    🤖 Swarm Vaults (Bóvedas de Enjambre AI)
                </h2>
                <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '6px', marginBottom: '0.5rem' }}>
                    Delega tus tokens `$GCH` a enjambres autónomos de agentes que ejecutan hedging y arbitraje en vivo.
                </p>
            </div>

            {/* Wallet Info Banner */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
            }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Tu Balance:</span>
                <span style={{ color: 'var(--primary-neon)', fontWeight: 800, fontFamily: 'monospace', fontSize: '1rem' }}>
                    {walletGch.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $GCH
                </span>
            </div>

            {/* Strategy Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {VAULT_STRATEGIES.map(strategy => {
                    const isActive = strategy.id === activeVaultId;
                    const deposited = vaultBalances[strategy.id];
                    return (
                        <div 
                            key={strategy.id}
                            onClick={() => setActiveVaultId(strategy.id)}
                            className={`vault-selector-card ${isActive ? 'active' : ''}`}
                            style={{
                                borderLeft: `3px solid ${strategy.color}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>{strategy.name}</span>
                                <span style={{ 
                                    fontSize: '0.8rem', 
                                    fontWeight: 900, 
                                    color: strategy.color, 
                                    background: 'rgba(255, 255, 255, 0.03)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px' 
                                }}>
                                    {strategy.apy} APY
                                </span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                                Delegado: <strong style={{ color: deposited > 0 ? 'var(--primary-neon)' : '#94a3b8', fontFamily: 'monospace' }}>{deposited} $GCH</strong>
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Strategy Detail & Allocation Chart */}
            <div style={{ 
                background: 'rgba(10, 10, 20, 0.35)', 
                border: '1px solid rgba(255, 255, 255, 0.03)', 
                borderRadius: '16px', 
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ffffff', fontWeight: 800 }}>Estrategia de Operación</h4>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {activeVault.description}
                    </p>
                </div>

                {/* SVG Stacked Bar Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Distribución de Portafolio del Enjambre
                    </span>
                    
                    <div className="stacked-bar-container">
                        {activeVault.allocations.map((alloc, idx) => (
                            <div 
                                key={idx}
                                className="stacked-bar-segment"
                                style={{ 
                                    width: `${alloc.share}%`, 
                                    backgroundColor: alloc.color,
                                    boxShadow: `0 0 8px ${alloc.color}80`
                                }}
                            />
                        ))}
                    </div>

                    {/* Chart Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px', marginTop: '4px' }}>
                        {activeVault.allocations.map((alloc, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: alloc.color, display: 'inline-block' }} />
                                <span style={{ color: '#cbd5e1' }}>{alloc.name}</span>
                                <span style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>{alloc.share}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interaction Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {/* Inputs and Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                            Monto a Delegar ($GCH)
                        </label>
                        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                            <input 
                                type="number" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="form-select" // Reutilizar estilos de inputs del terminal
                                placeholder="0.00"
                                style={{ 
                                    flex: 1, 
                                    padding: '8px 12px', 
                                    fontSize: '0.88rem',
                                    borderRadius: '8px',
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    color: '#ffffff',
                                    outline: 'none',
                                    WebkitAppearance: 'none'
                                }}
                            />
                            <button 
                                onClick={handleDeposit}
                                className="btn-neon-green"
                                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                            >
                                Delegar
                            </button>
                        </div>
                    </div>

                    {/* Percentage shortcuts */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handlePercentShortcut(0.25)} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
                            25%
                        </button>
                        <button onClick={() => handlePercentShortcut(0.50)} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
                            50%
                        </button>
                        <button onClick={() => handlePercentShortcut(1.00)} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px', padding: '4px', fontSize: '0.72rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s' }}>
                            MAX
                        </button>
                    </div>

                    {/* Withdraw Button */}
                    {vaultBalances[activeVaultId] > 0 && (
                        <button 
                            onClick={handleWithdraw}
                            className="btn-outline-red"
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', marginTop: '4px' }}
                        >
                            Retirar Fondos Delegados
                        </button>
                    )}
                </div>

                {/* Swarm Live Console Log */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Registro de Operaciones del Enjambre
                    </span>
                    <div className="terminal-console">
                        {consoleLogs.map((log, index) => (
                            <div key={index} style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
                                {log}
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};
