import * as z from "zod";

const closedStatuses = ["Win", "Loss", "Breakeven"] as const;

export const tradeFormSchema = z
  .object({
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
    isNewsDay: z.boolean().default(false),
    newsEvent: z.string().optional(),
    tradeDate: z.string().optional(),
    status: z.enum(["Open", "Win", "Loss", "Breakeven", "Missed"]).optional(),
    exitPrice: z.number().positive().optional(),
    rrRealized: z.number().optional(),
  })
  .refine((data) => {
    if (data.direction === "Long") return data.stopLoss < data.entryPrice;
    return data.stopLoss > data.entryPrice;
  }, { message: "Stop Loss must be below Entry", path: ["stopLoss"] })
  .refine((data) => {
    if (data.direction === "Long") return data.takeProfit > data.entryPrice;
    return data.takeProfit < data.entryPrice;
  }, { message: "Take Profit must be above Entry", path: ["takeProfit"] })
  .refine(
    (data) => {
      const isClosed = data.status && closedStatuses.includes(data.status as (typeof closedStatuses)[number]);
      if (!isClosed) return true;
      return data.exitPrice != null && data.exitPrice > 0;
    },
    { message: "Exit price is required for closed trades", path: ["exitPrice"] }
  )
  .refine(
    (data) => {
      const isClosed = data.status && closedStatuses.includes(data.status as (typeof closedStatuses)[number]);
      if (!isClosed) return true;
      return !!data.tradeDate?.trim();
    },
    { message: "Trade date is required for past trades", path: ["tradeDate"] }
  );

export type TradeFormValues = z.output<typeof tradeFormSchema>;
