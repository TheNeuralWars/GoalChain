import { ComputeBudgetProgram } from "@solana/web3.js";
/**
 * Fetches the priority fee estimate from Helius RPC or returns a conservative default.
 * Handles the getPriorityFeeEstimate JSON-RPC method from Helius.
 */
export async function getHeliusPriorityFeeEstimate(connection, accountKeys) {
    const rpcUrl = connection.rpcEndpoint;
    // Check if it's a Helius RPC URL (or config override)
    if (!rpcUrl.includes("helius")) {
        console.log(`[Priority Fees] Non-Helius RPC detected. Using conservative default priority fee: 10,000 micro-lamports.`);
        return 10000;
    }
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
        const data = (await response.json());
        if (data.result && data.result.priorityFeeEstimate) {
            const estimate = Math.ceil(data.result.priorityFeeEstimate);
            console.log(`[Priority Fees] Helius recommended estimate: ${estimate} micro-lamports`);
            return estimate;
        }
    }
    catch (err) {
        console.warn("[Priority Fees] Failed to query Helius API, falling back to 10,000 micro-lamports:", err);
    }
    return 10000; // Fallback
}
/**
 * Generates compute budget and priority fee instructions.
 */
export async function getPriorityFeeInstructions(connection, accountKeys, computeUnitsLimit = 200000) {
    const microLamports = await getHeliusPriorityFeeEstimate(connection, accountKeys);
    return [
        ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitsLimit }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
    ];
}
