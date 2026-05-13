import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { idl, PROGRAM_ID, GoalchainProgram } from '../../goalchain-sdk/src';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";

app.use(cors());
app.use(express.json());

const connection = new Connection(rpcUrl, 'confirmed');
// Provider placeholder (readonly)
const provider = new AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
const program = new Program(idl as any, provider) as any;

// --- ROUTES ---

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GoalChain API is running', programId: PROGRAM_ID.toBase58() });
});

// Get all fixtures
app.get('/api/fixtures', async (req, res) => {
  try {
    const fixtures = await program.account.fixture.all();
    res.json(fixtures.map((f: any) => ({
        pubkey: f.publicKey.toBase58(),
        ...(f.account as object)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fixtures from Solana' });
  }
});

// Get markets for a specific fixture
app.get('/api/markets/:fixtureId', async (req, res) => {
  const { fixtureId } = req.params;
  try {
    const markets = await program.account.market.all([
        {
            memcmp: {
                offset: 8, // fixture pubkey is first field after discriminator
                bytes: fixtureId
            }
        }
    ]);
    res.json(markets.map((m: any) => ({
        pubkey: m.publicKey.toBase58(),
        ...(m.account as object)
    })));
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch markets for fixture ${fixtureId}` });
  }
});

app.listen(port, () => {
  console.log(`GoalChain API listening at http://localhost:${port}`);
});
