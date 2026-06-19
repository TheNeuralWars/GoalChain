import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { PROGRAM_ID } from './index';

export type ClusterName = 'localnet' | 'devnet' | 'mainnet';

/**
 * goalchain_program_environment.ts
 *
 * Typed seam for the network/cluster/program-ID/mint quartet used by
 * every GoalChain consumer (SDK inbound, API, Oracle, Webapp).
 *
 * BACKGROUND
 *
 * Before this file existed, every consumer constructed
 *   new Connection(process.env.RPC_URL or clusterApiUrl('devnet'), 'confirmed')
 * and hard-coded PROGRAM_ID. That scattered the configuration across
 * four packages and made it easy to drift.
 *
 * This wrapper reads a single env quartet:
 *   GOALCHAIN_CLUSTER   - localnet | devnet | mainnet (default: devnet)
 *   RPC_URL             - Solana JSON-RPC endpoint   (default: clusterApiUrl(cluster))
 *   PROGRAM_ID          - Anchor program pubkey      (default: SDK PROGRAM_ID)
 *   GCH_TOKEN_MINT      - GCH SPL mint pubkey        (default: empty -> resolve on-chain)
 *
 * MIGRATION ROADMAP
 *
 * Currently the file is additive - no caller outside this directory
 * imports it yet. Each migration lands in its own PR:
 *   1. goalchain_api/src/index.ts                    -> swap new Connection() for getConnection()
 *   2. goalchain_webapp/src/lib/goalchainClient.ts    -> use getConnection() and getProgramId()
 *   3. goalchain_oracle/src/internal scripts                   -> read RPC and PROGRAM_ID via this helper
 *   4. Remove the legacy process.env.RPC_URL reads.
 *
 * See AGENT_GUIDE.md (Future migration) for the full plan.
 */

function readEnv(name: string, fallback: string): string {
    try {
        const proc = (globalThis as any).process;
        const value = proc && proc.env ? proc.env[name] : undefined;
        if (typeof value === 'string' && value.length > 0) return value;
    } catch {
        // ignore - browser environment without process
    }
    return fallback;
}

function normaliseCluster(raw: string | undefined): ClusterName {
    if (raw === 'localnet' || raw === 'devnet' || raw === 'mainnet') return raw;
    return 'devnet';
}

const CLUSTER: ClusterName = normaliseCluster(readEnv('GOALCHAIN_CLUSTER', 'devnet'));
const DEFAULT_RPC =
    CLUSTER === 'localnet'
        ? 'http://127.0.0.1:8899'
        : clusterApiUrl(CLUSTER === "mainnet" ? "mainnet-beta" : (CLUSTER === "devnet" ? "devnet" : "testnet"));
const RPC_URL: string = readEnv('RPC_URL', DEFAULT_RPC);
const PROGRAM_ID_BASE58: string = readEnv('PROGRAM_ID', PROGRAM_ID.toBase58());
const GCH_TOKEN_MINT_BASE58: string = readEnv('GCH_TOKEN_MINT', '');
const PLACEHOLDER_MINT = '<PENDING_MINT_BASE58>';

/**
 * Active cluster name.
 */
export function getCluster(): ClusterName {
    return CLUSTER;
}

/**
 * RPC endpoint this environment will dial.
 */
export function getRpcUrl(): string {
    return RPC_URL;
}

/**
 * Program ID this environment targets (as PublicKey).
 * Throws if the value is invalid - a malformed program ID is an
 * emergency-stop condition, not a runtime degradation.
 */
export function getProgramId(): PublicKey {
    return new PublicKey(PROGRAM_ID_BASE58);
}

/**
 * GCH SPL mint this environment uses, if it has been resolved.
 * Returns null until the mint is initialised on the target cluster.
 * Consumers should fetch the live value from on-chain global_config then.
 */
export function getGchTokenMint(): PublicKey | null {
    const raw = GCH_TOKEN_MINT_BASE58.trim();
    if (!raw || raw === PLACEHOLDER_MINT) {
        return null;
    }
    try {
        return new PublicKey(raw);
    } catch {
        return null;
    }
}

/**
 * Cached Connection getter. Always prefer it over `new Connection(...)`
 * after this module is in use.
 */
let _connection: Connection | null = null;
export function getConnection(
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
): Connection {
    if (!_connection || (_connection as any).commitment !== commitment) {
        _connection = new Connection(RPC_URL, commitment);
    }
    return _connection;
}

/**
 * Reset the cached connection - primarily for tests and dynamic hot-swap.
 */
export function resetConnectionForTesting(): void {
    _connection = null;
}

/**
 * Read-only env snapshot for diagnostics and MCP servers. Never write to it.
 */
export const GOALCHAIN_ENV = Object.freeze({
    cluster: CLUSTER,
    rpcUrl: RPC_URL,
    programId: PROGRAM_ID_BASE58,
    gchTokenMint: GCH_TOKEN_MINT_BASE58,
} as const);
