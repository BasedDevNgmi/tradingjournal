import * as z from "zod";

export const tradeFormSchema = z.object({
  pair: z.string().min(1, "Pair is required"),
  direction: z.enum(["Long", "Short"]),
  entryPrice: z.number().positive("Entry must be positive"),
  stopLoss: z.number().positive("SL must be positive"),
  takeProfit: z.number().positive("TP must be positive"),
  confluences: z.array(z.string()).default([]),
  notes: z.string().optional(),
  lessonLearned: z.string().optional(),
  beforeScreenshotUrl: z.string().optional(),
  afterScreenshotUrl: z.string().optional(),
  psychoTags: z.array(z.string()).default([]),
  pnlAmount: z.number().optional(),
  currency: z.string().default("USD"),
  isMissed: z.boolean().default(false),
  riskPercent: z.number().min(0).max(100).default(1),
  session: z.enum(["Asia", "London", "New York"]).optional(),
}).refine((data) => {
  if (data.direction === "Long") return data.stopLoss < data.entryPrice;
  return data.stopLoss > data.entryPrice;
}, {
  message: "Stop Loss must be below Entry",
  path: ["stopLoss"],
}).refine((data) => {
  if (data.direction === "Long") return data.takeProfit > data.entryPrice;
  return data.takeProfit < data.entryPrice;
}, {
  message: "Take Profit must be above Entry",
  path: ["takeProfit"],
});

export type TradeFormValues = z.output<typeof tradeFormSchema>;
