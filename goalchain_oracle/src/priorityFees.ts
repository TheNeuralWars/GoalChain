import { Connection, ComputeBudgetProgram, TransactionInstruction, PublicKey } from "@solana/web3.js";

/**
 * Fetches the priority fee estimate from Helius RPC if available,
 * or queries the standard Solana RPC native prioritization fees.
 */
export async function getPriorityFeeEstimate(
    connection: Connection,
    accountKeys: string[]
): Promise<number> {
    const rpcUrl = connection.rpcEndpoint;
    
    // 1. Try Helius if it is a Helius endpoint
    if (rpcUrl.includes("helius")) {
        try {
            const response = await fetch(rpcUrl, {
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
            });

            const data = (await response.json()) as any;
            if (data.result && data.result.priorityFeeEstimate) {
                const estimate = Math.ceil(data.result.priorityFeeEstimate);
                console.log(`[Priority Fees] Helius recommended estimate: ${estimate} micro-lamports`);
                return estimate;
            }
        } catch (err) {
            console.warn("[Priority Fees] Failed to query Helius API, falling back to standard Solana native query:", err);
        }
    }

    // 2. Fallback: Query standard Solana RPC native prioritization fees
    try {
        console.log(`[Priority Fees] Querying standard Solana native prioritization fees...`);
        const recentFees = await connection.getRecentPrioritizationFees({
            lockedWritableAccounts: accountKeys.map(k => new PublicKey(k))
        });
        
        if (recentFees && recentFees.length > 0) {
            const sorted = recentFees.map(f => f.prioritizationFee).sort((a, b) => a - b);
            const estimate = sorted[Math.floor(sorted.length * 0.75)]; // 75th percentile
            console.log(`[Priority Fees] Solana native 75th-percentile estimate: ${estimate} micro-lamports`);
            return Math.max(estimate, 10000); // Ensure at least 10,000 micro-lamports (0.000002 SOL per million CU)
        }
    } catch (err) {
        console.warn("[Priority Fees] Failed to query Solana native prioritization fees:", err);
    }

    // 3. Last resort fallback
    console.log(`[Priority Fees] Using default fallback: 10,000 micro-lamports.`);
    return 10000;
}

/**
 * Generates compute budget and priority fee instructions.
 */
export async function getPriorityFeeInstructions(
    connection: Connection,
    accountKeys: string[],
    computeUnitsLimit: number = 200000
): Promise<TransactionInstruction[]> {
    const microLamports = await getPriorityFeeEstimate(connection, accountKeys);
    
    return [
        ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitsLimit }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
    ];
}
