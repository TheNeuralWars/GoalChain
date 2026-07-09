import { apiBaseUrl } from './opsClient';
export async function fetchEconomyConfig(signal) {
    const res = await fetch(`${apiBaseUrl()}/api/economy/config`, { signal });
    if (!res.ok) {
        throw new Error(`Economy config HTTP ${res.status}`);
    }
    return res.json();
}
export async function fetchEconomyMetrics(signal) {
    const res = await fetch(`${apiBaseUrl()}/api/economy/metrics`, { signal });
    if (!res.ok) {
        throw new Error(`Economy metrics HTTP ${res.status}`);
    }
    return res.json();
}
export async function fetchEconomyHealth(signal) {
    const res = await fetch(`${apiBaseUrl()}/api/economy/health`, { signal });
    if (!res.ok) {
        throw new Error(`Economy health HTTP ${res.status}`);
    }
    return res.json();
}
