import { Connection, PublicKey } from '@solana/web3.js';
export type ClusterName = 'localnet' | 'devnet' | 'mainnet';
/**
 * Active cluster name.
 */
export declare function getCluster(): ClusterName;
/**
 * RPC endpoint this environment will dial.
 */
export declare function getRpcUrl(): string;
/**
 * Program ID this environment targets (as PublicKey).
 * Throws if the value is invalid - a malformed program ID is an
 * emergency-stop condition, not a runtime degradation.
 */
export declare function getProgramId(): PublicKey;
/**
 * GCH SPL mint this environment uses, if it has been resolved.
 * Returns null until the mint is initialised on the target cluster.
 * Consumers should fetch the live value from on-chain global_config then.
 */
export declare function getGchTokenMint(): PublicKey | null;
export declare function getConnection(commitment?: 'processed' | 'confirmed' | 'finalized'): Connection;
/**
 * Reset the cached connection - primarily for tests and dynamic hot-swap.
 */
export declare function resetConnectionForTesting(): void;
/**
 * Read-only env snapshot for diagnostics and MCP servers. Never write to it.
 */
export declare const GOALCHAIN_ENV: Readonly<{
    readonly cluster: ClusterName;
    readonly rpcUrl: string;
    readonly programId: string;
    readonly gchTokenMint: string;
}>;
