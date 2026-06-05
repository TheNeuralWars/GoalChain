import { OracleService } from '../OracleService.js';
import { loadScraperConfigFromEnv, ScraperConfig } from './types.js';
import { createProviders } from './providers/index.js';
import { ScraperService } from './scraper.js';

async function main(): Promise<void> {
  console.log('[ScraperOracle] Starting GoalChain Scraper Oracle...');

  const rpcUrl = process.env.RPC_URL || 'https://api.devnet.solana.com';
  const keypairPath = process.env.ORACLE_KEYPAIR_PATH || '~/.config/solana/id.json';
  const programId = process.env.PROGRAM_ID || 'FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg';

  const scraperConfig = loadScraperConfigFromEnv();
  console.log('[ScraperOracle] Configuration:', {
    pollIntervalMs: scraperConfig.pollIntervalMs,
    fixturePollIntervalMs: scraperConfig.fixturePollIntervalMs,
    maxRetries: scraperConfig.maxRetries,
    enableSportsApi: scraperConfig.enableSportsApi,
    enableChainlink: scraperConfig.enableChainlink,
    enableDrift: scraperConfig.enableDrift,
    sportsApiProvider: scraperConfig.sportsApiProvider,
  });

  try {
    const oracle = new OracleService(rpcUrl, keypairPath, programId);
    console.log(`[ScraperOracle] Oracle initialized. Wallet: ${oracle.wallet.publicKey.toBase58()}`);

    const { fixtureProviders } = await createProviders(scraperConfig);
    console.log(`[ScraperOracle] Registered ${fixtureProviders.length} fixture providers:`, fixtureProviders.map(p => p.name));

    if (fixtureProviders.length === 0) {
      console.warn('[ScraperOracle] No fixture providers enabled. Exiting.');
      process.exit(0);
    }

    const scraper = new ScraperService(oracle, scraperConfig, fixtureProviders);

    const shutdown = async (signal: string) => {
      console.log(`[ScraperOracle] Received ${signal}, shutting down...`);
      await scraper.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    await scraper.start();
  } catch (error) {
    console.error('[ScraperOracle] Fatal error:', error);
    process.exit(1);
  }
}

main();