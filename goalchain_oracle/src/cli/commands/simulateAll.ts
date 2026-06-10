import { createFormatter, GlobalOptions, createConnection, getProgramId, getWallet, createProvider, createProgram, OutputFormatter, CliError, handleError, fetchAllFixtures, fetchAllMarkets, fetchOnchainConfig, loadConfig } from '../utils.js';

interface SimulateAllOptions extends GlobalOptions {
  dryRun?: boolean;
}

export async function simulateAllCommand(opts: SimulateAllOptions): Promise<void> {
  const formatter = createFormatter(opts.json ?? false, opts.verbose ?? false);
  const dryRun = opts.dryRun ?? true;

  try {
    const connection = createConnection(opts);
    const wallet = getWallet(opts);
    const programId = getProgramId(opts);

    if (!dryRun && !wallet) {
      throw new CliError(1, 'Keypair required for execute mode. Use --keypair or ANCHOR_WALLET env.');
    }

    const provider = createProvider(connection, wallet);
    const program = createProgram(provider);

    formatter.log('Running full simulation: crank + settle + resolve...', { dryRun });

    const [fixtures, markets, config] = await Promise.all([
      fetchAllFixtures(program),
      fetchAllMarkets(program),
      fetchOnchainConfig(program),
    ]);

    const completedFixtures = fixtures.filter(f => f.status === 'Completed');
    const resolvedMarkets = markets.filter(m => m.status === 'Resolved');
    const cfg = loadConfig();
    const crankBatchSize = cfg.vault.crankBatchSize;

    const simulation = {
      dryRun: true,
      timestamp: new Date().toISOString(),
      network: opts.network || 'devnet',
      config: {
        programId: config.admin,
        oracleAuthority: config.oracleAuthority,
      },
      crank: {
        batchSize: crankBatchSize,
        dryRunDefault: cfg.vault.dryRunDefault,
      },
      settle: {
        marketsToSettle: resolvedMarkets.map(m => ({
          pubkey: m.pubkey,
          marketId: m.marketId,
          status: m.status,
        })),
        count: resolvedMarkets.length,
      },
      resolve: {
        fixturesToResolve: completedFixtures.map(f => ({
          pubkey: f.pubkey,
          matchId: f.matchId,
          status: f.status,
          winner: f.winner,
        })),
        count: completedFixtures.length,
      },
      summary: {
        totalFixtures: fixtures.length,
        completedFixtures: completedFixtures.length,
        totalMarkets: markets.length,
        resolvedMarkets: resolvedMarkets.length,
        wouldSettle: resolvedMarkets.length,
        wouldResolve: completedFixtures.length,
      },
    };

    formatter.success('Full simulation complete');
    formatter.output(simulation);

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}