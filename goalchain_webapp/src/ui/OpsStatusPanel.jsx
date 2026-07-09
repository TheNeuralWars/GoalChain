import React, { useEffect, useState } from 'react';
import { fetchOpsStatus } from '../lib/opsClient';
const toneColor = {
    ok: '#14f195',
    warn: '#ffd700',
    bad: '#ff6b6b',
    muted: '#94a3b8',
};
function Badge({ label, tone }) {
    return (<span style={{
            display: 'inline-block',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: toneColor[tone],
            border: `1px solid ${toneColor[tone]}55`,
            background: `${toneColor[tone]}14`,
        }}>
      {label}
    </span>);
}
function mintGateTone(status) {
    if (!status.available)
        return 'muted';
    if (!status.allow)
        return 'bad';
    if (status.action === 'mint_review')
        return 'warn';
    return 'ok';
}
function vaultTone(status) {
    if (!status.available)
        return 'muted';
    if (status.stale)
        return 'warn';
    if (status.mode === 'execute')
        return 'ok';
    return 'warn';
}
function epochTone(status) {
    if (!status.available)
        return 'muted';
    const epoch = status.latest_epoch;
    if (!epoch)
        return 'warn';
    return epoch.finalized ? 'ok' : 'warn';
}
export const OpsStatusPanel = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const payload = await fetchOpsStatus(controller.signal);
                if (mounted) {
                    setData(payload);
                    setError(null);
                }
            }
            catch (err) {
                if (mounted && !controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Failed to load ops status');
                    setData(null);
                }
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        const interval = window.setInterval(async () => {
            try {
                const payload = await fetchOpsStatus();
                if (mounted) {
                    setData(payload);
                    setError(null);
                }
            }
            catch {
                /* keep last good snapshot */
            }
        }, 60_000);
        return () => {
            mounted = false;
            controller.abort();
            window.clearInterval(interval);
        };
    }, []);
    const cardStyle = {
        background: 'rgba(13, 13, 20, 0.65)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '1rem 1.1rem',
        textAlign: 'left',
    };
    return (<section style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1rem' }}>Ops Backend Status</h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mint gate · vault crank · contributor epoch</span>
      </div>

      {loading && !data && <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading ops status…</p>}
      {error && (<p style={{ color: '#ff9a9a', fontSize: '0.85rem' }}>
          API offline ({error}). Start <code>goalchain_api</code> or set <code>VITE_API_BASE_URL</code>.
        </p>)}

      {data && (<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          <article style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#f8fafc' }}>Mint Gate</strong>
              <Badge label={data.mint_gate.allow ? data.mint_gate.action : 'paused'} tone={mintGateTone(data.mint_gate)}/>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.45 }}>
              Ratio 7d: {(data.mint_gate.ratio_burn_over_emit * 100).toFixed(1)}% · max mint{' '}
              {data.mint_gate.max_mint_gch.toLocaleString()} GCH
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>{data.mint_gate.reason}</p>
          </article>

          <article style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#f8fafc' }}>Vault Crank</strong>
              <Badge label={data.vault_crank.available ? (data.vault_crank.stale ? 'stale' : data.vault_crank.mode ?? 'unknown') : 'no data'} tone={vaultTone(data.vault_crank)}/>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.45 }}>
              Excess {data.vault_crank.excess_sol.toFixed(2)} SOL · est. burn{' '}
              {Math.round(data.vault_crank.estimated_gch_burned).toLocaleString()} GCH
            </p>
            {data.vault_crank.timestamp_iso && (<p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Last report: {new Date(data.vault_crank.timestamp_iso).toLocaleString()}
              </p>)}
          </article>

          <article style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <strong style={{ color: '#f8fafc' }}>Contributor Epoch</strong>
              <Badge label={!data.contributor_epoch.available
                ? 'off-chain'
                : data.contributor_epoch.latest_epoch?.finalized
                    ? `epoch ${data.contributor_epoch.current_epoch} final`
                    : `epoch ${data.contributor_epoch.current_epoch} open`} tone={epochTone(data.contributor_epoch)}/>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.45 }}>
              Pool allocated {data.contributor_epoch.contributor_allocated.toLocaleString()} · inflow{' '}
              {data.contributor_epoch.total_inflow.toLocaleString()}
            </p>
            {data.contributor_epoch.latest_epoch && (<p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Contributors snapshotted: {data.contributor_epoch.latest_epoch.contributor_count}
              </p>)}
          </article>
        </div>)}
    </section>);
};
