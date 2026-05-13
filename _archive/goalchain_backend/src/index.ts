import express from 'express';
import cors from 'cors';
import { Connection, PublicKey, type GetProgramAccountsResponse } from '@solana/web3.js';
import type { Request, Response } from 'express';

const app = express();
app.use(cors());

const PORT = Number(process.env.PORT ?? 8787);
const RPC_ENDPOINT = process.env.RPC_ENDPOINT ?? 'http://127.0.0.1:8899';

// Program id from on-chain program
const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID ?? 'FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg');

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Minimal “catalog” API.
// In MVP we return fixtures by scanning program accounts and decoding the match_id/team_a/team_b/start_timestamp.
// NOTE: This is intentionally lightweight; for production you’d add persistence + a proper indexer.
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const slot = await connection.getSlot();
    res.json({ ok: true, rpc: RPC_ENDPOINT, slot });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ ok: false, rpc: RPC_ENDPOINT, error: msg });
  }
});

app.get('/api/fixtures', async (_req: Request, res: Response) => {
  try {
    // Anchor account discriminator for "Fixture" = first 8 bytes of sha256("account:Fixture")
    // We avoid importing the generated IDL here; decoding is a best-effort MVP.
    const discriminator = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

    const accounts: GetProgramAccountsResponse = await connection.getProgramAccounts(PROGRAM_ID);

    const fixtures = accounts
      .filter((a) => a.account.data.length > 8 && a.account.data.subarray(0, 8).equals(discriminator))
      .map((a) => ({
        pubkey: a.pubkey.toBase58(),
        // placeholder fields until we wire proper IDL/Borsh decoding
        match_id: 'unknown',
        team_a: 'unknown',
        team_b: 'unknown',
        start_timestamp: 0,
      }));

    res.json(fixtures);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: msg });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`GoalChain backend listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`RPC_ENDPOINT=${RPC_ENDPOINT}`);
  // eslint-disable-next-line no-console
  console.log(`PROGRAM_ID=${PROGRAM_ID.toBase58()}`);
});
