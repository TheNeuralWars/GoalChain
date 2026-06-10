"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.economyEpochCommand = economyEpochCommand;
const utils_js_1 = require("../utils.js");
const web3_js_1 = require("@solana/web3.js");
async function economyEpochCommand(opts) {
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
        formatter.log('Running contributor epoch validation...', {
            epoch: opts.epoch,
            start: opts.start,
            finalize: opts.finalize,
            claim: opts.claim,
            pool: opts.pool,
            dryRun,
        });
        const config = await (0, utils_js_1.fetchOnchainConfig)(program);
        if (opts.start) {
            if (!opts.pool) {
                throw new utils_js_1.CliError(1, '--pool required when --start is used');
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
            }
            else {
                throw new utils_js_1.CliError(2, 'start_contributor_epoch not implemented');
            }
        }
        else if (opts.finalize) {
            if (dryRun) {
                formatter.log('DRY RUN: Would call finalize_contributor_epoch');
                formatter.output({
                    dryRun: true,
                    action: 'finalize_epoch',
                    epoch: opts.epoch || 'current',
                    timestamp: new Date().toISOString(),
                });
            }
            else {
                throw new utils_js_1.CliError(2, 'finalize_contributor_epoch not implemented');
            }
        }
        else if (opts.claim) {
            if (dryRun) {
                formatter.log('DRY RUN: Would call claim_contributor_epoch');
                formatter.output({
                    dryRun: true,
                    action: 'claim_epoch',
                    epoch: opts.epoch || 'current',
                    timestamp: new Date().toISOString(),
                });
            }
            else {
                throw new utils_js_1.CliError(2, 'claim_contributor_epoch not implemented');
            }
        }
        else {
            const configPda = (0, utils_js_1.getConfigPda)(programId);
            const [builderFundPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('builder_fund'), configPda.toBuffer()], programId);
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
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
