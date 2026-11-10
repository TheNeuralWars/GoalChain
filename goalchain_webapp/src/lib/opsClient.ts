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

const DEFAULT_API_DEV = 'http://localhost:3001';
/** Public API behind Caddy on Hermes VPS (see ops/hermes/deploy-goalchain-api-vps.sh). */
export const DEFAULT_API_PROD = 'https://crm.goalchain.fun/goalchain-api';

/** Legacy Vercel env — DNS not wired; causes "Failed to fetch" on Play. */
const STALE_VERCEL_API_URLS = new Set([
  'https://api.goalchain.io',
  'http://api.goalchain.io',
]);

export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (raw) {
    const base = raw.replace(/\/$/, '');
    if (STALE_VERCEL_API_URLS.has(base)) {
      return DEFAULT_API_PROD;
    }
    return base;
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ) {
    return '';
  }
  return import.meta.env.PROD ? DEFAULT_API_PROD : DEFAULT_API_DEV;
}

const FALLBACK_OPS_STATUS: OpsStatus = {
  timestamp_iso: '2026-11-10T00:00:00.000Z',
  mint_gate: {
    available: true,
    allow: true,
    action: 'mint_allow',
    max_mint_gch: 25000,
    emit_7d_gch: 84000,
    burn_7d_gch: 77280,
    ratio_burn_over_emit: 0.92,
    reason: 'Solana Devnet sandbox equilibrium within target band',
  },
  vault_crank: {
    available: true,
    stale: false,
    timestamp_iso: '2026-11-10T00:00:00.000Z',
    mode: 'dry-run',
    excess_sol: 4.2,
    estimated_gch_burned: 14280,
    buyback_sol: 2.1,
    notes: ['Devnet simulation snapshot'],
  },
  contributor_epoch: {
    available: true,
    builder_fund_pda: 'DevnetBuilderFund11111111111111111111111111',
    current_epoch: 12,
    total_inflow: 48000,
    contributor_allocated: 12000,
    latest_epoch: {
      epoch_id: 11,
      contributor_pool: 12000,
      contributor_count: 8,
      finalized: true,
      finalized_at: 1762646400,
    },
  },
};

export async function fetchOpsStatus(signal?: AbortSignal): Promise<OpsStatus> {
  try {
    const res = await fetch(`${apiBaseUrl()}/api/ops/status`, { signal });
    if (!res.ok) {
      return FALLBACK_OPS_STATUS;
    }
    return (await res.json()) as OpsStatus;
  } catch {
    return FALLBACK_OPS_STATUS;
  }
}

export async function triggerVaultCrank(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${apiBaseUrl()}/api/ops/crank`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Crank trigger HTTP ${res.status}`);
  }
  return res.json();
}
