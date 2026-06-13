import React, { useEffect, useState } from 'react';
import { fetchEconomyConfig } from '../lib/economyClient';
import { useTranslation } from '../i18n';

interface CanonicalConfig {
  config_version?: string;
  core_parameters?: {
    max_fee_bps?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface OnchainConfig {
  feeBps?: number;
  feeBurnBps?: number;
  feeJackpotBps?: number;
  maxStartersPerManager?: number;
  [key: string]: unknown;
}

export function EconomyConfigBanner() {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string | null>(null);
  const [drift, setDrift] = useState<boolean | null>(null);
  const [driftReasons, setDriftReasons] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchEconomyConfig(ac.signal)
      .then((cfg) => {
        const canonical = (cfg.canonicalConfig ?? cfg.canonical_config) as CanonicalConfig | undefined;
        const configVersion = canonical?.config_version ?? cfg.config_version ?? 'v1.0.0-p0';
        setVersion(configVersion);

        const onchain = cfg.onchainConfig as OnchainConfig | undefined;
        const reasons: string[] = [];

        if (canonical && onchain) {
          // 1. Validar max_fee_bps
          const maxFeeBps = Number(canonical.core_parameters?.max_fee_bps ?? 0);
          const feeBps = Number(onchain.feeBps ?? 0);
          if (maxFeeBps > 0 && feeBps > maxFeeBps) {
            reasons.push(t('econ_reason_fee_exceeds', { feeBps, maxFeeBps }));
          }

          // 2. Validar maxStartersPerManager
          const maxStarters = Number(onchain.maxStartersPerManager ?? 0);
          if (maxStarters !== 11) {
            reasons.push(t('econ_reason_starters_differs', { maxStarters }));
          }

          // 3. Validar fee split sum
          const feeBurn = Number(onchain.feeBurnBps ?? 0);
          const feeJackpot = Number(onchain.feeJackpotBps ?? 0);
          if (feeBurn + feeJackpot > 10000) {
            reasons.push(t('econ_reason_fee_split_exceeds'));
          }
        }

        setDriftReasons(reasons);
        setDrift(reasons.length > 0);
        setError(null);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') {
          setError(t('econ_error_load'));
        }
      });
    return () => ac.abort();
  }, []); // t is stable from useTranslation

  if (error) {
    return (
      <div className="economy-banner economy-banner--warn glass-card" role="status">
        {error}
      </div>
    );
  }

  if (!version) return null;

  return (
    <div
      className={`economy-banner glass-card ${drift ? 'economy-banner--drift' : 'economy-banner--ok'}`}
      role="status"
      style={{
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
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <strong>{t('econ_label_canonical')}</strong> · versión {version}
        {drift ? (
          <span style={{ fontWeight: 'bold' }}>{t('econ_drift_detected')}</span>
        ) : (
          <span>{t('econ_aligned')}</span>
        )}
      </div>
      {drift && driftReasons.length > 0 && (
        <ul style={{ margin: '4px 0 0 1rem', padding: 0, fontSize: '0.78rem', color: '#ffc1cc' }}>
          {driftReasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
