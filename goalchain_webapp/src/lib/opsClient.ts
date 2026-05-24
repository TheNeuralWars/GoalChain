export type MintGateAction = 'mint_allow' | 'mint_pause_48h' | 'mint_review';

export interface OpsStatus {
  timestamp_iso: string;
  mint_gate: {
    available: boolean;
    allow: boolean;
    action: MintGateAction;
    max_mint_gch: number;
    emit_7d_gch: number;
    burn_7d_gch: number;
    ratio_burn_over_emit: number;
    reason: string;
  };
  vault_crank: {
    available: boolean;
    stale: boolean;
    timestamp_iso: string | null;
    mode: 'dry-run' | 'execute' | null;
    excess_sol: number;
    estimated_gch_burned: number;
    buyback_sol: number;
    notes: string[];
  };
  contributor_epoch: {
    available: boolean;
    builder_fund_pda: string | null;
    current_epoch: number;
    total_inflow: number;
    contributor_allocated: number;
    latest_epoch: {
      epoch_id: number;
      contributor_pool: number;
      contributor_count: number;
      finalized: boolean;
      finalized_at: number;
    } | null;
  };
}

const DEFAULT_API = 'http://localhost:3001';

export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, '') : DEFAULT_API;
}

export async function fetchOpsStatus(signal?: AbortSignal): Promise<OpsStatus> {
  const res = await fetch(`${apiBaseUrl()}/api/ops/status`, { signal });
  if (!res.ok) {
    throw new Error(`Ops status HTTP ${res.status}`);
  }
  return res.json() as Promise<OpsStatus>;
}
