import { createFormatter, GlobalOptions, createConnection, getProgramId, getWallet, createProvider, createProgram, getConfigPda, OutputFormatter, CliError, handleError, fetchOnchainConfig } from '../utils.js';
import { PublicKey } from '@solana/web3.js';

interface EconomyEpochOptions extends GlobalOptions {
  execute?: boolean;
  epoch?: string;
  start?: boolean;
  finalize?: boolean;
  claim?: boolean;
  pool?: string;
}

export async function economyEpochCommand(opts: EconomyEpochOptions): Promise<void> {
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

    formatter.log('Running contributor epoch validation...', {
      epoch: opts.epoch,
      start: opts.start,
      finalize: opts.finalize,
      claim: opts.claim,
      pool: opts.pool,
      dryRun,
    });

    const config = await fetchOnchainConfig(program);

    if (opts.start) {
      if (!opts.pool) {
        throw new CliError(1, '--pool required when --start is used');
      }
      if (dryRun) {
        formatter.log('DRY RUN: Would call start_contributor_epoch');
        formatter.output({
          dryRun: true,
          action: 'start_epoch',
          epoch: opts.epoch || 'next',
          poolSol: opts.pool,
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new CliError(2, 'start_contributor_epoch not implemented');
      }
    } else if (opts.finalize) {
      if (dryRun) {
        formatter.log('DRY RUN: Would call finalize_contributor_epoch');
        formatter.output({
          dryRun: true,
          action: 'finalize_epoch',
          epoch: opts.epoch || 'current',
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new CliError(2, 'finalize_contributor_epoch not implemented');
      }
    } else if (opts.claim) {
      if (dryRun) {
        formatter.log('DRY RUN: Would call claim_contributor_epoch');
        formatter.output({
          dryRun: true,
          action: 'claim_epoch',
          epoch: opts.epoch || 'current',
          timestamp: new Date().toISOString(),
        });
      } else {
        throw new CliError(2, 'claim_contributor_epoch not implemented');
      }
    } else {
      const configPda = getConfigPda(programId);
      const [builderFundPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('builder_fund'), configPda.toBuffer()],
        programId,
      );

      formatter.success('Contributor epoch status');
      formatter.output({
        dryRun: false,
        config,
        builderFund: builderFundPda.toBase58(),
        currentEpoch: 0,
        timestamp: new Date().toISOString(),
      });
    }

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}