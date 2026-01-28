"use client";

import * as React from "react";
import { Trade } from "@/types";
import { cn, formatNumber } from "../../lib/utils";
import { calculateRR } from "@/lib/trade-utils";

interface MetricTilesProps {
  trade: Trade;
  isEditing?: boolean;
  onUpdate?: (partial: Partial<Trade>) => void;
}

const Sep = () => <span className="text-muted-foreground/30 px-1.5">·</span>;

export function MetricTiles({ trade, isEditing = false, onUpdate }: MetricTilesProps) {
  const [entryStr, setEntryStr] = React.useState(String(trade.entryPrice));
  const [slStr, setSlStr] = React.useState(String(trade.stopLoss ?? ""));
  const [tpStr, setTpStr] = React.useState(String(trade.takeProfit ?? ""));
  const [riskStr, setRiskStr] = React.useState(String(trade.riskPercent ?? 1));

  React.useEffect(() => {
    setEntryStr(String(trade.entryPrice));
    setSlStr(String(trade.stopLoss ?? ""));
    setTpStr(String(trade.takeProfit ?? ""));
    setRiskStr(String(trade.riskPercent ?? 1));
  }, [trade.entryPrice, trade.stopLoss, trade.takeProfit, trade.riskPercent]);

  const flushNumbers = React.useCallback(() => {
    if (!onUpdate) return;
    const entry = parseFloat(entryStr);
    const sl = parseFloat(slStr);
    const tp = parseFloat(tpStr);
    const risk = Math.min(100, Math.max(0, parseFloat(riskStr) || 1));
    if (Number.isNaN(entry) || entry <= 0) return;
    setRiskStr(String(risk));
    const rr = calculateRR({
      entryPrice: entry,
      stopLoss: Number.isNaN(sl) || sl <= 0 ? trade.stopLoss ?? entry : sl,
      takeProfit: Number.isNaN(tp) || tp <= 0 ? trade.takeProfit ?? entry : tp,
      direction: trade.direction,
    });
    onUpdate({
      entryPrice: entry,
      stopLoss: Number.isNaN(sl) || sl <= 0 ? trade.stopLoss : sl,
      takeProfit: Number.isNaN(tp) || tp <= 0 ? trade.takeProfit : tp,
      riskPercent: risk,
      rrPredicted: rr,
    });
  }, [
    onUpdate,
    entryStr,
    slStr,
    tpStr,
    riskStr,
    trade.direction,
    trade.stopLoss,
    trade.takeProfit,
  ]);

  if (isEditing && onUpdate) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="text-muted-foreground text-xs shrink-0">Entry</span>
          <input
            type="number"
            step="any"
            value={entryStr}
            onChange={(e) => setEntryStr(e.target.value)}
            onBlur={flushNumbers}
            className="w-20 text-sm font-medium mono-data bg-muted/30 border border-border/50 rounded px-2 py-1 outline-none focus:border-primary-accent"
          />
          <Sep />
          <span className="text-muted-foreground text-xs shrink-0">SL</span>
          <input
            type="number"
            step="any"
            value={slStr}
            onChange={(e) => setSlStr(e.target.value)}
            onBlur={flushNumbers}
            className="w-20 text-sm font-medium mono-data text-rose-500/80 bg-muted/30 border border-border/50 rounded px-2 py-1 outline-none focus:border-primary-accent"
          />
          <Sep />
          <span className="text-muted-foreground text-xs shrink-0">TP</span>
          <input
            type="number"
            step="any"
            value={tpStr}
            onChange={(e) => setTpStr(e.target.value)}
            onBlur={flushNumbers}
            className="w-20 text-sm font-medium mono-data text-emerald-500/80 bg-muted/30 border border-border/50 rounded px-2 py-1 outline-none focus:border-primary-accent"
          />
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="text-muted-foreground text-xs shrink-0">Risk</span>
          <input
            type="number"
            min={0}
            max={100}
            value={riskStr}
            onChange={(e) => setRiskStr(e.target.value)}
            onBlur={flushNumbers}
            className="w-14 text-sm font-medium mono-data bg-muted/30 border border-border/50 rounded px-2 py-1 outline-none focus:border-primary-accent"
          />
          <span className="text-muted-foreground/60 text-xs">%</span>
          <Sep />
          <span className="text-muted-foreground text-xs shrink-0">Target</span>
          <span
            className={cn(
              "text-sm font-medium mono-data",
              trade.rrPredicted >= 2 ? "text-emerald-500/80" : "text-orange-500/80"
            )}
          >
            {formatNumber(trade.rrPredicted, 2)}R
          </span>
        </div>
      </div>
    );
  }

  const isClosed = trade.status !== "Open" && trade.status !== "Missed";
  const rr = trade.rrRealized ?? 0;
  const pnlFormatted =
    trade.pnlAmount != null && trade.currency
      ? trade.currency === "USD"
        ? `${(trade.pnlAmount ?? 0) >= 0 ? "+" : ""}$${formatNumber(Math.abs(trade.pnlAmount), 0)}`
        : `${(trade.pnlAmount ?? 0) >= 0 ? "+" : ""}${formatNumber(trade.pnlAmount, 0)} ${trade.currency}`
      : null;

  return (
    <div className="space-y-2">
      {isClosed && (
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm pb-1.5 border-b border-border/30">
          <span className="text-muted-foreground/70 text-xs">Outcome</span>
          <span
            className={cn(
              "font-semibold mono-data",
              rr > 0 ? "text-emerald-600 dark:text-emerald-400" : rr < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
            )}
          >
            {rr > 0 ? "+" : ""}
            {formatNumber(rr, 2)}R
          </span>
          {pnlFormatted && (
            <>
              <Sep />
              <span
                className={cn(
                  "font-semibold mono-data",
                  (trade.pnlAmount ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {pnlFormatted}
              </span>
            </>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
        <span className="text-muted-foreground/70 text-xs">Entry</span>
        <span className="font-medium mono-data">{formatNumber(trade.entryPrice, 4)}</span>
        <Sep />
        <span className="text-muted-foreground/70 text-xs">SL</span>
        <span className="font-medium mono-data text-rose-500/80">
          {trade.stopLoss != null ? formatNumber(trade.stopLoss, 4) : "—"}
        </span>
        <Sep />
        <span className="text-muted-foreground/70 text-xs">TP</span>
        <span className="font-medium mono-data text-emerald-500/80">
          {trade.takeProfit != null ? formatNumber(trade.takeProfit, 4) : "—"}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm">
        <span className="text-muted-foreground/70 text-xs">Risk</span>
        <span className="font-medium mono-data">{trade.riskPercent ?? 1}%</span>
        <Sep />
        <span className="text-muted-foreground/70 text-xs">Target</span>
        <span
          className={cn(
            "font-medium mono-data",
            trade.rrPredicted >= 2 ? "text-emerald-500/80" : "text-orange-500/80"
          )}
        >
          {formatNumber(trade.rrPredicted, 2)}R
        </span>
      </div>
    </div>
  );
}
