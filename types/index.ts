import * as z from "zod";

export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'Open' | 'Win' | 'Loss' | 'Breakeven' | 'Missed';

export const tradeSchema = z.object({
  id: z.string(),
  pair: z.string(),
  direction: z.enum(['Long', 'Short']),
  status: z.enum(['Open', 'Win', 'Loss', 'Breakeven', 'Missed']),
  date: z.string(),
  entryPrice: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number(),
  exitPrice: z.number().optional(),
  rrPredicted: z.number(),
  rrRealized: z.number().optional(),
  pnlAmount: z.number().optional(),
  currency: z.string().optional(),
  confluences: z.array(z.string()),
  notes: z.string().optional(),
  lessonLearned: z.string().optional(),
  tags: z.array(z.string()),
  beforeScreenshotUrl: z.string().optional(),
  afterScreenshotUrl: z.string().optional(),
  psychoTags: z.array(z.string()).optional(),
  followedPlan: z.boolean().optional(),
  feeling: z.string().optional(),
  riskPercent: z.number().optional(),
  session: z.enum(['Asia', 'London', 'New York']).optional(),
});

export type Trade = z.infer<typeof tradeSchema>;

export type TabType = 'journal' | 'analytics' | 'missed';
export type FilterType = 'All' | 'Win' | 'Loss' | 'Open' | 'Breakeven' | 'Missed';
