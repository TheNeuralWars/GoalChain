import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import { fetchWithTimeout } from "@goalchain/sdk";
// 10-second TTL cache for priority fee estimates
const PRIORITY_FEE_CACHE = new Map();
const CACHE_TTL_MS = 10_000; // 10 seconds
/**
 * Generates a cache key from account keys
 */
function getCacheKey(accountKeys) {
    return accountKeys.sort().join(',');
}
/**
 * Checks if cached entry is still valid
 */
function isCacheValid(entry) {
    return Date.now() - entry.timestamp < CACHE_TTL_MS;
}
/**
 * Fetches the priority fee estimate from Helius RPC if available,
 * or queries the standard Solana RPC native prioritization fees.
 * Results are cached for 10 seconds.
 */
export async function getPriorityFeeEstimate(connection, accountKeys) {
    const cacheKey = getCacheKey(accountKeys);
    const cached = PRIORITY_FEE_CACHE.get(cacheKey);
    if (cached && isCacheValid(cached)) {
        console.log(`[Priority Fees] Cache hit for ${accountKeys.length} accounts: ${cached.value} micro-lamports`);
        return cached.value;
    }
    const rpcUrl = connection.rpcEndpoint;
    let estimate = null;
    // 1. Try Helius if it is a Helius endpoint
    if (rpcUrl.includes("helius")) {
        try {
            const response = await fetchWithTimeout(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "helius-priority-fee",
                    method: "getPriorityFeeEstimate",
                    params: [
                        {
                            accountKeys,
                            options: {
                                recommended: true,
                            },
                        },
                    ],
                }),
                timeoutMs: 5000, // 5 second timeout for Helius
            });
            const data = (await response.json());
            if (data.result && data.result.priorityFeeEstimate) {
                estimate = Math.ceil(data.result.priorityFeeEstimate);
                console.log(`[Priority Fees] Helius recommended estimate: ${estimate} micro-lamports`);
            }
        }
        catch (err) {
            console.warn("[Priority Fees] Failed to query Helius API, falling back to standard Solana native query:", err);
        }
    }
    // 2. Fallback: Query standard Solana RPC native prioritization fees
    if (estimate === null) {
        try {
            console.log(`[Priority Fees] Querying standard Solana native prioritization fees...`);
            const recentFees = await connection.getRecentPrioritizationFees({
                lockedWritableAccounts: accountKeys.map(k => new PublicKey(k))
            });
            if (recentFees && recentFees.length > 0) {
                const sorted = recentFees.map(f => f.prioritizationFee).sort((a, b) => a - b);
                estimate = sorted[Math.floor(sorted.length * 0.75)]; // 75th percentile
                console.log(`[Priority Fees] Solana native 75th-percentile estimate: ${estimate} micro-lamports`);
                estimate = Math.max(estimate, 10000); // Ensure at least 10,000 micro-lamports
            }
        }
        catch (err) {
            console.warn("[Priority Fees] Failed to query Solana native prioritization fees:", err);
        }
    }
    // 3. Last resort fallback
    if (estimate === null) {
        estimate = 10000;
        console.log(`[Priority Fees] Using default fallback: 10,000 micro-lamports.`);
    }
    // Cache the result
    PRIORITY_FEE_CACHE.set(cacheKey, {
        value: estimate,
        timestamp: Date.now(),
    });
    return estimate;
}
/**
 * Generates compute budget and priority fee instructions.
 */
export async function getPriorityFeeInstructions(connection, accountKeys, computeUnitsLimit = 200000) {
    const microLamports = await getPriorityFeeEstimate(connection, accountKeys);
    return [
        ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitsLimit }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
    ];
}
/**
 * Clears the priority fee cache (useful for testing)
 */
export function clearPriorityFeeCache() {
    PRIORITY_FEE_CACHE.clear();
}
