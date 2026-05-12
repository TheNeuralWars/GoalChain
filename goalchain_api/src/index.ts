import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// TODO: Import Anchor workspace and connection setup here

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GoalChain API is running' });
});

// Get all fixtures
app.get('/api/fixtures', async (req, res) => {
  try {
    // TODO: Fetch from Solana via Anchor or local cache DB
    // For now, return mock data to test the frontend integration
    const mockFixtures = [
      { id: 1, home: 'ARG', away: 'FRA', status: 'LIVE', start_time: Date.now() / 1000 },
      { id: 2, home: 'ENG', away: 'ESP', status: 'SCHEDULED', start_time: (Date.now() / 1000) + 86400 }
    ];
    res.json(mockFixtures);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

// Get markets for a specific fixture
app.get('/api/markets/:fixtureId', async (req, res) => {
  const { fixtureId } = req.params;
  try {
    // TODO: Fetch from Solana where market.fixture == fixtureId
    const mockMarkets = [
      { market_id: 1, market_type: 'MatchResultLive', status: 'OPEN' },
      { market_id: 2, market_type: 'NextGoal', status: 'RESOLVED' }
    ];
    res.json(mockMarkets);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch markets for fixture ${fixtureId}` });
  }
});

app.listen(port, () => {
  console.log(`GoalChain API listening at http://localhost:${port}`);
});
