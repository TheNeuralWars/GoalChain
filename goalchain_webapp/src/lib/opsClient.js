const DEFAULT_API_DEV = 'http://localhost:3001';
/** Public API behind Caddy on Hermes VPS (see ops/hermes/deploy-goalchain-api-vps.sh). */
export const DEFAULT_API_PROD = 'https://crm.goalchain.fun/goalchain-api';
/** Legacy Vercel env — DNS not wired; causes "Failed to fetch" on Play. */
const STALE_VERCEL_API_URLS = new Set([
    'https://api.goalchain.io',
    'http://api.goalchain.io',
]);
export function apiBaseUrl() {
    const raw = import.meta.env.VITE_API_BASE_URL?.trim();
    if (raw) {
        const base = raw.replace(/\/$/, '');
        if (STALE_VERCEL_API_URLS.has(base)) {
            return DEFAULT_API_PROD;
        }
        return base;
    }
    return import.meta.env.PROD ? DEFAULT_API_PROD : DEFAULT_API_DEV;
}
export async function fetchOpsStatus(signal) {
    const res = await fetch(`${apiBaseUrl()}/api/ops/status`, { signal });
    if (!res.ok) {
        throw new Error(`Ops status HTTP ${res.status}`);
    }
    return res.json();
}
