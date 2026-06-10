import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { idl, PROGRAM_ID, GoalchainProgram, SEEDS } from '@goalchain/sdk';
import * as fs from 'fs';
import * as path from 'path';

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

let cachedConfig: CliConfig | null = null;

export function loadConfig(configPath?: string): CliConfig {
  if (cachedConfig) return cachedConfig;

  const defaultPath = path.resolve(__dirname, '../../config/default.json');
  const targetPath = configPath || defaultPath;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Config file not found: ${targetPath}`);
  }

  const config = JSON.parse(fs.readFileSync(targetPath, 'utf-8')) as CliConfig;
  cachedConfig = config;
  return config;
}

export function getRpcUrl(options: GlobalOptions): string {
  if (options.rpcUrl) return options.rpcUrl;

  const config = loadConfig();
  if (options.network === 'mainnet-beta' || options.network === 'mainnet') {
    return process.env.MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
  }
  return config.rpcUrl;
}

export function getProgramId(options: GlobalOptions): PublicKey {
  const config = loadConfig();
  return new PublicKey(config.programId);
}

export function createConnection(options: GlobalOptions): Connection {
  const rpcUrl = getRpcUrl(options);
  const config = loadConfig();
  return new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: config.healthCheck.rpcTimeoutMs,
  });
}

export function loadKeypair(keypairPath: string): Keypair {
  if (!fs.existsSync(keypairPath)) {
    throw new Error(`Keypair file not found: ${keypairPath}`);
  }
  const secret = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(secret));
}

export function getWallet(options: GlobalOptions): Keypair | null {
  const keypairPath = options.keypair || process.env.ANCHOR_WALLET;
  if (!keypairPath) return null;
  return loadKeypair(keypairPath);
}

export function createProvider(connection: Connection, wallet: Keypair | null): AnchorProvider {
  return new AnchorProvider(connection, wallet as any, {
    commitment: 'confirmed',
  });
}

export function createProgram(provider: AnchorProvider): Program<GoalchainProgram> {
  return new Program(idl as any, provider) as Program<GoalchainProgram>;
}

export function getConfigPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.CONFIG)], programId);
  return pda;
}

export function getFixturePda(programId: PublicKey, matchId: string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.FIXTURE), Buffer.from(matchId)],
    programId,
  );
  return pda;
}

export function getFixtureVaultPda(programId: PublicKey, fixture: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()],
    programId,
  );
  return pda;
}

export function getMarketPda(programId: PublicKey, fixture: PublicKey, marketId: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.MARKET), fixture.toBuffer(), Buffer.from([marketId])],
    programId,
  );
  return pda;
}

export function getWagerPda(programId: PublicKey, playerA: PublicKey, fixture: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.WAGER), playerA.toBuffer(), fixture.toBuffer()],
    programId,
  );
  return pda;
}

export function getWagerVaultPda(programId: PublicKey, wager: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.WAGER_VAULT), wager.toBuffer()],
    programId,
  );
  return pda;
}

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

export function createFormatter(json: boolean, verbose: boolean): OutputFormatter {
  return {
    json,
    verbose,
    log: (msg: string, ...args: any[]) => {
      if (!json && verbose) console.error(`[LOG] ${msg}`, ...args);
    },
    error: (msg: string, ...args: any[]) => {
      if (json) {
        console.error(JSON.stringify({ error: msg, args }));
      } else {
        console.error(`[ERROR] ${msg}`, ...args);
      }
    },
    success: (msg: string, ...args: any[]) => {
      if (!json) console.error(`[OK] ${msg}`, ...args);
    },
    warn: (msg: string, ...args: any[]) => {
      if (!json) console.error(`[WARN] ${msg}`, ...args);
    },
    output: (data: any) => {
      if (json) {
        console.log(JSON.stringify(data, null, 2));
      } else if (data !== undefined && data !== null) {
        console.log(data);
      }
    },
    exit: (code: number) => process.exit(code),
  };
}

export async function fetchOnchainConfig(program: Program<GoalchainProgram>): Promise<any> {
  const configPda = getConfigPda(program.programId);
  const config: any = await program.account.globalConfig.fetch(configPda);
  return {
    admin: config.admin.toBase58(),
    oracleAuthority: config.oracleAuthority.toBase58(),
    treasuryTokenAccount: config.treasuryTokenAccount.toBase58(),
    jackpotTokenAccount: config.jackpotTokenAccount.toBase58(),
    feeBps: config.feeBps,
    feeBurnBps: config.feeBurnBps,
    feeJackpotBps: config.feeJackpotBps,
    maxStartersPerManager: config.maxStartersPerManager,
    cutoffBufferSeconds: config.cutoffBufferSeconds.toString(),
    maxSolPerUser: config.maxSolPerUser.toString(),
    presaleActive: config.presaleActive,
    bump: config.bump,
  };
}

export async function fetchAllFixtures(program: Program<GoalchainProgram>): Promise<any[]> {
  const fixtures = await program.account.fixture.all();
  return fixtures.map(({ publicKey, account }) => ({
    pubkey: publicKey.toBase58(),
    matchId: account.matchId,
    teamA: account.teamA,
    teamB: account.teamB,
    startTimestamp: account.startTimestamp.toString(),
    poolA: account.poolA.toString(),
    poolB: account.poolB.toString(),
    poolDraw: account.poolDraw.toString(),
    status: account.status,
    winner: account.winner,
    bump: account.bump,
  }));
}

export async function fetchAllMarkets(program: Program<GoalchainProgram>): Promise<any[]> {
  const markets = await program.account.market.all();
  return markets.map(({ publicKey, account }) => ({
    pubkey: publicKey.toBase58(),
    fixture: account.fixture.toBase58(),
    marketId: account.marketId,
    marketType: account.marketType,
    status: account.status,
    tokenMint: account.tokenMint.toBase58(),
    delaySeconds: account.delaySeconds.toString(),
    cooldownSeconds: account.cooldownSeconds.toString(),
    closeMinute: account.closeMinute,
    maxGoalDiff: account.maxGoalDiff,
    requireTied: account.requireTied,
    poolA: account.poolA.toString(),
    poolB: account.poolB.toString(),
    poolDraw: account.poolDraw.toString(),
    winner: account.winner,
    lastBetTs: account.lastBetTs.toString(),
    resolvedTs: account.resolvedTs?.toString(),
    bump: account.bump,
  }));
}

export function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class CliError extends Error {
  constructor(public readonly code: number, message: string) {
    super(message);
    this.name = 'CliError';
  }
}

export function handleError(formatter: OutputFormatter, error: unknown): never {
  const message = formatError(error);
  if (error instanceof CliError) {
    formatter.error(message);
    formatter.exit(error.code);
  }
  formatter.error(`Unexpected error: ${message}`);
  formatter.exit(2);
}