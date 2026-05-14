import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { idl, PROGRAM_ID, GoalchainProgram } from '@goalchain/sdk';

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

import fs from 'fs';
import path from 'path';

// --- ROUTES ---

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GoalChain API is running', programId: PROGRAM_ID.toBase58() });
});

// Whitelist: Save wallet and email
app.post('/api/whitelist', (req, res) => {
  const { wallet, email } = req.body;
  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  const dataPath = path.join(__dirname, '../data/whitelist.json');
  const dataDir = path.dirname(dataPath);

  try {
    // Asegurar que la carpeta data existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let whitelist = [];
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      whitelist = JSON.parse(fileContent);
    }

    // Evitar duplicados
    const exists = whitelist.find((entry: any) => entry.wallet === wallet);
    if (!exists) {
      whitelist.push({
        wallet,
        email: email || '',
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(dataPath, JSON.stringify(whitelist, null, 2));
      console.log(`✅ Whitelist: Nueva wallet registrada -> ${wallet}`);
      res.json({ success: true, message: 'Registrado con éxito' });
    } else {
      res.json({ success: true, message: 'Wallet ya estaba registrada' });
    }
  } catch (err) {
    console.error('Whitelist Error:', err);
    res.status(500).json({ error: 'Failed to save to whitelist' });
  }
});

app.listen(port, () => {
  console.log(`GoalChain API listening at http://localhost:${port}`);
});
