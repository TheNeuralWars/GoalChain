#!/usr/bin/env node
import { Command } from 'commander';
import { spawnSync } from 'child_process';
import { createFormatter, GlobalOptions, CliError } from './utils.js';
import { crankVaultCommand } from './commands/crankVault.js';
import { settleMarketsCommand } from './commands/settleMarkets.js';
import { resolveFixturesCommand } from './commands/resolveFixtures.js';
import { recordPlayerCommand } from './commands/recordPlayer.js';
import { updatePlayerStatsCommand } from './commands/updatePlayerStats.js';
import { economyEpochCommand } from './commands/economyEpoch.js';
import { showConfigCommand } from './commands/showConfig.js';
import { healthCheckCommand } from './commands/healthCheck.js';
import { simulateAllCommand } from './commands/simulateAll.js';
import { versionCommand } from './commands/version.js';

const program = new Command();

program
  .name('oracle')
  .description('GoalChain Oracle CLI - Operations tooling for on-chain oracle operations')
  .version('1.0.0', '-v, --version', 'Show version')
  .hook('preAction', (thisCommand, actionCommand) => {
    const gOpts = thisCommand.optsWithGlobals() as GlobalOptions;
    if (gOpts.json) {
      console.error = () => {};
    }
  });

const globalOptions = (cmd: Command) =>
  cmd
    .option('-r, --rpc-url <url>', 'Solana RPC URL (overrides config)')
    .option('-k, --keypair <path>', 'Path to keypair file (or ANCHOR_WALLET env)')
    .option('-n, --network <network>', 'Network: devnet | mainnet-beta', 'devnet')
    .option('--dry-run', 'Simulate only, no on-chain transactions', true)
    .option('--no-dry-run', 'Execute real transactions (requires --keypair)')
    .option('--json', 'Output JSON to stdout')
    .option('--verbose', 'Verbose logging to stderr');

globalOptions(program);

const crankVault = program
  .command('crank:vault')
  .description('Run vault crank (dry-run default, --execute for real)')
  .option('--execute', 'Execute real transaction (default: dry-run)')
  .option('--batch-size <size>', 'Batch size for crank', '10')
  .action(crankVaultCommand);

const settleMarkets = program
  .command('settle:markets')
  .description('Settle resolved markets via Jito bundle')
  .option('--execute', 'Execute real transaction (default: dry-run)')
  .option('--market-ids <ids>', 'Comma-separated market IDs to settle (default: all resolved)')
  .action(settleMarketsCommand);

const resolveFixtures = program
  .command('fixtures:resolve')
  .description('Resolve finished fixtures + trigger settlement')
  .option('--execute', 'Execute real transaction (default: dry-run)')
  .option('--fixture-ids <ids>', 'Comma-separated fixture match IDs to resolve (default: all completed)')
  .action(resolveFixturesCommand);

const recordPlayer = program
  .command('players:record')
  .description('Record player match performance')
  .requiredOption('--fixture <matchId>', 'Fixture match ID')
  .requiredOption('--player <pubkey>', 'Player PDA pubkey')
  .requiredOption('--goals <number>', 'Goals scored', parseInt)
  .requiredOption('--assists <number>', 'Assists', parseInt)
  .option('--execute', 'Execute real transaction (default: dry-run)')
  .action(recordPlayerCommand);

const updatePlayerStats = program
  .command('players:update-stats')
  .description('Update player stats from provider')
  .requiredOption('--player <pubkey>', 'Player PDA pubkey')
  .requiredOption('--goals <number>', 'Total goals', parseInt)
  .requiredOption('--assists <number>', 'Total assists', parseInt)
  .requiredOption('--matches <number>', 'Matches played', parseInt)
  .option('--execute', 'Execute real transaction (default: dry-run)')
  .action(updatePlayerStatsCommand);

const economyEpoch = program
  .command('economy:epoch')
  .description('Run contributor epoch validation')
  .option('--execute', 'Execute real transaction (default: dry-run)')
  .option('--epoch <id>', 'Epoch ID to validate (default: current)')
  .option('--start', 'Start new epoch with pool')
  .option('--finalize', 'Finalize current epoch')
  .option('--claim', 'Claim contributor rewards for epoch')
  .option('--pool <amount>', 'Contributor pool amount in SOL (for --start)')
  .action(economyEpochCommand);

const showConfig = program
  .command('config:show')
  .description('Display current on-chain config')
  .action(showConfigCommand);

const healthCheck = program
  .command('health:check')
  .description('RPC + Jito + priority fees health')
  .action(healthCheckCommand);

const simulateAll = program
  .command('simulate:all')
  .description('Full dry-run of crank + settle + resolve')
  .option('--dry-run', 'Dry-run mode (default: true)', true)
  .action(simulateAllCommand);

const version = program
  .command('version')
  .description('Show version + commit hash')
  .action(versionCommand);

async function main(): Promise<void> {
  const formatter = createFormatter(false, false);

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    if (error instanceof CliError) {
      formatter.error(error.message);
      formatter.exit(error.code);
    }
    formatter.error(formatError(error));
    formatter.exit(2);
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

main();