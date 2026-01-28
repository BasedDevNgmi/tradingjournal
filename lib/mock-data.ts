import { Trade } from "@/types";
import { AOC_CONFLUENCES, PSYCHO_TAGS, TRADING_PAIRS } from "@/lib/constants";
import { calculateRR } from "@/lib/trade-utils";

const SESSIONS = ["Asia", "London", "New York"] as const;

function generateMockTrades(): Trade[] {
  const trades: Trade[] = [];
  const start = new Date("2025-10-01");
  const end = new Date("2026-01-31");
  let id = 1;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 0 || day === 6) continue;

    const numTrades = Math.random() > 0.85 ? 2 : 1;
    for (let i = 0; i < numTrades; i++) {
      const pair = TRADING_PAIRS[Math.floor(Math.random() * TRADING_PAIRS.length)];
      const direction = Math.random() > 0.5 ? ("Long" as const) : ("Short" as const);
      const session = SESSIONS[Math.floor(Math.random() * SESSIONS.length)];

      let entryPrice: number;
      if (pair === "BTC/USDT") entryPrice = 30000 + Math.random() * 20000;
      else if (pair === "ETH/USDT") entryPrice = 1800 + Math.random() * 1000;
      else entryPrice = 40 + Math.random() * 80;

      const riskPercent = 1;
      const pctSl = direction === "Long" ? -0.02 : 0.02;
      const pctTp = direction === "Long" ? 0.02 : -0.02;
      const stopLoss = entryPrice * (1 + pctSl);
      const takeProfit = entryPrice * (1 + pctTp * (2 + Math.random() * 2));

      const rrPredicted = calculateRR({
        entryPrice,
        stopLoss,
        takeProfit,
        direction,
      });

      const rand = Math.random();
      let status: Trade["status"] = "Open";
      if (rand > 0.7) status = "Win";
      else if (rand > 0.5) status = "Loss";
      else if (rand > 0.88) status = "Missed";
      else if (rand > 0.92) status = "Breakeven";

      const hour =
        session === "London" ? 8 + Math.floor(Math.random() * 4)
        : session === "New York" ? 13 + Math.floor(Math.random() * 4)
        : 1 + Math.floor(Math.random() * 4);
      const date = new Date(d);
      date.setHours(hour, Math.floor(Math.random() * 60));

      const numConf =
        status === "Win" ? 5 + Math.floor(Math.random() * 4)
        : 2 + Math.floor(Math.random() * 5);
      const confluences = [...AOC_CONFLUENCES]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numConf, AOC_CONFLUENCES.length));

      const psychoTags = [...PSYCHO_TAGS].filter(() => Math.random() > 0.75);
      if (psychoTags.length === 0 && (status === "Win" || status === "Loss")) {
        psychoTags.push(status === "Win" ? "Disciplined" : "Disciplined");
      }

      const notes =
        status === "Win"
          ? "Followed plan, held to target."
          : status === "Loss"
            ? "Stopped out; level didn’t hold."
            : undefined;
      const lessonLearned =
        status === "Win"
          ? "Sticking to the plan pays off."
          : status === "Loss"
            ? "Revenge traded; need to wait for setup."
            : undefined;

      let rrRealized: number | undefined;
      let exitPrice: number | undefined;
      let pnlAmount: number | undefined;
      let currency: string | undefined;
      let followedPlan: boolean | undefined;
      let feeling: string | undefined;

      if (status !== "Open" && status !== "Missed") {
        rrRealized =
          status === "Win" ? rrPredicted : status === "Loss" ? -1 : 0;
        exitPrice =
          direction === "Long"
            ? entryPrice + (entryPrice - stopLoss) * rrRealized
            : entryPrice - (stopLoss - entryPrice) * Math.abs(rrRealized);
        const notionals: Record<string, number> = {
          "BTC/USDT": 50000,
          "ETH/USDT": 10000,
          "SOL/USDT": 2000,
        };
        pnlAmount = Math.round(
          rrRealized * (riskPercent / 100) * (notionals[pair] ?? 10000) * 10
        ) / 10;
        currency = "USD";
        followedPlan = Math.random() > 0.3;
        feeling =
          status === "Win"
            ? "Calm"
            : status === "Loss"
              ? "Frustrated"
              : "Relieved";
      }

      trades.push({
        id: `trade-${id++}`,
        pair,
        direction,
        status,
        date: date.toISOString(),
        entryPrice: parseFloat(entryPrice.toFixed(2)),
        stopLoss: parseFloat(stopLoss.toFixed(4)),
        takeProfit: parseFloat(takeProfit.toFixed(4)),
        exitPrice,
        rrPredicted,
        rrRealized,
        pnlAmount,
        currency,
        confluences,
        notes,
        lessonLearned,
        tags: [],
        psychoTags: psychoTags.length ? psychoTags : undefined,
        riskPercent,
        session,
        followedPlan,
        feeling,
      });
    }
  }

  return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const MOCK_TRADES: Trade[] = generateMockTrades();
