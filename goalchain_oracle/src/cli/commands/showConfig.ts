import { createFormatter, GlobalOptions, createConnection, getProgramId, getWallet, createProvider, createProgram, OutputFormatter, CliError, handleError, fetchOnchainConfig } from '../utils.js';

interface ShowConfigOptions extends GlobalOptions {}

export async function showConfigCommand(opts: ShowConfigOptions): Promise<void> {
  const formatter = createFormatter(opts.json ?? false, opts.verbose ?? false);
  const dryRun = true; // config:show is always read-only

  try {
    const connection = createConnection(opts);
    const programId = getProgramId(opts);
    const provider = createProvider(connection, null);
    const program = createProgram(provider);

    formatter.log('Fetching on-chain config...');

    const config = await fetchOnchainConfig(program);

    formatter.success('On-chain config retrieved');
    formatter.output({
      dryRun: true,
      config,
      network: opts.network || 'devnet',
      rpcUrl: connection.rpcEndpoint,
      timestamp: new Date().toISOString(),
    });

    formatter.exit(0);
  } catch (error) {
    handleError(formatter, error);
  }
}