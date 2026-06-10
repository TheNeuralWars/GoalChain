import { AnchorProvider, BN, Idl, Program } from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync, getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from '../goalchain_program.json';
import { PROGRAM_ID, SEEDS } from '../index';

export type FixtureStatus = 'upcoming' | 'live' | 'completed' | 'cancelled' | 'unknown';
export type MarketStatus = 'active' | 'closed' | 'settled' | 'cancelled' | 'unknown';
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

export interface MarketView {
  pubkey: string;
  marketId: number;
  marketType: string;
  status: MarketStatus;
  teamA?: string;
  teamB?: string;
  question?: string;
  poolA: number;
  poolB: number;
  poolDraw: number;
  totalPool: number;
  startTime?: number;
  endTime?: number;
}

export interface PositionView {
  pubkey: string;
  market: string;
  owner: string;
  side: 'A' | 'B' | 'Draw';
  amountBaseUnits: number;
  claimed: boolean;
}

export interface UserBetView {
  pubkey: string;
  fixture: string;
  amountBaseUnits: number;
  claimed: boolean;
  prediction: PredictionSide | 'unknown';
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
  const r = raw as Record<string, unknown>;
  if ('upcoming' in r || 'Upcoming' in r) return 'upcoming';
  if ('live' in r || 'Live' in r) return 'live';
  if ('completed' in r || 'Completed' in r) return 'completed';
  if ('cancelled' in r || 'Cancelled' in r) return 'cancelled';
  return 'unknown';
}

function normalizeMarketStatus(raw: unknown): MarketStatus {
  if (!raw || typeof raw !== 'object') return 'unknown';
  const r = raw as Record<string, unknown>;
  if ('active' in r || 'Active' in r) return 'active';
  if ('closed' in r || 'Closed' in r) return 'closed';
  if ('settled' in r || 'Settled' in r) return 'settled';
  if ('cancelled' in r || 'Cancelled' in r) return 'cancelled';
  return 'unknown';
}

function normalizePrediction(raw: unknown): PredictionSide | 'unknown' {
  if (!raw || typeof raw !== 'object') return 'unknown';
  const r = raw as Record<string, unknown>;
  if ('teamA' in r || 'TeamA' in r) return 'A';
  if ('teamB' in r || 'TeamB' in r) return 'B';
  if ('draw' in r || 'Draw' in r) return 'Draw';
  return 'unknown';
}

async function resolveBetTokenAccounts(
  program: Program<any>,
  connection: Connection,
  wallet: PublicKey,
): Promise<{
  config: PublicKey;
  tokenMint: PublicKey;
  userTokenAccount: PublicKey;
  treasuryTokenAccount: PublicKey;
  jackpotTokenAccount: PublicKey;
}> {
  const [config] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.CONFIG)], PROGRAM_ID);
  const configAccount = await (program as any).account.globalConfig.fetch(config);
  const treasuryTokenAccount = configAccount.treasuryTokenAccount as PublicKey;
  const jackpotTokenAccount = configAccount.jackpotTokenAccount as PublicKey;
  const treasuryTokenInfo = await connection.getParsedAccountInfo(treasuryTokenAccount);
  const parsed = (treasuryTokenInfo.value as any)?.data?.parsed;
  const tokenMintString = parsed?.info?.mint as string | undefined;
  if (!tokenMintString) {
    throw new Error('No se pudo resolver el token mint desde GlobalConfig.');
  }
  const tokenMint = new PublicKey(tokenMintString);
  const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, wallet);
  return { config, tokenMint, userTokenAccount, treasuryTokenAccount, jackpotTokenAccount };
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

function toUiMarket(pubkey: PublicKey, account: any): MarketView {
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
    marketId: asNumber(account?.marketId),
    marketType: account?.marketType ?? 'unknown',
    status: normalizeMarketStatus(account?.status),
    teamA: account?.teamA,
    teamB: account?.teamB,
    question: account?.question,
    poolA: asNumber(account?.poolA),
    poolB: asNumber(account?.poolB),
    poolDraw: asNumber(account?.poolDraw),
    totalPool: asNumber(account?.poolA) + asNumber(account?.poolB) + asNumber(account?.poolDraw),
    startTime: asNumber(account?.startTime),
    endTime: asNumber(account?.endTime),
  };
}

function toUiPosition(pubkey: PublicKey, account: any): PositionView {
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
    market: (account?.market as PublicKey)?.toBase58?.() ?? String(account?.market),
    owner: (account?.owner as PublicKey)?.toBase58?.() ?? String(account?.owner),
    side: account?.side?.A ? 'A' : account?.side?.B ? 'B' : 'Draw',
    amountBaseUnits: asNumber(account?.amount),
    claimed: Boolean(account?.claimed),
  };
}

