export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'Open' | 'Win' | 'Loss' | 'Breakeven';

export interface Trade {
  id: string;
  pair: string;
  direction: TradeDirection;
  status: TradeStatus;
  date: string; // ISO format
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number;
  rrPredicted: number;
  rrRealized?: number;
  setupType: string;
  confluences: string[];
  notes?: string;
  tags: string[];
  screenshotUrl?: string;
  psychoTags?: string[];
}
