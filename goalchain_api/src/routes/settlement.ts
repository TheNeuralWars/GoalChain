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

// GET /api/markets/:marketPubkey/settlement - Get market settlement info
router.get('/markets/:marketPubkey/settlement', async (req: Request, res: Response) => {
  try {
    const marketPubkey = new PublicKey(req.params.marketPubkey);
    const market = await program.account.market.fetchNullable(marketPubkey);

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
        totalPool: Number(market.account.poolA) + Number(market.account.poolB) + Number(market.account.poolDraw),
        status: isSettled ? 'settled' : (status.active || status.Active ? 'active' : 'unknown'),
        startTime: Number(market.account.startTime || 0),
        endTime: Number(market.account.endTime || 0),
      },
      settlement: {
        isSettled,
        winningSide: isSettled ? determineWinningSide(market.account) : undefined,
        settledAt: isSettled ? Number(market.account.endTime || 0) : undefined,
      },
    });
  } catch (err: any) {
    console.error('GET /api/markets/:marketPubkey/settlement error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
});

// GET /api/fixtures/:fixturePubkey/settlement - Get fixture settlement info
router.get('/fixtures/:fixturePubkey/settlement', async (req: Request, res: Response) => {
  try {
    const fixturePubkey = new PublicKey(req.params.fixturePubkey);
    const fixture = await program.account.fixture.fetchNullable(fixturePubkey);

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
        totalPool: Number(fixture.account.poolA) + Number(fixture.account.poolB) + Number(fixture.account.poolDraw),
        status: isCompleted ? 'completed' : (status.upcoming || status.Upcoming ? 'upcoming' : 'unknown'),
        matchDate: Number(fixture.account.matchDate || 0),
        group: fixture.account.group,
        round: fixture.account.round,
        venue: fixture.account.venue,
      },
      settlement: {
        isCompleted,
        winningSide: isCompleted ? determineFixtureWinningSide(fixture.account) : undefined,
        settledAt: isCompleted ? Number(fixture.account.matchDate || 0) : undefined,
      },
    });
  } catch (err: any) {
    console.error('GET /api/fixtures/:fixturePubkey/settlement error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
});

// GET /api/fixtures/:fixturePubkey/resolution - Get fixture resolution (alias for settlement)
router.get('/fixtures/:fixturePubkey/resolution', async (req: Request, res: Response) => {
  // Delegate to settlement endpoint
  req.url = req.url.replace('/resolution', '/settlement');
  router.handle(req, res);
});

// GET /api/markets - List all markets with optional status filter
router.get('/markets', async (req: Request, res: Response) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    const markets = await program.account.market.all();

    const result = markets.map((m) => {
      const status = m.account.status;
      const isSettled = !!(status.settled || status.Settled);
      const isActive = !!(status.active || status.Active);
      const isClosed = !!(status.closed || status.Closed);
      const isCancelled = !!(status.cancelled || status.Cancelled);

      let statusStr = 'unknown';
      if (isSettled) statusStr = 'settled';
      else if (isActive) statusStr = 'active';
      else if (isClosed) statusStr = 'closed';
      else if (isCancelled) statusStr = 'cancelled';

      return {
        pubkey: m.publicKey.toBase58(),
        marketId: Number(m.account.marketId),
        marketType: m.account.marketType,
        teamA: m.account.teamA,
        teamB: m.account.teamB,
        question: m.account.question,
        poolA: Number(m.account.poolA),
        poolB: Number(m.account.poolB),
        poolDraw: Number(m.account.poolDraw),
        totalPool: Number(m.account.poolA) + Number(m.account.poolB) + Number(m.account.poolDraw),
        status: statusStr,
        startTime: Number(m.account.startTime || 0),
        endTime: Number(m.account.endTime || 0),
      };
    });

    if (statusFilter) {
      res.json(result.filter((m) => m.status === statusFilter));
    } else {
      res.json(result);
    }
  } catch (err: any) {
    console.error('GET /api/markets error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
});

// GET /api/fixtures - List all fixtures with optional status filter
router.get('/fixtures', async (req: Request, res: Response) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    const fixtures = await program.account.fixture.all();

    const result = fixtures.map((f) => {
      const status = f.account.status;
      const isCompleted = !!(status.completed || status.Completed);
      const isUpcoming = !!(status.upcoming || status.Upcoming);
      const isLive = !!(status.live || status.Live);
      const isCancelled = !!(status.cancelled || status.Cancelled);

      let statusStr = 'unknown';
      if (isCompleted) statusStr = 'completed';
      else if (isUpcoming) statusStr = 'upcoming';
      else if (isLive) statusStr = 'live';
      else if (isCancelled) statusStr = 'cancelled';

      return {
        pubkey: f.publicKey.toBase58(),
        matchId: f.account.matchId,
        teamA: f.account.teamA,
        teamB: f.account.teamB,
        poolA: Number(f.account.poolA),
        poolB: Number(f.account.poolB),
        poolDraw: Number(f.account.poolDraw),
        totalPool: Number(f.account.poolA) + Number(f.account.poolB) + Number(f.account.poolDraw),
        status: statusStr,
        matchDate: Number(f.account.matchDate || 0),
        group: f.account.group,
        round: f.account.round,
        venue: f.account.venue,
      };
    });

    if (statusFilter) {
      res.json(result.filter((f) => f.status === statusFilter));
    } else {
      res.json(result);
    }
  } catch (err: any) {
    console.error('GET /api/fixtures error:', err);
    res.status(500).json({ error: err?.message ?? 'Internal server error' });
  }
});

// Helper to determine winning side from pool sizes (heuristic)
function determineWinningSide(account: any): 'A' | 'B' | 'Draw' | undefined {
  const poolA = Number(account.poolA || 0);
  const poolB = Number(account.poolB || 0);
  const poolDraw = Number(account.poolDraw || 0);

  // The actual winning side is determined by oracle, not pool sizes
  // This is a heuristic for display purposes only
  if (poolA > poolB && poolA > poolDraw) return 'A';
  if (poolB > poolA && poolB > poolDraw) return 'B';
  if (poolDraw > poolA && poolDraw > poolB) return 'Draw';
  return undefined;
}

function determineFixtureWinningSide(account: any): 'A' | 'B' | 'Draw' | undefined {
  const poolA = Number(account.poolA || 0);
  const poolB = Number(account.poolB || 0);
  const poolDraw = Number(account.poolDraw || 0);

  if (poolA > poolB && poolA > poolDraw) return 'A';
  if (poolB > poolA && poolB > poolDraw) return 'B';
  if (poolDraw > poolA && poolDraw > poolB) return 'Draw';
  return undefined;
}

export default router;