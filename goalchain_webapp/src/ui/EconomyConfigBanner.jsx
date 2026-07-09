import React, { useEffect, useState } from 'react';
import { fetchEconomyConfig } from '../lib/economyClient';
export function EconomyConfigBanner() {
    const [version, setVersion] = useState(null);
    const [drift, setDrift] = useState(null);
    const [driftReasons, setDriftReasons] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        const ac = new AbortController();
        fetchEconomyConfig(ac.signal)
            .then((cfg) => {
            const canonical = (cfg.canonicalConfig ?? cfg.canonical_config);
            const configVersion = canonical?.config_version ?? cfg.config_version ?? 'v1.0.0-p0';
            setVersion(configVersion);
            const onchain = cfg.onchainConfig;
            const reasons = [];
            if (canonical && onchain) {
                // 1. Validar max_fee_bps
                const maxFeeBps = Number(canonical.core_parameters?.max_fee_bps ?? 0);
                const feeBps = Number(onchain.feeBps ?? 0);
                if (maxFeeBps > 0 && feeBps > maxFeeBps) {
                    reasons.push(`fee_bps on-chain (${feeBps}) excede el límite máximo canónico (${maxFeeBps})`);
                }
                // 2. Validar maxStartersPerManager
                const maxStarters = Number(onchain.maxStartersPerManager ?? 0);
                if (maxStarters !== 11) {
                    reasons.push(`maxStartersPerManager on-chain (${maxStarters}) difiere del valor esperado de 11`);
                }
                // 3. Validar fee split sum
                const feeBurn = Number(onchain.feeBurnBps ?? 0);
                const feeJackpot = Number(onchain.feeJackpotBps ?? 0);
                if (feeBurn + feeJackpot > 10000) {
                    reasons.push('La suma de fee split (burn + jackpot) excede los 10000 BPS');
                }
            }
            setDriftReasons(reasons);
            setDrift(reasons.length > 0);
            setError(null);
        })
            .catch((e) => {
            if (e.name !== 'AbortError') {
                setError('No se pudo cargar la economía canónica desde la API.');
            }
        });
        return () => ac.abort();
    }, []);
    if (error) {
        return (<div className="economy-banner economy-banner--warn glass-card" role="status">
        {error}
      </div>);
    }
    if (!version)
        return null;
    return (<div className={`economy-banner glass-card ${drift ? 'economy-banner--drift' : 'economy-banner--ok'}`} role="status" style={{
            padding: '0.8rem 1.2rem',
            borderRadius: '10px',
            border: drift ? '1px solid rgba(255, 75, 75, 0.35)' : '1px solid rgba(20, 241, 149, 0.35)',
            background: drift ? 'rgba(255, 75, 75, 0.08)' : 'rgba(20, 241, 149, 0.08)',
            color: drift ? '#ff9ea8' : '#14f195',
            fontSize: '0.85rem',
            textAlign: 'left',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <strong>Economía canónica</strong> · versión {version}
        {drift ? (<span style={{ fontWeight: 'bold' }}>⚠️ Drift detectado vs on-chain</span>) : (<span>✓ Alineada con API</span>)}
      </div>
      {drift && driftReasons.length > 0 && (<ul style={{ margin: '4px 0 0 1rem', padding: 0, fontSize: '0.78rem', color: '#ffc1cc' }}>
          {driftReasons.map((r, i) => (<li key={i}>{r}</li>))}
        </ul>)}
    </div>);
}
