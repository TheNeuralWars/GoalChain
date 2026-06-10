import { Router, Request, Response } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import idl from '@goalchain/sdk/src/goalchain_program.json';
import { PROGRAM_ID, GoalchainProgram } from '@goalchain/sdk';

const router = Router();

const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

const provider = new AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
const program = new Program(idl as any, provider) as Program<GoalchainProgram>;

// Helper to find PDA
function findFixtureBetPDA(wallet: PublicKey, fixture: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), wallet.toBuffer(), fixture.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

function findMarketPositionPDA(wallet: PublicKey, market: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('position'), wallet.toBuffer(), market.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

function findFixtureVaultPDA(fixture: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('fixture_vault'), fixture.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

function findMarketVaultPDA(market: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('market_vault'), market.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

function findConfigPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );
  return pda;
}

// GET /api/claims/:wallet - Get all claimable fixtures and markets for a wallet
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const walletPubkey = new PublicKey(req.params.wallet);

    // Fetch user's bets
    const userBets = await program.account.userBet.all([
      { memcmp: { offset: 8, bytes: walletPubkey.toBase58() } },
    ]);

    // Fetch user's positions
    const userPositions = await program.account.position.all([
      { memcmp: { offset: 8, bytes: walletPubkey.toBase58() } },
    ]);

    // Fetch all fixtures and markets for context
    const [fixtures, markets] = await Promise.all([
      program.account.fixture.all(),
      program.account.market.all(),
    ]);

    const fixtureMap = new Map(fixtures.map((f) => [f.publicKey.toBase58(), f]));
    const marketMap = new Map(markets.map((m) => [m.publicKey.toBase58(), m]));

    // Build claimable fixtures (completed + unclaimed)
    const claimableFixtures = userBets
      .map((bet) => {
        const fixture = fixtureMap.get(bet.account.fixture.toBase58());
        if (!fixture) return null;

        const status = fixture.account.status;
        const isCompleted = !!(status.completed || status.Completed);
        const claimed = bet.account.claimed;

        return {
          betPubkey: bet.publicKey.toBase58(),
          fixturePubkey: fixture.publicKey.toBase58(),
          fixture: {
            matchId: fixture.account.matchId,
            teamA: fixture.account.teamA,
            teamB: fixture.account.teamB,
            poolA: Number(fixture.account.poolA),
            poolB: Number(fixture.account.poolB),
            poolDraw: Number(fixture.account.poolDraw),
            status: isCompleted ? 'completed' : 'upcoming',
          },
          amountBaseUnits: bet.account.amount.toString(),
          prediction: bet.account.prediction.teamA ? 'A' : bet.account.prediction.teamB ? 'B' : 'Draw',
          claimed,
          claimable: isCompleted && !claimed,
        };
      })
      .filter(Boolean);

    // Build claimable markets (settled + unclaimed)
    const claimableMarkets = userPositions
      .map((pos) => {
        const market = marketMap.get(pos.account.market.toBase58());
        if (!market) return null;

        const status = market.account.status;
        const isSettled = !!(status.settled || status.Settled);
        const claimed = pos.account.claimed;

        return {
          positionPubkey: pos.publicKey.toBase58(),
          marketPubkey: market.publicKey.toBase58(),
          market: {
            marketId: Number(market.account.marketId),
            marketType: market.account.marketType,
            teamA: market.account.teamA,
            teamB: market.account.teamB,
            question: market.account.question,
            poolA: Number(market.account.poolA),
            poolB: Number(market.account.poolB),
            poolDraw: Number(market.account.poolDraw),
            status: isSettled ? 'settled' : 'active',
          },
          amountBaseUnits: pos.account.amount.toString(),
          side: pos.account.side.A ? 'A' : pos.account.side.B ? 'B' : 'Draw',
          claimed,
          claimable: isSettled && !claimed,
        };
      })
      .filter(Boolean);

    // Summary stats
    const totalClaimable = claimableFixtures.filter((f) => f.claimable).length +
                           claimableMarkets.filter((m) => m.claimable).length;

    res.json({
      wallet: walletPubkey.toBase58(),
      claimableFixtures,
      claimableMarkets,
      summary: {
        totalFixtures: claimableFixtures.length,
        totalMarkets: claimableMarkets.length,
        claimableFixtures: claimableFixtures.filter((f) => f.claimable).length,
        claimableMarkets: claimableMarkets.filter((m) => m.claimable).length,
        totalClaimable,
      },
    });
  } catch (err: any) {
    console.error('GET /api/claims error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
});

// GET /api/claims/:wallet/fixtures/:fixturePubkey - Get specific fixture claim status
router.get('/:wallet/fixtures/:fixturePubkey', async (req: Request, res: Response) => {
  try {
    const walletPubkey = new PublicKey(req.params.wallet);
    const fixturePubkey = new PublicKey(req.params.fixturePubkey);

    const userBetPDA = findFixtureBetPDA(walletPubkey, fixturePubkey);
    const fixture = await program.account.fixture.fetchNullable(fixturePubkey);
    const userBet = await program.account.userBet.fetchNullable(userBetPDA);

    if (!fixture) {
      return res.status(404).json({ error: 'Fixture not found' });
    }

    const status = fixture.account.status;
    const isCompleted = !!(status.completed || status.Completed);

    res.json({
      fixture: {
        pubkey: fixturePubkey.toBase58(),
        matchId: fixture.account.matchId,
        teamA: fixture.account.teamA,
        teamB: fixture.account.teamB,
        poolA: Number(fixture.account.poolA),
        poolB: Number(fixture.account.poolB),
        poolDraw: Number(fixture.account.poolDraw),
        status: isCompleted ? 'completed' : 'upcoming',
      },
      userBet: userBet ? {
        pubkey: userBetPDA.toBase58(),
        amountBaseUnits: userBet.account.amount.toString(),
        prediction: userBet.account.prediction.teamA ? 'A' : userBet.account.prediction.teamB ? 'B' : 'Draw',
        claimed: userBet.account.claimed,
      } : null,
      claimable: isCompleted && userBet && !userBet.account.claimed,
    });
  } catch (err: any) {
    console.error('GET /api/claims/fixtures error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
});

// GET /api/claims/:wallet/markets/:marketPubkey - Get specific market claim status
router.get('/:wallet/markets/:marketPubkey', async (req: Request, res: Response) => {
  try {
    const walletPubkey = new PublicKey(req.params.wallet);
    const marketPubkey = new PublicKey(req.params.marketPubkey);

    const positionPDA = findMarketPositionPDA(walletPubkey, marketPubkey);
    const market = await program.account.market.fetchNullable(marketPubkey);
    const position = await program.account.position.fetchNullable(positionPDA);

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    const status = market.account.status;
    const isSettled = !!(status.settled || status.Settled);

    res.json({
      market: {
        pubkey: marketPubkey.toBase58(),
        marketId: Number(market.account.marketId),
        marketType: market.account.marketType,
        teamA: market.account.teamA,
        teamB: market.account.teamB,
        question: market.account.question,
        poolA: Number(market.account.poolA),
        poolB: Number(market.account.poolB),
        poolDraw: Number(market.account.poolDraw),
        status: isSettled ? 'settled' : 'active',
      },
      position: position ? {
        pubkey: positionPDA.toBase58(),
        amountBaseUnits: position.account.amount.toString(),
        side: position.account.side.A ? 'A' : position.account.side.B ? 'B' : 'Draw',
        claimed: position.account.claimed,
      } : null,
      claimable: isSettled && position && !position.account.claimed,
    });
  } catch (err: any) {
    console.error('GET /api/claims/markets error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
});

export default router;