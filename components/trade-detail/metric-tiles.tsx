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
            className="w-20 text-sm font-medium mono-data text-danger/80 bg-muted/30 border border-border/50 rounded px-2 py-1 outline-none focus:border-primary-accent"
          />
          <Sep />
          <span className="text-muted-foreground text-xs shrink-0">TP</span>
          <input
            type="number"
            step="any"
            value={tpStr}
            onChange={(e) => setTpStr(e.target.value)}
            onBlur={flushNumbers}
            className="w-20 text-sm font-medium mono-data text-success/80 bg-muted/30 border border-border/50 rounded px-2 py-1 outline-none focus:border-primary-accent"
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
              trade.rrPredicted >= 2 ? "text-success/80" : "text-warning/80"
            )}
          >
            {formatNumber(trade.rrPredicted, 2)}R
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Execution</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <dt className="text-xs text-muted-foreground/80 shrink-0">Entry</dt>
        <dd className="text-sm font-medium mono-data tabular-nums text-right">{formatNumber(trade.entryPrice, 4)}</dd>
        <dt className="text-xs text-muted-foreground/80 shrink-0">SL</dt>
        <dd className="text-sm font-medium mono-data tabular-nums text-right text-danger/80">
          {trade.stopLoss != null ? formatNumber(trade.stopLoss, 4) : "—"}
        </dd>
        <dt className="text-xs text-muted-foreground/80 shrink-0">TP</dt>
        <dd className="text-sm font-medium mono-data tabular-nums text-right text-success/80">
          {trade.takeProfit != null ? formatNumber(trade.takeProfit, 4) : "—"}
        </dd>
        <dt className="text-xs text-muted-foreground/80 shrink-0">Risk</dt>
        <dd className="text-sm font-medium mono-data tabular-nums text-right">{trade.riskPercent ?? 1}%</dd>
        <dt className="text-xs text-muted-foreground/80 shrink-0">Target</dt>
        <dd
          className={cn(
            "text-sm font-medium mono-data tabular-nums text-right",
            trade.rrPredicted >= 2 ? "text-success/80" : "text-warning/80"
          )}
        >
          {formatNumber(trade.rrPredicted, 2)}R
        </dd>
      </dl>
    </div>
  );
}
