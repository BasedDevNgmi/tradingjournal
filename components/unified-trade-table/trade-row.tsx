"use client";

import * as React from "react";
import { Trade } from "@/types";
import { cn, formatNumber, formatTradeTime } from "@/lib/utils";
import { getQualityLevel, getQualityLevelStyle } from "@/lib/trade-utils";
import { Check, X } from "lucide-react";

interface TradeRowProps {
  trade: Trade;
  handleRowClick: (trade: Trade) => void;
  isGhostMode: boolean;
}

function TradeRowInner({ 
  trade, 
  handleRowClick, 
  isGhostMode 
}: TradeRowProps) {
  const isWin = trade.status === "Win";
  const isLoss = trade.status === "Loss";
  const isBE = trade.status === "Breakeven";
  const qualityLevel = getQualityLevel(trade.confluences);
  const { colorClass: qualityColor } = getQualityLevelStyle(qualityLevel);
  const primaryTag = trade.psychoTags?.[0];
  const entryTime = formatTradeTime(trade.date, trade.session ?? null);
  const pnlSym = (trade.pnlAmount ?? 0) >= 0 ? "+" : "";
  const pnlFormatted = trade.pnlAmount != null && trade.currency
    ? trade.currency === "USD"
      ? `${pnlSym}$${formatNumber(Math.abs(trade.pnlAmount), 0)}`
      : `${pnlSym}${formatNumber(trade.pnlAmount, 0)} ${trade.currency}`
    : null;

  return (
    <>
      <td className="pl-6 pr-4 align-middle border-b border-border/[0.03] group-hover:bg-muted/15 transition-colors duration-150 py-3.5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-1 h-8 rounded-full shrink-0",
            isWin ? "bg-success" : 
            isLoss ? "bg-danger" : 
            isBE ? "bg-zinc-400" : "bg-primary-accent"
          )} />
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight truncate leading-none text-sm">
                {trade.pair}
              </span>
              <span className="text-xs font-medium text-muted-foreground/70 shrink-0">{entryTime}</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground/70 truncate">
              {trade.session || "Session"}
              {trade.isNewsDay === true
                ? ` · ${trade.newsEvent || "News"}`
                : " · No news"}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 align-middle border-b border-border/[0.03] group-hover:bg-muted/15 transition-colors duration-150 py-3.5">
        <div className={cn(
          "inline-flex px-2 py-0.5 rounded-md text-xs font-medium border",
          trade.direction === "Long" ? "bg-success/5 border-success/20 text-success" : "bg-danger/5 border-danger/20 text-danger"
        )}>
          {trade.direction}
        </div>
      </td>
      <td className="px-4 align-middle border-b border-border/[0.03] group-hover:bg-muted/15 transition-colors duration-150 py-3.5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-medium border border-border/40 bg-muted/30",
            qualityColor
          )}>
            Tier {qualityLevel} setup
          </div>
          {primaryTag && (
            <span className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-lg border border-border/40 bg-muted/30",
              primaryTag === 'Disciplined' ? "text-success" : 
              ['FOMO', 'Revenge Trade', 'Chasing'].includes(primaryTag) ? "text-danger" : "text-primary-accent"
            )}>
              {primaryTag}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 align-middle border-b border-border/5 text-center group-hover:bg-muted/15 transition-colors duration-150 py-3.5">
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium",
            isWin ? "bg-success/10 text-success border border-success/20" : 
            isLoss ? "bg-danger/10 text-danger border border-danger/20" : 
            isBE ? "bg-muted/30 text-muted-foreground border border-border/50" : 
            "bg-primary-accent/10 text-primary-accent border border-primary-accent/20"
          )}>
            {trade.status}
          </div>
        </div>
      </td>
      <td className="pl-4 pr-10 align-middle text-right border-b border-border/5 group-hover:bg-muted/15 transition-colors duration-150 py-3.5">
        <div className="flex flex-col items-end gap-0.5">
          <span className={cn(
            "font-semibold tracking-tight leading-none mono-data text-base",
            (trade.rrRealized || 0) > 0 ? "text-success" : (trade.rrRealized || 0) < 0 ? "text-danger" : "text-foreground",
            isGhostMode && "blur-lg select-none"
          )}>
            {trade.status === 'Open' ? formatNumber(trade.rrPredicted, 2) : `${(trade.rrRealized || 0) > 0 ? '+' : ''}${formatNumber(trade.rrRealized || 0, 2)}`}
            <span className="text-xs ml-0.5 opacity-60">R</span>
          </span>
          <div className="flex items-center gap-1.5 justify-end flex-wrap">
            {pnlFormatted && (
              <span className={cn(
                "text-xs font-medium mono-data",
                (trade.pnlAmount ?? 0) >= 0 ? "text-success" : "text-danger",
                isGhostMode && "blur-lg select-none"
              )}>
                {pnlFormatted}
              </span>
            )}
            {trade.followedPlan != null && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground/70" title={trade.followedPlan ? "Followed plan" : "Did not follow plan"}>
                {trade.followedPlan ? <Check size={10} className="text-success" /> : <X size={10} className="text-danger" />}
                <span>Plan</span>
              </span>
            )}
            <span className="text-xs font-medium text-muted-foreground/70 mono-data">Risk {trade.riskPercent || 1}%</span>
          </div>
        </div>
      </td>
    </>
  );
}

export const TradeRow = React.memo(TradeRowInner);
