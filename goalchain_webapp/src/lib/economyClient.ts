import { apiBaseUrl } from './opsClient';

export interface EconomyConfigResponse {
  config_version?: string;
  canonicalConfig?: {
    config_version?: string;
    [key: string]: unknown;
  };
  canonical_config?: Record<string, unknown>;
  onchainConfig?: Record<string, unknown> | null;
  drift?: { has_drift?: boolean; fields?: string[] };
  config_drift_reasons?: string[];
}

export async function fetchEconomyConfig(signal?: AbortSignal): Promise<EconomyConfigResponse> {
  const res = await fetch(`${apiBaseUrl()}/api/economy/config`, { signal });
  if (!res.ok) {
    throw new Error(`Economy config HTTP ${res.status}`);
  }
  return res.json() as Promise<EconomyConfigResponse>;
}

// ==================== Economy Metrics & Health ====================

export interface EconomyMetricsFlow {
  emissions_gch: number;
  burns_gch: number;
  net_emission_gch?: number; // only in 24h
}

export interface EconomyMetricsBreakdown {
  potion_burn_gch: number;
  fee_burn_gch: number;
  vault_buyback_gch: number;
  treasury_fees_gch: number;
}

export interface EconomyMetricsKPIs {
  emit_burn_ratio_7d: number;
  onchain_sink_coverage: number;
  config_drift: number;
  vault_buyback_coverage: number;
}

export interface EconomyMetricsSource {
  canonical_config: string;
  burn_tracker: string;
  scenarios_csv: string;
  baseline_scenario_id: string | null;
}

export interface EconomyMetricsResponse {
  timestamp_iso: string;
  kpis: EconomyMetricsKPIs;
  flow_24h: EconomyMetricsFlow & { net_emission_gch: number };
  flow_7d: EconomyMetricsFlow;
  breakdown: EconomyMetricsBreakdown;
  config_drift_reasons: string[];
  source: EconomyMetricsSource;
}

export async function fetchEconomyMetrics(signal?: AbortSignal): Promise<EconomyMetricsResponse> {
  const res = await fetch(`${apiBaseUrl()}/api/economy/metrics`, { signal });
  if (!res.ok) {
    throw new Error(`Economy metrics HTTP ${res.status}`);
  }
  return res.json() as Promise<EconomyMetricsResponse>;
}

export type EconomyHealthStatus = 'healthy' | 'warning' | 'critical';

export interface EconomyHealthCheck {
  key: string;
  value: number;
  min?: number;
  max?: number;
  pass: boolean;
}

export interface EconomyHealthResponse {
  timestamp_iso: string;
  status: EconomyHealthStatus;
  failing_checks: string[];
  thresholds: {
    emit_burn_ratio_min: number;
    emit_burn_ratio_max: number;
    onchain_sink_coverage_min: number;
    config_drift_max: number;
    vault_buyback_coverage_min: number;
  };
  checks: EconomyHealthCheck[];
  kpis: EconomyMetricsKPIs;
  config_drift_reasons: string[];
}

export async function fetchEconomyHealth(signal?: AbortSignal): Promise<EconomyHealthResponse> {
  const res = await fetch(`${apiBaseUrl()}/api/economy/health`, { signal });
  if (!res.ok) {
    throw new Error(`Economy health HTTP ${res.status}`);
  }
  return res.json() as Promise<EconomyHealthResponse>;
}
