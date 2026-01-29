"use client";

import { Trade } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { getQualityLevel, getQualityLevelStyle } from "@/lib/trade-utils";
import { Check, X } from "lucide-react";

interface ReturnCalloutProps {
  trade: Trade;
}

export function ReturnCallout({ trade }: ReturnCalloutProps) {
  const isClosed = trade.status !== "Open" && trade.status !== "Missed";
  const rr = isClosed ? (trade.rrRealized ?? 0) : trade.rrPredicted;
  const rrLabel = isClosed ? "Realized" : "Target";
  const rrPositive = rr > 0;
  const rrNegative = rr < 0;
  const confluenceCount = trade.confluences?.length ?? 0;
  const qualityLevel = getQualityLevel(trade.confluences);
  const { formLabel } = getQualityLevelStyle(qualityLevel);
  const setupSummary = confluenceCount > 0 ? `${formLabel} · ${confluenceCount} confluences` : null;

  const pnlSym = (trade.pnlAmount ?? 0) >= 0 ? "+" : "";
  const pnlFormatted =
    trade.pnlAmount != null && trade.currency
      ? trade.currency === "USD"
        ? `${pnlSym}$${formatNumber(Math.abs(trade.pnlAmount), 0)}`
        : `${pnlSym}${formatNumber(trade.pnlAmount, 0)} ${trade.currency}`
      : null;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-4 md:p-5",
        rrPositive && "bg-emerald-500/5 border-emerald-500/20",
        rrNegative && "bg-rose-500/5 border-rose-500/20",
        !rrPositive && !rrNegative && "bg-muted/10 border-border/40"
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {rrLabel}
          </span>
          <span
            className={cn(
              "text-2xl md:text-3xl font-bold tracking-tight mono-data tabular-nums",
              rrPositive && "text-emerald-600 dark:text-emerald-400",
              rrNegative && "text-rose-600 dark:text-rose-400",
              !rrPositive && !rrNegative && "text-foreground"
            )}
          >
            {isClosed
              ? `${rr > 0 ? "+" : ""}${formatNumber(rr, 2)}R`
              : `${formatNumber(rr, 2)}R`}
          </span>
          {setupSummary && (
            <span className="text-xs font-medium text-muted-foreground/80 mt-1">{setupSummary}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {pnlFormatted && (
            <span
              className={cn(
                "font-semibold mono-data tabular-nums",
                (trade.pnlAmount ?? 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {pnlFormatted}
            </span>
          )}
          <span className="text-muted-foreground/70 mono-data">
            Risk {trade.riskPercent ?? 1}%
          </span>
          {trade.followedPlan != null && (
            <span
              className="flex items-center gap-1.5 text-muted-foreground/80"
              title={trade.followedPlan ? "Followed plan" : "Did not follow plan"}
            >
              {trade.followedPlan ? (
                <Check size={14} className="text-emerald-500 shrink-0" />
              ) : (
                <X size={14} className="text-rose-500 shrink-0" />
              )}
              <span className="text-xs font-medium">Plan</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
