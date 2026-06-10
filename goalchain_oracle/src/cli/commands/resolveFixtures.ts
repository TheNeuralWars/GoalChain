import { createFormatter, GlobalOptions, createConnection, getProgramId, getWallet, createProvider, createProgram, OutputFormatter, CliError, handleError, fetchAllFixtures, getFixturePda, getFixtureVaultPda } from '../utils.js';

interface ResolveFixturesOptions extends GlobalOptions {
  execute?: boolean;
  fixtureIds?: string;
}

export async function resolveFixturesCommand(opts: ResolveFixturesOptions): Promise<void> {
  const formatter = createFormatter(opts.json ?? false, opts.verbose ?? false);
  const dryRun = !opts.execute;

  try {
    const connection = createConnection(opts);
    const wallet = getWallet(opts);
    const programId = getProgramId(opts);

    if (!dryRun && !wallet) {
      throw new CliError(1, 'Keypair required for --execute. Use --keypair or ANCHOR_WALLET env.');
    }

    const provider = createProvider(connection, wallet);
    const program = createProgram(provider);

    formatter.log('Fetching fixtures to resolve...', { dryRun });

    const fixtures = await fetchAllFixtures(program);
    const completedFixtures = fixtures.filter(f => f.status === 'Completed');

    let targetFixtures = completedFixtures;
    if (opts.fixtureIds) {
      const ids = opts.fixtureIds.split(',').map(s => s.trim());
      targetFixtures = completedFixtures.filter(f => ids.includes(f.matchId));
    }

    if (targetFixtures.length === 0) {
      formatter.success('No fixtures to resolve');
      formatter.output({ resolved: 0, fixtures: [], dryRun });
      formatter.exit(0);
    }

    if (dryRun) {
      formatter.log('DRY RUN: Would call update_fixture_status + trigger settlement');
      formatter.success('Fixture resolution simulation complete');
      formatter.output({
        dryRun: true,
        mode: 'simulation',
        fixturesToResolve: targetFixtures.map(f => ({
          pubkey: f.pubkey,
          matchId: f.matchId,
          teamA: f.teamA,
          teamB: f.teamB,
          status: f.status,
          winner: f.winner,
          poolA: f.poolA,
          poolB: f.poolB,
          poolDraw: f.poolDraw,
        })),
        count: targetFixtures.length,
        timestamp: new Date().toISOString(),
      });
    } else {
      formatter.log('EXECUTE MODE: Would call update_fixture_status for each');
      formatter.warn('Real fixture resolution not yet implemented');
      throw new CliError(2, 'Fixture resolution not implemented');
    }

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}