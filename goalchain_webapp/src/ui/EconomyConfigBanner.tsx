import React, { useEffect, useState } from 'react';
import { fetchEconomyConfig } from '../lib/economyClient';

interface EconomyConfigResponse {
  config_version?: string;
  canonicalConfig?: Record<string, unknown> | null;
  onchainConfig?: Record<string, unknown> | null;
  drift?: { has_drift?: boolean; fields?: string[] } | null;
  config_drift_reasons?: string[];
}

export function EconomyConfigBanner() {
  const [version, setVersion] = useState<string | null>(null);
  const [drift, setDrift] = useState<boolean | null>(null);
  const [driftReasons, setDriftReasons] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetchEconomyConfig(ac.signal)
      .then((cfg) => {
        // Use API-provided config_version
        const configVersion = cfg.config_version ?? "v1.0.0-p0";
        setVersion(configVersion);

        // Use API-provided drift
        const apiDrift = cfg.drift;
        const reasons = cfg.config_drift_reasons ?? [];

        if (apiDrift?.has_drift) {
          setDrift(true);
          setDriftReasons(reasons);
        } else {
          setDrift(false);
          setDriftReasons([]);
        }

        setError(null);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") {
          setError("No se pudo cargar la econom\u00eda can\u00f3nica desde la API.");
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
      className={`economy-banner glass-card ${drift ? "economy-banner--drift" : "economy-banner--ok"}`}
      role="status"
      style={{
        padding: "0.8rem 1.2rem",
        borderRadius: "10px",
        border: drift ? "1px solid rgba(255, 75, 75, 0.35)" : "1px solid rgba(20, 241, 149, 0.35)",
        background: drift ? "rgba(255, 75, 75, 0.08)" : "rgba(20, 241, 149, 0.08)",
        color: drift ? "#ff9ea8" : "#14f195",
        fontSize: "0.85rem",
        textAlign: "left",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <strong>Econom\u00eda can\u00f3nica</strong> \u00b7 versi\u00f3n {version}
        {drift ? (
          <span style={{ fontWeight: "bold" }}>⚠️ Drift detectado vs on-chain</span>
        ) : (
          <span>✓ Alineada con API</span>
        )}
      </div>
      {drift && driftReasons.length > 0 && (
        <ul style={{ margin: "4px 0 0 1rem", padding: 0, fontSize: "0.78rem", color: "#ffc1cc" }}>
          {driftReasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
