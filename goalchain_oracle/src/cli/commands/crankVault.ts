import { createFormatter, GlobalOptions, createConnection, getProgramId, getWallet, createProvider, createProgram, getConfigPda, OutputFormatter, CliError, handleError } from '../utils.js';
import * as fs from 'fs/promises';

interface CrankVaultOptions extends GlobalOptions {
  execute?: boolean;
  batchSize?: string;
}

export async function crankVaultCommand(opts: CrankVaultOptions): Promise<void> {
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

    formatter.log('Starting vault crank...', { dryRun, batchSize: opts.batchSize });

    const config = await program.account.globalConfig.fetchNullable(getConfigPda(programId));

    if (!config) {
      throw new CliError(1, 'GlobalConfig account not found');
    }

    const burnTrackerPath = '/data/apps/GoalChain/docs/data/burn_tracker.json';
    let excessSol = 0;
    let estimatedGchBurned = 0;
    let buybackSol = 0;

    if (dryRun) {
      formatter.log('DRY RUN: Reading burn_tracker.json for simulation');
      try {
        const tracker = JSON.parse(await fs.readFile(burnTrackerPath, 'utf-8'));
        excessSol = tracker.excess_sol || 0;
        estimatedGchBurned = tracker.estimated_gch_burned || 0;
        buybackSol = tracker.buyback_sol || 0;
      } catch {
        formatter.warn('burn_tracker.json not found, using zeros for simulation');
      }

      formatter.success('Vault crank simulation complete');
      formatter.output({
        dryRun: true,
        mode: 'simulation',
        excessSol,
        estimatedGchBurned,
        buybackSol,
        batchSize: parseInt(opts.batchSize || '10'),
        timestamp: new Date().toISOString(),
      });
    } else {
      formatter.log('EXECUTE MODE: Would call vault crank instruction');
      formatter.warn('Real vault crank instruction not yet implemented in program');
      throw new CliError(2, 'vault_crank instruction not available in current program version');
    }

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}