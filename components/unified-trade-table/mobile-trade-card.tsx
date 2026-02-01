"use client";

import * as React from "react";
import { Trade } from "@/types";
import { cn, formatNumber, formatTradeTime } from "@/lib/utils";
import { getQualityLevel } from "@/lib/trade-utils";
import { Check, X } from "lucide-react";

interface MobileTradeCardProps {
  trade: Trade;
  handleRowClick: (trade: Trade) => void;
}

function MobileTradeCardInner({ trade, handleRowClick }: MobileTradeCardProps) {
  const qualityLevel = getQualityLevel(trade.confluences);
  const entryTime = formatTradeTime(trade.date, trade.session ?? null);
  const rrValue = trade.status === "Open" ? trade.rrPredicted : (trade.rrRealized ?? 0);
  const rrDisplay = trade.status === "Open"
    ? formatNumber(trade.rrPredicted, 2)
    : `${rrValue > 0 ? "+" : ""}${formatNumber(rrValue, 2)}`;
  const pnlSym = (trade.pnlAmount ?? 0) >= 0 ? "+" : "";
  const pnlFormatted = trade.pnlAmount != null && trade.currency
    ? trade.currency === "USD"
      ? `${pnlSym}$${formatNumber(Math.abs(trade.pnlAmount), 0)}`
      : `${pnlSym}${formatNumber(trade.pnlAmount, 0)} ${trade.currency}`
    : null;

  return (
    <div className="px-3 pb-2">
      <div 
        onClick={() => handleRowClick(trade)} 
        className="bg-card border border-border rounded-lg p-3 hover:bg-muted/30 active:scale-[0.99] transition-all duration-150 cursor-pointer"
      >
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn("w-1 h-6 rounded-full shrink-0", trade.direction === "Long" ? "bg-success" : "bg-danger")} />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate leading-tight">{trade.pair}</p>
              <p className="text-[11px] font-medium text-muted-foreground truncate leading-tight">
                {[
                  trade.session,
                  trade.isNewsDay === true
                    ? (trade.newsEvent || "News")
                    : "No news",
                  entryTime,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0 shrink-0">
            <p className={cn(
              "text-sm font-semibold mono-data leading-tight",
              (trade.rrRealized ?? trade.rrPredicted ?? 0) > 0 ? "text-success" : (trade.rrRealized ?? 0) < 0 ? "text-danger" : "text-foreground"
            )}>
              {rrDisplay}R
            </p>
            <span className={cn("text-[11px] font-medium shrink-0 leading-tight", trade.status === "Win" ? "text-success" : trade.status === "Loss" ? "text-danger" : "text-muted-foreground")}>
              {trade.status}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30 gap-2">
          <span className="text-[11px] font-medium text-muted-foreground">
            Tier {qualityLevel}
          </span>
          {pnlFormatted && (
            <span className={cn(
              "text-[11px] font-medium mono-data",
              (trade.pnlAmount ?? 0) >= 0 ? "text-success" : "text-danger"
            )}>
              {pnlFormatted}
            </span>
          )}
          {trade.followedPlan != null && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground/70" title={trade.followedPlan ? "Followed plan" : "Did not follow plan"}>
              {trade.followedPlan ? <Check size={10} className="text-success shrink-0" /> : <X size={10} className="text-danger shrink-0" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export const MobileTradeCard = React.memo(MobileTradeCardInner);
