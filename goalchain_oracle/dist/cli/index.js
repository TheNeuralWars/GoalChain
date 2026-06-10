#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const utils_js_1 = require("./utils.js");
const crankVault_js_1 = require("./commands/crankVault.js");
const settleMarkets_js_1 = require("./commands/settleMarkets.js");
const resolveFixtures_js_1 = require("./commands/resolveFixtures.js");
const recordPlayer_js_1 = require("./commands/recordPlayer.js");
const updatePlayerStats_js_1 = require("./commands/updatePlayerStats.js");
const economyEpoch_js_1 = require("./commands/economyEpoch.js");
const showConfig_js_1 = require("./commands/showConfig.js");
const healthCheck_js_1 = require("./commands/healthCheck.js");
const simulateAll_js_1 = require("./commands/simulateAll.js");
const version_js_1 = require("./commands/version.js");
const program = new commander_1.Command();
program
    .name('oracle')
    .description('GoalChain Oracle CLI - Operations tooling for on-chain oracle operations')
    .version('1.0.0', '-v, --version', 'Show version')
    .hook('preAction', (thisCommand, actionCommand) => {
    const gOpts = thisCommand.optsWithGlobals();
    if (gOpts.json) {
        console.error = () => { };
    }
});
const globalOptions = (cmd) => cmd
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
    .action(crankVault_js_1.crankVaultCommand);
const settleMarkets = program
    .command('settle:markets')
    .description('Settle resolved markets via Jito bundle')
    .option('--execute', 'Execute real transaction (default: dry-run)')
    .option('--market-ids <ids>', 'Comma-separated market IDs to settle (default: all resolved)')
    .action(settleMarkets_js_1.settleMarketsCommand);
const resolveFixtures = program
    .command('fixtures:resolve')
    .description('Resolve finished fixtures + trigger settlement')
    .option('--execute', 'Execute real transaction (default: dry-run)')
    .option('--fixture-ids <ids>', 'Comma-separated fixture match IDs to resolve (default: all completed)')
    .action(resolveFixtures_js_1.resolveFixturesCommand);
const recordPlayer = program
    .command('players:record')
    .description('Record player match performance')
    .requiredOption('--fixture <matchId>', 'Fixture match ID')
    .requiredOption('--player <pubkey>', 'Player PDA pubkey')
    .requiredOption('--goals <number>', 'Goals scored', parseInt)
    .requiredOption('--assists <number>', 'Assists', parseInt)
    .option('--execute', 'Execute real transaction (default: dry-run)')
    .action(recordPlayer_js_1.recordPlayerCommand);
const updatePlayerStats = program
    .command('players:update-stats')
    .description('Update player stats from provider')
    .requiredOption('--player <pubkey>', 'Player PDA pubkey')
    .requiredOption('--goals <number>', 'Total goals', parseInt)
    .requiredOption('--assists <number>', 'Total assists', parseInt)
    .requiredOption('--matches <number>', 'Matches played', parseInt)
    .option('--execute', 'Execute real transaction (default: dry-run)')
    .action(updatePlayerStats_js_1.updatePlayerStatsCommand);
const economyEpoch = program
    .command('economy:epoch')
    .description('Run contributor epoch validation')
    .option('--execute', 'Execute real transaction (default: dry-run)')
    .option('--epoch <id>', 'Epoch ID to validate (default: current)')
    .option('--start', 'Start new epoch with pool')
    .option('--finalize', 'Finalize current epoch')
    .option('--claim', 'Claim contributor rewards for epoch')
    .option('--pool <amount>', 'Contributor pool amount in SOL (for --start)')
    .action(economyEpoch_js_1.economyEpochCommand);
const showConfig = program
    .command('config:show')
    .description('Display current on-chain config')
    .action(showConfig_js_1.showConfigCommand);
const healthCheck = program
    .command('health:check')
    .description('RPC + Jito + priority fees health')
    .action(healthCheck_js_1.healthCheckCommand);
const simulateAll = program
    .command('simulate:all')
    .description('Full dry-run of crank + settle + resolve')
    .option('--dry-run', 'Dry-run mode (default: true)', true)
    .action(simulateAll_js_1.simulateAllCommand);
const version = program
    .command('version')
    .description('Show version + commit hash')
    .action(version_js_1.versionCommand);
async function main() {
    const formatter = (0, utils_js_1.createFormatter)(false, false);
    try {
        await program.parseAsync(process.argv);
    }
    catch (error) {
        if (error instanceof utils_js_1.CliError) {
            formatter.error(error.message);
            formatter.exit(error.code);
        }
        formatter.error(formatError(error));
        formatter.exit(2);
    }
}
function formatError(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
main();
