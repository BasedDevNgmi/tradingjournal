"use client";

import { Check, Copy, Edit2, Trash2, X } from "lucide-react";
import { Trade } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { getQualityLevel, getQualityLevelStyle } from "@/lib/trade-utils";
import { format } from "date-fns";

interface DetailHeaderProps {
  trade: Trade;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}

export function DetailHeader({
  trade,
  isEditing,
  onEdit,
  onDone,
  onDelete,
  onDuplicate,
  onClose,
}: DetailHeaderProps) {
  const dateFormatted = format(new Date(trade.date), "dd MMM · HH:mm");
  const isWin = trade.status === "Win";
  const isLoss = trade.status === "Loss";
  const isBE = trade.status === "Breakeven";

  const qualityLevel = getQualityLevel(trade.confluences);
  const { colorClass: qualityColor, bgColor: qualityBg } = getQualityLevelStyle(qualityLevel);

  const isClosed = trade.status !== "Open" && trade.status !== "Missed";
  const rr = trade.rrRealized ?? 0;
  const pnlFormatted =
    trade.pnlAmount != null && trade.currency
      ? trade.currency === "USD"
        ? `${(trade.pnlAmount ?? 0) >= 0 ? "+" : ""}$${formatNumber(Math.abs(trade.pnlAmount), 0)}`
        : `${(trade.pnlAmount ?? 0) >= 0 ? "+" : ""}${formatNumber(trade.pnlAmount, 0)} ${trade.currency}`
      : null;

  return (
    <header className="shrink-0 sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-3 md:px-6 border-b border-border bg-card">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-lg md:text-xl font-semibold tracking-tight text-foreground truncate">
          {trade.pair}
        </span>
        <span
          className={cn(
            "shrink-0 px-2 py-0.5 rounded text-xs font-medium border border-border/50 bg-muted/30",
            trade.direction === "Long" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}
        >
          {trade.direction}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground/80 text-xs shrink-0">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isWin ? "bg-emerald-500" : isLoss ? "bg-rose-500" : isBE ? "bg-zinc-400" : "bg-blue-500"
            )}
          />
          {trade.status}
        </span>
        <span className="text-xs text-muted-foreground/60 mono-data shrink-0">{dateFormatted}</span>
        {trade.session && (
          <span className="text-xs text-muted-foreground/60 shrink-0">{trade.session}</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isClosed ? (
          <div className="flex flex-col items-end gap-0">
            <p
              className={cn(
                "text-lg font-bold tracking-tight mono-data tabular-nums",
                rr > 0 ? "text-emerald-500 dark:text-emerald-400" : rr < 0 ? "text-rose-500 dark:text-rose-400" : "text-foreground"
              )}
            >
              {rr > 0 ? "+" : ""}
              {formatNumber(rr, 2)}R
            </p>
            {pnlFormatted && (
              <p
                className={cn(
                  "text-xs font-semibold mono-data tabular-nums",
                  (trade.pnlAmount ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {pnlFormatted}
              </p>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex px-2.5 py-1 rounded-lg border border-border/50 items-center gap-1",
              qualityBg
            )}
          >
            <span className={cn("text-xs font-semibold", qualityColor)}>Level {qualityLevel} setup</span>
          </div>
        )}

        {isEditing ? (
          <button
            onClick={onDone}
            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors border border-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            title="Done editing"
          >
            <Check size={16} />
          </button>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              title="Edit trade"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              title="Duplicate as new trade"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors border border-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              title="Delete trade"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
}
