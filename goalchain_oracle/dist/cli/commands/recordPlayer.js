"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPlayerCommand = recordPlayerCommand;
const utils_js_1 = require("../utils.js");
const web3_js_1 = require("@solana/web3.js");
async function recordPlayerCommand(opts) {
    const formatter = (0, utils_js_1.createFormatter)(opts.json ?? false, opts.verbose ?? false);
    const dryRun = !opts.execute;
    try {
        const connection = (0, utils_js_1.createConnection)(opts);
        const wallet = (0, utils_js_1.getWallet)(opts);
        const programId = (0, utils_js_1.getProgramId)(opts);
        if (!dryRun && !wallet) {
            throw new utils_js_1.CliError(1, 'Keypair required for --execute. Use --keypair or ANCHOR_WALLET env.');
        }
        const provider = (0, utils_js_1.createProvider)(connection, wallet);
        const program = (0, utils_js_1.createProgram)(provider);
        const fixturePubkey = (0, utils_js_1.getFixturePda)(programId, opts.fixture);
        const playerPubkey = new web3_js_1.PublicKey(opts.player);
        formatter.log('Recording player match performance...', {
            fixture: opts.fixture,
            player: opts.player,
            goals: opts.goals,
            assists: opts.assists,
            dryRun,
        });
        const [playerMatchRecord] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('player_match_record'), playerPubkey.toBuffer(), fixturePubkey.toBuffer()], programId);
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
        }
        else {
            formatter.log('EXECUTE MODE: Would call oracle_record_match');
            formatter.warn('Real oracle_record_match not yet implemented');
            throw new utils_js_1.CliError(2, 'oracle_record_match instruction not implemented in CLI');
        }
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
