import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SimulationBadge } from '../components/SimulationBadge';
import { 
  fetchEconomyMetrics, 
  fetchEconomyHealth, 
  type EconomyMetricsResponse, 
  type EconomyHealthResponse, 
  type EconomyHealthStatus 
} from '../lib/economyClient';
import { InfinityFlame } from '../components/InfinityFlame';
import { VaultStrategyCard, VAULT_STRATEGIES } from '../components/VaultStrategyCard';
import { YieldCalculator } from '../components/YieldCalculator';
import { HealthCheckCard } from '../components/HealthCheckCard';
import { KPIOverlay, FlameIntensityBar, RatioIndicatorLabels, StatsBreakdownGrid } from '../components/StakingDashboardComponents';

const HEALTH_STATUS_COLOR: Record<EconomyHealthStatus, string> = {
  healthy: 'var(--primary-neon)',
  warning: '#f5a623',
  critical: 'var(--accent-red)',
};

const HEALTH_STATUS_LABEL: Record<EconomyHealthStatus, string> = {
  healthy: 'HEALTHY',
  warning: 'WARNING',
  critical: 'CRITICAL',
};

export const StakingBurnDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<EconomyMetricsResponse | null>(null);
  const [health, setHealth] = useState<EconomyHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'sentinel' | 'arbitrageur' | 'orchestrator'>('sentinel');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intensityRef = useRef<number>(0);

  // Fetch data
  const loadData = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError(null);
      const [metricsData, healthData] = await Promise.all([
        fetchEconomyMetrics(controller.signal),
        fetchEconomyHealth(controller.signal),
      ]);
      setMetrics(metricsData);
      setHealth(healthData);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Animate flame intensity based on emit/burn ratio
  useEffect(() => {
    if (!metrics) return;
    const ratio = metrics.kpis.emit_burn_ratio_7d ?? 0;
    const targetIntensity = Math.min(1, Math.max(0, ratio));
    const duration = 2000;
    const start = intensityRef.current;
    const startTime = performance.now();

    function animate(now: number) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      intensityRef.current = start + (targetIntensity - start) * eased;
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [metrics]);

  const strategy = VAULT_STRATEGIES.find(s => s.id === selectedStrategy) || VAULT_STRATEGIES[0];
  const vaultBuybackCoverage = metrics?.kpis.vault_buyback_coverage ?? 0.25;

  // Loading state with glass skeleton
  if (loading && !metrics) {
    return (
      <div className="staking-burn-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card-premium skeleton-loader" style={{ minHeight: '120px' }} aria-busy="true" aria-label="Loading dashboard header" />
        <div className="glass-card-flame skeleton-loader" style={{ minHeight: '280px' }} aria-busy="true" aria-label="Loading flame visualization" />
        <div className="glass-card-premium skeleton-loader" style={{ minHeight: '200px' }} aria-busy="true" aria-label="Loading stats breakdown" />
        <div className="glass-card-premium skeleton-loader" style={{ minHeight: '300px' }} aria-busy="true" aria-label="Loading yield calculator" />
        <div className="glass-card-premium skeleton-loader" style={{ minHeight: '200px' }} aria-busy="true" aria-label="Loading health checks" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card-premium" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--accent-red)' }}>Failed to load data: {error}</p>
        <button className="btn-neon-purple" style={{ marginTop: '1rem' }} onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  const ratio = metrics?.kpis.emit_burn_ratio_7d ?? 0;

  return (
    <div className="staking-burn-dashboard" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-neon-green" style={{ margin: 0, fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span role="img" aria-label="fire">🔥</span> Infinity Burn &amp; Staking Dashboard
            <SimulationBadge />
          </h1>
          <p style={{ opacity: 0.7, fontSize: '0.95rem', marginTop: '0.25rem', maxWidth: '600px' }}>
            Real-time $GCH burn mechanics, staking yield projections, and protocol health — powered by live economy endpoints.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {health && (
            <div
              className="glass-card-premium health-status-badge"
              style={{
                border: `1px solid ${HEALTH_STATUS_COLOR[health.status]}`,
                boxShadow: `0 0 20px ${HEALTH_STATUS_COLOR[health.status]}40`,
                padding: '0.75rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: HEALTH_STATUS_COLOR[health.status],
                  boxShadow: `0 0 8px ${HEALTH_STATUS_COLOR[health.status]}`,
                  animation: 'pulse-glow 2s infinite',
                }}
                aria-hidden="true"
              />
              <span style={{ fontWeight: 800, color: HEALTH_STATUS_COLOR[health.status], textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                {HEALTH_STATUS_LABEL[health.status]}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                {health.failing_checks.length > 0 ? `${health.failing_checks.length} checks failing` : 'All checks passing'}
              </span>
            </div>
          )}
          {lastUpdated && (
            <span style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Infinity Burn Visualizer — Hero Card */}
      <div className="glass-card-flame infinity-burn-card" style={{ position: 'relative', overflow: 'hidden', minHeight: '320px' }}>
        {/* Background Flame Animation */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <InfinityFlame 
            intensity={intensityRef.current}
            width={400}
            height={280}
            enableParticles={true}
            className="flame-layer"
          />
        </div>

        {/* KPI Overlay Stats */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <KPIOverlay metrics={metrics} />
        </div>

        {/* Ratio Indicator Bar */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 1.5rem 1.5rem' }}>
          <RatioIndicatorLabels />
          <FlameIntensityBar ratio={ratio} />
        </div>
      </div>

      {/* Stats Breakdown Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span role="img" aria-label="chart">📊</span> Economy Breakdown &amp; KPIs
        </h2>
        <StatsBreakdownGrid metrics={metrics} />
      </div>

      {/* Vault Strategy Selector + Yield Calculator */}
      <div className="glass-card-premium" style={{ padding: '1.5rem' }}>
        {/* Strategy Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.75rem' }}>
            Select Vault Strategy
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {VAULT_STRATEGIES.map(s => (
              <VaultStrategyCard
                key={s.id}
                strategy={s}
                isSelected={selectedStrategy === s.id}
                onSelect={() => setSelectedStrategy(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedStrategy(s.id);
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Yield Calculator */}
        <YieldCalculator
          selectedStrategy={selectedStrategy}
          strategies={VAULT_STRATEGIES}
          vaultBuybackCoverage={vaultBuybackCoverage}
          gchPrice={0.001}
          solPrice={150}
          onStakeAmountChange={(amount) => {}}
          onStakeTokenChange={(token) => {}}
        />
      </div>

      {/* Health Checks Detail */}
      {health && (
        <HealthCheckCard
          checks={health.checks}
          configDriftReasons={health.config_drift_reasons}
        />
      )}
    </div>
  );
};

export default StakingBurnDashboard;