import { createFormatter, GlobalOptions, createConnection, getProgramId, getWallet, createProvider, createProgram, OutputFormatter, CliError, handleError, getFixturePda } from '../utils.js';
import { PublicKey } from '@solana/web3.js';

interface RecordPlayerOptions extends GlobalOptions {
  execute?: boolean;
  fixture: string;
  player: string;
  goals: number;
  assists: number;
}

export async function recordPlayerCommand(opts: RecordPlayerOptions): Promise<void> {
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

    const fixturePubkey = getFixturePda(programId, opts.fixture);
    const playerPubkey = new PublicKey(opts.player);

    formatter.log('Recording player match performance...', {
      fixture: opts.fixture,
      player: opts.player,
      goals: opts.goals,
      assists: opts.assists,
      dryRun,
    });

    const [playerMatchRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from('player_match_record'), playerPubkey.toBuffer(), fixturePubkey.toBuffer()],
      programId,
    );

    if (dryRun) {
      formatter.log('DRY RUN: Would call oracle_record_match');
      formatter.success('Player record simulation complete');
      formatter.output({
        dryRun: true,
        mode: 'simulation',
        fixture: opts.fixture,
        player: opts.player,
        goals: opts.goals,
        assists: opts.assists,
        playerMatchRecord: playerMatchRecord.toBase58(),
        timestamp: new Date().toISOString(),
      });
    } else {
      formatter.log('EXECUTE MODE: Would call oracle_record_match');
      formatter.warn('Real oracle_record_match not yet implemented');
      throw new CliError(2, 'oracle_record_match instruction not implemented in CLI');
    }

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}