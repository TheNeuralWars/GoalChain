import React, { useState } from 'react';

export const TradingTerminal: React.FC = () => {
    const [position, setPosition] = useState<'Long' | 'Short'>('Long');
    const [leverage, setLeverage] = useState(1);

    return (
        <div className="trading-terminal" style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            background: '#0a0a0f', 
            border: '1px solid #9945ff', 
            borderRadius: '16px' 
        }}>
            <h2 style={{ color: '#9945ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span role="img" aria-label="chart">📈</span> Drift Derivatives Terminal
            </h2>
            <p style={{ opacity: 0.7 }}>Especula sobre el rendimiento de las selecciones con apalancamiento.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                {/* Panel de Control */}
                <div style={{ textAlign: 'left' }}>
                    <label>Seleccionar Selección:</label>
                    <select style={inputStyle}>
                        <option>Argentina (ARG-PERP)</option>
                        <option>Francia (FRA-PERP)</option>
                        <option>España (ESP-PERP)</option>
                    </select>

                    <div style={{ marginTop: '1rem' }}>
                        <button 
                            onClick={() => setPosition('Long')}
                            style={{ ...toggleBtn, background: position === 'Long' ? '#14f195' : '#333', color: position === 'Long' ? '#000' : '#fff' }}
                        >Long</button>
                        <button 
                            onClick={() => setPosition('Short')}
                            style={{ ...toggleBtn, background: position === 'Short' ? '#ff4b4b' : '#333', color: position === 'Short' ? '#fff' : '#fff' }}
                        >Short</button>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <label>Apalancamiento: {leverage}x</label>
                        <input 
                            type="range" min="1" max="10" step="1" 
                            value={leverage} 
                            onChange={(e) => setLeverage(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: '#9945ff' }} 
                        />
                    </div>

                    <button style={tradeBtn}>Ejecutar Posición {position}</button>
                </div>

                {/* Gráfico Simulado */}
                <div style={{ background: '#111', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #444' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', color: '#14f195' }}>+12.5%</div>
                        <div style={{ opacity: 0.5 }}>Rendimiento Real-Time (Oracle)</div>
                        <div style={{ marginTop: '1rem', height: '60px', width: '100%', background: 'linear-gradient(90deg, transparent 0%, #14f195 50%, transparent 100%)', opacity: 0.2 }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem',
    background: '#1a1a1a',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: '8px',
    marginTop: '0.5rem'
};

const toggleBtn: React.CSSProperties = {
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    fontWeight: 'bold'
};

const tradeBtn: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    marginTop: '1.5rem',
    background: '#9945ff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
};