function toUiUserBet(pubkey: PublicKey, account: any): UserBetView {
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
    fixture: (account?.fixture as PublicKey)?.toBase58?.() ?? String(account?.fixture),
    amountBaseUnits: asNumber(account?.amount),
    claimed: Boolean(account?.claimed),
    prediction: normalizePrediction(account?.prediction),
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

// ============================================
// Public API
// ============================================

export async function fetchFixtures(connection: Connection): Promise<FixtureView[]> {
  const program = createProgram(connection);
  const rows: Array<{ publicKey: PublicKey; account: any }> = await (program as any).account.fixture.all();
  return rows.map((row) => toUiFixture(row.publicKey, row.account))
    .sort((a, b) => b.poolA + b.poolB + b.poolDraw - (a.poolA + a.poolB + a.poolDraw));
}

export async function fetchMarkets(connection: Connection): Promise<MarketView[]> {
  const program = createProgram(connection);
  const rows: Array<{ publicKey: PublicKey; account: any }> = await (program as any).account.market.all();
  return rows.map((row) => toUiMarket(row.publicKey, row.account));
}

export async function fetchUserBets(connection: Connection, owner: PublicKey): Promise<UserBetView[]> {
  const program = createProgram(connection);
  const rows: Array<{ publicKey: PublicKey; account: any }> = await (program as any).account.userBet.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);
  return rows.map((row) => toUiUserBet(row.publicKey, row.account));
}

export async function fetchUserPositions(connection: Connection, owner: PublicKey): Promise<PositionView[]> {
  const program = createProgram(connection);
  const rows: Array<{ publicKey: PublicKey; account: any }> = await (program as any).account.position.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);
  return rows.map((row) => toUiPosition(row.publicKey, row.account));
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
  const [userBet] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()],
    PROGRAM_ID,
  );
  const [fixtureVault] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()],
    PROGRAM_ID,
  );

  const { config, tokenMint, userTokenAccount } = await resolveBetTokenAccounts(
    program,
    connection,
    wallet.publicKey,
  );
  const mintInfo = await getMint(connection, tokenMint);
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

export async function placeMarketBet(params: {
  connection: Connection;
  wallet: WalletLike;
  market: PublicKey;
  side: 'A' | 'B' | 'Draw';
  amountUi: string;
}): Promise<string> {
  const { connection, wallet, market, side, amountUi } = params;
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet no disponible para firmar transacciones.');
  }

  const program = createProgram(connection, wallet);
  const [position] = PublicKey.findProgramAddressSync(
    [Buffer.from('position'), wallet.publicKey.toBuffer(), market.toBuffer()],
    PROGRAM_ID,
  );
  const [marketVault] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.MARKET_VAULT), market.toBuffer()],
    PROGRAM_ID,
  );
  const { config, tokenMint, userTokenAccount } = await resolveBetTokenAccounts(
    program,
    connection,
    wallet.publicKey,
  );
  const mintInfo = await getMint(connection, tokenMint);
  const amount = parseAmountToBaseUnits(amountUi, mintInfo.decimals);
  if (amount.lte(new BN(0))) {
    throw new Error('El monto debe ser mayor a 0.');
  }

  const prediction: any =
    side === 'A' ? { teamA: {} } :
    side === 'B' ? { teamB: {} } :
    { draw: {} };

  return (program as any).methods
    .placeMarketBet(prediction, amount)
    .accounts({
      user: wallet.publicKey,
      config,
      market,
      position,
      userTokenAccount,
      marketVault,
      tokenMint,
    } as any)
    .rpc();
}

