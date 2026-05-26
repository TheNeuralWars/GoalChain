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
