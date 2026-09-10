"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFixtures = fetchFixtures;
exports.fetchMarkets = fetchMarkets;
exports.fetchUserBets = fetchUserBets;
exports.fetchUserPositions = fetchUserPositions;
exports.placeFixtureBet = placeFixtureBet;
exports.placeMarketBet = placeMarketBet;
exports.claimFixturePayout = claimFixturePayout;
exports.claimMarketPayout = claimMarketPayout;
exports.refundFixtureBet = refundFixtureBet;
exports.claimWinnings = claimWinnings;
exports.getClaimableMarkets = getClaimableMarkets;
exports.getMarketStatus = getMarketStatus;
exports.getFixtureStatus = getFixtureStatus;
exports.fetchUserChainStats = fetchUserChainStats;
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const goalchain_program_json_1 = __importDefault(require("../goalchain_program.json"));
const index_1 = require("../index");
const READONLY_WALLET = {
    publicKey: web3_js_1.PublicKey.default,
    signTransaction: async () => {
        throw new Error('Read-only wallet cannot sign transactions.');
    },
    signAllTransactions: async () => {
        throw new Error('Read-only wallet cannot sign transactions.');
    },
};
function normalizeStatus(raw) {
    if (!raw || typeof raw !== 'object')
        return 'unknown';
    const r = raw;
    if ('upcoming' in r || 'Upcoming' in r)
        return 'upcoming';
    if ('live' in r || 'Live' in r)
        return 'live';
    if ('completed' in r || 'Completed' in r)
        return 'completed';
    if ('cancelled' in r || 'Cancelled' in r)
        return 'cancelled';
    return 'unknown';
}
function normalizeMarketStatus(raw) {
    if (!raw || typeof raw !== 'object')
        return 'unknown';
    const r = raw;
    if ('active' in r || 'Active' in r)
        return 'active';
    if ('closed' in r || 'Closed' in r)
        return 'closed';
    if ('settled' in r || 'Settled' in r)
        return 'settled';
    if ('cancelled' in r || 'Cancelled' in r)
        return 'cancelled';
    return 'unknown';
}
function normalizePrediction(raw) {
    if (!raw || typeof raw !== 'object')
        return 'unknown';
    const r = raw;
    if ('teamA' in r || 'TeamA' in r)
        return 'A';
    if ('teamB' in r || 'TeamB' in r)
        return 'B';
    if ('draw' in r || 'Draw' in r)
        return 'Draw';
    return 'unknown';
}
async function resolveBetTokenAccounts(program, connection, wallet) {
    const [config] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.CONFIG)], index_1.PROGRAM_ID);
    const configAccount = await program.account.globalConfig.fetch(config);
    const treasuryTokenAccount = configAccount.treasuryTokenAccount;
    const jackpotTokenAccount = configAccount.jackpotTokenAccount;
    const treasuryTokenInfo = await connection.getParsedAccountInfo(treasuryTokenAccount);
    const parsed = treasuryTokenInfo.value?.data?.parsed;
    const tokenMintString = parsed?.info?.mint;
    if (!tokenMintString) {
        throw new Error('No se pudo resolver el token mint desde GlobalConfig.');
    }
    const tokenMint = new web3_js_1.PublicKey(tokenMintString);
    const userTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenMint, wallet);
    return { config, tokenMint, userTokenAccount, treasuryTokenAccount, jackpotTokenAccount };
}
function toUiFixture(pubkey, account) {
    const asNumber = (value) => {
        if (!value)
            return 0;
        if (typeof value === 'number')
            return value;
        if (typeof value.toNumber === 'function')
            return value.toNumber();
        if (typeof value.toString === 'function') {
            const n = Number(value.toString());
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
function toUiMarket(pubkey, account) {
    const asNumber = (value) => {
        if (!value)
            return 0;
        if (typeof value === 'number')
            return value;
        if (typeof value.toNumber === 'function')
            return value.toNumber();
        if (typeof value.toString === 'function') {
            const n = Number(value.toString());
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
function toUiPosition(pubkey, account) {
    const asNumber = (value) => {
        if (!value)
            return 0;
        if (typeof value === 'number')
            return value;
        if (typeof value.toNumber === 'function')
            return value.toNumber();
        if (typeof value.toString === 'function') {
            const n = Number(value.toString());
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };
    return {
        pubkey: pubkey.toBase58(),
        market: account?.market?.toBase58?.() ?? String(account?.market),
        owner: account?.owner?.toBase58?.() ?? String(account?.owner),
        side: account?.side?.A ? 'A' : account?.side?.B ? 'B' : 'Draw',
        amountBaseUnits: asNumber(account?.amount),
        claimed: Boolean(account?.claimed),
    };
}
function toUiUserBet(pubkey, account) {
    const asNumber = (value) => {
        if (!value)
            return 0;
        if (typeof value === 'number')
            return value;
        if (typeof value.toNumber === 'function')
            return value.toNumber();
        if (typeof value.toString === 'function') {
            const n = Number(value.toString());
            return Number.isFinite(n) ? n : 0;
        }
        return 0;
    };
    return {
        pubkey: pubkey.toBase58(),
        fixture: account?.fixture?.toBase58?.() ?? String(account?.fixture),
        amountBaseUnits: asNumber(account?.amount),
        claimed: Boolean(account?.claimed),
        prediction: normalizePrediction(account?.prediction),
    };
}
function createProgram(connection, wallet) {
    const provider = new anchor_1.AnchorProvider(connection, wallet ?? READONLY_WALLET, {
        commitment: 'confirmed',
    });
    return new anchor_1.Program(goalchain_program_json_1.default, provider);
}
function parseAmountToBaseUnits(amountUi, decimals) {
    const normalized = amountUi.trim().replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        throw new Error('Monto inválido. Usa formato numérico, ej: 1.5');
    }
    const [whole, frac = ''] = normalized.split('.');
    const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
    const base = `${whole}${fracPadded}`.replace(/^0+/, '') || '0';
    return new anchor_1.BN(base, 10);
}
// ============================================
// Public API
// ============================================
async function fetchFixtures(connection) {
    const program = createProgram(connection);
    const rows = await program.account.fixture.all();
    return rows.map((row) => toUiFixture(row.publicKey, row.account))
        .sort((a, b) => b.poolA + b.poolB + b.poolDraw - (a.poolA + a.poolB + a.poolDraw));
}
async function fetchMarkets(connection) {
    const program = createProgram(connection);
    const rows = await program.account.market.all();
    return rows.map((row) => toUiMarket(row.publicKey, row.account));
}
async function fetchUserBets(connection, owner) {
    const program = createProgram(connection);
    const rows = await program.account.userBet.all([
        { memcmp: { offset: 8, bytes: owner.toBase58() } },
    ]);
    return rows.map((row) => toUiUserBet(row.publicKey, row.account));
}
async function fetchUserPositions(connection, owner) {
    const program = createProgram(connection);
    const rows = await program.account.position.all([
        { memcmp: { offset: 8, bytes: owner.toBase58() } },
    ]);
    return rows.map((row) => toUiPosition(row.publicKey, row.account));
}
async function placeFixtureBet(params) {
    const { connection, wallet, fixture, side, amountUi } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [userBet] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()], index_1.PROGRAM_ID);
    const [fixtureVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.FIXTURE_VAULT), fixture.toBuffer()], index_1.PROGRAM_ID);
    const { config, tokenMint, userTokenAccount } = await resolveBetTokenAccounts(program, connection, wallet.publicKey);
    const mintInfo = await (0, spl_token_1.getMint)(connection, tokenMint);
    const amount = parseAmountToBaseUnits(amountUi, mintInfo.decimals);
    if (amount.lte(new anchor_1.BN(0))) {
        throw new Error('El monto debe ser mayor a 0.');
    }
    const prediction = side === 'A' ? { teamA: {} } :
        side === 'B' ? { teamB: {} } :
            { draw: {} };
    return program.methods
        .placeBet(prediction, amount)
        .accounts({
        user: wallet.publicKey,
        config,
        fixture,
        userBet,
        userTokenAccount,
        fixtureVault,
        tokenMint,
    })
        .rpc();
}
async function placeMarketBet(params) {
    const { connection, wallet, market, side, amountUi } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [position] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('position'), wallet.publicKey.toBuffer(), market.toBuffer()], index_1.PROGRAM_ID);
    const [marketVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.MARKET_VAULT), market.toBuffer()], index_1.PROGRAM_ID);
    const { config, tokenMint, userTokenAccount } = await resolveBetTokenAccounts(program, connection, wallet.publicKey);
    const mintInfo = await (0, spl_token_1.getMint)(connection, tokenMint);
    const amount = parseAmountToBaseUnits(amountUi, mintInfo.decimals);
    if (amount.lte(new anchor_1.BN(0))) {
        throw new Error('El monto debe ser mayor a 0.');
    }
    const prediction = side === 'A' ? { teamA: {} } :
        side === 'B' ? { teamB: {} } :
            { draw: {} };
    return program.methods
        .placeMarketBet(prediction, amount)
        .accounts({
        user: wallet.publicKey,
        config,
        market,
        position,
        userTokenAccount,
        marketVault,
        tokenMint,
    })
        .rpc();
}
async function claimFixturePayout(params) {
    const { connection, wallet, fixture } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [userBet] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()], index_1.PROGRAM_ID);
    const [fixtureVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.FIXTURE_VAULT), fixture.toBuffer()], index_1.PROGRAM_ID);
    const { config, tokenMint, userTokenAccount, treasuryTokenAccount, jackpotTokenAccount } = await resolveBetTokenAccounts(program, connection, wallet.publicKey);
    return program.methods
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
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .rpc();
}
async function claimMarketPayout(params) {
    const { connection, wallet, market, position } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [marketVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.MARKET_VAULT), market.toBuffer()], index_1.PROGRAM_ID);
    const { config, tokenMint, userTokenAccount, treasuryTokenAccount, jackpotTokenAccount } = await resolveBetTokenAccounts(program, connection, wallet.publicKey);
    return program.methods
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
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .rpc();
}
async function refundFixtureBet(params) {
    const { connection, wallet, fixture } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [userBet] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()], index_1.PROGRAM_ID);
    const [fixtureVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.FIXTURE_VAULT), fixture.toBuffer()], index_1.PROGRAM_ID);
    const { tokenMint, userTokenAccount } = await resolveBetTokenAccounts(program, connection, wallet.publicKey);
    return program.methods
        .refundBet()
        .accounts({
        user: wallet.publicKey,
        fixture,
        userBet,
        userTokenAccount,
        fixtureVault,
        tokenMint,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .rpc();
}
async function claimWinnings(params) {
    if (params.type === 'fixture') {
        return claimFixturePayout({ connection: params.connection, wallet: params.wallet, fixture: params.fixtureOrMarket });
    }
    if (!params.position) {
        throw new Error('Market claims require position pubkey');
    }
    return claimMarketPayout({ connection: params.connection, wallet: params.wallet, market: params.fixtureOrMarket, position: params.position });
}
async function getClaimableMarkets(connection, owner) {
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
        ...fixtureMap.get(b.fixture),
        userBet: b,
    }))
        .filter((f) => f && f.status === 'completed');
    const claimableMarkets = positions
        .filter((p) => !p.claimed)
        .map((p) => ({
        ...marketMap.get(p.market),
        position: p,
    }))
        .filter((m) => m && m.status === 'settled');
    return { fixtures: claimableFixtures, markets: claimableMarkets };
}
async function getMarketStatus(connection, marketPubkey) {
    const program = createProgram(connection);
    try {
        const account = await program.account.market.fetch(marketPubkey);
        return toUiMarket(marketPubkey, account);
    }
    catch {
        return null;
    }
}
async function getFixtureStatus(connection, fixturePubkey) {
    const program = createProgram(connection);
    try {
        const account = await program.account.fixture.fetch(fixturePubkey);
        return toUiFixture(fixturePubkey, account);
    }
    catch {
        return null;
    }
}
async function fetchUserChainStats(connection, owner) {
    const program = createProgram(connection);
    const userBets = await program.account.userBet.all([
        { memcmp: { offset: 8, bytes: owner.toBase58() } },
    ]);
    const userStakes = await program.account.userStake.all([
        { memcmp: { offset: 8, bytes: owner.toBase58() } },
    ]);
    const positions = await program.account.position.all([
        { memcmp: { offset: 8, bytes: owner.toBase58() } },
    ]);
    const asNumber = (value) => {
        if (!value)
            return 0;
        if (typeof value === 'number')
            return value;
        if (typeof value.toNumber === 'function')
            return value.toNumber();
        if (typeof value.toString === 'function') {
            const n = Number(value.toString());
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