export async function claimFixturePayout(params: {
  connection: Connection;
  wallet: WalletLike;
  fixture: PublicKey;
}): Promise<string> {
  const { connection, wallet, fixture } = params;
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet no disponible para firmar transacciones.');
  }

  const program = createProgram(connection, wallet);
  const [userBet] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()],
    PROGRAM_ID,
  );
  const [fixtureVault] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()],
    PROGRAM_ID,
  );
  const { config, tokenMint, userTokenAccount, treasuryTokenAccount, jackpotTokenAccount } =
    await resolveBetTokenAccounts(program, connection, wallet.publicKey);

  return (program as any).methods
    .claimBetPayout()
    .accounts({
      user: wallet.publicKey,
      config,
      fixture,
      userBet,
      userTokenAccount,
      fixtureVault,
      treasuryTokenAccount,
      jackpotTokenAccount,
      tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();
}

export async function claimMarketPayout(params: {
  connection: Connection;
  wallet: WalletLike;
  market: PublicKey;
  position: PublicKey;
}): Promise<string> {
  const { connection, wallet, market, position } = params;
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet no disponible para firmar transacciones.');
  }

  const program = createProgram(connection, wallet);
  const [marketVault] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.MARKET_VAULT), market.toBuffer()],
    PROGRAM_ID,
  );
  const { config, tokenMint, userTokenAccount, treasuryTokenAccount, jackpotTokenAccount } =
    await resolveBetTokenAccounts(program, connection, wallet.publicKey);

  return (program as any).methods
    .claimMarketPayout()
    .accounts({
      user: wallet.publicKey,
      config,
      market,
      position,
      userTokenAccount,
      marketVault,
      treasuryTokenAccount,
      jackpotTokenAccount,
      tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();
}

export async function refundFixtureBet(params: {
  connection: Connection;
  wallet: WalletLike;
  fixture: PublicKey;
}): Promise<string> {
  const { connection, wallet, fixture } = params;
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet no disponible para firmar transacciones.');
  }

  const program = createProgram(connection, wallet);
  const [userBet] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()],
    PROGRAM_ID,
  );
  const [fixtureVault] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()],
    PROGRAM_ID,
  );
  const { tokenMint, userTokenAccount } = await resolveBetTokenAccounts(
    program,
    connection,
    wallet.publicKey,
  );

  return (program as any).methods
    .refundBet()
    .accounts({
      user: wallet.publicKey,
      fixture,
      userBet,
      userTokenAccount,
      fixtureVault,
      tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();
}

export async function claimWinnings(params: {
  connection: Connection;
  wallet: WalletLike;
  type: 'fixture' | 'market';
  fixtureOrMarket: PublicKey;
  position?: PublicKey;
}): Promise<string> {
  if (params.type === 'fixture') {
    return claimFixturePayout({ connection: params.connection, wallet: params.wallet, fixture: params.fixtureOrMarket });
  }
  if (!params.position) {
    throw new Error('Market claims require position pubkey');
  }
  return claimMarketPayout({ connection: params.connection, wallet: params.wallet, market: params.fixtureOrMarket, position: params.position });
}

export async function getClaimableMarkets(connection: Connection, owner: PublicKey): Promise<{
  fixtures: (FixtureView & { userBet: UserBetView })[];
  markets: (MarketView & { position: PositionView })[];
}> {
  const [fixtures, userBets, markets, positions] = await Promise.all([
    fetchFixtures(connection),
    fetchUserBets(connection, owner),
    fetchMarkets(connection),
    fetchUserPositions(connection, owner),
  ]);

  const fixtureMap = new Map(fixtures.map((f) => [f.pubkey, f]));
  const marketMap = new Map(markets.map((m) => [m.pubkey, m]));

  const claimableFixtures = userBets
    .filter((b) => !b.claimed)
    .map((b) => ({
      ...fixtureMap.get(b.fixture)!,
      userBet: b,
    }))
    .filter((f) => f && f.status === 'completed') as (FixtureView & { userBet: UserBetView })[];

  const claimableMarkets = positions
    .filter((p) => !p.claimed)
    .map((p) => ({
      ...marketMap.get(p.market)!,
      position: p,
    }))
    .filter((m) => m && m.status === 'settled') as (MarketView & { position: PositionView })[];

  return { fixtures: claimableFixtures, markets: claimableMarkets };
}

export async function getMarketStatus(connection: Connection, marketPubkey: PublicKey): Promise<MarketView | null> {
  const program = createProgram(connection);
  try {
    const account = await (program as any).account.market.fetch(marketPubkey);
    return toUiMarket(marketPubkey, account);
  } catch {
    return null;
  }
}

export async function getFixtureStatus(connection: Connection, fixturePubkey: PublicKey): Promise<FixtureView | null> {
  const program = createProgram(connection);
  try {
    const account = await (program as any).account.fixture.fetch(fixturePubkey);
    return toUiFixture(fixturePubkey, account);
  } catch {
    return null;
  }
}

export async function fetchUserChainStats(connection: Connection, owner: PublicKey): Promise<UserChainStats> {
  const program = createProgram(connection);
  const userBets: Array<{ account: any }> = await (program as any).account.userBet.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);
  const userStakes: Array<{ account: any }> = await (program as any).account.userStake.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);
  const positions: Array<{ account: any }> = await (program as any).account.position.all([
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
  const unclaimedRewardsBaseUnits = positions.reduce((acc, p) => acc + asNumber(p.account?.unclaimedRewards ?? p.account?.amount ?? 0), 0);

  return {
    totalBets,
    totalVolumeBaseUnits,
    claimedBets,
    openBets,
    stakedAmountBaseUnits,
    unclaimedRewardsBaseUnits,
  };
}