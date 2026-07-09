import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync, getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import idl from '@goalchain/sdk/src/goalchain_program.json';
import { PublicKey } from '@solana/web3.js';
import { getProgramId } from '@goalchain/sdk';
const PROGRAM_ID = getProgramId();
const SEEDS = {
    CONFIG: 'config',
    FIXTURE_VAULT: 'fixture_vault',
    LIVE_STATE: 'live_state',
};
const READONLY_WALLET = {
    publicKey: PublicKey.default,
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
    const [config] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.CONFIG)], PROGRAM_ID);
    const configAccount = await program.account.globalConfig.fetch(config);
    const treasuryTokenAccount = configAccount.treasuryTokenAccount;
    const jackpotTokenAccount = configAccount.jackpotTokenAccount;
    const treasuryTokenInfo = await connection.getParsedAccountInfo(treasuryTokenAccount);
    const parsed = treasuryTokenInfo.value?.data?.parsed;
    const tokenMintString = parsed?.info?.mint;
    if (!tokenMintString) {
        throw new Error('No se pudo resolver el token mint desde GlobalConfig.');
    }
    const tokenMint = new PublicKey(tokenMintString);
    const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, wallet);
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
        group: account?.group,
        round: account?.round,
        venue: account?.venue,
        matchDate: asNumber(account?.matchDate),
    };
}
function createProgram(connection, wallet) {
    const provider = new AnchorProvider(connection, wallet ?? READONLY_WALLET, {
        commitment: 'confirmed',
    });
    return new Program(idl, provider);
}
function parseAmountToBaseUnits(amountUi, decimals) {
    const normalized = amountUi.trim().replace(',', '.');
    if (!/^\d+(\.\d+)?$/.test(normalized)) {
        throw new Error('Monto inválido. Usa formato numérico, ej: 1.5');
    }
    const [whole, frac = ''] = normalized.split('.');
    const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
    const base = `${whole}${fracPadded}`.replace(/^0+/, '') || '0';
    return new BN(base, 10);
}
export async function fetchFixtures(connection) {
    const program = createProgram(connection);
    const rows = await program.account.fixture.all();
    // Base UI views (sin estado en vivo todavía).
    const base = rows.map((row) => toUiFixture(row.publicKey, row.account));
    // Enriquecer cada fixture con su LiveMatchState on-chain (si existe).
    // El oráculo publica una cuenta LiveMatchState por partido, direccionada por:
    //   PDA = ["live_state", <fixture_pubkey>]
    const liveStates = await Promise.all(base.map(async (fx) => {
        try {
            const fixtureKey = new PublicKey(fx.pubkey);
            const [livePda] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.LIVE_STATE), fixtureKey.toBuffer()], PROGRAM_ID);
            // fetchNullable → null si el partido aún no abrió cuenta de live_state.
            const live = await program.account.liveMatchState.fetchNullable(livePda);
            return live ?? null;
        }
        catch (err) {
            // Un fallo de lectura aislado no debe romper todo el listado de fixtures.
            console.warn('fetchFixtures: live state miss for', fx.pubkey, err);
            return null;
        }
    }));
    const asU8 = (value) => {
        if (value === null || value === undefined)
            return undefined;
        if (typeof value === 'number')
            return value;
        if (typeof value.toNumber === 'function')
            return value.toNumber();
        return undefined;
    };
    return base
        .map((fx, idx) => {
        const live = liveStates[idx];
        if (!live)
            return fx;
        const scoreA = asU8(live.score_a);
        const scoreB = asU8(live.score_b);
        const minute = asU8(live.minute);
        return {
            ...fx,
            scoreA,
            scoreB,
            minute,
            isFt: Boolean(live.is_ft),
            isHt: Boolean(live.is_ht),
            // El estado on-chain (ft/ht) tiene prioridad sobre el estado estático.
            status: live.is_ft
                ? 'completed'
                : live.is_ht || (minute !== undefined && minute > 0)
                    ? 'live'
                    : fx.status,
        };
    })
        .sort((a, b) => b.poolA + b.poolB + b.poolDraw - (a.poolA + a.poolB + a.poolDraw));
}
export async function placeFixtureBet(params) {
    const { connection, wallet, fixture, side, amountUi } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [userBet] = PublicKey.findProgramAddressSync([Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()], PROGRAM_ID);
    const [fixtureVault] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()], PROGRAM_ID);
    const { config, tokenMint, userTokenAccount } = await resolveBetTokenAccounts(program, connection, wallet.publicKey);
    const mintInfo = await getMint(connection, tokenMint);
    const amount = parseAmountToBaseUnits(amountUi, mintInfo.decimals);
    if (amount.lte(new BN(0))) {
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
export async function fetchUserBets(connection, owner) {
    const program = createProgram(connection);
    const rows = await program.account.userBet.all([
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
    return rows.map((row) => ({
        pubkey: row.publicKey.toBase58(),
        fixture: row.account?.fixture?.toBase58?.() ?? String(row.account?.fixture),
        amountBaseUnits: asNumber(row.account?.amount),
        claimed: Boolean(row.account?.claimed),
        prediction: normalizePrediction(row.account?.prediction),
    }));
}
export async function claimFixturePayout(params) {
    const { connection, wallet, fixture } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [userBet] = PublicKey.findProgramAddressSync([Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()], PROGRAM_ID);
    const [fixtureVault] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()], PROGRAM_ID);
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
        tokenProgram: TOKEN_PROGRAM_ID,
    })
        .rpc();
}
export async function refundFixtureBet(params) {
    const { connection, wallet, fixture } = params;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
        throw new Error('Wallet no disponible para firmar transacciones.');
    }
    const program = createProgram(connection, wallet);
    const [userBet] = PublicKey.findProgramAddressSync([Buffer.from('bet'), wallet.publicKey.toBuffer(), fixture.toBuffer()], PROGRAM_ID);
    const [fixtureVault] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.FIXTURE_VAULT), fixture.toBuffer()], PROGRAM_ID);
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
        tokenProgram: TOKEN_PROGRAM_ID,
    })
        .rpc();
}
export async function fetchUserChainStats(connection, owner) {
    const program = createProgram(connection);
    const userBets = await program.account.userBet.all([
        { memcmp: { offset: 8, bytes: owner.toBase58() } },
    ]);
    const userStakes = await program.account.userStake.all([
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
