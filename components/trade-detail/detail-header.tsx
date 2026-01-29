"use client";

import * as React from "react";
import { Check, ClipboardCopy, Copy, Edit2, MoreVertical, PenLine, Trash2, X } from "lucide-react";
import { Trade } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { getQualityLevel, getQualityLevelStyle } from "@/lib/trade-utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DetailHeaderProps {
  trade: Trade;
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onCancelEdit?: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDuplicateAndEdit?: () => void;
  onClose: () => void;
  onCopySummary?: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function DetailHeader({
  trade,
  isEditing,
  onEdit,
  onDone,
  onCancelEdit,
  onDelete,
  onDuplicate,
  onDuplicateAndEdit,
  onClose,
  onCopySummary,
  closeButtonRef,
}: DetailHeaderProps) {
  const dateFormatted = format(new Date(trade.date), "dd MMM · HH:mm");
  const isWin = trade.status === "Win";
  const isLoss = trade.status === "Loss";
  const isBE = trade.status === "Breakeven";

  const qualityLevel = getQualityLevel(trade.confluences);
  const { colorClass: qualityColor } = getQualityLevelStyle(qualityLevel);

  const isClosed = trade.status !== "Open" && trade.status !== "Missed";
  const rr = trade.rrRealized ?? 0;
  const targetR = trade.rrPredicted ?? 0;
  const riskPct = trade.riskPercent ?? 1;
  const pnlFormatted =
    trade.pnlAmount != null && trade.currency
      ? trade.currency === "USD"
        ? `${(trade.pnlAmount ?? 0) >= 0 ? "+" : ""}$${formatNumber(Math.abs(trade.pnlAmount), 0)}`
        : `${(trade.pnlAmount ?? 0) >= 0 ? "+" : ""}${formatNumber(trade.pnlAmount, 0)} ${trade.currency}`
      : null;

  return (
    <header className="shrink-0 sticky top-0 z-10 flex flex-col gap-1.5 px-4 py-3 md:px-6 border-b border-border bg-card">
      {/* Row 1: Hero (large R) | Identity (pair + direction) | Status pill | Actions */}
      <div className="flex items-center justify-between gap-4 min-w-0">
        {/* Hero: one primary number */}
        <div className="flex flex-col gap-0 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {isClosed ? "Realized R" : "Target R"}
          </span>
          <span
            className={cn(
              "text-3xl md:text-4xl font-bold tracking-tight mono-data tabular-nums leading-tight",
              isClosed
                ? rr > 0
                  ? "text-emerald-500 dark:text-emerald-400"
                  : rr < 0
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-foreground"
                : "text-foreground"
            )}
          >
            {isClosed ? `${rr > 0 ? "+" : ""}${formatNumber(rr, 2)}R` : `${formatNumber(targetR, 2)}R`}
          </span>
          {isClosed && pnlFormatted && (
            <span
              className={cn(
                "text-xs font-semibold mono-data tabular-nums",
                (trade.pnlAmount ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {pnlFormatted}
            </span>
          )}
          {!isClosed && (
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              Risk {riskPct}%
            </span>
          )}
        </div>

        {/* Identity + status */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 justify-end md:justify-center">
          <span className="text-lg font-semibold tracking-tight text-foreground truncate">
            {trade.pair} {trade.direction}
          </span>
          <span
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
              isWin && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
              isLoss && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
              isBE && "bg-muted text-muted-foreground border border-border",
              !isWin && !isLoss && !isBE && "bg-muted/50 text-muted-foreground border border-border/50"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                isWin ? "bg-emerald-500" : isLoss ? "bg-rose-500" : isBE ? "bg-zinc-400" : "bg-blue-500"
              )}
            />
            {trade.status}
          </span>
        </div>

        {/* Actions: de-emphasized */}
        <div className="flex shrink-0 items-center gap-1">
        {isEditing ? (
          <>
            <button
              onClick={onDone}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2"
              title="Done editing"
              aria-label="Done editing"
            >
              <Check size={16} />
            </button>
            {onCancelEdit && (
              <button
                onClick={onCancelEdit}
                className="p-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2"
                title="Cancel editing"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2"
              title="Edit trade"
              aria-label="Edit trade"
            >
              <Edit2 size={16} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2"
                  title="More actions"
                  aria-label="More actions"
                >
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy size={14} className="mr-2" />
                  Duplicate
                </DropdownMenuItem>
                {onDuplicateAndEdit && (
                  <DropdownMenuItem onClick={onDuplicateAndEdit}>
                    <PenLine size={14} className="mr-2" />
                    Duplicate and edit
                  </DropdownMenuItem>
                )}
                {onCopySummary && (
                  <DropdownMenuItem onClick={onCopySummary}>
                    <ClipboardCopy size={14} className="mr-2" />
                    Copy summary
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent/40 focus-visible:ring-offset-2"
          title="Close"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      </div>
      {/* Row 2: date · session · news · tier (open only) */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground/70 min-h-[1.25rem]">
        <span className="mono-data">{dateFormatted}</span>
        {trade.session && (
          <>
            <span className="text-muted-foreground/40" aria-hidden>·</span>
            <span>{trade.session}</span>
          </>
        )}
        {trade.isNewsDay && (
          <>
            <span className="text-muted-foreground/40" aria-hidden>·</span>
            <span className="px-1.5 py-0.5 rounded bg-muted/40 border border-border/30 text-muted-foreground/80">
              {trade.newsEvent || "News day"}
            </span>
          </>
        )}
        {!isClosed && qualityLevel > 0 && (
          <>
            <span className="text-muted-foreground/40" aria-hidden>·</span>
            <span className={cn("font-medium", qualityColor)}>Tier {qualityLevel} setup</span>
          </>
        )}
      </div>
    </header>
  );
}
