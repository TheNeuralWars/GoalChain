/** Trading feature type definitions */

export type PredictionSide = 'Long' | 'Short';

export interface PricePoint {
  x: number;
  y: number;
  val: number;
}

export interface BotState {
  isEnabled: boolean;
  balance: number;
  totalProfit: number;
  activePosition: BotPosition | null;
}

export interface BotPosition {
  type: PredictionSide;
  entryPrice: number;
  leverage: number;
  size: number;
}

export interface BotLog {
  id: number;
  botName: string;
  type: 'LONG' | 'SHORT' | 'CLOSE';
  pair: string;
  price: number;
  leverage: number;
  pnl?: number;
  sentiment: number;
  timestamp: string;
}

export interface TradingPair {
  label: string;
  value: string;
}