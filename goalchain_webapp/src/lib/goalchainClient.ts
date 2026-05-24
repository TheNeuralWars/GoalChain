import { AnchorProvider, BN, Idl, Program } from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync, getMint } from '@solana/spl-token';
import idl from '@goalchain/sdk/src/goalchain_program.json';
import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg');
const SEEDS = {
  CONFIG: 'config',
  FIXTURE_VAULT: 'fixture_vault',
} as const;

export type FixtureStatus = 'upcoming' | 'live' | 'resolved' | 'cancelled' | 'unknown';
export type PredictionSide = 'A' | 'B' | 'Draw';

type WalletLike = {
  publicKey: PublicKey | null;
  signTransaction?: (...args: any[]) => Promise<any>;
  signAllTransactions?: (...args: any[]) => Promise<any>;
};

const READONLY_WALLET: WalletLike = {
  publicKey: PublicKey.default,
  signTransaction: async () => {
    throw new Error('Read-only wallet cannot sign transactions.');
  },
  signAllTransactions: async () => {
    throw new Error('Read-only wallet cannot sign transactions.');
  },
};

export interface FixtureView {
  pubkey: string;
  matchId: string;
  teamA: string;
  teamB: string;
  poolA: number;
  poolB: number;
  poolDraw: number;
  status: FixtureStatus;
}

export interface UserChainStats {
  totalBets: number;
  totalVolumeBaseUnits: number;
  claimedBets: number;
  openBets: number;
  stakedAmountBaseUnits: number;
  unclaimedRewardsBaseUnits: number;
}

function normalizeStatus(raw: unknown): FixtureStatus {
  if (!raw || typeof raw !== 'object') return 'unknown';
  if ('upcoming' in (raw as Record<string, unknown>)) return 'upcoming';
  if ('live' in (raw as Record<string, unknown>)) return 'live';
  if ('resolved' in (raw as Record<string, unknown>)) return 'resolved';
  if ('cancelled' in (raw as Record<string, unknown>)) return 'cancelled';
  return 'unknown';
}

function toUiFixture(pubkey: PublicKey, account: any): FixtureView {
  const asNumber = (value: unknown): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof (value as any).toNumber === 'function') return (value as any).toNumber();
    if (typeof (value as any).toString === 'function') {
      const n = Number((value as any).toString());
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  return {
    pubkey: pubkey.toBase58(),
    matchId: account?.matchId ?? 'unknown',
    teamA: account?.teamA ?? 'Team A',
    teamB: account?.teamB ?? 'Team B',
    poolA: asNumber(account?.poolA),
    poolB: asNumber(account?.poolB),
    poolDraw: asNumber(account?.poolDraw),
    status: normalizeStatus(account?.status),
  };
}

function createProgram(connection: Connection, wallet?: WalletLike): Program<any> {
  const provider = new AnchorProvider(connection, wallet ?? READONLY_WALLET as any, {
    commitment: 'confirmed',
  });
  return new Program(idl as unknown as Idl, provider);
}

function parseAmountToBaseUnits(amountUi: string, decimals: number): BN {
  const normalized = amountUi.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error('Monto inválido. Usa formato numérico, ej: 1.5');
  }
  const [whole, frac = ''] = normalized.split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  const base = `${whole}${fracPadded}`.replace(/^0+/, '') || '0';
  return new BN(base, 10);
}

export async function fetchFixtures(connection: Connection): Promise<FixtureView[]> {
  const program = createProgram(connection);
  const rows: Array<{ publicKey: PublicKey; account: any }> = await (program as any).account.fixture.all();
  return rows
    .map((row) => toUiFixture(row.publicKey, row.account))
    .sort((a, b) => b.poolA + b.poolB + b.poolDraw - (a.poolA + a.poolB + a.poolDraw));
}

export async function placeFixtureBet(params: {
  connection: Connection;
  wallet: WalletLike;
  fixture: PublicKey;
  side: PredictionSide;
  amountUi: string;
}): Promise<string> {
  const { connection, wallet, fixture, side, amountUi } = params;
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet no disponible para firmar transacciones.');
  }

  const program = createProgram(connection, wallet);
  const [config] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.CONFIG)], PROGRAM_ID);
  const [userBet] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()],
    PROGRAM_ID,
  );
  const [fixtureVault] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()],
    PROGRAM_ID,
  );

  const configAccount = await (program as any).account.globalConfig.fetch(config);
  const treasuryTokenAccount = configAccount.treasuryTokenAccount as PublicKey;
  const treasuryTokenInfo = await connection.getParsedAccountInfo(treasuryTokenAccount);
  const parsed = (treasuryTokenInfo.value as any)?.data?.parsed;
  const tokenMintString = parsed?.info?.mint as string | undefined;
  if (!tokenMintString) {
    throw new Error('No se pudo resolver el token mint desde GlobalConfig.');
  }
  const tokenMint = new PublicKey(tokenMintString);
  const mintInfo = await getMint(connection, tokenMint);
  const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, wallet.publicKey);
  const amount = parseAmountToBaseUnits(amountUi, mintInfo.decimals);
  if (amount.lte(new BN(0))) {
    throw new Error('El monto debe ser mayor a 0.');
  }

  const prediction: any =
    side === 'A' ? { teamA: {} } :
    side === 'B' ? { teamB: {} } :
    { draw: {} };

  return (program as any).methods
    .placeBet(prediction, amount)
    .accounts({
      user: wallet.publicKey,
      config,
      fixture,
      userBet,
      userTokenAccount,
      fixtureVault,
      tokenMint,
    } as any)
    .rpc();
}

export async function fetchUserChainStats(connection: Connection, owner: PublicKey): Promise<UserChainStats> {
  const program = createProgram(connection);
  const userBets: Array<{ account: any }> = await (program as any).account.userBet.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);
  const userStakes: Array<{ account: any }> = await (program as any).account.userStake.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);

  const asNumber = (value: unknown): number => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof (value as any).toNumber === 'function') return (value as any).toNumber();
    if (typeof (value as any).toString === 'function') {
      const n = Number((value as any).toString());
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const totalBets = userBets.length;
  const claimedBets = userBets.filter((b) => Boolean(b.account?.claimed)).length;
  const openBets = totalBets - claimedBets;
  const totalVolumeBaseUnits = userBets.reduce((acc, b) => acc + asNumber(b.account?.amount), 0);
  const stakedAmountBaseUnits = userStakes.reduce((acc, s) => acc + asNumber(s.account?.amount), 0);
  const unclaimedRewardsBaseUnits = userStakes.reduce((acc, s) => acc + asNumber(s.account?.unclaimedRewards), 0);

  return {
    totalBets,
    totalVolumeBaseUnits,
    claimedBets,
    openBets,
    stakedAmountBaseUnits,
    unclaimedRewardsBaseUnits,
  };
}
