import React, { useEffect, useState } from 'react';
import { fetchEconomyConfig } from '../lib/economyClient';

export function EconomyConfigBanner() {
  const [version, setVersion] = useState<string | null>(null);
  const [drift, setDrift] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchEconomyConfig(ac.signal)
      .then((cfg) => {
        const canonical =
          cfg.canonicalConfig ??
          (cfg as { canonical_config?: { config_version?: string } }).canonical_config;
        setVersion(canonical?.config_version ?? cfg.config_version ?? 'unknown');
        const d = cfg.drift as { has_drift?: boolean } | undefined;
        const reasons = (cfg as { config_drift_reasons?: string[] }).config_drift_reasons;
        if (d?.has_drift !== undefined) {
          setDrift(Boolean(d.has_drift));
        } else if (Array.isArray(reasons)) {
          setDrift(reasons.length > 0);
        } else {
          setDrift(cfg.onchainConfig == null ? null : false);
        }
        setError(null);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') {
          setError('No se pudo cargar la economía canónica desde la API.');
        }
      });
    return () => ac.abort();
  }, []);

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
    >
      <strong>Economía canónica</strong> — versión {version}
      {drift === true && (
        <span className="economy-banner-drift"> · drift detectado vs on-chain (revisar ops)</span>
      )}
      {drift === false && <span> · alineada con API</span>}
    </div>
  );
}
