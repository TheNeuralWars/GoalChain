import React, { lazy, Suspense, useState, useEffect } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { fetchOpsStatus, triggerVaultCrank, type OpsStatus } from '../lib/opsClient';

const TradingTerminal = lazy(() => import('./TradingTerminal').then(m => ({ default: m.TradingTerminal })));
const SwarmVaults = lazy(() => import('./SwarmVaults').then(m => ({ default: m.SwarmVaults })));

export function DeFiPortal() {
  const [activeSubTab, setActiveSubTab] = useState<'trading' | 'vaults'>('trading');
  const [opsData, setOpsData] = useState<OpsStatus | null>(null);
  const [crankLoading, setCrankLoading] = useState(false);
  const [crankMessage, setCrankMessage] = useState('');

  const refreshCrank = async () => {
    try {
      const data = await fetchOpsStatus();
      setOpsData(data);
    } catch (err) {
      console.error("Failed to load ops status in DeFi:", err);
    }
  };

  useEffect(() => {
    refreshCrank();
    const interval = setInterval(refreshCrank, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRunCrank = async () => {
    setCrankLoading(true);
    setCrankMessage('Iniciando ejecución de Vault Crank...');
    try {
      const res = await triggerVaultCrank();
      if (res.success) {
        setCrankMessage('🚀 Vault Crank iniciado con éxito en el backend.');
        setTimeout(async () => {
          await refreshCrank();
          setCrankMessage('✅ Vault Crank ejecutado. Datos actualizados.');
        }, 3000);
      } else {
        setCrankMessage(`❌ Falló: ${res.message}`);
      }
    } catch (err: any) {
      setCrankMessage(`❌ Error: ${err.message}`);
    } finally {
      setCrankLoading(false);
    }
  };

  const tabs = [
    { id: 'trading', label: '💱 Vibe Swap & Trading', desc: 'Negocia tokens y activa vibe bots' },
    { id: 'vaults', label: '🏦 Swarm Yield Vaults', desc: 'Estrategias de liquidez con agentes autónomos' },
  ] as const;

  return (
    <div className="play-page play-page--portal">
      <div className="portal-header glass-card">
        <div className="portal-badge portal-badge--defi">DEFI PORTAL</div>
        <SimulationBadge />
        <h1>Terminal Financiera</h1>
        <p className="portal-honesty-note">
          Demostración visual — sin transacciones on-chain hasta post-Mundial 2026.
        </p>
        <p className="portal-subtitle">
          Maximiza el rendimiento de tu club con arbitraje inteligente, vaults autónomas y liquidez automatizada.
        </p>

        {/* Glassmorphic Tabs Navigation */}
        <div className="portal-tabs portal-tabs--two-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`portal-tab-btn portal-tab-btn--defi ${activeSubTab === tab.id ? 'portal-tab-btn--active' : ''}`}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-desc">{tab.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="portal-content-wrapper">
        {/* Vault Crank Status & Action Card */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', textAlign: 'left', border: '1px solid rgba(153, 69, 255, 0.15)', background: 'rgba(13, 13, 27, 0.4)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚙️ Consola de Ejecución Vault Crank (Infinity Engine)
              </h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Controla las variables de recompra de GCH y distribución de rendimiento de las bóvedas.
              </p>
            </div>
            <button
              onClick={handleRunCrank}
              disabled={crankLoading}
              style={{
                background: crankLoading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #14f195 0%, #9945ff 100%)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.75rem',
                cursor: crankLoading ? 'not-allowed' : 'pointer',
                boxShadow: crankLoading ? 'none' : '0 4px 15px rgba(20, 241, 149, 0.3)',
                transition: 'transform 0.1s'
              }}
              onMouseEnter={(e) => !crankLoading && (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => !crankLoading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {crankLoading ? 'Ejecutando...' : 'Ejecutar Vault Crank'}
            </button>
          </div>

          {opsData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Modo de Operación</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: opsData.vault_crank.mode === 'execute' ? '#14f195' : '#ff9a33', marginTop: '2px' }}>
                  {opsData.vault_crank.available ? (opsData.vault_crank.mode?.toUpperCase() || 'DRY-RUN') : 'SIN CONEXIÓN'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Exceso de Retorno</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  ◎ {opsData.vault_crank.excess_sol.toFixed(3)} SOL
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Recompra y Quema Estimada</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#14f195', marginTop: '2px' }}>
                  {Math.round(opsData.vault_crank.estimated_gch_burned).toLocaleString()} $GCH
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Última Ejecución</div>
                <div style={{ fontSize: '0.75rem', color: '#e2e8f0', marginTop: '4px' }}>
                  {opsData.vault_crank.timestamp_iso ? new Date(opsData.vault_crank.timestamp_iso).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          )}

          {crankMessage && (
            <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
              {crankMessage}
            </div>
          )}
        </div>

        {activeSubTab === 'trading' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Cargando terminal...</div>}>
              <TradingTerminal />
            </Suspense>
          </div>
        )}
        {activeSubTab === 'vaults' && (
          <div className="portal-fade-in">
            <Suspense fallback={<div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>Cargando vaults...</div>}>
              <SwarmVaults />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
