import { GlobalOptions } from '../utils.js';
interface SettleMarketsOptions extends GlobalOptions {
    execute?: boolean;
    marketIds?: string;
}
export declare function settleMarketsCommand(opts: SettleMarketsOptions): Promise<void>;
export {};
