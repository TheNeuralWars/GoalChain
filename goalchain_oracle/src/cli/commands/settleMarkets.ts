import { Command } from 'commander';
import { createFormatter, GlobalOptions, createConnection, getProgramId, getWallet, createProvider, createProgram, OutputFormatter, CliError, handleError, fetchAllMarkets } from '../utils.js';

interface SettleMarketsOptions extends GlobalOptions {
  execute?: boolean;
  marketIds?: string;
}

export async function settleMarketsCommand(opts: SettleMarketsOptions): Promise<void> {
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

    formatter.log('Fetching markets to settle...', { dryRun });

    const markets = await fetchAllMarkets(program);
    const resolvedMarkets = markets.filter(m => m.status === 'Resolved' || m.status === 'Cancelled');

    let targetMarkets = resolvedMarkets;
    if (opts.marketIds) {
      const ids = opts.marketIds.split(',').map(s => s.trim());
      targetMarkets = resolvedMarkets.filter(m => ids.includes(String(m.marketId)));
    }

    if (targetMarkets.length === 0) {
      formatter.success('No markets to settle');
      formatter.output({ settled: 0, markets: [], dryRun });
      formatter.exit(0);
    }

    if (dryRun) {
      formatter.log('DRY RUN: Would settle markets via Jito bundle');
      formatter.success('Settlement simulation complete');
      formatter.output({
        dryRun: true,
        mode: 'simulation',
        marketsToSettle: targetMarkets.map(m => ({
          pubkey: m.pubkey,
          marketId: m.marketId,
          status: m.status,
          poolA: m.poolA,
          poolB: m.poolB,
          poolDraw: m.poolDraw,
        })),
        count: targetMarkets.length,
        timestamp: new Date().toISOString(),
      });
    } else {
      formatter.log('EXECUTE MODE: Would call oracle_update_market_status for each');
      formatter.warn('Real settlement via Jito bundle not yet implemented');
      throw new CliError(2, 'Market settlement via Jito bundle not implemented');
    }

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}