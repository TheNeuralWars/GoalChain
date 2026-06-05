import { Command } from "commander";
import { syncAuthorityCommand } from "./commands/sync-authority.js";
import { initFixtureCommand } from "./commands/init-fixture.js";
import { liveUpdateCommand } from "./commands/live-update.js";
import { createMarketCommand } from "./commands/create-market.js";
import { resolveMarketCommand } from "./commands/resolve-market.js";
import { completeFixtureCommand } from "./commands/complete-fixture.js";
import { recordPlayerCommand } from "./commands/record-player.js";
import { updateStatsCommand } from "./commands/update-stats.js";
import { crankVaultsCommand } from "./commands/crank-vaults.js";
import { contributorEpochCommand } from "./commands/contributor-epoch.js";
import { initTokensCommand } from "./commands/init-tokens.js";
export const oracleCli = new Command("goalchain-oracle")
    .description("GoalChain Sports Oracle CLI - Manage fixtures, markets, players, and vaults")
    .version("1.0.0")
    .addCommand(syncAuthorityCommand)
    .addCommand(initFixtureCommand)
    .addCommand(liveUpdateCommand)
    .addCommand(createMarketCommand)
    .addCommand(resolveMarketCommand)
    .addCommand(completeFixtureCommand)
    .addCommand(recordPlayerCommand)
    .addCommand(updateStatsCommand)
    .addCommand(crankVaultsCommand)
    .addCommand(contributorEpochCommand)
    .addCommand(initTokensCommand);
export async function runCli(argv = process.argv) {
    await oracleCli.parseAsync(argv);
}
