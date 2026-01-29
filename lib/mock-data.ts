import { Trade } from "@/types";
import { AOC_CONFLUENCES, PSYCHO_TAGS, TRADING_PAIRS } from "@/lib/constants";
import { calculateRR } from "@/lib/trade-utils";

const SESSIONS = ["Asia", "London", "New York"] as const;
export const NEWS_EVENTS = ["CPI", "FOMC Statement", "NFP", "PPI", "Retail Sales", "GDP", "Unemployment Rate", "ISM Manufacturing PMI"];

const NOTES_BY_EVENT: Record<string, Array<{ notes: string; lessons: string }>> = {
  CPI: [
    { notes: "Waited for initial CPI print spike then entered on pullback.", lessons: "CPI volatility is predictable in the first 15 min; avoid the first candle." },
    { notes: "Entered before release; stopped out on the number.", lessons: "Never hold through CPI—flat or wait for reaction." },
    { notes: "Took the break of the first range after CPI settled.", lessons: "Post-CPI range often sets the session direction." },
  ],
  "FOMC Statement": [
    { notes: "FOMC day—high volatility; reduced size and held to target.", lessons: "Size down on FOMC; plan the level before the event." },
    { notes: "Entered on the first pullback after the initial FOMC move.", lessons: "FOMC first move often gets faded; wait for structure." },
    { notes: "Skipped the chop, took the clean break 30 min after.", lessons: "Post-FOMC direction often clears after the first 30 min." },
  ],
  NFP: [
    { notes: "NFP beat—dollar spiked; went long EUR on the retrace.", lessons: "NFP surprise gets faded often; wait for the first reversal." },
    { notes: "Stayed flat through NFP, traded the London open after.", lessons: "Best NFP trade is sometimes no trade until the dust settles." },
    { notes: "Took the breakout of the NFP range after 20 min.", lessons: "NFP range expansion often continues in one direction." },
  ],
  PPI: [
    { notes: "PPI in line—small move; took the range break.", lessons: "PPI can be a non-event; treat like a normal session if in line." },
    { notes: "PPI miss; entered with the trend after the first candle.", lessons: "PPI surprises can set the tone for the day." },
  ],
  "Retail Sales": [
    { notes: "Retail sales strong—dollar bid; shorted EUR on the bounce.", lessons: "Retail Sales often reinforces or reverses the prior trend." },
    { notes: "Waited for the first 5 min spike to settle then entered.", lessons: "Retail Sales first move is often overdone." },
  ],
  GDP: [
    { notes: "GDP revision—entered on the second leg after the initial move.", lessons: "GDP revisions can cause two-legged moves; wait for the second." },
    { notes: "GDP day; reduced size and used wider stop.", lessons: "GDP days need wider stops; plan for whipsaw." },
  ],
  "Unemployment Rate": [
    { notes: "Unemployment down—risk-on; went long indices on the dip.", lessons: "Jobs number drives risk sentiment; align with the surprise." },
    { notes: "Stayed flat through the number, traded the trend after.", lessons: "Unemployment can whipsaw; sometimes better to wait." },
  ],
  "ISM Manufacturing PMI": [
    { notes: "ISM beat—dollar rallied; entered on the first pullback.", lessons: "ISM is a leading indicator; first reaction often holds." },
    { notes: "ISM miss; waited for the reversal and went with the trend.", lessons: "ISM surprises can reverse quickly; wait for confirmation." },
  ],
};

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

      const newsEvent = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
      const isNewsDay = true;
      const eventNotes = NOTES_BY_EVENT[newsEvent];
      const noteEntry =
        eventNotes && eventNotes.length > 0
          ? eventNotes[Math.floor(Math.random() * eventNotes.length)]
          : null;

      const notes =
        status !== "Open" && status !== "Missed" && noteEntry
          ? noteEntry.notes
          : undefined;
      const lessonLearned =
        status !== "Open" && status !== "Missed" && noteEntry
          ? noteEntry.lessons
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
        isNewsDay,
        newsEvent,
        followedPlan,
        feeling,
      });
    }
  }

  return trades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const MOCK_TRADES: Trade[] = generateMockTrades();
