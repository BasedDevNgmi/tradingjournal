import { TradeDirection } from "@/types";

export type QualityLevel = 1 | 2 | 3;

/** Confluence count → tier: 7+ = 3, 6 = 2, else 1. */
export function getQualityLevel(confluences: unknown[] | undefined): QualityLevel {
  const count = confluences?.length ?? 0;
  return count >= 7 ? 3 : count === 6 ? 2 : 1;
}

export interface QualityLevelStyle {
  colorClass: string;
  label: string;
  /** For form display: "A+ Setup", etc. */
  formLabel: string;
  bgColor: string;
  /** For form: "1% Risk", "0.5% Risk", "No Trade" */
  riskLabel: string;
}

export function getQualityLevelStyle(level: QualityLevel): QualityLevelStyle {
  switch (level) {
    case 3:
      return {
        colorClass: "text-success",
        label: `Level ${level} setup`,
        formLabel: "A+ Setup",
        bgColor: "bg-success/10",
        riskLabel: "1% Risk",
      };
    case 2:
      return {
        colorClass: "text-warning",
        label: `Level ${level} setup`,
        formLabel: "B Setup",
        bgColor: "bg-warning/10",
        riskLabel: "0.5% Risk",
      };
    default:
      return {
        colorClass: "text-danger",
        label: `Level ${level} setup`,
        formLabel: "C Setup",
        bgColor: "bg-danger/10",
        riskLabel: "No Trade",
      };
  }
}

/** Returns quality level as string "1" | "2" | "3" for filter comparison. */
export function getQualityLevelString(confluences: unknown[] | undefined): string {
  return String(getQualityLevel(confluences));
}

/** True if confluence count is below 5 (leak setup in analytics). */
export function isLeakSetup(confluences: unknown[] | undefined): boolean {
  return (confluences?.length ?? 0) < 5;
}

export function calculateRR(params: {
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  direction: TradeDirection;
}) {
  const { entryPrice, stopLoss, takeProfit, direction } = params;

  if (!entryPrice || !stopLoss || !takeProfit) return 0;

  let rr = 0;
  if (direction === "Long") {
    const risk = entryPrice - stopLoss;
    const reward = takeProfit - entryPrice;
    if (risk > 0) rr = reward / risk;
  } else {
    const risk = stopLoss - entryPrice;
    const reward = entryPrice - takeProfit;
    if (risk > 0) rr = reward / risk;
  }

  return rr > 0 ? parseFloat(rr.toFixed(2)) : 0;
}

export function calculateRealizedRR(params: {
  entryPrice: number;
  stopLoss: number;
  exitPrice: number;
  direction: TradeDirection;
}) {
  const { entryPrice, stopLoss, exitPrice, direction } = params;

  if (!entryPrice || !stopLoss || !exitPrice) return 0;

  let rr = 0;
  if (direction === "Long") {
    const risk = entryPrice - stopLoss;
    const reward = exitPrice - entryPrice;
    if (risk > 0) rr = reward / risk;
  } else {
    const risk = stopLoss - entryPrice;
    const reward = entryPrice - exitPrice;
    if (risk > 0) rr = reward / risk;
  }

  return parseFloat(rr.toFixed(2));
}
