"use client";

import * as React from "react";
import { Trade } from "@/types";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { modalContentClass } from "@/components/ui/modal-shell";
import { ModalShell } from "@/components/ui/modal-shell";
import { cn, formatTradeDate, formatNumber, getRRColor } from "@/lib/utils";
import { FileText, Lightbulb, BarChart3, Target, Brain } from "lucide-react";

interface NewsEventDetailModalProps {
  eventName: string;
  trades: Trade[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsEventDetailModal({
  eventName,
  trades,
  open,
  onOpenChange,
}: NewsEventDetailModalProps) {
  const stats = React.useMemo(() => {
    const wins = trades.filter((t) => t.status === "Win").length;
    const totalR = trades.reduce((acc, t) => acc + (t.rrRealized ?? 0), 0);
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    return { totalR, count: trades.length, wins, winRate };
  }, [trades]);

  const insights = React.useMemo(() => {
    const pairs: Record<string, number> = {};
    let followedPlan = 0;
    const psychoTags: Record<string, number> = {};
    const lessons: string[] = [];
    trades.forEach((t) => {
      if (t.pair) {
        pairs[t.pair] = (pairs[t.pair] ?? 0) + 1;
      }
      if (t.followedPlan === true) followedPlan++;
      (t.psychoTags ?? []).forEach((tag) => {
        psychoTags[tag] = (psychoTags[tag] ?? 0) + 1;
      });
      if (t.lessonLearned?.trim()) lessons.push(t.lessonLearned.trim());
    });
    const topPairs = Object.entries(pairs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    const planPct =
      trades.length > 0 ? (followedPlan / trades.length) * 100 : 0;
    const topPsycho = Object.entries(psychoTags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    return {
      topPairs,
      planPct,
      followedPlan,
      topPsycho,
      lessons: [...new Set(lessons)],
    };
  }, [trades]);

  const sortedTrades = React.useMemo(
    () =>
      [...trades].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [trades]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(modalContentClass.detail, "max-w-2xl")}
        aria-describedby={undefined}
      >
        <ModalShell
          title={eventName}
          onClose={() => onOpenChange(false)}
          bodyClassName="px-6 pb-6"
        >
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/20 p-4 border border-border/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total R
                </span>
                <p
                  className={cn(
                    "text-xl font-semibold tabular-nums mt-1",
                    getRRColor(stats.totalR)
                  )}
                >
                  {stats.totalR >= 0 ? "+" : ""}
                  {formatNumber(stats.totalR)}R
                </p>
              </div>
              <div className="rounded-xl bg-muted/20 p-4 border border-border/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trades
                </span>
                <p className="text-xl font-semibold tabular-nums mt-1 text-foreground">
                  {stats.count}
                </p>
              </div>
              <div className="rounded-xl bg-muted/20 p-4 border border-border/30">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Win rate
                </span>
                <p className="text-xl font-semibold tabular-nums mt-1 text-foreground">
                  {formatNumber(stats.winRate, 0)}%
                </p>
              </div>
            </div>

            {/* Insights */}
            {(insights.topPairs.length > 0 ||
              insights.topPsycho.length > 0 ||
              insights.lessons.length > 0) && (
              <section>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BarChart3 size={14} />
                  Insights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {insights.topPairs.length > 0 && (
                    <div className="rounded-xl border border-border/30 bg-card/40 p-4">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Pairs traded
                      </span>
                      <ul className="mt-2 space-y-1 text-sm">
                        {insights.topPairs.map(({ name, count }) => (
                          <li
                            key={name}
                            className="flex justify-between gap-2"
                          >
                            <span className="font-medium">{name}</span>
                            <span className="text-muted-foreground tabular-nums">
                              {count} trade{count !== 1 ? "s" : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insights.topPsycho.length > 0 && (
                    <div className="rounded-xl border border-border/30 bg-card/40 p-4">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Brain size={12} />
                        Psychology
                      </span>
                      <ul className="mt-2 space-y-1 text-sm">
                        {insights.topPsycho.map(({ name, count }) => (
                          <li
                            key={name}
                            className="flex justify-between gap-2"
                          >
                            <span className="font-medium">{name}</span>
                            <span className="text-muted-foreground tabular-nums">
                              {count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {insights.lessons.length > 0 && (
                  <div className="mt-4 rounded-xl border border-primary-accent/20 bg-primary-accent/5 p-4">
                    <span className="text-xs font-medium text-primary-accent uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb size={12} />
                      Key lessons
                    </span>
                    <ul className="mt-2 space-y-2 text-sm">
                      {insights.lessons.map((lesson, i) => (
                        <li
                          key={i}
                          className="italic text-foreground/90 leading-relaxed pl-2 border-l-2 border-primary-accent/30"
                        >
                          &quot;{lesson}&quot;
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Target size={14} />
                  <span>
                    Plan followed in {formatNumber(insights.planPct, 0)}% of
                    trades ({insights.followedPlan}/{stats.count})
                  </span>
                </div>
              </section>
            )}

            {/* Trades with notes & lessons */}
            <section>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <FileText size={14} />
                Trades ({sortedTrades.length})
              </h3>
              <ul className="space-y-4">
                {sortedTrades.map((trade) => (
                  <li
                    key={trade.id}
                    className="rounded-xl border border-border/30 bg-card/40 p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {formatTradeDate(trade.date)}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {trade.pair}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            trade.direction === "Long"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {trade.direction}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            trade.status === "Win"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : trade.status === "Loss"
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-muted-foreground"
                          )}
                        >
                          {trade.status}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          getRRColor(trade.rrRealized ?? 0)
                        )}
                      >
                        {(trade.rrRealized ?? 0) >= 0 ? "+" : ""}
                        {formatNumber(trade.rrRealized ?? 0)}R
                      </span>
                    </div>
                    {(trade.notes?.trim() || trade.lessonLearned?.trim()) && (
                      <div className="space-y-2 pt-2 border-t border-border/20">
                        {trade.lessonLearned?.trim() && (
                          <div className="bg-primary-accent/5 rounded-lg p-3 border border-primary-accent/20">
                            <span className="text-xs font-medium text-primary-accent block mb-1">
                              Lesson
                            </span>
                            <p className="text-sm leading-relaxed italic text-foreground/90">
                              &quot;{trade.lessonLearned.trim()}&quot;
                            </p>
                          </div>
                        )}
                        {trade.notes?.trim() && (
                          <div className="bg-muted/20 rounded-lg p-3 border border-border/30 text-sm text-muted-foreground leading-relaxed italic">
                            &quot;{trade.notes.trim()}&quot;
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </ModalShell>
      </DialogContent>
    </Dialog>
  );
}
