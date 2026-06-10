import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { GoalchainProgram } from '@goalchain/sdk';
export interface CliConfig {
    rpcUrl: string;
    network: string;
    programId: string;
    jito: {
        enabled: boolean;
        blockEngineUrl: string;
        tipAccount: string;
    };
    priorityFees: {
        microLamports: number;
        maxPriorityFee: number;
    };
    vault: {
        crankBatchSize: number;
        dryRunDefault: boolean;
    };
    healthCheck: {
        rpcTimeoutMs: number;
        jitoTimeoutMs: number;
    };
}
export interface GlobalOptions {
    rpcUrl?: string;
    keypair?: string;
    network?: string;
    dryRun?: boolean;
    verbose?: boolean;
    json?: boolean;
}
export declare function loadConfig(configPath?: string): CliConfig;
export declare function getRpcUrl(options: GlobalOptions): string;
export declare function getProgramId(options: GlobalOptions): PublicKey;
export declare function createConnection(options: GlobalOptions): Connection;
export declare function loadKeypair(keypairPath: string): Keypair;
export declare function getWallet(options: GlobalOptions): Keypair | null;
export declare function createProvider(connection: Connection, wallet: Keypair | null): AnchorProvider;
export declare function createProgram(provider: AnchorProvider): Program<GoalchainProgram>;
export declare function getConfigPda(programId: PublicKey): PublicKey;
export declare function getFixturePda(programId: PublicKey, matchId: string): PublicKey;
export declare function getFixtureVaultPda(programId: PublicKey, fixture: PublicKey): PublicKey;
export declare function getMarketPda(programId: PublicKey, fixture: PublicKey, marketId: number): PublicKey;
export declare function getWagerPda(programId: PublicKey, playerA: PublicKey, fixture: PublicKey): PublicKey;
export declare function getWagerVaultPda(programId: PublicKey, wager: PublicKey): PublicKey;
export interface OutputFormatter {
    json: boolean;
    verbose: boolean;
    log(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    output(data: any): void;
    exit(code: number): never;
}
export declare function createFormatter(json: boolean, verbose: boolean): OutputFormatter;
export declare function fetchOnchainConfig(program: Program<GoalchainProgram>): Promise<any>;
export declare function fetchAllFixtures(program: Program<GoalchainProgram>): Promise<any[]>;
export declare function fetchAllMarkets(program: Program<GoalchainProgram>): Promise<any[]>;
export declare function formatError(error: unknown): string;
export declare class CliError extends Error {
    readonly code: number;
    constructor(code: number, message: string);
}
export declare function handleError(formatter: OutputFormatter, error: unknown): never;
