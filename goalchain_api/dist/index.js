"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const sdk_1 = require("@goalchain/sdk");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
// Provider placeholder (readonly)
const provider = new anchor_1.AnchorProvider(connection, {}, { commitment: 'confirmed' });
const program = new anchor_1.Program(sdk_1.idl, provider);
// --- ROUTES ---
// Healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'GoalChain API is running', programId: sdk_1.PROGRAM_ID.toBase58() });
});
// Get all fixtures
app.get('/api/fixtures', async (req, res) => {
    try {
        const fixtures = await program.account.fixture.all();
        res.json(fixtures.map((f) => ({
            pubkey: f.publicKey.toBase58(),
            ...f.account
        })));
    }
    catch (err) {
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
        res.json(markets.map((m) => ({
            pubkey: m.publicKey.toBase58(),
            ...m.account
        })));
    }
    catch (err) {
        res.status(500).json({ error: `Failed to fetch markets for fixture ${fixtureId}` });
    }
});
app.listen(port, () => {
    console.log(`GoalChain API listening at http://localhost:${port}`);
});
