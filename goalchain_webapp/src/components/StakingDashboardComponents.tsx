import React from 'react';

interface KPIOverlayProps {
  metrics: {
    flow_24h: {
      burns_gch: number;
      emissions_gch: number;
      net_emission_gch: number;
    };
    flow_7d: {
      burns_gch: number;
      emissions_gch: number;
    };
    kpis: {
      emit_burn_ratio_7d: number;
    };
  } | null;
  className?: string;
}

const formatLargeNumber = (val: number): string => {
  if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
  return val.toFixed(2);
};

const formatNumber = (val: number, decimals = 2): string => {
  return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const KPIOverlay: React.FC<KPIOverlayProps> = ({ metrics, className = '' }) => {
  if (!metrics) return null;

  const netEmission = metrics.flow_24h.net_emission_gch;
  const isDeflationary = netEmission <= 0;
  const ratio = metrics.kpis.emit_burn_ratio_7d || 0;

  return (
    <div className={`kpi-overlay-grid ${className}`} role="region" aria-label="24-hour economy KPIs">
      <div className="kpi-overlay-stat">
        <div className="kpi-overlay-value burn" aria-label={`${formatLargeNumber(metrics.flow_24h.burns_gch)} GCH burned in 24 hours`}>
          {formatLargeNumber(metrics.flow_24h.burns_gch)}
        </div>
        <div className="kpi-overlay-label">$GCH Burned / 24h</div>
      </div>
      <div className="kpi-overlay-stat">
        <div className="kpi-overlay-value emit" aria-label={`${formatLargeNumber(metrics.flow_24h.emissions_gch)} GCH emitted in 24 hours`}>
          {formatLargeNumber(metrics.flow_24h.emissions_gch)}
        </div>
        <div className="kpi-overlay-label">$GCH Emitted / 24h</div>
      </div>
      <div className="kpi-overlay-stat">
        <div 
          className="kpi-overlay-value net" 
          style={{ color: isDeflationary ? 'var(--primary-neon)' : 'var(--accent-red)' }}
          aria-label={`Net emission ${isDeflationary ? 'negative' : 'positive'}: ${formatNumber(netEmission)} GCH`}
        >
          {isDeflationary ? '+' : ''}{formatNumber(netEmission)}
        </div>
        <div className="kpi-overlay-label">Net Emission / 24h</div>
      </div>
      <div className="kpi-overlay-stat">
        <div className="kpi-overlay-value ratio" aria-label={`Burn to emit ratio over 7 days: ${(ratio * 100).toFixed(1)}%`}>
          {(ratio * 100).toFixed(1)}%
        </div>
        <div className="kpi-overlay-label">Burn / Emit Ratio (7d)</div>
      </div>
    </div>
  );
};

interface FlameIntensityBarProps {
  ratio: number;
  className?: string;
}

export const FlameIntensityBar: React.FC<FlameIntensityBarProps> = ({ ratio = 0, className = '' }) => {
  const clampedRatio = Math.min(1, Math.max(0, ratio));
  const markerPosition = `${clampedRatio * 100}%`;
  const fillWidth = `${clampedRatio * 100}%`;

  return (
    <div className={`flame-intensity-bar ${className}`} role="progressbar" aria-valuenow={Math.round(clampedRatio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Burn to emit ratio">
      <div className="flame-intensity-fill" style={{ width: fillWidth }}>
        <div className="flame-intensity-marker" style={{ ['--marker-position']: markerPosition } as any} />
      </div>
      <div className="flame-target-zone" />
    </div>
  );
};

interface RatioIndicatorLabelsProps {
  className?: string;
}

export const RatioIndicatorLabels: React.FC<RatioIndicatorLabelsProps> = ({ className = '' }) => (
  <div className={`flame-ratio-labels ${className}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
    <span>Deflationary &lt; 100%</span>
    <span>Equilibrium 100%</span>
    <span>Inflationary &gt; 100%</span>
  </div>
);

interface StatBreakdownProps {
  label: string;
  value: number;
  color: string;
  description?: string;
  className?: string;
}

export const StatBreakdown: React.FC<StatBreakdownProps> = ({ 
  label, 
  value, 
  color, 
  description, 
  className = '' 
}) => {
  const formatLargeNumber = (val: number): string => {
    if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    return val.toFixed(2);
  };

  return (
    <div 
      className={`glass-card-premium stat-breakdown-card ${className}`} 
      style={{ ['--card-accent']: color } as any}
    >
      <div className="stat-breakdown-label">{label}</div>
      <div className="stat-breakdown-value">{formatLargeNumber(value)}</div>
      {description && <div className="stat-breakdown-desc">{description}</div>}
    </div>
  );
};

interface StatsBreakdownGridProps {
  metrics: {
    breakdown: {
      potion_burn_gch: number;
      fee_burn_gch: number;
      vault_buyback_gch: number;
      treasury_fees_gch: number;
    };
    kpis: {
      onchain_sink_coverage: number;
      config_drift: number;
      vault_buyback_coverage: number;
    };
  } | null;
  className?: string;
}

export const StatsBreakdownGrid: React.FC<StatsBreakdownGridProps> = ({ metrics, className = '' }) => {
  if (!metrics) return null;

  const breakdownItems = [
    { 
      label: 'Potion Burns', 
      value: metrics.breakdown.potion_burn_gch, 
      color: 'var(--secondary-neon)', 
      desc: 'Stamina potion consumption' 
    },
    { 
      label: 'Fee Burns', 
      value: metrics.breakdown.fee_burn_gch, 
      color: 'var(--accent-red)', 
      desc: 'Protocol fee allocation' 
    },
    { 
      label: 'Vault Buybacks', 
      value: metrics.breakdown.vault_buyback_gch, 
      color: 'var(--primary-neon)', 
      desc: 'Automated market buybacks' 
    },
    { 
      label: 'Treasury Fees', 
      value: metrics.breakdown.treasury_fees_gch, 
      color: '#fbbf24', 
      desc: 'Treasury accumulation' 
    },
  ];

  const kpiItems = [
    { 
      label: 'On-Chain Sink Coverage', 
      value: `${metrics.kpis.onchain_sink_coverage.toFixed(1)}%`, 
      color: metrics.kpis.onchain_sink_coverage >= 90 ? 'var(--primary-neon)' : 'var(--accent-red)', 
      target: '≥ 90%' 
    },
    { 
      label: 'Config Drift', 
      value: metrics.kpis.config_drift.toString(), 
      color: metrics.kpis.config_drift === 0 ? 'var(--primary-neon)' : 'var(--accent-red)', 
      target: '0' 
    },
    { 
      label: 'Vault Buyback Coverage', 
      value: `${(metrics.kpis.vault_buyback_coverage * 100).toFixed(1)}%`, 
      color: metrics.kpis.vault_buyback_coverage >= 0.25 ? 'var(--primary-neon)' : '#f5a623', 
      target: '≥ 25%' 
    },
  ];

  return (
    <div className={`stats-breakdown-grid ${className}`} role="region" aria-label="Economy breakdown and KPIs">
      {breakdownItems.map((item, idx) => (
        <StatBreakdown
          key={idx}
          label={item.label}
          value={item.value}
          color={item.color}
          description={item.desc}
        />
      ))}
      {kpiItems.map((item, idx) => (
        <div key={idx} className={`glass-card-premium stat-breakdown-card ${className}`} style={{ ['--card-accent']: item.color } as any}>
          <div className="stat-breakdown-label">{item.label}</div>
          <div className="stat-breakdown-value" style={{ fontSize: '1.25rem' }}>{item.value}</div>
          <div className="stat-breakdown-desc">Target: {item.target}</div>
        </div>
      ))}
    </div>
  );
};

export default KPIOverlay;