import { GlobalOptions } from '../utils.js';
interface UpdatePlayerStatsOptions extends GlobalOptions {
    execute?: boolean;
    player: string;
    goals: number;
    assists: number;
    matches: number;
}
export declare function updatePlayerStatsCommand(opts: UpdatePlayerStatsOptions): Promise<void>;
export {};
